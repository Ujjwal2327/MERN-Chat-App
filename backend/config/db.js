const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Mongo DB Succesfully Connected: ${conn.connection.host}`.cyan.bold);
  } catch (err) {
    console.log(`Mongo DB Connection Error: ${err.message}`.red.bold);
    process.exit();
  }
};

module.exports = connectDB;
