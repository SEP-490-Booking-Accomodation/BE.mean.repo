const express = require("express");
const dbConnect = require("./config/dbConnect");
const { swaggerUi, swaggerSpec } = require("./config/swaggerConfig");

const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 4000;

// Import routes
const authRouter = require("./routes/authRoute");
const roleRouter = require("./routes/roleRoute");

const bodyParser = require("body-parser");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

dbConnect();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Route cho Swagger UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

app.use("/api/user", authRouter);
app.use("/api/role", roleRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});