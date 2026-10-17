import { Alert, Platform, type AlertButton } from 'react-native';

// 웹(브라우저)에서는 Alert.alert 가 아무것도 안 보여줘서, 브라우저 기본 창으로 대신 보여줘요.
// 폰에서는 아무것도 바꾸지 않아요.
if (Platform.OS === 'web') {
  Alert.alert = (title: string, message?: string, buttons?: AlertButton[]) => {
    const text = message ? `${title}\n\n${message}` : title;
    if (!buttons || buttons.length <= 1) {
      window.alert(text);
      buttons?.[0]?.onPress?.();
      return;
    }
    const cancel = buttons.find((b) => b.style === 'cancel');
    const ok = buttons.find((b) => b !== cancel) ?? buttons[buttons.length - 1];
    if (window.confirm(text)) ok.onPress?.();
    else cancel?.onPress?.();
  };
}
