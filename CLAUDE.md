# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Migration Project**: Workshop Registration Form from Google Apps Script to Vercel

This repository contains a workshop registration system originally built on Google Apps Script. The application handles member validation, multi-step registration forms, Stripe payment routing, and n8n webhook integration.

### Original System (Google Apps Script)
- **Backend**: Google Apps Script (code.gs)
- **Frontend**: HTML template with embedded CSS/JS
- **Storage**: Google Sheets (3 tabs: Config, Members, Registrations)
- **Language**: Romanian
- **Payment**: Stripe (two-tier pricing: member vs standard)

## Core Business Logic

### 1. Member Validation Algorithm
The most critical business logic is the **3-way member validation system**:

```javascript
// Member identified if ANY of these conditions match:
// 1. Name (normalized) + Phone match
// 2. Name (normalized) + Email match
// 3. Email + Phone match
// 4. Fallback: Email exact match
```

**Name Normalization**:
- Convert to lowercase
- Remove all spaces
- Check both "FirstLast" and "LastFirst" combinations
- Compare against both "Prenume+Nume" and "Nume+Prenume" from Members sheet

**Phone Normalization**:
- Strip all non-digits
- Check if either phone contains the other (handles country codes)

**Critical**: This logic must be preserved exactly in any migration.

### 2. Invoice Type Handling (PJ/PF)

**PJ (Legal Entity)**:
- Requires: Company Name, CUI (tax ID)
- Uses provided values directly

**PF (Individual)**:
- Company Name = Person's full name
- CUI = "0000000000000" (13 zeros, stored with leading apostrophe in Sheets to force text format)

### 3. Payment Routing Logic

Member status determines payment link:
- **Member**: Uses `LINK_PLATA_MEMBRU` from config
- **Non-Member**: Uses `LINK_PLATA_STANDARD` from config

Both are Stripe payment links configured in the "Configurare Workshop" sheet.

### 4. Google Sheets Structure

**Sheet: "Configurare Workshop"** (or similar name with "membri" substring)
```
KEY                    | VALUE
-----------------------------------------
WORKSHOP_NAME          | Workshop BIZZ.CLUB Satu Mare
LINK_PLATA_MEMBRU      | https://buy.stripe.com/...
LINK_PLATA_STANDARD    | https://buy.stripe.com/...
WEBHOOK_URL            | https://youprotect.app.n8n.cloud/webhook/...
```

**Sheet: "Membri"** (or "membrii", "members")
```
Prenume | Nume | Companie | Email | Telefon
```

**Sheet: "Inscrieri"** (Registrations)
```
Timestamp | Workshop | Nume | Email | Telefon | Provocare |
Rezultat | Nivel | Factura | Nume Firma | CUI | GDPR |
Marketing | Status Membru | Suma
```

### 5. Webhook Integration

**Endpoint**: n8n webhook (configured in Sheets)

**Authentication**: Basic Auth
- Username: `BIZZ.CLUB-SM`
- Password: `BizzClub!2026Safe`

**Payload Structure**:
```json
{
  "timestamp": "ISO-8601",
  "workshop": "Workshop Name",
  "data": { /* form fields */ },
  "memberStatus": "Membru" | "Non-Membru",
  "paymentSum": "Pret Membru" | "Pret Standard",
  "invoice": {
    "type": "PJ" | "PF",
    "company": "string",
    "cui": "string"
  }
}
```

**Error Handling**: Webhook failures must NOT block user registration success.

## Migration Architecture Recommendations

### Technology Stack (Recommended)

**Framework**: Next.js 14+ (App Router)
- Native Vercel optimization
- API routes for backend
- Server components for SEO
- TypeScript for type safety

**Database Options**:
1. **Keep Google Sheets** (easiest migration)
   - Use `googleapis` npm package
   - Minimal business logic changes
   - Service account authentication

2. **Migrate to PostgreSQL/Supabase** (recommended for production)
   - Better performance
   - Proper indexes for member lookup
   - Row-level security
   - Real-time subscriptions

**Styling**: Keep existing inline CSS initially, then migrate to Tailwind CSS

**Form Management**: React Hook Form + Zod validation

### Project Structure (Next.js)

```
/app
  /api
    /check-member/route.ts      # Member validation endpoint
    /submit-registration/route.ts # Form submission
  /registration
    /page.tsx                    # Main registration page
    /components
      /Step1Email.tsx
      /Step2Details.tsx
      /Step3Payment.tsx
/lib
  /google-sheets.ts              # Google Sheets API wrapper
  /member-validator.ts           # Ported validation logic
  /webhook.ts                    # n8n webhook client
/types
  /registration.ts               # TypeScript interfaces
```

### Environment Variables (Vercel)

```bash
# Google Sheets (if keeping Sheets)
GOOGLE_SHEET_ID=1doznv9U9oT1pA_MJwVrNPYA-9sK6Ap7VMWphOJgD14A
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY=...

# Or Database (if migrating)
DATABASE_URL=postgresql://...

# n8n Webhook
N8N_WEBHOOK_URL=https://youprotect.app.n8n.cloud/webhook/...
N8N_WEBHOOK_USER=BIZZ.CLUB-SM
N8N_WEBHOOK_PASS=BizzClub!2026Safe

# Stripe (from config sheet or env)
# Note: These can stay in Sheets if maintaining config tab
STRIPE_MEMBER_LINK=...
STRIPE_STANDARD_LINK=...
```

## Development Commands

### Initial Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with actual values

# Run development server
npm run dev
```

### Development
```bash
# Start dev server (http://localhost:3000)
npm run dev

# Run type checking
npm run type-check

# Run linter
npm run lint

# Format code
npm run format
```

### Testing
```bash
# Run all tests
npm test

# Run specific test file
npm test member-validator.test.ts

# Test with coverage
npm run test:coverage
```

### Deployment
```bash
# Deploy to Vercel (production)
vercel --prod

# Deploy preview
vercel

# Check deployment logs
vercel logs
```

## Critical Migration Considerations

### 1. Member Validation Accuracy
**Must preserve exact matching logic**:
- Test against existing Members sheet data
- Verify name normalization handles Romanian characters (ă, â, î, ș, ț)
- Ensure phone number variations work (with/without country code)

### 2. Concurrency & Data Integrity
Original uses `LockService` for concurrent writes. In Vercel:
- Use database transactions (if migrating off Sheets)
- Consider rate limiting on API routes
- Implement optimistic locking if needed

### 3. Romanian Language Support
- Maintain all Romanian text exactly
- Ensure UTF-8 encoding throughout
- Test special characters in names/companies

### 4. Auto-Creation Logic
Original auto-creates missing sheets. Migration options:
- Keep this behavior (if using Sheets)
- Create database migrations (if using DB)
- Use seed data for initial setup

### 5. Form State Management
Original is single-page with step hiding. Consider:
- URL-based routing per step (/registration/step-1)
- Client-side state persistence (localStorage)
- Back button handling

### 6. Error Handling
- Graceful degradation if webhook fails
- User-friendly Romanian error messages
- Logging for debugging (Vercel logs or external service)

## Testing Checklist

### Member Validation
- [ ] Email exact match
- [ ] Name + email match
- [ ] Name + phone match
- [ ] Email + phone match
- [ ] Name with spaces vs without
- [ ] Name in FirstLast and LastFirst order
- [ ] Phone with/without country code
- [ ] Romanian character handling (ă, â, î, ș, ț)
- [ ] Non-member correctly routed

### Registration Flow
- [ ] Step 1: Email validation and member check
- [ ] Step 2: All fields required validation
- [ ] Step 3: PJ invoice fields conditional
- [ ] Step 3: PF defaults (name → company, CUI → 13 zeros)
- [ ] GDPR consent required
- [ ] Marketing consent optional
- [ ] Final submission success

### Integration
- [ ] Data written to correct sheet/table
- [ ] Webhook sends with correct auth
- [ ] Webhook failure doesn't block registration
- [ ] Stripe link correct based on membership
- [ ] CUI formatted with leading apostrophe (Sheets only)

### Edge Cases
- [ ] Duplicate email submission
- [ ] Concurrent submissions
- [ ] Invalid phone numbers
- [ ] Missing config values
- [ ] Sheet/table not found

## Key Files to Understand

### Original Implementation
Reference the provided Google Apps Script files:

**code.gs**:
- `checkMemberStatus(userData)`: Member validation logic (lines ~90-160)
- `processForm(formObject)`: Registration handling (lines ~180-240)
- `sendWebhook(url, payload)`: n8n integration (lines ~250-280)
- `getAppConfig()`: Config sheet reading with auto-creation (lines ~40-80)

**index.html**:
- Step 1 form: Email + member check (search for `checkEmail()`)
- Step 2 form: Personal details (search for `showStep2()`)
- Step 3 form: Payment + invoice (search for `showStep3()`)
- Invoice toggle logic (search for `invoiceNeeded`)

### Migration Priority Order
1. **Phase 1**: Core infrastructure
   - Next.js setup
   - Environment configuration
   - Google Sheets API connection (or DB setup)

2. **Phase 2**: Member validation
   - Port validation logic exactly
   - Unit tests against known data
   - API endpoint creation

3. **Phase 3**: Form UI
   - Build 3-step form
   - Client-side validation
   - State management

4. **Phase 4**: Submission & Integration
   - Registration API endpoint
   - Google Sheets write (or DB insert)
   - Webhook integration

5. **Phase 5**: Polish & Deploy
   - Error handling
   - Loading states
   - Romanian text verification
   - Vercel deployment

## Additional Notes

### Performance Considerations
- Member validation on every Step 1 submission: Consider caching if high traffic
- Google Sheets API rate limits: 100 requests/100 seconds (consider batching or DB migration)

### Security
- Never expose Google service account keys in client code
- Use Vercel environment variables for secrets
- Validate all user input server-side
- Sanitize data before Sheets/DB write

### Localization
Current app is Romanian-only. For future expansion:
- Extract all strings to constants
- Consider i18n library (next-intl)
- Maintain Romanian as default

### Monitoring
- Set up Vercel Analytics
- Log webhook failures
- Monitor member validation accuracy
- Track conversion rates (registration → payment)
