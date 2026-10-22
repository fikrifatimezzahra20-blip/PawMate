import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useBookingsQuery,
  useAcceptBookingMutation,
  useRejectBookingMutation,
} from '../../services/bookings';
import { useAuthStore } from '../../store/useAuthStore';

const RED = '#C8102E';

export default function BookingsScreen() {
  const { user } = useAuthStore();
  const isWalker = user?.role === 'walker';

  const [tab, setTab] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  const { data: bookingsData, isLoading, refetch } = useBookingsQuery();

  const acceptMutation = useAcceptBookingMutation({
    onSuccess: () => {
      Alert.alert('Accepted', 'Walk confirmed!');
      refetch();
    },
    onError: (err) => Alert.alert('Error', err.message),
  });

  const rejectMutation = useRejectBookingMutation({
    onSuccess: () => {
      Alert.alert('Declined', 'Walk declined.');
      refetch();
    },
    onError: (err) => Alert.alert('Error', err.message),
  });

  const bookings = bookingsData?.data || [];

  const filtered = bookings.filter((b) => {
    if (tab === 'all') return true;
    return b.status === tab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Brand Header */}
      <View style={styles.brandHeader}>
        <View style={styles.brandLeft}>
          <Text style={styles.brandPaw}>🐾</Text>
          <View>
            <Text style={styles.brandSub}>PAWMATE</Text>
            <Text style={styles.brandTitle}>Bookings</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bellButton}>
            <Text style={styles.bellIcon}>🔔</Text>
          </TouchableOpacity>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            }}
            style={styles.userAvatar}
          />
        </View>
      </View>

      <View style={styles.header}>
        <Text style={styles.subtitle}>
          {isWalker ? 'Your assigned walks & requests' : 'Your scheduled walks & reservations'}
        </Text>

        <View style={styles.tabRow}>
          {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {isLoading ? (
          <Text style={styles.loadingText}>Loading bookings...</Text>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyView}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptySub}>
              {isWalker
                ? 'When owners book with you, their requests will appear here.'
                : 'Browse walkers and schedule your first happy walk!'}
            </Text>
          </View>
        ) : (
          filtered.map((b) => (
            <View key={b.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.nameRow}>
                  <Text style={styles.cardEmoji}>{isWalker ? '🐶' : '🦮'}</Text>
                  <View>
                    <Text style={styles.partyName}>
                      {isWalker
                        ? `Dog: ${b.dog_name || 'Pet'}`
                        : `Walker: ${b.walker_name || 'Walker'}`}
                    </Text>
                    <Text style={styles.dateText}>
                      📅 {new Date(b.booking_date).toLocaleDateString()} at{' '}
                      {new Date(b.booking_date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(b.status)}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: getStatusColor(b.status) },
                    ]}
                  >
                    {b.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.cardMid}>
                <Text style={styles.durationText}>
                  ⏱️ Duration: {b.duration_hours} hour(s)
                </Text>
                <Text style={styles.priceText}>${b.total_price}</Text>
              </View>

              {/* Walker Action Buttons for Pending Requests */}
              {isWalker && b.status === 'pending' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.btn, styles.acceptBtn]}
                    onPress={() => acceptMutation.mutate(b.id)}
                  >
                    <Text style={styles.btnText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.declineBtn]}
                    onPress={() => rejectMutation.mutate(b.id)}
                  >
                    <Text style={[styles.btnText, { color: '#4B5563' }]}>Decline</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
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
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  tabBtnActive: {
    backgroundColor: RED,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  loadingText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 30,
  },
  emptyView: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  emptySub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  cardEmoji: {
    fontSize: 28,
  },
  partyName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardMid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  durationText: {
    fontSize: 13,
    color: '#4B5563',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    color: RED,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  btn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: '#10B981',
  },
  declineBtn: {
    backgroundColor: '#F3F4F6',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
