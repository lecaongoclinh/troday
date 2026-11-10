import React from "react";
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { BeVietnamPro_400Regular } from "@expo-google-fonts/be-vietnam-pro/400Regular";
import { BeVietnamPro_500Medium } from "@expo-google-fonts/be-vietnam-pro/500Medium";
import { BeVietnamPro_600SemiBold } from "@expo-google-fonts/be-vietnam-pro/600SemiBold";
import { BeVietnamPro_700Bold } from "@expo-google-fonts/be-vietnam-pro/700Bold";
import { AppProvider, useApp } from "./src/contexts/AppContext";
import type { RootStackParamList } from "./src/navigation/types";
import { AppShell } from "./src/components/AppShell";
import { FeatureScreen } from "./src/features/screens/FeatureScreen";
import { ResourceScreen } from "./src/features/screens/ResourceScreen";
import { OperationScreen } from "./src/features/forms/OperationScreen";
import {
  AuthScreen,
  ConnectionScreen,
} from "./src/features/account/AccountScreens";
import { UploadScreen } from "./src/features/files/UploadScreen";
import { Icon, Loading } from "./src/components/common";
import { features } from "./src/features/config";
import { colors, fonts, ui } from "./src/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.teal,
    background: colors.page,
    card: colors.page,
    text: colors.ink,
    border: colors.line,
  },
};
const linking = {
  prefixes: [
    "troday://",
    ...(process.env.EXPO_PUBLIC_WEB_ORIGIN
      ? [process.env.EXPO_PUBLIC_WEB_ORIGIN]
      : []),
  ],
  config: {
    screens: {
      Main: "",
      Feature: "space/:feature",
      Auth: "account",
      Connection: "connection",
      Upload: "upload",
    },
  },
};
function Navigation() {
  const app = useApp();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <NavigationContainer theme={theme} linking={linking}>
        <Stack.Navigator
          key={app.user?.id ?? "guest"}
          screenOptions={{
            headerShadowVisible: false,
            headerTintColor: colors.teal,
            headerTitleStyle: { fontFamily: fonts.semibold, fontSize: 14 },
            contentStyle: { backgroundColor: colors.page },
            headerBackTitle: "Quay lại",
          }}
        >
          <Stack.Screen
            name="Main"
            component={AppShell}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Feature"
            options={({ route }) => ({
              title: Object.hasOwn(features, route.params.feature)
                ? features[route.params.feature].title
                : "Trọday",
            })}
          >
            {({ route }) => (
              <FeatureScreen
                feature={
                  Object.hasOwn(features, route.params.feature)
                    ? route.params.feature
                    : "discover"
                }
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="Resource"
            component={ResourceScreen}
            options={({ route }) => ({ title: route.params.title })}
          />
          <Stack.Screen
            name="Operation"
            component={OperationScreen}
            options={{ title: "Thông tin & xác nhận" }}
          />
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ title: "Tài khoản" }}
          />
          <Stack.Screen
            name="Connection"
            component={ConnectionScreen}
            options={{ title: "Kết nối" }}
          />
          <Stack.Screen
            name="Upload"
            component={UploadScreen}
            options={{ title: "Tệp đính kèm" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      {!!app.notice && (
        <View
          accessibilityRole="alert"
          style={{
            position: "absolute",
            bottom: 100,
            left: 18,
            right: 18,
            backgroundColor: colors.dark,
            padding: 16,
            borderRadius: 15,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            elevation: 10,
          }}
        >
          <Text
            style={[ui.text, { flex: 1, color: colors.white, fontSize: 12 }]}
          >
            {app.notice}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đóng thông báo"
            onPress={app.dismiss}
          >
            <Icon name="x" size={18} color={colors.white} />
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <View style={{ flex: 1, padding: 30, justifyContent: "center", gap: 18 }}>
        <Text style={ui.title}>Chưa mở được ứng dụng</Text>
        <Text style={ui.text}>
          Vui lòng kiểm tra cấu hình hoặc khởi động lại ứng dụng.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => this.setState({ failed: false })}
        >
          <Text style={{ color: colors.teal }}>Thử lại</Text>
        </Pressable>
      </View>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  const [ready, error] = useFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
  });
  return (
    <SafeAreaProvider>
      <View
        style={{ flex: 1, backgroundColor: "#E9EEE4", alignItems: "center" }}
      >
        <View
          style={{
            flex: 1,
            width: "100%",
            maxWidth: 640,
            backgroundColor: colors.page,
          }}
        >
          <StatusBar style="dark" />
          <ErrorBoundary>
            {!ready && !error ? (
              <Loading />
            ) : (
              <AppProvider>
                <Navigation />
              </AppProvider>
            )}
          </ErrorBoundary>
        </View>
      </View>
    </SafeAreaProvider>
  );
}
