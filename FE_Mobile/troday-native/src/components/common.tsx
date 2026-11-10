import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, ui } from "../theme";
import type { ApiError } from "../api/client";
export type IconName = React.ComponentProps<typeof Feather>["name"];
export function Icon({
  name,
  size = 20,
  color = colors.teal,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <Feather name={name} size={size} color={color} />;
}
export function Button({
  title,
  onPress,
  icon,
  secondary = false,
  danger = false,
  disabled = false,
  loading = false,
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        danger && { backgroundColor: colors.redSoft, borderColor: "#F0CCCC" },
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.8 },
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={secondary ? colors.teal : colors.white}
        />
      ) : icon ? (
        <Icon
          name={icon}
          size={17}
          color={danger ? colors.red : secondary ? colors.teal : colors.white}
        />
      ) : null}
      <Text
        style={[
          s.buttonLabel,
          secondary && { color: colors.teal },
          danger && { color: colors.red },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Tag({
  text,
  tone = "normal",
}: {
  text: string;
  tone?: "normal" | "warning";
}) {
  return (
    <View
      style={[ui.tag, tone === "warning" && { backgroundColor: colors.peach }]}
    >
      <Text
        style={{
          fontFamily: fonts.medium,
          fontSize: 10,
          color: tone === "warning" ? colors.coral : colors.teal,
        }}
      >
        {text}
      </Text>
    </View>
  );
}
export function EmptyState({
  title,
  description,
  icon = "inbox",
  action,
}: {
  title: string;
  description: string;
  icon?: IconName;
  action?: React.ReactNode;
}) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Icon name={icon} size={29} />
      </View>
      <Text style={[ui.section, { textAlign: "center" }]}>{title}</Text>
      <Text style={[ui.muted, { textAlign: "center", maxWidth: 330 }]}>
        {description}
      </Text>
      {action}
    </View>
  );
}
export function ErrorState({
  error,
  retry,
}: {
  error: ApiError;
  retry?: () => void;
}) {
  if (error.code === "NOT_CONFIGURED")
    return (
      <EmptyState
        icon="cloud-off"
        title="Chưa kết nối máy chủ"
        description="Dữ liệu sẽ xuất hiện khi máy chủ Trọday sẵn sàng. Bạn có thể thiết lập kết nối trong mục Tài khoản."
      />
    );
  if (error.code === "LOGIN_REQUIRED")
    return (
      <EmptyState
        icon="lock"
        title="Đăng nhập để tiếp tục"
        description="Đăng nhập tài khoản của bạn để xem và quản lý thông tin này."
      />
    );
  return (
    <EmptyState
      icon="alert-circle"
      title="Chưa tải được dữ liệu"
      description={`${error.message}${error.requestId ? " Mã hỗ trợ: " + error.requestId : ""}`}
      action={
        retry ? <Button title="Thử lại" secondary onPress={retry} /> : undefined
      }
    />
  );
}
export function Loading() {
  return (
    <View
      accessibilityLabel="Đang tải"
      style={{ padding: 50, gap: 15, alignItems: "center" }}
    >
      <ActivityIndicator color={colors.teal} />
      <Text style={ui.muted}>Đang tải dữ liệu…</Text>
    </View>
  );
}
export function Heading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={[ui.between, { alignItems: "flex-start" }]}>
      <View style={{ flex: 1, gap: 5 }}>
        <Text accessibilityRole="header" style={ui.title}>
          {title}
        </Text>
        {description && <Text style={ui.muted}>{description}</Text>}
      </View>
      {action}
    </View>
  );
}
const s = StyleSheet.create({
  button: {
    minHeight: 46,
    borderRadius: 13,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.teal,
    borderWidth: 1,
    borderColor: colors.teal,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondary: { backgroundColor: colors.white, borderColor: colors.line },
  buttonLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.white,
  },
  empty: {
    paddingVertical: 37,
    paddingHorizontal: 15,
    alignItems: "center",
    gap: 15,
  },
  emptyIcon: {
    height: 70,
    width: 70,
    borderRadius: 24,
    backgroundColor: colors.soft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 3,
  },
});
