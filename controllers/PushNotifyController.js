const admin = require('firebase-admin');
const serviceAccount = require('../buynbook-ffc64-firebase-adminsdk-cncwh-1568256618.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

class PushNotifyController {
  // Function to send push notification
  async sendPushNotification(FcmToken, message, title) {
    try {

    const payload = {
        notification: {
          title: title,
          body: message,
        },
        android: {
          notification: {
            icon: 'https://buynbookproducts.s3.ap-south-1.amazonaws.com/buynbooklogo.png',
            sound: 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default'
            }
          }
        },
        token: FcmToken,
      };

      const response = await admin.messaging().send(payload);
      console.log('Successfully sent message:', response);
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // API Endpoint to send push notification
  async sendNotification(req, res) {
    try {
      const { FcmToken, message, title } = req.body;

      if (!FcmToken) {
        return res.status(400).json({
          success: false,
          message: "Fcm Token is required"
        });
      }

      const response = await this.sendPushNotification(FcmToken, message, title);

      return res.status(200).json({
        success: true,
        message: 'Push notification sent successfully.',
        response: response
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

// Instantiate and export the controller
const pushNotifyController = new PushNotifyController();
module.exports = pushNotifyController;
