import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { palette } from "@/components/finance-ui";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);
  return <Tabs screenOptions={{ headerShown: false, tabBarButton: HapticTab, tabBarActiveTintColor: palette.ink, tabBarInactiveTintColor: "#96A29B", tabBarLabelStyle: { fontSize: 10, fontWeight: "700", marginTop: -1 }, tabBarStyle: { height: 61 + bottomPadding, paddingTop: 7, paddingBottom: bottomPadding, backgroundColor: palette.surface, borderTopColor: palette.border, borderTopWidth: 1 } }}>
    <Tabs.Screen name="index" options={{ title: "الملخص", tabBarIcon: ({ color, size }) => <MaterialIcons name="space-dashboard" size={size} color={color} /> }} />
    <Tabs.Screen name="transactions" options={{ title: "العمليات", tabBarIcon: ({ color, size }) => <MaterialIcons name="receipt-long" size={size} color={color} /> }} />
    <Tabs.Screen name="add" options={{ title: "إضافة", tabBarIcon: ({ color }) => <MaterialIcons name="add-circle" size={34} color={palette.accent} />, tabBarLabelStyle: { fontSize: 10, fontWeight: "800", color: palette.accent } }} />
    <Tabs.Screen name="insights" options={{ title: "الرؤى", tabBarIcon: ({ color, size }) => <MaterialIcons name="donut-small" size={size} color={color} /> }} />
    <Tabs.Screen name="settings" options={{ title: "الإعدادات", tabBarIcon: ({ color, size }) => <MaterialIcons name="tune" size={size} color={color} /> }} />
  </Tabs>;
}
