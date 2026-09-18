import Products from "../models/Products.js";
import Category from "../models/Category.js";
import { saveImage, deleteImage } from "../middleware/uploadMiddleware.js";

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
        product.images = [];
        for (const file of req.files["images"]) {
          product.images.push(
            await saveImage(file.buffer, "products", 800, 800),
          );
        }
      }
      if (req.files && Object.keys(req.files).length > 0) await product.save();
    } catch (imageError) {
      await product.destroy();
      deleteImage(product.thumbnailimage);
      if (product.images) product.images.forEach((img) => deleteImage(img));
      return res
        .status(500)
        .json({
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
        product.images = [];
        for (const file of req.files["images"]) {
          product.images.push(
            await saveImage(file.buffer, "products", 800, 800),
          );
        }
        if (oldImages) oldImages.forEach((img) => deleteImage(img));
      }
      if (req.files && Object.keys(req.files).length > 0) await product.save();
    } catch (imageError) {
      deleteImage(product.thumbnailimage);
      if (product.images) product.images.forEach((img) => deleteImage(img));
      return res
        .status(500)
        .json({
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

export const getAllProducts = async (req, res) => {
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

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Products.findByPk(id);
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
