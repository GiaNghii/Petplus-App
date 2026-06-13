import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { petService } from '../../services/firestoreService';
import { theme } from '../../utils/theme';
import Button from '../../components/Button';
import ModernCard from '../../components/ModernCard';
import Icon from '../../components/Icon';
import StepProgress from '../../components/StepProgress';

const BRANCHES = [
  {
    id: 'go-vap',
    name: 'Petplus Gò Vấp',
    address: '123 Nguyễn Trãi, P.5, Q. Gò Vấp',
    phone: '028 1234 5678',
    distance: '2.5 km',
    doctors: 5,
    rating: 4.8,
  },
  {
    id: 'quan-11',
    name: 'Petplus Quận 11',
    address: '456 Lê Đại Hành, P.11, Q. 11',
    phone: '028 2345 6789',
    distance: '5.8 km',
    doctors: 4,
    rating: 4.7,
  },
  {
    id: 'quan-12',
    name: 'Petplus Quận 12',
    address: '789 Tô Ký, P. Tân Hưng Thuận, Q. 12',
    phone: '028 3456 7890',
    distance: '8.2 km',
    doctors: 4,
    rating: 4.9,
  },
];

export default function SelectBranchScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const { petId, petName } = route.params || {};
  const [resolvedPetId, setResolvedPetId] = useState<string | undefined>(petId);
  const [resolvedPetName, setResolvedPetName] = useState<string | undefined>(petName);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  const resolvePetInfo = useCallback(async () => {
    if (petId && petName) {
      setResolvedPetId(petId);
      setResolvedPetName(petName);
      return;
    }
    if (!user?.id) return;
    const result = await petService.getPetsByOwner(user.id);
    if (result.success && result.pets && result.pets.length > 0) {
      setResolvedPetId(result.pets[0].id);
      setResolvedPetName(result.pets[0].name);
    } else {
      Alert.alert('Chưa có thú cưng', 'Vui lòng thêm thú cưng trước khi đặt lịch.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [petId, petName, user?.id]);

  useFocusEffect(
    useCallback(() => {
      resolvePetInfo();
    }, [resolvePetInfo])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn chi nhánh</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headerInfo}>
          <Text style={styles.stepText}>Bước 1 / 4</Text>
          <StepProgress current={1} total={4} />
          <Text style={styles.title}>Bạn muốn khám ở chi nhánh nào?</Text>
          <Text style={styles.subtitle}>Chọn chi nhánh gần bạn nhất để thuận tiện di chuyển</Text>
        </View>

        {BRANCHES.map((branch) => (
          <TouchableOpacity
            key={branch.id}
            activeOpacity={0.8}
            onPress={() => setSelectedBranch(branch.id)}
          >
            <ModernCard style={selectedBranch === branch.id ? { ...styles.branchCard, ...styles.branchCardSelected } : styles.branchCard}>
              <View style={styles.branchHeader}>
                <View style={styles.branchIcon}>
                  <Icon name="medkit" size={24} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.branchName}>{branch.name}</Text>
                  <View style={styles.ratingRow}>
                    <View style={styles.rating}>
                      <Icon name="star" size={14} color={theme.colors.warning} />
                      <Text style={styles.ratingText}>{branch.rating}</Text>
                    </View>
                    <View style={styles.dot} />
                    <Text style={styles.doctorCount}>{branch.doctors} bác sĩ</Text>
                  </View>
                </View>
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceText}>{branch.distance}</Text>
                </View>
              </View>

              <View style={styles.branchInfo}>
                <View style={styles.infoRow}>
                  <Icon name="location" size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.infoText}>{branch.address}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="call" size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.infoText}>{branch.phone}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="time" size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.infoText}>Mở cửa 24/7</Text>
                </View>
              </View>

              {selectedBranch === branch.id && (
                <View style={styles.selectedBadge}>
                  <Icon name="checkmark" size={12} color={theme.colors.textOnPrimary} />
                  <Text style={styles.selectedBadgeText}>Đã chọn</Text>
                </View>
              )}
            </ModernCard>
          </TouchableOpacity>
        ))}

        <View style={styles.footer}>
          <Button
            title="Tiếp tục"
            onPress={() => {
              if (selectedBranch) {
                navigation.navigate('SelectDoctor', { branchId: selectedBranch, petId: resolvedPetId, petName: resolvedPetName });
              }
            }}
            disabled={!selectedBranch}
            fullWidth
            size="lg"
          />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.sm,
  },
  headerTitle: {
    ...theme.typography.h4,
    color: theme.colors.textPrimary,
  },
  content: {
    padding: theme.spacing.xl,
    paddingBottom: 100,
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
  branchCard: {
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  branchCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryBg,
  },
  branchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  branchIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  branchName: {
    ...theme.typography.h4,
    color: theme.colors.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: theme.spacing.sm,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    ...theme.typography.smallBold,
    color: theme.colors.warning,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.textTertiary,
  },
  doctorCount: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  distanceBadge: {
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  branchInfo: {
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  infoText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  selectedBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectedBadgeText: {
    color: theme.colors.textOnPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
});
