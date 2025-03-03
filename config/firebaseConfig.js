const admin = require("firebase-admin");
const serviceAccount = require("../mean-dfd43-firebase-adminsdk-fbsvc-fbed992596.json"); // Thay đường dẫn tệp JSON

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
