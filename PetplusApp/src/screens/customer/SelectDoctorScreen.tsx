import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';
import Header from '../../components/Header';
import Button from '../../components/Button';
import ModernCard from '../../components/ModernCard';
import Icon from '../../components/Icon';
import StepProgress from '../../components/StepProgress';
import { DOCTORS } from '../../data/doctors';

export default function SelectDoctorScreen({ route, navigation }: any) {
  const { branchId, petId, petName } = route.params;
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [autoAssign, setAutoAssign] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Chọn bác sĩ"
        subtitle="Bước 2 / 4"
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headerInfo}>
          <Text style={styles.stepText}>Bước 2 / 4</Text>
          <StepProgress current={2} total={4} />
          <Text style={styles.title}>Chọn bác sĩ phù hợp</Text>
          <Text style={styles.subtitle}>Có thể để hệ thống tự động gán bác sĩ khả dụng</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setAutoAssign(!autoAssign);
            setSelectedDoctor(null);
          }}
        >
          <ModernCard style={autoAssign ? { ...styles.autoAssignCard, ...styles.autoAssignCardSelected } : styles.autoAssignCard}>
            <View style={styles.autoAssignIcon}>
              <Icon name="flash" size={24} color={theme.colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.autoAssignTitle}>Tự động gán bác sĩ</Text>
              <Text style={styles.autoAssignDesc}>Hệ thống chọn bác sĩ available đầu tiên</Text>
            </View>
            {autoAssign && (
              <View style={styles.checkmark}>
                <Icon name="checkmark" size={14} color={theme.colors.textOnPrimary} />
              </View>
            )}
          </ModernCard>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Hoặc chọn bác sĩ cụ thể:</Text>

        {DOCTORS.map((doctor) => (
          <TouchableOpacity
            key={doctor.id}
            activeOpacity={0.8}
            onPress={() => {
              setSelectedDoctor(doctor.id);
              setAutoAssign(false);
            }}
          >
            <ModernCard style={selectedDoctor === doctor.id ? { ...styles.doctorCard, ...styles.doctorCardSelected } : styles.doctorCard}>
              <View style={styles.doctorAvatar}>
                <Image source={{ uri: doctor.imageUrl }} style={styles.doctorImage} />
              </View>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                <View style={styles.doctorMeta}>
                  <Icon name="star" size={12} color={theme.colors.warning} />
                  <Text style={styles.doctorRating}>{doctor.rating}</Text>
                  <Text style={styles.metaText}>({doctor.reviews} đánh giá)</Text>
                </View>
                <View style={styles.doctorMeta}>
                  <Icon name="calendar" size={11} color={theme.colors.textSecondary} />
                  <Text style={styles.metaText}>
                    {doctor.patients}/3 bệnh nhân hôm nay
                  </Text>
                </View>
              </View>
              {selectedDoctor === doctor.id && (
                <View style={styles.checkmark}>
                  <Icon name="checkmark" size={14} color={theme.colors.textOnPrimary} />
                </View>
              )}
            </ModernCard>
          </TouchableOpacity>
        ))}

        <View style={styles.footer}>
          <Button
            title="Tiếp tục"
            onPress={() => {
              if (selectedDoctor || autoAssign) {
                navigation.navigate('SelectTimeSlot', { 
                  branchId, 
                  doctorId: selectedDoctor || 'auto',
                  petId,
                  petName,
                });
              }
            }}
            disabled={!selectedDoctor && !autoAssign}
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
  autoAssignCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  autoAssignCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryBg,
  },
  autoAssignIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.warningBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  autoAssignTitle: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
  autoAssignDesc: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  doctorCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryBg,
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    gap: 4,
  },
  doctorRating: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.warning,
    marginLeft: 2,
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
