import Users from "./Users.js";
import sequelize from "../config/sequelize.js";
import Category from "./Category.js";
import Products from "./Products.js";
import ProductReviews from "./ProductReviews.js";
import ContactUs from "./Contactus.js";
import Cart from "./Cart.js";
import Address from "./Address.js";
import { Orders, OrderItems } from "./Orders.js";
import Testimonials from "./Testimonials.js";
import Banner from "./Banner.js";
import Coupon from "./Coupon.js";

Category.hasMany(Products, { foreignKey: "categoryid" });
Products.belongsTo(Category, { foreignKey: "categoryid" });

Products.hasMany(ProductReviews, { foreignKey: "productid", as: "reviews" });
ProductReviews.belongsTo(Products, { foreignKey: "productid", as: "reviews" });

Users.hasMany(Cart, { foreignKey: "userid" });
Cart.belongsTo(Users, { foreignKey: "userid" });

Products.hasMany(Cart, { foreignKey: "productid" });
Cart.belongsTo(Products, { foreignKey: "productid" });

Users.hasMany(Address, { foreignKey: "userid" });
Address.belongsTo(Users, { foreignKey: "userid" });

Orders.hasMany(OrderItems, { foreignKey: "orderid", as: "orderitems" });
OrderItems.belongsTo(Orders, { foreignKey: "orderid", as: "orderitems" });

export default {
  sequelize,
  Users,
  Category,
  Products,
  ProductReviews,
  ContactUs,
  Cart,
  Address,
  Orders,
  OrderItems,
  Testimonials,
  Banner,
  Coupon,
};
