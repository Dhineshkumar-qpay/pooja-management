import sequelize from "../config/sequelize.js";
import { DataTypes } from "sequelize";

const Orders = sequelize.define(
  "Orders",
  {
    orderid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userid: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    addressid: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    totalamount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    paymentstatus: {
      type: DataTypes.ENUM("pending", "paid", "failed"),
      defaultValue: "pending",
    },
    orderstatus: {
      type: DataTypes.ENUM(
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
      ),
      defaultValue: "pending",
    },
    shippingprice: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
    },
    razorpayorderid: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    razorpaypaymentid: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    razorpaysignature: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { tableName: "orders", timestamps: true },
);

const OrderItems = sequelize.define(
  "OrderItems",
  {
    orderitemid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userid: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    orderid: {
      type: DataTypes.UUID,
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
    productimage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  { tableName: "orderitems", timestamps: false },
);

export { Orders, OrderItems };
