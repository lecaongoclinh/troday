import { Platform } from "react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import type { ApiClient } from "../../api/client";
import { endpoint } from "../../api/catalog";
import { residentsCsv } from "../../../../shared/api/csv.ts";

export async function downloadResidents(client: ApiClient) {
    const result = await client.request(endpoint(116));
    const content = residentsCsv(result.data);
    if (Platform.OS === "web") {
        const blob = new Blob([content], { type: "text/csv;charset=utf-8" }),
            url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "residents.csv";
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else {
        const target = new File(Paths.cache, "residents.csv");
        target.create({ overwrite: true });
        target.write(content);
        if (await Sharing.isAvailableAsync())
            await Sharing.shareAsync(target.uri, {
                mimeType: "text/csv",
                UTI: "public.comma-separated-values-text",
            });
        else throw new Error("Thiết bị chưa hỗ trợ chia sẻ tệp.");
    }
}
