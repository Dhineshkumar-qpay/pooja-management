import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Category = sequelize.define(
  "Category",
  {
    categoryid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    categoryname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnailimage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "category",
    timestamps: false,
  },
);

export default Category;