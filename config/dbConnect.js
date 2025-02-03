const { default: mongoose } = require("mongoose");

const dbConnect = () => {
  try {
    const conn = mongoose.connect(process.env.MONGODB_URL);
    //const conn = mongoose.connect(process.env.MONGODB_URL_LOCAL);
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database error");
  }
};
module.exports = dbConnect;
