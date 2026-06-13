import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { theme } from '../../utils/theme';
import Icon, { IconName } from '../../components/Icon';
import ModernCard from '../../components/ModernCard';
import { appointmentService, orderService, petService } from '../../services/firestoreService';
import { resetDemoData } from '../../services/mockDataService';
import { useResponsive } from '../../utils/responsive';

interface MenuItem {
  id: string;
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
}

export default function ProfileScreen({ navigation }: any) {
  const { user } = useAuth();
  const { clearCart } = useCart();
  const { isDesktop } = useResponsive();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [petCount, setPetCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      if (user?.id) {
        const [petResult, orderResult, appointmentResult] = await Promise.all([
          petService.getPetsByOwner(user.id),
          orderService.getOrdersByCustomer(user.id),
          appointmentService.getAppointmentsByCustomer(user.id),
        ]);
        if (petResult.success && petResult.pets) {
          setPetCount(petResult.pets.length);
        }
        if (orderResult.success && orderResult.orders) {
          setOrderCount(orderResult.orders.length);
        }
        if (appointmentResult.success && appointmentResult.appointments) {
          setAppointmentCount(appointmentResult.appointments.length);
        }
      }
    };
    const unsubscribe = navigation.addListener('focus', loadStats);
    loadStats();
    return unsubscribe;
  }, [user]);

  const handleResetDemo = async () => {
    await resetDemoData();
    clearCart();
    setShowResetConfirm(false);
    setPetCount(2);
    setOrderCount(3);
    setAppointmentCount(0);
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
      title: 'Khôi phục dữ liệu demo',
      subtitle: 'Khôi phục thú cưng, đơn hàng và lịch hẹn mẫu',
      onPress: () => setShowResetConfirm(true),
    },
    {
      id: '6',
      icon: 'information-circle',
      title: 'Trợ giúp',
      subtitle: 'Hỗ trợ và câu hỏi thường gặp',
      onPress: () => {},
    },
  ];

  // ── Left panel (avatar + stats) — shared between layouts ──────────────────
  const LeftPanel = () => (
    <View style={isDesktop ? styles.leftPanel : undefined}>
      {/* Avatar card */}
      <ModernCard
        style={isDesktop ? styles.avatarCardDesktop : styles.profileCard}
        padding="lg"
      >
        <View style={[styles.avatarWrap, isDesktop && styles.avatarWrapDesktop]}>
          <Icon
            name="person"
            size={isDesktop ? 56 : 40}
            color={theme.colors.textOnPrimary}
          />
        </View>
        <Text style={[styles.userName, isDesktop && styles.userNameDesktop]}>
          {user?.name || 'Người dùng'}
        </Text>
        <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
        <View style={styles.badge}>
          <Icon name="paw" size={12} color={theme.colors.textOnPrimary} />
          <Text style={styles.badgeText}>Khách hàng</Text>
        </View>
      </ModernCard>

      {/* Stats card */}
      <ModernCard
        style={isDesktop ? styles.statsCardDesktop : styles.statsCard}
        padding="lg"
      >
        <View style={isDesktop ? styles.statsColDesktop : styles.statsRow}>
          <View style={[styles.statItem, isDesktop && styles.statItemDesktop]}>
            <Text style={styles.statNumber}>{petCount}</Text>
            <Text style={styles.statLabel}>Thú cưng</Text>
          </View>
          {isDesktop ? (
            <View style={styles.statDividerHorizontal} />
          ) : (
            <View style={styles.statDivider} />
          )}
          <View style={[styles.statItem, isDesktop && styles.statItemDesktop]}>
            <Text style={styles.statNumber}>{orderCount}</Text>
            <Text style={styles.statLabel}>Đơn hàng</Text>
          </View>
          {isDesktop ? (
            <View style={styles.statDividerHorizontal} />
          ) : (
            <View style={styles.statDivider} />
          )}
          <View style={[styles.statItem, isDesktop && styles.statItemDesktop]}>
            <Text style={styles.statNumber}>{appointmentCount}</Text>
            <Text style={styles.statLabel}>Lịch hẹn</Text>
          </View>
        </View>
      </ModernCard>
    </View>
  );

  // ── Right panel (menu list) ────────────────────────────────────────────────
  const RightPanel = () => (
    <View style={isDesktop ? styles.rightPanel : styles.menuListMobile}>
      {menuItems.map((item) => (
        <ModernCard
          key={item.id}
          onPress={item.onPress}
          style={styles.menuCard}
          padding="lg"
        >
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
      ))}
    </View>
  );

  // ── Desktop layout ─────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.desktopScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.desktopInner}>
            <LeftPanel />
            <RightPanel />
          </View>
        </ScrollView>

        <ResetModal
          visible={showResetConfirm}
          onCancel={() => setShowResetConfirm(false)}
          onConfirm={handleResetDemo}
        />
      </SafeAreaView>
    );
  }

  // ── Mobile layout ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Profile Header (full-bleed primary banner on mobile) */}
      <View style={styles.profileCardMobile}>
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

      <FlatList
        data={menuItems}
        ListHeaderComponent={() => (
          <ModernCard style={styles.statsCard} padding="lg">
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{petCount}</Text>
                <Text style={styles.statLabel}>Thú cưng</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{orderCount}</Text>
                <Text style={styles.statLabel}>Đơn hàng</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{appointmentCount}</Text>
                <Text style={styles.statLabel}>Lịch hẹn</Text>
              </View>
            </View>
          </ModernCard>
        )}
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
        contentContainerStyle={styles.menuListMobile}
        showsVerticalScrollIndicator={false}
      />

      <ResetModal
        visible={showResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={handleResetDemo}
      />
    </SafeAreaView>
  );
}

// ── Extracted modal to avoid duplication ────────────────────────────────────
function ResetModal({
  visible,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <ModernCard style={styles.modalCard} padding="xxl">
          <Icon name="information-circle" size={40} color={theme.colors.primary} />
          <Text style={styles.modalTitle}>Khôi phục dữ liệu demo?</Text>
          <Text style={styles.modalText}>
            Thao tác này khôi phục dữ liệu demo: thú cưng mẫu, đơn hàng mẫu, xóa lịch hẹn mới và giỏ hàng hiện tại.
          </Text>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
              <Text style={styles.confirmBtnText}>Khôi phục</Text>
            </TouchableOpacity>
          </View>
        </ModernCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // ── Desktop layout ──────────────────────────────────────────────────────
  desktopScroll: {
    flexGrow: 1,
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  desktopInner: {
    flexDirection: 'row',
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    gap: 24,
    alignItems: 'flex-start',
  },
  leftPanel: {
    width: '35%',
    gap: 16,
  },
  rightPanel: {
    flex: 1,
    gap: 10,
  },

  // Avatar card on desktop (card with colored background)
  avatarCardDesktop: {
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    paddingVertical: 28,
    borderRadius: theme.radius.xl,
  },
  avatarWrapDesktop: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userNameDesktop: {
    fontSize: 18,
  },

  // Stats stacked vertically on desktop
  statsCardDesktop: {
    borderRadius: theme.radius.xl,
  },
  statsColDesktop: {
    flexDirection: 'column',
    gap: 4,
  },
  statItemDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  statDividerHorizontal: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: 4,
  },

  // ── Mobile layout ───────────────────────────────────────────────────────
  profileCardMobile: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: 'center',
    borderBottomLeftRadius: theme.radius.xxl,
    borderBottomRightRadius: theme.radius.xxl,
  },
  // Keep legacy name for shared mobile banner (used in mobile branch)
  profileCard: {
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    paddingVertical: 28,
    borderRadius: theme.radius.xl,
  },
  statsCard: {
    marginHorizontal: 16,
    marginTop: -16,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
  },
  menuListMobile: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 96,
  },

  // ── Shared ──────────────────────────────────────────────────────────────
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
  menuContent: {
    flex: 1,
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

  // ── Modal ───────────────────────────────────────────────────────────────
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
