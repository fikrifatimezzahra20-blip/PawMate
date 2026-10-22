import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/useAuthStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const RED = '#C8102E';

// Expo Router provides Stack.Protected for screen guarding
const StackProtect = Stack.Protected;

function NavigationRoot() {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const isAuthRoute = segments[0] === '(tabs)' || segments[0] === 'walker-details';

    if (isAuthenticated && !isAuthRoute) {
      router.replace('/(tabs)');
    } else if (!isAuthenticated && isAuthRoute) {
      router.replace('/');
    }
  }, [isAuthenticated, segments]);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: RED,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <StackProtect guard={!isAuthenticated}>
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="role"
          options={{ title: 'Choose Account Type', headerShown: true }}
        />
        <Stack.Screen
          name="auth"
          options={{ title: 'Account Access', headerShown: true }}
        />
      </StackProtect>

      <StackProtect guard={isAuthenticated}>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="walker-details"
          options={{ headerShown: false }}
        />
      </StackProtect>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <NavigationRoot />
    </QueryClientProvider>
  );
}
