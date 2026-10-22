import React, { useState } from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppButton } from '../components/AppButton';
import { useLoginMutation, useRegisterMutation } from '../services/auth';

const RED = '#C8102E';

export default function AuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; role?: 'owner' | 'walker' }>();

  const isSignup = params.mode === 'signup';
  const selectedRole = params.role ?? 'owner';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useLoginMutation({
    onSuccess: (data) => {
      Alert.alert(
        'Success',
        `Welcome back, ${data.user.full_name || 'Dog Lover'}!`
      );
    },
    onError: (error) => {
      Alert.alert('Login Failed', error.message || 'Unable to log in.');
    },
  });

  const registerMutation = useRegisterMutation({
    onSuccess: (data) => {
      Alert.alert(
        'Account Created',
        `Welcome to PawMate, ${data.user.full_name}!`
      );
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
