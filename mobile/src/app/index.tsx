import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppButton } from '../components/AppButton';

const RED = '#C8102E';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.welcomeContent}>
        <Image
          source={require('../../assets/pawmate.logo.png')}
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
            onPress={() => router.push('/role')}
          />
          <AppButton
            title="Log In"
            secondary
            onPress={() =>
              router.push({
                pathname: '/auth',
                params: { mode: 'login' },
              })
            }
          />
        </View>
      </View>
    </SafeAreaView>
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
});
