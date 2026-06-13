import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/firestoreService';
import { petService } from '../../services/firestoreService';
import { theme } from '../../utils/theme';
import Header from '../../components/Header';
import Button from '../../components/Button';
import ModernCard from '../../components/ModernCard';
import Icon from '../../components/Icon';
import StepProgress from '../../components/StepProgress';
import { DOCTOR_NAMES } from '../../data/doctors';

const BRANCHES: Record<string, string> = {
  'go-vap': 'Petplus Gò Vấp',
  'quan-11': 'Petplus Quận 11',
  'quan-12': 'Petplus Quận 12',
};

function buildAppointmentDateTime(date: string, slot: string) {
  const dateObj = new Date(date);
  const [startTime] = slot.split(' - ');
  const [hours, minutes] = startTime.split(':').map(Number);
  dateObj.setHours(hours, minutes, 0, 0);
  return dateObj;
}

export default function BookingConfirmationScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const { branchId, doctorId, date, dateDisplay, slot, petId, petName: petDisplayName } = route.params;
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const assignedDoctorId = doctorId === 'auto' ? 'dr-a' : doctorId;
  const doctorName = doctorId === 'auto'
    ? `${DOCTOR_NAMES[assignedDoctorId] || 'Bác sĩ'} (tự động chọn)`
    : DOCTOR_NAMES[doctorId] || 'Bác sĩ';
  const branchName = BRANCHES[branchId] || 'Petplus';
  const petName = petDisplayName || 'Chưa có pet';

  const buildDateTime = () => {
    return buildAppointmentDateTime(date, slot);
  };

  const handleConfirm = async () => {
    if (!user?.id) {
      setNotificationMessage('Vui lòng đăng nhập để đặt lịch');
      setIsSuccess(false);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 1500);
      return;
    }

    if (!petId) {
      setNotificationMessage('Vui lòng chọn thú cưng trước khi đặt lịch');
      setIsSuccess(false);
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
        navigation.navigate('MainTabs', { screen: 'PetsTab' });
      }, 1500);
      return;
    }

    const appointmentDateTime = buildDateTime();
    if (appointmentDateTime.getTime() <= Date.now()) {
      setNotificationMessage('Khung giờ này đã qua. Anh/chị vui lòng chọn khung giờ khác.');
      setIsSuccess(false);
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
        navigation.goBack();
      }, 1800);
      return;
    }

    setLoading(true);
    const result = await appointmentService.createAppointment({
      branchId,
      doctorId: assignedDoctorId,
      petId,
      customerId: user.id,
      dateTime: appointmentDateTime,
      slot,
      status: 'pending',
      notes: doctorId === 'auto' ? 'Demo: bác sĩ được hệ thống tự động chọn theo lịch trống.' : undefined,
    });
    setLoading(false);

    if (result.success) {
      setNotificationMessage(
        `Lịch hẹn đã được đặt tại ${branchName}, tư vấn với ${doctorName} lúc ${slot} cho thú cưng ${petName}`
      );
      setIsSuccess(true);
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
        navigation.navigate('MainTabs', { screen: 'ScheduleTab' });
      }, 2000);
    } else {
      setNotificationMessage('Không thể đặt lịch. Vui lòng thử lại.');
      setIsSuccess(false);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 1500);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Xác nhận đặt lịch"
        subtitle="Bước 4 / 4"
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headerInfo}>
          <Text style={styles.stepText}>Bước 4 / 4</Text>
          <StepProgress current={4} total={4} />
          <Text style={styles.title}>Kiểm tra thông tin</Text>
          <Text style={styles.subtitle}>Vui lòng kiểm tra kỹ trước khi xác nhận</Text>
        </View>

        <ModernCard style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIcon}>
              <Icon name="calendar" size={24} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={styles.summaryTitle}>Chi tiết lịch hẹn</Text>
              <Text style={styles.summarySubtitle}>Vui lòng đến trước 15 phút</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Icon name="location" size={16} color={theme.colors.textSecondary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Chi nhánh</Text>
              <Text style={styles.infoValue}>{branchName}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Icon name="medical" size={16} color={theme.colors.textSecondary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Bác sĩ</Text>
              <Text style={styles.infoValue}>{doctorName}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Icon name="calendar" size={16} color={theme.colors.textSecondary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ngày khám</Text>
              <Text style={styles.infoValue}>{dateDisplay || new Date(date).toLocaleDateString('vi-VN')}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Icon name="time" size={16} color={theme.colors.textSecondary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Khung giờ</Text>
              <Text style={styles.infoValue}>{slot || 'Chưa chọn'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Icon name="paw" size={16} color={theme.colors.textSecondary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Thú cưng</Text>
              <Text style={styles.infoValue}>{petName}</Text>
            </View>
          </View>
        </ModernCard>

        <ModernCard style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <Icon name="information-circle" size={20} color={theme.colors.textPrimary} />
            <Text style={styles.noticeTitle}>Lưu ý quan trọng</Text>
          </View>
          <View style={styles.noticeList}>
            <Text style={styles.noticeItem}>• Đến trước 15 phút để làm thủ tục</Text>
            <Text style={styles.noticeItem}>• Hủy lịch miễn phí trước 2 giờ</Text>
            <Text style={styles.noticeItem}>• Mang theo sổ tiêm chủng (nếu có)</Text>
            <Text style={styles.noticeItem}>• Thú cưng nên nhịn ăn 4 tiếng trước khám</Text>
          </View>
        </ModernCard>

        <Button
          title={loading ? 'Đang xác nhận...' : 'Xác nhận đặt lịch'}
          onPress={handleConfirm}
          disabled={loading}
          fullWidth
          size="lg"
          style={{ marginTop: theme.spacing.lg }}
        />
        
        <Button
          title="Quay lại"
          onPress={() => navigation.goBack()}
          variant="ghost"
          fullWidth
          style={{ marginTop: theme.spacing.md }}
        />
      </ScrollView>

      {/* Notification Popup */}
      <Modal
        visible={showNotification}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotification(false)}
      >
        <View style={styles.notificationOverlay}>
          <View style={[styles.notificationCard, isSuccess && styles.notificationSuccess]}>
            <Icon name={isSuccess ? 'checkmark' : 'close'} size={24} color={isSuccess ? theme.colors.success : theme.colors.danger} />
            <Text style={styles.notificationText}>{notificationMessage}</Text>
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
  content: {
    padding: theme.spacing.xl,
  },
  headerInfo: {
    marginBottom: theme.spacing.xl,
  },
  stepText: {
    ...theme.typography.smallBold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  summaryCard: {
    marginBottom: theme.spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryTitle: {
    ...theme.typography.h4,
    color: theme.colors.textPrimary,
  },
  summarySubtitle: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  noticeCard: {
    backgroundColor: theme.colors.warningBg,
    marginTop: theme.spacing.lg,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  noticeTitle: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
  noticeList: {
    gap: theme.spacing.sm,
  },
  noticeItem: {
    ...theme.typography.small,
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
  notificationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 280,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.danger,
  },
  notificationSuccess: {
    borderLeftColor: theme.colors.success,
  },
  notificationText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
});
