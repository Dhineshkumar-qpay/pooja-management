import dotenv from 'dotenv';
dotenv.config();
import app from './src/app.js';
import db from './src/models/index.js';
const { sequelize } = db;

const PORT = process.env.MYSQLPORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();

    
    // Sync models
    await sequelize.sync({ force: false }); // Set force: true to recreate tables on start


    app.listen(PORT, () => {

    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
