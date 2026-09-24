import sequelize from "../config/sequelize.js";
import { DataTypes } from "sequelize";

const UserFavourite = sequelize.define(
  "UserFavourite",
  {
    favouriteid: {
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
  },
  {
    tableName:"favourites",
    timestamps: false,
  },
);

export default UserFavourite;
