import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';
import Header from '../../components/Header';
import Icon from '../../components/Icon';
import { useCart } from '../../context/CartContext';

interface Message {
  id: string;
  text: string;
  sender: 'customer' | 'doctor';
  timestamp: Date;
  productLink?: { name: string; price: number };
}

const AUTO_REPLIES = [
  'Dạ em hiểu rồi ạ. Chị có thể mô tả thêm triệu chứng không?',
  'Em sẽ kiểm tra lại hồ sơ của pet. Chị vui lòng chờ nhé.',
  'Theo em thấy thì tình trạng này khá phổ biến. Em sẽ kê đơn thuốc phù hợp.',
  'Chị nhớ cho pet uống thuốc đúng giờ nhé. Nếu có gì bất thường thì nhắn em ngay.',
  'Em đã ghi nhận thông tin. Chị yên tâm, tình trạng này sẽ cải thiện sau vài ngày.',
  'Chị có thể gửi thêm hình ảnh vùng bị ảnh hưởng để em chẩn đoán chính xác hơn không?',
  'Dạ vâng, em hiểu. Em sẽ tư vấn chị phương án điều trị tốt nhất.',
  'Chị nhớ theo dõi tình trạng của pet trong 2-3 ngày tới nhé.',
  'Em đã gửi đơn thuốc. Chị có thể mua trực tiếp trên app ạ.',
  'Nếu pet có biểu hiện bất thường, chị đưa đến phòng khám ngay nhé.',
];

let replyIndex = 0;

export default function ChatScreen({ route, navigation }: any) {
  const { doctorId, doctorName, petName } = route.params;
  const { addItem } = useCart();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Dạ chào chị, em là bác sĩ ${doctorName}. Chị cần tư vấn về ${petName} ạ?`,
      sender: 'doctor',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

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

    // Auto reply with varied messages
    setTimeout(() => {
      const reply = AUTO_REPLIES[replyIndex % AUTO_REPLIES.length];
      replyIndex++;
      
      const doctorReply: Message = {
        id: (Date.now() + 1).toString(),
        text: reply,
        sender: 'doctor',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, doctorReply]);
    }, 1500);
  };

  const handleBuyProduct = (product: { name: string; price: number }) => {
    Alert.alert(
      'Thuốc kê đơn',
      'Đảm bảo thuốc này được sử dụng cho đúng thú cưng được kê đơn, không sử dụng cho các thú cưng khác để tránh các trường hợp xấu có thể xảy ra.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: () => {
            addItem({
              id: `prescription_${Date.now()}`,
              name: product.name,
              price: product.price,
              type: 'prescription',
              category: 'thuoc',
              description: '',
              stock: 10,
            });
            Alert.alert('Đã thêm vào giỏ', `${product.name} đã được thêm vào giỏ hàng`);
          },
        },
      ]
    );
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
            onPress={() => handleBuyProduct(item.productLink!)}
          >
            <Icon name="medkit" size={32} color={theme.colors.primary} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.productLink.name}</Text>
              <Text style={styles.productPrice}>
                {item.productLink.price.toLocaleString('vi-VN')}đ
              </Text>
              <Text style={styles.buyText}>Nhấn để mua</Text>
            </View>
          </TouchableOpacity>
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
  buyText: {
    fontSize: 12,
    color: theme.colors.primary,
    marginTop: 4,
    fontWeight: '600',
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
});