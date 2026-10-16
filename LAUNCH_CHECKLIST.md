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
