import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { petService } from '../../services/firestoreService';
import { Pet } from '../../types';
import { theme } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import Icon from '../../components/Icon';
import { DOCTORS, Doctor } from '../../data/doctors';
import { useResponsive, desktopContainer, BREAKPOINTS } from '../../utils/responsive';

export default function DoctorSelectScreen({ navigation }: any) {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const { width, isDesktop } = useResponsive();

  const numColumns = width >= BREAKPOINTS.lg ? 3 : width >= BREAKPOINTS.md ? 2 : 1;
  const isGrid = numColumns > 1;

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    if (user?.id) {
      const result = await petService.getPetsByOwner(user.id);
      if (result.success && result.pets && result.pets.length > 0) {
        setPets(result.pets);
        setSelectedPetId(result.pets[0].id);
      }
    }
  };

  const sortedDoctors = [...DOCTORS].sort((a, b) => {
    const order: Record<string, number> = { online: 0, consulting: 1, examining: 2, offline: 3 };
    return order[a.status] - order[b.status];
  });

  const handleSelectDoctor = (doctor: typeof DOCTORS[0]) => {
    if (!selectedPetId) {
      Alert.alert('Chọn thú cưng', 'Vui lòng chọn thú cưng trước khi tư vấn');
      return;
    }
    const pet = pets.find(p => p.id === selectedPetId);
    const petName = pet?.name || 'Thú cưng';

    if (doctor.status === 'consulting' || doctor.status === 'examining') {
      Alert.alert(
        'Bác sĩ đang bận',
        `${doctor.name} hiện đang ${doctor.status === 'examining' ? 'khám bệnh' : 'tư vấn'}. Bác sĩ có thể reply trễ. Bạn có chấp nhận chờ?`,
        [
          { text: 'Không, chọn bác sĩ khác', style: 'cancel' },
          {
            text: 'Chấp nhận chờ',
            onPress: () => navigation.navigate('Chat', {
              doctorId: doctor.id,
              doctorName: doctor.name,
              petName: petName,
              petId: pet?.id,
            }),
          },
        ]
      );
    } else {
      navigation.navigate('Chat', {
        doctorId: doctor.id,
        doctorName: doctor.name,
        petName: petName,
        petId: pet?.id,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return theme.colors.success;
      case 'consulting': return theme.colors.info;
      case 'examining': return theme.colors.warning;
      case 'offline': return theme.colors.textTertiary;
      default: return theme.colors.textTertiary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'consulting': return 'Đang tư vấn';
      case 'examining': return 'Đang khám bệnh';
      case 'offline': return 'Offline';
      default: return status;
    }
  };

  const getPetIcon = (species: string): import('../../components/Icon').IconName => {
    switch (species) {
      case 'dog': return 'paw';
      case 'cat': return 'paw';
      default: return 'paw';
    }
  };

  const selectedPet = pets.find(p => p.id === selectedPetId);

  // Gap between grid columns
  const GRID_GAP = isDesktop ? 16 : 12;
  // Horizontal padding inside the max-width container
  const CONTENT_H_PAD = isDesktop ? 48 : theme.spacing.xl;

  // Card width for grid mode: divide available space evenly
  const cardWidth = isGrid
    ? (Math.min(width, 1200) - CONTENT_H_PAD * 2 - GRID_GAP * (numColumns - 1)) / numColumns
    : undefined;

  const renderDoctorCard = ({ item }: { item: typeof DOCTORS[0] }) => {
    if (isGrid) {
      // Vertical card layout for desktop grid
      return (
        <TouchableOpacity
          style={[
            styles.doctorCardGrid,
            { width: cardWidth },
          ]}
          onPress={() => handleSelectDoctor(item)}
          activeOpacity={0.8}
        >
          <View style={[
            styles.doctorAvatarGrid,
            { borderColor: getStatusColor(item.status) },
          ]}>
            <Image source={{ uri: item.imageUrl }} style={styles.doctorImageGrid} />
            <View style={[styles.onlineDotGrid, { backgroundColor: getStatusColor(item.status) }]} />
          </View>
          <Text style={styles.doctorNameGrid}>{item.name}</Text>
          <Text style={styles.doctorSpecialtyGrid}>{item.specialty}</Text>
          <View style={styles.doctorMetaGrid}>
            <Icon name="star" size={13} color={theme.colors.warning} />
            <Text style={styles.doctorRatingGrid}>{item.rating}</Text>
            <View style={styles.metaDot} />
            <View style={[styles.statusDotGrid, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={[styles.statusBadgeTextGrid, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.chatButtonGrid,
              item.status === 'offline' && { opacity: 0.4 },
            ]}
            onPress={() => handleSelectDoctor(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.chatButtonTextGrid}>
              {item.status === 'online' ? 'Chat ngay' : 'Liên hệ'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      );
    }

    // Mobile: original row layout
    return (
      <TouchableOpacity
        style={styles.doctorCard}
        onPress={() => handleSelectDoctor(item)}
        activeOpacity={0.8}
      >
        <View style={[
          styles.doctorAvatar,
          { borderColor: getStatusColor(item.status) },
        ]}>
          <Image source={{ uri: item.imageUrl }} style={styles.doctorImage} />
          <View style={[styles.onlineDot, { backgroundColor: getStatusColor(item.status) }]} />
        </View>
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{item.name}</Text>
          <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
          <View style={styles.doctorMeta}>
            <Icon name="star" size={12} color={theme.colors.warning} />
            <Text style={styles.doctorRating}>{item.rating}</Text>
            <View style={styles.metaDot} />
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
        <View style={[
          styles.chatButton,
          item.status === 'offline' && { opacity: 0.4 },
        ]}>
          <Text style={styles.chatButtonText}>
            {item.status === 'online' ? 'Chat ngay' : 'Liên hệ'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.innerContainer, isDesktop && desktopContainer]}>
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: CONTENT_H_PAD }]}>
          <Text style={[styles.greeting, isDesktop && styles.greetingDesktop]}>Tư vấn</Text>
          <Text style={[styles.subtitle, isDesktop && styles.subtitleDesktop]}>
            Chọn bác sĩ để bắt đầu tư vấn
          </Text>
        </View>

        {/* Select Pet */}
        <View style={[styles.petRow, { paddingHorizontal: CONTENT_H_PAD }]}>
          <Text style={styles.petLabel}>Tư vấn cho:</Text>
          <FlatList
            horizontal
            data={pets}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.petChip,
                  selectedPetId === item.id && styles.petChipSelected,
                  isDesktop && styles.petChipDesktop,
                ]}
                onPress={() => setSelectedPetId(item.id)}
              >
                <Icon
                  name={getPetIcon(item.species)}
                  size={isDesktop ? 18 : 16}
                  color={selectedPetId === item.id ? theme.colors.primaryDarker : theme.colors.textSecondary}
                />
                <Text style={[
                  styles.petChipText,
                  selectedPetId === item.id && styles.petChipTextSelected,
                  isDesktop && styles.petChipTextDesktop,
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.petChipList}
          />
        </View>

        {/* Doctor List */}
        <FlatList
          key={`doctors-cols-${numColumns}`}
          data={sortedDoctors}
          renderItem={renderDoctorCard}
          keyExtractor={(item) => item.id}
          numColumns={isGrid ? numColumns : 1}
          columnWrapperStyle={isGrid ? { gap: GRID_GAP } : undefined}
          contentContainerStyle={[
            styles.doctorList,
            { paddingHorizontal: CONTENT_H_PAD },
            isGrid && { gap: GRID_GAP },
          ]}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    paddingVertical: theme.spacing.lg,
  },
  greeting: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  greetingDesktop: {
    fontSize: 28,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  subtitleDesktop: {
    fontSize: 16,
    marginTop: theme.spacing.sm,
  },
  petRow: {
    marginBottom: theme.spacing.lg,
  },
  petLabel: {
    ...theme.typography.smallBold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  petChipList: {
    gap: theme.spacing.sm,
  },
  petChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    gap: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  petChipDesktop: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  petChipSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryBg,
  },
  petChipText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  petChipTextDesktop: {
    fontSize: 15,
  },
  petChipTextSelected: {
    fontWeight: '600',
    color: theme.colors.primaryDarker,
  },
  doctorList: {
    paddingBottom: 100,
  },

  // ── Mobile row card ──────────────────────────────────────────────
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadow.sm,
  },
  doctorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  doctorImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
  doctorSpecialty: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  doctorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  doctorRating: {
    fontSize: 12,
    color: theme.colors.warning,
    fontWeight: '600',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.textTertiary,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chatButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.pill,
  },
  chatButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Desktop grid card ────────────────────────────────────────────
  doctorCardGrid: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadow.sm,
  },
  doctorAvatarGrid: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  doctorImageGrid: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  onlineDotGrid: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  doctorNameGrid: {
    ...theme.typography.bodyBold,
    fontSize: 15,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  doctorSpecialtyGrid: {
    ...theme.typography.small,
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  doctorMetaGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: theme.spacing.lg,
  },
  doctorRatingGrid: {
    fontSize: 13,
    color: theme.colors.warning,
    fontWeight: '600',
  },
  statusDotGrid: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBadgeTextGrid: {
    fontSize: 13,
    fontWeight: '500',
  },
  chatButtonGrid: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.pill,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  chatButtonTextGrid: {
    color: theme.colors.textOnPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
