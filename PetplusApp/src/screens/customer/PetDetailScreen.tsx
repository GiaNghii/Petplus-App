import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { petService } from '../../services/firestoreService';
import { Pet } from '../../types';
import { theme } from '../../utils/theme';
import Header from '../../components/Header';
import ModernCard from '../../components/ModernCard';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import WeightChart from '../../components/WeightChart';

type TabKey = 'medical' | 'vaccination' | 'weight';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'medical', label: 'Lịch sử khám' },
  { key: 'vaccination', label: 'Lịch tiêm' },
  { key: 'weight', label: 'Theo dõi' },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  completed: { bg: theme.colors.successBg, text: theme.colors.success, label: 'Đã tiêm' },
  upcoming: { bg: theme.colors.infoBg, text: theme.colors.info, label: 'Sắp tới' },
  overdue: { bg: theme.colors.dangerBg, text: theme.colors.danger, label: 'Quá hạn' },
};

export default function PetDetailScreen({ route, navigation }: any) {
  const { petId } = route.params;
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('medical');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chartRange, setChartRange] = useState(4);

  useEffect(() => {
    loadPet();
    const unsubscribe = navigation.addListener('focus', loadPet);
    return unsubscribe;
  }, []);

  const loadPet = async () => {
    const result = await petService.getPet(petId);
    if (result.success && result.pet) {
      setPet(result.pet);
    }
    setLoading(false);
  };

  const formatDate = (date: any) => {
    if (!date) return 'Chưa cập nhật';
    if (typeof date === 'object' && 'seconds' in date) {
      return new Date(date.seconds * 1000).toLocaleDateString('vi-VN');
    }
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const calcAge = (birthDate: Date) => {
    const now = new Date();
    const birth = new Date(birthDate);
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (months < 12) return `${months} tháng`;
    const years = Math.floor(months / 12);
    const remainMonths = months % 12;
    return remainMonths > 0 ? `${years} tuổi ${remainMonths} tháng` : `${years} tuổi`;
  };

  const handleDelete = () => setShowDeleteModal(true);

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    if (pet) {
      await petService.deletePet(pet.id);
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Hồ sơ thú cưng" onBack={() => navigation.goBack()} />
        <View style={styles.loading}>
          <Text>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Hồ sơ thú cưng" onBack={() => navigation.goBack()} />
        <View style={styles.loading}>
          <Text>Không tìm thấy thú cưng</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderMedicalTab = () => {
    const records = pet.medicalRecords || [];
    return (
      <View>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>THỜI GIAN</Text>
          <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>ĐƠN THUỐC</Text>
          <Text style={[styles.tableHeaderText, { flex: 1.3 }]}>CHÚ THÍCH</Text>
        </View>
        {records.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có lịch sử khám bệnh</Text>
        ) : (
          records.map((r, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowEven]}>
              <Text style={[styles.tableCell, { flex: 1.2 }]}>{formatDate(r.date)}</Text>
              <Text style={[styles.tableCellBold, { flex: 1.5 }]}>{r.medication}</Text>
              <Text style={[styles.tableCell, { flex: 1.3 }]}>{r.notes}</Text>
            </View>
          ))
        )}
      </View>
    );
  };

  const renderVaccinationTab = () => {
    const records = pet.vaccinationSchedule || [];
    return (
      <View>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>THỜI GIAN</Text>
          <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>LIỀU TIÊM</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>TRẠNG THÁI</Text>
        </View>
        {records.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có lịch sử tiêm chủng</Text>
        ) : (
          records.map((r, i) => {
            const st = STATUS_COLORS[r.status] || STATUS_COLORS.upcoming;
            return (
              <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowEven]}>
                <Text style={[styles.tableCell, { flex: 1 }]}>{formatDate(r.date)}</Text>
                <Text style={[styles.tableCellBold, { flex: 1.5 }]}>{r.vaccine}</Text>
                <View style={[styles.statusBadge, { backgroundColor: st.bg, flex: 1 }]}>
                  <View style={[styles.statusDot, { backgroundColor: st.text }]} />
                  <Text style={[styles.statusText, { color: st.text }]}>{st.label}</Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    );
  };

  const renderWeightTab = () => {
    const weightData = pet.weightHistory || [];
    return (
      <View>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Cân nặng theo thời gian</Text>
          <View style={styles.rangeButtons}>
            {[4, 6, 12].map(m => (
              <TouchableOpacity
                key={m}
                style={[styles.rangeBtn, chartRange === m && styles.rangeBtnActive]}
                onPress={() => setChartRange(m)}
              >
                <Text style={[styles.rangeBtnText, chartRange === m && styles.rangeBtnTextActive]}>
                  {m} tháng
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <WeightChart
          data={weightData.slice(-Math.ceil(chartRange / 4 * 2))}
          standardWeight={pet.species === 'dog' ? 20 : 3.5}
          height={220}
        />
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: theme.colors.primary }]} />
            <Text style={styles.legendText}>Cân nặng thực tế</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: theme.colors.secondary, borderStyle: 'dashed' }]} />
            <Text style={styles.legendText}>Chỉ số chuẩn</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Hồ sơ thú cưng"
        onBack={() => navigation.goBack()}
        rightIcon="create"
        onRightPress={() => navigation.navigate('AddPet', { petId: pet.id })}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Pet Profile Header */}
        <View style={styles.petHeader}>
          <View style={styles.avatarContainer}>
            {pet.avatarUrl ? (
              <Image source={{ uri: pet.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Icon name="paw" size={48} color={theme.colors.primary} />
            )}
          </View>
          <Text style={styles.petName}>{pet.name}</Text>
          <View style={styles.petMeta}>
            <View style={styles.metaItem}>
              <Icon name="paw" size={13} color={theme.colors.textOnPrimary} />
              <Text style={styles.metaText}>
                {pet.species === 'dog' ? 'Chó' : pet.species === 'cat' ? 'Mèo' : 'Khác'} • {pet.breed}
              </Text>
            </View>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{calcAge(pet.birthDate)}</Text>
          </View>
          {pet.drugAllergies && pet.drugAllergies.length > 0 && (
            <View style={styles.alertBanner}>
              <Icon name="warning" size={14} color={theme.colors.secondary} />
              <Text style={styles.alertText}>
                Pet đang bị dị ứng thuốc
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.chatBtn}>
            <Icon name="chatbubbles" size={16} color={theme.colors.primary} />
            <Text style={styles.chatBtnText}>Chat ngay</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.content}>
          <ModernCard style={styles.sectionCard}>
            {activeTab === 'medical' && renderMedicalTab()}
            {activeTab === 'vaccination' && renderVaccinationTab()}
            {activeTab === 'weight' && renderWeightTab()}
          </ModernCard>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Chỉnh sửa hồ sơ"
            icon="create"
            onPress={() => navigation.navigate('AddPet', { petId: pet.id })}
            fullWidth
          />
          <Button
            title="Xóa thú cưng"
            icon="trash"
            onPress={handleDelete}
            variant="danger"
            fullWidth
            style={{ marginTop: theme.spacing.md }}
          />
        </View>
      </ScrollView>

      {/* Delete Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ModernCard style={styles.modalCard} padding="xxl">
            <Icon name="trash" size={40} color={theme.colors.danger} />
            <Text style={styles.modalTitle}>Xóa thú cưng?</Text>
            <Text style={styles.modalText}>
              Bạn có chắc muốn xóa thú cưng? Các thông tin về hồ sơ cá nhân sẽ bị xóa vĩnh viễn
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirmDelete}>
                <Text style={styles.confirmBtnText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </ModernCard>
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Pet Header
  petHeader: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadow.lg,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  petName: {
    ...theme.typography.h2,
    color: theme.colors.textOnPrimary,
    marginBottom: theme.spacing.xs,
  },
  petMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...theme.typography.small,
    color: theme.colors.textOnPrimary,
    opacity: 0.85,
  },
  metaDot: {
    color: theme.colors.textOnPrimary,
    opacity: 0.5,
    fontSize: 10,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    marginBottom: theme.spacing.md,
  },
  alertText: {
    ...theme.typography.smallBold,
    color: theme.colors.textOnPrimary,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.radius.pill,
  },
  chatBtnText: {
    ...theme.typography.smallBold,
    color: theme.colors.primary,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  tabActive: {
    backgroundColor: theme.colors.primaryBg,
    borderColor: theme.colors.primary,
  },
  tabText: {
    ...theme.typography.smallBold,
    color: theme.colors.textTertiary,
  },
  tabTextActive: {
    color: theme.colors.primary,
  },

  // Content
  content: {
    padding: theme.spacing.lg,
  },
  sectionCard: {
    marginBottom: theme.spacing.md,
  },

  // Table
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    marginBottom: theme.spacing.xs,
  },
  tableHeaderText: {
    ...theme.typography.overline,
    color: theme.colors.textTertiary,
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.sm,
  },
  tableCell: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  tableCellBold: {
    ...theme.typography.smallBold,
    color: theme.colors.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    paddingVertical: theme.spacing.xxl,
  },

  // Chart
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  chartTitle: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
  rangeButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  rangeBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceAlt,
  },
  rangeBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  rangeBtnText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    fontWeight: '600',
  },
  rangeBtnTextActive: {
    color: theme.colors.textOnPrimary,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  legendLine: {
    width: 20,
    height: 3,
    borderRadius: 1.5,
  },
  legendText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
  },

  // Actions
  actions: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: theme.colors.surfaceAlt,
    paddingVertical: 14,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: theme.colors.danger,
    paddingVertical: 14,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: theme.colors.textOnPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
});
