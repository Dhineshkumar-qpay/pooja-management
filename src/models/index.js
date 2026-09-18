import Users from "./Users.js";
import sequelize from "../config/sequelize.js";
import Category from "./Category.js";
import Products from "./Products.js";

Category.hasMany(Products, { foreignKey: "categoryid" });
Products.belongsTo(Category, { foreignKey: "categoryid" });

export default { sequelize, Users, Category, Products };
