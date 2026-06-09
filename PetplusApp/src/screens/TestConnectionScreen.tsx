import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { testFirebaseConnection } from '../utils/testConnection';
import { theme } from '../utils/theme';
import Icon from '../components/Icon';
import Button from '../components/Button';
import ModernCard from '../components/ModernCard';

export default function TestConnectionScreen() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    const testResult = await testFirebaseConnection();
    setResult(testResult);
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.titleRow}>
        <Icon name="search" size={24} color={theme.colors.primary} />
        <Text style={styles.title}>Kiểm tra kết nối Firebase</Text>
      </View>

      <Button
        title={loading ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
        onPress={runTest}
        loading={loading}
        disabled={loading}
        fullWidth
      />

      {result && (
        <ModernCard style={styles.resultCard} padding="lg">
          <Text style={styles.resultTitle}>Kết quả:</Text>
          <View style={styles.resultRow}>
            {result.success ? (
              <>
                <Icon name="checkmark" size={20} color={theme.colors.primary} />
                <Text style={styles.resultSuccess}>Thành công!</Text>
              </>
            ) : (
              <>
                <Icon name="close" size={20} color={theme.colors.danger} />
                <Text style={styles.resultFail}>Thất bại</Text>
              </>
            )}
          </View>
          {result.error && (
            <Text style={styles.errorText}>Lỗi: {result.error}</Text>
          )}
          {result.userId && (
            <Text style={styles.successText}>User ID: {result.userId}</Text>
          )}
        </ModernCard>
      )}

      <ModernCard style={styles.infoCard} variant="accent" padding="lg">
        <Text style={styles.infoTitle}>Thông tin kết nối:</Text>
        <Text style={styles.infoText}>Project: petplus-af32a</Text>
        <Text style={styles.infoText}>Auth Domain: petplus-af32a.firebaseapp.com</Text>
      </ModernCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  resultCard: {
    marginTop: 20,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: theme.colors.textPrimary,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  resultSuccess: {
    fontSize: 16,
    color: theme.colors.primary,
  },
  resultFail: {
    fontSize: 16,
    color: theme.colors.danger,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 14,
    marginTop: 4,
  },
  successText: {
    color: theme.colors.primary,
    fontSize: 14,
    marginTop: 4,
  },
  infoCard: {
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: theme.colors.textPrimary,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
});
