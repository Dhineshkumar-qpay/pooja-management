import Products from "../models/Products.js";
import Category from "../models/Category.js";
import { saveImage, deleteImage } from "../middleware/uploadMiddleware.js";
import ProductReviews from "../models/ProductReviews.js";
import { Op } from "sequelize";

export const createProduct = async (req, res) => {
  try {
    const {
      productname,
      categoryname,
      categoryid,
      brand,
      description,
      price,
      sellingprice,
      stockquantity,
      dimensions,
      benefits,
      countryoforigin,
      isFeatured,
      isNewarrival,
    } = req.body;

    if (!productname || !categoryname || !price || !sellingprice) {
      return res.status(400).json({
        message:
          "productname, categoryname, price and sellingprice are required",
      });
    }

    const resolvedCategoryId = categoryid || null;
    if (resolvedCategoryId) {
      const categoryExists = await Category.findByPk(resolvedCategoryId);
      if (!categoryExists) {
        return res.status(404).json({ message: "category not found" });
      }
    }

    const product = await Products.create({
      productname,
      categoryname,
      categoryid: resolvedCategoryId,
      brand,
      description,
      price,
      sellingprice,
      stockquantity,
      dimensions,
      benefits,
      countryoforigin,
      isFeatured,
      isNewarrival,
    });

    try {
      if (req.files?.["thumbnailimage"]) {
        product.thumbnailimage = await saveImage(
          req.files["thumbnailimage"][0].buffer,
          "products",
          500,
          500,
        );
      }
      if (req.files?.["images"]) {
        const uploadedImages = [];
        for (const file of req.files["images"]) {
          uploadedImages.push(
            await saveImage(file.buffer, "products", 800, 800),
          );
        }
        product.images = uploadedImages;
      }
      if (req.files && Object.keys(req.files).length > 0) await product.save();
    } catch (imageError) {
      await product.destroy();
      deleteImage(product.thumbnailimage);
      if (product.images) product.images.forEach((img) => deleteImage(img));
      return res.status(500).json({
        message: "image processing failed",
        error: imageError.message,
      });
    }

    return res.status(201).json({ message: "product created successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Products.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    const fields = [
      "productname",
      "categoryname",
      "brand",
      "description",
      "price",
      "sellingprice",
      "stockquantity",
      "dimensions",
      "benefits",
      "countryoforigin",
      "isFeatured",
      "isNewarrival",
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    if (req.body.categoryid !== undefined) {
      const resolvedCategoryId = req.body.categoryid || null;
      if (resolvedCategoryId) {
        const categoryExists = await Category.findByPk(resolvedCategoryId);
        if (!categoryExists) {
          return res.status(404).json({ message: "category not found" });
        }
      }
      product.categoryid = resolvedCategoryId;
    }

    await product.save();

    try {
      if (req.files?.["thumbnailimage"]) {
        const oldThumb = product.thumbnailimage;
        product.thumbnailimage = await saveImage(
          req.files["thumbnailimage"][0].buffer,
          "products",
          500,
          500,
        );
        deleteImage(oldThumb);
      }
      if (req.files?.["images"]) {
        const oldImages = product.images;
        const newImages = [];
        for (const file of req.files["images"]) {
          newImages.push(await saveImage(file.buffer, "products", 800, 800));
        }
        product.images = newImages;
        if (oldImages) oldImages.forEach((img) => deleteImage(img));
      }
      if (req.files && Object.keys(req.files).length > 0) await product.save();
    } catch (imageError) {
      deleteImage(product.thumbnailimage);
      if (product.images) product.images.forEach((img) => deleteImage(img));
      return res.status(500).json({
        message: "image processing failed",
        error: imageError.message,
      });
    }

    return res.status(200).json({ message: "product updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Products.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    await product.destroy();
    deleteImage(product.thumbnailimage);
    if (product.images) product.images.forEach((img) => deleteImage(img));

    return res.status(200).json({ message: "product deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const getAdminAllProducts = async (req, res) => {
  try {
    const products = await Products.findAll();
    return res.status(200).json({
      message: "products fetched successfully",
      data: products,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const getUserAllProducts = async (req, res) => {
  try {
    const { isFeatured, isNewarrival, price, sort, categoryid } =
      req.body || {};

    const where = {};
    let order = [];

    if (categoryid) {
      where.categoryid = categoryid;
    }

    // Featured filter
    if (isFeatured !== undefined && isFeatured !== null) {
      where.isFeatured = isFeatured;
    }

    // New arrival filter
    if (isNewarrival !== undefined && isNewarrival !== null) {
      where.isNewarrival = isNewarrival;
    }

    // Price filter
    if (price) {
      switch (price) {
        case "under-500":
          where.sellingprice = {
            [Op.lt]: 500,
          };
          break;

        case "500-1000":
          where.sellingprice = {
            [Op.gte]: 500,
            [Op.lte]: 1000,
          };
          break;

        case "over-1000":
          where.sellingprice = {
            [Op.gt]: 1000,
          };
          break;

        default:
          break;
      }
    }

    // Sort filter

    if (sort) {
      switch (sort) {
        case "low-to-high":
          order = [["sellingprice", "ASC"]];
          break;
        case "high-to-low":
          order = [["sellingprice", "DESC"]];
          break;
        default:
          break;
      }
    }

    const products = await Products.findAll({
      where,
      order: order,
      include: [
        {
          model: ProductReviews,
          as: "reviews",
          where: { status: "active" },
          required: false,
          attributes: ["rating"],
        },
      ],
    });

    const productsWithRatings = products.map((product) => {
      const productData = product.toJSON();
      const reviews = productData.reviews || [];
      const totalrating = reviews.length;
      const averagerating =
        totalrating > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalrating
          : 0;

      delete productData.reviews;

      return {
        ...productData,
        averagerating: parseFloat(averagerating.toFixed(1)),
        totalrating,
      };
    });

    return res.status(200).json({
      status: 200,
      data: productsWithRatings,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getAdminProductById = async (req, res) => {
  try {
    const { productid } = req.params;

    const product = await Products.findByPk(productid);
    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    return res.status(200).json({
      message: "product fetched successfully",
      data: product,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const getUserProductById = async (req, res) => {
  try {
    const { productid } = req.params;

    const product = await Products.findOne({
      where: { productid },
      include: [
        {
          model: ProductReviews,
          as: "reviews",
          where: {
            status: "active",
          },
          required: false,
        },
      ],
    });
    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    const productData = product.toJSON();
    const reviews = productData.reviews || [];
    const totalrating = reviews.length;
    const averagerating =
      totalrating > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalrating
        : 0;

    productData.reviews = reviews.slice(0, 10);
    productData.averagerating = parseFloat(averagerating.toFixed(1));
    productData.totalrating = totalrating;

    const relatedproducts = await Products.findAll({
      where: {
        categoryid: product.categoryid,
        productid: {
          [Op.ne]: product.productid,
        },
      },
      limit: 10,
    });

    return res.status(200).json({
      message: "product fetched successfully",
      data: productData,
      relatedproducts,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};
