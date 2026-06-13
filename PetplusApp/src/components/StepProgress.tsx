import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';

interface StepProgressProps {
  current: number; // 1-based current step
  total: number;
}

export default function StepProgress({ current, total }: StepProgressProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            i < current ? styles.active : styles.inactive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
    marginBottom: 4,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: theme.radius.pill,
  },
  active: {
    backgroundColor: theme.colors.primary,
  },
  inactive: {
    backgroundColor: theme.colors.border,
  },
});
