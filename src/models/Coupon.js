import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Coupon = sequelize.define(
  "Coupon",
  {
    couponid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    couponcode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM("flat", "percentage"),
      allowNull: false,
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    minorder: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    expiry: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "coupon",
    timestamps: true,
  }
);

export default Coupon;
