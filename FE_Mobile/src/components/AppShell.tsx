import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { FeatureKey, RootStackParamList } from "../navigation/types";
import { useApp } from "../contexts/AppContext";
import { features, roleNavigation } from "../features/config";
import { FeatureScreen } from "../features/screens/FeatureScreen";
import { colors, fonts, ui } from "../theme";
import { Icon } from "./common";

export function AppShell() {
  const app = useApp(),
    insets = useSafeAreaInsets(),
    navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [active, setActive] = useState<FeatureKey>("discover"),
    [menu, setMenu] = useState(false);
  const nav = roleNavigation[app.role];
  const primary: FeatureKey[] =
    app.role === "landlord"
      ? ["dashboard", "properties", "chats", "invoices"]
      : app.role === "admin"
        ? ["dashboard", "verifications", "moderation", "profile"]
        : ["discover", "favorites", "chats", "profile"];
  useEffect(() => {
    setActive(
      app.role === "landlord" || app.role === "admin"
        ? "dashboard"
        : "discover",
    );
    setMenu(false);
  }, [app.role]);
  return (
    <SafeAreaView edges={["top"]} style={s.app}>
      <View style={s.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Trọday, trang chủ"
          style={ui.row}
          onPress={() => setActive(primary[0])}
        >
          <View style={s.logo}>
            <Icon name="home" color={colors.white} size={23} />
          </View>
          <View>
            <Text style={s.wordmark}>
              trọ<Text style={{ color: colors.coral }}>day</Text>
              <Text style={{ color: colors.teal }}>.</Text>
            </Text>
            <Text
              style={{
                fontFamily: fonts.regular,
                color: colors.muted,
                fontSize: 9,
              }}
            >
              {app.role === "landlord"
                ? "KHÔNG GIAN CHỦ TRỌ"
                : app.role === "admin"
                  ? "KHÔNG GIAN QUẢN TRỊ"
                  : "TÌM NƠI THUỘC VỀ"}
            </Text>
          </View>
        </Pressable>
        <View style={{ flexDirection: "row", gap: 15, alignItems: "center" }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Thông báo"
            onPress={() =>
              navigation.navigate("Feature", { feature: "notifications" })
            }
          >
            <Icon name="bell" size={22} color={colors.ink} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tài khoản"
            onPress={() => setActive("profile")}
            style={s.avatar}
          >
            <Icon name="user" size={19} />
          </Pressable>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <FeatureScreen key={`${app.role}:${active}`} feature={active} />
      </View>
      <View style={[s.bottom, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {primary.map((key) => (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityLabel={features[key].title}
            accessibilityState={{ selected: active === key }}
            onPress={() => setActive(key)}
            style={s.tab}
          >
            <View
              style={[
                s.tabIcon,
                active === key && { backgroundColor: colors.soft },
              ]}
            >
              <Icon
                name={features[key].icon}
                color={active === key ? colors.teal : "#97A291"}
              />
            </View>
            <Text
              style={[
                s.tabText,
                active === key && {
                  color: colors.teal,
                  fontFamily: fonts.semibold,
                },
              ]}
            >
              {key === "dashboard" ? "Trang chủ" : features[key].title}
            </Text>
          </Pressable>
        ))}
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Tiện ích"
          accessibilityState={{ selected: false }}
          onPress={() => setMenu(true)}
          style={s.tab}
        >
          <View style={s.tabIcon}>
            <Icon name="grid" color="#97A291" />
          </View>
          <Text style={s.tabText}>Tiện ích</Text>
        </Pressable>
      </View>
      <Modal
        visible={menu}
        transparent
        animationType="slide"
        onRequestClose={() => setMenu(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "#183A3266",
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đóng tiện ích"
            style={StyleSheet.absoluteFill}
            onPress={() => setMenu(false)}
          />
          <SafeAreaView
            edges={["bottom"]}
            style={{
              backgroundColor: colors.page,
              borderTopLeftRadius: 27,
              borderTopRightRadius: 27,
              padding: 24,
              maxHeight: "85%",
            }}
          >
            <View style={ui.between}>
              <Text style={ui.title}>Tiện ích của bạn</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Đóng"
                onPress={() => setMenu(false)}
              >
                <Icon name="x" />
              </Pressable>
            </View>
            <Text style={[ui.muted, { marginTop: 5, marginBottom: 20 }]}>
              Mọi thứ bạn cần, ngay trong Trọday.
            </Text>
            <ScrollView
              contentContainerStyle={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              {nav.map((key) => (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  accessibilityLabel={`Mở ${features[key].title}`}
                  style={[ui.card, { width: "47%", flexGrow: 1, padding: 18 }]}
                  onPress={() => {
                    setActive(key);
                    setMenu(false);
                  }}
                >
                  <Icon name={features[key].icon} size={24} />
                  <Text style={[ui.text, { fontSize: 12 }]}>
                    {features[key].title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.page },
  header: {
    paddingHorizontal: 22,
    paddingTop: 17,
    paddingBottom: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2EB",
  },
  logo: {
    height: 41,
    width: 39,
    backgroundColor: colors.teal,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: {
    fontFamily: fonts.bold,
    fontSize: 25,
    color: colors.ink,
    letterSpacing: -1,
    lineHeight: 32,
  },
  avatar: {
    height: 37,
    width: 37,
    borderRadius: 14,
    backgroundColor: "#E4ECD9",
    alignItems: "center",
    justifyContent: "center",
  },
  bottom: {
    flexDirection: "row",
    paddingTop: 9,
    paddingHorizontal: 7,
    borderTopWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  tab: { flex: 1, alignItems: "center", gap: 5 },
  tabIcon: {
    width: 44,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: { fontFamily: fonts.medium, color: "#97A291", fontSize: 9 },
});
