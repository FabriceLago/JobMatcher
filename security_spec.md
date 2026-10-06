# Security Specification & Invariants (Job Matcher Swiss Multi-Tenant)

## 1. Data Invariants

1. **User Isolation (Multi-Tenancy)**:
   - A user can ONLY read, create, update, and delete documents under their own user path (`/users/{userId}/**` where `request.auth.uid == userId`).
   - Cross-user data access is strictly forbidden (zero-trust tenancy).

2. **Attribute Integrity**:
   - The user ID in the document payload must match `request.auth.uid`.
   - String sizes and array lengths must be strictly bounded to prevent resource exhaustion attacks.
   - Timestamps must not be arbitrarily spoofed.

3. **Global Safety Net**:
   - Default deny catch-all `match /{document=**} { allow read, write: if false; }`.
   - No blanket `allow read: if isSignedIn();` queries.

---

## 2. The "Dirty Dozen" Payloads

1. **Foreign User Write (Tenant Spoofing)**:
   - Attacker `user_B` writes into `/users/user_A/profiles/main`.
   - Expected: `PERMISSION_DENIED`.

2. **Unauthenticated Read**:
   - Anonymous unauthenticated client calls `get(/users/user_A)`.
   - Expected: `PERMISSION_DENIED`.

3. **Cross-Tenant Job Snooping**:
   - `user_B` tries to list `/users/user_A/jobs`.
   - Expected: `PERMISSION_DENIED`.

4. **Resource Exhaustion String Injection (Denial of Wallet)**:
   - Document ID with > 128 characters or invalid characters.
   - Expected: `PERMISSION_DENIED`.

5. **Payload with 500KB summary field**:
   - Payload containing `summary` exceeding 50,000 characters.
   - Expected: `PERMISSION_DENIED`.

6. **Ghost Admin Escalation**:
   - User updates profile attempting to set `isAdmin: true` or `role: "admin"`.
   - Expected: `PERMISSION_DENIED`.

7. **Root Collection Injection**:
   - Attacker creates document in top-level `/system_config` or `/admin`.
   - Expected: `PERMISSION_DENIED`.

8. **Tampering with other users' tailored dossier**:
   - `user_B` attempts to overwrite `motivationLetter` in `user_A`'s job dossier.
   - Expected: `PERMISSION_DENIED`.

9. **Null Auth Deletion**:
   - Unauthenticated DELETE call to `/users/{userId}/jobs/{jobId}`.
   - Expected: `PERMISSION_DENIED`.

10. **Query Scraping Without Owner Match**:
    - Querying all jobs across all users without scoping `where('userId', '==', request.auth.uid)`.
    - Expected: `PERMISSION_DENIED`.

11. **Client Timestamp Spoofing**:
    - Setting fake historical creation dates to bypass trial logic.
    - Expected: Validated through user state control.

12. **Malformed ID Path Traversal**:
    - Injecting path traversal `../` inside document ID.
    - Expected: `PERMISSION_DENIED`.
