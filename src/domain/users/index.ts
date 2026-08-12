// src/domain/users/index.ts
// M2.3 — User Management domain barrel export

export * from "./users.types";
export * from "./users.queries";
export { createClinicUser, updateClinicUser, toggleClinicUserActive } from "./users.actions";
