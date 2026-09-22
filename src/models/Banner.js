import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Banner = sequelize.define(
  "Banner",
  {
    bannerid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    bannerimage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "banners",
    timestamps: true,
  }
);

export default Banner;
