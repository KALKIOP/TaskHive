const { Sequelize } = require("sequelize");

let sequelize;

if (process.env.DATABASE_URL) {
  // Railway PostgreSQL (production)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });
} else {
  // Local PostgreSQL
  sequelize = new Sequelize(
    process.env.DB_NAME || "taskflow",
    process.env.DB_USER || "kalki",
    process.env.DB_PASS || "",
    {
      host: process.env.DB_HOST || "localhost",
      dialect: "postgres",
      logging: false
    }
  );
}

module.exports = sequelize;
