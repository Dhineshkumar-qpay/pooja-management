import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Products = sequelize.define(
  "Products",
  {
    productid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    thumbnailimage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    productname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    categoryname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    categoryid: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    sellingprice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    stockquantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    dimensions: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Length x Width x Height",
    },
    benefits: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    countryoforigin: {
      type: DataTypes.STRING,
      defaultValue: "India",
    },
    images: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("images");

        if (!rawValue) {
          return [];
        }

        try {
          return typeof rawValue === "string" ? JSON.parse(rawValue) : rawValue;
        } catch (error) {
          return [];
        }
      },
      set(value) {
        this.setDataValue(
          "images",
          value ? JSON.stringify(value) : JSON.stringify([]),
        );
      },
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isNewarrival: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "products",
    timestamps: true,
  },
);

export default Products;
