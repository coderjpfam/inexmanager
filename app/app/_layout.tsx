import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ToastConfig } from '@/components/toast-config';
import { AuthGuard } from '@/components/auth-guard';
import { AppErrorBoundary } from '@/components/error-boundary';
import { store } from '@/store';

export const unstable_settings = {
  initialRouteName: '(auth)/sign-in',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppErrorBoundary>
      <Provider store={store}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthGuard>
            <Stack>
              <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/sign-up" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/forgot-password" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/reset-password" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/verify-account" options={{ headerShown: false }} />
              <Stack.Screen name="(main)/dashboard" options={{ headerShown: false }} />
              <Stack.Screen name="auth" options={{ headerShown: false }} />
            </Stack>
          </AuthGuard>
          <StatusBar style="auto" />
          <ToastConfig />
        </ThemeProvider>
      </Provider>
    </AppErrorBoundary>
  );
}
