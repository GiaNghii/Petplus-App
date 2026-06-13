import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { theme } from '../utils/theme';
import { WeightRecord } from '../types';

interface WeightChartProps {
  data: WeightRecord[];
  standardWeight?: number;
  height?: number;
}

const PADDING = { top: 24, right: 16, bottom: 36, left: 40 };

export default function WeightChart({ data, standardWeight, height = 200 }: WeightChartProps) {
  if (!data || data.length < 2) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>Chưa đủ dữ liệu cân nặng</Text>
      </View>
    );
  }

  const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const weights = sorted.map(d => d.weight);
  const minW = Math.min(...weights) - 1;
  const maxW = Math.max(...weights) + 1;
  const range = maxW - minW || 1;

  const chartW = 300;
  const chartH = height - PADDING.top - PADDING.bottom;

  const getX = (i: number) => PADDING.left + (i / (sorted.length - 1)) * (chartW - PADDING.left - PADDING.right);
  const getY = (w: number) => PADDING.top + (1 - (w - minW) / range) * chartH;

  const linePath = sorted
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.weight)}`)
    .join(' ');

  const areaPath = linePath
    + ` L ${getX(sorted.length - 1)} ${PADDING.top + chartH}`
    + ` L ${getX(0)} ${PADDING.top + chartH} Z`;

  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) => minW + (range * i) / (yTicks - 1));

  const formatDate = (d: Date) => {
    const date = new Date(d);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <View style={styles.container}>
      <Svg width={chartW} height={height}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={theme.colors.primary} stopOpacity="0.25" />
            <Stop offset="1" stopColor={theme.colors.primary} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {yTickValues.map((v, i) => (
          <G key={`ytick-${i}`}>
            <Line
              x1={PADDING.left}
              y1={getY(v)}
              x2={chartW - PADDING.right}
              y2={getY(v)}
              stroke={theme.colors.borderLight}
              strokeWidth={0.5}
              strokeDasharray="4,4"
            />
            <SvgText
              x={PADDING.left - 6}
              y={getY(v) + 4}
              fontSize={10}
              fill={theme.colors.textTertiary}
              textAnchor="end"
            >
              {v.toFixed(1)}
            </SvgText>
          </G>
        ))}

        {sorted.map((d, i) => (
          <SvgText
            key={`xlabel-${i}`}
            x={getX(i)}
            y={PADDING.top + chartH + 20}
            fontSize={9}
            fill={theme.colors.textTertiary}
            textAnchor="middle"
          >
            {formatDate(d.date)}
          </SvgText>
        ))}

        {standardWeight && standardWeight >= minW && standardWeight <= maxW && (
          <G>
            <Line
              x1={PADDING.left}
              y1={getY(standardWeight)}
              x2={chartW - PADDING.right}
              y2={getY(standardWeight)}
              stroke={theme.colors.secondary}
              strokeWidth={1.5}
              strokeDasharray="6,4"
            />
            <SvgText
              x={chartW - PADDING.right + 2}
              y={getY(standardWeight) + 3}
              fontSize={9}
              fill={theme.colors.secondary}
            >
              TC
            </SvgText>
          </G>
        )}

        <Path d={areaPath} fill="url(#areaGrad)" />
        <Path d={linePath} stroke={theme.colors.primary} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {sorted.map((d, i) => (
          <Circle
            key={`dot-${i}`}
            cx={getX(i)}
            cy={getY(d.weight)}
            r={4}
            fill={theme.colors.surface}
            stroke={theme.colors.primary}
            strokeWidth={2}
          />
        ))}

        {sorted.map((d, i) => (
          <SvgText
            key={`label-${i}`}
            x={getX(i)}
            y={getY(d.weight) - 10}
            fontSize={10}
            fontWeight="600"
            fill={theme.colors.primary}
            textAnchor="middle"
          >
            {d.weight.toFixed(1)}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  empty: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textTertiary,
  },
});
