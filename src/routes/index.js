import express from "express";
import * as userController from "../controller/userController.js";
import * as categoryController from "../controller/categoryController.js";
import * as productController from "../controller/productController.js";
import authMiddleware from "../middleware/auth.js";
import {
  uploadCategoryImage,
  uploadProductImages,
} from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/auth/login", userController.Login);
router.post("/auth/verify", userController.VerifyOtp);
router.post("/auth/profile", authMiddleware, userController.GetProfile);
router.post("/auth/update-profile", authMiddleware, userController.UpdateProfile);

router.post("/category/create", authMiddleware, uploadCategoryImage, categoryController.createCategory);
router.post("/category/edit/:id", authMiddleware, uploadCategoryImage, categoryController.updateCategory);
router.post("/category/get", authMiddleware, categoryController.getAllCategories);
router.post("/category/delete/:id", authMiddleware, categoryController.deleteCategory);

router.post("/product/create", authMiddleware, uploadProductImages, productController.createProduct);
router.post("/product/edit/:id", authMiddleware, uploadProductImages, productController.updateProduct);
router.post("/product/delete/:id", authMiddleware, productController.deleteProduct);
router.post("/product/get", authMiddleware, productController.getAllProducts);
router.post("/product/get/:id", authMiddleware, productController.getProductById);

export default router;
