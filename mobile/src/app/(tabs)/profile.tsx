import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useDogsQuery, useCreateDogMutation } from '../../services/dogs';
import { AppButton } from '../../components/AppButton';

const RED = '#C8102E';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const isOwner = user?.role === 'owner';

  const { data: dogsData, isLoading: dogsLoading } = useDogsQuery();
  const dogs = dogsData?.data || [];

  // Add Dog Modal
  const [showAddDog, setShowAddDog] = useState(false);
  const [dogName, setDogName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [notes, setNotes] = useState('');

  const createDogMutation = useCreateDogMutation({
    onSuccess: () => {
      setShowAddDog(false);
      setDogName('');
      setBreed('');
      setAge('');
      setNotes('');
      Alert.alert('Success', 'Your dog has been added to PawMate!');
    },
    onError: (err) => Alert.alert('Error', err.message),
  });

  function handleAddDogSubmit() {
    if (!dogName.trim()) {
      Alert.alert('Required', 'Please enter your dog’s name.');
      return;
    }

    createDogMutation.mutate({
      name: dogName.trim(),
      breed: breed.trim() || undefined,
      age_years: age ? parseInt(age, 10) : undefined,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Brand Header */}
      <View style={styles.brandHeader}>
        <View style={styles.brandLeft}>
          <Text style={styles.brandPaw}>🐾</Text>
          <View>
            <Text style={styles.brandSub}>PAWMATE</Text>
            <Text style={styles.brandTitle}>Profile</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bellButton}>
            <Text style={styles.bellIcon}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.full_name ? user.full_name[0] : 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.full_name || 'PawMate User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              {user?.role === 'owner' ? '🐶 Dog Owner Account' : '🦮 Dog Walker Account'}
            </Text>
          </View>
        </View>

        {/* If Dog Owner: Dogs Section */}
        {isOwner && (
          <View style={styles.section}>
            <View style={styles.sectionTop}>
              <Text style={styles.sectionTitle}>My Dogs 🐶</Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setShowAddDog(true)}
              >
                <Text style={styles.addBtnText}>+ Add Dog</Text>
              </TouchableOpacity>
            </View>

            {dogsLoading ? (
              <Text style={styles.loadingText}>Loading your pets...</Text>
            ) : dogs.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>🐕</Text>
                <Text style={styles.emptyTitle}>No dogs registered yet</Text>
                <Text style={styles.emptySub}>
                  Add your furry friend so walkers can learn about them!
                </Text>
                <TouchableOpacity
                  style={styles.addDogCta}
                  onPress={() => setShowAddDog(true)}
                >
                  <Text style={styles.addDogCtaText}>Add Your Dog</Text>
                </TouchableOpacity>
              </View>
            ) : (
              dogs.map((dog) => (
                <View key={dog.id} style={styles.dogCard}>
                  <View style={styles.dogAvatar}>
                    <Text style={{ fontSize: 24 }}>🐾</Text>
                  </View>
                  <View style={styles.dogInfo}>
                    <Text style={styles.dogName}>{dog.name}</Text>
                    <Text style={styles.dogBreed}>
                      {dog.breed || 'Mixed breed'} • {dog.age_years ?? 3} yrs old
                    </Text>
                    {dog.notes ? (
                      <Text style={styles.dogNotes} numberOfLines={1}>
                        Note: {dog.notes}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoVal}>October 2026</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Type</Text>
            <Text style={styles.infoVal}>
              {user?.role === 'owner' ? 'Owner' : 'Walker'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoVal, { color: '#10B981', fontWeight: '700' }]}>
              Active Verified
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <AppButton
            title="Log Out of PawMate"
            secondary
            onPress={() => {
              Alert.alert('Log Out', 'Are you sure you want to log out?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Log Out',
                  style: 'destructive',
                  onPress: () => logout(),
                },
              ]);
            }}
          />
        </View>
      </ScrollView>

      {/* Add Dog Modal */}
      <Modal
        visible={showAddDog}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddDog(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add a New Dog 🐾</Text>
              <TouchableOpacity onPress={() => setShowAddDog(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Dog’s Name *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Milo, Bella"
              placeholderTextColor="#9CA3AF"
              value={dogName}
              onChangeText={setDogName}
            />

            <Text style={styles.inputLabel}>Breed</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Golden Retriever, Beagle"
              placeholderTextColor="#9CA3AF"
              value={breed}
              onChangeText={setBreed}
            />

            <Text style={styles.inputLabel}>Age (Years)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 3"
              placeholderTextColor="#9CA3AF"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Special Notes / Habits</Text>
            <TextInput
              style={[styles.modalInput, { height: 70, textAlignVertical: 'top' }]}
              placeholder="Loves fetch, shy around big dogs, etc."
              placeholderTextColor="#9CA3AF"
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            <TouchableOpacity
              style={[
                styles.saveDogBtn,
                createDogMutation.isPending && { opacity: 0.7 },
              ]}
              onPress={handleAddDogSubmit}
              disabled={createDogMutation.isPending}
            >
              <Text style={styles.saveDogBtnText}>
                {createDogMutation.isPending ? 'Saving...' : 'Save Dog'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandPaw: {
    fontSize: 24,
    color: RED,
  },
  brandSub: {
    fontSize: 10,
    fontWeight: '800',
    color: RED,
    letterSpacing: 0.8,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginTop: -2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellButton: {
    padding: 6,
  },
  bellIcon: {
    fontSize: 18,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FDE8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: RED,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: '#FCE7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: RED,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  sectionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  addBtn: {
    backgroundColor: '#FCE7EB',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: RED,
  },
  loadingText: {
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 10,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  emptySub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 12,
  },
  addDogCta: {
    backgroundColor: RED,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addDogCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  dogCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dogAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dogInfo: {
    flex: 1,
  },
  dogName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  dogBreed: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  dogNotes: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  logoutSection: {
    marginTop: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  closeBtn: {
    fontSize: 20,
    color: '#9CA3AF',
    padding: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    marginBottom: 12,
  },
  saveDogBtn: {
    backgroundColor: RED,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveDogBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
