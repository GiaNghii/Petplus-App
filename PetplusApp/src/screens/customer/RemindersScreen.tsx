import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';
import Header from '../../components/Header';

export default function RemindersScreen({ navigation }: any) {
  const reminders = [
    {
      id: '1',
      pet: 'Buddy',
      type: 'checkup',
      title: '📅 Lịch khám hôm nay',
      time: '14:00 - 16:00',
      branch: 'Petplus Gò Vấp',
      doctor: 'BS. Nguyễn Văn A',
      urgent: true,
    },
    {
      id: '2',
      pet: 'Mèo',
      type: 'medicine',
      title: '💊 Nhắc uống thuốc',
      time: '20:00 hôm nay',
      medicine: 'Thuốc kháng sinh Amoxicillin',
      dosage: '1 viên',
      urgent: false,
    },
    {
      id: '3',
      pet: 'Buddy',
      type: 'vaccination',
      title: '💉 Lịch tiêm vaccine nhắc lại',
      time: '10/06/2026',
      vaccine: 'Vaccine dại (lần 3)',
      urgent: false,
    },
    {
      id: '4',
      pet: 'Buddy',
      type: 'deworming',
      title: '🐛 Lịch tẩy giun',
      time: '12/06/2026',
      urgent: false,
    },
    {
      id: '5',
      pet: 'Mèo',
      type: 'diet',
      title: '🍖 Thay đổi khẩu phần ăn',
      time: '15/06/2026',
      note: 'Mèo đã 2 tuổi, chuyển sang thức ăn cho mèo trưởng thành',
      urgent: false,
    },
  ];

  const today = reminders.filter(r => r.urgent);
  const upcoming = reminders.filter(r => !r.urgent);

  const renderReminder = (reminder: any) => (
    <View key={reminder.id} style={styles.reminderCard}>
      <View style={styles.reminderHeader}>
        <Text style={styles.petName}>🐕 {reminder.pet}</Text>
        <Text style={styles.reminderTime}>{reminder.time}</Text>
      </View>
      <Text style={styles.reminderTitle}>{reminder.title}</Text>
      
      {reminder.branch && (
        <Text style={styles.reminderDetail}>📍 {reminder.branch}</Text>
      )}
      {reminder.doctor && (
        <Text style={styles.reminderDetail}>👨‍⚕️ {reminder.doctor}</Text>
      )}
      {reminder.medicine && (
        <Text style={styles.reminderDetail}>💊 {reminder.medicine} - {reminder.dosage}</Text>
      )}
      {reminder.vaccine && (
        <Text style={styles.reminderDetail}>💉 {reminder.vaccine}</Text>
      )}
      {reminder.note && (
        <Text style={styles.reminderDetail}>📝 {reminder.note}</Text>
      )}

      <View style={styles.channels}>
        <Text style={styles.channelBadge}>📱 Push</Text>
        <Text style={styles.channelBadge}>💬 Zalo</Text>
        <Text style={styles.channelBadge}>📧 SMS</Text>
      </View>

      {reminder.type === 'medicine' && (
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>✅ Đánh dấu đã uống</Text>
        </TouchableOpacity>
      )}
      {reminder.type === 'vaccination' && (
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>📅 Đặt lịch ngay</Text>
        </TouchableOpacity>
      )}
      {reminder.type === 'checkup' && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionButton, styles.flex1]}>
            <Text style={styles.actionButtonText}>Xem chi tiết</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
            <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Hủy</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Nhắc nhở"
        subtitle="Quản lý thông báo sức khỏe"
        onBack={() => navigation.goBack()}
      />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {today.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 HÔM NAY</Text>
            {today.map(renderReminder)}
          </View>
        )}

        {upcoming.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏰ SẮP TỚI</Text>
            {upcoming.map(renderReminder)}
          </View>
        )}

        <View style={styles.empty}>
          <Text style={styles.emptyText}>✅ Tất cả nhắc nhở đã được xử lý</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  reminderCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadow.sm,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  petName: {
    ...theme.typography.bodyBold,
    color: theme.colors.primaryDarker,
  },
  reminderTime: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  reminderTitle: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  reminderDetail: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  channels: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  channelBadge: {
    backgroundColor: theme.colors.warningBg,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.round,
    fontSize: 11,
    color: theme.colors.primaryDarker,
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  actionButtonText: {
    color: theme.colors.textOnPrimary,
    ...theme.typography.smallBold,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: theme.colors.dangerBg,
  },
  cancelButtonText: {
    color: theme.colors.danger,
  },
  empty: {
    padding: theme.spacing.huge,
    alignItems: 'center',
  },
  emptyText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
});
