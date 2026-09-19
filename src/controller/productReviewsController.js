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
    const productReviews = await ProductReviews.findAll();

    return res.status(200).json({
      status: 200,
      data: productReviews,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Server error",
      error: error.message,
    });
  }
};
