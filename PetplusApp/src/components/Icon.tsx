import React from 'react';
import Svg, {
  Circle,
  G,
  Line,
  Path,
  Polyline,
  Rect,
} from 'react-native-svg';
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
  | 'arrow-back'
  | 'arrow-down'
  | 'flash'
  | 'pricetag'
  | 'information-circle'
  | 'warning'
  | 'alert-circle'
  | 'water'
  | 'image'
  | 'camera';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: any;
}

const strokeProps = {
  fill: 'none',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function StrokeIcon({ size, color, style, children }: IconProps & { children: React.ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      <G {...strokeProps} stroke={color}>
        {children}
      </G>
    </Svg>
  );
}

function FilledIcon({ size, color, style, children }: IconProps & { children: React.ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      <G fill={color}>
        {children}
      </G>
    </Svg>
  );
}

export default function Icon({
  name,
  size = 24,
  color = theme.colors.textPrimary,
  style,
}: IconProps) {
  switch (name) {
    case 'home':
      return (
        <FilledIcon name={name} size={size} color={color} style={style}>
          <Path d="M3 10.8 12 3l9 7.8v9.7a.5.5 0 0 1-.5.5H15v-6h-6v6H3.5a.5.5 0 0 1-.5-.5z" />
        </FilledIcon>
      );
    case 'home-outline':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Path d="M3 10.8 12 3l9 7.8" />
          <Path d="M5 10v11h5v-6h4v6h5V10" />
        </StrokeIcon>
      );
    case 'paw':
    case 'paw-outline':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Circle cx="6.8" cy="8" r="2" />
          <Circle cx="12" cy="6.5" r="2" />
          <Circle cx="17.2" cy="8" r="2" />
          <Circle cx="8.5" cy="13" r="1.8" />
          <Path d="M7.5 18.5c0-3.2 2-5.5 4.5-5.5s4.5 2.3 4.5 5.5c0 1.5-1.1 2.5-2.4 1.8-1.4-.8-2.8-.8-4.2 0-1.3.7-2.4-.3-2.4-1.8z" />
        </StrokeIcon>
      );
    case 'calendar':
    case 'calendar-outline':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Rect x="3" y="5" width="18" height="16" rx="3" />
          <Line x1="8" y1="3" x2="8" y2="7" />
          <Line x1="16" y1="3" x2="16" y2="7" />
          <Line x1="3" y1="10" x2="21" y2="10" />
          <Line x1="8" y1="14" x2="8.01" y2="14" />
          <Line x1="12" y1="14" x2="12.01" y2="14" />
          <Line x1="16" y1="14" x2="16.01" y2="14" />
        </StrokeIcon>
      );
    case 'chat':
    case 'chat-outline':
    case 'chatbubbles':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Path d="M5 6.5h14a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-7l-5 3v-3H5a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3z" />
          {name === 'chatbubbles' ? <Path d="M6 6V5a3 3 0 0 1 3-3h8" /> : null}
        </StrokeIcon>
      );
    case 'person':
    case 'person-outline':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Circle cx="12" cy="8" r="4" />
          <Path d="M4 21c1.4-4 4.1-6 8-6s6.6 2 8 6" />
        </StrokeIcon>
      );
    case 'search':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Circle cx="11" cy="11" r="7" />
          <Line x1="16.5" y1="16.5" x2="21" y2="21" />
        </StrokeIcon>
      );
    case 'notifications':
    case 'notifications-outline':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Path d="M18 10a6 6 0 0 0-12 0c0 5-2 6-2 6h16s-2-1-2-6z" />
          <Path d="M9.5 19a2.5 2.5 0 0 0 5 0" />
        </StrokeIcon>
      );
    case 'cart':
    case 'cart-outline':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Circle cx="9" cy="20" r="1.5" />
          <Circle cx="18" cy="20" r="1.5" />
          <Path d="M2 3h3l2.5 12h10.8a2 2 0 0 0 1.9-1.4L22 7H7" />
        </StrokeIcon>
      );
    case 'add':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Line x1="12" y1="5" x2="12" y2="19" />
          <Line x1="5" y1="12" x2="19" y2="12" />
        </StrokeIcon>
      );
    case 'remove':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Line x1="5" y1="12" x2="19" y2="12" />
        </StrokeIcon>
      );
    case 'send':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Path d="M22 2 11 13" />
          <Path d="M22 2 15 22l-4-9-9-4z" />
        </StrokeIcon>
      );
    case 'attach':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Path d="M21 12.5 12 21a6 6 0 0 1-8.5-8.5l10-10a4 4 0 0 1 5.7 5.7l-10 10a2 2 0 0 1-2.8-2.8l9-9" />
        </StrokeIcon>
      );
    case 'chevron-back':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Polyline points="15 18 9 12 15 6" />
        </StrokeIcon>
      );
    case 'chevron-forward':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Polyline points="9 18 15 12 9 6" />
        </StrokeIcon>
      );
    case 'arrow-forward':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Line x1="4" y1="12" x2="20" y2="12" />
          <Polyline points="14 6 20 12 14 18" />
        </StrokeIcon>
      );
    case 'arrow-back':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Line x1="20" y1="12" x2="4" y2="12" />
          <Polyline points="10 6 4 12 10 18" />
        </StrokeIcon>
      );
    case 'arrow-down':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Line x1="12" y1="4" x2="12" y2="20" />
          <Polyline points="6 14 12 20 18 14" />
        </StrokeIcon>
      );
    case 'heart':
    case 'heart-outline':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Path d="M20.8 5.7a5.2 5.2 0 0 0-7.4 0L12 7.1l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 22l8.8-8.9a5.2 5.2 0 0 0 0-7.4z" />
        </StrokeIcon>
      );
    case 'star':
    case 'star-outline':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
        </StrokeIcon>
      );
    case 'medical':
    case 'medkit':
    case 'medkit-outline':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Rect x="4" y="7" width="16" height="13" rx="2" />
          <Path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
          <Line x1="12" y1="10" x2="12" y2="17" />
          <Line x1="8.5" y1="13.5" x2="15.5" y2="13.5" />
        </StrokeIcon>
      );
    case 'time':
    case 'time-outline':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Circle cx="12" cy="12" r="9" />
          <Path d="M12 7v5l3 2" />
        </StrokeIcon>
      );
    case 'location':
    case 'location-outline':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z" />
          <Circle cx="12" cy="10" r="3" />
        </StrokeIcon>
      );
    case 'call':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
        </StrokeIcon>
      );
    case 'mail':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Rect x="3" y="5" width="18" height="14" rx="2" />
          <Path d="m3 7 9 7 9-7" />
        </StrokeIcon>
      );
    case 'lock-closed':
    case 'lock-open':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Rect x="5" y="10" width="14" height="11" rx="2" />
          <Path d={name === 'lock-open' ? 'M8 10V7a4 4 0 0 1 7.5-2' : 'M8 10V7a4 4 0 0 1 8 0v3'} />
        </StrokeIcon>
      );
    case 'checkmark':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Polyline points="20 6 9 17 4 12" />
        </StrokeIcon>
      );
    case 'close':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Line x1="18" y1="6" x2="6" y2="18" />
          <Line x1="6" y1="6" x2="18" y2="18" />
        </StrokeIcon>
      );
    case 'trash':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Path d="M3 6h18" />
          <Path d="M8 6V4h8v2" />
          <Path d="M6 6l1 15h10l1-15" />
          <Line x1="10" y1="11" x2="10" y2="17" />
          <Line x1="14" y1="11" x2="14" y2="17" />
        </StrokeIcon>
      );
    case 'create':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16z" />
          <Path d="M13 6l5 5" />
        </StrokeIcon>
      );
    case 'flash':
      return (
        <FilledIcon name={name} size={size} color={color} style={style}>
          <Path d="M13 2 4 14h7l-1 8 10-13h-7z" />
        </FilledIcon>
      );
    case 'pricetag':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Path d="M20 13 13 20 4 11V4h7z" />
          <Circle cx="8" cy="8" r="1" />
        </StrokeIcon>
      );
    case 'information-circle':
    case 'alert-circle':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Circle cx="12" cy="12" r="9" />
          {name === 'information-circle' ? (
            <>
              <Line x1="12" y1="11" x2="12" y2="16" />
              <Line x1="12" y1="8" x2="12.01" y2="8" />
            </>
          ) : (
            <>
              <Line x1="12" y1="7" x2="12" y2="13" />
              <Line x1="12" y1="17" x2="12.01" y2="17" />
            </>
          )}
        </StrokeIcon>
      );
    case 'warning':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Path d="M12 3 22 20H2z" />
          <Line x1="12" y1="9" x2="12" y2="14" />
          <Line x1="12" y1="17" x2="12.01" y2="17" />
        </StrokeIcon>
      );
    case 'water':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Path d="M12 3s6 6.2 6 11a6 6 0 0 1-12 0c0-4.8 6-11 6-11z" />
        </StrokeIcon>
      );
    case 'image':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Rect x="3" y="5" width="18" height="14" rx="2" />
          <Circle cx="8" cy="10" r="1.5" />
          <Path d="m21 16-5-5L5 19" />
        </StrokeIcon>
      );
    case 'camera':
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Path d="M4 8h4l2-3h4l2 3h4v12H4z" />
          <Circle cx="12" cy="14" r="4" />
        </StrokeIcon>
      );
    default:
      return (
        <StrokeIcon name={name} size={size} color={color} style={style}>
          <Circle cx="12" cy="12" r="9" />
        </StrokeIcon>
      );
  }
}

