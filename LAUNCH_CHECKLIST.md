# 출시 전 할 일 목록

## 이메일 인증

- [ ] **SMTP 설정 + 인증 코드 템플릿 적용**
  1. 메일 발송 서비스(예: Resend, SendGrid, AWS SES) 가입 후 SMTP 정보 받기
  2. Supabase > Authentication > Emails > SMTP Settings 에 SMTP 정보 입력
  3. 메일 템플릿 수정 (Authentication > Emails > Templates)
     - "Confirm signup": 본문에 `{{ .Token }}` (6자리 코드) 넣기
     - "Reset Password": 본문에 `{{ .Token }}` 넣기
  4. Supabase > Authentication > Sign In / Providers > Email 에서 **"Confirm email" 켜기**
  5. `src/constants/config.ts` 의 `emailOtp` 를 `true` 로 바꾸기
  6. 폰에서 확인: 가입 → 코드 메일 도착 → 코드 입력 → 로그인 / 비밀번호 재설정

## 빌드

- [ ] **EAS 환경 변수 등록**: `.env.local` 은 클라우드 빌드에 올라가지 않아요. preview/production 빌드 전에 expo.dev > 프로젝트 > Environment variables 에 `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_KEY` 를 등록하기
- [ ] **패키지 이름 확정**: `app.json` 의 `com.dragun.happymine` 은 스토어에 한 번 올리면 바꿀 수 없어요
