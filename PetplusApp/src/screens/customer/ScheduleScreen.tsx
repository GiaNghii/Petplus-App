import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { appointmentService, petService } from '../../services/firestoreService';
import { theme } from '../../utils/theme';
import { Appointment, Pet } from '../../types';
import Header from '../../components/Header';
import ModernCard from '../../components/ModernCard';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import { DOCTOR_NAMES } from '../../data/doctors';
import { useResponsive, desktopContainer } from '../../utils/responsive';

const BRANCHES: Record<string, string> = {
  'go-vap': 'Petplus Gò Vấp',
  'quan-11': 'Petplus Quận 11',
  'quan-12': 'Petplus Quận 12',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Chờ xác nhận', color: theme.colors.warning, bg: theme.colors.warningBg },
  confirmed: { label: 'Đã xác nhận', color: theme.colors.info, bg: theme.colors.infoBg },
  completed: { label: 'Hoàn thành', color: theme.colors.success, bg: theme.colors.successBg },
  cancelled: { label: 'Đã hủy', color: theme.colors.danger, bg: theme.colors.dangerBg },
};



export default function ScheduleScreen({ navigation }: any) {
  const { user } = useAuth();
  const { isDesktop, width } = useResponsive();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);
  const [editForm, setEditForm] = useState({ branchId: '', doctorId: '', slot: '', service: '', notes: '' });
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingApt, setCancellingApt] = useState<Appointment | null>(null);
  const loadingRef = React.useRef(false);

  const loadAppointments = useCallback(async () => {
    if (!user?.id || loadingRef.current) return;
    loadingRef.current = true;
    try {
    await appointmentService.normalizeAppointmentStatuses();
    const [aptResult, petResult] = await Promise.all([
      appointmentService.getAppointmentsByCustomer(user.id),
      petService.getPetsByOwner(user.id),
    ]);
    if (petResult.success && petResult.pets) {
      setPets(petResult.pets);
    }
    if (aptResult.success && aptResult.appointments) {
      let data = aptResult.appointments;
      data.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
      setAppointments(data);
    }
    } finally {
      loadingRef.current = false;
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, [loadAppointments])
  );

  const upcoming = appointments.filter(
    a => (a.status === 'pending' || a.status === 'confirmed') && new Date(a.dateTime) >= new Date()
  );
  const history = appointments.filter(
    a => a.status === 'completed' || a.status === 'cancelled' || new Date(a.dateTime) < new Date()
  );

  const getPetName = (petId: string) => {
    return pets.find(p => p.id === petId)?.name || 'Chưa có pet';
  };

  const handleCancel = (apt: Appointment) => {
    setCancellingApt(apt);
    setShowCancelModal(true);
  };

  const startBooking = () => {
    if (pets.length > 0) {
      navigation.navigate('SelectBranch', {
        petId: pets[0].id,
        petName: pets[0].name,
      });
      return;
    }
    navigation.navigate('AddPet');
  };

  const confirmCancel = async () => {
    if (!cancellingApt) return;
    const result = await appointmentService.updateAppointmentStatus(cancellingApt.id, 'cancelled');
    if (result.success) {
      setAppointments(prev =>
        prev.map(a => a.id === cancellingApt.id ? { ...a, status: 'cancelled' as const } : a)
      );
    }
    setShowCancelModal(false);
    setCancellingApt(null);
  };

  const openEditModal = (apt: Appointment) => {
    setEditingApt(apt);
    setEditForm({
      branchId: apt.branchId,
      doctorId: apt.doctorId,
      slot: apt.slot,
      service: apt.notes || '',
      notes: apt.notes || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    setShowConfirm(true);
  };

  const confirmSave = async () => {
    if (!editingApt) return;
    const result = await appointmentService.updateAppointment(editingApt.id, {
      branchId: editForm.branchId,
      doctorId: editForm.doctorId,
      slot: editForm.slot,
      notes: editForm.notes,
    });
    if (result.success) {
      setAppointments(prev =>
        prev.map(a =>
          a.id === editingApt.id
            ? { ...a, ...editForm, updatedAt: new Date() }
            : a
        )
      );
    }
    setShowConfirm(false);
    setShowEditModal(false);
    setEditingApt(null);
  };

  const cancelSave = () => {
    setShowConfirm(false);
    setShowEditModal(false);
  };

  const activeList = activeTab === 'upcoming' ? upcoming : history;
  // Use 2-column grid on desktop when more than 2 items
  const useGrid = isDesktop && activeList.length > 2;

  const renderAppointment = (apt: Appointment) => {
    const status = STATUS_CONFIG[apt.status];
    const date = new Date(apt.dateTime).toLocaleDateString('vi-VN');
    const petName = getPetName(apt.petId);

    return (
      <ModernCard
        key={apt.id}
        style={[
          styles.appointmentCard,
          isDesktop && styles.appointmentCardDesktop,
          useGrid && styles.appointmentCardGrid,
        ]}
      >
        <View style={styles.aptHeader}>
          <View style={styles.aptPet}>
            <Icon name="paw" size={isDesktop ? 28 : 24} color={theme.colors.primary} />
            <Text style={[styles.aptPetName, isDesktop && styles.aptPetNameDesktop]}>{petName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, isDesktop && styles.statusTextDesktop, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={[styles.aptDetails, isDesktop && styles.aptDetailsDesktop]}>
          <View style={styles.aptDetailRow}>
            <Icon name="location" size={isDesktop ? 18 : 16} color={theme.colors.textSecondary} />
            <Text style={[styles.detailText, isDesktop && styles.detailTextDesktop]}>{BRANCHES[apt.branchId]}</Text>
          </View>
          <View style={styles.aptDetailRow}>
            <Icon name="medical" size={isDesktop ? 18 : 16} color={theme.colors.textSecondary} />
            <Text style={[styles.detailText, isDesktop && styles.detailTextDesktop]}>{DOCTOR_NAMES[apt.doctorId]}</Text>
          </View>
          <View style={styles.aptDetailRow}>
            <Icon name="calendar" size={isDesktop ? 18 : 16} color={theme.colors.textSecondary} />
            <Text style={[styles.detailText, isDesktop && styles.detailTextDesktop]}>{date} • {apt.slot}</Text>
          </View>
          {apt.notes ? (
            <View style={styles.aptDetailRow}>
              <Icon name="medkit" size={isDesktop ? 18 : 16} color={theme.colors.textSecondary} />
              <Text style={[styles.detailText, isDesktop && styles.detailTextDesktop]}>{apt.notes}</Text>
            </View>
          ) : null}
        </View>

        {apt.status === 'pending' || apt.status === 'confirmed' ? (
          <View style={styles.aptActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton, isDesktop && styles.actionButtonDesktop]}
              onPress={() => handleCancel(apt)}
            >
              <Text style={[styles.cancelButtonText, isDesktop && styles.actionButtonTextDesktop]}>Hủy lịch</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.detailButton, isDesktop && styles.actionButtonDesktop]}
              onPress={() => openEditModal(apt)}
            >
              <Text style={[styles.detailButtonText, isDesktop && styles.actionButtonTextDesktop]}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.aptActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rebookButton, isDesktop && styles.actionButtonDesktop]}
              onPress={startBooking}
            >
              <Text style={[styles.rebookButtonText, isDesktop && styles.actionButtonTextDesktop]}>Đặt lại</Text>
            </TouchableOpacity>
          </View>
        )}
      </ModernCard>
    );
  };

  const renderTabPanel = () => (
    <>
      {activeTab === 'upcoming' ? (
        upcoming.length > 0 ? (
          <View style={useGrid ? styles.cardGrid : undefined}>
            {upcoming.map(renderAppointment)}
          </View>
        ) : (
          <View style={styles.empty}>
            <Icon name="calendar-outline" size={isDesktop ? 80 : 64} color={theme.colors.border} style={{ marginBottom: theme.spacing.lg }} />
            <Text style={[styles.emptyTitle, isDesktop && styles.emptyTitleDesktop]}>Chưa có lịch hẹn nào</Text>
            <Text style={[styles.emptyText, isDesktop && styles.emptyTextDesktop]}>Đặt lịch khám cho thú cưng của bạn</Text>
            <Button
              title="Đặt lịch ngay"
              onPress={startBooking}
              icon="add"
              style={{ marginTop: theme.spacing.lg }}
            />
          </View>
        )
      ) : (
        history.length > 0 ? (
          <View style={useGrid ? styles.cardGrid : undefined}>
            {history.map(renderAppointment)}
          </View>
        ) : (
          <View style={styles.empty}>
            <Icon name="calendar" size={isDesktop ? 80 : 64} color={theme.colors.border} style={{ marginBottom: theme.spacing.lg }} />
            <Text style={[styles.emptyTitle, isDesktop && styles.emptyTitleDesktop]}>Chưa có lịch sử</Text>
            <Text style={[styles.emptyText, isDesktop && styles.emptyTextDesktop]}>Lịch sử khám sẽ hiển thị ở đây</Text>
          </View>
        )
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Lịch hẹn"
        subtitle={`${upcoming.length} lịch sắp tới`}
        showBack={false}
        rightIcon="add"
        onRightPress={startBooking}
      />

      {isDesktop ? (
        /* Desktop: two-panel layout inside max-width container */
        <View style={[desktopContainer, styles.desktopWrapper]}>
          {/* Left panel: 40% - tabs + summary */}
          <View style={styles.leftPanel}>
            <View style={styles.leftPanelHeader}>
              <Text style={styles.leftPanelTitle}>Lịch hẹn</Text>
              <Text style={styles.leftPanelSubtitle}>{upcoming.length} lịch sắp tới</Text>
            </View>

            <View style={styles.tabsDesktop}>
              <TouchableOpacity
                style={[styles.tabDesktop, activeTab === 'upcoming' && styles.tabDesktopActive]}
                onPress={() => setActiveTab('upcoming')}
              >
                <Icon
                  name="calendar"
                  size={18}
                  color={activeTab === 'upcoming' ? theme.colors.primaryDarker : theme.colors.textSecondary}
                />
                <Text style={[styles.tabDesktopText, activeTab === 'upcoming' && styles.tabDesktopTextActive]}>
                  Sắp tới
                </Text>
                <View style={[styles.tabBadge, activeTab === 'upcoming' && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, activeTab === 'upcoming' && styles.tabBadgeTextActive]}>
                    {upcoming.length}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabDesktop, activeTab === 'history' && styles.tabDesktopActive]}
                onPress={() => setActiveTab('history')}
              >
                <Icon
                  name="time"
                  size={18}
                  color={activeTab === 'history' ? theme.colors.primaryDarker : theme.colors.textSecondary}
                />
                <Text style={[styles.tabDesktopText, activeTab === 'history' && styles.tabDesktopTextActive]}>
                  Lịch sử
                </Text>
                <View style={[styles.tabBadge, activeTab === 'history' && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, activeTab === 'history' && styles.tabBadgeTextActive]}>
                    {history.length}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Quick booking CTA */}
            <TouchableOpacity style={styles.desktopBookingCta} onPress={startBooking}>
              <Icon name="add-circle" size={20} color={theme.colors.textOnPrimary} />
              <Text style={styles.desktopBookingCtaText}>Đặt lịch mới</Text>
            </TouchableOpacity>
          </View>

          {/* Right panel: 60% - appointment list */}
          <ScrollView
            style={styles.rightPanel}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.rightPanelContent}
          >
            {renderTabPanel()}
          </ScrollView>
        </View>
      ) : (
        /* Mobile: original single-column layout */
        <>
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
            {renderTabPanel()}
          </ScrollView>
        </>
      )}

      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => { setShowCancelModal(false); setCancellingApt(null); }}
      >
        <View style={styles.cancelModalOverlay}>
          <View style={styles.cancelModalCard}>
            <Text style={styles.cancelModalTitle}>Bạn có chắc muốn hủy lịch?</Text>
            {cancellingApt && (
              <Text style={styles.cancelModalSubtitle}>
                {getPetName(cancellingApt.petId)} • {cancellingApt.slot}
              </Text>
            )}
            <View style={styles.cancelModalActions}>
              <TouchableOpacity
                style={[styles.cancelModalBtn, styles.cancelModalNo]}
                onPress={() => { setShowCancelModal(false); setCancellingApt(null); }}
              >
                <Text style={styles.cancelModalNoText}>Không</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelModalBtn, styles.cancelModalYes]}
                onPress={confirmCancel}
              >
                <Text style={styles.cancelModalYesText}>Có</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => { setShowEditModal(false); setShowConfirm(false); }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, isDesktop && styles.modalContentDesktop]}>
            <View style={styles.modalHandle} />

            {showConfirm ? (
              <>
                <Text style={styles.modalTitle}>Xác nhận thay đổi</Text>
                <Text style={styles.confirmMessage}>
                  Lịch sẽ được cập nhật và cần có sự đồng ý của bác sĩ
                </Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={cancelSave}
                  >
                    <Text style={styles.modalCancelText}>Hủy thay đổi</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalSaveButton]}
                    onPress={confirmSave}
                  >
                    <Text style={styles.modalSaveText}>Đồng ý</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
            <Text style={styles.modalTitle}>Chỉnh sửa lịch hẹn</Text>
            {editingApt && (
              <Text style={styles.modalSubtitle}>
                {getPetName(editingApt.petId)} • {new Date(editingApt.dateTime).toLocaleDateString('vi-VN')}
              </Text>
            )}

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalForm}>
              <Text style={styles.fieldLabel}>Chi nhánh</Text>
              <View style={styles.optionRow}>
                {Object.entries(BRANCHES).map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.optionChip, editForm.branchId === key && styles.optionChipActive]}
                    onPress={() => setEditForm(prev => ({ ...prev, branchId: key }))}
                  >
                    <Text style={[styles.optionChipText, editForm.branchId === key && styles.optionChipTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Bác sĩ</Text>
              <View style={styles.optionRow}>
                {Object.entries(DOCTOR_NAMES).filter(([key]) => key !== 'auto').map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.optionChip, editForm.doctorId === key && styles.optionChipActive]}
                    onPress={() => setEditForm(prev => ({ ...prev, doctorId: key }))}
                  >
                    <Text style={[styles.optionChipText, editForm.doctorId === key && styles.optionChipTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Khung giờ</Text>
              <View style={styles.optionRow}>
                {['08:00 - 10:00', '10:00 - 12:00', '13:00 - 15:00', '15:00 - 17:00'].map(slot => (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.optionChip, editForm.slot === slot && styles.optionChipActive]}
                    onPress={() => setEditForm(prev => ({ ...prev, slot }))}
                  >
                    <Text style={[styles.optionChipText, editForm.slot === slot && styles.optionChipTextActive]}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Dịch vụ</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.service}
                onChangeText={text => setEditForm(prev => ({ ...prev, service: text }))}
                placeholder="Nhập dịch vụ khám"
                placeholderTextColor={theme.colors.textDisabled}
              />

              <Text style={styles.fieldLabel}>Ghi chú</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                value={editForm.notes}
                onChangeText={text => setEditForm(prev => ({ ...prev, notes: text }))}
                placeholder="Ghi chú thêm cho bác sĩ"
                placeholderTextColor={theme.colors.textDisabled}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => { setShowEditModal(false); setShowConfirm(false); }}
              >
                <Text style={styles.modalCancelText}>Hủy thay đổi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.modalSaveText}>Lưu thay đổi</Text>
              </TouchableOpacity>
            </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // ─── Desktop two-panel layout ───────────────────────────────────────────────
  desktopWrapper: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 48,
    paddingTop: theme.spacing.xl,
    gap: 32,
  },
  leftPanel: {
    width: '40%',
    flexShrink: 0,
  },
  leftPanelHeader: {
    marginBottom: theme.spacing.xl,
  },
  leftPanelTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  leftPanelSubtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  tabsDesktop: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  tabDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
  },
  tabDesktopActive: {
    backgroundColor: theme.colors.primaryBg,
    borderColor: theme.colors.primary,
  },
  tabDesktopText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  tabDesktopTextActive: {
    color: theme.colors.primaryDarker,
    fontWeight: '600',
  },
  tabBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeActive: {
    backgroundColor: theme.colors.primary,
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  tabBadgeTextActive: {
    color: theme.colors.textOnPrimary,
  },
  desktopBookingCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  desktopBookingCtaText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textOnPrimary,
  },
  rightPanel: {
    flex: 1,
  },
  rightPanelContent: {
    paddingBottom: theme.spacing.xxxl,
  },

  // ─── 2-column grid for desktop when >2 items ────────────────────────────────
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.lg,
  },

  // ─── Mobile tabs ────────────────────────────────────────────────────────────
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

  // ─── Appointment card ────────────────────────────────────────────────────────
  appointmentCard: {
    marginBottom: theme.spacing.md,
  },
  appointmentCardDesktop: {
    marginBottom: 0,
  },
  appointmentCardGrid: {
    // Each grid card takes ~half width minus gap (gap handled by parent flexWrap)
    flexBasis: '47%',
    flexGrow: 1,
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
  aptPetNameDesktop: {
    fontSize: 18,
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
  statusTextDesktop: {
    fontSize: 13,
  },
  aptDetails: {
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  aptDetailsDesktop: {
    gap: 10,
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
  detailTextDesktop: {
    fontSize: 15,
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
  actionButtonDesktop: {
    paddingVertical: 12,
  },
  actionButtonTextDesktop: {
    fontSize: 14,
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
  emptyTitleDesktop: {
    fontSize: 22,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  emptyTextDesktop: {
    fontSize: 16,
  },

  // ─── Modals ──────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
    maxHeight: '85%',
  },
  modalContentDesktop: {
    // Center the modal on desktop as a dialog
    alignSelf: 'center',
    borderRadius: theme.radius.xxl,
    width: '100%',
    maxWidth: 560,
    marginBottom: 'auto',
    marginTop: 'auto',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  modalSubtitle: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  confirmMessage: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  modalForm: {
    flexGrow: 0,
  },
  fieldLabel: {
    ...theme.typography.smallBold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  optionChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
  },
  optionChipActive: {
    backgroundColor: theme.colors.primaryBg,
    borderColor: theme.colors.primary,
  },
  optionChipText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  optionChipTextActive: {
    color: theme.colors.primaryDarker,
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textPrimary,
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
  },
  modalTextArea: {
    minHeight: 80,
    paddingTop: theme.spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  modalSaveButton: {
    backgroundColor: theme.colors.primary,
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textOnPrimary,
  },
  cancelModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  cancelModalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xxl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  cancelModalTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  cancelModalSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  cancelModalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
    width: '100%',
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
  },
  cancelModalNo: {
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
  },
  cancelModalNoText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  cancelModalYes: {
    backgroundColor: theme.colors.danger,
  },
  cancelModalYesText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textOnPrimary,
  },
});
