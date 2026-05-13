// Firebase Cloud Messaging 서비스 워커
// 이 파일은 public 폴더에 있어야 하며, 브라우저에서 자동으로 등록됩니다.
// Firebase SDK 없이 기본 Web Push API를 사용합니다.

// body JSON에서 content 텍스트 추출
function extractContent(bodyStr) {
  if (!bodyStr || typeof bodyStr !== 'string') return '';
  try {
    const parsed = JSON.parse(bodyStr);
    return parsed.content || bodyStr;
  } catch {
    return bodyStr;
  }
}

// Push 이벤트 리스너
self.addEventListener('push', (event) => {
  let notificationData = {};

  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      try {
        notificationData = JSON.parse(event.data.text());
      } catch (e2) {
        notificationData = { body: event.data.text() || '새로운 알림이 있습니다.' };
      }
    }
  }

  const data = notificationData.data || {};
  const title =
    notificationData.notification?.title ||
    data.title ||
    notificationData.title ||
    'Loopin 알림';
  const rawBody =
    notificationData.notification?.body ||
    data.body ||
    notificationData.body ||
    '';
  const body = extractContent(rawBody);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const visibleClient = clientList.find((c) => c.visibilityState === 'visible');

      if (visibleClient) {
        // 포그라운드: 페이지로 메시지 전달 → 인앱 알림 표시
        clientList.forEach((client) => {
          client.postMessage({ type: 'PUSH_NOTIFICATION', title, body });
        });
      } else {
        // 백그라운드: 시스템 알림 표시
        return self.registration.showNotification(title, {
          body: body || '새로운 알림이 있습니다.',
          icon: '/loopin-logo.svg',
          badge: '/loopin-logo.svg',
          requireInteraction: false,
          data: data,
        });
      }
    })
  );
});

// 알림 클릭 이벤트 리스너
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] 알림 클릭');
  
  event.notification.close();
  
  // 알림 데이터에 URL이 있으면 해당 페이지로 이동
  const urlToOpen = event.notification.data?.url || event.notification.data?.link || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // 이미 열려있는 창이 있으면 포커스
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// 서비스 워커 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] 서비스 워커 설치됨');
  self.skipWaiting(); // 즉시 활성화
});

// 서비스 워커 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] 서비스 워커 활성화됨');
  event.waitUntil(
    clients.claim() // 모든 클라이언트 제어권 획득
  );
});
