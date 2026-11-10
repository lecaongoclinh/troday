import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { isRecord } from "../api/types";
import { safeHttpUrl } from "../api/client";
import { label, displayValue, labels } from "../features/forms/labels";
import { colors, fonts, ui } from "../theme";
import { money, dateTime } from "../utils/format";
import { Icon, Tag } from "./common";
const privateKey =
  /(password|token|secret|storageKey|sha256|uploadUrl|downloadUrl|resetGrant)/i;
const moneyKeys = new Set([
  "rentAmount",
  "depositAmount",
  "unitPrice",
  "total",
  "unpaidAmount",
  "budgetMin",
  "budgetMax",
  "unitPriceOverride",
]);
export function RecordDetails({
  data,
  depth = 0,
}: {
  data: unknown;
  depth?: number;
}) {
  if (data === null || data === undefined)
    return <Text style={ui.muted}>Chưa có thông tin.</Text>;
  if (!isRecord(data) && !Array.isArray(data))
    return (
      <Text selectable style={ui.text}>
        {displayValue(data)}
      </Text>
    );
  if (depth > 4)
    return <Text style={ui.muted}>Xem thêm ở mục thông tin liên quan.</Text>;
  if (Array.isArray(data))
    return (
      <View style={{ gap: 12 }}>
        {data.length ? (
          data.map((item, i) => (
            <View
              key={i}
              style={isRecord(item) ? [ui.card, { padding: 13 }] : undefined}
            >
              <RecordDetails data={item} depth={depth + 1} />
            </View>
          ))
        ) : (
          <Text style={ui.muted}>Chưa có dữ liệu.</Text>
        )}
      </View>
    );
  return (
    <View style={{ gap: 13 }}>
      {Object.entries(data)
        .filter(([key]) => !privateKey.test(key) && key !== "allowedActions")
        .map(([key, value]) => {
          const title = labels[key] ?? key.replace(/([a-z])([A-Z])/g, "$1 $2");
          return (
            <View key={key} style={{ gap: 5 }}>
              <Text style={[ui.muted, { fontSize: 11 }]}>{title}</Text>
              {isRecord(value) || Array.isArray(value) ? (
                <RecordDetails data={value} depth={depth + 1} />
              ) : (
                <Text
                  selectable
                  style={[ui.text, { fontFamily: fonts.medium }]}
                >
                  {moneyKeys.has(key)
                    ? money(value)
                    : /(At)$/.test(key) && typeof value === "string"
                      ? dateTime(value)
                      : displayValue(value)}
                </Text>
              )}
            </View>
          );
        })}
    </View>
  );
}
export function ResourceCard({
  data,
  onPress,
  kind,
}: {
  data: unknown;
  onPress?: () => void;
  kind?: string;
}) {
  const item = isRecord(data) ? data : {};
  const title = String(
    item.title ??
      item.name ??
      item.fullName ??
      item.number ??
      item.contractNumber ??
      item.code ??
      item.id ??
      "Thông tin",
  );
  const subtitle =
    typeof item.address === "string"
      ? item.address
      : typeof item.content === "string"
        ? item.content
        : undefined;
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={onPress ? `Xem ${title}` : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={[ui.card, { gap: 14 }]}
    >
      <View style={[ui.between, { alignItems: "flex-start" }]}>
        <View style={ui.iconBox}>
          <Icon
            name={
              kind === "house"
                ? "home"
                : kind === "contract"
                  ? "file-text"
                  : kind === "invoice"
                    ? "credit-card"
                    : kind === "conversation"
                      ? "message-circle"
                      : "folder"
            }
          />
        </View>
        {typeof item.status === "string" && (
          <Tag
            text={displayValue(item.status)}
            tone={
              ["PENDING", "PENDING_REVIEW", "UNPAID"].includes(item.status)
                ? "warning"
                : "normal"
            }
          />
        )}
      </View>
      <Text style={[ui.section, { fontSize: 16 }]}>{title}</Text>
      {subtitle && (
        <Text numberOfLines={2} style={ui.muted}>
          {subtitle}
        </Text>
      )}
      <View style={ui.between}>
        <Text
          style={[ui.text, { color: colors.teal, fontFamily: fonts.semibold }]}
        >
          {item.total !== undefined
            ? money(item.total)
            : item.rentAmount !== undefined
              ? money(item.rentAmount)
              : item.startsAt
                ? dateTime(item.startsAt)
                : item.period
                  ? String(item.period)
                  : ""}
        </Text>
        {onPress && <Icon name="arrow-up-right" size={18} />}
      </View>
    </Pressable>
  );
}
export function PostCard({
  data,
  onPress,
}: {
  data: unknown;
  onPress: () => void;
}) {
  if (!isRecord(data)) return null;
  const room = isRecord(data.room) ? data.room : {};
  // images item DTO is not defined in the draft. Only literal URL strings are rendered.
  const image = Array.isArray(data.images)
    ? data.images.map(safeHttpUrl).find(Boolean)
    : undefined;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Xem ${String(data.title ?? "phòng")}`}
      onPress={onPress}
      style={{
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: 22,
        overflow: "hidden",
      }}
    >
      {image ? (
        <Image
          accessibilityLabel={String(data.title ?? "Ảnh phòng")}
          source={{ uri: image }}
          style={{ height: 200, width: "100%", backgroundColor: colors.soft }}
        />
      ) : (
        <View
          style={{
            height: 145,
            backgroundColor: colors.soft,
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <Icon name="home" size={35} />
          <Text style={ui.muted}>Chưa có ảnh hiển thị</Text>
        </View>
      )}
      <View style={{ padding: 18, gap: 12 }}>
        <Text style={[ui.section, { fontSize: 16 }]}>
          {String(data.title ?? "Tin phòng")}
        </Text>
        <View style={ui.row}>
          <Icon name="maximize" size={14} />
          <Text style={ui.muted}>
            {room.area !== undefined ? `${room.area} m²` : "Chưa có diện tích"}
          </Text>
          {room.capacity !== undefined && (
            <>
              <Text style={ui.muted}>·</Text>
              <Text style={ui.muted}>{String(room.capacity)} người</Text>
            </>
          )}
        </View>
        <View style={ui.divider} />
        <View style={ui.between}>
          <View style={ui.row}>
            <Text
              style={{
                fontFamily: fonts.bold,
                color: colors.teal,
                fontSize: 19,
              }}
            >
              {money(room.rentAmount)}
            </Text>
            <Text style={ui.muted}>/ tháng</Text>
          </View>
          <Icon name="arrow-up-right" />
        </View>
      </View>
    </Pressable>
  );
}
