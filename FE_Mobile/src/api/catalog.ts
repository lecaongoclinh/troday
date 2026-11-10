import raw from "./contract.json";
import type { Endpoint, FieldSpec, Role } from "./types";
export const endpoints = raw.endpoints as Endpoint[];
export const schemas = raw.schemas as Record<string, FieldSpec[]>;
export const groups = raw.groups;
export function endpoint(id: number | string): Endpoint {
  const key =
    typeof id === "number" ? `API-${String(id).padStart(3, "0")}` : id;
  const value = endpoints.find((e) => e.id === key);
  if (!value) throw new Error(`Unknown contract: ${key}`);
  return value;
}
export function allowed(
  e: Endpoint,
  roles: string[],
  selected: Role | "guest",
) {
  if (e.access === "PUBLIC") return true;
  if (!roles.length) return false;
  if (e.access.startsWith("USER:")) return true;
  return (
    selected !== "guest" &&
    roles.some((r) => r.toLowerCase() === selected) &&
    e.access.includes(selected.toUpperCase())
  );
}
export function pathKeys(e: Endpoint) {
  return [...e.path.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
}
