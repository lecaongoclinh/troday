import type { RecordValue } from "../api/types";
export type FeatureKey =
  | "discover"
  | "favorites"
  | "chats"
  | "viewings"
  | "contracts"
  | "invoices"
  | "roommates"
  | "profile"
  | "dashboard"
  | "properties"
  | "services"
  | "listings"
  | "residents"
  | "verifications"
  | "moderation"
  | "templates"
  | "reports"
  | "users"
  | "audit"
  | "notifications"
  | "connections"
  | "changes"
  | "files";
export type RootStackParamList = {
  Main: undefined;
  Feature: { feature: FeatureKey };
  Resource: {
    endpointId: number;
    params: Record<string, string>;
    title: string;
    kind?: string;
  };
  Operation: {
    endpointId: number;
    params?: Record<string, string>;
    initial?: RecordValue;
    etag?: string;
    createOnly?: boolean;
    title?: string;
  };
  Auth: { mode?: "login" | "register" | "reset" } | undefined;
  Connection: undefined;
  Upload: undefined;
};
