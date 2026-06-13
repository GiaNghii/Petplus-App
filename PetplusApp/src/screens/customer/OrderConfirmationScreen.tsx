import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';
import Icon from '../../components/Icon';
import ModernCard from '../../components/ModernCard';

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
  type: string;
}

interface OrderData {
  orderId?: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryFee: number;
  paymentMethod: string;
  deliveryType: string;
  deliveryAddress: string;
  status: string;
}

export default function OrderConfirmationScreen({ route, navigation }: any) {
  const orderData: OrderData = route.params?.orderData || {};
  const orderId = orderData.orderId || `ORD${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const finalTotal = (orderData.totalAmount || 0) + (orderData.deliveryFee || 0);

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'momo': return 'Momo QR';
      case 'banking': return 'Chuyển khoản';
      case 'COD': return 'Tiền mặt (COD)';
      default: return method;
    }
  };

  const getDeliveryLabel = (type: string) => {
    return type === 'delivery' ? 'Giao hàng tận nơi' : 'Nhận tại chi nhánh';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.successSection}>
          <View style={styles.successIcon}>
            <Icon name="checkmark" size={40} color={theme.colors.textOnPrimary} />
          </View>
          <Text style={styles.successTitle}>Đặt hàng thành công!</Text>
          <Text style={styles.successSubtitle}>
            Cảm ơn bạn đã mua hàng tại Petplus. Đơn hàng của bạn đã được ghi nhận.
          </Text>
        </View>

        <ModernCard style={styles.orderCard} variant="default">
          <View style={styles.orderIdRow}>
            <Text style={styles.orderIdLabel}>Mã đơn hàng</Text>
            <Text style={styles.orderIdValue}>#{orderId}</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Đang xử lý</Text>
            </View>
            <Text style={styles.statusHint}>Petplus sẽ liên hệ bạn trong ít phút</Text>
          </View>
        </ModernCard>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm đã đặt</Text>
          {orderData.items?.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <View style={styles.itemIcon}>
                  <Icon name="medkit" size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
                  <Text style={styles.itemQty}>x{item.quantity}</Text>
                </View>
              </View>
              <Text style={styles.itemPrice}>
                {(item.price * item.quantity).toLocaleString('vi-VN')}đ
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
          <View style={styles.infoRow}>
            <Icon name="location" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoLabel}>Hình thức</Text>
            <Text style={styles.infoValue}>{getDeliveryLabel(orderData.deliveryType)}</Text>
          </View>
          {orderData.deliveryType === 'delivery' && (
            <View style={styles.infoRow}>
              <Icon name="location" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.infoLabel}>Địa chỉ</Text>
              <Text style={styles.infoValue}>{orderData.deliveryAddress}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Icon name="pricetag" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoLabel}>Thanh toán</Text>
            <Text style={styles.infoValue}>{getPaymentLabel(orderData.paymentMethod)}</Text>
          </View>
        </View>

        <ModernCard style={styles.summaryCard} variant="primary">
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>
              {orderData.totalAmount?.toLocaleString('vi-VN')}đ
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí giao hàng</Text>
            <Text style={styles.summaryValue}>
              {orderData.deliveryFee === 0 ? 'Miễn phí' : `${orderData.deliveryFee?.toLocaleString('vi-VN')}đ`}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>
              {finalTotal.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </ModernCard>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
          activeOpacity={0.8}
        >
          <Icon name="home" size={20} color={theme.colors.textOnPrimary} />
          <Text style={styles.homeButtonText}>Về trang chủ</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 120,
  },
  successSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadow.lg,
  },
  successTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  successSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 24,
  },
  orderCard: {
    marginBottom: theme.spacing.xl,
  },
  orderIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  orderIdLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  orderIdValue: {
    ...theme.typography.h4,
    color: theme.colors.primaryDarker,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  statusBadge: {
    backgroundColor: theme.colors.warningBg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
  },
  statusText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.warning,
  },
  statusHint: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    flex: 1,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...theme.typography.smallBold,
    color: theme.colors.textPrimary,
  },
  itemQty: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  itemPrice: {
    ...theme.typography.smallBold,
    color: theme.colors.primaryDarker,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
    ...theme.shadow.sm,
  },
  infoLabel: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    width: 80,
  },
  infoValue: {
    ...theme.typography.smallBold,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  summaryCard: {
    backgroundColor: theme.colors.primaryBg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  totalLabel: {
    ...theme.typography.h4,
    color: theme.colors.textPrimary,
  },
  totalValue: {
    ...theme.typography.h3,
    color: theme.colors.primaryDarker,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  homeButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  homeButtonText: {
    ...theme.typography.button,
    color: theme.colors.textOnPrimary,
  },
});
