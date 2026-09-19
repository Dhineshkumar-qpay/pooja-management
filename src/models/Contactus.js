import sequelize from "../config/sequelize.js";
import { DataTypes } from "sequelize";

const ContactUs = sequelize.define("Contactus", {
  contactid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: "contactus",
  timestamps: true,
});

export default ContactUs;
