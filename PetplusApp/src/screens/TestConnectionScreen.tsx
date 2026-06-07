import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { testFirebaseConnection } from '../utils/testConnection';

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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 Kiểm tra kết nối Firebase</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={runTest}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
        </Text>
      </TouchableOpacity>

      {result && (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>Kết quả:</Text>
          <Text style={styles.resultText}>
            {result.success ? '✅ Thành công!' : '❌ Thất bại'}
          </Text>
          {result.error && (
            <Text style={styles.error}>Lỗi: {result.error}</Text>
          )}
          {result.userId && (
            <Text style={styles.success}>User ID: {result.userId}</Text>
          )}
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.infoTitle}>Thông tin kết nối:</Text>
        <Text style={styles.infoText}>Project: petplus-af32a</Text>
        <Text style={styles.infoText}>Auth Domain: petplus-af32a.firebaseapp.com</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2E7D32',
  },
  button: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  result: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 8,
  },
  error: {
    color: '#D32F2F',
    fontSize: 14,
  },
  success: {
    color: '#1B5E20',
    fontSize: 14,
  },
  info: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
});
