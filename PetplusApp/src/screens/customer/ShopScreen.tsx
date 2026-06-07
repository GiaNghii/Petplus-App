import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { petService } from '../../services/firestoreService';
import { theme } from '../../utils/theme';
import { PRODUCTS, CATEGORIES } from '../../data/products';

export default function ShopScreen({ navigation }: any) {
  const { user } = useAuth();
  const { addItem, updateQuantity, items, totalItems, totalAmount } = useCart();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchText, setSearchText] = useState('');

  const filteredProducts = useMemo(() => {
    let products = PRODUCTS;
    if (activeCategory !== 'all') {
      products = products.filter(p => p.category === activeCategory);
    }
    if (searchText) {
      const q = searchText.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }
    return products;
  }, [activeCategory, searchText]);

  const handleAddToCart = async (product: typeof PRODUCTS[0]) => {
    if (product.type === 'prescription') {
      const result = await petService.getPetsByOwner(user?.id || 'demo_user');
      if (result.success && result.pets && result.pets.length > 0) {
        const pet = result.pets[0];
        Alert.alert(
          '⚠️ Thuốc kê đơn',
          `Đảm bảo thuốc này được sử dụng cho đúng thú cưng được kê đơn.\n\nKê đơn cho: ${pet.name} (${pet.breed})`,
          [
            { text: 'Hủy', style: 'cancel' },
            {
              text: 'Xác nhận',
              onPress: () => {
                addItem(product, pet.id);
                Alert.alert('✓ Đã thêm', `${product.name} đã được thêm vào giỏ`);
              },
            },
          ]
        );
      } else {
        Alert.alert('Chưa có thú cưng', 'Vui lòng thêm thú cưng trước khi mua thuốc kê đơn');
        navigation.navigate('AddPet');
      }
    } else {
      addItem(product);
      Alert.alert('✓ Đã thêm', `${product.name} đã được thêm vào giỏ`);
    }
  };

  const renderProduct = ({ item }: { item: typeof PRODUCTS[0] }) => {
    const cartItem = items.find(ci => ci.product.id === item.id);
    const quantity = cartItem?.quantity || 0;

    return (
      <View style={styles.productCard}>
        <View style={[styles.productImage, { backgroundColor: item.bgColor }]}>
          <Text style={styles.productEmoji}>{item.imageEmoji}</Text>
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
              <Text style={styles.hotBadgeText}>🔥 HOT</Text>
            </View>
          )}
          {item.type === 'prescription' && (
            <View style={styles.lockBadge}>
              <Text style={styles.lockText}>🔒 Kê đơn</Text>
            </View>
          )}
        </View>
        <View style={styles.productContent}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingStar}>⭐</Text>
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewCount}>({item.reviews})</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{item.price.toLocaleString('vi-VN')}₫</Text>
            {item.originalPrice && (
              <Text style={styles.oldPrice}>{item.originalPrice.toLocaleString('vi-VN')}₫</Text>
            )}
          </View>
          {quantity === 0 ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddToCart(item)}
            >
              <Text style={styles.addButtonIcon}>🛒</Text>
              <Text style={styles.addButtonText}>Thêm</Text>
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
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mua thuốc</Text>
        <Text style={styles.headerSub}>Sản phẩm cho thú cưng của bạn</Text>
      </View>

      {/* Search + Cart */}
      <View style={styles.toolbar}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
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
          <Text style={styles.cartIcon}>🛒</Text>
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catList}
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
            <Text style={styles.catEmoji}>{cat.emoji}</Text>
            <Text style={[
              styles.catText,
              activeCategory === cat.id && styles.catTextActive,
            ]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      <Text style={styles.resultText}>
        {filteredProducts.length} sản phẩm
      </Text>

      {/* Products */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Cart */}
      {totalItems > 0 && (
        <TouchableOpacity
          style={styles.floatingCart}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.9}
        >
          <View style={styles.floatingCartLeft}>
            <View style={styles.floatingCartIconWrap}>
              <Text style={styles.floatingCartIcon}>🛒</Text>
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
            <Text style={styles.floatingCartBtnText}>Xem giỏ →</Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
  },
  headerSub: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#212121',
  },
  cartBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  cartIcon: {
    fontSize: 20,
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#D32F2F',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  catList: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  catChipActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  catEmoji: {
    fontSize: 14,
  },
  catText: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '500',
  },
  catTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  resultText: {
    fontSize: 12,
    color: '#757575',
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontWeight: '500',
  },
  productList: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  productImage: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productEmoji: {
    fontSize: 48,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#D32F2F',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#1976D2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  hotBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF6F00',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hotBadgeText: {
    color: '#fff',
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
    borderRadius: 4,
  },
  lockText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D32F2F',
  },
  productContent: {
    padding: 12,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
    minHeight: 36,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  ratingStar: {
    fontSize: 11,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#212121',
  },
  reviewCount: {
    fontSize: 10,
    color: '#9E9E9E',
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
    color: '#2E7D32',
  },
  oldPrice: {
    fontSize: 11,
    color: '#9E9E9E',
    textDecorationLine: 'line-through',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  addButtonIcon: {
    fontSize: 14,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    marginTop: 8,
    padding: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  qtyBtnText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  floatingCart: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  floatingCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  floatingCartIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  floatingCartIcon: {
    fontSize: 22,
  },
  floatingCartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#D32F2F',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  floatingCartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  floatingCartCount: {
    fontSize: 11,
    color: '#757575',
  },
  floatingCartTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
  floatingCartBtn: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  floatingCartBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});
