import Toast from 'react-native-toast-message';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ShowToastOptions {
  type?: ToastType;
  text1?: string;
  text2?: string;
  position?: 'top' | 'bottom';
  visibilityTime?: number;
  autoHide?: boolean;
  topOffset?: number;
  bottomOffset?: number;
}

/**
 * Custom hook for showing toast messages
 * Toast messages appear in the top right corner by default
 */
export const useToast = () => {
  const showToast = (
    message: string,
    options?: ShowToastOptions
  ) => {
    const {
      type = 'info',
      text1,
      text2,
      position = 'top',
      visibilityTime = 3000,
      autoHide = true,
      topOffset = 60,
      bottomOffset = 40,
    } = options || {};

    Toast.show({
      type,
      text1: text1 || message,
      text2: text2 || undefined,
      position,
      visibilityTime,
      autoHide,
      topOffset,
      bottomOffset,
    });
  };

  const showSuccess = (message: string, text2?: string) => {
    showToast(message, {
      type: 'success',
      text2,
    });
  };

  const showError = (message: string, text2?: string) => {
    showToast(message, {
      type: 'error',
      text2,
    });
  };

  const showInfo = (message: string, text2?: string) => {
    showToast(message, {
      type: 'info',
      text2,
    });
  };

  const showWarning = (message: string, text2?: string) => {
    showToast(message, {
      type: 'warning',
      text2,
    });
  };

  const hide = () => {
    Toast.hide();
  };

  return {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    hide,
  };
};
