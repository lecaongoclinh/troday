import React from "react";
import { View, Text, TextInput, Pressable, Switch } from "react-native";
import type { FieldSpec, RecordValue } from "../../api/types";
import { isRecord } from "../../api/types";
import { schemas } from "../../api/catalog";
import { label, displayValue } from "./labels";
import { enumOptions, nestedFields, childSchema } from "./validation";
import { colors, fonts, ui } from "../../theme";
import { Button, Icon } from "../../components/common";
import { ReferenceInput } from "./ReferenceInput";

export function Fields({
  schema,
  fields,
  values,
  onChange,
  errors = {},
  disabled = false,
  prefix = "",
}: {
  schema: string;
  fields: FieldSpec[];
  values: RecordValue;
  onChange: (next: RecordValue) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  prefix?: string;
}) {
  const update = (name: string, value: unknown) =>
    onChange({ ...values, [name]: value });
  const visibleFields = fields.filter((field) => {
    if (schema === "InvoiceInputItem") {
      if (values.type === "RENT") return field.name === "type";
      if (values.type === "SERVICE")
        return !["name", "quantity", "unitPrice"].includes(field.name);
      if (["OTHER", "DISCOUNT"].includes(String(values.type)))
        return !["roomServiceId", "previousReading", "currentReading"].includes(
          field.name,
        );
    }
    if (
      schema === "ContractChange" &&
      values.type !== "TRANSFER" &&
      ["proposal", "targetRoomId"].includes(field.name)
    )
      return false;
    if (
      schema === "ContractChange" &&
      values.type !== "RENEWAL" &&
      field.name === "newEndDate"
    )
      return false;
    return true;
  });
  return (
    <View style={{ gap: 19 }}>
      {visibleFields.map((field) => {
        const name = field.name,
          path = prefix + name,
          value = values[name],
          error = errors[path];
        const child = childSchema(schema, field),
          children = nestedFields[child] ?? schemas[child];
        const isNullable = field.type.includes("|null"),
          nullable = value === null;
        const options = field.type.startsWith("enum")
          ? enumOptions(schema, field)
          : [];
        const complex =
          field.type.startsWith("object") ||
          (field.type.endsWith("[]") && children);
        const unsupported = complex && !children;
        return (
          <View key={name} style={{ gap: 8 }}>
            <View style={ui.between}>
              <Text
                style={[ui.text, { fontSize: 12, fontFamily: fonts.semibold }]}
              >
                {label(name)}
                {field.required ? " *" : ""}
              </Text>
              {isNullable && (
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: nullable }}
                  disabled={disabled}
                  onPress={() => update(name, nullable ? undefined : null)}
                >
                  <Text style={[ui.muted, { color: colors.teal }]}>
                    {nullable ? "Dùng giá mặc định ✓" : "Dùng mặc định"}
                  </Text>
                </Pressable>
              )}
            </View>
            {!nullable &&
              (unsupported ? (
                <Text style={ui.muted}>
                  Thông tin bổ sung này đang chờ thống nhất cấu trúc với máy
                  chủ.
                </Text>
              ) : field.type === "boolean" ? (
                <View style={ui.between}>
                  <Text style={ui.muted}>
                    {value === undefined ? "Chưa chọn" : value ? "Có" : "Không"}
                  </Text>
                  <View style={ui.row}>
                    <Pressable
                      disabled={disabled}
                      onPress={() => update(name, false)}
                      accessibilityRole="button"
                      accessibilityLabel={`${label(name)}: Không`}
                    >
                      <Text style={ui.muted}>Không</Text>
                    </Pressable>
                    <Switch
                      accessibilityLabel={label(name)}
                      disabled={disabled}
                      value={value === true}
                      onValueChange={(v) => update(name, v)}
                      trackColor={{ false: "#D5DED0", true: colors.teal }}
                    />
                    <Pressable
                      disabled={disabled}
                      onPress={() => update(name, true)}
                      accessibilityRole="button"
                      accessibilityLabel={`${label(name)}: Có`}
                    >
                      <Text style={ui.muted}>Có</Text>
                    </Pressable>
                  </View>
                </View>
              ) : options.length ? (
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  {options.map((option) => (
                    <Pressable
                      key={option}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: value === option }}
                      disabled={disabled}
                      onPress={() => update(name, option)}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor:
                          value === option ? colors.teal : colors.line,
                        backgroundColor:
                          value === option ? colors.soft : colors.white,
                      }}
                    >
                      <Text
                        style={[
                          ui.text,
                          {
                            fontSize: 12,
                            color:
                              value === option ? colors.teal : colors.muted,
                          },
                        ]}
                      >
                        {displayValue(option)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : children && field.type.endsWith("[]") ? (
                <View style={{ gap: 12 }}>
                  {(Array.isArray(value) ? value : []).map((row, index) => (
                    <View key={index} style={[ui.card, { padding: 14 }]}>
                      <View style={ui.between}>
                        <Text style={ui.eyebrow}>
                          {label(name)} {index + 1}
                        </Text>
                        <Pressable
                          disabled={disabled}
                          accessibilityRole="button"
                          accessibilityLabel={`Bỏ ${label(name)} ${index + 1}`}
                          onPress={() =>
                            update(
                              name,
                              (value as unknown[]).filter(
                                (_, i) => i !== index,
                              ),
                            )
                          }
                        >
                          <Icon name="x" size={17} />
                        </Pressable>
                      </View>
                      <Fields
                        schema={child}
                        fields={children}
                        values={isRecord(row) ? row : {}}
                        onChange={(next) =>
                          update(
                            name,
                            (value as unknown[]).map((r, i) =>
                              i === index ? next : r,
                            ),
                          )
                        }
                        errors={errors}
                        disabled={disabled}
                        prefix={`${path}.${index}.`}
                      />
                    </View>
                  ))}
                  <Button
                    secondary
                    disabled={disabled}
                    icon="plus"
                    title={`Thêm ${label(name).toLowerCase()}`}
                    onPress={() =>
                      update(name, [...(Array.isArray(value) ? value : []), {}])
                    }
                  />
                </View>
              ) : children ? (
                <View style={[ui.card, { padding: 14 }]}>
                  <Fields
                    schema={child}
                    fields={children}
                    values={isRecord(value) ? value : {}}
                    onChange={(next) => update(name, next)}
                    errors={errors}
                    disabled={disabled}
                    prefix={`${path}.`}
                  />
                </View>
              ) : field.type === "id" || field.type === "id[]" ? (
                <ReferenceInput
                  field={field}
                  value={value}
                  disabled={disabled}
                  onChange={(v) => update(name, v)}
                />
              ) : (
                <TextInput
                  accessibilityLabel={label(name)}
                  editable={!disabled}
                  style={[
                    ui.input,
                    error && { borderColor: colors.red },
                    [
                      "content",
                      "notes",
                      "reason",
                      "bio",
                      "scopeDescription",
                      "resolution",
                    ].includes(name) && {
                      minHeight: 105,
                      textAlignVertical: "top",
                    },
                  ]}
                  value={
                    Array.isArray(value)
                      ? value.join(", ")
                      : value === undefined
                        ? ""
                        : String(value)
                  }
                  onChangeText={(v) => update(name, v)}
                  placeholder={
                    field.type === "date"
                      ? "YYYY-MM-DD"
                      : field.type === "datetime"
                        ? "YYYY-MM-DDTHH:mm:ss+07:00"
                        : field.type.endsWith("[]")
                          ? "Các mã / giá trị, ngăn cách bởi dấu phẩy"
                          : undefined
                  }
                  placeholderTextColor="#A2AEA1"
                  autoCapitalize={
                    name.toLowerCase().includes("password") ||
                    [
                      "email",
                      "identifier",
                      "selector",
                      "token",
                      "resetGrant",
                    ].includes(name)
                      ? "none"
                      : "sentences"
                  }
                  secureTextEntry={
                    name.toLowerCase().includes("password") ||
                    name === "token" ||
                    name === "resetGrant"
                  }
                  keyboardType={
                    ["money", "decimal", "integer", "id"].includes(field.type)
                      ? "decimal-pad"
                      : name === "email"
                        ? "email-address"
                        : "default"
                  }
                  multiline={[
                    "content",
                    "notes",
                    "reason",
                    "bio",
                    "scopeDescription",
                    "resolution",
                  ].includes(name)}
                  autoCorrect={false}
                />
              ))}
            {error && (
              <Text accessibilityRole="alert" style={ui.error}>
                {error}
              </Text>
            )}
            {field.type === "date" && (
              <Text style={[ui.muted, { fontSize: 10 }]}>
                Ngày theo múi giờ Việt Nam
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
