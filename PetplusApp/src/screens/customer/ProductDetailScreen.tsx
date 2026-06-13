import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import { useCart } from '../../context/CartContext';
import { PRODUCTS, Product } from '../../data/products';

const DEFAULT_TREATMENT_IMAGES: Record<string, any> = {
  ear: require('../../../assets/products/p8.jpg'),
  eye: require('../../../assets/products/p4.jpg'),
  hair: require('../../../assets/products/p10.jpg'),
  fur: require('../../../assets/products/p16.jpg'),
};

function getTreatmentImage(productId: string): any {
  if (productId.includes('ear')) return DEFAULT_TREATMENT_IMAGES.ear;
  if (productId.includes('eye')) return DEFAULT_TREATMENT_IMAGES.eye;
  if (productId.includes('hair')) return DEFAULT_TREATMENT_IMAGES.hair;
  if (productId.includes('fur')) return DEFAULT_TREATMENT_IMAGES.fur;
  return undefined;
}

export default function ProductDetailScreen({ route, navigation }: any) {
  const { productId, productName, productPrice, productDescription } = route.params;
  const { addItem, items, updateQuantity } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const product = useMemo(() => {
    const found = PRODUCTS.find(p => p.id === productId);
    if (found) return found;
    if (productName && productPrice) {
      const treatmentImage = getTreatmentImage(productId);
      return {
        id: productId,
        name: productName,
        price: productPrice,
        description: productDescription || '',
        type: 'OTC' as const,
        category: 'thuoc' as const,
        stock: 0,
        rating: 0,
        reviews: 0,
        sold: 0,
        unit: 'sp',
        bgColor: '#FFFFFF',
        imageLocal: treatmentImage,
      } as Product;
    }
    return undefined;
  }, [productId, productName, productPrice, productDescription]);
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return PRODUCTS.filter(p => p.id !== product.id && p.category === product.category).slice(0, 5);
  }, [product]);

  const cartItem = items.find(i => i.product.id === productId);
  const quantity = cartItem?.quantity || 0;

  if (!product) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Icon name="medkit" size={48} color={theme.colors.border} />
          <Text style={styles.emptyText}>Sản phẩm không tồn tại</Text>
          <Button title="Quay lại" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    if (product.type === 'prescription') {
      Alert.alert(
        'Thuốc kê đơn',
        `Đảm bảo thuốc này được sử dụng cho đúng thú cưng được kê đơn.`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Xác nhận',
            onPress: () => {
              addItem(product);
              Alert.alert('Đã thêm', `${product.name} đã được thêm vào giỏ`);
            },
          },
        ]
      );
    } else {
      addItem(product);
      Alert.alert('Đã thêm', `${product.name} đã được thêm vào giỏ`);
    }
  };

  const handleBuyNow = () => {
    if (quantity === 0) {
      addItem(product);
    }
    navigation.navigate('Cart');
  };

  const productImages = [product.imageLocal || product.imageUrl].filter(Boolean);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle} numberOfLines={1}>Chi tiết sản phẩm</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Shop')}>
            <Icon name="search" size={18} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Icon name="notifications" size={18} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Cart')}>
            <Icon name="cart" size={18} color={theme.colors.textPrimary} />
            {quantity > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{quantity}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageSection}>
          <View style={styles.mainImageWrap}>
            {product.imageLocal ? (
              <Image source={product.imageLocal} style={styles.mainImage} resizeMode="contain" />
            ) : product.imageUrl ? (
              <Image source={{ uri: product.imageUrl }} style={styles.mainImage} resizeMode="contain" />
            ) : (
              <Icon name="medkit" size={80} color={theme.colors.primaryLight} />
            )}
          </View>
          {productImages.length > 1 && (
            <View style={styles.thumbnails}>
              {productImages.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.thumbnail, selectedImageIndex === idx && styles.thumbnailActive]}
                  onPress={() => setSelectedImageIndex(idx)}
                >
                  <Image source={typeof img === 'number' ? img : { uri: img }} style={styles.thumbnailImage} resizeMode="contain" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>{product.price.toLocaleString('vi-VN')}đ</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon name="star" size={14} color={theme.colors.warning} />
              <Text style={styles.metaText}>{product.rating}</Text>
              <Text style={styles.metaSub}>({product.reviews})</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Icon name="cart" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.metaText}>Đã bán {product.sold}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Icon name="medkit" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.metaText}>{product.unit}</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
              <Icon name="cart" size={18} color={theme.colors.primary} />
              <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buyNowBtn} onPress={handleBuyNow}>
              <Text style={styles.buyNowText}>Mua hàng</Text>
            </TouchableOpacity>
          </View>

          {quantity > 0 && (
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(productId, -1)}>
                <Icon name="remove" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(productId, 1)}>
                <Icon name="add" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.descSection}>
          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.infoChips}>
            {product.stock > 0 && (
              <View style={styles.infoChip}>
                <View style={[styles.infoChipIcon, { backgroundColor: theme.colors.successBg }]}>
                  <Icon name="checkmark" size={14} color={theme.colors.success} />
                </View>
                <View>
                  <Text style={styles.infoChipLabel}>Còn hàng</Text>
                  <Text style={styles.infoChipValue}>{product.stock} {product.unit}</Text>
                </View>
              </View>
            )}
            <View style={styles.infoChip}>
              <View style={[styles.infoChipIcon, { backgroundColor: theme.colors.infoBg }]}>
                <Icon name="medical" size={14} color={theme.colors.info} />
              </View>
              <View>
                <Text style={styles.infoChipLabel}>Đã kiểm định</Text>
                <Text style={styles.infoChipValue}>FDA, Bộ Y tế</Text>
              </View>
            </View>
            {product.type === 'prescription' && (
              <View style={styles.infoChip}>
                <View style={[styles.infoChipIcon, { backgroundColor: theme.colors.warningBg }]}>
                  <Icon name="medkit" size={14} color={theme.colors.warning} />
                </View>
                <View>
                  <Text style={styles.infoChipLabel}>Kê đơn</Text>
                  <Text style={styles.infoChipValue}>Theo chỉ định BS</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.sectionTitle}>Sản phẩm liên quan</Text>
            <FlatList
              data={relatedProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.relatedList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.relatedCard}
                  onPress={() => navigation.push('ProductDetail', { productId: item.id })}
                  activeOpacity={0.8}
                >
                  <View style={styles.relatedImageWrap}>
                    {item.imageLocal ? (
                      <Image source={item.imageLocal} style={styles.relatedImage} resizeMode="contain" />
                    ) : item.imageUrl ? (
                      <Image source={{ uri: item.imageUrl }} style={styles.relatedImage} resizeMode="contain" />
                    ) : (
                      <Icon name="medkit" size={32} color={theme.colors.primaryLight} />
                    )}
                  </View>
                  <Text style={styles.relatedName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.relatedPrice}>{item.price.toLocaleString('vi-VN')}đ</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerTitleWrap: {
    flex: 1,
    marginHorizontal: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  headerBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: theme.colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  headerBadgeText: {
    color: theme.colors.textOnPrimary,
    fontSize: 9,
    fontWeight: '700',
  },
  content: {
    paddingBottom: 20,
  },
  imageSection: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  mainImageWrap: {
    width: '100%',
    height: 240,
    borderRadius: theme.radius.xl,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mainImage: {
    width: 200,
    height: 200,
    borderRadius: theme.radius.md,
  },
  thumbnails: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  thumbnailActive: {
    borderColor: theme.colors.primary,
  },
  thumbnailImage: {
    width: 44,
    height: 44,
    borderRadius: 6,
  },
  infoSection: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  productName: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    lineHeight: 24,
  },
  productPrice: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  metaSub: {
    fontSize: 11,
    color: theme.colors.textTertiary,
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: theme.colors.border,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryBg,
    gap: theme.spacing.sm,
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  buyNowBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  buyNowText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textOnPrimary,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xl,
    marginTop: theme.spacing.lg,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    minWidth: 28,
    textAlign: 'center',
  },
  descSection: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  infoChips: {
    gap: theme.spacing.md,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surfaceAlt,
  },
  infoChipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoChipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  infoChipValue: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  relatedSection: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
  },
  relatedList: {
    gap: theme.spacing.md,
  },
  relatedCard: {
    width: 140,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    overflow: 'hidden',
  },
  relatedImageWrap: {
    width: '100%',
    height: 100,
    backgroundColor: theme.colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  relatedImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
  },
  relatedName: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    padding: 8,
    paddingBottom: 4,
    minHeight: 40,
    lineHeight: 16,
  },
  relatedPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
});
