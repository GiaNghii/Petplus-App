import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { petService } from '../../services/firestoreService';
import { theme } from '../../utils/theme';
import Header from '../../components/Header';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ModernCard from '../../components/ModernCard';
import Icon from '../../components/Icon';

const SPECIES: { id: string; label: string; icon: import('../../components/Icon').IconName; color: string }[] = [
  { id: 'dog', label: 'Chó', icon: 'paw', color: theme.colors.dog },
  { id: 'cat', label: 'Mèo', icon: 'paw-outline', color: theme.colors.cat },
  { id: 'other', label: 'Khác', icon: 'paw', color: theme.colors.other },
];

export default function AddPetScreen({ navigation }: any) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('dog');
  const [breed, setBreed] = useState('');
  const [weight, setWeight] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [drugAllergies, setDrugAllergies] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const handleSave = async () => {
    if (!name || !breed || !weight) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền tên, giống và cân nặng');
      return;
    }
    setLoading(true);
    const result = await petService.createPet({
      ownerId: user?.id || 'demo_user',
      name,
      species: species as any,
      breed,
      weight: parseFloat(weight),
      birthDate: new Date(birthDate || Date.now()),
      medicalHistory,
      drugAllergies: drugAllergies.split(',').map(s => s.trim()).filter(Boolean),
      vaccinationHistory: [],
    });
    setLoading(false);
    if (result.success) {
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
        navigation.goBack();
      }, 1500);
    } else {
      Alert.alert('Lỗi', 'Không thể thêm thú cưng');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Thêm thú cưng"
        onBack={() => navigation.goBack()}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Avatar Preview */}
          <View style={styles.avatarPreview}>
            <Icon name={SPECIES.find(s => s.id === species)?.icon || 'paw'} size={80} color={theme.colors.primary} />
            <Text style={styles.avatarName}>{name || 'Tên thú cưng'}</Text>
          </View>

          <ModernCard style={styles.formCard}>
            <Text style={styles.sectionLabel}>Thông tin cơ bản</Text>
            
            <Input
              label="Tên thú cưng *"
              placeholder="Ví dụ: Buddy, Mimi..."
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.fieldLabel}>Loài *</Text>
            <View style={styles.speciesGrid}>
              {SPECIES.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.speciesCard,
                    species === s.id && { 
                      borderColor: s.color,
                      backgroundColor: s.color + '10'
                    }
                  ]}
                  onPress={() => setSpecies(s.id)}
                >
                  <Icon name={s.icon} size={32} color={species === s.id ? s.color : theme.colors.textSecondary} style={{ marginBottom: 4 }} />
                  <Text style={[
                    styles.speciesLabel,
                    species === s.id && { color: s.color, fontWeight: '600' }
                  ]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Giống *"
              placeholder="Ví dụ: Poodle, Husky, Ba Tư..."
              value={breed}
              onChangeText={setBreed}
            />

            <Input
              label="Cân nặng (kg) *"
              placeholder="Ví dụ: 5.5"
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
            />

            <Input
              label="Ngày sinh (YYYY-MM-DD)"
              placeholder="2023-01-15"
              value={birthDate}
              onChangeText={setBirthDate}
            />
          </ModernCard>

          <ModernCard style={styles.formCard}>
            <Text style={styles.sectionLabel}>Thông tin y tế</Text>
            
            <Input
              label="Tiền sử bệnh"
              placeholder="Các bệnh đã từng mắc, phẫu thuật..."
              value={medicalHistory}
              onChangeText={setMedicalHistory}
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />

            <Input
              label="Dị ứng thuốc (phân cách bằng dấu phẩy)"
              placeholder="Penicillin, Aspirin..."
              value={drugAllergies}
              onChangeText={setDrugAllergies}
            />

            <View style={styles.infoBox}>
              <Icon name="information-circle" size={16} color={theme.colors.primary} style={{ marginTop: 2 }} />
              <Text style={styles.infoText}>
                Thông tin y tế giúp bác sĩ chẩn đoán chính xác và tránh kê đơn thuốc gây dị ứng.
              </Text>
            </View>
          </ModernCard>

          <Button
            title={loading ? 'Đang lưu...' : 'Lưu thú cưng'}
            onPress={handleSave}
            disabled={loading}
            fullWidth
            size="lg"
            style={{ marginTop: theme.spacing.lg }}
          />
        </View>
      </ScrollView>

      {/* Notification Popup */}
      <Modal
        visible={showNotification}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotification(false)}
      >
        <View style={styles.notificationOverlay}>
          <View style={styles.notificationCard}>
            <Icon name="checkmark" size={24} color={theme.colors.success} />
            <Text style={styles.notificationText}>Đã thêm {name} vào danh sách!</Text>
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
  content: {
    padding: theme.spacing.xl,
  },
  avatarPreview: {
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  avatarName: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.sm,
  },
  formCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  sectionLabel: {
    ...theme.typography.h4,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  fieldLabel: {
    ...theme.typography.smallBold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  speciesGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  speciesCard: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  speciesLabel: {
    fontSize: 13,
    color: theme.colors.textPrimary,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.infoBg,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
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
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  notificationText: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
});
