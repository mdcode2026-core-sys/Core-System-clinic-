import { adminMessages } from "./adminMessages";
import { authMessages } from "./authMessages";
import { queueMessages } from "./queueMessages";
import { kioskMessages } from "./kioskMessages";

type Primitive = string | number | boolean | null | undefined;
type SameShape<A, B> = A extends Primitive ? (B extends Primitive ? true : false) : B extends Primitive ? false : A extends readonly unknown[] ? (B extends readonly unknown[] ? true : false) : B extends readonly unknown[] ? false : A extends object ? B extends object ? Exclude<keyof A, keyof B> extends never ? Exclude<keyof B, keyof A> extends never ? false extends { [K in keyof A & keyof B]: SameShape<A[K], B[K]> }[keyof A & keyof B] ? false : true : false : false : false;

type AllParity = SameShape<typeof adminMessages.ar, typeof adminMessages.en> & SameShape<typeof authMessages.ar, typeof authMessages.en> & SameShape<typeof queueMessages.ar, typeof queueMessages.en> & SameShape<typeof kioskMessages.ar, typeof kioskMessages.en>;
const catalogsHaveParity: AllParity = true;
export { catalogsHaveParity };
