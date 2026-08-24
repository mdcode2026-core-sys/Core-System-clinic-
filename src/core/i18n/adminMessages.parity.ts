import { adminMessages } from "./adminMessages";

type Primitive = string | number | boolean | null | undefined;
type SameShape<A, B> = A extends Primitive ? (B extends Primitive ? true : false) : B extends Primitive ? false : A extends readonly unknown[] ? (B extends readonly unknown[] ? true : false) : B extends readonly unknown[] ? false : A extends object ? B extends object ? Exclude<keyof A, keyof B> extends never ? Exclude<keyof B, keyof A> extends never ? { [K in keyof A & keyof B]: SameShape<A[K], B[K]> }[keyof A & keyof B] extends false ? false : true : false : false : false;

type AdminCatalogParity = SameShape<typeof adminMessages.ar, typeof adminMessages.en>;
const adminCatalogParity: AdminCatalogParity = true;

export { adminCatalogParity };
