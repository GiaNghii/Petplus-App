import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';
import Header from '../../components/Header';
import Icon from '../../components/Icon';
import QuickChatPanel from '../../components/QuickChatPanel';
import { petService, orderService, productService } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { Pet, Order } from '../../types';
import { QuickTreatment, TREATMENTS, buildQuickChatMessage, checkTreatmentPrescribed, CONDITIONS } from '../../data/quickChatData';

interface Message {
  id: string;
  text: string;
  sender: 'customer' | 'doctor';
  timestamp: Date;
  productLink?: { id: string; name: string; price: number; description: string; conditionId: string };
}

const AUTO_REPLIES = [
  'Dạ em hiểu rồi ạ. Anh/chị có thể mô tả thêm triệu chứng không?',
  'Em sẽ kiểm tra lại hồ sơ của pet. Anh/chị vui lòng chờ nhé.',
  'Theo em thấy thì tình trạng này khá phổ biến. Em sẽ kê đơn thuốc phù hợp.',
  'Anh/chị nhớ cho pet uống thuốc đúng giờ nhé. Nếu có gì bất thường thì nhắn em ngay.',
  'Em đã ghi nhận thông tin. Anh/chị yên tâm, tình trạng này sẽ cải thiện sau vài ngày.',
  'Anh/chị có thể gửi thêm hình ảnh vùng bị ảnh hưởng để em chẩn đoán chính xác hơn không?',
  'Dạ vâng, em hiểu. Em sẽ tư vấn anh/chị phương án điều trị tốt nhất.',
  'Anh/chị nhớ theo dõi tình trạng của pet trong 2-3 ngày tới nhé.',
  'Nếu pet có biểu hiện bất thường, anh/chị đưa đến phòng khám ngay nhé.',
];

const CONDITION_INTROS: Record<string, string> = {
  condition_ear_mites: 'Dạ anh/chị, với tình trạng rận tai bên em có các sản phẩm sau. Anh/chị xem và chọn sản phẩm phù hợp nhé:',
  condition_watery_eyes: 'Dạ anh/chị, với tình trạng chảy nước mắt bên em có các sản phẩm sau. Anh/chị tham khảo nhé:',
  condition_hair_loss: 'Dạ anh/chị, với tình trạng rụng lông bên em đề xuất các sản phẩm hỗ trợ sau. Anh/chị xem qua nhé:',
  condition_matted_fur: 'Dạ anh/chị, với tình trạng bết lông bên em có các sản phẩm chăm sóc sau. Anh/chị tham khảo nhé:',
};

let replyIndex = 0;

export default function ChatScreen({ route, navigation }: any) {
  const { doctorId, doctorName, petName, petId } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Dạ chào anh/chị, em là bác sĩ ${doctorName}. Anh/chị cần tư vấn về ${petName} ạ?`,
      sender: 'doctor',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const [pet, setPet] = useState<Pet | null>(null);
  const [prescribedMedNames, setPrescribedMedNames] = useState<string[]>([]);
  const [showQuickChat, setShowQuickChat] = useState(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    loadPetAndPrescriptions();
  }, []);

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
              if (productName) {
                medNames.push(productName);
              }
            }
          });
        });
        setPrescribedMedNames(medNames);
      }
    }
  };

  const handleSelectCondition = (conditionId: string) => {
    const condition = CONDITIONS.find(c => c.id === conditionId);
    if (!condition) return;

    const customerMsg: Message = {
      id: Date.now().toString(),
      text: buildQuickChatMessage(petName, condition.name),
      sender: 'customer',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, customerMsg]);
    setShowQuickChat(false);

    const treatments = TREATMENTS[conditionId] || [];
    const introText = CONDITION_INTROS[conditionId] || 'Dạ anh/chị, bên em có các sản phẩm sau phù hợp với tình trạng này:';

    setTimeout(() => {
      const introMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: introText,
        sender: 'doctor',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, introMsg]);
    }, 1500);

    treatments.forEach((treatment, index) => {
      setTimeout(() => {
        const prefix = checkTreatmentPrescribed(treatment, prescribedMedNames)
          ? ' (Đã từng kê đơn)'
          : '';
        const productMsg: Message = {
          id: `prod_${Date.now()}_${index}`,
          text: `${treatment.description}`,
          sender: 'doctor',
          timestamp: new Date(),
          productLink: {
            id: treatment.id,
            name: `${treatment.name}${prefix}`,
            price: treatment.price,
            description: treatment.description,
            conditionId,
          },
        };
        setMessages(prev => [...prev, productMsg]);
      }, 3000 + index * 1200);
    });
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'customer',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);

    if (showQuickChat) {
      setShowQuickChat(false);
    }
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

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'customer' ? styles.customerMessage : styles.doctorMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.sender === 'customer' ? styles.customerBubble : styles.doctorBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.sender === 'customer' ? styles.customerText : styles.doctorText
        ]}>
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
        <Text style={[
          styles.timestamp,
          item.sender === 'customer' ? styles.customerTimestamp : styles.doctorTimestamp
        ]}>
          {item.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Modal visible={showToast} transparent animationType="fade">
        <View style={styles.toastOverlay}>
          <View style={styles.toastCard}>
            <Text style={styles.toastText}>Vui lòng chờ bác sĩ phản hồi</Text>
          </View>
        </View>
      </Modal>
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
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

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
    padding: theme.spacing.lg,
  },
  messageContainer: {
    marginBottom: theme.spacing.md,
    maxWidth: '80%',
  },
  customerMessage: {
    alignSelf: 'flex-end',
  },
  doctorMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
  },
  customerBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  doctorBubble: {
    backgroundColor: theme.colors.surfaceAlt,
    borderBottomLeftRadius: 4,
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
    color: '#FFFFFF',
  },
  doctorTimestamp: {
    color: theme.colors.textSecondary,
  },
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
  toastOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  toastCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.lg,
    ...theme.shadow.lg,
  },
  toastText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
});
