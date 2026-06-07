import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/firestoreService';
import { theme } from '../../utils/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';

const BRANCHES: Record<string, string> = {
  'go-vap': 'Petplus Gò Vấp',
  'quan-11': 'Petplus Quận 11',
  'quan-12': 'Petplus Quận 12',
};

const DOCTORS: Record<string, string> = {
  'dr-a': 'BS. Nguyễn Văn A',
  'dr-b': 'BS. Trần Thị B',
  'dr-c': 'BS. Lê Văn C',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Chờ xác nhận', color: '#F57C00', bg: '#FFF3E0' },
  confirmed: { label: 'Đã xác nhận', color: '#1976D2', bg: '#E3F2FD' },
  completed: { label: 'Hoàn thành', color: '#2E7D32', bg: '#E8F5E9' },
  cancelled: { label: 'Đã hủy', color: '#D32F2F', bg: '#FFEBEE' },
};

// Sample data for demo
const SAMPLE_APPOINTMENTS = [
  {
    id: 'apt_1',
    branchId: 'go-vap',
    doctorId: 'dr-a',
    petName: 'Buddy',
    petEmoji: '🐕',
    dateTime: new Date('2026-06-10T10:00:00'),
    slot: '10:00 - 12:00',
    status: 'confirmed',
    service: 'Khám tổng quát',
  },
  {
    id: 'apt_2',
    branchId: 'quan-11',
    doctorId: 'dr-b',
    petName: 'Mèo',
    petEmoji: '🐈',
    dateTime: new Date('2026-06-15T14:00:00'),
    slot: '14:00 - 16:00',
    status: 'pending',
    service: 'Tiêm phòng',
  },
  {
    id: 'apt_3',
    branchId: 'go-vap',
    doctorId: 'dr-a',
    petName: 'Buddy',
    petEmoji: '',
    dateTime: new Date('2026-05-20T09:00:00'),
    slot: '09:00 - 11:00',
    status: 'completed',
    service: 'Siêu âm',
  },
];

export default function ScheduleScreen({ navigation }: any) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>(SAMPLE_APPOINTMENTS);
  const [activeTab, setActiveTab] = useState('upcoming');

  const upcoming = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
  const history = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  const handleCancel = (apt: any) => {
    Alert.alert(
      'Hủy lịch hẹn?',
      `Bạn có chắc muốn hủy lịch khám của ${apt.petName} vào ${apt.slot}?`,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy lịch',
          style: 'destructive',
          onPress: () => {
            setAppointments(prev =>
              prev.map(a => a.id === apt.id ? { ...a, status: 'cancelled' } : a)
            );
            Alert.alert('Đã hủy', `Lịch khám của ${apt.petName} đã được hủy`);
          },
        },
      ]
    );
  };

  const renderAppointment = (apt: any) => {
    const status = STATUS_CONFIG[apt.status];
    const date = apt.dateTime?.toLocaleDateString?.('vi-VN') || 'dd/mm/yyyy';
    
    return (
      <Card key={apt.id} style={styles.appointmentCard}>
        <View style={styles.aptHeader}>
          <View style={styles.aptPet}>
            <Text style={styles.aptPetEmoji}>{apt.petEmoji}</Text>
            <Text style={styles.aptPetName}>{apt.petName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.aptDetails}>
          <View style={styles.aptDetailRow}>
            <Text style={styles.detailIcon}></Text>
            <Text style={styles.detailText}>{BRANCHES[apt.branchId]}</Text>
          </View>
          <View style={styles.aptDetailRow}>
            <Text style={styles.detailIcon}>👨‍️</Text>
            <Text style={styles.detailText}>{DOCTORS[apt.doctorId]}</Text>
          </View>
          <View style={styles.aptDetailRow}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>{date} • {apt.slot}</Text>
          </View>
          <View style={styles.aptDetailRow}>
            <Text style={styles.detailIcon}>🩺</Text>
            <Text style={styles.detailText}>{apt.service}</Text>
          </View>
        </View>

        {apt.status === 'pending' || apt.status === 'confirmed' ? (
          <View style={styles.aptActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancel(apt)}
            >
              <Text style={styles.cancelButtonText}>Hủy lịch</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.detailButton]}>
              <Text style={styles.detailButtonText}>Chi tiết</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.aptActions}>
            <TouchableOpacity style={[styles.actionButton, styles.rebookButton]}>
              <Text style={styles.rebookButtonText}>Đặt lại</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Lịch hẹn"
        subtitle={`${upcoming.length} lịch sắp tới`}
        showBack={false}
        rightIcon="➕"
        onRightPress={() => navigation.navigate('SelectBranch')}
      />

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Sắp tới ({upcoming.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Lịch sử ({history.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {activeTab === 'upcoming' ? (
          upcoming.length > 0 ? (
            upcoming.map(renderAppointment)
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>Chưa có lịch hẹn nào</Text>
              <Text style={styles.emptyText}>Đặt lịch khám cho thú cưng của bạn</Text>
              <Button
                title="Đặt lịch ngay"
                onPress={() => navigation.navigate('SelectBranch')}
                icon="➕"
                style={{ marginTop: theme.spacing.lg }}
              />
            </View>
          )
        ) : (
          history.length > 0 ? (
            history.map(renderAppointment)
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>Chưa có lịch sử</Text>
              <Text style={styles.emptyText}>Lịch sử khám sẽ hiển thị ở đây</Text>
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: theme.colors.primaryDarker,
    fontWeight: '600',
  },
  content: {
    padding: theme.spacing.lg,
  },
  appointmentCard: {
    marginBottom: theme.spacing.md,
  },
  aptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  aptPet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  aptPetEmoji: {
    fontSize: 24,
  },
  aptPetName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.round,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  aptDetails: {
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  aptDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  detailIcon: {
    fontSize: 16,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  aptActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.dangerBg,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.danger,
  },
  detailButton: {
    backgroundColor: theme.colors.primaryBg,
  },
  detailButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primaryDarker,
  },
  rebookButton: {
    backgroundColor: theme.colors.primary,
  },
  rebookButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textOnPrimary,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: theme.spacing.huge,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
