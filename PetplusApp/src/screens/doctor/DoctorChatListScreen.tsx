import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { consultationService, messageService } from '../../services/firestoreService';
import { Consultation, Message } from '../../types';
import { theme } from '../../utils/theme';
import Header from '../../components/Header';
import Icon from '../../components/Icon';

const STATIC_CHATS = [
  {
    id: 'static_1',
    petName: 'Buddy',
    customerName: 'Nguyễn Văn C',
    status: 'waiting' as const,
    lastMessage: 'Khách hàng đang nhập tin nhắn...',
    time: 'Vừa xong',
    breed: 'Poodle | 3 tuổi | 5kg',
    unread: true,
  },
  {
    id: 'static_2',
    petName: 'Mèo',
    customerName: 'Trần Thị D',
    status: 'active' as const,
    lastMessage: 'Mèo em bỏ ăn 2 ngày rồi...',
    time: '2 phút trước',
    breed: 'Anh lông dài | 2 tuổi | 3kg',
    unread: true,
  },
];

interface ChatRow {
  id: string;
  consultationId?: string;
  petName: string;
  customerName: string;
  status: Consultation['status'];
  lastMessage: string;
  time: string;
  breed: string;
  unread: boolean;
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.floor(diffMinutes / 60);
  return `${diffHours} giờ trước`;
}

export default function DoctorChatListScreen({ navigation }: any) {
  const { user } = useAuth();
  const [rows, setRows] = useState<ChatRow[]>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener?.('focus', loadChats);
    loadChats();
    return unsubscribe;
  }, [navigation]);

  const loadChats = async () => {
    const result = await consultationService.getConsultationsByDoctor(user?.id || 'demo_doctor');
    const consultations = result.success && result.consultations ? result.consultations : [];

    const dynamicRows = await Promise.all(consultations.map(async (consultation: Consultation) => {
      const messageResult = await messageService.getMessagesByConsultation(consultation.id);
      const consultationMessages = messageResult.success && messageResult.messages ? messageResult.messages : [];
      const lastMessage = consultationMessages[consultationMessages.length - 1] as Message | undefined;

      return {
        id: consultation.id,
        consultationId: consultation.id,
        petName: consultation.petName || 'Thú cưng',
        customerName: consultation.customerName || 'Khách hàng',
        status: consultation.status,
        lastMessage: lastMessage?.productLink ? 'Bác sĩ đã gửi đơn thuốc' : (lastMessage?.text || 'Chưa có tin nhắn'),
        time: formatRelativeTime(consultation.updatedAt),
        breed: 'Hồ sơ tư vấn online',
        unread: consultation.status === 'waiting' || lastMessage?.senderRole === 'customer',
      } satisfies ChatRow;
    }));

    setRows([...dynamicRows, ...STATIC_CHATS]);
  };

  const openChat = async (item: ChatRow) => {
    if (item.consultationId && item.status === 'waiting') {
      await consultationService.updateConsultationStatus(item.consultationId, 'active');
    }

    navigation.navigate('DoctorChat', {
      consultationId: item.consultationId,
      customerId: item.id,
      petName: item.petName,
      customerName: item.customerName,
    });
  };

  const waitingCount = rows.filter(item => item.status === 'waiting').length;
  const activeCount = rows.filter(item => item.status === 'active').length;

  const renderChat = ({ item }: { item: ChatRow }) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() => openChat(item)}
    >
      <View style={styles.petAvatar}>
        <Icon name="paw" size={24} color={theme.colors.warning} />
        {item.unread && <View style={styles.unreadDot} />}
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.customer}>{item.customerName}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <View style={styles.petInfoRow}>
          <Icon name="paw" size={12} color={theme.colors.textSecondary} />
          <Text style={styles.petInfo}>
            {item.petName} - {item.breed}
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
              {item.status === 'waiting' ? 'Chờ tư vấn' : 'Đang tư vấn'}
            </Text>
          </View>
          {item.status === 'waiting' && (
            <TouchableOpacity style={styles.acceptButton} onPress={() => openChat(item)}>
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
        subtitle={`${waitingCount} chờ • ${activeCount} đang tư vấn`}
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={rows}
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
