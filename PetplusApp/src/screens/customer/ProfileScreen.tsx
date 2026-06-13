import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../utils/theme';
import Icon, { IconName } from '../../components/Icon';
import ModernCard from '../../components/ModernCard';
import { petService } from '../../services/firestoreService';

interface MenuItem {
  id: string;
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
}

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [petCount, setPetCount] = useState(0);

  useEffect(() => {
    const loadPetCount = async () => {
      if (user?.id) {
        const result = await petService.getPetsByOwner(user.id);
        if (result.success && result.pets) {
          setPetCount(result.pets.length);
        }
      }
    };
    loadPetCount();
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  const menuItems: MenuItem[] = [
    {
      id: '1',
      icon: 'paw',
      title: 'Hồ sơ thú cưng',
      subtitle: 'Quản lý thú cưng của bạn',
      onPress: () => navigation.navigate('PetsTab'),
    },
    {
      id: '2',
      icon: 'cart',
      title: 'Đơn hàng của tôi',
      subtitle: 'Xem lịch sử đơn hàng',
      onPress: () => navigation.navigate('Orders'),
    },
    {
      id: '3',
      icon: 'notifications',
      title: 'Nhắc nhở',
      subtitle: 'Quản lý thông báo sức khỏe',
      onPress: () => navigation.navigate('Reminders'),
    },
    {
      id: '4',
      icon: 'calendar',
      title: 'Lịch hẹn khám',
      subtitle: 'Xem các lịch hẹn sắp tới',
      onPress: () => navigation.navigate('ScheduleTab'),
    },
    {
      id: '5',
      icon: 'create',
      title: 'Cài đặt',
      subtitle: 'Thông báo, ngôn ngữ, bảo mật',
      onPress: () => {},
    },
    {
      id: '6',
      icon: 'information-circle',
      title: 'Trợ giúp',
      subtitle: 'Hỗ trợ và câu hỏi thường gặp',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          <Icon name="person" size={40} color={theme.colors.textOnPrimary} />
        </View>
        <Text style={styles.userName}>{user?.name || 'Người dùng'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
        <View style={styles.badge}>
          <Icon name="paw" size={12} color={theme.colors.textOnPrimary} />
          <Text style={styles.badgeText}>Khách hàng</Text>
        </View>
      </View>

      {/* Stats */}
      <ModernCard style={styles.statsCard} padding="lg">
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{petCount}</Text>
            <Text style={styles.statLabel}>Thú cưng</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Đơn hàng</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Lịch hẹn</Text>
          </View>
        </View>
      </ModernCard>

      {/* Menu */}
      <FlatList
        data={menuItems}
        renderItem={({ item }) => (
          <ModernCard onPress={item.onPress} style={styles.menuCard} padding="lg">
            <View style={styles.menuRow}>
              <View style={styles.menuIconWrap}>
                <Icon name={item.icon} size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
            </View>
          </ModernCard>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.menuList}
        showsVerticalScrollIndicator={false}
      />

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => setShowLogoutConfirm(true)}
      >
        <Text style={styles.logoutBtnText}>Đăng xuất</Text>
      </TouchableOpacity>

      {/* Logout Modal */}
      <Modal
        visible={showLogoutConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <ModernCard style={styles.modalCard} padding="xxl">
            <Icon name="arrow-forward" size={40} color={theme.colors.danger} />
            <Text style={styles.modalTitle}>Đăng xuất?</Text>
            <Text style={styles.modalText}>
              Bạn có chắc chắn muốn đăng xuất khỏi Petplus?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowLogoutConfirm(false)}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleLogout}
              >
                <Text style={styles.confirmBtnText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </ModernCard>
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
  profileCard: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: 'center',
    borderBottomLeftRadius: theme.radius.xxl,
    borderBottomRightRadius: theme.radius.xxl,
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textOnPrimary,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    marginTop: 8,
  },
  badgeText: {
    color: theme.colors.textOnPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  statsCard: {
    marginHorizontal: 16,
    marginTop: -16,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  menuList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  menuCard: {
    marginBottom: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconWrap: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  menuContent: {
    flex: 1,
  },
  logoutBtn: {
    marginHorizontal: 16,
    marginVertical: 12,
    marginBottom: 80,
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.dangerBg,
  },
  logoutBtnText: {
    color: theme.colors.danger,
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: theme.colors.surfaceAlt,
    paddingVertical: 14,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: theme.colors.danger,
    paddingVertical: 14,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: theme.colors.textOnPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
});
