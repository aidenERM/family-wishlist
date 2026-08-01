const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

let configured = false;

function ensureConfigured() {
  if (configured) return;
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return;
  }
  webpush.setVapidDetails(
    'mailto:aidenspearb@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  configured = true;
}

async function sendNotificationToAll(payload) {
  ensureConfigured();
  if (!configured) {
    console.warn('VAPID keys no configuradas, se omite el envio de notificaciones push');
    return;
  }

  const subs = await PushSubscription.find();
  const body = JSON.stringify(payload);

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } },
          body
        );
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: sub._id });
        } else {
          console.error('Error enviando push a', sub.endpoint, error.message);
        }
      }
    })
  );
}

module.exports = { sendNotificationToAll, ensureConfigured };
