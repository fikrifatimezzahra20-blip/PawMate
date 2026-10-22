import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppButton } from '../components/AppButton';

const RED = '#C8102E';

export default function RoleScreen() {
  const router = useRouter();
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
          onPress={() =>
            router.push({
              pathname: '/auth',
              params: { mode: 'signup', role },
            })
          }
        />
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
});
