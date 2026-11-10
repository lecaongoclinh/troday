import type { FeatureKey } from "../navigation/types";
// Feature services use the supplied endpoint definitions as the single transport contract.
// These groups also make all documented operations discoverable without duplicating URLs.
export const featureGroups: Partial<Record<FeatureKey, string[]>> = {
  discover: ["posts"],
  favorites: ["posts"],
  chats: ["messages"],
  viewings: ["viewings"],
  contracts: ["contracts", "changes", "residents"],
  invoices: ["billing"],
  roommates: ["roommates"],
  connections: ["roommates"],
  profile: ["account"],
  properties: ["property"],
  services: ["billing"],
  listings: ["posts"],
  residents: ["residents"],
  verifications: ["account", "property"],
  moderation: ["posts", "moderation"],
  templates: ["moderation"],
  reports: ["moderation"],
  users: ["moderation"],
  audit: ["moderation"],
};
export const blockedOperations: Record<string, string> = {
  "API-018":
    "Transport refresh token trên React Native chưa chốt; phải đăng nhập lại.",
  "API-067": "Giá trị criteria[] cần hợp đồng JSON cụ thể.",
  "API-090":
    "SSE cần transport native và replay policy đã xác nhận. Chat hiện tải lại khi mở và mỗi 15 giây trong foreground.",
  "API-113": "Luồng nhập hợp đồng giấy chưa chốt thành viên/transaction (D11).",
};
