import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { petService } from '../../services/firestoreService';
import { theme } from '../../utils/theme';
import { Pet } from '../../types';
import Icon from '../../components/Icon';
import ModernCard from '../../components/ModernCard';
import Button from '../../components/Button';

const DOCTORS = [
  { id: 'dr-a', name: 'BS. Nguyễn Văn A', specialty: 'Nội khoa', status: 'available' },
  { id: 'dr-b', name: 'BS. Trần Thị B', specialty: 'Ngoại khoa', status: 'available' },
  { id: 'dr-c', name: 'BS. Lê Văn C', specialty: 'Da liễu', status: 'busy' },
];

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetIndex, setSelectedPetIndex] = useState(0);
  const [showPetDropdown, setShowPetDropdown] = useState(false);

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    if (user?.id) {
      const result = await petService.getPetsByOwner(user.id);
      if (result.success && result.pets && result.pets.length > 0) {
        setPets(result.pets);
      }
    }
  };

  const selectedPet = pets[selectedPetIndex];
  const petName = selectedPet?.name || 'Chưa có pet';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.petSelector}
              onPress={() => setShowPetDropdown(true)}
            >
              <Icon name="paw" size={16} color={theme.colors.primary} />
              <Text style={styles.petName}>{petName}</Text>
              <Icon name="arrow-down" size={12} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <View style={styles.logoText}>
              <Text style={styles.logoTitle}>Petplus</Text>
            </View>
            <TouchableOpacity style={styles.notificationBtn}>
              <Icon name="notifications" size={18} color={theme.colors.textPrimary} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Shop')}>
            <Icon name="search" size={16} color={theme.colors.textTertiary} />
            <Text style={styles.searchPlaceholder}>Tìm kiếm dịch vụ bác sĩ, sản phẩm...</Text>
          </TouchableOpacity>
        </View>

        {/* Pet Dropdown Modal */}
        <Modal
          visible={showPetDropdown}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPetDropdown(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowPetDropdown(false)}
          >
            <View style={styles.dropdownMenu}>
              {pets.map((pet, index) => (
                <TouchableOpacity
                  key={pet.id}
                  style={[
                    styles.dropdownItem,
                    index === selectedPetIndex && styles.dropdownItemSelected
                  ]}
                  onPress={() => {
                    setSelectedPetIndex(index);
                    setShowPetDropdown(false);
                  }}
                >
                  <Icon name="paw" size={20} color={theme.colors.primary} />
                  <Text style={[
                    styles.dropdownText,
                    index === selectedPetIndex && styles.dropdownTextSelected
                  ]}>
                    {pet.name}
                  </Text>
                  {index === selectedPetIndex && <Icon name="checkmark" size={16} color={theme.colors.primary} />}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.dropdownAdd}
                onPress={() => {
                  setShowPetDropdown(false);
                  navigation.navigate('AddPet');
                }}
              >
                <Text style={styles.dropdownAddText}>Thêm thú cưng mới</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: theme.colors.primaryBg }]}
            onPress={() => navigation.navigate('Chat', { doctorId: 'dr-a', doctorName: 'Nguyễn Văn A', petName: petName })}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: theme.colors.primary }]}>
              <Icon name="chat" size={22} color={theme.colors.textOnPrimary} />
            </View>
            <Text style={[styles.quickActionText, { color: theme.colors.primaryDarker }]}>Tư vấn ngay</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: theme.colors.secondaryBg }]}
            onPress={() => navigation.navigate('ScheduleTab')}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: theme.colors.secondary }]}>
              <Icon name="calendar" size={22} color={theme.colors.textOnPrimary} />
            </View>
            <Text style={[styles.quickActionText, { color: theme.colors.secondary }]}>Đặt lịch</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: theme.colors.accentBg }]}
            onPress={() => navigation.navigate('Shop')}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: theme.colors.accent }]}>
              <Icon name="medkit" size={22} color={theme.colors.textPrimary} />
            </View>
            <Text style={[styles.quickActionText, { color: theme.colors.textPrimary }]}>Mua thuốc</Text>
          </TouchableOpacity>
        </View>

        {/* Appointment Card */}
        <ModernCard style={styles.appointmentCard} header={
          <View style={styles.appointmentHeader}>
            <Text style={styles.appointmentTitle}>Lịch khám sắp tới</Text>
            <TouchableOpacity>
              <Text style={styles.viewDetail}>Xem chi tiết →</Text>
            </TouchableOpacity>
          </View>
        }>
          <View style={styles.appointmentContent}>
            <View style={styles.appointmentImage}>
              <Icon name="paw" size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.appointmentInfo}>
              <View style={styles.appointmentRow}>
                <Text style={styles.appointmentLabel}>Ngày khám</Text>
                <Text style={styles.appointmentValue}>dd/mm/yyyy</Text>
              </View>
              <View style={styles.appointmentRow}>
                <Text style={styles.appointmentLabel}>Khung giờ</Text>
                <Text style={styles.appointmentValue}>10:00 - 12:00</Text>
              </View>
              <View style={styles.appointmentRow}>
                <Text style={styles.appointmentLabel}>Pet</Text>
                <Text style={styles.appointmentValue}>{petName}</Text>
              </View>
              <View style={styles.appointmentRow}>
                <Text style={styles.appointmentLabel}>Bác sĩ</Text>
                <Text style={styles.appointmentValue}>BS. Nguyễn B</Text>
              </View>
            </View>
          </View>
        </ModernCard>

        {/* Doctors Online */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bác sĩ đang online</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>
          <ModernCard>
            <View style={styles.doctorCard}>
              <View style={styles.doctorAvatar}>
                <Icon name="medical" size={28} color={theme.colors.primary} />
              </View>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>Bác sĩ C</Text>
                <Text style={styles.doctorSpecialty}>Chuyên gia nội khoa</Text>
              </View>
              <Button
                title="Chat ngay"
                size="sm"
                onPress={() => navigation.navigate('Chat', { doctorId: 'dr-c', doctorName: 'Bác sĩ C', petName: petName })}
              />
            </View>
          </ModernCard>
        </View>

        {/* Purchased Medicines */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Đơn thuốc đã mua</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
              <Text style={styles.viewAll}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.medicineScroll}>
            {[
              { name: 'Breeders Chow', price: '320.000 đ', rating: '4.8', icon: 'medkit-outline', color: theme.colors.infoBg },
              { name: 'Medicated Special', price: '280.000 đ', rating: '4.7', icon: 'medkit-outline', color: theme.colors.secondaryBg },
              { name: 'NutriPro 300', price: '150.000 đ', rating: '4.6', icon: 'medkit-outline', color: theme.colors.successBg },
            ].map((item, index) => (
              <ModernCard key={index} style={styles.medicineCard} padding="md">
                <View style={[styles.medicineImage, { backgroundColor: item.color }]}>
                  <Icon name="medkit" size={32} color={theme.colors.primary} />
                </View>
                <Text style={styles.medicineName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.medicinePrice}>{item.price}</Text>
                <View style={styles.medicineRating}>
                  <Icon name="star" size={12} color={theme.colors.accent} />
                  <Text style={styles.medicineRatingText}> {item.rating}</Text>
                </View>
                <Button
                  title="Mua lại"
                  size="sm"
                  variant="secondary"
                  onPress={() => navigation.navigate('Shop')}
                />
              </ModernCard>
            ))}
          </ScrollView>
        </View>

        {/* Flash Sale */}
        <View style={styles.section}>
          <View style={styles.flashHeader}>
            <View style={styles.flashTitleWrap}>
              <Icon name="flash" size={16} color={theme.colors.danger} />
              <Text style={styles.flashTitle}>Flash Sale</Text>
            </View>
            <Text style={styles.flashTimer}>Kết thúc sau: 02:15:30</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.flashScroll}>
            {[
              { name: 'Pedigree cho chó trưởng thành', price: '199.000 đ', oldPrice: '250.000 đ', discount: '-20%', icon: 'medkit-outline', color: theme.colors.secondaryBg },
              { name: 'Sữa dinh dưỡng cho cún', price: '125.000 đ', oldPrice: '180.000 đ', discount: '-30%', icon: 'medkit-outline', color: theme.colors.infoBg },
              { name: 'Pate dinh dưỡng cho mèo', price: '89.000 đ', oldPrice: '120.000 đ', discount: '-25%', icon: 'medkit-outline', color: theme.colors.accentBg },
            ].map((item, index) => (
              <ModernCard key={index} style={styles.flashCard} padding="md">
                <View style={styles.flashImageContainer}>
                  <View style={[styles.flashImage, { backgroundColor: item.color }]}>
                    <Icon name="medkit" size={32} color={theme.colors.primary} />
                  </View>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{item.discount}</Text>
                  </View>
                </View>
                <Text style={styles.flashName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.flashPrice}>{item.price}</Text>
                <Text style={styles.flashOldPrice}>{item.oldPrice}</Text>
                <Button
                  title="Mua ngay"
                  size="sm"
                  variant="secondary"
                  onPress={() => navigation.navigate('Shop')}
                />
              </ModernCard>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderBottomLeftRadius: theme.radius.xxl,
    borderBottomRightRadius: theme.radius.xxl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  petSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    gap: 6,
  },
  petName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  logoText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textOnPrimary,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.danger,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: theme.spacing.lg,
    height: 44,
    borderRadius: theme.radius.pill,
    gap: theme.spacing.sm,
  },
  searchPlaceholder: {
    fontSize: 13,
    color: theme.colors.textTertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingTop: 100,
    paddingHorizontal: theme.spacing.xl,
  },
  dropdownMenu: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.sm,
    ...theme.shadow.lg,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
  },
  dropdownItemSelected: {
    backgroundColor: theme.colors.primaryBg,
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  dropdownTextSelected: {
    fontWeight: '600',
    color: theme.colors.primaryDarker,
  },
  dropdownAdd: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    marginTop: theme.spacing.sm,
  },
  dropdownAddText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  quickActionCard: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    gap: 8,
    ...theme.shadow.sm,
  },
  quickIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appointmentTitle: {
    ...theme.typography.overline,
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  viewDetail: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  appointmentContent: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  appointmentImage: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentInfo: {
    flex: 1,
    gap: 6,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appointmentLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  appointmentValue: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.textPrimary,
  },
  viewAll: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    ...theme.typography.smallBold,
    color: theme.colors.textPrimary,
  },
  doctorSpecialty: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  medicineScroll: {
    paddingRight: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  medicineCard: {
    width: 140,
    alignItems: 'center',
  },
  medicineImage: {
    width: 70,
    height: 70,
    borderRadius: theme.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  medicineName: {
    ...theme.typography.smallBold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  medicinePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.danger,
    marginBottom: 4,
  },
  medicineRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  medicineRatingText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  flashHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  flashTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flashTitle: {
    ...theme.typography.h4,
    color: theme.colors.danger,
  },
  flashTimer: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  flashScroll: {
    paddingRight: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  flashCard: {
    width: 160,
  },
  flashImageContainer: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  flashImage: {
    width: '100%',
    height: 90,
    borderRadius: theme.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: theme.colors.danger,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  discountText: {
    color: theme.colors.textOnPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  flashName: {
    ...theme.typography.smallBold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
    minHeight: 30,
  },
  flashPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.danger,
  },
  flashOldPrice: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    textDecorationLine: 'line-through',
    marginBottom: theme.spacing.sm,
  },
});
