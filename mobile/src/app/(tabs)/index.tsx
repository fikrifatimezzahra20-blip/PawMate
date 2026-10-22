import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { useWalkersQuery } from '../../services/walkers';
import {
  useBookingsQuery,
  useAcceptBookingMutation,
  useRejectBookingMutation,
  useCreateBookingMutation,
} from '../../services/bookings';
import { useDogsQuery } from '../../services/dogs';
import type { Walker } from '../../services/walkers/types';

const RED = '#C8102E';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isWalker = user?.role === 'walker';

  // React Queries directly from PostgreSQL database
  const { data: walkersData, isLoading: walkersLoading } = useWalkersQuery();
  const { data: bookingsData } = useBookingsQuery();
  const { data: dogsData } = useDogsQuery();

  // Booking Mutations
  const acceptBookingMutation = useAcceptBookingMutation({
    onSuccess: () => Alert.alert('Accepted', 'Walk has been confirmed!'),
    onError: (err) => Alert.alert('Error', err.message),
  });

  const rejectBookingMutation = useRejectBookingMutation({
    onSuccess: () => Alert.alert('Declined', 'Walk request has been declined.'),
    onError: (err) => Alert.alert('Error', err.message),
  });

  const createBookingMutation = useCreateBookingMutation({
    onSuccess: () => {
      setSelectedWalker(null);
      Alert.alert('Booking Request Sent!', 'The walker has received your request.');
    },
    onError: (err) => Alert.alert('Booking Failed', err.message),
  });

  // Booking Modal State
  const [selectedWalker, setSelectedWalker] = useState<Walker | null>(null);
  const [durationHours, setDurationHours] = useState('1');

  // Walkers list directly from database
  const displayWalkers = walkersData?.data || [];

  const bookings = bookingsData?.data || [];
  const pendingRequests = bookings.filter((b) => b.status === 'pending');
  const userDogs = dogsData?.data || [];

  function handleQuickBook() {
    if (!selectedWalker) return;
    const dogId = userDogs.length > 0 ? userDogs[0].id : 1;
    const hours = parseFloat(durationHours) || 1;

    // Date tomorrow at 10 AM
    const bookingDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    bookingDate.setHours(10, 0, 0, 0);

    createBookingMutation.mutate({
      walker_id: selectedWalker.id,
      dog_id: dogId,
      duration_hours: hours,
      booking_date: bookingDate.toISOString(),
    });
  }

  // -------------------------------------------------------------------------
  // WALKER VIEW
  // -------------------------------------------------------------------------
  if (isWalker) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.brandRow}>
              <Text style={styles.pawIcon}>🐾</Text>
              <View>
                <Text style={styles.brandSub}>PAWMATE WALKER</Text>
                <Text style={styles.brandTitle}>Dashboard</Text>
              </View>
            </View>
            <View style={styles.topActions}>
              <TouchableOpacity style={styles.bellBtn}>
                <Text style={styles.bellIcon}>🔔</Text>
                {pendingRequests.length > 0 && <View style={styles.dotBadge} />}
              </TouchableOpacity>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.full_name ? user.full_name[0] : 'W'}
                </Text>
              </View>
            </View>
          </View>

          {/* Greeting */}
          <View style={styles.greetingSection}>
            <Text style={styles.dayText}>TODAY’S OVERVIEW</Text>
            <View style={styles.helloRow}>
              <Text style={styles.nameText}>
                Good day, {user?.full_name?.split(' ')[0] || 'Walker'}! 🦮
              </Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.statusText, { color: '#2E7D32' }]}>
                🟢 Accepting Walk Requests
              </Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{pendingRequests.length}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>
                {bookings.filter((b) => b.status === 'confirmed').length}
              </Text>
              <Text style={styles.statLabel}>Confirmed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>⭐ 5.0</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>

          {/* Pending Walk Requests */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Incoming Walk Requests{' '}
              <Text style={{ color: RED }}>({pendingRequests.length})</Text>
            </Text>
          </View>

          {pendingRequests.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🐕</Text>
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySub}>
                New walk requests from pet owners will appear here.
              </Text>
            </View>
          ) : (
            pendingRequests.map((req) => (
              <View key={req.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestDog}>🐶 {req.dog_name || 'Dog'}</Text>
                  <Text style={styles.requestPrice}>${req.total_price}</Text>
                </View>
                <Text style={styles.requestDate}>
                  📅 {new Date(req.booking_date).toLocaleDateString()} at{' '}
                  {new Date(req.booking_date).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Text style={styles.requestDuration}>
                  Duration: {req.duration_hours} hour(s)
                </Text>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.acceptBtn]}
                    onPress={() => acceptBookingMutation.mutate(req.id)}
                  >
                    <Text style={styles.actionBtnText}>Accept Walk</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => rejectBookingMutation.mutate(req.id)}
                  >
                    <Text style={[styles.actionBtnText, { color: '#666' }]}>
                      Decline
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------------------
  // OWNER VIEW (MATCHES SCREENSHOT)
  // -------------------------------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <Text style={styles.pawIcon}>🐾</Text>
            <View>
              <Text style={styles.brandSub}>PAWMATE</Text>
              <Text style={styles.brandTitle}>Home</Text>
            </View>
          </View>

          <View style={styles.topActions}>
            <TouchableOpacity style={styles.bellBtn}>
              <Text style={styles.bellIcon}>🔔</Text>
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.full_name ? user.full_name[0] : 'A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Greeting Banner */}
        <View style={styles.greetingSection}>
          <Text style={styles.dayText}>HAPPY TUESDAY</Text>
          <View style={styles.helloRow}>
            <Text style={styles.nameText}>
              Good morning, {user?.full_name?.split(' ')[0] || 'Alex'}! 🐾
            </Text>
            <View style={styles.statusPill}>
              <View style={styles.redDot} />
              <Text style={styles.statusText}>
                {userDogs[0]?.name ? `${userDogs[0].name} is resting` : 'Milo is resting'}
              </Text>
            </View>
          </View>

          {/* Location Selector */}
          <TouchableOpacity style={styles.locationDropdown}>
            <Text style={styles.locationText}>📍 Austin, TX (Downtown) ⌵</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <Image
            source={require('../../../assets/hero_banner.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <View style={styles.topRatedBadge}>
              <Text style={styles.topRatedText}>🛡️ TOP RATED WALKERS</Text>
            </View>
            <Text style={styles.heroTitle}>Your dog deserves a great day.</Text>
            <Text style={styles.heroSubtitle}>
              Find a trusted, background-checked walker near you.
            </Text>

            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => router.push('/(tabs)/explore')}
              activeOpacity={0.85}
            >
              <Text style={styles.heroButtonText}>Find a Dog Walker →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Service Categories */}
        <View style={styles.servicesRow}>
          {/* Service 1 */}
          <View style={styles.serviceCard}>
            <View style={styles.serviceTop}>
              <View style={styles.serviceIconContainer}>
                <Text style={styles.serviceIcon}>🚶</Text>
              </View>
              <View style={styles.badgePopular}>
                <Text style={styles.badgeTextPopular}>Popular</Text>
              </View>
            </View>
            <Text style={styles.serviceTitle}>Dog Walking</Text>
            <Text style={styles.serviceSub}>Solo or pack strolls</Text>
            <View style={styles.servicePriceRow}>
              <Text style={styles.fromText}>FROM</Text>
              <Text style={styles.priceHighlight}>
                $20<Text style={styles.unitText}>/30m</Text>
              </Text>
            </View>
          </View>

          {/* Service 2 */}
          <View style={styles.serviceCard}>
            <View style={styles.serviceTop}>
              <View style={styles.serviceIconContainer}>
                <Text style={styles.serviceIcon}>🎾</Text>
              </View>
              <View style={styles.badgeBackyard}>
                <Text style={styles.badgeTextBackyard}>Backyard</Text>
              </View>
            </View>
            <Text style={styles.serviceTitle}>Playtime</Text>
            <Text style={styles.serviceSub}>Fetch & mental games</Text>
            <View style={styles.servicePriceRow}>
              <Text style={styles.fromText}>FROM</Text>
              <Text style={styles.priceHighlight}>
                $18<Text style={styles.unitText}>/30m</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Top Walkers Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Top Walkers Near You</Text>
            <View style={styles.titleDot} />
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
            <Text style={styles.seeAllText}>See all &gt;</Text>
          </TouchableOpacity>
        </View>

        {/* Walkers List */}
        {displayWalkers.map((walker) => (
          <View key={walker.id} style={styles.walkerCard}>
            <View style={styles.walkerMainRow}>
              {/* Avatar with Online Dot */}
              <View style={styles.walkerAvatarWrapper}>
                <Image
                  source={{
                    uri:
                      walker.photo_url ||
                      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
                  }}
                  style={styles.walkerAvatar}
                />
                <View style={styles.onlineDot} />
              </View>

              {/* Info */}
              <View style={styles.walkerInfo}>
                <Text style={styles.walkerName}>{walker.name}</Text>
                <Text style={styles.walkerRating}>
                  ⭐ {Number(walker.rating).toFixed(1)}{' '}
                  <Text style={styles.reviewCount}>({walker.review_count} reviews)</Text>
                </Text>
                <Text style={styles.walkerDistance}>
                  📍 {walker.distance_km ?? 0.8} miles away • Downtown
                </Text>
              </View>

              {/* Price */}
              <View style={styles.walkerPriceCol}>
                <Text style={styles.walkerPrice}>${walker.price_per_hour}</Text>
                <Text style={styles.walkerPriceUnit}>/walk</Text>
              </View>
            </View>

            {/* Bottom Actions */}
            <View style={styles.walkerCardBottom}>
              <View style={styles.availablePill}>
                <Text style={styles.availableText}>⏰ Available Today</Text>
              </View>

              <TouchableOpacity
                style={styles.viewProfileBtn}
                onPress={() =>
                  router.push({
                    pathname: '/walker-details',
                    params: {
                      id: String(walker.id),
                      name: walker.name,
                      photo_url: walker.photo_url || '',
                      price: String(walker.price_per_hour),
                    },
                  })
                }
              >
                <Text style={styles.viewProfileText}>View Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Quick Booking Modal */}
      <Modal
        visible={!!selectedWalker}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedWalker(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book with {selectedWalker?.name}</Text>
              <TouchableOpacity onPress={() => setSelectedWalker(null)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalBio}>{selectedWalker?.bio}</Text>

            <Text style={styles.modalLabel}>Walk Duration (Hours)</Text>
            <TextInput
              style={styles.modalInput}
              value={durationHours}
              onChangeText={setDurationHours}
              keyboardType="numeric"
              placeholder="1"
            />

            <View style={styles.modalTotalRow}>
              <Text style={styles.modalTotalLabel}>Estimated Total:</Text>
              <Text style={styles.modalTotalPrice}>
                $
                {((selectedWalker?.price_per_hour ? Number(selectedWalker.price_per_hour) : 20) *
                  (parseFloat(durationHours) || 1)).toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.confirmBookingBtn,
                createBookingMutation.isPending && { opacity: 0.7 },
              ]}
              onPress={handleQuickBook}
              disabled={createBookingMutation.isPending}
            >
              <Text style={styles.confirmBookingText}>
                {createBookingMutation.isPending ? 'Sending Request...' : 'Confirm Walk Request'}
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pawIcon: {
    fontSize: 28,
  },
  brandSub: {
    fontSize: 10,
    fontWeight: '800',
    color: RED,
    letterSpacing: 1,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  bellIcon: {
    fontSize: 18,
  },
  dotBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RED,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  greetingSection: {
    marginBottom: 16,
  },
  dayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  helloRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCE7EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 6,
  },
  redDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: RED,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: RED,
  },
  locationDropdown: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 220,
    marginBottom: 20,
    backgroundColor: '#1F2937',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    padding: 18,
    justifyContent: 'flex-end',
  },
  topRatedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  topRatedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: '#E5E7EB',
    fontSize: 13,
    marginBottom: 14,
  },
  heroButton: {
    backgroundColor: RED,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  servicesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  serviceCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  serviceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FDE8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceIcon: {
    fontSize: 18,
  },
  badgePopular: {
    backgroundColor: '#FDE8E8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeTextPopular: {
    color: RED,
    fontSize: 10,
    fontWeight: '700',
  },
  badgeBackyard: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeTextBackyard: {
    color: '#4B5563',
    fontSize: 10,
    fontWeight: '700',
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  serviceSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 12,
  },
  servicePriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  fromText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  priceHighlight: {
    fontSize: 15,
    fontWeight: '800',
    color: RED,
  },
  unitText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  titleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: RED,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: RED,
  },
  walkerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  walkerMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  walkerAvatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  walkerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E5E7EB',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  walkerInfo: {
    flex: 1,
  },
  walkerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  walkerRating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  reviewCount: {
    color: '#6B7280',
    fontWeight: '400',
  },
  walkerDistance: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  walkerPriceCol: {
    alignItems: 'flex-end',
  },
  walkerPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: RED,
  },
  walkerPriceUnit: {
    fontSize: 11,
    color: '#6B7280',
  },
  walkerCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  availablePill: {
    backgroundColor: '#FCE7EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  availableText: {
    fontSize: 11,
    fontWeight: '600',
    color: RED,
  },
  viewProfileBtn: {
    backgroundColor: RED,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  viewProfileText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  emptySub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  requestDog: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  requestPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: RED,
  },
  requestDate: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 2,
  },
  requestDuration: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: '#10B981',
  },
  rejectBtn: {
    backgroundColor: '#F3F4F6',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
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
    marginBottom: 12,
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
  modalBio: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 16,
  },
  modalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTotalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  modalTotalPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: RED,
  },
  confirmBookingBtn: {
    backgroundColor: RED,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBookingText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
