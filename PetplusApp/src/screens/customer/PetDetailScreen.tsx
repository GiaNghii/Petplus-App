import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { petService } from '../../services/firestoreService';
import { Pet } from '../../types';
import { theme } from '../../utils/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function PetDetailScreen({ route, navigation }: any) {
  const { petId } = route.params;
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPet();
  }, []);

  const loadPet = async () => {
    const result = await petService.getPet(petId);
    if (result.success && result.pet) {
      setPet(result.pet);
    }
    setLoading(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Xóa thú cưng?',
      `Bạn có chắc muốn xóa ${pet?.name}? Hành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            if (pet) {
              await petService.deletePet(pet.id);
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header
          title="Hồ sơ thú cưng"
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loading}>
          <Text>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header
          title="Hồ sơ thú cưng"
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loading}>
          <Text>Không tìm thấy thú cưng</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Hồ sơ thú cưng"
        onBack={() => navigation.goBack()}
        rightIcon="✏️"
        onRightPress={() => Alert.alert('Sắp có', 'Tính năng đang phát triển')}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Pet Header */}
        <View style={styles.petHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>
              {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'}
            </Text>
          </View>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petBreed}>
            {pet.species === 'dog' ? '🐕 Chó' : pet.species === 'cat' ? '🐈 Mèo' : '🐾 Khác'} • {pet.breed}
          </Text>
        </View>

        <View style={styles.content}>
          <Card style={styles.infoCard}>
            <Text style={styles.cardTitle}>📋 Thông tin cơ bản</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tên</Text>
              <Text style={styles.infoValue}>{pet.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Giống</Text>
              <Text style={styles.infoValue}>{pet.breed}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cân nặng</Text>
              <Text style={styles.infoValue}>{pet.weight}kg</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Ngày sinh</Text>
              <Text style={styles.infoValue}>
                {pet.birthDate ? new Date(pet.birthDate.seconds * 1000).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
              </Text>
            </View>
          </Card>

          <Card style={styles.infoCard}>
            <Text style={styles.cardTitle}>🏥 Tiền sử bệnh</Text>
            <Text style={styles.historyText}>
              {pet.medicalHistory || 'Chưa có tiền sử bệnh'}
            </Text>
          </Card>

          <Card style={styles.infoCard}>
            <Text style={styles.cardTitle}>⚠️ Dị ứng thuốc</Text>
            {pet.drugAllergies && pet.drugAllergies.length > 0 ? (
              <View style={styles.tagsContainer}>
                {pet.drugAllergies.map((allergy, index) => (
                  <View key={index} style={styles.allergyBadge}>
                    <Text style={styles.allergyText}>⚠️ {allergy}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.successBadge}>
                <Text style={styles.successText}>✅ Không có dị ứng ghi nhận</Text>
              </View>
            )}
          </Card>

          <Card style={styles.infoCard}>
            <Text style={styles.cardTitle}>💉 Lịch tiêm phòng</Text>
            {pet.vaccinationHistory && pet.vaccinationHistory.length > 0 ? (
              pet.vaccinationHistory.map((vaccine, index) => (
                <View key={index} style={styles.vaccineItem}>
                  <Text style={styles.vaccineCheck}>✅</Text>
                  <View style={styles.vaccineInfo}>
                    <Text style={styles.vaccineName}>{vaccine.name}</Text>
                    <Text style={styles.vaccineDate}>
                      {new Date(vaccine.date.seconds * 1000).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.historyText}>Chưa có lịch tiêm phòng</Text>
            )}
          </Card>

          <View style={styles.actions}>
            <Button
              title="✏️ Chỉnh sửa hồ sơ"
              onPress={() => Alert.alert('Sắp có', 'Tính năng đang phát triển')}
              fullWidth
            />
            <Button
              title="🗑️ Xóa thú cưng"
              onPress={handleDelete}
              variant="danger"
              fullWidth
              style={{ marginTop: theme.spacing.md }}
            />
          </View>
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
  scrollView: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petHeader: {
    padding: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadow.lg,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  petName: {
    ...theme.typography.h1,
    color: theme.colors.textOnPrimary,
  },
  petBreed: {
    ...theme.typography.body,
    color: theme.colors.textOnPrimary,
    opacity: 0.85,
    marginTop: theme.spacing.xs,
  },
  content: {
    padding: theme.spacing.lg,
  },
  infoCard: {
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    ...theme.typography.h4,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  infoLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  historyText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  allergyBadge: {
    backgroundColor: theme.colors.dangerBg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radius.round,
  },
  allergyText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.danger,
  },
  successBadge: {
    backgroundColor: theme.colors.successBg,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.success,
  },
  vaccineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  vaccineCheck: {
    fontSize: 18,
    marginRight: theme.spacing.md,
  },
  vaccineInfo: {
    flex: 1,
  },
  vaccineName: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
  vaccineDate: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    marginTop: theme.spacing.lg,
  },
});
