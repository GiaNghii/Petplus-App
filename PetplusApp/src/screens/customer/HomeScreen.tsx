import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { petService } from '../../services/firestoreService';
import { theme } from '../../utils/theme';
import { Pet } from '../../types';

const DOCTORS = [
  { id: 'dr-a', name: 'BS. Nguyễn Văn A', specialty: 'Nội khoa', status: 'available', avatar: '👨‍⚕️' },
  { id: 'dr-b', name: 'BS. Trần Thị B', specialty: 'Ngoại khoa', status: 'available', avatar: '👩‍⚕️' },
  { id: 'dr-c', name: 'BS. Lê Văn C', specialty: 'Da liễu', status: 'busy', avatar: '‍⚕️' },
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
  const petEmoji = selectedPet?.species === 'dog' ? '🐕' : selectedPet?.species === 'cat' ? '🐈' : '';

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
              <Text style={styles.petEmoji}>{petEmoji}</Text>
              <Text style={styles.petName}>{petName}</Text>
              <Text style={styles.petArrow}>▼</Text>
            </TouchableOpacity>
            <View style={styles.logoText}>
              <Text style={styles.logoEmoji}></Text>
              <Text style={styles.logoTitle}>PetCare</Text>
            </View>
            <TouchableOpacity style={styles.notificationBtn}>
              <Text style={styles.notificationIcon}></Text>
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Shop')}>
            <Text style={styles.searchIcon}>🔍</Text>
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
                  <Text style={styles.dropdownEmoji}>
                    {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : ''}
                  </Text>
                  <Text style={[
                    styles.dropdownText,
                    index === selectedPetIndex && styles.dropdownTextSelected
                  ]}>
                    {pet.name}
                  </Text>
                  {index === selectedPetIndex && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.dropdownAdd}
                onPress={() => {
                  setShowPetDropdown(false);
                  navigation.navigate('AddPet');
                }}
              >
                <Text style={styles.dropdownAddText}>➕ Thêm thú cưng mới</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: '#E8F5E9' }]}
            onPress={() => navigation.navigate('Chat', { doctorId: 'dr-a', doctorName: 'Nguyễn Văn A', petName: petName })}
          >
            <Text style={styles.quickActionIcon}></Text>
            <Text style={[styles.quickActionText, { color: '#2E7D32' }]}>Tư vấn ngay</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: '#F1F8E9' }]}
            onPress={() => navigation.navigate('ScheduleTab')}
          >
            <Text style={styles.quickActionIcon}>📅</Text>
            <Text style={[styles.quickActionText, { color: '#558B2F' }]}>Đặt lịch</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: '#F3E5F5' }]}
            onPress={() => navigation.navigate('Shop')}
          >
            <Text style={styles.quickActionIcon}>💊</Text>
            <Text style={[styles.quickActionText, { color: '#7B1FA2' }]}>Mua thuốc</Text>
          </TouchableOpacity>
        </View>

        {/* Appointment Card */}
        <View style={styles.appointmentCard}>
          <View style={styles.appointmentHeader}>
            <Text style={styles.appointmentTitle}>BẠN CÓ LỊCH KHÁM BỆNH SẮP TỚI</Text>
            <TouchableOpacity>
              <Text style={styles.viewDetail}>Xem chi tiết →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.appointmentContent}>
            <View style={styles.appointmentImage}>
              <Text style={styles.dogEmoji}>{petEmoji}</Text>
            </View>
            <View style={styles.appointmentInfo}>
              <View style={styles.appointmentRow}>
                <Text style={styles.appointmentLabel}>Ngày khám:</Text>
                <Text style={styles.appointmentValue}>dd/mm/yyyy</Text>
              </View>
              <View style={styles.appointmentRow}>
                <Text style={styles.appointmentLabel}>Khung giờ:</Text>
                <Text style={styles.appointmentValue}>10:00 - 12:00</Text>
              </View>
              <View style={styles.appointmentRow}>
                <Text style={styles.appointmentLabel}>Pet:</Text>
                <Text style={styles.appointmentValue}>{petName}</Text>
              </View>
              <View style={styles.appointmentRow}>
                <Text style={styles.appointmentLabel}>Bác sĩ:</Text>
                <Text style={styles.appointmentValue}>BS. Nguyễn B</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Doctors Online */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>CÁC BÁC SĨ ĐANG ONLINE</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.doctorCard}>
            <View style={styles.doctorAvatar}>
              <Text style={{ fontSize: 36 }}>👨⚕️</Text>
            </View>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>Bác sĩ C</Text>
              <Text style={styles.doctorSpecialty}>Chuyên gia nội khoa</Text>
            </View>
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => navigation.navigate('Chat', { doctorId: 'dr-c', doctorName: 'Bác sĩ C', petName: petName })}
            >
              <Text style={styles.chatButtonText}>Chat ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Purchased Medicines */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>CÁC ĐƠN THUỐC ĐÃ MUA</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
              <Text style={styles.viewAll}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.medicineScroll}>
            {[
              { name: 'Breeders Chow', price: '320.000 đ', rating: '4.8', image: '', color: '#E3F2FD' },
              { name: 'Medicated Special', price: '280.000 đ', rating: '4.7', image: '💊', color: '#F3E5F5' },
              { name: 'NutriPro 300', price: '150.000 đ', rating: '4.6', image: '🧴', color: '#E8F5E9' },
            ].map((item, index) => (
              <View key={index} style={styles.medicineCard}>
                <View style={[styles.medicineImage, { backgroundColor: item.color }]}>
                  <Text style={{ fontSize: 40 }}>{item.image}</Text>
                </View>
                <Text style={styles.medicineName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.medicinePrice}>{item.price}</Text>
                <View style={styles.medicineRating}>
                  <Text style={styles.medicineRatingText}>⭐ {item.rating}</Text>
                </View>
                <TouchableOpacity style={styles.rebuyButton}>
                  <Text style={styles.rebuyButtonText}>Mua lại</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Flash Sale */}
        <View style={styles.section}>
          <View style={styles.flashHeader}>
            <Text style={styles.flashTitle}> FLASH SALE</Text>
            <Text style={styles.flashTimer}>Kết thúc sau: 02:15:30</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.flashScroll}>
            {[
              { name: 'Pedigree cho chó trưởng thành', price: '199.000 đ', oldPrice: '250.000 đ', discount: '-20%', image: '🍖', color: '#FFF3E0' },
              { name: 'Sữa dinh dưỡng cho cún', price: '125.000 đ', oldPrice: '180.000 đ', discount: '-30%', image: '🥛', color: '#E3F2FD' },
              { name: 'Pate dinh dưỡng cho mèo', price: '89.000 đ', oldPrice: '120.000 đ', discount: '-25%', image: '🥫', color: '#F3E5F5' },
            ].map((item, index) => (
              <View key={index} style={styles.flashCard}>
                <View style={styles.flashImageContainer}>
                  <View style={[styles.flashImage, { backgroundColor: item.color }]}>
                    <Text style={{ fontSize: 40 }}>{item.image}</Text>
                  </View>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{item.discount}</Text>
                  </View>
                </View>
                <Text style={styles.flashName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.flashPrice}>{item.price}</Text>
                <Text style={styles.flashOldPrice}>{item.oldPrice}</Text>
                <TouchableOpacity style={styles.flashBuyButton}>
                  <Text style={styles.flashBuyText}>Mua ngay</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#FAFAF5',
  },
  header: {
    backgroundColor: '#E8F0E8',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
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
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  petEmoji: {
    fontSize: 16,
  },
  petName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  petArrow: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  logoText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoEmoji: {
    fontSize: 20,
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primaryDarker,
  },
  notificationBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationIcon: {
    fontSize: 18,
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.danger,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: theme.spacing.lg,
    height: 40,
    borderRadius: 20,
    gap: theme.spacing.sm,
  },
  searchIcon: {
    fontSize: 14,
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: 12,
    gap: theme.spacing.sm,
  },
  dropdownItemSelected: {
    backgroundColor: theme.colors.primaryBg,
  },
  dropdownEmoji: {
    fontSize: 20,
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
  checkmark: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '700',
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
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
  },
  quickActionIcon: {
    fontSize: 28,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentCard: {
    marginHorizontal: theme.spacing.lg,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  appointmentTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primaryDarker,
    flex: 1,
  },
  viewDetail: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  appointmentContent: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  appointmentImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dogEmoji: {
    fontSize: 48,
  },
  appointmentInfo: {
    flex: 1,
    gap: 6,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  viewAll: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: theme.spacing.md,
    borderRadius: 12,
    gap: theme.spacing.md,
  },
  doctorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  doctorSpecialty: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  chatButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chatButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  medicineScroll: {
    paddingRight: theme.spacing.lg,
  },
  medicineCard: {
    width: 120,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: theme.spacing.md,
    marginRight: theme.spacing.md,
    alignItems: 'center',
  },
  medicineImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  medicineName: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  medicinePrice: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.danger,
    marginBottom: 4,
  },
  medicineRating: {
    marginBottom: theme.spacing.sm,
  },
  medicineRatingText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  rebuyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rebuyButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  flashHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  flashTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.danger,
  },
  flashTimer: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  flashScroll: {
    paddingRight: theme.spacing.lg,
  },
  flashCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: theme.spacing.md,
    marginRight: theme.spacing.md,
  },
  flashImageContainer: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  flashImage: {
    width: '100%',
    height: 90,
    borderRadius: 12,
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
    borderRadius: 4,
  },
  discountText: {
    color: theme.colors.textOnPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  flashName: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
    minHeight: 30,
  },
  flashPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.danger,
  },
  flashOldPrice: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    textDecorationLine: 'line-through',
    marginBottom: theme.spacing.sm,
  },
  flashBuyButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
  },
  flashBuyText: {
    color: theme.colors.textOnPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
});
