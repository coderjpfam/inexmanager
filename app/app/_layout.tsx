import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import 'react-native-reanimated';

import { useEffect } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ToastConfig } from '@/components/toast-config';
import { AuthGuard } from '@/components/auth-guard';
import { AppErrorBoundary } from '@/components/error-boundary';
import { NetworkStatus } from '@/components/network-status';
import { initializeDeepLinking } from '@/utils/deep-linking';
import { store, persistor } from '@/store';
import { View, ActivityIndicator } from 'react-native';

export const unstable_settings = {
  initialRouteName: '(auth)/sign-in',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Initialize deep linking
  useEffect(() => {
    const cleanup = initializeDeepLinking();
    return cleanup;
  }, []);

  return (
    <AppErrorBoundary>
      <Provider store={store}>
        <PersistGate
          loading={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" />
            </View>
          }
          persistor={persistor}
        >
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AuthGuard>
              <Stack>
                <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)/sign-up" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)/forgot-password" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)/reset-password" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)/verify-account" options={{ headerShown: false }} />
                <Stack.Screen name="(main)/dashboard" options={{ headerShown: false }} />
              </Stack>
            </AuthGuard>
            <StatusBar style="auto" />
            <ToastConfig />
            <NetworkStatus />
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </AppErrorBoundary>
  );
}
