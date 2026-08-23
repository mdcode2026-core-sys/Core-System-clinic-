# PJ Stage 12 — Implementation Status

## Implemented

- Reusable entitlement/capability foundation.
- Patient identity and clinic relationship model.
- Tenant-scoped patient RLS.
- Clinic-initiated portal invitation lifecycle.
- Email/SMS/WhatsApp channel model with entitlement and fallback configuration.
- Patient Portal activation using passwordless authentication.
- Patient profile view.
- Patient-scoped upcoming appointments.
- Explicit medical-file release boundary.
- Secure medical-file access using short-lived signed URLs.
- Advanced Patient Experience entitlement gate.
- Secure patient messaging when the advanced entitlement is active.
- Audit-ready invitation, identity, release and messaging records.
- Storage and tenant-isolation boundaries.

## Commercial boundary

Current subscription plan names are not referenced by Stage 12 runtime logic. Future Super Admin/license catalog configuration will assign entitlements and capabilities.

## Production verification

The Vercel production build for the latest implementation is required to reach READY before Stage 12 is considered production-ready. Supabase migrations are applied in production and recorded with matching repository migration versions.

## Explicitly deferred

Native mobile apps, cross-clinic sharing, final subscription catalog/pricing, Super Admin UI, and broader platform-wide entitlement migration for legacy modules remain separate future work.
