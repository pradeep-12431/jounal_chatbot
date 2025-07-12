const { google } = require("googleapis");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const serviceAccount = require("./serviceAccountKey.json");

const targetFCMToken = "c5-_4Yua3SBtqinEGMaoMT:APA91bEbC3oewMISy4x1ZSkzRuCIqVwiH6rFQcSrg-n-sDK5URHDkOwL1ysjh_AraPmm-Q5bt8hbj8xcKrYMDU5bGOJ8srv4jiCcPpM47iOeArNQtYPgn00"; // Replace with your token

async function getAccessToken() {
  const jwtClient = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });

  const tokens = await jwtClient.authorize();
  return tokens.access_token;
}

async function sendNotification() {
  const accessToken = await getAccessToken();

  const message = {
    message: {
      token: targetFCMToken,
      notification: {
        title: "🛎️ Journal Reminder",
        body: "Have you written your journal today?",
      },
    },
  };

  const response = await fetch(
    "https://fcm.googleapis.com/v1/projects/mental-health-journal-62e9f/messages:send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    }
  );

  const data = await response.json();
  if (response.ok) {
    console.log("✅ Notification sent:", data);
  } else {
    console.error("❌ Failed to send:", data);
  }
}

sendNotification().catch((err) => console.error("❌ Error:", err));
module.exports = { sendNotification };