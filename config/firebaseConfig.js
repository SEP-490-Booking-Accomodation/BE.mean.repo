const admin = require("firebase-admin");
const serviceAccount = require("../config/mean-dfd43-firebase-adminsdk-fbsvc-6bf532f724.json"); // Thay đường dẫn tệp JSON

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
