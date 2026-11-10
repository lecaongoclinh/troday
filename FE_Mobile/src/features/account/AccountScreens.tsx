import React, { useState } from "react";
import { ScrollView, View, Text, TextInput } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { useApp } from "../../contexts/AppContext";
import { colors, fonts, ui } from "../../theme";
import { Button, Heading, Icon, Tag } from "../../components/common";
import { normalizeBaseUrl } from "../../api/client";

export function AuthScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Auth">) {
  const { baseUrl } = useApp();
  const mode = route.params?.mode ?? "login";
  return (
    <ScrollView contentContainerStyle={[ui.body, { paddingTop: 35 }]}>
      <View
        style={{
          height: 65,
          width: 65,
          backgroundColor: colors.soft,
          borderRadius: 22,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Icon name="home" size={32} />
      </View>
      <Heading
        title={
          mode === "register"
            ? "Bắt đầu cùng Trọday"
            : mode === "reset"
              ? "Lấy lại tài khoản"
              : "Chào mừng bạn trở lại"
        }
        description="Một nơi ở phù hợp. Một hành trình an tâm."
      />
      {!baseUrl && (
        <View style={ui.card}>
          <Tag text="Chưa kết nối máy chủ" tone="warning" />
          <Text style={ui.muted}>
            Máy chủ chưa được cấu hình. Bạn có thể xem các biểu mẫu; đăng nhập
            sẽ hoạt động khi có backend.
          </Text>
          <Button
            secondary
            title="Thiết lập kết nối"
            onPress={() => navigation.navigate("Connection")}
          />
        </View>
      )}
      <Button
        title={
          mode === "register"
            ? "Điền thông tin đăng ký"
            : mode === "reset"
              ? "Yêu cầu mã đặt lại mật khẩu"
              : "Đăng nhập bằng tài khoản"
        }
        onPress={() =>
          navigation.navigate("Operation", {
            endpointId: mode === "register" ? 1 : mode === "reset" ? 24 : 2,
          })
        }
      />
      {mode === "reset" && (
        <>
          <Button
            secondary
            title="Xác minh mã đã nhận"
            onPress={() => navigation.navigate("Operation", { endpointId: 25 })}
          />
          <Button
            secondary
            title="Đặt mật khẩu mới"
            onPress={() => navigation.navigate("Operation", { endpointId: 26 })}
          />
        </>
      )}
      <View style={ui.divider} />
      <Button
        secondary
        title={
          mode === "register"
            ? "Đã có tài khoản? Đăng nhập"
            : "Chưa có tài khoản? Đăng ký"
        }
        onPress={() =>
          navigation.replace("Auth", {
            mode: mode === "register" ? "login" : "register",
          })
        }
      />
      {mode === "login" && (
        <Button
          secondary
          title="Quên mật khẩu"
          onPress={() => navigation.replace("Auth", { mode: "reset" })}
        />
      )}
      <Text style={[ui.muted, { textAlign: "center", fontSize: 10 }]}>
        Quyền truy cập được xác định từ tài khoản đã đăng nhập.
      </Text>
    </ScrollView>
  );
}
export function ConnectionScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Connection">) {
  const { baseUrl, setBaseUrl, notify } = useApp();
  const [url, setUrl] = useState(baseUrl),
    [error, setError] = useState("");
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={ui.body}
    >
      <Heading
        title="Kết nối Trọday"
        description="Thiết lập địa chỉ máy chủ cho ứng dụng."
      />
      <View style={ui.card}>
        <Text style={[ui.text, { fontFamily: fonts.semibold }]}>
          Địa chỉ API
        </Text>
        <TextInput
          accessibilityLabel="Địa chỉ API"
          style={ui.input}
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="https://your-server.example/api/v1"
        />
        <Text style={ui.muted}>
          Địa chỉ bao gồm tiền tố /api/v1. Thay đổi kết nối sẽ đăng xuất tài
          khoản hiện tại.
        </Text>
        {error && (
          <Text accessibilityRole="alert" style={ui.error}>
            {error}
          </Text>
        )}
        <Button
          title="Lưu kết nối"
          onPress={() => {
            try {
              setBaseUrl(normalizeBaseUrl(url));
              notify(url ? "Đã cập nhật kết nối." : "Đã ngắt kết nối máy chủ.");
              navigation.goBack();
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        />
      </View>
      <View style={[ui.card, { backgroundColor: colors.soft }]}>
        <Icon name="info" />
        <Text style={ui.muted}>
          Kết nối được dùng trong phiên mở ứng dụng này. Nếu chưa có máy chủ,
          giữ trống địa chỉ; ứng dụng sẽ hiển thị trạng thái chưa kết nối.
        </Text>
      </View>
    </ScrollView>
  );
}
