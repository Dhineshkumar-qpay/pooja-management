import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Cart = sequelize.define(
  "Cart",
  {
    cartid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userid: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    productid: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
  },
  {
    tableName: "cart",
    timestamps: true,
  }
);

export default Cart;
