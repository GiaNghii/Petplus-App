import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Alert, TextInput, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { petService, productService } from '../../services/firestoreService';
import { theme } from '../../utils/theme';
import { PRODUCTS, CATEGORIES, Product } from '../../data/products';
import { useResponsive, BREAKPOINTS } from '../../utils/responsive';
import Icon from '../../components/Icon';

export default function ShopScreen({ navigation }: any) {
  const { user } = useAuth();
  const { addItem, updateQuantity, items, totalItems, totalAmount } = useCart();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [loading, setLoading] = useState(true);

  const { width, isDesktop, isTablet } = useResponsive();

  // Resolve column count based on breakpoints
  const numColumns = width >= BREAKPOINTS.lg ? 4 : width >= BREAKPOINTS.md ? 3 : 2;
  // isDesktop from responsive.ts is >=768; we add a true desktop check at lg
  const isTrueDesktop = width >= BREAKPOINTS.lg;

  useEffect(() => {
    productService.getProducts().then(result => {
      if (result.success) {
        setProducts(result.products);
      }
      setLoading(false);
    });
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }
    if (searchText) {
      const q = searchText.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [products, activeCategory, searchText]);

  const handleAddToCart = async (product: Product) => {
    if (product.type === 'prescription') {
      const result = await petService.getPetsByOwner(user?.id || 'demo_user');
      if (result.success && result.pets && result.pets.length > 0) {
        const pet = result.pets[0];
        Alert.alert(
          'Thuốc kê đơn',
          `Đảm bảo thuốc này được sử dụng cho đúng thú cưng được kê đơn.\n\nKê đơn cho: ${pet.name} (${pet.breed})`,
          [
            { text: 'Hủy', style: 'cancel' },
            {
              text: 'Xác nhận',
              onPress: () => {
                addItem(product, pet.id, { source: 'shop', petName: pet.name });
                Alert.alert('Đã thêm', `${product.name} đã được thêm vào giỏ`);
              },
            },
          ]
        );
      } else {
        Alert.alert('Chưa có thú cưng', 'Vui lòng thêm thú cưng trước khi mua thuốc kê đơn');
        navigation.navigate('AddPet');
      }
    } else {
      addItem(product, undefined, { source: 'shop' });
      Alert.alert('Đã thêm', `${product.name} đã được thêm vào giỏ`);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const cartItem = items.find(ci => ci.product.id === item.id);
    const quantity = cartItem?.quantity || 0;

    return (
      <TouchableOpacity
        style={[styles.productCard, isTrueDesktop && styles.productCardDesktop]}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        activeOpacity={0.8}
      >
        <View style={[styles.productImage, isTrueDesktop && styles.productImageDesktop, { backgroundColor: item.bgColor }]}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={[styles.productImageThumb, isTrueDesktop && styles.productImageThumbDesktop]} resizeMode="contain" />
          ) : item.imageLocal ? (
            <Image source={item.imageLocal} style={[styles.productImageThumb, isTrueDesktop && styles.productImageThumbDesktop]} resizeMode="contain" />
          ) : (
            <Icon name="medkit" size={isTrueDesktop ? 64 : 48} color={theme.colors.primaryLight} />
          )}
          {item.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{item.discount}%</Text>
            </View>
          )}
          {item.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>MỚI</Text>
            </View>
          )}
          {item.isHot && (
            <View style={styles.hotBadge}>
              <Text style={styles.hotBadgeText}>HOT</Text>
            </View>
          )}
          {item.type === 'prescription' && (
            <View style={styles.lockBadge}>
              <Text style={styles.lockText}>Kê đơn</Text>
            </View>
          )}
        </View>
        <View style={[styles.productContent, isTrueDesktop && styles.productContentDesktop]}>
          <Text style={[styles.productName, isTrueDesktop && styles.productNameDesktop]} numberOfLines={2}>{item.name}</Text>
          <View style={styles.ratingRow}>
            <Icon name="star" size={11} color={theme.colors.warning} />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewCount}>({item.reviews})</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.price, isTrueDesktop && styles.priceDesktop]}>{item.price.toLocaleString('vi-VN')}₫</Text>
            {item.originalPrice && (
              <Text style={styles.oldPrice}>{item.originalPrice.toLocaleString('vi-VN')}₫</Text>
            )}
          </View>
          {quantity === 0 ? (
            <TouchableOpacity
              style={[styles.addButton, isTrueDesktop && styles.addButtonDesktop]}
              onPress={() => handleAddToCart(item)}
            >
              <Icon name="cart" size={isTrueDesktop ? 16 : 14} color={theme.colors.textOnPrimary} />
              <Text style={[styles.addButtonText, isTrueDesktop && styles.addButtonTextDesktop]}>Thêm vào giỏ</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.qtyControl}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQuantity(item.id, -1)}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => handleAddToCart(item)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Sidebar categories for desktop
  const renderCategorySidebar = () => (
    <View style={styles.sidebar}>
      <Text style={styles.sidebarTitle}>Danh mục</Text>
      {CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={[
            styles.sidebarItem,
            activeCategory === cat.id && styles.sidebarItemActive,
          ]}
          onPress={() => setActiveCategory(cat.id)}
        >
          <Icon
            name={cat.icon as any}
            size={16}
            color={activeCategory === cat.id ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text style={[
            styles.sidebarItemText,
            activeCategory === cat.id && styles.sidebarItemTextActive,
          ]}>
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Horizontal chip categories for mobile/tablet
  const renderCategoryChips = () => (
    <View style={styles.catContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catList}
        style={styles.catScroll}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.catChip,
              activeCategory === cat.id && styles.catChipActive,
            ]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <Icon name={cat.icon as any} size={14} color={activeCategory === cat.id ? theme.colors.textOnPrimary : theme.colors.textSecondary} />
            <Text style={[
              styles.catText,
              activeCategory === cat.id && styles.catTextActive,
            ]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Centered max-width wrapper */}
      <View style={styles.pageWrapper}>

        {/* Header */}
        <View style={[styles.header, isTrueDesktop && styles.headerDesktop]}>
          {navigation.canGoBack() ? (
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Icon name="chevron-back" size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
              <View>
                <Text style={[styles.headerTitle, isTrueDesktop && styles.headerTitleDesktop]}>Mua thuốc</Text>
                <Text style={styles.headerSub}>Sản phẩm cho thú cưng của bạn</Text>
              </View>
            </View>
          ) : (
            <>
              <Text style={[styles.headerTitle, isTrueDesktop && styles.headerTitleDesktop]}>Mua thuốc</Text>
              <Text style={styles.headerSub}>Sản phẩm cho thú cưng của bạn</Text>
            </>
          )}
        </View>

        {/* Search + Cart — full width, prominent on all sizes */}
        <View style={[styles.toolbar, isTrueDesktop && styles.toolbarDesktop]}>
          <View style={styles.searchBar}>
            <Icon name="search" size={16} color={theme.colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm thuốc theo tên hoặc triệu chứng..."
              placeholderTextColor={theme.colors.textTertiary}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => navigation.navigate('Cart')}
          >
            <Icon name="cart" size={20} color={theme.colors.textPrimary} />
            {totalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Mobile/Tablet: categories as horizontal scroll above products */}
        {!isTrueDesktop && renderCategoryChips()}

        {/* Body: sidebar (desktop) | product grid */}
        <View style={[styles.body, isTrueDesktop && styles.bodyDesktop]}>
          {isTrueDesktop && renderCategorySidebar()}

          <View style={styles.productListWrapper}>
            {/* FlatList key forces remount when numColumns changes */}
            <FlatList
              key={`grid-${numColumns}`}
              data={filteredProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
              contentContainerStyle={[
                styles.productList,
                isTrueDesktop && styles.productListDesktop,
              ]}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>

      </View>

      {/* Floating Cart */}
      {totalItems > 0 && (
        <TouchableOpacity
          style={[styles.floatingCart, isTrueDesktop && styles.floatingCartDesktop]}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.9}
        >
          <View style={styles.floatingCartLeft}>
            <View style={styles.floatingCartIconWrap}>
              <Icon name="cart" size={22} color={theme.colors.primary} />
              <View style={styles.floatingCartBadge}>
                <Text style={styles.floatingCartBadgeText}>{totalItems}</Text>
              </View>
            </View>
            <View>
              <Text style={styles.floatingCartCount}>{totalItems} sản phẩm</Text>
              <Text style={styles.floatingCartTotal}>{totalAmount.toLocaleString('vi-VN')}₫</Text>
            </View>
          </View>
          <View style={styles.floatingCartBtn}>
            <Text style={styles.floatingCartBtnText}>Xem giỏ</Text>
            <Icon name="arrow-forward" size={14} color={theme.colors.textOnPrimary} />
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // Centered max-width page wrapper
  pageWrapper: {
    flex: 1,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerDesktop: {
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  headerTitleDesktop: {
    fontSize: 30,
  },
  headerSub: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  toolbarDesktop: {
    paddingHorizontal: 32,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginLeft: 8,
  },
  cartBtn: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: theme.colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: theme.colors.textOnPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  // Mobile category chips
  catContainer: {
    height: 48,
    marginBottom: 8,
    overflow: 'hidden',
  },
  catScroll: {
    height: 48,
  },
  catList: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 0,
    borderRadius: theme.radius.md,
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 40,
    width: 'auto',
  },
  catChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  catText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  catTextActive: {
    color: theme.colors.textOnPrimary,
    fontWeight: '600',
  },
  // Body layout
  body: {
    flex: 1,
  },
  bodyDesktop: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    gap: 24,
  },
  // Desktop sidebar
  sidebar: {
    width: 200,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  sidebarTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: theme.radius.md,
    marginBottom: 2,
  },
  sidebarItemActive: {
    backgroundColor: theme.colors.primaryBg,
  },
  sidebarItemText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  sidebarItemTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  // Product list
  productListWrapper: {
    flex: 1,
  },
  productList: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
  productListDesktop: {
    paddingHorizontal: 0,
    paddingBottom: 120,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  // Product card
  productCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    ...theme.shadow.sm,
  },
  productCardDesktop: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  productImage: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productImageDesktop: {
    height: 180,
  },
  productImageThumb: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  productImageThumbDesktop: {
    width: 140,
    height: 140,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: theme.colors.danger,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
  },
  discountText: {
    color: theme.colors.textOnPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: theme.colors.info,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
  },
  newBadgeText: {
    color: theme.colors.textOnPrimary,
    fontSize: 9,
    fontWeight: '700',
  },
  hotBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
  },
  hotBadgeText: {
    color: theme.colors.textOnPrimary,
    fontSize: 9,
    fontWeight: '700',
  },
  lockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
  },
  lockText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.danger,
  },
  productContent: {
    padding: 12,
  },
  productContentDesktop: {
    padding: 16,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    minHeight: 36,
    lineHeight: 18,
  },
  productNameDesktop: {
    fontSize: 15,
    minHeight: 42,
    lineHeight: 21,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  reviewCount: {
    fontSize: 10,
    color: theme.colors.textTertiary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
    gap: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  priceDesktop: {
    fontSize: 18,
  },
  oldPrice: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    marginTop: 8,
    gap: 6,
  },
  addButtonDesktop: {
    paddingVertical: 10,
  },
  addButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  addButtonTextDesktop: {
    fontSize: 14,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primaryBg,
    borderRadius: theme.radius.md,
    marginTop: 8,
    padding: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.xs,
  },
  qtyBtnText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  floatingCart: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadow.lg,
  },
  floatingCartDesktop: {
    paddingHorizontal: 32,
    maxWidth: 1280,
    alignSelf: 'center',
    width: '100%',
  },
  floatingCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  floatingCartIconWrap: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  floatingCartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  floatingCartBadgeText: {
    color: theme.colors.textOnPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  floatingCartCount: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  floatingCartTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  floatingCartBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  floatingCartBtnText: {
    color: theme.colors.textOnPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
});
