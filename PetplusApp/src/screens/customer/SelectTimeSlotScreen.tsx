import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';
import Header from '../../components/Header';
import Button from '../../components/Button';

const SLOTS = [
  { time: '07:00 - 09:00', available: 2, total: 3 },
  { time: '09:00 - 11:00', available: 1, total: 3 },
  { time: '11:00 - 13:00', available: 3, total: 3 },
  { time: '13:00 - 15:00', available: 2, total: 3 },
  { time: '15:00 - 17:00', available: 3, total: 3 },
  { time: '17:00 - 19:00', available: 2, total: 3 },
  { time: '19:00 - 21:00', available: 3, total: 3 },
  { time: '21:00 - 23:00', available: 3, total: 3 },
];

const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const generateDates = () => {
  const dates: { label: string; dateStr: string; display: string }[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    dates.push({
      label: DAY_LABELS[d.getDay()],
      dateStr: d.toISOString(),
      display: d.toLocaleDateString('vi-VN'),
    });
  }
  return dates;
};

const DATES = generateDates();

export default function SelectTimeSlotScreen({ route, navigation }: any) {
  const { branchId, doctorId, petId, petName } = route.params;
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Chọn khung giờ"
        subtitle="Bước 3 / 4"
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headerInfo}>
          <Text style={styles.stepText}>Bước 3 / 4</Text>
          <Text style={styles.title}>Chọn ngày và giờ khám</Text>
          <Text style={styles.subtitle}>Mỗi khung giờ 2 tiếng, tối đa 3 bệnh nhân</Text>
        </View>

        <View style={styles.dateSection}>
          <Text style={styles.sectionTitle}>Chọn ngày</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
            <View style={styles.dateList}>
              {DATES.map((dateItem, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateButton,
                    selectedDate === index && styles.dateButtonSelected,
                  ]}
                  onPress={() => setSelectedDate(index)}
                >
                  <Text style={[styles.dateText, selectedDate === index && styles.dateTextSelected]}>
                    {dateItem.label}
                  </Text>
                  <Text style={[styles.dateNumber, selectedDate === index && styles.dateTextSelected]}>
                    {new Date(dateItem.dateStr).getDate()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.timeSection}>
          <Text style={styles.sectionTitle}>Chọn khung giờ</Text>
          <View style={styles.slotsGrid}>
            {SLOTS.map((slot) => (
              <TouchableOpacity
                key={slot.time}
                style={[
                  styles.slotCard,
                  selectedSlot === slot.time && styles.slotCardSelected,
                  slot.available === 0 && styles.slotCardFull,
                ]}
                onPress={() => {
                  if (slot.available > 0) {
                    setSelectedSlot(slot.time);
                  }
                }}
                disabled={slot.available === 0}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.slotTime,
                  selectedSlot === slot.time && styles.slotTextSelected,
                  slot.available === 0 && styles.slotTextFull,
                ]}>
                  {slot.time}
                </Text>
                <View style={[
                  styles.slotBadge,
                  slot.available === 0 ? styles.slotBadgeFull : styles.slotBadgeAvailable,
                  selectedSlot === slot.time && styles.slotBadgeSelected,
                ]}>
                  <Text style={[
                    styles.slotBadgeText,
                    selectedSlot === slot.time && { color: theme.colors.textOnPrimary },
                  ]}>
                    {slot.available === 0 ? 'Đã đầy' : `${slot.available}/${slot.total} chỗ`}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
            <Text style={styles.legendText}>Còn chỗ</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.border }]} />
            <Text style={styles.legendText}>Đã đầy</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Xác nhận đặt lịch"
          onPress={() => {
            if (selectedSlot) {
              const selected = DATES[selectedDate];
              navigation.navigate('BookingConfirmation', {
                branchId,
                doctorId,
                date: selected.dateStr,
                dateDisplay: selected.display,
                slot: selectedSlot,
                petId,
                petName,
              });
            }
          }}
          disabled={!selectedSlot}
          fullWidth
          size="lg"
        />
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
    paddingBottom: 100,
  },
  headerInfo: {
    marginBottom: theme.spacing.xl,
  },
  stepText: {
    ...theme.typography.smallBold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  dateSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  dateList: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  dateButton: {
    width: 60,
    height: 76,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadow.sm,
  },
  dateButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dateText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  dateTextSelected: {
    color: theme.colors.textOnPrimary,
    fontWeight: '600',
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  timeSection: {
    marginBottom: theme.spacing.lg,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  slotCard: {
    width: '47%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadow.sm,
  },
  slotCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryBg,
  },
  slotCardFull: {
    backgroundColor: theme.colors.surfaceAlt,
    opacity: 0.6,
  },
  slotTime: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  slotBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
    alignSelf: 'flex-start',
  },
  slotBadgeAvailable: {
    backgroundColor: theme.colors.primaryBg,
  },
  slotBadgeFull: {
    backgroundColor: theme.colors.surfaceAlt,
  },
  slotBadgeSelected: {
    backgroundColor: theme.colors.primary,
  },
  slotBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primaryDarker,
  },
  slotTextSelected: {
    color: theme.colors.primaryDarker,
  },
  slotTextFull: {
    color: theme.colors.textTertiary,
  },
  legend: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  footer: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
});
