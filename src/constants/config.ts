// 앱 동작을 켜고 끄는 설정 모음.
export const AuthConfig = {
  /**
   * 이메일 6자리 코드 인증 (가입 확인 + 비밀번호 재설정).
   * - false: 개발 단계. Supabase > Authentication > Sign In / Providers > Email 의 "Confirm email" 을 끄고 사용해요.
   *          가입하면 바로 로그인되고, "비밀번호를 잊었어요" 는 숨겨져요.
   * - true : 출시 전. 커스텀 SMTP 연결 + 메일 템플릿에 {{ .Token }} 적용 + "Confirm email" 켜기를 마친 뒤 바꿔요.
   *          (LAUNCH_CHECKLIST.md 참고)
   */
  emailOtp: false,
} as const;
