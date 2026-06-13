import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';
import Header from '../../components/Header';
import ModernCard from '../../components/ModernCard';
import Icon from '../../components/Icon';

export default function RemindersScreen({ navigation }: any) {
  const [selectedReminder, setSelectedReminder] = useState<any>(null);
  const [takenMedicines, setTakenMedicines] = useState<Set<string>>(new Set());
  const reminders = [
    {
      id: '1',
      pet: 'Buddy',
      type: 'checkup',
      title: 'Lịch khám hôm nay',
      time: '14:00 - 16:00',
      branch: 'Petplus Gò Vấp',
      doctor: 'BS. Nguyễn Văn A',
      note: 'Pet bị chảy nước mắt, khám định kì',
      urgent: true,
    },
    {
      id: '2',
      pet: 'Mèo',
      type: 'medicine',
      title: 'Nhắc uống thuốc',
      time: '20:00 hôm nay',
      medicine: 'Thuốc kháng sinh Amoxicillin',
      dosage: '1 viên',
      urgent: false,
    },
    {
      id: '3',
      pet: 'Buddy',
      type: 'vaccination',
      title: 'Lịch tiêm vaccine nhắc lại',
      time: '10/06/2026',
      vaccine: 'Vaccine dại (lần 3)',
      urgent: false,
    },
    {
      id: '4',
      pet: 'Buddy',
      type: 'deworming',
      title: 'Lịch tẩy giun',
      time: '12/06/2026',
      urgent: false,
    },
    {
      id: '5',
      pet: 'Mèo',
      type: 'diet',
      title: 'Thay đổi khẩu phần ăn',
      time: '15/06/2026',
      note: 'Mèo đã 2 tuổi, chuyển sang thức ăn cho mèo trưởng thành',
      urgent: false,
    },
  ];

  const today = reminders.filter(r => r.urgent);
  const upcoming = reminders.filter(r => !r.urgent);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'checkup': return 'calendar';
      case 'medicine': return 'medkit';
      case 'vaccination': return 'medkit';
      case 'deworming': return 'alert-circle';
      case 'diet': return 'heart';
      default: return 'calendar';
    }
  };

  const renderReminder = (reminder: any) => {
    const isTaken = takenMedicines.has(reminder.id);

    return (
    <ModernCard key={reminder.id} style={styles.reminderCard}>
      <View style={styles.reminderHeader}>
        <View style={styles.petNameRow}>
          <Icon name="paw" size={16} color={theme.colors.primaryDarker} />
          <Text style={styles.petName}>{reminder.pet}</Text>
        </View>
        <Text style={styles.reminderTime}>{reminder.time}</Text>
      </View>
      <View style={styles.titleRow}>
        <Icon name={getTypeIcon(reminder.type)} size={16} color={theme.colors.primary} />
        <Text style={styles.reminderTitle}>{reminder.title}</Text>
      </View>
      
      {reminder.branch && (
        <View style={styles.detailRow}>
          <Icon name="location" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.reminderDetail}>{reminder.branch}</Text>
        </View>
      )}
      {reminder.doctor && (
        <View style={styles.detailRow}>
          <Icon name="medical" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.reminderDetail}>{reminder.doctor}</Text>
        </View>
      )}
      {reminder.medicine && (
        <View style={styles.detailRow}>
          <Icon name="medkit" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.reminderDetail}>{reminder.medicine} - {reminder.dosage}</Text>
        </View>
      )}
      {reminder.vaccine && (
        <View style={styles.detailRow}>
          <Icon name="medkit" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.reminderDetail}>{reminder.vaccine}</Text>
        </View>
      )}
      {reminder.note && (
        <View style={styles.detailRow}>
          <Icon name="create" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.reminderDetail}>{reminder.note}</Text>
        </View>
      )}

      <View style={styles.channels}>
        <Text style={styles.channelBadge}>Push</Text>
        <Text style={styles.channelBadge}>Zalo</Text>
        <Text style={styles.channelBadge}>SMS</Text>
      </View>

      {reminder.type === 'medicine' && (
        <TouchableOpacity
          style={[styles.actionButton, isTaken && styles.actionButtonTaken]}
          onPress={() => {
            setTakenMedicines(prev => {
              const next = new Set(prev);
              next.add(reminder.id);
              return next;
            });
          }}
          disabled={isTaken}
        >
          <Icon name="checkmark" size={14} color={isTaken ? theme.colors.textSecondary : theme.colors.textOnPrimary} />
          <Text style={[styles.actionButtonText, isTaken && styles.actionButtonTextTaken]}>
            {isTaken ? 'Đã uống' : 'Đánh dấu đã uống'}
          </Text>
        </TouchableOpacity>
      )}
      {reminder.type === 'vaccination' && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('SelectBranch')}
        >
          <Icon name="calendar" size={14} color={theme.colors.textOnPrimary} />
          <Text style={styles.actionButtonText}>Đặt lịch ngay</Text>
        </TouchableOpacity>
      )}
      {reminder.type === 'checkup' && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.flex1]}
            onPress={() => setSelectedReminder(reminder)}
          >
            <Text style={styles.actionButtonText}>Xem chi tiết</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
            <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Hủy</Text>
          </TouchableOpacity>
        </View>
      )}
    </ModernCard>
  );
};

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
            <Text style={styles.sectionTitle}>HÔM NAY</Text>
            {today.map(renderReminder)}
          </View>
        )}

        {upcoming.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SẮP TỚI</Text>
            {upcoming.map(renderReminder)}
          </View>
        )}

        <View style={styles.empty}>
          <Text style={styles.emptyText}>Tất cả nhắc nhở đã được xử lý</Text>
        </View>
      </ScrollView>

      <Modal
        visible={selectedReminder !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedReminder(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Chi tiết lịch khám</Text>

            <View style={styles.modalItem}>
              <Icon name="paw" size={18} color={theme.colors.primary} />
              <Text style={styles.modalLabel}>Thú cưng:</Text>
              <Text style={styles.modalValue}>{selectedReminder?.pet}</Text>
            </View>

            <View style={styles.modalItem}>
              <Icon name="location" size={18} color={theme.colors.primary} />
              <Text style={styles.modalLabel}>Địa chỉ:</Text>
              <Text style={styles.modalValue}>{selectedReminder?.branch}</Text>
            </View>

            <View style={styles.modalItem}>
              <Icon name="calendar" size={18} color={theme.colors.primary} />
              <Text style={styles.modalLabel}>Thời gian:</Text>
              <Text style={styles.modalValue}>{selectedReminder?.time}</Text>
            </View>

            <View style={styles.modalItem}>
              <Icon name="medical" size={18} color={theme.colors.primary} />
              <Text style={styles.modalLabel}>Bác sĩ:</Text>
              <Text style={styles.modalValue}>{selectedReminder?.doctor}</Text>
            </View>

            <View style={styles.modalItem}>
              <Icon name="create" size={18} color={theme.colors.primary} />
              <Text style={styles.modalLabel}>Ghi chú:</Text>
              <Text style={styles.modalValue}>{selectedReminder?.note || 'Khám định kì'}</Text>
            </View>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setSelectedReminder(null)}
            >
              <Text style={styles.modalCloseText}>Đóng</Text>
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
    marginBottom: theme.spacing.md,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  petNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  petName: {
    ...theme.typography.bodyBold,
    color: theme.colors.primaryDarker,
  },
  reminderTime: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.sm,
  },
  reminderTitle: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  reminderDetail: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
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
    borderRadius: theme.radius.pill,
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
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
  actionButtonTaken: {
    backgroundColor: theme.colors.border,
  },
  actionButtonTextTaken: {
    color: theme.colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xxl,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: theme.spacing.md,
  },
  modalLabel: {
    ...theme.typography.bodyBold,
    color: theme.colors.textSecondary,
    minWidth: 80,
  },
  modalValue: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  modalCloseBtn: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  modalCloseText: {
    color: theme.colors.textOnPrimary,
    ...theme.typography.smallBold,
  },
});