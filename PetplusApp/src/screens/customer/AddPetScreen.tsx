import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { petService } from '../../services/firestoreService';
import { uploadImage, getPetAvatarPath } from '../../services/storageService';
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

export default function AddPetScreen({ route, navigation }: any) {
  const editPetId: string | undefined = route.params?.petId;
  const isEditing = !!editPetId;
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('dog');
  const [breed, setBreed] = useState('');
  const [weight, setWeight] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [drugAllergies, setDrugAllergies] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      loadPet();
    }
  }, []);

  const loadPet = async () => {
    const result = await petService.getPet(editPetId!);
    if (result.success && result.pet) {
      const p = result.pet;
      setName(p.name);
      setSpecies(p.species);
      setBreed(p.breed);
      setWeight(String(p.weight));
      if (p.birthDate) {
        const d = p.birthDate as any;
        if (typeof d === 'object' && 'seconds' in d) {
          setBirthDate(new Date(d.seconds * 1000).toISOString().split('T')[0]);
        } else {
          setBirthDate(new Date(d).toISOString().split('T')[0]);
        }
      }
      setMedicalHistory(p.medicalHistory || '');
      setDrugAllergies((p.drugAllergies || []).join(', '));
      if (p.avatarUrl) setAvatarUri(p.avatarUrl);
    }
    setInitialLoading(false);
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền bị từ chối', 'Cần quyền truy cập thư viện ảnh để chọn ảnh đại diện.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      setAvatarUri(result.assets[0].uri);
      setAvatarChanged(true);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền bị từ chối', 'Cần quyền truy cập camera để chụp ảnh.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      setAvatarUri(result.assets[0].uri);
      setAvatarChanged(true);
    }
  };

  const handleSave = async () => {
    if (!name || !breed || !weight) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền tên, giống và cân nặng');
      return;
    }
    setLoading(true);

    const petData = {
      name,
      species: species as any,
      breed,
      weight: parseFloat(weight),
      birthDate: new Date(birthDate || Date.now()),
      medicalHistory,
      drugAllergies: drugAllergies.split(',').map(s => s.trim()).filter(Boolean),
    };

    let petId: string | undefined;

    if (isEditing && editPetId) {
      const result = await petService.updatePet(editPetId, petData);
      if (!result.success) {
        setLoading(false);
        Alert.alert('Lỗi', 'Không thể cập nhật thú cưng');
        return;
      }
      petId = editPetId;

      if (avatarUri && avatarChanged) {
        setUploading(true);
        try {
          const avatarUrl = await uploadImage(avatarUri, getPetAvatarPath(petId));
          await petService.updatePet(petId, { avatarUrl });
        } catch (err) {
          console.log('[AddPet] upload failed:', err);
          Alert.alert('Lỗi tải ảnh', 'Không thể tải ảnh lên, hồ sơ vẫn được lưu.');
        }
        setUploading(false);
      }
    } else {
      const result = await petService.createPet({
        ...petData,
        ownerId: user?.id || 'demo_user',
        vaccinationHistory: [],
      });

      if (!result.success) {
        setLoading(false);
        Alert.alert('Lỗi', 'Không thể thêm thú cưng');
        return;
      }
      petId = result.id;

      if (avatarUri && result.id) {
        setUploading(true);
        try {
          const avatarUrl = await uploadImage(avatarUri, getPetAvatarPath(result.id));
          await petService.updatePet(result.id, { avatarUrl });
        } catch (err) {
          console.log('[AddPet] upload failed:', err);
        }
        setUploading(false);
      }
    }

    setLoading(false);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
      navigation.goBack();
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title={isEditing ? 'Chỉnh sửa hồ sơ' : 'Thêm thú cưng'}
        onBack={() => navigation.goBack()}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {initialLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Đang tải hồ sơ...</Text>
          </View>
        ) : (
        <View style={styles.content}>
          <TouchableOpacity style={styles.avatarPreview} onPress={handlePickAvatar} activeOpacity={0.7}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name={SPECIES.find(s => s.id === species)?.icon || 'paw'} size={60} color={theme.colors.primaryLight} />
              </View>
            )}
            <View style={styles.avatarActions}>
              <TouchableOpacity style={styles.avatarActionBtn} onPress={handlePickAvatar}>
                <Icon name="image" size={16} color={theme.colors.primary} />
                <Text style={styles.avatarActionText}>Chọn ảnh</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.avatarActionBtn} onPress={handleTakePhoto}>
                <Icon name="camera" size={16} color={theme.colors.primary} />
                <Text style={styles.avatarActionText}>Chụp ảnh</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarName}>{name || 'Tên thú cưng'}</Text>
          </TouchableOpacity>

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
            title={uploading ? 'Đang tải ảnh...' : loading ? 'Đang lưu...' : isEditing ? 'Cập nhật hồ sơ' : 'Lưu thú cưng'}
            onPress={handleSave}
            disabled={loading || uploading || initialLoading}
            fullWidth
            size="lg"
            style={{ marginTop: theme.spacing.lg }}
          />
        </View>
        )}
      </ScrollView>

      <Modal
        visible={showNotification}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotification(false)}
      >
        <View style={styles.notificationOverlay}>
          <View style={styles.notificationCard}>
            <Icon name="checkmark" size={24} color={theme.colors.success} />
            <Text style={styles.notificationText}>{isEditing ? 'Đã cập nhật hồ sơ thú cưng!' : `Đã thêm ${name} vào danh sách!`}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 120,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  avatarPreview: {
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  avatarActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  avatarActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primaryBg,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  avatarActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.primary,
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
