// src/components/NotificationPermission.js
import React, { useEffect } from "react";
import { messaging, getToken, onMessage } from "../firebase";

const NotificationPermission = () => {
  useEffect(() => {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        getToken(messaging, {
          vapidKey: "YOUR_VAPID_KEY",
        }).then((currentToken) => {
          if (currentToken) {
            console.log("✅ FCM Token:", currentToken);
            // You can send this token to your backend to store
          } else {
            console.warn("⚠️ No registration token available.");
          }
        });
      }
    });

    onMessage(messaging, (payload) => {
      console.log("📩 Foreground message received:", payload);
      alert(payload.notification.title + ": " + payload.notification.body);
    });
  }, []);

  return null;
};

export default NotificationPermission;
