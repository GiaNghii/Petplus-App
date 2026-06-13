import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services/firestoreService';
import { theme } from '../../utils/theme';
import Button from '../../components/Button';
import ModernCard from '../../components/ModernCard';
import Icon from '../../components/Icon';
import { DEMO_DEFAULTS } from '../../data/demoData';

const PAYMENT_METHODS = [
  { id: 'momo', name: 'Momo QR', subtitle: 'Quét QR thanh toán' },
  { id: 'banking', name: 'Chuyển khoản', subtitle: 'Vietcombank, Techcombank...' },
  { id: 'COD', name: 'Tiền mặt (COD)', subtitle: 'Thanh toán khi nhận hàng' },
];

const DELIVERY_OPTIONS = [
  { id: 'delivery', name: 'Giao hàng tận nơi', subtitle: 'Trong TP.HCM', fee: 25000 },
  { id: 'pickup', name: 'Nhận tại chi nhánh', subtitle: 'Petplus Gò Vấp', fee: 0 },
];

export default function CartScreen({ navigation }: any) {
  const { user } = useAuth();
  const { items, updateQuantity, removeItem, totalItems, totalAmount, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [address, setAddress] = useState(DEMO_DEFAULTS.address);
  const [note, setNote] = useState(DEMO_DEFAULTS.orderNote);
  const [loading, setLoading] = useState(false);

  const deliveryFee = DELIVERY_OPTIONS.find(d => d.id === deliveryType)?.fee || 0;
  const finalTotal = totalAmount + deliveryFee;

  const handleCheckout = async () => {
    if (!user?.id || items.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng thêm sản phẩm vào giỏ');
      return;
    }

    if (deliveryType === 'delivery' && !address.trim()) {
      Alert.alert('Thiếu địa chỉ', 'Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    setLoading(true);
    const result = await orderService.createOrder({
      customerId: user.id,
      items: items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productImageUrl: item.product.imageUrl,
        quantity: item.quantity,
        price: item.product.price,
        type: item.product.type,
        petId: item.selectedPetId,
        conditionId: item.selectedConditionId,
        source: item.source || 'shop',
      })),
      totalAmount: finalTotal,
      deliveryFee,
      paymentMethod: paymentMethod as any,
      paymentStatus: 'pending',
      deliveryBranch: DEMO_DEFAULTS.branchId,
      deliveryAddress: deliveryType === 'delivery' ? address : 'Nhận tại chi nhánh',
      deliveryType: deliveryType as any,
      status: 'pending',
    });

    if (result.success) {
      const orderId = result.id?.slice(-6).toUpperCase();
      const orderData = {
        orderId,
        items: items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          type: item.product.type,
          petId: item.selectedPetId,
          conditionId: item.selectedConditionId,
          source: item.source || 'shop',
        })),
        totalAmount,
        deliveryFee,
        paymentMethod,
        deliveryType,
        deliveryAddress: deliveryType === 'delivery' ? address : 'Nhận tại chi nhánh',
        status: 'pending',
      };
      clearCart();
      navigation.navigate('OrderConfirmation', { orderData });
    } else {
      Alert.alert('Lỗi', 'Không thể đặt hàng');
    }
    setLoading(false);
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="chevron-back" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Icon name="cart-outline" size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
          <Text style={styles.emptyText}>
            Hãy khám phá cửa hàng và thêm sản phẩm vào giỏ nhé!
          </Text>
          <Button
            title="Khám phá sản phẩm"
            onPress={() => navigation.goBack()}
            icon="cart"
            style={{ marginTop: theme.spacing.xl }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng ({totalItems})</Text>
        <TouchableOpacity onPress={() => {
          Alert.alert(
            'Xóa tất cả?',
            'Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ?',
            [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Xóa', style: 'destructive', onPress: clearCart },
            ]
          );
        }}>
          <Text style={styles.clearText}>Xóa tất cả</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View style={styles.section}>
          {items.map((item) => (
            <ModernCard key={item.product.id} style={styles.cartItem}>
              <View style={styles.cartItemHeader}>
                <View style={styles.productImage}>
                  {item.product.imageUrl ? (
                    <Image source={{ uri: item.product.imageUrl }} style={styles.productImageThumb} resizeMode="contain" />
                  ) : item.product.imageLocal ? (
                    <Image source={item.product.imageLocal} style={styles.productImageThumb} resizeMode="contain" />
                  ) : (
                    <Icon name="medkit" size={28} color={theme.colors.primary} />
                  )}
                  {item.product.type === 'prescription' && (
                    <View style={styles.prescriptionTag}>
                      <Icon name="lock-closed" size={7} color={theme.colors.danger} />
                      <Text style={styles.prescriptionTagText}>Kê đơn</Text>
                    </View>
                  )}
                </View>
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName} numberOfLines={2}>{item.product.name}</Text>
                  <Text style={styles.cartItemUnit}>
                    {item.product.price.toLocaleString('vi-VN')}đ / sản phẩm
                  </Text>
                  {item.selectedPetId && (
                    <View style={styles.petTag}>
                      <Icon name="paw" size={10} color={theme.colors.primaryDarker} />
                      <Text style={styles.petTagText}>Kê đơn cho pet</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeItem(item.product.id)}
                >
                  <Icon name="trash" size={18} color={theme.colors.danger} />
                </TouchableOpacity>
              </View>

              <View style={styles.cartItemFooter}>
                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => updateQuantity(item.product.id, -1)}
                  >
                    <Text style={styles.qtyButtonText}>−</Text>
                  </TouchableOpacity>
                  <View style={styles.qtyDisplay}>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => updateQuantity(item.product.id, 1)}
                  >
                    <Text style={styles.qtyButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemTotal}>
                  {(item.product.price * item.quantity).toLocaleString('vi-VN')}đ
                </Text>
              </View>
            </ModernCard>
          ))}
        </View>

        {/* Delivery */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức giao hàng</Text>
          {DELIVERY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                deliveryType === option.id && styles.optionCardSelected,
              ]}
              onPress={() => setDeliveryType(option.id)}
            >
              <Icon name="location" size={24} color={deliveryType === option.id ? theme.colors.primary : theme.colors.textSecondary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.optionName}>{option.name}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <Text style={styles.optionFee}>
                {option.fee === 0 ? 'Miễn phí' : `+${option.fee.toLocaleString('vi-VN')}đ`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Address */}
        {deliveryType === 'delivery' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
            <ModernCard>
              <TextInput
                style={styles.addressInput}
                placeholder="Nhập địa chỉ chi tiết..."
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
              />
              <Text style={styles.addressHint}>
                Giao hàng trong TP.HCM - Giao từ chi nhánh gần nhất có hàng
              </Text>
            </ModernCard>
          </View>
        )}

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú (tùy chọn)</Text>
          <ModernCard>
            <TextInput
              style={styles.noteInput}
              placeholder="Ghi chú cho đơn hàng..."
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={2}
            />
          </ModernCard>
        </View>

        {/* Payment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.optionCard,
                paymentMethod === method.id && styles.optionCardSelected,
              ]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.optionName}>{method.name}</Text>
                <Text style={styles.optionSubtitle}>{method.subtitle}</Text>
              </View>
              {paymentMethod === method.id && (
                <View style={styles.checkmark}>
                  <Icon name="checkmark" size={14} color={theme.colors.textOnPrimary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Voucher placeholder */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.voucherCard}>
            <Icon name="pricetag" size={24} color={theme.colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.voucherTitle}>Mã giảm giá</Text>
              <Text style={styles.voucherSubtitle}>Bạn chưa có mã giảm giá</Text>
            </View>
            <Icon name="chevron-forward" size={24} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <ModernCard style={styles.summaryCard} variant="primary">
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính ({totalItems} sản phẩm)</Text>
              <Text style={styles.summaryValue}>
                {totalAmount.toLocaleString('vi-VN')}đ
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí giao hàng</Text>
              <Text style={styles.summaryValue}>
                {deliveryFee === 0 ? 'Miễn phí' : `${deliveryFee.toLocaleString('vi-VN')}đ`}
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
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Checkout Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomLeft}>
          <Text style={styles.bottomLabel}>Tổng cộng</Text>
          <Text style={styles.bottomTotal}>
            {finalTotal.toLocaleString('vi-VN')}đ
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutButton, loading && styles.checkoutDisabled]}
          onPress={handleCheckout}
          disabled={loading}
        >
          <Text style={styles.checkoutButtonText}>
            {loading ? 'Đang xử lý...' : 'Đặt hàng ngay'}
          </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.sm,
  },
  headerTitle: {
    ...theme.typography.h4,
    color: theme.colors.textPrimary,
  },
  clearText: {
    ...theme.typography.smallBold,
    color: theme.colors.danger,
  },
  section: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  cartItem: {
    marginBottom: theme.spacing.md,
  },
  cartItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productImageThumb: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  prescriptionTag: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: theme.radius.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  prescriptionTagText: {
    fontSize: 7,
    fontWeight: '700',
    color: theme.colors.danger,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    ...theme.typography.smallBold,
    color: theme.colors.textPrimary,
  },
  cartItemUnit: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  petTag: {
    backgroundColor: theme.colors.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
    alignSelf: 'flex-start',
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  petTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.primaryDarker,
  },
  removeBtn: {
    padding: 4,
  },
  cartItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    padding: 4,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.sm,
  },
  qtyButtonText: {
    color: theme.colors.primaryDarker,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  qtyDisplay: {
    minWidth: 40,
    alignItems: 'center',
  },
  qtyText: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
  itemTotal: {
    ...theme.typography.bodyBold,
    color: theme.colors.primaryDarker,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadow.sm,
  },
  optionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryBg,
  },
  optionName: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
  optionSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  optionFee: {
    ...theme.typography.smallBold,
    color: theme.colors.primaryDarker,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressInput: {
    minHeight: 60,
    fontSize: 15,
    color: theme.colors.textPrimary,
    textAlignVertical: 'top',
  },
  addressHint: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  noteInput: {
    minHeight: 50,
    fontSize: 15,
    color: theme.colors.textPrimary,
    textAlignVertical: 'top',
  },
  voucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
    borderStyle: 'dashed',
    ...theme.shadow.sm,
  },
  voucherTitle: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
  voucherSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    ...theme.shadow.lg,
  },
  bottomLeft: {
    flex: 1,
  },
  bottomLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  bottomTotal: {
    ...theme.typography.h3,
    color: theme.colors.primaryDarker,
    fontWeight: '700',
  },
  checkoutButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.md,
    ...theme.shadow.md,
  },
  checkoutDisabled: {
    opacity: 0.6,
  },
  checkoutButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
});
