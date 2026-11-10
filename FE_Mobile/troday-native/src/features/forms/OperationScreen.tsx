import React, { useRef, useState } from "react";
import { ScrollView, View, Text, Modal, Linking } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { randomUUID } from "expo-crypto";
import type { RootStackParamList } from "../../navigation/types";
import { endpoint, allowed, pathKeys, schemas } from "../../api/catalog";
import { ApiError, safeHttpUrl } from "../../api/client";
import type { RecordValue, FieldSpec } from "../../api/types";
import { isRecord } from "../../api/types";
import { useApp } from "../../contexts/AppContext";
import { Fields } from "./Fields";
import { validate } from "./validation";
import { MutationAttempt } from "./attempt";
import { colors, ui } from "../../theme";
import { Button, EmptyState, Heading } from "../../components/common";
import { label } from "./labels";
import { blockedOperations } from "../../services/workflows";
import { downloadResidents } from "../files/transfers";

const contractBlocks: Record<string, string> = {
  "API-018":
    "Cách gia hạn phiên trên thiết bị đang chờ backend xác nhận. Vui lòng đăng nhập lại.",
  "API-067":
    "Cấu trúc giá trị tiêu chí sinh hoạt chưa được đặc tả đầy đủ. Tính năng sẽ mở sau khi thống nhất dữ liệu.",
  "API-113":
    "Quy trình nhập hợp đồng giấy và thành viên đang chờ backend xác nhận (D11).",
  "API-170":
    "Vui lòng dùng chức năng tải tệp để gửi nội dung tệp và kiểm tra dung lượng.",
};
export function OperationScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Operation">) {
  const e = endpoint(route.params.endpointId),
    { client, user, role, login, invalidate, notify } = useApp();
  const attempt = useRef(new MutationAttempt(randomUUID));
  const [values, setValues] = useState<RecordValue>(() => {
    const initial: RecordValue = {};
    for (const f of e.inputFields) {
      if (route.params.initial && f.name in route.params.initial)
        initial[f.name] = route.params.initial[f.name];
      else if (f.type.endsWith("[]") && f.required) initial[f.name] = [];
    }
    if (e.inputFields.some((f) => f.name === "clientMessageKey"))
      initial.clientMessageKey = randomUUID();
    return initial;
  });
  const [params, setParams] = useState<RecordValue>(route.params.params ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({}),
    [error, setError] = useState<ApiError>(),
    [busy, setBusy] = useState(false),
    [confirm, setConfirm] = useState<RecordValue>();
  const canUse = allowed(e, user?.roles ?? [], role);
  const blocked = contractBlocks[e.id] ?? blockedOperations[e.id];
  const schema = e.input ?? "";
  const missingPaths = pathKeys(e).filter((key) => !route.params.params?.[key]);
  const pathFields: FieldSpec[] = missingPaths.map((name) => ({
    name,
    type: "id",
    required: true,
    rule: "Tài nguyên đã chọn từ dữ liệu máy chủ.",
  }));
  const restrictedVersion =
    e.headers.some((h) => h.startsWith("If-Match:")) &&
    !route.params.etag &&
    !route.params.createOnly;
  function prepare() {
    const checked = validate(
      schema,
      e.inputFields,
      values,
      schemas,
      e.method === "PATCH",
    );
    const paths = validate("", pathFields, params, schemas);
    const next = { ...checked.errors, ...paths.errors };
    setErrors(next);
    setError(undefined);
    if (Object.keys(next).length) return;
    if (
      e.inputFields.some(
        (f) => f.type === "object[]" && schema !== "HouseProof",
      )
    )
      return;
    setConfirm(checked.body);
  }
  async function submit(body: RecordValue) {
    if (attempt.current.busy) return;
    setBusy(true);
    setConfirm(undefined);
    setError(undefined);
    try {
      const pathParams = {
        ...(route.params.params ?? {}),
        ...Object.fromEntries(
          Object.entries(params).map(([k, v]) => [k, String(v)]),
        ),
      };
      if (e.id === "API-116") {
        await downloadResidents(client);
        notify("Đã chuẩn bị tệp danh sách người ở.");
        navigation.goBack();
        return;
      }
      if (e.method === "GET") {
        navigation.replace("Resource", {
          endpointId: route.params.endpointId,
          params: pathParams,
          title: e.title,
        });
        return;
      }
      const key = attempt.current.begin({ body, params: pathParams });
      if (e.id === "API-002") {
        await login(body, key);
        attempt.current.finish();
        notify("Đăng nhập thành công.");
        navigation.popToTop();
        return;
      }
      const result = await client.request(e, {
        params: pathParams,
        body: e.inputFields.length ? body : undefined,
        idempotencyKey: key,
        etag: route.params.etag,
        createOnly: route.params.createOnly,
      });
      if (e.id === "API-173") {
        const url = isRecord(result.data)
          ? safeHttpUrl(result.data.downloadUrl)
          : undefined;
        if (!url)
          throw new ApiError("Máy chủ chưa trả đường dẫn tải tệp hợp lệ.", {
            code: "CONTRACT_MISMATCH",
          });
        await Linking.openURL(url);
      }
      attempt.current.finish();
      invalidate();
      notify("Thao tác đã được máy chủ xác nhận.");
      if (
        e.id === "API-025" &&
        isRecord(result.data) &&
        typeof result.data.resetGrant === "string"
      )
        navigation.replace("Operation", {
          endpointId: 26,
          initial: { resetGrant: result.data.resetGrant },
        });
      else if (
        e.id === "API-022" &&
        isRecord(result.data) &&
        typeof result.data.selector === "string"
      )
        navigation.replace("Operation", {
          endpointId: 23,
          initial: { selector: result.data.selector },
        });
      else if (
        e.id === "API-076" &&
        isRecord(result.data) &&
        typeof result.data.id === "string"
      )
        navigation.replace("Resource", {
          endpointId: 78,
          params: { conversationId: result.data.id },
          title: "Cuộc trò chuyện",
          kind: "conversation",
        });
      else if (e.id === "API-001") {
        notify("Đã tạo tài khoản. Bạn có thể đăng nhập.");
        navigation.replace("Auth", { mode: "login" });
      } else navigation.goBack();
    } catch (caught) {
      const err =
        caught instanceof ApiError
          ? caught
          : new ApiError(
              caught instanceof Error
                ? caught.message
                : "Không thể hoàn tất thao tác.",
            );
      attempt.current.finish(err.ambiguous);
      setError(err);
      setErrors(
        Object.fromEntries(err.details.map((d) => [d.field, d.message])),
      );
    } finally {
      setBusy(false);
    }
  }
  if (!canUse)
    return (
      <EmptyState
        icon="lock"
        title="Cần đăng nhập đúng vai trò"
        description="Chỉ tài khoản được cấp quyền mới có thể thực hiện thao tác này."
        action={
          <Button
            title="Đăng nhập"
            onPress={() => navigation.navigate("Auth", { mode: "login" })}
          />
        }
      />
    );
  if (blocked || restrictedVersion)
    return (
      <ScrollView contentContainerStyle={ui.body}>
        <Heading title={route.params.title ?? e.title} />
        <EmptyState
          icon="clock"
          title="Chưa đủ điều kiện thực hiện"
          description={
            blocked ??
            "Cần đọc phiên bản dữ liệu mới nhất từ máy chủ trước khi cập nhật. Nếu máy chủ chưa trả ETag, tính năng này cần được backend hoàn thiện."
          }
        />
      </ScrollView>
    );
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={ui.body}
    >
      <Heading
        title={route.params.title ?? e.title}
        description="Kiểm tra thông tin trước khi xác nhận."
      />
      {missingPaths.length > 0 && (
        <View style={ui.card}>
          <Text style={ui.muted}>
            Chọn đúng tài nguyên liên quan theo mã của máy chủ.
          </Text>
          <Fields
            schema=""
            fields={pathFields}
            values={params}
            onChange={setParams}
            errors={errors}
            disabled={busy || attempt.current.uncertain}
          />
        </View>
      )}
      <View style={ui.card}>
        {e.inputFields.length ? (
          <Fields
            schema={schema}
            fields={e.inputFields.filter((f) => f.name !== "clientMessageKey")}
            values={values}
            onChange={setValues}
            errors={errors}
            disabled={busy || attempt.current.uncertain}
          />
        ) : (
          <Text style={ui.text}>
            Thao tác sẽ được gửi cho tài nguyên đang chọn. Vui lòng xác nhận để
            tiếp tục.
          </Text>
        )}
      </View>
      {e.id === "API-030" && (
        <Text style={ui.muted}>
          Nhà được tạo ở trạng thái nháp. Bạn có thể thêm phòng và nộp minh
          chứng quyền cho thuê sau khi lưu.
        </Text>
      )}
      {schema === "Post" && (
        <Button
          secondary
          title="Tải ảnh tin đăng"
          icon="upload-cloud"
          onPress={() => navigation.navigate("Upload")}
        />
      )}
      {["HouseProof", "IdentityProof", "Report"].includes(schema) && (
        <Button
          secondary
          title="Tải tệp minh chứng"
          icon="upload-cloud"
          onPress={() => navigation.navigate("Upload")}
        />
      )}
      {errors._form && (
        <Text accessibilityRole="alert" style={ui.error}>
          {errors._form}
        </Text>
      )}
      {error && (
        <View
          accessibilityRole="alert"
          style={[ui.card, { backgroundColor: colors.redSoft }]}
        >
          <Text style={ui.error}>{error.message}</Text>
          {error.requestId && (
            <Text style={ui.muted}>Mã hỗ trợ: {error.requestId}</Text>
          )}
          {error.ambiguous && (
            <Text style={ui.error}>
              Chưa xác định kết quả lần gửi trước. Giữ nguyên nội dung và thử
              lại để máy chủ đối chiếu, tránh tạo trùng.
            </Text>
          )}
        </View>
      )}
      <Button
        title={
          attempt.current.uncertain
            ? "Thử lại cùng nội dung"
            : "Kiểm tra và tiếp tục"
        }
        loading={busy}
        onPress={prepare}
      />
      <Modal
        visible={!!confirm}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirm(undefined)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#183A3266",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View style={ui.card}>
            <Text style={ui.section}>Xác nhận thao tác</Text>
            <Text style={ui.text}>{e.title}</Text>
            <Text style={ui.muted}>
              Thông tin sẽ được gửi đến máy chủ. Trạng thái chỉ thay đổi sau khi
              máy chủ xác nhận.
            </Text>
            <Button
              title="Xác nhận gửi"
              onPress={() => confirm && void submit(confirm)}
            />
            <Button
              title="Quay lại kiểm tra"
              secondary
              onPress={() => setConfirm(undefined)}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
