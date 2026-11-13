import type { FeatureKey } from "../navigation/types";
import { endpoints } from "../api/catalog";
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
export const blockedOperations: Record<string, string> = Object.fromEntries(
    endpoints
        .filter((e) => e.blockedReason)
        .map((e) => [e.id, e.blockedReason!]),
);
