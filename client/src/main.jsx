import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { requestForToken } from './firebase-messaging';

requestForToken();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log("🛠️ Service Worker registered:", registration);
    })
    .catch((err) => {
      console.error("Service Worker registration failed:", err);
    });
}