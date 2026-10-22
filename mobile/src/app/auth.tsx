import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppButton } from '../components/AppButton';
import { useLoginMutation, useRegisterMutation } from '../services/auth';
import { useAuthStore } from '../store/useAuthStore';

const RED = '#C8102E';

export default function AuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; role?: 'owner' | 'walker' }>();

  const { user, isAuthenticated, logout } = useAuthStore();

  const isSignup = params.mode === 'signup';
  const selectedRole = params.role ?? 'owner';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useLoginMutation({
    onSuccess: (data) => {
      router.replace('/(tabs)');
    },
    onError: (error) => {
      Alert.alert('Login Failed', error.message || 'Unable to log in.');
    },
  });

  const registerMutation = useRegisterMutation({
    onSuccess: (data) => {
      router.replace('/(tabs)');
    },
    onError: (error) => {
      Alert.alert('Registration Failed', error.message || 'Unable to create account.');
    },
  });

  const isPending = loginMutation.isPending || registerMutation.isPending;

  function submit() {
    if (!email.trim() || !password.trim() || (isSignup && !name.trim())) {
      Alert.alert('Missing information', 'Please complete all required fields.');
      return;
    }

    if (isSignup) {
      registerMutation.mutate({
        full_name: name.trim(),
        email: email.trim(),
        password,
        role: selectedRole,
      });
    } else {
      loginMutation.mutate({
        email: email.trim(),
        password,
      });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.formContent}>
        {isAuthenticated && user ? (
          <View style={styles.sessionCard}>
            <Text style={styles.sessionTitle}>Active Session</Text>
            <Text style={styles.sessionUser}>Logged in as: {user.full_name}</Text>
            <Text style={styles.sessionRole}>Role: {user.role === 'owner' ? 'Dog Owner 🐶' : 'Dog Walker 🦮'}</Text>
            <Text style={styles.sessionEmail}>{user.email}</Text>
            <AppButton
              title="Log Out"
              secondary
              onPress={() => {
                logout();
                Alert.alert('Logged Out', 'You have been logged out.');
              }}
            />
          </View>
        ) : null}

        <Text style={styles.title}>
          {isSignup ? 'Create Account' : 'Welcome Back'}
        </Text>
        <Text style={styles.description}>
          {isSignup
            ? `Create your ${selectedRole === 'owner' ? 'Dog Owner' : 'Dog Walker'} account.`
            : 'Log in to continue with PawMate.'}
        </Text>

        {isSignup && (
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor="#999999"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#999999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <AppButton
          title={isSignup ? 'Create Account' : 'Log In'}
          onPress={submit}
          loading={isPending}
        />

        <TouchableOpacity
          style={styles.switchLink}
          onPress={() =>
            router.replace({
              pathname: '/auth',
              params: {
                mode: isSignup ? 'login' : 'signup',
                role: selectedRole,
              },
            })
          }
        >
          <Text style={styles.linkText}>
            {isSignup
              ? 'Already have an account? Log In'
              : 'New to PawMate? Create an Account'}
          </Text>
        </TouchableOpacity>

        <AppButton
          title="Back"
          secondary
          onPress={() => router.back()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  formContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
  },
  sessionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sessionUser: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  sessionRole: {
    fontSize: 14,
    color: RED,
    fontWeight: '600',
    marginTop: 2,
  },
  sessionEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 10,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#242424',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: '#777777',
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 28,
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 15,
    color: '#242424',
    backgroundColor: '#FFFFFF',
  },
  switchLink: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  linkText: {
    color: RED,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
