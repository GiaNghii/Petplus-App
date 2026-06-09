import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/firestoreService';
import { theme } from '../../utils/theme';
import Header from '../../components/Header';
import ModernCard from '../../components/ModernCard';
import Icon from '../../components/Icon';
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
  pending: { label: 'Chờ xác nhận', color: theme.colors.warning, bg: theme.colors.warningBg },
  confirmed: { label: 'Đã xác nhận', color: theme.colors.info, bg: theme.colors.infoBg },
  completed: { label: 'Hoàn thành', color: theme.colors.success, bg: theme.colors.successBg },
  cancelled: { label: 'Đã hủy', color: theme.colors.danger, bg: theme.colors.dangerBg },
};

const SAMPLE_APPOINTMENTS = [
  {
    id: 'apt_1',
    branchId: 'go-vap',
    doctorId: 'dr-a',
    petName: 'Buddy',
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
      <ModernCard key={apt.id} style={styles.appointmentCard}>
        <View style={styles.aptHeader}>
          <View style={styles.aptPet}>
            <Icon name="paw" size={24} color={theme.colors.primary} />
            <Text style={styles.aptPetName}>{apt.petName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.aptDetails}>
          <View style={styles.aptDetailRow}>
            <Icon name="location" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{BRANCHES[apt.branchId]}</Text>
          </View>
          <View style={styles.aptDetailRow}>
            <Icon name="medical" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{DOCTORS[apt.doctorId]}</Text>
          </View>
          <View style={styles.aptDetailRow}>
            <Icon name="calendar" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{date} • {apt.slot}</Text>
          </View>
          <View style={styles.aptDetailRow}>
            <Icon name="medkit" size={16} color={theme.colors.textSecondary} />
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
      </ModernCard>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Lịch hẹn"
        subtitle={`${upcoming.length} lịch sắp tới`}
        showBack={false}
        rightIcon="add"
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
              <Icon name="calendar-outline" size={64} color={theme.colors.border} style={{ marginBottom: theme.spacing.lg }} />
              <Text style={styles.emptyTitle}>Chưa có lịch hẹn nào</Text>
              <Text style={styles.emptyText}>Đặt lịch khám cho thú cưng của bạn</Text>
              <Button
                title="Đặt lịch ngay"
                onPress={() => navigation.navigate('SelectBranch')}
                icon="add"
                style={{ marginTop: theme.spacing.lg }}
              />
            </View>
          )
        ) : (
          history.length > 0 ? (
            history.map(renderAppointment)
          ) : (
            <View style={styles.empty}>
              <Icon name="calendar" size={64} color={theme.colors.border} style={{ marginBottom: theme.spacing.lg }} />
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
  aptPetName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
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
