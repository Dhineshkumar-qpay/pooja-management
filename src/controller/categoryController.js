import Category from "../models/Category.js";
import { saveImage, deleteImage } from "../middleware/uploadMiddleware.js";
import Products from "../models/Products.js";
import sequelize from "../config/sequelize.js";

export const createCategory = async (req, res) => {
  try {
    const { categoryname, description } = req.body;

    if (!categoryname) {
      return res.status(400).json({ message: "categoryname is required" });
    }

    const existing = await Category.findOne({ where: { categoryname } });
    if (existing) {
      return res.status(409).json({ message: "category already exists" });
    }

    const category = await Category.create({ categoryname, description });

    try {
      if (req.file) {
        category.thumbnailimage = await saveImage(
          req.file.buffer,
          "category",
          500,
          500,
        );
        await category.save();
      }
    } catch (imageError) {
      await category.destroy();
      return res.status(500).json({
        message: "image processing failed",
        error: imageError.message,
      });
    }

    return res.status(201).json({ message: "category created successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryname, description } = req.body;

    const existingCategory = await Category.findByPk(id);
    if (!existingCategory) {
      return res.status(404).json({ message: "category not found" });
    }

    if (categoryname) existingCategory.categoryname = categoryname;
    if (description) existingCategory.description = description;

    await existingCategory.save();

    try {
      if (req.file) {
        const oldImage = existingCategory.thumbnailimage;
        existingCategory.thumbnailimage = await saveImage(
          req.file.buffer,
          "category",
          500,
          500,
        );
        await existingCategory.save();
        deleteImage(oldImage);
      }
    } catch (imageError) {
      deleteImage(existingCategory.thumbnailimage);
      return res.status(500).json({
        message: "image processing failed",
        error: imageError.message,
      });
    }

    return res.status(200).json({ message: "category updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCategory = await Category.findByPk(id);
    if (!existingCategory) {
      return res.status(404).json({ message: "category not found" });
    }

    await existingCategory.destroy();
    deleteImage(existingCategory.thumbnailimage);

    return res.status(200).json({ message: "category deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: [
        "categoryid",
        "categoryname",
        "description",
        "thumbnailimage",
        [sequelize.fn("COUNT", sequelize.col("Products.productid")), "productcount"],
      ],
      include: [
        {
          model: Products,
          attributes: [],
        },
      ],
      group: ["Category.categoryid"],
      raw: true,
    });
    return res.status(200).json({
      status: 200,
      data: categories,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};
