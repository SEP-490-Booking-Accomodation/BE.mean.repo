const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (data, req, res) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, //true for 465, false for other ports
    auth: {
      user: process.env.MAIL_ID,
      pass: process.env.MAIL_PASSWORD,
    },
  });
  //send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Mean CapsuleRoom" <mean@gmail.com.vn>',
    to: data.to,
    subject: data.subject,
    text: data.text,
    html: data.html,
  });

  console.log(info);
  console.log("Message sent: %s", info.messageId);

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
});

const sendOTPEmail = asyncHandler(async (email, otp) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_ID,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  let info = await transporter.sendMail({
    from: '"Mean CapsuleRoom" <mean@gmail.com.vn>',
    to: email,
    subject: "Email Verification OTP",
    text: `Your OTP for email verification is: ${otp}`,
    html: `<p>Your OTP for email verification is: <b>${otp}</b></p>`,
  });

  console.log("OTP sent: %s", info.messageId);
});

module.exports = { sendOTPEmail, sendEmail };
