# 습관 트래커

매일의 습관을 기록하고 정해진 시간에 알림을 받는 웹 앱입니다.

## 기능
- 이메일/Google 로그인 (여러 기기 동기화)
- 습관 추가/수정/삭제
- 매일 완료 체크 (자정 자동 초기화)
- 설정한 시간에 브라우저 푸시 알림
- 모바일/PC 반응형 + PWA (홈 화면 추가 가능)

## 로컬 실행

```bash
npm install
cp .env.example .env.local
# .env.local에 Firebase 설정값 입력
npm run dev
```

## Firebase 설정 방법

1. [Firebase Console](https://console.firebase.google.com)에서 새 프로젝트 생성
2. **Authentication** → 이메일/비밀번호 및 Google 로그인 활성화
3. **Firestore Database** → 데이터베이스 생성 (테스트 모드로 시작)
4. **프로젝트 설정** → 웹 앱 추가 → SDK 설정값을 `.env.local`에 입력
5. **Cloud Messaging** → 웹 푸시 인증서 생성 → VAPID 키를 `.env.local`에 입력

### Firestore 보안 규칙

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.uid;
    }
  }
}
```

## Vercel 배포

1. GitHub에 코드 push
2. [vercel.com](https://vercel.com)에서 GitHub 저장소 연결
3. Environment Variables에 `.env.local`의 값들 입력
4. 배포 완료!
