# Xchange — Privacy Policy (DPDP Act 2023 Compliant Draft — v0.0)

**Effective Date:** November 2026  
**Applicable Jurisdiction:** Republic of India (Bengaluru Launch Cluster)  
**Document ID:** P0-T6-PRIVACY

## 1. Purpose & Data Fiduciary Notice
Xchange ("we", "our", "the Platform") operates a peer-to-peer local item exchange marketplace. Under the **Digital Personal Data Protection Act, 2023 (DPDP Act)**, Xchange acts as the Data Fiduciary for personal data collected strictly to facilitate item listing, discovery, 2-way/3-way barter matching, and safe in-person handovers.

## 2. Personal Data We Collect & Purpose Limitation
1. **Phone Number (E.164) & Optional Email:** Collected for OTP authentication, account recovery, and critical trade security alerts. Stored encrypted at rest using application-level AES-256-GCM encryption and never displayed to other users.
2. **Coarse Neighbourhood Location (~1 km Grid):** Your exact GPS coordinates or home address are **never** stored publicly or shared in the DOM/API. Locations are snapped to an approximate 1 km neighbourhood grid cell (e.g., HSR Layout Sector 2, Koramangala 4th Block) solely to compute swap proximity and suggest public safe meetup points.
3. **Listings, Photos & Trade Events:** Photos have EXIF GPS metadata stripped automatically upon upload before CDN distribution.
4. **Device & Session Metadata:** Refresh token hashes, device platform, and push notification tokens to allow session management and "Logout Everywhere" (`FR-AUTH-4`).

## 3. Your Rights as a Data Principal (DPDP Act Section 11–14)
- **Right to Access & Data Export (`FR-AUTH-5`):** Request a machine-readable JSON export of your profile, listings, offers, trades, and reviews via `POST /v1/me/export` or Settings.
- **Right to Correction & Erasure (`DELETE /v1/me`):** Delete your account at any time. Active listings are immediately removed, pending offers are withdrawn, and PII is purged or anonymised except where immutable trade audit logs are required for fraud prevention.
- **Right to Withdraw Consent:** Manage analytics (PostHog) and notification preferences at `/settings`.
- **Grievance Redressal:** Contact our Grievance Officer at `privacy-grievance@xchange.in`. We acknowledge all complaints within 24 hours and resolve them within 15 days.
