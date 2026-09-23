import express from "express";
import * as userController from "../controller/userController.js";
import * as categoryController from "../controller/categoryController.js";
import * as productController from "../controller/productController.js";
import * as productReviewsController from "../controller/productReviewsController.js";
import * as contactUsController from "../controller/contactusController.js";
import * as cartController from "../controller/cartController.js";
import * as addressController from "../controller/addressController.js";
import * as orderController from "../controller/orderController.js";
import * as testimonialController from "../controller/testimonialController.js";
import * as bannerController from "../controller/bannerController.js";
import * as couponController from "../controller/couponController.js";
import authMiddleware from "../middleware/auth.js";
import adminMiddleware from "../middleware/admin.js";
import {
  uploadCategoryImage,
  uploadProductImages,
  uploadBannerImage,
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
  "/auth/get-all",
  authMiddleware,
  adminMiddleware,
  userController.GetAllUsers,
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
router.post("/product/search", productController.searchProducts);

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
router.post(
  "/productreviews/update-status/:id",
  authMiddleware,
  adminMiddleware,
  productReviewsController.updateProductReviewStatus,
);
router.post(
  "/productreviews/delete/:id",
  authMiddleware,
  adminMiddleware,
  productReviewsController.deleteProductReview,
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
router.post(
  "/cart/apply-coupon",
  authMiddleware,
  cartController.ApplyCouponCheckout,
);

// Address
router.post("/address/add", authMiddleware, addressController.AddAddress);
router.post("/address/get", authMiddleware, addressController.GetAllAddress);
router.post(
  "/address/edit/:addressid",
  authMiddleware,
  addressController.EditAddress,
);
router.post(
  "/address/delete/:addressid",
  authMiddleware,
  addressController.DeleteAddress,
);

//orders
router.post("/orders/place-order", authMiddleware, orderController.PlaceOrder);
router.post(
  "/orders/verify-payment",
  authMiddleware,
  orderController.VerifyPayment,
);
router.post("/orders/all", authMiddleware, orderController.GetAllAdminOrders);
router.post("/orders/user", authMiddleware, orderController.GetAllUserOrders);
router.post("/orders/details", authMiddleware, orderController.GetOrderDetails);
router.post(
  "/orders/admin-details",
  authMiddleware,
  adminMiddleware,
  orderController.GetAdminOrderDetails,
);
router.post("/orders/buy-again", authMiddleware, orderController.BuyAgain);
router.post(
  "/orders/update-status",
  authMiddleware,
  orderController.UpdateOrderStatus,
);

// Testimonials
router.post("/testimonials/add", testimonialController.addTestimonial);
router.post("/testimonials/get", testimonialController.getAllTestimonials);
router.post(
  "/testimonials/update-status/:id",
  authMiddleware,
  adminMiddleware,
  testimonialController.updateTestimonialStatus,
);
router.post(
  "/testimonials/delete/:id",
  authMiddleware,
  adminMiddleware,
  testimonialController.deleteTestimonial,
);

// Banners
router.post(
  "/banner/add",
  authMiddleware,
  adminMiddleware,
  uploadBannerImage,
  bannerController.createBanner,
);
router.post("/banner/get", bannerController.getBanners);
router.post(
  "/banner/edit/:id",
  authMiddleware,
  adminMiddleware,
  uploadBannerImage,
  bannerController.updateBanner,
);
router.post(
  "/banner/delete/:id",
  authMiddleware,
  adminMiddleware,
  bannerController.deleteBanner,
);

// Coupons
router.post(
  "/coupon/add",
  authMiddleware,
  adminMiddleware,
  couponController.createCoupon,
);
router.post("/coupon/get", authMiddleware, couponController.getCoupons);
router.post(
  "/coupon/edit/:id",
  authMiddleware,
  adminMiddleware,
  couponController.updateCoupon,
);
router.post(
  "/coupon/delete/:id",
  authMiddleware,
  adminMiddleware,
  couponController.deleteCoupon,
);

export default router;
