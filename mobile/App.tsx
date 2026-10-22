
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLoginMutation, useRegisterMutation } from './services/auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

type RootStackParamList = {
  Welcome: undefined;
  Auth: { mode: 'signup' | 'login'; role?: 'owner' | 'walker' };
  Role: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RED = '#C8102E';

function WelcomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.welcomeContent}>
        <Image
          source={require('./assets/pawmate.logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Welcome to PawMate</Text>
        <Text style={styles.subtitle}>Your Dog’s Best Friend</Text>

        <Text style={styles.description}>
          Find trusted dog walkers and give your best friend
          the happy walks they deserve.
        </Text>

        <View style={styles.actions}>
          <AppButton
            title="Create an Account"
            onPress={() => navigation.navigate('Role')}
          />
          <AppButton
            title="Log In"
            secondary
            onPress={() => navigation.navigate('Auth', { mode: 'login' })}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function AppButton({ title, onPress, secondary = false, loading = false }: any) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        secondary && styles.secondaryButton,
        loading && { opacity: 0.7 },
      ]}
      onPress={loading ? undefined : onPress}
      activeOpacity={0.8}
      disabled={loading}
    >
      <Text style={[styles.buttonText, secondary && styles.secondaryText]}>
        {loading ? 'Please wait...' : title}
      </Text>
    </TouchableOpacity>
  );
}

function RoleScreen({ navigation }: any) {
  const [role, setRole] = useState<'owner' | 'walker'>('owner');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.formContent}>
        <Text style={styles.title}>Join PawMate</Text>
        <Text style={styles.description}>
          First, tell us how you want to use PawMate.
        </Text>

        <TouchableOpacity
          style={[styles.roleCard, role === 'owner' && styles.selectedCard]}
          onPress={() => setRole('owner')}
        >
          <Text style={styles.roleEmoji}>🐶</Text>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>Dog Owner</Text>
            <Text style={styles.fieldHint}>Find a walker for your dog.</Text>
          </View>
          <Text style={styles.radio}>{role === 'owner' ? '●' : '○'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleCard, role === 'walker' && styles.selectedCard]}
          onPress={() => setRole('walker')}
        >
          <Text style={styles.roleEmoji}>🦮</Text>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>Dog Walker</Text>
            <Text style={styles.fieldHint}>Accept walks and care for dogs.</Text>
          </View>
          <Text style={styles.radio}>{role === 'walker' ? '●' : '○'}</Text>
        </TouchableOpacity>

        <AppButton
          title="Continue"
          onPress={() => navigation.navigate('Auth', { mode: 'signup', role })}
        />
        <AppButton
          title="Back"
          secondary
          onPress={() => navigation.goBack()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function AuthScreen({ route, navigation }: any) {
  const isSignup = route.params?.mode === 'signup';
  const selectedRole = route.params?.role ?? 'owner';

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
            navigation.replace('Auth', {
              mode: isSignup ? 'login' : 'signup',
              role: selectedRole,
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
          onPress={() => navigation.goBack()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{
            headerStyle: { backgroundColor: '#FFFFFF' },
            headerTintColor: RED,
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: '#FFFFFF' },
          }}
        >
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Role"
            component={RoleScreen}
            options={{ title: 'Choose Account Type' }}
          />
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={({ route }: any) => ({
              title: route.params?.mode === 'signup' ? 'Sign Up' : 'Log In',
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 20,
  },
  logo: {
    width: '100%',
    height: 220,
    marginBottom: 20,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#242424',
    textAlign: 'center',
  },
  subtitle: {
    color: RED,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
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
  actions: {
    width: '100%',
    gap: 14,
  },
  button: {
    width: '100%',
    minHeight: 54,
    backgroundColor: RED,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: RED,
  },
  secondaryText: {
    color: RED,
  },
  formContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 15,
    padding: 16,
    marginTop: 14,
    marginBottom: 4,
  },
  selectedCard: {
    borderColor: RED,
    backgroundColor: '#FFF3F5',
  },
  roleEmoji: {
    fontSize: 30,
    marginRight: 14,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    color: '#242424',
    fontSize: 16,
    fontWeight: '700',
  },
  fieldHint: {
    color: '#777777',
    fontSize: 13,
    marginTop: 5,
  },
  radio: {
    color: RED,
    fontSize: 22,
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
