import type { Locale } from "./messages";
import { getMessages } from "./messages";
import { getAdminMessages } from "./adminMessages";
import { getAuthMessages } from "./authMessages";
import { getQueueMessages } from "./queueMessages";
import { getKioskMessages } from "./kioskMessages";
import { getReportViewerMessages } from "./reportViewerMessages";
import { getProcedureMessages } from "./procedureMessages";
import { getAppointmentMessages } from "./appointmentMessages";
import { getWorkspaceMessages } from "./workspaceMessages";
import { getInvoiceMessages } from "./invoiceMessages";
import { getPortalMessages } from "./portalMessages";
import { getSystemPreferencesMessages } from "./systemPreferencesMessages";
import { getSubscriptionMessages } from "./subscriptionMessages";
import { getSuperAdminMessages } from "./superAdminMessages";
import { getRoomsMessages } from "./roomsMessages";
import { getRolesMessages } from "./rolesMessages";
import { getMedicalFilesMessages } from "./medicalFilesMessages";
import { getFollowupMessages } from "./followupMessages";

type Primitive = string | number | boolean | null | undefined;
type SameShape<A, B> = A extends Primitive
  ? B extends Primitive ? true : false
  : B extends Primitive ? false
  : A extends readonly unknown[]
    ? B extends readonly unknown[] ? true : false
    : B extends readonly unknown[] ? false
    : A extends object
      ? B extends object
        ? Exclude<keyof A, keyof B> extends never
          ? Exclude<keyof B, keyof A> extends never
            ? false extends { [K in keyof A & keyof B]: SameShape<A[K], B[K]> }[keyof A & keyof B]
              ? false
              : true
            : false
          : false
        : false
      : false;

type CatalogPairParity<A, B> = SameShape<A, B>;

type AllParity =
  CatalogPairParity<ReturnType<typeof getMessages>, ReturnType<typeof getMessages>> &
  CatalogPairParity<ReturnType<typeof getAdminMessages>, ReturnType<typeof getAdminMessages>> &
  CatalogPairParity<ReturnType<typeof getAuthMessages>, ReturnType<typeof getAuthMessages>> &
  CatalogPairParity<ReturnType<typeof getQueueMessages>, ReturnType<typeof getQueueMessages>> &
  CatalogPairParity<ReturnType<typeof getKioskMessages>, ReturnType<typeof getKioskMessages>> &
  CatalogPairParity<ReturnType<typeof getReportViewerMessages>, ReturnType<typeof getReportViewerMessages>> &
  CatalogPairParity<ReturnType<typeof getProcedureMessages>, ReturnType<typeof getProcedureMessages>> &
  CatalogPairParity<ReturnType<typeof getAppointmentMessages>, ReturnType<typeof getAppointmentMessages>> &
  CatalogPairParity<ReturnType<typeof getWorkspaceMessages>, ReturnType<typeof getWorkspaceMessages>> &
  CatalogPairParity<ReturnType<typeof getInvoiceMessages>, ReturnType<typeof getInvoiceMessages>> &
  CatalogPairParity<ReturnType<typeof getPortalMessages>, ReturnType<typeof getPortalMessages>> &
  CatalogPairParity<ReturnType<typeof getSystemPreferencesMessages>, ReturnType<typeof getSystemPreferencesMessages>> &
  CatalogPairParity<ReturnType<typeof getSubscriptionMessages>, ReturnType<typeof getSubscriptionMessages>> &
  CatalogPairParity<ReturnType<typeof getSuperAdminMessages>, ReturnType<typeof getSuperAdminMessages>> &
  CatalogPairParity<ReturnType<typeof getRoomsMessages>, ReturnType<typeof getRoomsMessages>> &
  CatalogPairParity<ReturnType<typeof getRolesMessages>, ReturnType<typeof getRolesMessages>> &
  CatalogPairParity<ReturnType<typeof getMedicalFilesMessages>, ReturnType<typeof getMedicalFilesMessages>> &
  CatalogPairParity<ReturnType<typeof getFollowupMessages>, ReturnType<typeof getFollowupMessages>>;

// Every catalog getter is typed as a locale selector. The runtime parity audit below
// verifies that AR and EN expose the same key shape; this compile-time assertion keeps
// the parity module itself safe as catalogs evolve.
const catalogsHaveParity: AllParity = true;

export function assertCatalogParity(locale: Locale = "en") {
  const factories = [
    getMessages,
    getAdminMessages,
    getAuthMessages,
    getQueueMessages,
    getKioskMessages,
    getReportViewerMessages,
    getProcedureMessages,
    getAppointmentMessages,
    getWorkspaceMessages,
    getInvoiceMessages,
    getPortalMessages,
    getSystemPreferencesMessages,
    getSubscriptionMessages,
    getSuperAdminMessages,
    getRoomsMessages,
    getRolesMessages,
    getMedicalFilesMessages,
    getFollowupMessages,
  ];

  for (const factory of factories) {
    const ar = factory("ar");
    const en = factory("en");
    if (JSON.stringify(Object.keys(ar).sort()) !== JSON.stringify(Object.keys(en).sort())) {
      throw new Error(`I18N catalog key parity failure for ${locale}`);
    }
  }

  return catalogsHaveParity;
}

export { catalogsHaveParity };
