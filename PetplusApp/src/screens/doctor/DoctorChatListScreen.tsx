import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';
import Header from '../../components/Header';
import Icon from '../../components/Icon';

const CHATS = [
  {
    id: '1',
    pet: 'Buddy',
    customer: 'Nguyễn Văn C',
    status: 'waiting',
    lastMessage: 'Khách hàng đang nhập tin nhắn...',
    time: 'Vừa xong',
    breed: 'Poodle | 3 tuổi | 5kg',
    unread: true,
  },
  {
    id: '2',
    pet: 'Mèo',
    customer: 'Trần Thị D',
    status: 'active',
    lastMessage: 'Mèo em bỏ ăn 2 ngày rồi...',
    time: '2 phút trước',
    breed: 'Anh lông dài | 2 tuổi | 3kg',
    unread: true,
  },
  {
    id: '3',
    pet: 'Brown',
    customer: 'Lê Văn E',
    status: 'active',
    lastMessage: 'Cảm ơn bác sĩ ạ!',
    time: '15 phút trước',
    breed: 'Husky | 4 tuổi | 22kg',
    unread: false,
  },
  {
    id: '4',
    pet: 'Mèo Mun',
    customer: 'Phạm Thị F',
    status: 'waiting',
    lastMessage: '[Hình ảnh]',
    time: '30 phút trước',
    breed: 'Mèo Ba Tư | 5 tuổi | 4kg',
    unread: true,
  },
];

export default function DoctorChatListScreen({ navigation }: any) {
  const renderChat = ({ item }: any) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() => navigation.navigate('DoctorChat', { 
        customerId: item.id, 
        petName: item.pet, 
        customerName: item.customer 
      })}
    >
      <View style={styles.petAvatar}>
        <Icon name="paw" size={24} color={theme.colors.warning} />
        {item.unread && <View style={styles.unreadDot} />}
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.customer}>{item.customer}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <View style={styles.petInfoRow}>
          <Icon name="paw" size={12} color={theme.colors.textSecondary} />
          <Text style={styles.petInfo}>
            {item.pet} - {item.breed}
          </Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
        <View style={styles.statusRow}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'waiting' ? theme.colors.warning : theme.colors.primary }
          ]}>
            <Text style={styles.statusText}>
              {item.status === 'waiting' ? 'Chờ tư vấn' : 'Đang chat'}
            </Text>
          </View>
          {item.status === 'waiting' && (
            <TouchableOpacity style={styles.acceptButton}>
              <Text style={styles.acceptButtonText}>Nhận tư vấn</Text>
              <Icon name="arrow-forward" size={12} color={theme.colors.textOnPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Tư vấn online"
        subtitle="4 chờ • 2 đang chat"
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={CHATS}
        renderItem={renderChat}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: theme.spacing.lg,
  },
  chatCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadow.sm,
  },
  petAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.warningBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.danger,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  customer: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
  time: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  petInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  petInfo: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  lastMessage: {
    ...theme.typography.small,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: theme.colors.textOnPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  acceptButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
});