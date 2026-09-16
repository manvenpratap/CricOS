# CricOS Privacy Policy

**Effective Date:** 16 September 2026  
**Last Updated:** 16 September 2026  
**Application:** CricOS — Cricket Operating System (`com.cricos.app`)  
**Publisher:** CricOS Platform Technologies Pvt. Ltd.  
**Contact:** privacy@cricos.app  

---

## 1. Introduction
CricOS ("we", "our", or "us") provides a unified digital cricket operating system for players, team captains, scorers, tournament organisers, and turf/facility providers. We are committed to protecting your privacy in compliance with global privacy regulations, the Apple App Store Review Guidelines, and the Google Play Developer Program Policies.

---

## 2. Information We Collect
We collect only the minimum necessary information required to operate our sports management services:

1. **Account & Identity Data**:
   - Phone Number (for passwordless OTP SMS verification).
   - Display Name, Player Role (`CAPTAIN`, `PLAYER`, `SCORER`, `ORGANISER`, `PROVIDER`).
   - Profile photo (optional, stored locally or uploaded with user consent).
2. **Sporting & Match Data**:
   - Match scores, ball-by-ball deliveries, wagon wheel zones, batting and bowling figures.
   - Squad memberships, tournament standings, and verified team rosters.
3. **Commerce & Financial Data**:
   - Turf bookings, reservation time slots, payment identifiers, and invoice records.
   - All card details and banking credentials are processed directly by certified PCI-DSS Level 1 payment processors (e.g., Razorpay / Stripe). We never store raw payment instrument details.
4. **Device & Diagnostics Data**:
   - Non-identifying crash logs and performance telemetry to guarantee sub-millisecond scoring and real-time SSE stream reliability.

---

## 3. How We Use Information
- To record, broadcast, and verify official cricket match data and tournament standings.
- To prevent double-booking of turf grounds using PostgreSQL GiST temporal exclusion locking.
- To calculate fair, transparent Bayesian ratings and reputation metrics for umpires and venues.
- To provide offline outbox synchronization when network connectivity is disrupted.

---

## 4. No Third-Party Tracking or Data Selling
- **We do NOT sell personal data to data brokers or advertisers.**
- **We do NOT track users across third-party apps or websites** (Apple `NSPrivacyTracking: false`).
- Information is shared only with other participants in your match or tournament (e.g., public match scoreboards and verified team rosters).

---

## 5. In-App Account & Data Deletion (Apple Guideline 5.1.1(v) & Google Play Compliance)
You have the absolute right to delete your account and all associated personal data at any time:
- **In-App Deletion**: Navigate to `My Profile` → Tap `Delete Account & Personal Data` → Confirm prompt.
- **Immediate Effect**: Upon confirmation, your session is terminated immediately, your auth tokens are revoked, and all personal identifying records are purged from our database within 24 hours.
- **Web Portal Request**: You can also request complete data deletion by emailing privacy@cricos.app or visiting https://cricos.app/delete-account.

---

## 6. Data Security & Retention
All data in transit is encrypted using industry-standard TLS 1.3. Stored database records are isolated behind multi-tier VPC networks with strict role-based access controls. Match records are retained for historical sports statistics unless an explicit player deletion request is received.

---

## 7. Contact Us
If you have any questions regarding this Privacy Policy or your personal data:
- **Email**: privacy@cricos.app
- **Support**: support@cricos.app
- **Address**: CricOS Platform Technologies Pvt. Ltd., Ground Floor, Stadium Way, Bengaluru 560001, India.
