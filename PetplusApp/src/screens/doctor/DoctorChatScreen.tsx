import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';
import Header from '../../components/Header';
import Icon from '../../components/Icon';

const PRODUCTS = [
  { id: 'p1', name: 'Thuốc kháng sinh Amoxicillin 250mg', price: 200000 },
  { id: 'p2', name: 'Thuốc bôi viêm da PetCare', price: 150000 },
  { id: 'p3', name: 'Vitamin tổng hợp cho chó', price: 120000 },
  { id: 'p4', name: 'Thuốc xổ giun', price: 45000 },
];

interface Message {
  id: string;
  text: string;
  sender: 'customer' | 'doctor';
  productLink?: { id: string; name: string; price: number };
  timestamp: Date;
}

export default function DoctorChatScreen({ route, navigation }: any) {
  const { customerId, petName, customerName } = route.params;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Dạ chào bác sĩ, em muốn hỏi về tình trạng của Buddy ạ.',
      sender: 'customer',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [showProductList, setShowProductList] = useState(false);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'doctor',
      timestamp: new Date(),
    };
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  const sendPrescription = (product: typeof PRODUCTS[0]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: `Tôi kê đơn thuốc này cho ${petName}:`,
      sender: 'doctor',
      productLink: product,
      timestamp: new Date(),
    };
    setMessages([...messages, newMessage]);
    setShowProductList(false);
    Alert.alert(
      'Đã gửi đơn thuốc',
      `Đã gửi ${product.name} cho khách hàng. Họ có thể mua ngay trên app.`,
      [{ text: 'OK' }]
    );
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'doctor' ? styles.doctorMessage : styles.customerMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.sender === 'doctor' ? styles.doctorBubble : styles.customerBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.sender === 'doctor' ? styles.doctorText : styles.customerText
        ]}>
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
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title={customerName}
        subtitle={`${petName} - Đang tư vấn`}
        onBack={() => navigation.goBack()}
        rightIcon="create"
        onRightPress={() => {}}
        variant="primary"
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
      />

      {showProductList && (
        <View style={styles.productPanel}>
          <View style={styles.productPanelHeader}>
            <Text style={styles.productPanelTitle}>Chọn thuốc kê đơn</Text>
            <TouchableOpacity onPress={() => setShowProductList(false)}>
              <Icon name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          {PRODUCTS.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productItem}
              onPress={() => sendPrescription(product)}
            >
              <Icon name="medkit" size={24} color={theme.colors.primary} />
              <View style={styles.productItemInfo}>
                <Text style={styles.productItemName}>{product.name}</Text>
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
    padding: theme.spacing.lg,
  },
  messageContainer: {
    marginBottom: theme.spacing.md,
    maxWidth: '85%',
  },
  doctorMessage: {
    alignSelf: 'flex-end',
  },
  customerMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
  },
  doctorBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  customerBubble: {
    backgroundColor: theme.colors.surfaceAlt,
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
  productPanel: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    maxHeight: 280,
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
    borderRadius: 20,
    backgroundColor: theme.colors.warningBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 20,
    padding: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    fontSize: 16,
    maxHeight: 100,
    marginHorizontal: theme.spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
});