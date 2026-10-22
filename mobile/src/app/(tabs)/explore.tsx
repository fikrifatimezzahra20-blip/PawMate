import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useWalkersQuery } from '../../services/walkers';
import type { Walker } from '../../services/walkers/types';

const RED = '#C8102E';

export default function ExploreScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterToday, setFilterToday] = useState(false);
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [ratingFilter, setRatingFilter] = useState(false);
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});

  // Query walkers directly from PostgreSQL database via React Query
  const { data: backendWalkers, isLoading, error, refetch } = useWalkersQuery();

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const rawWalkers = backendWalkers?.data || [];

  const filteredWalkers = rawWalkers
    .filter((walker: Walker) => {
      const matchesSearch =
        walker.name.toLowerCase().includes(search.toLowerCase()) ||
        (walker.specialty_tag &&
          walker.specialty_tag.toLowerCase().includes(search.toLowerCase())) ||
        (walker.bio && walker.bio.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;
      if (filterToday && !walker.available) return false;
      if (ratingFilter && Number(walker.rating) < 4.8) return false;
      return true;
    })
    .sort((a: Walker, b: Walker) => {
      const priceA = Number(a.price_per_hour);
      const priceB = Number(b.price_per_hour);
      if (priceSort === 'asc') return priceA - priceB;
      if (priceSort === 'desc') return priceB - priceA;
      return 0;
    });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Brand Header */}
      <View style={styles.brandHeader}>
        <View style={styles.brandLeft}>
          <Text style={styles.brandPaw}>🐾</Text>
          <View>
            <Text style={styles.brandSub}>PAWMATE</Text>
            <Text style={styles.brandTitle}>Explore</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bellButton}>
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.bellDot} />
          </TouchableOpacity>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            }}
            style={styles.userAvatar}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title & Nearby Badge */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={styles.mainTitle}>Find Your Perfect{'\n'}Walker</Text>
            <View style={styles.nearbyBadge}>
              <View style={styles.nearbyDot} />
              <Text style={styles.nearbyText}>
                {rawWalkers.length > 0 ? `${rawWalkers.length} nearby` : '18 nearby'}
              </Text>
            </View>
          </View>
          <Text style={styles.subTitle}>Browse verified local companions</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or area"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {/* Available Today */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterToday && styles.filterChipActive,
            ]}
            onPress={() => setFilterToday(!filterToday)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterChipCheck,
                filterToday && styles.filterChipCheckActive,
              ]}
            >
              ✓
            </Text>
            <Text
              style={[
                styles.filterChipText,
                filterToday && styles.filterChipTextActive,
              ]}
            >
              Available Today
            </Text>
          </TouchableOpacity>

          {/* Price Dropdown */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              priceSort !== 'none' && styles.filterChipActive,
            ]}
            onPress={() => {
              if (priceSort === 'none') setPriceSort('asc');
              else if (priceSort === 'asc') setPriceSort('desc');
              else setPriceSort('none');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.filterChipIcon}>💵</Text>
            <Text
              style={[
                styles.filterChipText,
                priceSort !== 'none' && styles.filterChipTextActive,
              ]}
            >
              Price {priceSort === 'asc' ? '↑' : priceSort === 'desc' ? '↓' : '⌄'}
            </Text>
          </TouchableOpacity>

          {/* 4.8+ Rating */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              ratingFilter && styles.filterChipActive,
            ]}
            onPress={() => setRatingFilter(!ratingFilter)}
            activeOpacity={0.8}
          >
            <Text style={styles.filterChipIcon}>⭐</Text>
            <Text
              style={[
                styles.filterChipText,
                ratingFilter && styles.filterChipTextActive,
              ]}
            >
              4.8+ Rating
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Loading / Error States */}
        {isLoading && (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color={RED} />
            <Text style={styles.stateText}>Loading verified walkers from database...</Text>
          </View>
        )}

        {error && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateErrorText}>
              Unable to reach backend: {error.message}
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Walkers List from Database */}
        {!isLoading && filteredWalkers.length === 0 && !error && (
          <View style={styles.stateContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No walkers found</Text>
            <Text style={styles.stateText}>
              Try clearing filters or search terms.
            </Text>
          </View>
        )}

        <View style={styles.walkersList}>
          {filteredWalkers.map((walker: Walker) => {
            const isFav = !!favorites[walker.id];
            const isVet = walker.badge_type === 'vet';
            const specialty = walker.specialty_tag || 'Certified Walker';
            const isTopRated =
              specialty.toUpperCase() === 'TOP RATED' ||
              specialty.toUpperCase() === 'VET TECH';

            return (
              <View key={walker.id} style={styles.walkerCard}>
                <View style={styles.cardTopRow}>
                  {/* Photo with Overlay Badge */}
                  <View style={styles.avatarWrapper}>
                    <Image
                      source={{
                        uri:
                          walker.photo_url ||
                          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
                      }}
                      style={styles.walkerPhoto}
                    />
                    <View
                      style={[
                        styles.photoBadge,
                        isVet && styles.photoBadgeVet,
                      ]}
                    >
                      <Text style={styles.photoBadgeIcon}>
                        {isVet ? '✚' : '✓'}
                      </Text>
                    </View>
                  </View>

                  {/* Info Column */}
                  <View style={styles.walkerDetails}>
                    <Text style={styles.walkerName}>{walker.name}</Text>
                    <Text style={styles.walkerRating}>
                      ⭐ <Text style={styles.ratingValue}>{Number(walker.rating).toFixed(1)}</Text>{' '}
                      <Text style={styles.reviewsValue}>
                        ({walker.review_count} reviews)
                      </Text>
                    </Text>
                    <Text style={styles.walkerDistance}>
                      📍 {walker.distance_km ?? '0.8'} mi away •{' '}
                      <Text
                        style={[
                          styles.walkerTag,
                          isTopRated && styles.walkerTagRed,
                        ]}
                      >
                        {specialty}
                      </Text>
                    </Text>
                  </View>

                  {/* Favorite Heart Button */}
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(walker.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.favoriteIcon}>
                      {isFav ? '❤️' : '♡'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Bottom Row */}
                <View style={styles.cardBottomRow}>
                  <View
                    style={[
                      styles.availPill,
                      !walker.available && styles.availPillTomorrow,
                    ]}
                  >
                    <Text
                      style={[
                        styles.availPillText,
                        !walker.available && styles.availPillTextTomorrow,
                      ]}
                    >
                      {walker.available ? 'Available Today' : 'Available Tomorrow'}
                    </Text>
                  </View>

                  <View style={styles.priceContainer}>
                    <Text style={styles.priceAmount}>
                      ${Number(walker.price_per_hour).toFixed(0)}
                    </Text>
                    <Text style={styles.priceUnit}>/walk</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.viewProfileBtn}
                    onPress={() =>
                      router.push({
                        pathname: '/walker-details',
                        params: {
                          id: String(walker.id),
                        },
                      })
                    }
                    activeOpacity={0.85}
                  >
                    <Text style={styles.viewProfileText}>View Profile &gt;</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Insured Footer Card */}
        <View style={styles.insuredCard}>
          <View style={styles.insuredShieldCircle}>
            <Text style={styles.insuredShieldIcon}>🛡️</Text>
          </View>
          <View style={styles.insuredInfo}>
            <Text style={styles.insuredTitle}>Every Walk is 100% Insured</Text>
            <Text style={styles.insuredSub}>
              GPS tracked with real-time photo updates and $2M pet insurance.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
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
    position: 'relative',
    padding: 6,
  },
  bellIcon: {
    fontSize: 18,
  },
  bellDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RED,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 24,
  },
  titleSection: {
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 30,
  },
  nearbyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
    marginTop: 4,
  },
  nearbyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: RED,
  },
  nearbyText: {
    fontSize: 11,
    fontWeight: '700',
    color: RED,
  },
  subTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#9CA3AF',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  clearSearch: {
    fontSize: 14,
    color: '#9CA3AF',
    padding: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 14,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#FEE2E2',
    borderColor: RED,
  },
  filterChipCheck: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9CA3AF',
  },
  filterChipCheckActive: {
    color: RED,
  },
  filterChipIcon: {
    fontSize: 13,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  filterChipTextActive: {
    color: RED,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    gap: 8,
  },
  stateText: {
    color: '#6B7280',
    fontSize: 13,
  },
  stateErrorText: {
    color: RED,
    fontSize: 13,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: RED,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  walkersList: {
    gap: 14,
  },
  walkerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  walkerPhoto: {
    width: 68,
    height: 68,
    borderRadius: 14,
  },
  photoBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: RED,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBadgeVet: {
    backgroundColor: '#991B1B',
  },
  photoBadgeIcon: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  walkerDetails: {
    flex: 1,
  },
  walkerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  walkerRating: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  ratingValue: {
    fontWeight: '700',
    color: '#111827',
  },
  reviewsValue: {
    color: '#6B7280',
  },
  walkerDistance: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  walkerTag: {
    fontWeight: '600',
    color: '#4B5563',
  },
  walkerTagRed: {
    color: RED,
    fontWeight: '800',
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
  },
  availPill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  availPillTomorrow: {
    backgroundColor: '#F3F4F6',
  },
  availPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: RED,
  },
  availPillTextTomorrow: {
    color: '#4B5563',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  priceUnit: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  viewProfileBtn: {
    backgroundColor: RED,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
  },
  viewProfileText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  insuredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  insuredShieldCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  insuredShieldIcon: {
    fontSize: 18,
  },
  insuredInfo: {
    flex: 1,
  },
  insuredTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  insuredSub: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
    marginTop: 2,
  },
});
