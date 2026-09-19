import Users from "./Users.js";
import sequelize from "../config/sequelize.js";
import Category from "./Category.js";
import Products from "./Products.js";
import ProductReviews from "./ProductReviews.js";
import ContactUs from "./Contactus.js";
import Cart from "./Cart.js";
import Address from "./Address.js";

Category.hasMany(Products, { foreignKey: "categoryid" });
Products.belongsTo(Category, { foreignKey: "categoryid" });

Products.hasMany(ProductReviews, { foreignKey: "productid", as: "reviews"  });
ProductReviews.belongsTo(Products, { foreignKey: "productid", as: "reviews" });

Users.hasMany(Cart, { foreignKey: "userid" });
Cart.belongsTo(Users, { foreignKey: "userid" });

Products.hasMany(Cart, { foreignKey: "productid" });
Cart.belongsTo(Products, { foreignKey: "productid" });

Users.hasMany(Address, { foreignKey: "userid" });
Address.belongsTo(Users, { foreignKey: "userid" });

export default { sequelize, Users, Category, Products, ProductReviews, ContactUs, Cart, Address };
