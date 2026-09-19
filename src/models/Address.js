import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Address = sequelize.define(
  "Address",
  {
    addressid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userid: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    addressline1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    addressline2: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "India",
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "address",
    timestamps: false,
  },
);

export default Address;
