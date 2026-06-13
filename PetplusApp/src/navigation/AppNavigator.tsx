import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../utils/theme';
import Icon from '../components/Icon';
import { useResponsive } from '../utils/responsive';

// Customer screens
import LoginScreen from '../screens/customer/LoginScreen';
import RegisterScreen from '../screens/customer/RegisterScreen';
import HomeScreen from '../screens/customer/HomeScreen';
import PetListScreen from '../screens/customer/PetListScreen';
import AddPetScreen from '../screens/customer/AddPetScreen';
import PetDetailScreen from '../screens/customer/PetDetailScreen';
import SelectBranchScreen from '../screens/customer/SelectBranchScreen';
import SelectDoctorScreen from '../screens/customer/SelectDoctorScreen';
import SelectTimeSlotScreen from '../screens/customer/SelectTimeSlotScreen';
import BookingConfirmationScreen from '../screens/customer/BookingConfirmationScreen';
import ChatScreen from '../screens/customer/ChatScreen';
import ShopScreen from '../screens/customer/ShopScreen';
import CartScreen from '../screens/customer/CartScreen';
import OrderHistoryScreen from '../screens/customer/OrderHistoryScreen';
import RemindersScreen from '../screens/customer/RemindersScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import ScheduleScreen from '../screens/customer/ScheduleScreen';
import DoctorSelectScreen from '../screens/customer/DoctorSelectScreen';
import ProductDetailScreen from '../screens/customer/ProductDetailScreen';
import OrderConfirmationScreen from '../screens/customer/OrderConfirmationScreen';
import AllDoctorsScreen from '../screens/customer/AllDoctorsScreen';
import TestConnectionScreen from '../screens/TestConnectionScreen';

// Doctor screens
import DoctorHomeScreen from '../screens/doctor/DoctorHomeScreen';
import DoctorChatListScreen from '../screens/doctor/DoctorChatListScreen';
import DoctorChatScreen from '../screens/doctor/DoctorChatScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Modern tab icon helper
const TabIcon = ({ name, focused }: { name: any; focused: boolean }) => (
  <Icon
    name={name}
    size={24}
    color={focused ? theme.colors.primary : theme.colors.textTertiary}
  />
);

// Tab route definitions for sidebar rendering
const TAB_ROUTES = [
  {
    name: 'HomeTab',
    title: 'Home',
    icon: 'home',
    iconOutline: 'home-outline',
  },
  {
    name: 'PetsTab',
    title: 'Pet',
    icon: 'paw',
    iconOutline: 'paw-outline',
  },
  {
    name: 'ScheduleTab',
    title: 'Lịch',
    icon: 'calendar',
    iconOutline: 'calendar-outline',
  },
  {
    name: 'MessageTab',
    title: 'Tư vấn',
    icon: 'chatbubbles',
    iconOutline: 'chat-outline',
  },
  {
    name: 'ShopTab',
    title: 'Shop',
    icon: 'cart',
    iconOutline: 'cart-outline',
  },
  {
    name: 'ProfileTab',
    title: 'Demo',
    icon: 'person',
    iconOutline: 'person-outline',
  },
];

// Desktop sidebar tab bar
function DesktopSidebar({ state, navigation }: { state: any; navigation: any }) {
  return (
    <View style={styles.sidebar}>
      {state.routes.map((route: any, index: number) => {
        const focused = state.index === index;
        const routeDef = TAB_ROUTES.find((r) => r.name === route.name);
        if (!routeDef) return null;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={[styles.sidebarItem, focused && styles.sidebarItemActive]}
            activeOpacity={0.7}
          >
            <Icon
              name={focused ? routeDef.icon : routeDef.iconOutline}
              size={22}
              color={focused ? theme.colors.primary : theme.colors.textTertiary}
            />
            <Text style={[styles.sidebarLabel, focused && styles.sidebarLabelActive]}>
              {routeDef.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Custom tab bar that switches between sidebar (desktop) and nothing (mobile uses default)
function CustomTabBar(props: any) {
  const { isDesktop } = useResponsive();
  if (!isDesktop) return null;
  return <DesktopSidebar {...props} />;
}

// Customer Tab Navigator for the single-account demo.
function CustomerTabNavigator() {
  const { isDesktop } = useResponsive();

  return (
    <View style={isDesktop ? styles.desktopLayout : styles.mobileLayout}>
      <Tab.Navigator
        tabBar={isDesktop ? (props) => <CustomTabBar {...props} /> : undefined}
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textTertiary,
          headerShown: false,
          tabBarStyle: isDesktop
            ? { display: 'none' }
            : {
                backgroundColor: theme.colors.surface,
                borderTopColor: theme.colors.borderLight,
                borderTopWidth: 1,
                height: 70,
                paddingBottom: 8,
                paddingTop: 6,
                ...theme.shadow.xs,
              },
          tabBarLabelStyle: {
            fontSize: 9,
            fontWeight: '500',
            marginTop: 2,
          },
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeScreen}
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />,
          }}
        />
        <Tab.Screen
          name="PetsTab"
          component={PetListScreen}
          options={{
            title: 'Pet',
            tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'paw' : 'paw-outline'} focused={focused} />,
          }}
        />
        <Tab.Screen
          name="ScheduleTab"
          component={ScheduleScreen}
          options={{
            title: 'Lịch',
            tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'calendar' : 'calendar-outline'} focused={focused} />,
          }}
        />
        <Tab.Screen
          name="MessageTab"
          component={DoctorSelectScreen}
          options={{
            title: 'Tư vấn',
            tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'chatbubbles' : 'chat-outline'} focused={focused} />,
          }}
        />
        <Tab.Screen
          name="ShopTab"
          component={ShopScreen}
          options={{
            title: 'Shop',
            tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'cart' : 'cart-outline'} focused={focused} />,
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileScreen}
          options={{
            title: 'Demo',
            tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

// Customer Stack Navigator
function CustomerStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={CustomerTabNavigator} />
      <Stack.Screen name="AddPet" component={AddPetScreen} />
      <Stack.Screen name="PetDetail" component={PetDetailScreen} />
      <Stack.Screen name="SelectBranch" component={SelectBranchScreen} />
      <Stack.Screen name="SelectDoctor" component={SelectDoctorScreen} />
      <Stack.Screen name="SelectTimeSlot" component={SelectTimeSlotScreen} />
      <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Shop" component={ShopScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Orders" component={OrderHistoryScreen} />
      <Stack.Screen name="Reminders" component={RemindersScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
      <Stack.Screen name="AllDoctors" component={AllDoctorsScreen} />
    </Stack.Navigator>
  );
}

// Doctor Stack Navigator
function DoctorStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DoctorHome" component={DoctorHomeScreen} />
      <Stack.Screen name="DoctorChatList" component={DoctorChatListScreen} />
      <Stack.Screen name="DoctorChat" component={DoctorChatScreen} />
    </Stack.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
      <Text style={{ fontSize: 18, color: theme.colors.primary, fontWeight: '600' }}>Đang tải...</Text>
    </View>
  );
}

export default function AppNavigator() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="TestConnection" component={TestConnectionScreen} />
          </>
        ) : (
          <>
            {user?.role === 'doctor' ? (
              <Stack.Screen name="DoctorApp" component={DoctorStackNavigator} />
            ) : (
              <Stack.Screen name="CustomerApp" component={CustomerStackNavigator} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  // Layout wrappers
  desktopLayout: {
    flex: 1,
  },
  mobileLayout: {
    flex: 1,
  },

  // Sidebar
  sidebar: {
    width: 220,
    backgroundColor: theme.colors.surface,
    borderRightWidth: 1,
    borderRightColor: theme.colors.borderLight,
    paddingTop: 24,
    paddingHorizontal: 12,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
    gap: 12,
  },
  sidebarItemActive: {
    backgroundColor: theme.colors.primary + '18',
  },
  sidebarLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textTertiary,
  },
  sidebarLabelActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
