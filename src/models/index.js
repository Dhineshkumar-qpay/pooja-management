import Users from "./Users.js";
import sequelize from "../config/sequelize.js";
import Category from "./Category.js";
import Products from "./Products.js";
import ProductReviews from "./ProductReviews.js";

Category.hasMany(Products, { foreignKey: "categoryid" });
Products.belongsTo(Category, { foreignKey: "categoryid" });

Products.hasMany(ProductReviews, { foreignKey: "productid", as: "reviews"  });
ProductReviews.belongsTo(Products, { foreignKey: "productid", as: "reviews" });

export default { sequelize, Users, Category, Products, ProductReviews };
