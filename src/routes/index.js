import express from "express";
import * as userController from "../controller/userController.js";
import * as categoryController from "../controller/categoryController.js";
import * as productController from "../controller/productController.js";
import * as productReviewsController from "../controller/productReviewsController.js";
import authMiddleware from "../middleware/auth.js";
import adminMiddleware from "../middleware/admin.js";
import {
  uploadCategoryImage,
  uploadProductImages,
} from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/auth/login", userController.Login);
router.post("/auth/verify", userController.VerifyOtp);
router.post("/auth/profile", authMiddleware, userController.GetProfile);
router.post(
  "/auth/update-profile",
  authMiddleware,
  userController.UpdateProfile,
);

router.post(
  "/category/create",
  authMiddleware,
  adminMiddleware,
  uploadCategoryImage,
  categoryController.createCategory,
);
router.post(
  "/category/edit/:id",
  authMiddleware,
  adminMiddleware,
  uploadCategoryImage,
  categoryController.updateCategory,
);
router.post(
  "/category/get",
  categoryController.getAllCategories,
);
router.post(
  "/category/delete/:id",
  authMiddleware,
  adminMiddleware,
  categoryController.deleteCategory,
);


// Products
router.post(
  "/product/get-user",
  productController.getUserAllProducts,
);
router.post(
  "/product/create",
  authMiddleware,
  adminMiddleware,
  uploadProductImages,
  productController.createProduct,
);
router.post(
  "/product/edit/:id",
  authMiddleware,
  adminMiddleware,
  uploadProductImages,
  productController.updateProduct,
);
router.post(
  "/product/delete/:id",
  authMiddleware,
  adminMiddleware,
  productController.deleteProduct,
);
router.post("/product/get", authMiddleware, productController.getAdminAllProducts);
router.post(
  "/product/get/:productid",
  authMiddleware,
  productController.getAdminProductById,
);
router.post(
  "/product/get-product-details/:productid",
  productController.getUserProductById,
);


// Product Reviews 
router.post(
  "/productreviews/add",
  authMiddleware,
  productReviewsController.createProductReview,
);
router.post(
  "/productreviews/get",
  authMiddleware,
  productReviewsController.getAllProductReviews,
);

export default router;
