# Workshop Registration - Next.js Application

Aplicație modernă de înregistrare la workshop-uri, construită cu Next.js 16, TypeScript, și Tailwind CSS.

## 🎯 Features

- ✅ **Multi-Workshop Architecture** - Scalabilă pentru multiple evenimente
- ✅ **3-Step Registration Form** - Email check → Detalii → Plată/Factură
- ✅ **Member Validation** - Algoritm 3-way matching (name+phone, name+email, email+phone)
- ✅ **Google Sheets Integration** - Citire membri și salvare înregistrări
- ✅ **n8n Webhook** - Notificări automate (non-blocking)
- ✅ **Stripe Payment** - Redirect automat la plată după înregistrare
- ✅ **PJ/PF Invoice Handling** - Support pentru persoane juridice și fizice
- ✅ **Romanian Language** - UI complet în limba română
- ✅ **Responsive Design** - Optimizat pentru mobile și desktop

## 🚀 Quick Start

### 1. Setup Google Service Account

**CRITICAL**: Vezi [GOOGLE-SETUP.md](./GOOGLE-SETUP.md) pentru ghid complet.

Rezumat:
1. Creează Google Cloud Project
2. Activează Google Sheets API
3. Creează Service Account și descarcă JSON key
4. Copiază credentials în `.env.local`
5. Share Google Sheet-ul cu service account email

### 2. Configurează Environment Variables

```bash
# Copiază template
cp .env.example .env.local

# Editează .env.local și completează:
# - GOOGLE_SERVICE_ACCOUNT_EMAIL
# - GOOGLE_PRIVATE_KEY
```

### 3. Instalează Dependencies

```bash
npm install
```

### 4. Pornește Development Server

```bash
npm run dev
```

Deschide [http://localhost:3000](http://localhost:3000) → Redirecționează automat la `/bizz-club-sm/registration`

## 📁 Project Structure

```
src/
├── app/
│   ├── [workshopSlug]/
│   │   └── registration/
│   │       └── page.tsx          # Dynamic registration form
│   ├── api/
│   │   ├── check-member/         # Member validation endpoint
│   │   ├── submit-registration/  # Registration submission
│   │   └── workshop/[slug]/      # Workshop config endpoint
│   └── page.tsx                  # Home (redirects to default workshop)
│
├── config/
│   └── workshops.ts              # Multi-workshop configuration
│
├── lib/
│   ├── sheets/
│   │   └── client.ts             # Google Sheets API client
│   ├── validation/
│   │   └── memberValidator.ts    # 3-way member validation
│   └── webhook/
│       └── client.ts             # n8n webhook client
│
└── types/
    └── workshop.ts               # TypeScript interfaces
```

## 🔧 Configuration

### Add New Workshop

Editează `src/config/workshops.ts`:

```typescript
export const WORKSHOPS: Record<string, WorkshopConfig> = {
  'workshop-slug': {
    id: 'unique-id',
    slug: 'workshop-slug',
    name: 'Workshop Display Name',
    googleSheetId: 'YOUR_SHEET_ID',
    stripeLinks: {
      member: 'https://buy.stripe.com/...',
      standard: 'https://buy.stripe.com/...',
    },
    webhookUrl: 'https://your-webhook-url',
    active: true,
  },
};
```

URL-ul va fi: `/workshop-slug/registration`

### Google Sheets Structure

Fiecare workshop trebuie să aibă 3 tab-uri:

1. **"Configurare Workshop"** (opțional - sau hardcodat în config)
   - KEY | VALUE
   - WORKSHOP_NAME | ...
   - LINK_PLATA_MEMBRU | ...
   - LINK_PLATA_STANDARD | ...

2. **"Membri"** (necesar pentru validare)
   - Prenume | Nume | Companie | Email | Telefon

3. **"Inscrieri"** (se creează automat dacă nu există)
   - Timestamp | Workshop | Nume | Email | Telefon | ...

## 🧪 Testing

### Test Member Validation

1. Adaugă un membru în tab-ul "Membri" din Google Sheet
2. Accesează formularul: http://localhost:3000/bizz-club-sm/registration
3. Introdu email-ul membrului → Ar trebui să vezi "Bun venit înapoi!"
4. Introdu email necunoscut → "Bun venit! Continuă cu înregistrarea."

### Test Complete Flow

1. **Step 1**: Email check ✓
2. **Step 2**: Completează date personale ✓
3. **Step 3**:
   - Selectează PF → Auto-completează CUI cu "0000000000000"
   - Selectează PJ → Cere Nume Firmă și CUI
4. Bifează GDPR consent ✓
5. Submit → Redirectează la Stripe payment link

### Verify Data

Check Google Sheet tab "Inscrieri" - ar trebui să vezi noua înregistrare.

## 📦 Build & Deploy

### Local Build

```bash
npm run build
npm run start
```

### Deploy to Vercel

#### Option 1: Automatic (GitHub Integration)

```bash
git push origin main
```

Vercel detectează push-ul și face deploy automat.

#### Option 2: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Environment Variables în Vercel

Settings → Environment Variables → Add:

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `N8N_WEBHOOK_USER`
- `N8N_WEBHOOK_PASS`
- (Plus toate variabilele pentru workshop-uri)

**IMPORTANT**: Setează pentru Production, Preview, și Development.

## 🛠️ Development

### Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Form**: React Hook Form + Zod
- **API Integration**:
  - googleapis (Google Sheets)
  - fetch (n8n webhooks, Stripe redirects)

## 📚 Documentation

- [GOOGLE-SETUP.md](./GOOGLE-SETUP.md) - Google Service Account setup guide
- [../CLAUDE.md](../CLAUDE.md) - Full project documentation (business logic, migration plan)
- [../PROGRESS.md](../PROGRESS.md) - Migration progress tracker
- [../VERCEL-SETUP.md](../VERCEL-SETUP.md) - Vercel deployment guide

## 🔐 Security

- ❌ NU face commit la `.env.local` (e în .gitignore)
- ❌ NU partaja JSON key file-ul public
- ✅ Folosește Vercel Environment Variables pentru production
- ✅ Webhook-urile folosesc Basic Auth
- ✅ GDPR consent obligatoriu pentru înregistrare

## 📝 Business Logic

### Member Validation (3-Way Matching)

Ordinea de verificare:
1. **Name + Phone** (normalizat)
2. **Name + Email** (normalizat)
3. **Email + Phone**
4. **Email alone** (fallback)

Normalizări:
- **Name**: lowercase, fără spații, "FirstLast" + "LastFirst"
- **Phone**: doar cifre, substring matching (pentru country codes)
- **Email**: lowercase, trim

### PF vs PJ Invoices

- **PF** (Persoană Fizică):
  - Nume Firmă = Nume persoană
  - CUI = "0000000000000" (13 zerouri)

- **PJ** (Persoană Juridică):
  - Nume Firmă = introdus de utilizator
  - CUI = introdus de utilizator

## 🐛 Troubleshooting

Vezi [GOOGLE-SETUP.md](./GOOGLE-SETUP.md) secțiunea Troubleshooting.

## 📄 License

Internal use only - BIZZ.CLUB Satu Mare

---

**Production URL**: https://formular.bizzclub-satumare.app

**GitHub**: https://github.com/ciprix-yp/workshop-registration-migration
