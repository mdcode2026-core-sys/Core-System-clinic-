// src/domain/overrides/index.ts
// M2.4 — Permission Overrides domain barrel export

export * from "./overrides.types";
export * from "./overrides.queries";
export { setPermissionOverride, removePermissionOverride } from "./overrides.actions";
