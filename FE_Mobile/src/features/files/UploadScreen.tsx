import React, { useRef, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { CryptoDigestAlgorithm, digest, randomUUID } from "expo-crypto";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { useApp } from "../../contexts/AppContext";
import { endpoint } from "../../api/catalog";
import { ApiError, safeHttpUrl } from "../../api/client";
import { isRecord } from "../../api/types";
import { Fields } from "../forms/Fields";
import { Button, EmptyState, Heading, Icon } from "../../components/common";
import { ui, colors } from "../../theme";

interface UploadJob {
  name: string;
  bytes: Uint8Array;
  mimeType: string;
  sha256: string;
  purpose: string;
  sessionKey: string;
  completeKey: string;
  session?: {
    fileId: string;
    uploadUrl: string;
    requiredHeaders: Record<string, string>;
  };
  uploaded: boolean;
}
export function UploadScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Upload">) {
  const app = useApp();
  const [purpose, setPurpose] = useState("LANDLORD_PROOF"),
    [selected, setSelected] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [phase, setPhase] = useState("");
  const job = useRef<UploadJob | undefined>(undefined);
  const field = endpoint(170).inputFields.find((f) => f.name === "purpose")!;
  async function pick() {
    setError("");
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type:
          purpose === "LANDLORD_PROOF"
            ? ["application/pdf", "image/jpeg", "image/png", "image/webp"]
            : purpose.endsWith("IMAGE") || purpose === "AVATAR"
              ? "image/*"
              : "*/*",
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      const bytes = asset.file
        ? new Uint8Array(await asset.file.arrayBuffer())
        : await new File(asset.uri).bytes();
      if (!bytes.length) throw new Error("Tệp trống. Vui lòng chọn tệp khác.");
      const mimeType = asset.mimeType ?? "application/octet-stream";
      if (
        purpose === "LANDLORD_PROOF" &&
        (bytes.length > 5242880 ||
          ![
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp",
          ].includes(mimeType))
      )
        throw new Error(
          "Minh chứng nhà phải là PDF, JPG, PNG hoặc WebP, tối đa 5 MB.",
        );
      const hash = await digest(
        CryptoDigestAlgorithm.SHA256,
        bytes as Uint8Array<ArrayBuffer>,
      );
      const sha256 = [...new Uint8Array(hash)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      job.current = {
        name: asset.name,
        bytes,
        mimeType,
        sha256,
        purpose,
        sessionKey: randomUUID(),
        completeKey: randomUUID(),
        uploaded: false,
      };
      setSelected(asset.name);
      setPhase("Đã chọn tệp, chưa tải lên.");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function upload() {
    const current = job.current;
    if (!current || busy) return;
    setBusy(true);
    setError("");
    try {
      if (!current.session) {
        setPhase("Đang chuẩn bị tải lên…");
        const result = await app.client.request(endpoint(170), {
          idempotencyKey: current.sessionKey,
          body: {
            purpose: current.purpose,
            originalName: current.name,
            mimeType: current.mimeType,
            sizeBytes: current.bytes.length,
            sha256: current.sha256,
          },
        });
        const data = result.data;
        if (
          !isRecord(data) ||
          typeof data.fileId !== "string" ||
          !safeHttpUrl(data.uploadUrl) ||
          !isRecord(data.requiredHeaders) ||
          !Object.values(data.requiredHeaders).every(
            (v) => typeof v === "string",
          )
        )
          throw new ApiError("Máy chủ chưa trả đủ thông tin phiên tải tệp.", {
            code: "CONTRACT_MISMATCH",
            ambiguous: true,
          });
        current.session = {
          fileId: data.fileId,
          uploadUrl: String(data.uploadUrl),
          requiredHeaders: data.requiredHeaders as Record<string, string>,
        };
      }
      if (!current.uploaded) {
        setPhase("Đang tải nội dung tệp…");
        const controller = new AbortController(),
          timer = setTimeout(() => controller.abort(), 60000);
        try {
          // This is the storage URL, not the API. Never send the API bearer token or cookies.
          const response = await fetch(current.session.uploadUrl, {
            method: "PUT",
            headers: current.session.requiredHeaders,
            body: current.bytes as Uint8Array<ArrayBuffer>,
            credentials: "omit",
            signal: controller.signal,
          });
          if (!response.ok)
            throw new Error(
              "Kho tệp chưa nhận nội dung. Thử lại hoặc kiểm tra thời hạn phiên tải lên.",
            );
          current.uploaded = true;
        } finally {
          clearTimeout(timer);
        }
      }
      setPhase("Đang kiểm tra tệp tại máy chủ…");
      const complete = await app.client.request(endpoint(171), {
        params: { fileId: current.session.fileId },
        idempotencyKey: current.completeKey,
      });
      if (!isRecord(complete.data) || complete.data.status !== "ACTIVE")
        throw new Error("Tệp chưa được máy chủ xác nhận hoạt động.");
      app.rememberFile({
        id: current.session.fileId,
        name: current.name,
        purpose: current.purpose,
      });
      app.invalidate();
      app.notify("Tệp đã được tải lên và xác nhận.");
      job.current = undefined;
      navigation.goBack();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : (e as Error).message);
      setPhase("Chưa hoàn tất. Thử lại giữ nguyên tệp và phiên tải lên.");
    } finally {
      setBusy(false);
    }
  }
  if (!app.user)
    return (
      <EmptyState
        icon="lock"
        title="Đăng nhập để tải tệp"
        description="Tệp sẽ được gắn với tài khoản của bạn."
        action={
          <Button
            title="Đăng nhập"
            onPress={() => navigation.navigate("Auth", { mode: "login" })}
          />
        }
      />
    );
  return (
    <ScrollView contentContainerStyle={ui.body}>
      <Heading
        title="Tải tệp đính kèm"
        description="Chỉ sử dụng tệp của bạn và đúng mục đích."
      />
      <View style={ui.card}>
        <Fields
          schema="UploadSession"
          fields={[field]}
          values={{ purpose }}
          onChange={(v) => {
            setPurpose(String(v.purpose));
            job.current = undefined;
            setSelected("");
            setPhase("");
          }}
          disabled={busy || !!job.current?.session}
        />
        <Button
          secondary
          title={selected ? "Đổi tệp" : "Chọn tệp từ thiết bị"}
          icon="paperclip"
          onPress={() => void pick()}
          disabled={busy || !!job.current?.session}
        />
        {selected && (
          <View style={ui.row}>
            <Icon name="file" />
            <Text style={[ui.text, { flex: 1 }]}>{selected}</Text>
          </View>
        )}
        {phase && <Text style={ui.muted}>{phase}</Text>}
        {error && (
          <Text accessibilityRole="alert" style={ui.error}>
            {error}
          </Text>
        )}
        <Button
          title="Tải lên và xác nhận"
          icon="upload-cloud"
          onPress={() => void upload()}
          disabled={!selected}
          loading={busy}
        />
      </View>
      <View style={[ui.card, { backgroundColor: colors.soft }]}>
        <Text style={ui.muted}>
          Minh chứng quyền cho thuê: PDF, JPG, PNG, WebP; tối đa 5 MB mỗi tệp và
          8 tệp mỗi hồ sơ. Các mục đích khác được máy chủ kiểm tra theo chính
          sách đã cấu hình.
        </Text>
      </View>
      {app.uploadedFiles.length > 0 && (
        <>
          <Text style={ui.section}>Tệp đã tải trong phiên này</Text>
          {app.uploadedFiles.map((file) => (
            <View key={file.id} style={ui.card}>
              <Text style={ui.text}>{file.name}</Text>
              <Button
                secondary
                title="Xem thông tin tệp"
                onPress={() =>
                  navigation.navigate("Resource", {
                    endpointId: 172,
                    params: { fileId: file.id },
                    title: file.name,
                    kind: "file",
                  })
                }
              />
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}
