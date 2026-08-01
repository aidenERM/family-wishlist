/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url, sameOrigin }) => !sameOrigin && /\/api\//.test(url.pathname),
  new NetworkFirst({
    cacheName: 'family-wishlist-api',
    networkTimeoutSeconds: 6,
  })
);

self.addEventListener('push', (event) => {
  let data: { title?: string; body?: string } = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'Lista de Deseos', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Lista de Deseos';
  const options: NotificationOptions = {
    body: data.body || '',
    icon: `${self.registration.scope}pwa/icon-any-192.png`,
    badge: `${self.registration.scope}pwa/icon-any-192.png`,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const scope = self.registration.scope;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.startsWith(scope) && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(scope);
    })
  );
});

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
