import { Sequelize } from "sequelize";
import ProductReviews from "../models/ProductReviews.js";

export const createProductReview = async (req, res) => {
  try {
    const userid = req.user?.userid;

    const productReview = await ProductReviews.create({
      ...req.body,
      userid,
    });
    return res.status(201).json({
      status: 201,
      message: "Product review created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getAllProductReviews = async (req, res) => {
  try {
    const productReviews = await ProductReviews.findAll({
      attributes: [
        "reviewid",
        "productid",
        "productname",
        "userid",
        "rating",
        "reviewtitle",
        "reviewdescription",
        "status",
      ],
      order: [["createdAt", "DESC"]],
      limit: 100,
    });

    // Get overall review statistics
    const overallReviews = await ProductReviews.findOne({
      attributes: [
        [
          Sequelize.fn(
            "ROUND",
            Sequelize.fn("AVG", Sequelize.col("rating")),
            1,
          ),
          "avgrating",
        ],
        [Sequelize.fn("COUNT", Sequelize.col("reviewid")), "totalreviews"],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal(`CASE WHEN status = 'active' THEN 1 END`),
          ),
          "activestatus",
        ],
      ],
      raw: true,
    });

    return res.status(200).json({
      status: 200,
      data: {
        reviews: productReviews,
        overall: {
          avgrating: overallReviews?.avgrating || 0,
          totalreviews: overallReviews?.totalreviews || 0,
          activestatus: overallReviews?.activestatus || 0,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateProductReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["active", "inactive"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Valid status ('active' or 'inactive') is required" });
    }

    const review = await ProductReviews.findByPk(id);
    if (!review) {
      return res.status(404).json({ message: "Product review not found" });
    }

    review.status = status;
    await review.save();

    return res.status(200).json({
      status: 200,
      message: "Product review status updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Server error",
      error: error.message,
    });
  }
};

export const deleteProductReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await ProductReviews.findByPk(id);
    if (!review) {
      return res.status(404).json({ message: "Product review not found" });
    }

    await review.destroy();

    return res.status(200).json({
      status: 200,
      message: "Product review deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Server error",
      error: error.message,
    });
  }
};
