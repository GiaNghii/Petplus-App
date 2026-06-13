import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { consultationService, messageService, productService } from '../../services/firestoreService';
import { Product } from '../../data/products';
import { Message } from '../../types';
import { theme } from '../../utils/theme';
import Header from '../../components/Header';
import Icon from '../../components/Icon';

// ─── List item types ──────────────────────────────────────────────────────────

type DateSeparatorItem = { type: 'dateSeparator'; id: string; label: string };
type ListItem = Message | DateSeparatorItem;

function isMsgItem(item: ListItem): item is Message {
  return !('type' in item && (item as DateSeparatorItem).type === 'dateSeparator');
}

function insertDateSeparators(messages: Message[]): ListItem[] {
  if (!messages.length) return [];
  const result: ListItem[] = [];
  let lastKey = '';
  const toKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const todayKey = toKey(new Date());
  const yesterdayKey = toKey(new Date(Date.now() - 86400000));
  for (const msg of messages) {
    const d = new Date(msg.createdAt);
    const key = toKey(d);
    if (key !== lastKey) {
      let label = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      if (key === todayKey) label = 'Hôm nay';
      else if (key === yesterdayKey) label = 'Hôm qua';
      result.push({ type: 'dateSeparator', id: `sep_${key}`, label });
      lastKey = key;
    }
    result.push(msg);
  }
  return result;
}

function isLastInGroup(items: ListItem[], index: number): boolean {
  const cur = items[index];
  if (!isMsgItem(cur)) return false;
  const next = items[index + 1];
  if (!next || !isMsgItem(next)) return true;
  return next.senderRole !== cur.senderRole;
}

// ─── Static demo data ─────────────────────────────────────────────────────────

const STATIC_MESSAGES: Message[] = [
  {
    id: 'static_msg_1',
    consultationId: 'static',
    senderId: 'demo_user',
    senderRole: 'customer',
    text: 'Dạ chào bác sĩ, em muốn hỏi về tình trạng của Buddy ạ.',
    createdAt: new Date(),
    source: 'user',
  },
];

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function DoctorChatScreen({ route, navigation }: any) {
  const { consultationId, petName, customerName } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(consultationId ? [] : STATIC_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const listItems = useMemo(() => insertDateSeparators(messages), [messages]);

  useEffect(() => {
    loadChat();
    loadProducts();
  }, [consultationId]);

  const loadChat = async () => {
    if (!consultationId) return;

    await consultationService.updateConsultationStatus(consultationId, 'active');
    const result = await messageService.getMessagesByConsultation(consultationId);
    if (result.success && result.messages) {
      setMessages(result.messages);
    }
  };

  const loadProducts = async () => {
    const result = await productService.getProducts();
    if (result.success && result.products) {
      setProducts(result.products.filter((product: Product) => product.type === 'prescription').slice(0, 8));
    }
  };

  const appendMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const createStoredMessage = async (data: Parameters<typeof messageService.createMessage>[0]) => {
    if (!consultationId) {
      const localMessage: Message = {
        id: `local_${Date.now()}`,
        consultationId: 'static',
        senderId: data.senderId,
        senderRole: data.senderRole,
        text: data.text,
        productLink: data.productLink,
        imageUrl: data.imageUrl,
        createdAt: new Date(),
        source: data.source,
      };
      appendMessage(localMessage);
      return localMessage;
    }

    const result = await messageService.createMessage(data);
    if (result.success && result.message) {
      appendMessage(result.message);
      return result.message;
    }
    return null;
  };

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text) return;

    await createStoredMessage({
      consultationId: consultationId || 'static',
      senderId: user?.id || 'demo_doctor',
      senderRole: 'doctor',
      text,
      source: 'doctor',
    });
    setInputText('');
  };

  const sendPrescription = async (product: Product) => {
    await createStoredMessage({
      consultationId: consultationId || 'static',
      senderId: user?.id || 'demo_doctor',
      senderRole: 'doctor',
      text: `Tôi kê đơn thuốc này cho ${petName}:`,
      source: 'doctor',
      productLink: {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
      },
    });
    setShowProductList(false);
    Alert.alert(
      'Đã gửi đơn thuốc',
      `Đã gửi ${product.name} cho khách hàng. Khách hàng có thể mua ngay trên app.`,
      [{ text: 'OK' }]
    );
  };

  const renderItem = ({ item, index }: { item: ListItem; index: number }) => {
    // Date separator
    if (!isMsgItem(item)) {
      return (
        <View style={styles.dateSeparator}>
          <View style={styles.dateSeparatorLine} />
          <Text style={styles.dateSeparatorText}>{item.label}</Text>
          <View style={styles.dateSeparatorLine} />
        </View>
      );
    }

    const isDoctor = item.senderRole === 'doctor';
    const lastInGroup = isLastInGroup(listItems, index);

    return (
      <View style={[
        styles.messageContainer,
        isDoctor ? styles.doctorMessage : styles.customerMessage,
        !lastInGroup && styles.messageCompact,
      ]}>
        <View style={[
          styles.messageBubble,
          isDoctor ? styles.doctorBubble : styles.customerBubble,
          lastInGroup && (isDoctor ? styles.doctorBubbleTail : styles.customerBubbleTail),
        ]}>
          <Text style={[styles.messageText, isDoctor ? styles.doctorText : styles.customerText]}>
            {item.text}
          </Text>
          {item.productLink && (
            <View style={styles.productCard}>
              <Icon name="medkit" size={32} color={theme.colors.primary} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.productLink.name}</Text>
                <Text style={styles.productPrice}>
                  {item.productLink.price.toLocaleString('vi-VN')}đ
                </Text>
                <Text style={styles.prescriptionNote}>Đơn thuốc cho {petName}</Text>
              </View>
            </View>
          )}
          <Text style={[styles.timestamp, isDoctor ? styles.doctorTimestamp : styles.customerTimestamp]}>
            {item.createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title={customerName}
        subtitle={`${petName} - Đang tư vấn`}
        onBack={() => navigation.goBack()}
        rightIcon="create"
        onRightPress={() => setShowProductList(true)}
        variant="primary"
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={listItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {showProductList && (
          <View style={styles.productPanel}>
            <View style={styles.productPanelHeader}>
              <Text style={styles.productPanelTitle}>Chọn thuốc kê đơn</Text>
              <TouchableOpacity onPress={() => setShowProductList(false)}>
                <Icon name="close" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {products.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productItem}
                onPress={() => sendPrescription(product)}
              >
                <Icon name="medkit" size={24} color={theme.colors.primary} />
                <View style={styles.productItemInfo}>
                  <Text style={styles.productItemName} numberOfLines={2}>{product.name}</Text>
                  <Text style={styles.productItemPrice}>
                    {product.price.toLocaleString('vi-VN')}đ
                  </Text>
                </View>
                <Icon name="send" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.prescriptionBtn}
            onPress={() => setShowProductList(!showProductList)}
          >
            <Icon name="medkit" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn cho khách..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Icon name="send" size={18} color={theme.colors.textOnPrimary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: theme.spacing.lg,
  },

  // ─── Message containers ──────────────────────────────────────────────────
  messageContainer: {
    marginBottom: theme.spacing.md,
    maxWidth: '85%',
  },
  messageCompact: {
    marginBottom: 3,
  },
  doctorMessage: {
    alignSelf: 'flex-end',
  },
  customerMessage: {
    alignSelf: 'flex-start',
  },

  // ─── Bubbles ─────────────────────────────────────────────────────────────
  messageBubble: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
  },
  doctorBubble: {
    backgroundColor: theme.colors.primary,
  },
  doctorBubbleTail: {
    borderBottomRightRadius: 4,
  },
  customerBubble: {
    backgroundColor: theme.colors.surfaceAlt,
  },
  customerBubbleTail: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  doctorText: {
    color: theme.colors.textOnPrimary,
  },
  customerText: {
    color: theme.colors.textPrimary,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  doctorTimestamp: {
    color: theme.colors.textOnPrimary,
  },
  customerTimestamp: {
    color: theme.colors.textSecondary,
  },

  // ─── Date separator ───────────────────────────────────────────────────────
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.divider,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    fontWeight: '500',
    paddingHorizontal: theme.spacing.xs,
  },

  // ─── Prescription card ────────────────────────────────────────────────────
  productCard: {
    backgroundColor: theme.colors.warningBg,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primaryDarker,
    marginTop: 4,
  },
  prescriptionNote: {
    fontSize: 12,
    color: theme.colors.danger,
    marginTop: 4,
  },

  // ─── Product picker panel ─────────────────────────────────────────────────
  productPanel: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    maxHeight: 320,
  },
  productPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceAlt,
  },
  productPanelTitle: {
    ...theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    gap: theme.spacing.md,
  },
  productItemInfo: {
    flex: 1,
  },
  productItemName: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  productItemPrice: {
    fontSize: 12,
    color: theme.colors.primaryDarker,
    fontWeight: '600',
    marginTop: 2,
  },

  // ─── Input bar ────────────────────────────────────────────────────────────
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
  },
  prescriptionBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.warningBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    fontSize: 16,
    maxHeight: 100,
    marginHorizontal: theme.spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
});
