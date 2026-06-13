import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/firestoreService';
import { Order } from '../../types';
import { theme } from '../../utils/theme';
import Header from '../../components/Header';
import Icon from '../../components/Icon';
import { PRODUCTS } from '../../data/products';

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
      pending: { label: 'Chờ xử lý', color: theme.colors.warning, progress: 25 },
      preparing: { label: 'Đang chuẩn bị', color: theme.colors.info, progress: 50 },
      shipped: { label: 'Đang giao', color: theme.colors.secondary, progress: 75 },
      delivered: { label: 'Đã giao', color: theme.colors.success, progress: 100 },
      cancelled: { label: 'Đã hủy', color: theme.colors.danger, progress: 0 },
    };
    return map[status] || map.pending;
  };

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(order => order.status === activeTab);

  const getProductName = (productId: string, fallback?: string) => {
    return fallback || PRODUCTS.find(product => product.id === productId)?.name || `Sản phẩm ${productId}`;
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
              <Icon name="medkit" size={20} color={theme.colors.primary} />
              <Text style={styles.itemText} numberOfLines={1}>
                {orderItem.quantity}x {getProductName(orderItem.productId, orderItem.productName)}
              </Text>
              {orderItem.source === 'consultation' && (
                <View style={styles.consultBadge}>
                  <Text style={styles.consultBadgeText}>Tư vấn</Text>
                </View>
              )}
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
              {item.paymentMethod === 'COD' ? 'COD' : 
               item.paymentMethod === 'momo' ? 'Momo' : 'Chuyển khoản'}
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
      ) : filteredOrders.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="cart-outline" size={64} color={theme.colors.primary} />
          <Text style={styles.emptyTitle}>Chưa có đơn hàng phù hợp</Text>
          <Text style={styles.emptySubtext}>Thử đổi bộ lọc hoặc mua sản phẩm trong Shop</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
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
    borderRadius: theme.radius.pill,
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
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.lg,
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
    borderRadius: theme.radius.pill,
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
    gap: theme.spacing.sm,
  },
  consultBadge: {
    backgroundColor: theme.colors.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
  },
  consultBadgeText: {
    ...theme.typography.overline,
    color: theme.colors.primary,
    fontSize: 9,
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
