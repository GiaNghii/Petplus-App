import React from 'react';
import {
  View,
  Text,
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

      <View style={styles.productList}>
        {products.map((product, index) => (
          <TouchableOpacity
            key={product.id}
            style={[
              styles.productCard,
              { borderLeftColor: CARD_ACCENTS[index % CARD_ACCENTS.length] },
            ]}
            onPress={() => onProductTap(product)}
            activeOpacity={0.85}
          >
            <View style={styles.cardTopStrip}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{index + 1}</Text>
              </View>
              <View style={styles.productTitleWrap}>
                <Text style={styles.productName}>
                  {product.name}
                </Text>
                <Text style={styles.productPrice}>
                  {product.price.toLocaleString('vi-VN')}đ
                </Text>
              </View>
              <View style={styles.buyBtn}>
                <Text style={styles.buyBtnText}>Mua</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              {(product.reason || product.description) ? (
                <View style={styles.explainBlock}>
                  <Text style={styles.explainLabel}>Vì sao gợi ý</Text>
                  <Text style={styles.explainText}>
                    {product.reason || product.description}
                  </Text>
                </View>
              ) : null}

              {product.usageGuide ? (
                <View style={styles.explainBlock}>
                  <Text style={styles.explainLabel}>Cách dùng an toàn</Text>
                  <Text style={styles.explainText}>
                    {product.usageGuide}
                  </Text>
                </View>
              ) : null}

              <View style={styles.safetyNote}>
                <Icon name="information-circle" size={13} color={theme.colors.primary} />
                <Text style={styles.safetyNoteText}>
                  Không tự tăng liều. Nếu triệu chứng nặng hơn, đưa thú cưng đến Petplus để bác sĩ kiểm tra.
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

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
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },

  // ── Each product card ────────────────────────────────────────────────────
  productCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderLeftWidth: 5,
    overflow: 'hidden',
    ...theme.shadow.xs,
  },
  cardTopStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.sm,
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
  productTitleWrap: {
    flex: 1,
  },
  cardBody: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    lineHeight: 19,
  },
  explainBlock: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
  },
  explainLabel: {
    ...theme.typography.overline,
    color: theme.colors.primary,
    marginBottom: 3,
  },
  explainText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: -0.3,
    marginTop: 2,
  },
  buyBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  buyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textOnPrimary,
    letterSpacing: 0.3,
  },
  safetyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    paddingTop: theme.spacing.xs,
  },
  safetyNoteText: {
    flex: 1,
    fontSize: 11,
    color: theme.colors.textTertiary,
    lineHeight: 15,
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
