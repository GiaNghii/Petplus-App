import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { petService, orderService, appointmentService } from '../../services/firestoreService';
import { theme } from '../../utils/theme';
import { Pet, Appointment } from '../../types';
import Icon from '../../components/Icon';
import ModernCard from '../../components/ModernCard';
import Button from '../../components/Button';
import { DOCTORS, DOCTOR_NAMES } from '../../data/doctors';
import { PRODUCTS, Product } from '../../data/products';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetIndex, setSelectedPetIndex] = useState(0);
  const [showPetDropdown, setShowPetDropdown] = useState(false);
  const [purchasedProducts, setPurchasedProducts] = useState<Product[]>([]);
  const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment | null>(null);

  const [flashSeconds, setFlashSeconds] = useState(2 * 60 * 60);

  useEffect(() => {
    const id = setInterval(() => {
      setFlashSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const flashTimeDisplay = (() => {
    const h = Math.floor(flashSeconds / 3600);
    const m = Math.floor((flashSeconds % 3600) / 60);
    const s = flashSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  })();

  const loadAll = useCallback(async () => {
    loadPets();
    loadPurchasedProducts();
    loadUpcomingAppointment();
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  const loadPets = async () => {
    if (user?.id) {
      const result = await petService.getPetsByOwner(user.id);
      if (result.success && result.pets && result.pets.length > 0) {
        setPets(result.pets);
      }
    }
  };

  const loadPurchasedProducts = async () => {
    if (user?.id) {
      const result = await orderService.getOrdersByCustomer(user.id);
      if (result.success && result.orders) {
        const purchasedIds = [...new Set(
          result.orders.flatMap(order => order.items.map(item => item.productId))
        )];
        const products = purchasedIds
          .map(id => PRODUCTS.find(p => p.id === id))
          .filter(Boolean) as Product[];
        setPurchasedProducts(products);
      }
    }
  };

  const loadUpcomingAppointment = async () => {
    if (user?.id) {
      const result = await appointmentService.getAppointmentsByCustomer(user.id);
      if (result.success && result.appointments) {
        const now = new Date();
        const upcoming = result.appointments
          .filter(apt => (apt.status === 'pending' || apt.status === 'confirmed') && new Date(apt.dateTime) >= now)
          .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
        if (upcoming.length > 0) {
          setUpcomingAppointment(upcoming[0]);
        } else {
          setUpcomingAppointment(null);
        }
      }
    }
  };

  const selectedPet = pets[selectedPetIndex];
  const petName = selectedPet?.name || 'Chưa có pet';
  const onlineDoctor = DOCTORS.find(d => d.status === 'online');
  const displayDoctor = onlineDoctor || DOCTORS[0];

  const startBooking = () => {
    if (!selectedPet) {
      navigation.navigate('AddPet');
      return;
    }
    navigation.navigate('SelectBranch', { petId: selectedPet.id, petName: selectedPet.name });
  };

  const startChat = (doctor = DOCTORS[0]) => {
    if (!selectedPet) {
      navigation.navigate('AddPet');
      return;
    }
    navigation.navigate('Chat', {
      doctorId: doctor.id,
      doctorName: doctor.name,
      petName: selectedPet.name,
      petId: selectedPet.id,
    });
  };

  const flashProducts = useMemo(
    () => PRODUCTS.filter(p => p.isHot || p.isNew).slice(0, 6),
    []
  );

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
              {selectedPet?.avatarUrl ? (
                <Image source={{ uri: selectedPet.avatarUrl }} style={styles.petSelectorAvatar} />
              ) : (
                <Icon name="paw" size={16} color={theme.colors.primary} />
              )}
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
                  {pet.avatarUrl ? (
                    <Image source={{ uri: pet.avatarUrl }} style={styles.dropdownAvatar} />
                  ) : (
                    <Icon name="paw" size={20} color={theme.colors.primary} />
                  )}
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

        <ModernCard style={styles.demoJourneyCard} padding="lg">
          <Text style={styles.demoEyebrow}>Demo flow</Text>
          <Text style={styles.demoTitle}>Chăm sóc {petName} trong một lượt thử</Text>
          <Text style={styles.demoText}>
            Bắt đầu bằng tư vấn nhanh, mua sản phẩm được gợi ý, hoặc đặt lịch khám để thấy dữ liệu demo cập nhật ngay trong app.
          </Text>
          <View style={styles.demoSteps}>
            <TouchableOpacity style={styles.demoStep} onPress={() => startChat()}>
              <Icon name="chatbubbles" size={16} color={theme.colors.primary} />
              <Text style={styles.demoStepText}>Tư vấn</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.demoStep} onPress={() => navigation.navigate('Shop')}>
              <Icon name="cart" size={16} color={theme.colors.secondary} />
              <Text style={styles.demoStepText}>Mua hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.demoStep} onPress={startBooking}>
              <Icon name="calendar" size={16} color={theme.colors.info} />
              <Text style={styles.demoStepText}>Đặt lịch</Text>
            </TouchableOpacity>
          </View>
        </ModernCard>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: theme.colors.primaryBg }]}
            onPress={() => startChat()}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: theme.colors.primary }]}>
              <Icon name="chat" size={22} color={theme.colors.textOnPrimary} />
            </View>
            <Text style={[styles.quickActionText, { color: theme.colors.primaryDarker }]}>Tư vấn ngay</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: theme.colors.secondaryBg }]}
            onPress={startBooking}
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
            <TouchableOpacity onPress={() => navigation.navigate('ScheduleTab')}>
              <Text style={styles.viewDetail}>Xem chi tiết →</Text>
            </TouchableOpacity>
          </View>
        }>
          {upcomingAppointment ? (
            <View style={styles.appointmentContent}>
              <View style={styles.appointmentImage}>
                {(pets.find(p => p.id === upcomingAppointment.petId))?.avatarUrl ? (
                  <Image source={{ uri: (pets.find(p => p.id === upcomingAppointment.petId))!.avatarUrl! }} style={styles.appointmentPetImage} />
                ) : (
                  <Icon name="paw" size={32} color={theme.colors.primary} />
                )}
              </View>
              <View style={styles.appointmentInfo}>
                <View style={styles.appointmentRow}>
                  <Text style={styles.appointmentLabel}>Ngày khám</Text>
                  <Text style={styles.appointmentValue}>
                    {new Date(upcomingAppointment.dateTime).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
                <View style={styles.appointmentRow}>
                  <Text style={styles.appointmentLabel}>Khung giờ</Text>
                  <Text style={styles.appointmentValue}>{upcomingAppointment.slot}</Text>
                </View>
                <View style={styles.appointmentRow}>
                  <Text style={styles.appointmentLabel}>Pet</Text>
                  <Text style={styles.appointmentValue}>
                    {pets.find(p => p.id === upcomingAppointment.petId)?.name || petName}
                  </Text>
                </View>
                <View style={styles.appointmentRow}>
                  <Text style={styles.appointmentLabel}>Bác sĩ</Text>
                  <Text style={styles.appointmentValue}>
                    {DOCTOR_NAMES[upcomingAppointment.doctorId] || 'Đang cập nhật'}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.appointmentEmpty}>
              <Icon name="calendar-outline" size={48} color={theme.colors.border} style={{ marginBottom: theme.spacing.sm }} />
              <Text style={styles.appointmentEmptyText}>Chưa có lịch khám nào</Text>
              <Button
                title="Đặt lịch ngay"
                size="sm"
                onPress={startBooking}
                icon="add"
                style={{ marginTop: theme.spacing.md }}
              />
            </View>
          )}
        </ModernCard>

        {/* Doctors Online */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bác sĩ đang online</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllDoctors')}>
              <Text style={styles.viewAll}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>
          <ModernCard>
            <View style={styles.doctorCard}>
              <View style={styles.doctorAvatar}>
                <Image source={{ uri: displayDoctor.imageUrl }} style={styles.doctorImage} />
              </View>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{displayDoctor.name}</Text>
                <Text style={styles.doctorSpecialty}>{displayDoctor.specialty}</Text>
              </View>
              <Button
                title="Chat ngay"
                size="sm"
                onPress={() => startChat(displayDoctor)}
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
            {purchasedProducts.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
              >
              <ModernCard style={styles.flashCard} padding="md">
                <View style={styles.flashImageContainer}>
                  <View style={[styles.flashImage, { backgroundColor: item.bgColor }]}>
                    {item.imageUrl ? (
                      <Image source={{ uri: item.imageUrl }} style={styles.flashImageInner} resizeMode="contain" />
                    ) : item.imageLocal ? (
                      <Image source={item.imageLocal} style={styles.flashImageInner} resizeMode="contain" />
                    ) : (
                      <Icon name="medkit" size={36} color={theme.colors.primaryLight} />
                    )}
                  </View>
                </View>
                <Text style={styles.flashName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.flashPrice}>{item.price.toLocaleString('vi-VN')}đ</Text>
                {item.originalPrice && (
                  <Text style={styles.flashOldPrice}>{item.originalPrice.toLocaleString('vi-VN')}đ</Text>
                )}
                <Button
                  title="Mua lại"
                  size="sm"
                  variant="secondary"
                  onPress={() => navigation.navigate('Shop')}
                />
              </ModernCard>
              </TouchableOpacity>
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
            <Text style={styles.flashTimer}>Kết thúc sau: {flashTimeDisplay}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.flashScroll}>
            {flashProducts.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
              >
              <ModernCard style={styles.flashCard} padding="md">
                <View style={styles.flashImageContainer}>
                  <View style={[styles.flashImage, { backgroundColor: item.bgColor }]}>
                    {item.imageUrl ? (
                      <Image source={{ uri: item.imageUrl }} style={styles.flashImageInner} resizeMode="contain" />
                    ) : item.imageLocal ? (
                      <Image source={item.imageLocal} style={styles.flashImageInner} resizeMode="contain" />
                    ) : (
                      <Icon name="medkit" size={36} color={theme.colors.primaryLight} />
                    )}
                  </View>
                  {(item.isHot || item.isNew) && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{item.isHot ? 'HOT' : 'MỚI'}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.flashName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.flashPrice}>{item.price.toLocaleString('vi-VN')}đ</Text>
                {item.originalPrice && (
                  <Text style={styles.flashOldPrice}>{item.originalPrice.toLocaleString('vi-VN')}đ</Text>
                )}
                <Button
                  title="Mua ngay"
                  size="sm"
                  variant="secondary"
                  onPress={() => navigation.navigate('Shop')}
                />
              </ModernCard>
              </TouchableOpacity>
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
  demoJourneyCard: {
    marginHorizontal: theme.spacing.lg,
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  demoEyebrow: {
    ...theme.typography.overline,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  demoTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  demoText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  demoSteps: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  demoStep: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceAlt,
    paddingVertical: theme.spacing.sm,
  },
  demoStepText: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  petSelectorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
  dropdownAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    overflow: 'hidden',
  },
  appointmentPetImage: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.lg,
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
  appointmentEmpty: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  appointmentEmptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
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
    overflow: 'hidden',
  },
  doctorImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  medicineImageInner: {
    width: 62,
    height: 62,
    borderRadius: 6,
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
  flashImageInner: {
    width: 75,
    height: 75,
    borderRadius: 8,
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
