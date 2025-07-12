// 📁 backend/scheduler.js
const cron = require("node-cron");
const { sendNotification } = require("./sendNotification");

// ⏰ Schedule the job to run every day at 9 AM
cron.schedule("0 9 * * *", () => {
  console.log("⏰ Running daily notification job...");
  sendNotification();
});

// Keep Node.js process alive
console.log("✅ Notification scheduler running...");