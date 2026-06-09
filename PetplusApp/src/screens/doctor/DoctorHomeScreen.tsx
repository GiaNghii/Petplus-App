import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../utils/theme';
import Header from '../../components/Header';
import Icon from '../../components/Icon';

const APPOINTMENTS = [
  { id: '1', time: '07:00 - 09:00', pet: 'Buddy', customer: 'Nguyễn Văn C', symptom: 'Ho nhẹ', status: 'waiting' },
  { id: '2', time: '09:00 - 11:00', pet: 'Mèo', customer: 'Trần Thị D', symptom: 'Bỏ ăn', status: 'in_progress' },
  { id: '3', time: '11:00 - 13:00', pet: 'Brown', customer: 'Lê Văn E', symptom: 'Tay chân yếu', status: 'waiting' },
  { id: '4', time: '15:00 - 17:00', pet: 'Mèo Mun', customer: 'Phạm Thị F', symptom: 'Tiêm vaccine', status: 'confirmed' },
];

const TIME_SLOTS = ['07:00 - 09:00', '09:00 - 11:00', '11:00 - 13:00', '13:00 - 15:00', '15:00 - 17:00', '17:00 - 19:00'];

export default function DoctorHomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return theme.colors.warning;
      case 'in_progress': return theme.colors.success;
      case 'confirmed': return theme.colors.info;
      default: return theme.colors.textTertiary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return 'Chờ khám';
      case 'in_progress': return 'Đang khám';
      case 'confirmed': return 'Đã xác nhận';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title={user?.name || 'Bác sĩ'}
        subtitle="Petplus Gò Vấp"
        showBack={false}
        rightIcon="close"
        onRightPress={logout}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statCard}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>Hẹn hôm nay</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.statCard, styles.statCardGreen]}
            onPress={() => navigation.navigate('DoctorChatList')}
          >
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Đang tư vấn</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          {[
            { id: 'schedule', label: 'Lịch hẹn' },
            { id: 'patients', label: 'Bệnh nhân' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'schedule' && (
          <View style={styles.content}>
            <Text style={styles.dateTitle}>Thứ 7, 06/06/2026</Text>
            {TIME_SLOTS.map((slot) => {
              const slotAppointments = APPOINTMENTS.filter(a => a.time === slot);
              return (
                <View key={slot} style={styles.timeSlotCard}>
                  <View style={styles.slotHeader}>
                    <View style={styles.slotTimeRow}>
                      <Icon name="calendar" size={14} color={theme.colors.textPrimary} />
                      <Text style={styles.slotTime}>{slot}</Text>
                    </View>
                    <Text style={styles.slotCount}>
                      {slotAppointments.length}/3 bệnh nhân
                    </Text>
                  </View>
                  {slotAppointments.length === 0 ? (
                    <View style={styles.emptySlot}>
                      <Text style={styles.emptySlotText}>Chưa có bệnh nhân</Text>
                    </View>
                  ) : (
                    slotAppointments.map((apt) => (
                      <TouchableOpacity key={apt.id} style={styles.appointmentCard}>
                        <View style={styles.petAvatar}>
                          <Icon name="paw" size={24} color={theme.colors.warning} />
                        </View>
                        <View style={styles.aptInfo}>
                          <Text style={styles.petName}>{apt.pet} - Chủ: {apt.customer}</Text>
                          <View style={styles.symptomRow}>
                            <Icon name="search" size={12} color={theme.colors.textSecondary} />
                            <Text style={styles.symptom}>{apt.symptom}</Text>
                          </View>
                          <View style={styles.statusRow}>
                            <View style={[
                              styles.statusBadge,
                              { backgroundColor: getStatusColor(apt.status) }
                            ]}>
                              <Text style={styles.statusText}>
                                {getStatusText(apt.status)}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <TouchableOpacity style={styles.startButton}>
                          <Text style={styles.startButtonText}>Bắt đầu</Text>
                          <Icon name="arrow-forward" size={12} color={theme.colors.textOnPrimary} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              );
            })}
          </View>
        )}

        {activeTab === 'patients' && (
          <View style={styles.content}>
            <View style={styles.searchBox}>
              <Icon name="search" size={18} color={theme.colors.textTertiary} />
              <Text style={styles.searchPlaceholder}>Tìm kiếm bệnh nhân...</Text>
            </View>
            {APPOINTMENTS.map((apt) => (
              <TouchableOpacity key={apt.id} style={styles.patientCard}>
                <View style={styles.petAvatar}>
                  <Icon name="paw" size={24} color={theme.colors.warning} />
                </View>
                <View style={styles.aptInfo}>
                  <Text style={styles.petName}>{apt.pet}</Text>
                  <Text style={styles.symptom}>Chủ: {apt.customer}</Text>
                  <View style={styles.symptomRow}>
                    <Icon name="calendar" size={12} color={theme.colors.textSecondary} />
                    <Text style={styles.symptom}>{apt.time}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
  statsRow: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    ...theme.shadow.sm,
  },
  statCardGreen: {
    backgroundColor: theme.colors.primaryBg,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primaryDarker,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
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
  },
  tabTextActive: {
    color: theme.colors.primaryDarker,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  dateTitle: {
    ...theme.typography.h4,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  timeSlotCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadow.sm,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.warningBg,
  },
  slotTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  slotTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  slotCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  emptySlot: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  emptySlotText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    margin: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  petAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.warningBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  aptInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  symptom: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  statusRow: {
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: theme.colors.textOnPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  startButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceAlt,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.lg,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    marginLeft: 8,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadow.sm,
  },
});