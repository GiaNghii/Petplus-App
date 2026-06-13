import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';
import Header from '../../components/Header';
import Icon from '../../components/Icon';
import QuickChatPanel from '../../components/QuickChatPanel';
import { consultationService, messageService, orderService, petService, productService } from '../../services/firestoreService';
import { generateConsultationReply } from '../../services/aiChatService';
import { useAuth } from '../../context/AuthContext';
import { Message, Order, Pet } from '../../types';
import { TREATMENTS, buildQuickChatMessage, checkTreatmentPrescribed, CONDITIONS } from '../../data/quickChatData';

const CONDITION_INTROS: Record<string, string> = {
  condition_ear_mites: 'Dạ anh/chị, với tình trạng rận tai bên em có các sản phẩm sau. Anh/chị xem và chọn sản phẩm phù hợp nhé:',
  condition_watery_eyes: 'Dạ anh/chị, với tình trạng chảy nước mắt bên em có các sản phẩm sau. Anh/chị tham khảo nhé:',
  condition_hair_loss: 'Dạ anh/chị, với tình trạng rụng lông bên em đề xuất các sản phẩm hỗ trợ sau. Anh/chị xem qua nhé:',
  condition_matted_fur: 'Dạ anh/chị, với tình trạng bết lông bên em có các sản phẩm chăm sóc sau. Anh/chị tham khảo nhé:',
};

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

// ─── Animated typing indicator ────────────────────────────────────────────────

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Each dot bounces in a 900ms cycle, staggered by 150ms
    const bounce = (dot: Animated.Value, startDelay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(startDelay),
          Animated.timing(dot, { toValue: 1, duration: 250, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 250, useNativeDriver: true }),
          Animated.delay(Math.max(0, 900 - startDelay - 500)),
        ])
      );
    const a1 = bounce(dot1, 0);
    const a2 = bounce(dot2, 150);
    const a3 = bounce(dot3, 300);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View style={tStyles.row}>
      <View style={tStyles.bubble}>
        {([dot1, dot2, dot3] as Animated.Value[]).map((dot, i) => (
          <Animated.View
            key={i}
            style={[tStyles.dot, {
              transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }],
            }]}
          />
        ))}
      </View>
    </View>
  );
}

const tStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: theme.radius.lg,
    borderBottomLeftRadius: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.textSecondary,
  },
});

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function ChatScreen({ route, navigation }: any) {
  const { doctorId, doctorName, petName, petId } = route.params;
  const { user } = useAuth();
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [pet, setPet] = useState<Pet | null>(null);
  const [prescribedMedNames, setPrescribedMedNames] = useState<string[]>([]);
  const [showQuickChat, setShowQuickChat] = useState(true);

  const listItems = useMemo(() => insertDateSeparators(messages), [messages]);

  useEffect(() => {
    initializeConsultation();
    return () => { timeoutRefs.current.forEach(clearTimeout); };
  }, []);

  const appendMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const initializeConsultation = async () => {
    const customerId = user?.id || 'demo_user';
    const currentPetId = petId || 'demo_pet';
    const result = await consultationService.getOrCreateConsultation({
      customerId,
      doctorId,
      petId: currentPetId,
      petName,
      customerName: user?.name || 'Khách hàng',
      doctorName,
    });

    if (!result.success || !result.consultation) return;

    setConsultationId(result.consultation.id);
    await messageService.ensureWelcomeMessage({
      consultationId: result.consultation.id,
      doctorId,
      doctorName,
      petName,
    });

    const messageResult = await messageService.getMessagesByConsultation(result.consultation.id);
    if (messageResult.success && messageResult.messages) {
      setMessages(messageResult.messages);
      setShowQuickChat(messageResult.messages.length <= 1);
    }

    await loadPetAndPrescriptions();
  };

  const loadPetAndPrescriptions = async () => {
    if (petId && user?.id) {
      const petResult = await petService.getPet(petId);
      if (petResult.success && petResult.pet) {
        setPet(petResult.pet);
      }

      const orderResult = await orderService.getOrdersByCustomer(user.id);
      if (orderResult.success && orderResult.orders) {
        const productResult = await productService.getProducts();
        const productMap = new Map<string, string>();
        if (productResult.success && productResult.products) {
          productResult.products.forEach((p: { id: string; name: string }) => {
            productMap.set(p.id, p.name);
          });
        }

        const medNames: string[] = [];
        orderResult.orders.forEach((order: Order) => {
          order.items.forEach((item) => {
            if (item.type === 'prescription' && item.petId === petId) {
              const productName = productMap.get(item.productId);
              if (productName) medNames.push(productName);
            }
          });
        });
        setPrescribedMedNames(medNames);
      }
    }
  };

  const createAndAppendMessage = async (data: Parameters<typeof messageService.createMessage>[0]) => {
    const result = await messageService.createMessage(data);
    if (result.success && result.message) {
      appendMessage(result.message);
      return result.message;
    }
    return null;
  };

  const scheduleMessage = (callback: () => void, delay: number) => {
    const timeoutId = setTimeout(callback, delay);
    timeoutRefs.current.push(timeoutId);
  };

  const handleSelectCondition = async (conditionId: string) => {
    if (!consultationId) return;

    const condition = CONDITIONS.find(c => c.id === conditionId);
    if (!condition) return;

    await createAndAppendMessage({
      consultationId,
      senderId: user?.id || 'demo_user',
      senderRole: 'customer',
      text: buildQuickChatMessage(petName, condition.name),
      source: 'user',
    });
    setShowQuickChat(false);

    const treatments = TREATMENTS[conditionId] || [];
    const introText = CONDITION_INTROS[conditionId] || 'Dạ anh/chị, bên em có các sản phẩm sau phù hợp với tình trạng này:';

    scheduleMessage(() => {
      createAndAppendMessage({
        consultationId,
        senderId: doctorId,
        senderRole: 'doctor',
        text: introText,
        source: 'doctor',
      });
    }, 1000);

    treatments.forEach((treatment, index) => {
      scheduleMessage(() => {
        const prefix = checkTreatmentPrescribed(treatment, prescribedMedNames) ? ' (Đã từng kê đơn)' : '';
        createAndAppendMessage({
          consultationId,
          senderId: doctorId,
          senderRole: 'doctor',
          text: treatment.description,
          source: 'doctor',
          productLink: {
            id: treatment.id,
            name: `${treatment.name}${prefix}`,
            price: treatment.price,
            description: treatment.description,
            conditionId,
          },
        });
      }, 2200 + index * 1000);
    });
  };

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || !consultationId || replyLoading) return;

    const customerMessage = await createAndAppendMessage({
      consultationId,
      senderId: user?.id || 'demo_user',
      senderRole: 'customer',
      text,
      source: 'user',
    });

    setInputText('');
    setShowQuickChat(false);
    setReplyLoading(true);

    const reply = await generateConsultationReply({
      text,
      petName,
      doctorName,
      pet,
      recentMessages: customerMessage ? [...messages, customerMessage] : messages,
    });

    await createAndAppendMessage({
      consultationId,
      senderId: doctorId,
      senderRole: 'doctor',
      text: reply.text,
      source: reply.source,
    });
    setReplyLoading(false);
  };

  const handleProductTap = (productLink: Message['productLink']) => {
    if (!productLink) return;
    navigation.navigate('ProductDetail', {
      productId: productLink.id,
      productName: productLink.name,
      productPrice: productLink.price,
      productDescription: productLink.description,
      conditionId: productLink.conditionId,
      petId,
      petName,
      source: 'consultation',
      productType: 'prescription',
    });
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isNearBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 80;
    setShowScrollToBottom(!isNearBottom && contentSize.height > layoutMeasurement.height + 50);
  };

  const getSourceLabel = (item: Message) => {
    if (item.source === 'ai') return 'Phản hồi AI từ bác sĩ';
    if (item.source === 'fallback') return 'Phản hồi tự động';
    if (item.source === 'safety') return 'Cảnh báo an toàn';
    return '';
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

    const isCustomer = item.senderRole === 'customer';
    const lastInGroup = isLastInGroup(listItems, index);
    const sourceLabel = getSourceLabel(item);

    return (
      <View style={[
        styles.messageContainer,
        isCustomer ? styles.customerMessage : styles.doctorMessage,
        !lastInGroup && styles.messageCompact,
      ]}>
        <View style={[
          styles.messageBubble,
          isCustomer ? styles.customerBubble : styles.doctorBubble,
          lastInGroup && (isCustomer ? styles.customerBubbleTail : styles.doctorBubbleTail),
          item.source === 'safety' && styles.safetyBubble,
        ]}>
          {sourceLabel ? (
            <Text style={[styles.sourceLabel, item.source === 'safety' && styles.safetySourceLabel]}>
              {sourceLabel}
            </Text>
          ) : null}
          <Text style={[styles.messageText, isCustomer ? styles.customerText : styles.doctorText]}>
            {item.text}
          </Text>
          {item.productLink && (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => handleProductTap(item.productLink)}
              activeOpacity={0.7}
            >
              <View style={styles.productIconWrap}>
                <Icon name="medkit" size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.recommendationLabel}>Gợi ý điều trị</Text>
                <Text style={styles.productName}>{item.productLink.name}</Text>
                <Text style={styles.productPrice}>
                  {item.productLink.price.toLocaleString('vi-VN')}đ
                </Text>
              </View>
              <View style={styles.buyChip}>
                <Text style={styles.buyChipText}>Mua</Text>
              </View>
            </TouchableOpacity>
          )}
          <Text style={[styles.timestamp, isCustomer ? styles.customerTimestamp : styles.doctorTimestamp]}>
            {item.createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title={doctorName}
        subtitle={petName}
        onBack={() => navigation.goBack()}
        variant="primary"
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={listItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={[
              styles.messagesContent,
              listItems.length === 0 && styles.messagesContentEmpty,
            ]}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onScroll={handleScroll}
            scrollEventThrottle={100}
            ListEmptyComponent={
              consultationId ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyStateIcon}>
                    <Icon name="chatbubbles" size={40} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.emptyStateTitle}>Bắt đầu cuộc trò chuyện</Text>
                  <Text style={styles.emptyStateText}>
                    Chọn một tình trạng bên dưới để nhận tư vấn nhanh từ bác sĩ.
                  </Text>
                </View>
              ) : null
            }
          />

          {showScrollToBottom && (
            <TouchableOpacity
              style={styles.scrollFab}
              onPress={() => flatListRef.current?.scrollToEnd({ animated: true })}
            >
              <Icon name="arrow-down" size={18} color={theme.colors.textOnPrimary} />
            </TouchableOpacity>
          )}
        </View>

        {replyLoading && <TypingIndicator />}

        <QuickChatPanel
          visible={showQuickChat}
          pet={pet}
          onSelectCondition={handleSelectCondition}
          onDismiss={() => setShowQuickChat(false)}
        />

        {!showQuickChat && messages.some(message => message.productLink) && (
          <View style={styles.consultationSummary}>
            <Icon name="information-circle" size={16} color={theme.colors.primary} />
            <Text style={styles.consultationSummaryText}>
              Sản phẩm được mua từ tư vấn sẽ được lưu theo hồ sơ {petName}.
            </Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Icon name="attach" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || replyLoading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || replyLoading}
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
  messagesContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  // ─── Message containers ──────────────────────────────────────────────────
  messageContainer: {
    marginBottom: theme.spacing.md,
    maxWidth: '80%',
  },
  messageCompact: {
    marginBottom: 3,
  },
  customerMessage: {
    alignSelf: 'flex-end',
  },
  doctorMessage: {
    alignSelf: 'flex-start',
  },

  // ─── Bubbles ─────────────────────────────────────────────────────────────
  messageBubble: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
  },
  customerBubble: {
    backgroundColor: theme.colors.primary,
  },
  customerBubbleTail: {
    borderBottomRightRadius: 4,
  },
  doctorBubble: {
    backgroundColor: theme.colors.surfaceAlt,
  },
  doctorBubbleTail: {
    borderBottomLeftRadius: 4,
  },
  safetyBubble: {
    backgroundColor: theme.colors.dangerBg,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  sourceLabel: {
    ...theme.typography.overline,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  safetySourceLabel: {
    color: theme.colors.danger,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  customerText: {
    color: theme.colors.textOnPrimary,
  },
  doctorText: {
    color: theme.colors.textPrimary,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  customerTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  doctorTimestamp: {
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

  // ─── Product card ─────────────────────────────────────────────────────────
  productCard: {
    backgroundColor: theme.colors.warningBg,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  productIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  recommendationLabel: {
    ...theme.typography.overline,
    color: theme.colors.primary,
    marginBottom: 2,
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
  buyChip: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
  },
  buyChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textOnPrimary,
  },

  // ─── Scroll-to-bottom FAB ─────────────────────────────────────────────────
  scrollFab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.md,
  },

  // ─── Empty state ──────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.huge,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyStateTitle: {
    ...theme.typography.h4,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyStateText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ─── Consultation summary bar ─────────────────────────────────────────────
  consultationSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primaryBg,
  },
  consultationSummaryText: {
    flex: 1,
    ...theme.typography.small,
    color: theme.colors.primaryDarker,
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
  attachButton: {
    padding: theme.spacing.sm,
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
