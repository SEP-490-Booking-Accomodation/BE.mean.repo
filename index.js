const express = require("express");
const dbConnect = require("./config/dbConnect");
const { swaggerUi, swaggerSpec } = require("./config/swaggerConfig");
const cors = require("cors");

const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 4000;

// Import routes
const authRouter = require("./routes/authRoute");
const roleRouter = require("./routes/roleRoute");
const staffRouter = require("./routes/staffRoute");
const ownerRouter = require("./routes/ownerRoute");
const customerRouter = require("./routes/customerRoute");
const policySystemRoute = require("./routes/policySystemRoute");
const policySystemCategoryRoute = require("./routes/policySystemCategoryRoute");
const policySystemBookingRoute = require("./routes/policySystemBookingRoute");
const bookingRoute = require("./routes/bookingRoute");
const couponRoute = require("./routes/couponRoute");
const reportRoute = require("./routes/reportRoute");
const feedbackRoute = require("./routes/feedbackRoute");
const businessInformationRoute = require("./routes/businessInformationRoute");
const policyOwnerRoute = require("./routes/policyOwnerRoute");
const rentalLocationRoute = require("./routes/rentalLocationRoute");
const accommodationRoute = require("./routes/accommodationRoute");
const accommodationTypeRoute = require("./routes/accommodationTypeRoute");
const serviceRoute = require("./routes/serviceRoute");
const paymentInformationRoute = require("./routes/paymentInformationRoute");
const conversationRoute =  require("./routes/conversationRoute");
const messageRoute =  require("./routes/messageRoute");
const notificationRoute = require("./routes/notificationRoute");
const transactionRoute = require("./routes/transactionRoute");

const bodyParser = require("body-parser");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

dbConnect();

// Cấu hình CORS cho phép tất cả các nguồn
app.use(cors());
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
app.use("/api/staff", staffRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/customer", customerRouter);
app.use("/api/policy-system", policySystemRoute);
app.use("/api/policy-system-category", policySystemCategoryRoute);
app.use("/api/policy-system-booking", policySystemBookingRoute);
app.use("/api/booking", bookingRoute);
app.use("/api/coupon", couponRoute);
app.use("/api/report", reportRoute);
app.use("/api/feedback", feedbackRoute);
app.use("/api/business-information", businessInformationRoute);
app.use("/api/policy-owner", policyOwnerRoute);
app.use("/api/rental-location", rentalLocationRoute);
app.use("/api/accommodation", accommodationRoute);
app.use("/api/accommodation-type", accommodationTypeRoute);
app.use("/api/service", serviceRoute);
app.use("/api/payment-information", paymentInformationRoute);
app.use("/api/conversation", conversationRoute)
app.use("/api/message", messageRoute);
app.use("/api/notification", notificationRoute);
app.use("/api/transaction", transactionRoute);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//token admin test: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YTAzMDg0MjNjMDM4YjU0MWRjMjEzZSIsImlhdCI6MTczODU1MTQ0NCwiZXhwIjoxNzM4ODEwNjQ0fQ.Mao8vOijSwJFazeIGqYgAHFB1t179D79k3nsh6EW9M0
