import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../utils/theme';
import Icon from './Icon';
import {
  CONDITIONS,
  checkPetHasCondition,
} from '../data/quickChatData';
import { Pet } from '../types';

interface QuickChatPanelProps {
  visible: boolean;
  pet: Pet | null;
  onSelectCondition: (conditionId: string) => void;
  onDismiss: () => void;
}

export default function QuickChatPanel({
  visible,
  pet,
  onSelectCondition,
  onDismiss,
}: QuickChatPanelProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.handle} />

      <View style={styles.header}>
        <Text style={styles.title}>Chọn vấn đề thường gặp</Text>
        <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
          <Icon name="close" size={20} color={theme.colors.textTertiary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.conditionList}
      >
        {CONDITIONS.map((condition) => {
          const hasHistory = pet ? checkPetHasCondition(pet, condition) : false;
          return (
            <TouchableOpacity
              key={condition.id}
              style={styles.conditionCard}
              onPress={() => onSelectCondition(condition.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.conditionName}>{condition.name}</Text>
              <Text style={styles.conditionSymptoms} numberOfLines={2}>
                {condition.symptoms}
              </Text>
              {hasHistory && (
                <View style={styles.historyBadge}>
                  <Text style={styles.historyBadgeText}>Bệnh từng mắc phải</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    paddingBottom: theme.spacing.lg,
    ...theme.shadow.lg,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    flex: 1,
    ...theme.typography.h4,
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    padding: theme.spacing.xs,
  },
  conditionList: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  conditionCard: {
    backgroundColor: theme.colors.primaryBg,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    width: 160,
    minHeight: 100,
    borderWidth: 1,
    borderColor: theme.colors.primaryLighter,
  },
  conditionName: {
    ...theme.typography.bodyBold,
    color: theme.colors.primaryDarker,
    marginBottom: theme.spacing.xs,
  },
  conditionSymptoms: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  historyBadge: {
    backgroundColor: theme.colors.warningBg,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
    alignSelf: 'flex-start',
    marginTop: 'auto',
  },
  historyBadgeText: {
    ...theme.typography.overline,
    color: theme.colors.warning,
    fontSize: 10,
  },
});
