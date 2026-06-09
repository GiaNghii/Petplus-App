import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../utils/theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ModernCard from '../../components/ModernCard';

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    setError('');

    const result = await register(email, password, name, phone);
    if (!result.success) {
      setError(result.error || 'Đăng ký thất bại');
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Tạo tài khoản</Text>
        </View>

        <ModernCard style={styles.formCard} padding="xxl">
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Họ và tên"
            icon="person"
            placeholder="Nhập họ tên"
            value={name}
            onChangeText={setName}
          />

          <Input
            label="Email"
            icon="mail"
            placeholder="Nhập email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Số điện thoại"
            icon="call"
            placeholder="Nhập số điện thoại"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Input
            label="Mật khẩu"
            icon="lock-closed"
            placeholder="Nhập mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Input
            label="Xác nhận mật khẩu"
            icon="lock-closed"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Button
            title="Đăng ký"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            fullWidth
            icon="arrow-forward"
          />

          <Button
            title="Đã có tài khoản? Đăng nhập"
            variant="ghost"
            onPress={() => navigation.navigate('Login')}
            fullWidth
          />
        </ModernCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 24,
  },
  formCard: {
    marginHorizontal: 20,
  },
  errorBox: {
    backgroundColor: theme.colors.dangerBg,
    padding: 12,
    borderRadius: theme.radius.md,
    marginBottom: 16,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 14,
    fontWeight: '500',
  },
});
