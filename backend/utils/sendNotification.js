const admin = require('firebase-admin');
const serviceAccount = require('./path-to-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const message = {
  notification: {
    title: 'Time to Journal 📝',
    body: 'Don’t forget to log your mood today!',
  },
  token: userDeviceToken, // Replace with your user's FCM token
};

admin
  .messaging()
  .send(message)
  .then((response) => {
    console.log('✅ Successfully sent message:', response);
  })
  .catch((error) => {
    console.error('❌ Error sending message:', error);
  });
