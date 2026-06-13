import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { theme } from '../utils/theme';
import Icon from './Icon';
import { MessageProductLink } from '../types';

interface TreatmentBundleCardProps {
  conditionLabel: string;
  products: MessageProductLink[];
  onProductTap: (product: MessageProductLink) => void;
}

// Accent tints that cycle per product card to add warmth and visual rhythm
const CARD_ACCENTS = [
  theme.colors.primaryBg,
  theme.colors.warningBg,
  theme.colors.infoBg,
  theme.colors.secondaryBg,
];

export default function TreatmentBundleCard({
  conditionLabel,
  products,
  onProductTap,
}: TreatmentBundleCardProps) {
  return (
    <View style={styles.card}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.rxBadge}>
            <Text style={styles.rxText}>Rx</Text>
          </View>
          <View>
            <Text style={styles.headerOverline}>ĐỀ XUẤT ĐIỀU TRỊ</Text>
            <Text style={styles.headerCondition}>{conditionLabel}</Text>
          </View>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{products.length} sản phẩm</Text>
        </View>
      </View>

      {/* ── Product horizontal scroll ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productList}
        decelerationRate="fast"
        snapToInterval={156} // card width + gap
        snapToAlignment="start"
      >
        {products.map((product, index) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            onPress={() => onProductTap(product)}
            activeOpacity={0.85}
          >
            {/* Coloured top strip */}
            <View style={[styles.cardTopStrip, { backgroundColor: CARD_ACCENTS[index % CARD_ACCENTS.length] }]}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{index + 1}</Text>
              </View>
              <View style={styles.medkitWrap}>
                <Icon name="medkit" size={18} color={theme.colors.primary} />
              </View>
            </View>

            {/* Card body */}
            <View style={styles.cardBody}>
              <Text style={styles.productName} numberOfLines={2}>
                {product.name}
              </Text>

              {product.description ? (
                <Text style={styles.productDesc} numberOfLines={3}>
                  {product.description}
                </Text>
              ) : null}

              <View style={styles.cardFooter}>
                <Text style={styles.productPrice}>
                  {product.price.toLocaleString('vi-VN')}đ
                </Text>
                <View style={styles.buyBtn}>
                  <Text style={styles.buyBtnText}>Mua</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Trailing spacer so last card isn't flush against edge */}
        <View style={styles.trailingSpace} />
      </ScrollView>

      {/* ── Footer hint ── */}
      <View style={styles.footer}>
        <Icon name="information-circle" size={13} color={theme.colors.textTertiary} />
        <Text style={styles.footerText}>
          Nhấn vào sản phẩm để xem chi tiết và thêm vào giỏ hàng
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadow.md,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
    backgroundColor: theme.colors.primaryBg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primaryLighter,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  rxBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rxText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textOnPrimary,
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  headerOverline: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 1,
    opacity: 0.8,
  },
  headerCondition: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primaryDarker,
    marginTop: 1,
  },
  countBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textOnPrimary,
  },

  // ── Product list ─────────────────────────────────────────────────────────
  productList: {
    paddingLeft: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  trailingSpace: {
    width: theme.spacing.md,
  },

  // ── Each product card ────────────────────────────────────────────────────
  productCard: {
    width: 148,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    overflow: 'hidden',
    ...theme.shadow.xs,
  },
  cardTopStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  numberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.textOnPrimary,
  },
  medkitWrap: {
    opacity: 0.6,
  },
  cardBody: {
    padding: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    lineHeight: 18,
  },
  productDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 15,
    marginTop: 4,
    flex: 1,
  },
  cardFooter: {
    marginTop: theme.spacing.sm,
    gap: 5,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: -0.3,
  },
  buyBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    paddingVertical: 6,
    alignItems: 'center',
  },
  buyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textOnPrimary,
    letterSpacing: 0.3,
  },

  // ── Footer ───────────────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    backgroundColor: theme.colors.surfaceAlt,
  },
  footerText: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    flex: 1,
    lineHeight: 15,
  },
});
