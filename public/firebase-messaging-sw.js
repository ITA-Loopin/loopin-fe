// Firebase Cloud Messaging 서비스 워커
// 이 파일은 public 폴더에 있어야 하며, 브라우저에서 자동으로 등록됩니다.

importScripts('https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/12.8.0/firebase-messaging.js');

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyAlcaUrp2UGYeaFxbVlPMf9wvAYJntxRtk",
  authDomain: "loopin-474713.firebaseapp.com",
  projectId: "loopin-474713",
  storageBucket: "loopin-474713.firebasestorage.app",
  messagingSenderId: "761645347613",
  appId: "1:761645347613:web:59f8017b1b861e6e9d27f4"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Messaging 인스턴스 가져오기
const messaging = firebase.messaging();

// 백그라운드 메시지 수신 핸들러
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] 백그라운드 메시지 수신:', payload);
  
  const notificationTitle = payload.notification?.title || 'Loopin 알림';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/loopin-logo.svg',
    badge: '/loopin-logo.svg',
    tag: 'loopin-notification',
    requireInteraction: false,
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
