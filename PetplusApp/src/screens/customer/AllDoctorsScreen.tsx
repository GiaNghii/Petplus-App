import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { petService } from '../../services/firestoreService';
import { Pet } from '../../types';
import { theme } from '../../utils/theme';
import Header from '../../components/Header';
import Icon from '../../components/Icon';
import ModernCard from '../../components/ModernCard';
import Button from '../../components/Button';
import { DOCTORS, Doctor } from '../../data/doctors';

const BRANCH_NAMES: Record<string, string> = {
  'go-vap': 'Gò Vấp',
  'quan-11': 'Quận 11',
  'quan-12': 'Quận 12',
};

const STATUS_ORDER: Record<string, number> = {
  online: 0,
  consulting: 1,
  examining: 2,
  offline: 3,
};

const getStatusColor = (status: Doctor['status']) => {
  switch (status) {
    case 'online': return theme.colors.success;
    case 'consulting': return theme.colors.info;
    case 'examining': return theme.colors.warning;
    case 'offline': return theme.colors.textTertiary;
  }
};

const getStatusText = (status: Doctor['status']) => {
  switch (status) {
    case 'online': return 'Online';
    case 'consulting': return 'Đang tư vấn';
    case 'examining': return 'Đang khám bệnh';
    case 'offline': return 'Offline';
  }
};

const getBranchName = (branches: string[]) => {
  if (branches.length === 1) return BRANCH_NAMES[branches[0]] || branches[0];
  const names = branches.map(b => BRANCH_NAMES[b] || b);
  return names.join(', ');
};

export default function AllDoctorsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [showNotification, setShowNotification] = useState(false);
  const [notifTimer, setNotifTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const sortedDoctors = [...DOCTORS].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
  const activeCount = DOCTORS.filter(d => d.status !== 'offline').length;

  const showBusyNotification = () => {
    setShowNotification(true);
    if (notifTimer) clearTimeout(notifTimer);
    const timer = setTimeout(() => setShowNotification(false), 2000);
    setNotifTimer(timer);
  };

  const dismissNotification = () => {
    if (notifTimer) clearTimeout(notifTimer);
    setShowNotification(false);
  };

  const handleChatPress = async (doctor: Doctor) => {
    if (doctor.status === 'offline') return;

    if (doctor.status === 'consulting' || doctor.status === 'examining') {
      showBusyNotification();
    }

    let petName = 'Thú cưng';
    let petId: string | undefined;

    if (user?.id) {
      const result = await petService.getPetsByOwner(user.id);
      if (result.success && result.pets && result.pets.length > 0) {
        petName = result.pets[0].name;
        petId = result.pets[0].id;
      }
    }

    navigation.navigate('Chat', {
      doctorId: doctor.id,
      doctorName: doctor.name,
      petName,
      petId,
    });
  };

  const renderDoctor = ({ item }: { item: Doctor }) => (
    <ModernCard style={styles.doctorCard} padding="md">
      <View style={styles.doctorRow}>
        <View style={styles.avatarWrap}>
          <View style={[styles.avatarBorder, { borderColor: getStatusColor(item.status) }]}>
            <Image source={{ uri: item.imageUrl }} style={styles.avatar} />
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          </View>
        </View>

        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.doctorSpecialty} numberOfLines={1}>{item.specialty}</Text>
          <View style={styles.doctorMeta}>
            <Icon name="location" size={10} color={theme.colors.textSecondary} />
            <Text style={styles.doctorBranch} numberOfLines={1}>{getBranchName(item.branches)}</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <Button
          title="Chat ngay"
          size="sm"
          disabled={item.status === 'offline'}
          onPress={() => handleChatPress(item)}
        />
      </View>
    </ModernCard>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Tất cả bác sĩ"
        subtitle={`${activeCount} bác sĩ đang hoạt động`}
        onBack={() => navigation.goBack()}
        showBack
      />

      <FlatList
        data={sortedDoctors}
        renderItem={renderDoctor}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <Modal
        visible={showNotification}
        transparent
        animationType="fade"
        onRequestClose={dismissNotification}
      >
        <TouchableOpacity
          style={styles.notificationOverlay}
          activeOpacity={1}
          onPress={dismissNotification}
        >
          <View style={styles.notificationCard}>
            <Icon name="information-circle" size={24} color={theme.colors.warning} />
            <Text style={styles.notificationText}>
              Bác sĩ có thể không reply ngay lập tức do đang bận
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.huge,
  },
  separator: {
    height: theme.spacing.sm,
  },
  doctorCard: {},
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatarWrap: {},
  avatarBorder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    ...theme.typography.bodyBold,
    fontSize: 15,
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
  doctorBranch: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  notificationOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: theme.spacing.xxxl,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    gap: theme.spacing.md,
    ...theme.shadow.lg,
  },
  notificationText: {
    ...theme.typography.small,
    color: theme.colors.textPrimary,
    flex: 1,
  },
});
