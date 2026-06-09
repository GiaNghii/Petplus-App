import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

export type IconName =
  | 'home'
  | 'home-outline'
  | 'paw'
  | 'paw-outline'
  | 'calendar'
  | 'calendar-outline'
  | 'chat'
  | 'chat-outline'
  | 'chatbubbles'
  | 'person'
  | 'person-outline'
  | 'search'
  | 'notifications'
  | 'notifications-outline'
  | 'cart'
  | 'cart-outline'
  | 'add'
  | 'remove'
  | 'send'
  | 'attach'
  | 'chevron-back'
  | 'chevron-forward'
  | 'heart'
  | 'heart-outline'
  | 'star'
  | 'star-outline'
  | 'medical'
  | 'medkit'
  | 'medkit-outline'
  | 'time'
  | 'time-outline'
  | 'location'
  | 'location-outline'
  | 'call'
  | 'mail'
  | 'lock-closed'
  | 'lock-open'
  | 'checkmark'
  | 'close'
  | 'trash'
  | 'create'
  | 'arrow-forward'
  | 'arrow-down'
  | 'flash'
  | 'pricetag'
  | 'information-circle'
  | 'warning'
  | 'alert-circle';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: any;
}

const ioniconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: 'home',
  'home-outline': 'home-outline',
  paw: 'paw',
  'paw-outline': 'paw-outline',
  calendar: 'calendar',
  'calendar-outline': 'calendar-outline',
  chat: 'chatbubble',
  'chat-outline': 'chatbubble-outline',
  chatbubbles: 'chatbubbles',
  person: 'person',
  'person-outline': 'person-outline',
  search: 'search',
  notifications: 'notifications',
  'notifications-outline': 'notifications-outline',
  cart: 'cart',
  'cart-outline': 'cart-outline',
  add: 'add',
  remove: 'remove',
  send: 'send',
  attach: 'attach',
  'chevron-back': 'chevron-back',
  'chevron-forward': 'chevron-forward',
  heart: 'heart',
  'heart-outline': 'heart-outline',
  star: 'star',
  'star-outline': 'star-outline',
  medical: 'medical',
  medkit: 'medkit',
  'medkit-outline': 'medkit-outline',
  time: 'time',
  'time-outline': 'time-outline',
  location: 'location',
  'location-outline': 'location-outline',
  call: 'call',
  mail: 'mail',
  'lock-closed': 'lock-closed',
  'lock-open': 'lock-open',
  checkmark: 'checkmark',
  close: 'close',
  trash: 'trash',
  create: 'create',
  'arrow-forward': 'arrow-forward',
  'arrow-down': 'arrow-down',
  flash: 'flash',
  pricetag: 'pricetag',
  'information-circle': 'information-circle',
  warning: 'warning',
  'alert-circle': 'alert-circle',
};

export default function Icon({ name, size = 24, color = theme.colors.textPrimary, style }: IconProps) {
  const iconName = ioniconMap[name];

  if (!iconName) {
    return (
      <View style={[{ width: size, height: size }, style]} />
    );
  }

  return (
    <Ionicons
      name={iconName}
      size={size}
      color={color}
      style={style}
    />
  );
}

export function IconMC({ name, size = 24, color = theme.colors.textPrimary, style }: { name: keyof typeof MaterialCommunityIcons.glyphMap; size?: number; color?: string; style?: any }) {
  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={color}
      style={style}
    />
  );
}
