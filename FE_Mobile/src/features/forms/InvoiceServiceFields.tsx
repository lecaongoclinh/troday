import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import type { InvoiceLine, InvoicePreview, MeterInput } from "../../../../shared/api/invoice-preview.ts";
import { invoiceServiceTotal } from "../../../../shared/api/invoice-preview.ts";
import { colors, ui } from "../../theme";
import { money } from "../../utils/format";

export function InvoiceServiceFields({
    preview, payerId, onPayer, readings, onReading, lines, disabled,
}: {
    preview: InvoicePreview;
    payerId?: string;
    onPayer: (id: string) => void;
    readings: Record<string, MeterInput>;
    onReading: (serviceId: string, field: keyof MeterInput, value: string) => void;
    lines: (InvoiceLine | undefined)[];
    disabled: boolean;
}) {
    return <View style={{ gap: 14 }}>
        <Text style={ui.text}>Người thanh toán</Text>
        <View style={[ui.row, { flexWrap: "wrap", gap: 8 }]}>
            {preview.payers.map(payer => <Pressable key={payer.id} accessibilityRole="radio"
                accessibilityState={{ selected: payerId === payer.id }} disabled={disabled}
                style={[ui.input, payerId === payer.id && { borderColor: colors.teal }]} onPress={() => onPayer(payer.id)}>
                <Text style={ui.text}>{payer.name}</Text>
            </Pressable>)}
        </View>
        <View style={ui.between}>
            <Text style={ui.text}>Tiền phòng</Text>
            <Text style={ui.text}>{money(preview.rentAmount)}</Text>
        </View>
        {preview.services.map((service, index) => {
            const line = lines[index];
            const value = readings[service.roomServiceId] ?? {};
            const meter = service.calculationMethod === "METERED";
            const entry = (field: keyof MeterInput, title: string) => <View style={{ gap: 5 }}>
                <Text style={ui.muted}>{title}</Text>
                <TextInput accessibilityLabel={`${title} · ${service.name}`} keyboardType="decimal-pad"
                    editable={!disabled} value={value[field] ?? ""} style={ui.input}
                    onChangeText={text => onReading(service.roomServiceId, field, text)} />
            </View>;
            return <View key={service.roomServiceId} style={[ui.card, { gap: 8 }]}>
                <View style={ui.between}>
                    <Text style={ui.text}>{service.name}</Text>
                    <Text style={ui.text}>{line ? money(invoiceServiceTotal([line])) : "Chờ chỉ số"}</Text>
                </View>
                <Text style={ui.muted}>{money(service.unitPrice)} / {service.unit}{line ? ` · Số lượng ${line.quantity}` : ""}</Text>
                {meter && (service.previousReading == null ? entry("previousReading", "Chỉ số đầu")
                    : <Text style={ui.muted}>Chỉ số đầu từ kỳ trước {service.previousReading}</Text>)}
                {meter && entry("currentReading", "Chỉ số cuối")}
                {meter && value.currentReading && !line && <Text accessibilityRole="alert" style={ui.error}>
                    Kiểm tra chỉ số đầu và cuối. Chỉ số cuối phải từ chỉ số đầu trở lên.
                </Text>}
            </View>;
        })}
    </View>;
}
