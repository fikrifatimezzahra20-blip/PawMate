import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { useDogsQuery } from '../services/dogs';
import { useCreateBookingMutation } from '../services/bookings';
import { useWalkerDetailsQuery } from '../services/walkers';
import type { Walker } from '../services/walkers/types';

const RED = '#C8102E';

export default function WalkerDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const walkerId = params.id ? parseInt(params.id, 10) : 8;

  const { user } = useAuthStore();
  const { data: dogsData } = useDogsQuery();

  // Query walker details directly from PostgreSQL via React Query
  const {
    data: walkerResponse,
    isLoading: walkerLoading,
    error: walkerError,
  } = useWalkerDetailsQuery(walkerId);

  const walker: Walker | undefined = walkerResponse?.data;

  // Selection states
  const [selectedService, setSelectedService] = useState<'walk' | 'play'>('walk');
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState<'30' | '60'>('30');
  const [message, setMessage] = useState('');

  // Dates list matching screenshot
  const dateOptions = [
    { label: 'TODAY', day: '18', month: 'May' },
    { label: 'TOMORROW', day: '19', month: 'May' },
    { label: 'MON', day: '20', month: 'May' },
    { label: 'TUE', day: '21', month: 'May' },
  ];

  // Pricing calculations
  const dogWalkingRate = walker ? Number(walker.price_per_hour) : 24;
  const playtimeRate = walker?.playtime_price ? Number(walker.playtime_price) : 20;
  const baseRate = selectedService === 'walk' ? dogWalkingRate : playtimeRate;
  const durationAddedPrice = selectedDuration === '60' ? 12.0 : 0.0;
  const estimatedTotal = (baseRate + durationAddedPrice).toFixed(2);

  const createBookingMutation = useCreateBookingMutation({
    onSuccess: () => {
      Alert.alert(
        'Request Sent! 🐾',
        `Your walk request has been sent to ${walker?.name || 'the walker'}. You won't be charged until it is accepted.`,
        [
          {
            text: 'View Bookings',
            onPress: () => router.push('/(tabs)/bookings'),
          },
        ]
      );
    },
    onError: (err) => {
      Alert.alert('Booking Notice', err.message || 'Could not complete booking request.');
    },
  });

  const handleShare = async () => {
    if (!walker) return;
    try {
      await Share.share({
        message: `Check out ${walker.name} on PawMate! Top-rated dog walker in Austin.`,
      });
    } catch {
      // Ignore dismiss
    }
  };

  const handleRequestWalk = () => {
    if (!walker) return;
    const userDogs = dogsData?.data || [];
    const dogId = userDogs.length > 0 ? userDogs[0].id : 1;
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + selectedDateIdx);
    bookingDate.setHours(10, 0, 0, 0);

    createBookingMutation.mutate({
      walker_id: walker.id,
      dog_id: dogId,
      duration_hours: selectedDuration === '60' ? 1 : 0.5,
      booking_date: bookingDate.toISOString(),
    });
  };

  const firstName = walker?.name ? walker.name.split(' ')[0] : 'Walker';

  if (walkerLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={RED} />
          <Text style={styles.loadingText}>Fetching walker details from database...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (walkerError || !walker) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>
            {walkerError ? walkerError.message : 'Walker profile not found.'}
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
            <Text style={styles.retryBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const tagsList =
    Array.isArray(walker.tags) && walker.tags.length > 0
      ? walker.tags
      : [walker.specialty_tag || 'Certified Walker', 'Top Rated'];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.navTitle}>Walker Details</Text>

        <View style={styles.navRight}>
          <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
            <Text style={styles.shareIcon}>➦</Text>
          </TouchableOpacity>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            }}
            style={styles.navAvatar}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Walker Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeaderRow}>
            {/* Avatar with Verified Badge */}
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri:
                    walker.photo_url ||
                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
                }}
                style={styles.profileAvatar}
              />
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeIcon}>✓</Text>
              </View>
            </View>

            {/* Info Column */}
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>{walker.name}</Text>
                <Text style={styles.pawIcon}>🐾</Text>
              </View>

              <Text style={styles.ratingText}>
                ⭐ <Text style={styles.ratingBold}>{Number(walker.rating).toFixed(1)}</Text>{' '}
                <Text style={styles.reviewCount}>({walker.review_count} reviews)</Text>
              </Text>

              {/* Badges Row */}
              <View style={styles.tagsRow}>
                {tagsList.map((tag, idx) => (
                  <View
                    key={tag}
                    style={[
                      styles.tagPill,
                      idx === 1 && styles.tagPillPink,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        idx === 1 && styles.tagTextPink,
                      ]}
                    >
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Bio */}
          <Text style={styles.bioText}>
            {walker.bio ||
              'Certified dog trainer & lover with extensive experience walking energetic pups, seniors, and rescue dogs.'}
          </Text>

          {/* 3 Stats Boxes */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>EXPERIENCE</Text>
              <Text style={styles.statValue}>{walker.experience || '6+ Years'}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>WALKS</Text>
              <Text style={styles.statValue}>{walker.walks_completed || '1,420+'}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>SAFETY</Text>
              <Text style={[styles.statValue, styles.statValueRed]}>
                {walker.safety_cert || 'CPR Cert'}
              </Text>
            </View>
          </View>
        </View>

        {/* Select Service Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Select Service</Text>
          <Text style={styles.stepText}>Step 1 of 3</Text>
        </View>

        <View style={styles.servicesGrid}>
          {/* Dog Walking Option */}
          <TouchableOpacity
            style={[
              styles.serviceOptionCard,
              selectedService === 'walk' && styles.serviceOptionSelected,
            ]}
            onPress={() => setSelectedService('walk')}
            activeOpacity={0.85}
          >
            <View style={styles.serviceOptionTop}>
              <View
                style={[
                  styles.serviceCircle,
                  selectedService === 'walk'
                    ? styles.serviceCircleActive
                    : styles.serviceCircleInactive,
                ]}
              >
                <Text style={styles.serviceOptionIcon}>🚶</Text>
              </View>

              <View
                style={[
                  styles.radioCircle,
                  selectedService === 'walk' && styles.radioCircleActive,
                ]}
              >
                {selectedService === 'walk' && (
                  <Text style={styles.radioCheck}>✓</Text>
                )}
              </View>
            </View>

            <Text style={styles.serviceOptionTitle}>Dog Walking</Text>
            <Text style={styles.serviceOptionPrice}>
              <Text style={styles.priceNumber}>${dogWalkingRate}</Text>{' '}
              <Text style={styles.priceUnit}>/ walk</Text>
            </Text>
          </TouchableOpacity>

          {/* Playtime Option */}
          <TouchableOpacity
            style={[
              styles.serviceOptionCard,
              selectedService === 'play' && styles.serviceOptionSelected,
            ]}
            onPress={() => setSelectedService('play')}
            activeOpacity={0.85}
          >
            <View style={styles.serviceOptionTop}>
              <View
                style={[
                  styles.serviceCircle,
                  selectedService === 'play'
                    ? styles.serviceCircleActive
                    : styles.serviceCircleInactive,
                ]}
              >
                <Text style={styles.serviceOptionIcon}>🎾</Text>
              </View>

              <View
                style={[
                  styles.radioCircle,
                  selectedService === 'play' && styles.radioCircleActive,
                ]}
              >
                {selectedService === 'play' && (
                  <Text style={styles.radioCheck}>✓</Text>
                )}
              </View>
            </View>

            <Text style={styles.serviceOptionTitle}>Playtime</Text>
            <Text style={styles.serviceOptionPrice}>
              <Text style={styles.priceNumber}>${playtimeRate}</Text>{' '}
              <Text style={styles.priceUnit}>/ session</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Choose Date Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Choose Date</Text>
          <Text style={styles.monthHeader}>May 2024</Text>
        </View>

        <View style={styles.datesRow}>
          {dateOptions.map((item, index) => {
            const isSelected = selectedDateIdx === index;
            return (
              <TouchableOpacity
                key={item.day}
                style={[
                  styles.datePillCard,
                  isSelected && styles.datePillCardSelected,
                ]}
                onPress={() => setSelectedDateIdx(index)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dateLabel,
                    isSelected && styles.dateLabelSelected,
                  ]}
                >
                  {item.label}
                </Text>
                <Text
                  style={[
                    styles.dateNumber,
                    isSelected && styles.dateNumberSelected,
                  ]}
                >
                  {item.day}
                </Text>
                <Text
                  style={[
                    styles.dateMonth,
                    isSelected && styles.dateMonthSelected,
                  ]}
                >
                  {item.month}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Duration Section */}
        <Text style={styles.sectionHeadingMargin}>Duration</Text>
        <View style={styles.durationRow}>
          {/* 30 minutes */}
          <TouchableOpacity
            style={[
              styles.durationPill,
              selectedDuration === '30' && styles.durationPillSelected,
            ]}
            onPress={() => setSelectedDuration('30')}
            activeOpacity={0.85}
          >
            <Text style={styles.clockIcon}>⏱️</Text>
            <Text
              style={[
                styles.durationText,
                selectedDuration === '30' && styles.durationTextSelected,
              ]}
            >
              30 minutes
            </Text>
            <View
              style={[
                styles.smallRadio,
                selectedDuration === '30' && styles.smallRadioActive,
              ]}
            >
              {selectedDuration === '30' && (
                <Text style={styles.smallRadioCheck}>✓</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* 60 minutes */}
          <TouchableOpacity
            style={[
              styles.durationPill,
              selectedDuration === '60' && styles.durationPillSelected,
            ]}
            onPress={() => setSelectedDuration('60')}
            activeOpacity={0.85}
          >
            <Text style={styles.clockIcon}>⏱️</Text>
            <Text
              style={[
                styles.durationText,
                selectedDuration === '60' && styles.durationTextSelected,
              ]}
            >
              60 min (+${durationAddedPrice.toFixed(0)})
            </Text>
            <View
              style={[
                styles.smallRadio,
                selectedDuration === '60' && styles.smallRadioActive,
              ]}
            >
              {selectedDuration === '60' && (
                <Text style={styles.smallRadioCheck}>✓</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Message for Walker */}
        <Text style={styles.sectionHeadingMargin}>Message for {firstName}</Text>
        <View style={styles.messageInputWrapper}>
          <Text style={styles.pencilIcon}>✏️</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Tell us about your dog (breed, energy level, special care notes)..."
            placeholderTextColor="#9CA3AF"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Price Breakdown Card */}
        <View style={styles.breakdownCard}>
          <View style={styles.breakdownLine}>
            <Text style={styles.breakdownLabel}>
              1x {selectedDuration} min{' '}
              {selectedService === 'walk' ? 'Dog Walking' : 'Playtime'}
            </Text>
            <Text style={styles.breakdownValue}>
              ${(baseRate + (selectedDuration === '60' ? 12 : 0)).toFixed(2)}
            </Text>
          </View>

          <View style={styles.breakdownLine}>
            <Text style={styles.breakdownLabel}>Booking & Protection fee</Text>
            <Text style={styles.breakdownFree}>
              $0.00 <Text style={styles.freeHighlight}>FREE</Text>
            </Text>
          </View>

          <View style={styles.breakdownDivider} />

          <View style={styles.breakdownTotalRow}>
            <View>
              <Text style={styles.totalLabel}>ESTIMATED TOTAL</Text>
              <Text style={styles.totalPrice}>${estimatedTotal}</Text>
            </View>

            <View style={styles.guaranteeBadge}>
              <Text style={styles.guaranteeShield}>🛡️</Text>
              <Text style={styles.guaranteeText}>Money-back Guarantee</Text>
            </View>
          </View>
        </View>

        {/* Info Note */}
        <View style={styles.infoNoteRow}>
          <View style={styles.infoCircle}>
            <Text style={styles.infoIcon}>ℹ️</Text>
          </View>
          <Text style={styles.infoNoteText}>
            Your booking is pending until {firstName} accepts your request. You
            won't be charged yet.
          </Text>
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity
          style={[
            styles.requestButton,
            createBookingMutation.isPending && { opacity: 0.7 },
          ]}
          onPress={handleRequestWalk}
          disabled={createBookingMutation.isPending}
          activeOpacity={0.88}
        >
          <Text style={styles.requestButtonCheck}>✓</Text>
          <Text style={styles.requestButtonText}>
            {createBookingMutation.isPending ? 'Sending Request...' : 'Request a Walk'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 14,
    color: RED,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryBtn: {
    backgroundColor: RED,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  backButton: {
    padding: 6,
  },
  backIcon: {
    fontSize: 24,
    color: '#111827',
    fontWeight: '600',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  shareIcon: {
    fontSize: 20,
    color: '#111827',
  },
  navAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: RED,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadgeIcon: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
  },
  pawIcon: {
    fontSize: 16,
    color: RED,
  },
  ratingText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 3,
  },
  ratingBold: {
    fontWeight: '700',
    color: '#111827',
  },
  reviewCount: {
    color: '#6B7280',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  tagPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tagPillPink: {
    backgroundColor: '#FEE2E2',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  tagTextPink: {
    color: RED,
  },
  bioText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  statValueRed: {
    color: RED,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  servicesGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  serviceOptionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  serviceOptionSelected: {
    backgroundColor: '#FFF5F5',
    borderColor: RED,
  },
  serviceOptionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceCircleActive: {
    backgroundColor: '#FEE2E2',
  },
  serviceCircleInactive: {
    backgroundColor: '#F3F4F6',
  },
  serviceOptionIcon: {
    fontSize: 18,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    backgroundColor: RED,
    borderColor: RED,
  },
  radioCheck: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  serviceOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
  },
  serviceOptionPrice: {
    marginTop: 2,
  },
  priceNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: RED,
  },
  priceUnit: {
    fontSize: 12,
    color: '#6B7280',
  },
  monthHeader: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  datePillCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  datePillCardSelected: {
    backgroundColor: RED,
    borderColor: RED,
  },
  dateLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  dateLabelSelected: {
    color: '#FFFFFF',
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginVertical: 1,
  },
  dateNumberSelected: {
    color: '#FFFFFF',
  },
  dateMonth: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  dateMonthSelected: {
    color: '#FFFFFF',
  },
  sectionHeadingMargin: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 20,
    marginBottom: 10,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  durationPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  durationPillSelected: {
    backgroundColor: '#FFF5F5',
    borderColor: RED,
  },
  clockIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  durationText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  durationTextSelected: {
    color: RED,
    fontWeight: '700',
  },
  smallRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallRadioActive: {
    backgroundColor: RED,
    borderColor: RED,
  },
  smallRadioCheck: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  messageInputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pencilIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  messageInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    minHeight: 44,
    textAlignVertical: 'top',
  },
  breakdownCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  breakdownLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  breakdownFree: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  freeHighlight: {
    color: RED,
    fontWeight: '800',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  breakdownTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginTop: 2,
  },
  guaranteeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  guaranteeShield: {
    fontSize: 12,
  },
  guaranteeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
  },
  infoNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  infoCircle: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  infoIcon: {
    fontSize: 14,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  requestButton: {
    backgroundColor: RED,
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  requestButtonCheck: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
