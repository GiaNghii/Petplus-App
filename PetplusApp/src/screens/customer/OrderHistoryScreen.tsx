import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/firestoreService';
import { Order } from '../../types';
import { theme } from '../../utils/theme';
import Header from '../../components/Header';

export default function OrderHistoryScreen({ navigation }: any) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    if (user?.id) {
      const result = await orderService.getOrdersByCustomer(user.id);
      if (result.success && result.orders) {
        setOrders(result.orders as Order[]);
      }
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ xử lý' },
    { id: 'shipped', label: 'Đang giao' },
    { id: 'delivered', label: 'Hoàn thành' },
  ];

  const getStatusInfo = (status: string) => {
    const map: Record<string, { label: string; color: string; progress: number }> = {
      pending: { label: 'Chờ xử lý', color: '#F57C00', progress: 25 },
      preparing: { label: 'Đang chuẩn bị', color: '#1976D2', progress: 50 },
      shipped: { label: 'Đang giao', color: '#7B1FA2', progress: 75 },
      delivered: { label: 'Đã giao', color: '#2E7D32', progress: 100 },
      cancelled: { label: 'Đã hủy', color: '#D32F2F', progress: 0 },
    };
    return map[status] || map.pending;
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const status = getStatusInfo(item.status);
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>#{item.id?.slice(-6).toUpperCase()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.orderItems}>
          {item.items?.slice(0, 2).map((orderItem, index) => (
            <View key={index} style={styles.orderItem}>
              <Text style={styles.itemEmoji}>💊</Text>
              <Text style={styles.itemText} numberOfLines={1}>
                {orderItem.quantity}x Thuốc #{orderItem.productId?.slice(-4)}
              </Text>
            </View>
          ))}
          {item.items && item.items.length > 2 && (
            <Text style={styles.moreItems}>+{item.items.length - 2} sản phẩm khác</Text>
          )}
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${status.progress}%`, backgroundColor: status.color },
            ]}
          />
        </View>

        <View style={styles.orderFooter}>
          <View>
            <Text style={styles.footerLabel}>Tổng tiền</Text>
            <Text style={styles.totalAmount}>
              {item.totalAmount?.toLocaleString('vi-VN')}đ
            </Text>
          </View>
          <View>
            <Text style={styles.footerLabel}>Thanh toán</Text>
            <Text style={styles.paymentMethod}>
              {item.paymentMethod === 'COD' ? '💵 COD' : 
               item.paymentMethod === 'momo' ? '💳 Momo' : '🏦 Chuyển khoản'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Đơn hàng của tôi"
        subtitle={`${orders.length} đơn hàng`}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.tabs}>
        <FlatList
          horizontal
          data={tabs}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tab, activeTab === item.id && styles.tabActive]}
              onPress={() => setActiveTab(item.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === item.id && styles.tabTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        />
      </View>

      {loading ? (
        <View style={styles.loading}>
          <Text>Đang tải...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>📦</Text>
          <Text style={styles.emptyTitle}>Chưa có đơn hàng</Text>
          <Text style={styles.emptySubtext}>Hãy mua sắm để có đơn hàng đầu tiên</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id || ''}
          contentContainerStyle={styles.orderList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabs: {
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  tabsContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.surfaceAlt,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: theme.colors.textOnPrimary,
    fontWeight: '600',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.huge,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  orderList: {
    padding: theme.spacing.lg,
  },
  orderCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadow.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  orderId: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.round,
  },
  statusText: {
    color: theme.colors.textOnPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  orderItems: {
    marginBottom: theme.spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemEmoji: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  itemText: {
    ...theme.typography.small,
    color: theme.colors.textPrimary,
  },
  moreItems: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginLeft: 28,
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.borderLight,
    borderRadius: 2,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  totalAmount: {
    ...theme.typography.bodyBold,
    color: theme.colors.primaryDarker,
  },
  paymentMethod: {
    ...theme.typography.small,
    color: theme.colors.textPrimary,
    textAlign: 'right',
  },
});
