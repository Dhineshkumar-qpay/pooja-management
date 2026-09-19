import express from "express";
import * as userController from "../controller/userController.js";
import * as categoryController from "../controller/categoryController.js";
import * as productController from "../controller/productController.js";
import * as productReviewsController from "../controller/productReviewsController.js";
import * as contactUsController from "../controller/contactusController.js";
import * as cartController from "../controller/cartController.js";
import * as addressController from "../controller/addressController.js";
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
router.post("/category/get", categoryController.getAllCategories);
router.post(
  "/category/delete/:id",
  authMiddleware,
  adminMiddleware,
  categoryController.deleteCategory,
);

// Products
router.post("/product/get-user", productController.getUserAllProducts);
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
router.post(
  "/product/get",
  authMiddleware,
  productController.getAdminAllProducts,
);
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

// Contact Us
router.post("/contactus/submit", contactUsController.submitContactForm);
router.post(
  "/contactus/get",
  authMiddleware,
  adminMiddleware,
  contactUsController.getAllContacts,
);
router.post(
  "/contactus/delete/:id",
  authMiddleware,
  adminMiddleware,
  contactUsController.deleteContact,
);

// Cart
router.post("/cart/add", authMiddleware, cartController.addToCart);
router.post("/cart/get", authMiddleware, cartController.getCartItems);
router.post(
  "/cart/increase/:cartid",
  authMiddleware,
  cartController.increaseQuantity,
);
router.post(
  "/cart/decrease/:cartid",
  authMiddleware,
  cartController.decreaseQuantity,
);
router.post(
  "/cart/delete/:cartid",
  authMiddleware,
  cartController.deleteCartItem,
);
router.post("/cart/count", authMiddleware, cartController.getCartCount);
router.post("/cart/buynow", authMiddleware, cartController.buyNow);

// Address
router.post("/address/add", authMiddleware, addressController.AddAddress);
router.post("/address/get", authMiddleware, addressController.GetAllAddress);
router.post("/address/edit/:addressid", authMiddleware, addressController.EditAddress);
router.post("/address/delete/:addressid", authMiddleware, addressController.DeleteAddress);

export default router;
