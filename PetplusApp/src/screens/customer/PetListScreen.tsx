import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { petService } from '../../services/firestoreService';
import { Pet } from '../../types';
import { theme } from '../../utils/theme';
import Button from '../../components/Button';
import ModernCard from '../../components/ModernCard';
import Header from '../../components/Header';
import Icon from '../../components/Icon';
import { useResponsive, desktopContainer, gridItemWidth } from '../../utils/responsive';

const GRID_GAP = 16;
const DESKTOP_H_PADDING = 48;

export default function PetListScreen({ navigation }: any) {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  const { isDesktop, width } = useResponsive();

  // Container width after the max-width cap and horizontal padding
  const containerWidth = Math.min(width, 1200) - (isDesktop ? DESKTOP_H_PADDING * 2 : theme.spacing.xl * 2);
  const cardWidth = isDesktop
    ? gridItemWidth(2, GRID_GAP, containerWidth)
    : undefined;

  const avatarSize = isDesktop ? 72 : 60;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadPets);
    return unsubscribe;
  }, [navigation]);

  const loadPets = async () => {
    if (user?.id) {
      const result = await petService.getPetsByOwner(user.id);
      if (result.success && result.pets) {
        setPets(result.pets);
      }
      setLoading(false);
    }
  };

  const showNotificationPopup = (message: string, type: 'success' | 'error' = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const handleDeletePet = (pet: Pet) => {
    Alert.alert(
      'Xóa thú cưng?',
      `Bạn có chắc muốn xóa ${pet.name}? Hành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await petService.deletePet(pet.id);
            setPets(prev => prev.filter(p => p.id !== pet.id));
            showNotificationPopup(`Đã xóa ${pet.name} khỏi danh sách`, 'success');
          },
        },
      ]
    );
  };

  const getPetIconName = (species: string) => {
    switch (species) {
      case 'dog': return 'paw';
      case 'cat': return 'paw-outline';
      default: return 'paw';
    }
  };

  const getPetColor = (species: string) => {
    switch (species) {
      case 'dog': return theme.colors.dog;
      case 'cat': return theme.colors.cat;
      default: return theme.colors.other;
    }
  };

  const calculateAge = (birthDate: any) => {
    if (!birthDate) return 'Chưa rõ';
    const date = birthDate.seconds ? new Date(birthDate.seconds * 1000) : new Date(birthDate);
    const diff = Date.now() - date.getTime();
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    if (years > 0) return `${years} tuổi`;
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    return `${months} tháng tuổi`;
  };

  const renderPet = ({ item, index }: { item: Pet; index: number }) => {
    // On desktop even-indexed cards get a right margin to form the gap between columns
    const isLeftColumn = isDesktop && index % 2 === 0;

    return (
      <View
        style={[
          styles.petCardWrapper,
          isDesktop && {
            width: cardWidth,
            marginRight: isLeftColumn ? GRID_GAP : 0,
            marginBottom: GRID_GAP,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('PetDetail', { petId: item.id })}
          activeOpacity={0.8}
          style={styles.petCardTouchable}
        >
          <ModernCard style={[styles.petCard, isDesktop && styles.petCardDesktop]}>
            <View style={styles.petHeader}>
              <View style={[
                styles.petAvatar,
                {
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize / 2,
                  backgroundColor: item.avatarUrl ? 'transparent' : getPetColor(item.species) + '20',
                },
              ]}>
                {item.avatarUrl ? (
                  <Image
                    source={{ uri: item.avatarUrl }}
                    style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
                  />
                ) : (
                  <Icon name={getPetIconName(item.species)} size={isDesktop ? 34 : 28} color={getPetColor(item.species)} />
                )}
              </View>
              <View style={styles.petInfo}>
                <Text style={styles.petName}>{item.name}</Text>
                <Text style={styles.petBreed}>{item.breed}</Text>
                <View style={styles.petMeta}>
                  <View style={styles.metaItem}>
                    <Icon name="medkit" size={12} color={theme.colors.textSecondary} />
                    <Text style={styles.metaText}>{item.weight}kg</Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaItem}>
                    <Icon name="calendar" size={12} color={theme.colors.textSecondary} />
                    <Text style={styles.metaText}>{calculateAge(item.birthDate)}</Text>
                  </View>
                </View>
              </View>
              <Icon name="chevron-forward" size={28} color={theme.colors.textTertiary} />
            </View>

            {(item.medicalHistory || (item.drugAllergies && item.drugAllergies.length > 0)) && (
              <View style={styles.petTags}>
                {item.medicalHistory && (
                  <View style={[styles.tag, styles.tagWarning]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Icon name="warning" size={11} color={theme.colors.warning} />
                      <Text style={styles.tagTextWarning}>Có bệnh sử</Text>
                    </View>
                  </View>
                )}
                {item.drugAllergies && item.drugAllergies.length > 0 && (
                  <View style={[styles.tag, styles.tagDanger]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Icon name="alert-circle" size={11} color={theme.colors.danger} />
                      <Text style={styles.tagTextDanger}>Dị ứng {item.drugAllergies.length}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </ModernCard>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePet(item)}
        >
          <Icon name="trash" size={20} color={theme.colors.danger} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Desktop header area with prominent Add button */}
      {isDesktop ? (
        <View style={styles.desktopHeaderArea}>
          <View style={[desktopContainer, styles.desktopHeaderInner]}>
            <View>
              <Text style={styles.desktopTitle}>Thú cưng của tôi</Text>
              <Text style={styles.desktopSubtitle}>{pets.length} thành viên trong gia đình</Text>
            </View>
            <Button
              title="Thêm thú cưng"
              icon="add"
              onPress={() => navigation.navigate('AddPet')}
            />
          </View>
        </View>
      ) : (
        <Header
          title="Thú cưng của tôi"
          subtitle={`${pets.length} thành viên trong gia đình`}
          showBack={false}
          rightIcon="add"
          onRightPress={() => navigation.navigate('AddPet')}
        />
      )}

      <FlatList
        data={pets}
        renderItem={renderPet}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          isDesktop && styles.listDesktop,
        ]}
        // On desktop render as a wrapping row; on mobile keep default single-column list
        columnWrapperStyle={isDesktop && pets.length > 0 ? styles.columnWrapper : undefined}
        numColumns={isDesktop ? 2 : 1}
        key={isDesktop ? 'desktop' : 'mobile'}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={{ marginBottom: theme.spacing.lg }}>
              <Icon name="paw" size={80} color={theme.colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có thú cưng</Text>
            <Text style={styles.emptyText}>
              Thêm thú cưng đầu tiên để bắt đầu chăm sóc sức khỏe
            </Text>
            <Button
              title="Thêm thú cưng ngay"
              onPress={() => navigation.navigate('AddPet')}
              icon="add"
              style={{ marginTop: theme.spacing.lg }}
            />
          </View>
        }
      />

      {/* FAB only on mobile */}
      {!isDesktop && pets.length > 0 && (
        <View style={styles.fab}>
          <Button
            title="Thêm thú cưng"
            icon="add"
            onPress={() => navigation.navigate('AddPet')}
            fullWidth
          />
        </View>
      )}

      {/* Notification Popup */}
      <Modal
        visible={showNotification}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotification(false)}
      >
        <View style={styles.notificationOverlay}>
          <View style={[
            styles.notificationCard,
            notificationType === 'success' ? styles.notificationSuccess : styles.notificationError
          ]}>
            <Icon
              name={notificationType === 'success' ? 'checkmark' : 'close'}
              size={24}
              color={notificationType === 'success' ? theme.colors.success : theme.colors.danger}
            />
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
  // ── Desktop header ──────────────────────────────────────────────────────────
  desktopHeaderArea: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: DESKTOP_H_PADDING,
  },
  desktopHeaderInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  desktopTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  desktopSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  // ── List layout ─────────────────────────────────────────────────────────────
  list: {
    padding: theme.spacing.xl,
    paddingBottom: 120,
  },
  listDesktop: {
    ...desktopContainer,
    paddingHorizontal: DESKTOP_H_PADDING,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    alignSelf: 'center',
    width: '100%',
  },
  columnWrapper: {
    // FlatList columnWrapperStyle — items sit side by side; gap handled per-card
  },
  // ── Pet card ─────────────────────────────────────────────────────────────────
  petCardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    flex: 1,
  },
  petCardTouchable: {
    flex: 1,
  },
  petCard: {
    flex: 1,
  },
  petCardDesktop: {
    padding: theme.spacing.lg,
  },
  petHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  petAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    ...theme.typography.h4,
    color: theme.colors.textPrimary,
  },
  petBreed: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  petMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.sm,
  },
  petTags: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  tagWarning: {
    backgroundColor: theme.colors.warningBg,
  },
  tagTextWarning: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.warning,
  },
  tagDanger: {
    backgroundColor: theme.colors.dangerBg,
  },
  tagTextDanger: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.danger,
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.dangerBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  // ── Empty state ──────────────────────────────────────────────────────────────
  empty: {
    alignItems: 'center',
    paddingVertical: theme.spacing.huge,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  // ── FAB (mobile only) ────────────────────────────────────────────────────────
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    left: theme.spacing.xl,
    right: theme.spacing.xl,
  },
  // ── Notification ─────────────────────────────────────────────────────────────
  notificationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.md,
    shadowColor: theme.colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 280,
  },
  notificationSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  notificationError: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.danger,
  },
  notificationText: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
    flex: 1,
  },
});
