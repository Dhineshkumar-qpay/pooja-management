import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const ProductReviews = sequelize.define(
  "ProductReviews",
  {
    reviewid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    productid: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    productname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userid: {
      type: DataTypes.UUID,
      allowNull: false,    
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
        isInt: true,
      },
    },
    reviewtitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reviewdescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status:{
      type:DataTypes.ENUM("active","inactive"),
      defaultValue:"inactive"
    }
  },
  {
    tableName: "productreviews",
    timestamps: true,
  }
);

export default ProductReviews;