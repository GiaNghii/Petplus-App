import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../utils/theme';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ModernCard from '../../components/ModernCard';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Đăng nhập thất bại');
    }
    setLoading(false);
  };

  const useDemoAccount = (type: 'customer' | 'doctor') => {
    setEmail(type === 'customer' ? 'demo@petplus.vn' : 'doctor@petplus.vn');
    setPassword('123456');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.logoRow}>
            <Icon name="paw" size={28} color={theme.colors.textOnPrimary} />
            <Text style={styles.logoText}>Petplus</Text>
          </View>
          <Text style={styles.welcomeText}>Chào mừng bạn</Text>
          <Text style={styles.heroSubtext}>Đăng nhập để chăm sóc thú cưng của bạn tốt hơn</Text>
        </View>

        {/* Form Card */}
        <ModernCard style={styles.formCardOverlap} padding="xxl">
          {error ? (
            <View style={styles.errorBox}>
              <Icon name="alert-circle" size={16} color={theme.colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Email"
            icon="mail"
            placeholder="example@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Mật khẩu"
            icon="lock-closed"
            placeholder="Nhập mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title="Đăng nhập"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            fullWidth
            icon="arrow-forward"
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>hoặc</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Tạo tài khoản mới"
            variant="outline"
            onPress={() => navigation.navigate('Register')}
            fullWidth
          />
        </ModernCard>

        {/* Demo Accounts */}
        <ModernCard style={styles.demoCard} variant="accent" padding="lg">
          <View style={styles.demoTitleRow}>
            <Icon name="flash" size={16} color={theme.colors.textPrimary} />
            <Text style={styles.demoTitle}>Dùng thử nhanh</Text>
          </View>
          <Text style={styles.demoSubtitle}>Bấm vào tài khoản để tự động điền thông tin</Text>
          <View style={styles.demoButtons}>
            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => useDemoAccount('customer')}
            >
              <Icon name="person" size={32} color={theme.colors.primary} />
              <Text style={styles.demoName}>Khách hàng</Text>
              <Text style={styles.demoAccount}>demo@petplus.vn</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => useDemoAccount('doctor')}
            >
              <Icon name="medical" size={32} color={theme.colors.primary} />
              <Text style={styles.demoName}>Bác sĩ</Text>
              <Text style={styles.demoAccount}>doctor@petplus.vn</Text>
            </TouchableOpacity>
          </View>
        </ModernCard>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLogoRow}>
            <Icon name="paw" size={16} color={theme.colors.primary} />
            <Text style={styles.footerLogoText}>Petplus</Text>
          </View>
          <Text style={styles.footerText}>Chăm sóc thú cưng 24/7</Text>
        </View>
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
  },
  hero: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 48,
    borderBottomLeftRadius: theme.radius.xxl,
    borderBottomRightRadius: theme.radius.xxl,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textOnPrimary,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textOnPrimary,
    marginBottom: 8,
  },
  heroSubtext: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
  },
  formCardOverlap: {
    marginHorizontal: 20,
    marginTop: -28,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.dangerBg,
    padding: 12,
    borderRadius: theme.radius.md,
    marginBottom: 16,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    color: theme.colors.textTertiary,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  demoCard: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  demoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  demoSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  demoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  demoButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  demoName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: 8,
  },
  demoAccount: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  footerLogoText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  footerText: {
    fontSize: 13,
    color: theme.colors.textTertiary,
  },
});
