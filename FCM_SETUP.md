# FCM (Firebase Cloud Messaging) 설정 가이드

## 1. VAPID 키 생성 및 설정

FCM 토큰을 가져오려면 VAPID 키가 필요합니다. 다음 단계를 따라 설정하세요:

### Firebase Console에서 VAPID 키 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. 프로젝트 선택: `loopin-474713`
3. 프로젝트 설정 (⚙️ 아이콘) 클릭
4. "Cloud Messaging" 탭 선택
5. "Web Push certificates" 섹션에서 "키 쌍 생성" 클릭
6. 생성된 VAPID 키를 복사

### 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
NEXT_PUBLIC_FCM_VAPID_KEY=여기에_생성한_VAPID_키_붙여넣기
```

## 2. 토큰 확인 방법

### 방법 1: 브라우저 콘솔에서 확인

1. 개발 서버 실행: `pnpm dev`
2. 브라우저에서 앱 접속
3. 로그인 수행
4. 브라우저 개발자 도구 (F12) 열기
5. Console 탭에서 다음 메시지 확인:
   - `FCM 토큰 가져오기 성공: [토큰값]`
   - `FCM 토큰 저장 응답: { success: true, ... }`

### 방법 2: 네트워크 탭에서 확인

1. 브라우저 개발자 도구 열기
2. Network 탭 선택
3. 로그인 후 `POST /rest-api/v1/fcm` 요청 확인
4. Request Payload에서 `fcmToken` 값 확인
5. Response에서 `success: true` 확인

### 방법 3: 코드에 디버깅 로그 추가

`src/lib/fcm.ts` 파일의 `saveFCMTokenApi` 함수에서 이미 로그를 출력하고 있습니다:

```typescript
console.log("FCM 토큰 저장 응답:", response);
```

브라우저 콘솔에서 이 로그를 확인하면 토큰 저장 성공 여부를 확인할 수 있습니다.

## 3. 알림 권한 확인

FCM 토큰을 가져오려면 브라우저 알림 권한이 필요합니다:

1. 브라우저에서 알림 권한 요청 팝업 확인
2. "허용" 클릭
3. 권한이 거부된 경우, 브라우저 설정에서 수동으로 허용

## 4. 서비스 워커 확인

서비스 워커가 정상적으로 등록되었는지 확인:

1. 브라우저 개발자 도구 열기
2. Application 탭 선택
3. Service Workers 섹션에서 `firebase-messaging-sw.js` 확인
4. Status가 "activated"인지 확인

## 5. 문제 해결

### 토큰을 가져올 수 없는 경우

- VAPID 키가 올바르게 설정되었는지 확인
- 브라우저 알림 권한이 허용되었는지 확인
- HTTPS 또는 localhost에서 실행 중인지 확인 (FCM은 HTTP에서 작동하지 않음)

### 서비스 워커 등록 실패

- `public/firebase-messaging-sw.js` 파일이 존재하는지 확인
- 브라우저 콘솔에서 에러 메시지 확인
- Next.js 개발 서버를 재시작

### 토큰 저장 API 실패

- 네트워크 탭에서 API 요청 확인
- 서버 응답 코드 확인 (200 OK 여부)
- 인증 토큰이 유효한지 확인

## 6. 테스트 방법

### 로그인 시 토큰 저장 테스트

1. 로그아웃 상태에서 시작
2. 로그인 수행
3. 브라우저 콘솔에서 다음 확인:
   ```
   FCM 토큰 가져오기 성공: [토큰]
   FCM 토큰 저장 응답: { success: true, ... }
   ```

### 로그아웃 시 토큰 삭제 테스트

1. 로그인 상태에서 시작
2. 로그아웃 수행
3. 브라우저 콘솔에서 다음 확인:
   ```
   FCM 토큰 삭제 응답: { success: true, ... }
   ```

### 회원탈퇴 시 토큰 삭제 테스트

1. 로그인 상태에서 시작
2. 회원탈퇴 수행
3. 브라우저 콘솔에서 다음 확인:
   ```
   FCM 토큰 삭제 응답: { success: true, ... }
   ```
