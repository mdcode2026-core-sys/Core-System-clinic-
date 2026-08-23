# ADR-012 — Patient Portal Identity, Entitlements, and Activation

**Status:** Accepted / Implemented in Stage 12 foundation

## Decisions

1. Patient Portal is one product with two commercial layers:
   - `patient_portal` — included capability for eligible subscriptions.
   - `patient_experience.advanced` — optional paid add-on.
2. Current subscription plan names are not part of the implementation contract. Runtime access is capability/entitlement based.
3. Platform access follows:

```text
License / Subscription
        ↓
Entitlements
        ↓
Capabilities
        ↓
Permissions
        ↓
Access
```

4. Feature flags remain a technical activation layer and are not a replacement for commercial entitlements.
5. A patient is not a clinic user and does not receive a clinic staff role.
6. A CORE patient identity can be related to multiple clinics in the future, while each clinic relationship remains tenant-scoped.
7. Cross-clinic data visibility is not granted by identity linkage. Future sharing must be explicit, consented, scoped, and auditable.
8. Patient Portal is a responsive web/PWA experience for Stage 12; native mobile apps are out of scope.
9. Clinic-initiated activation uses a short-lived, single-purpose invitation token. The patient then authenticates with the same email/phone destination used by the invitation.
10. Activation channels are entitlement-controlled and configurable: Email, SMS, and WhatsApp, with optional fallback. Channel cost and packaging remain commercial configuration for the future Super Admin/license catalog.
11. Medical files are not duplicated for the portal. Portal access is to the existing clinic-scoped records after authorization.
12. Storage quota is not consumed merely by creating a portal identity. Patient uploads, when enabled by the advanced experience capability, consume normal tenant storage.

## Security boundaries

- Invitation tokens are stored hashed.
- Invitation expiry is one hour by default.
- Invitation claim requires authenticated identity matching the invited destination.
- Patient RLS is based on `patient_identities` and `patient_clinic_relationships`, not on clinic staff tenant context alone.
- Clinic staff permissions remain separate from patient authorization.
- No PHI is embedded in invitation tokens or invitation message text.

## Implementation boundary

Stage 12 establishes the reusable entitlement/capability foundation and the patient portal identity/activation foundation. The future Super Admin UI and final commercial subscription catalog are intentionally separate work.
