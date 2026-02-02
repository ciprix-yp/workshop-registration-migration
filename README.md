# Workshop Registration - Google Apps Script → Vercel Migration

Migrarea aplicației de înscriere la workshop de la Google Apps Script la Next.js + Vercel.

## 📚 Documentație Esențială

- **[CLAUDE.md](CLAUDE.md)** - Documentație tehnică completă pentru Claude Code
  - Arhitectura aplicației originale
  - Logica de business critică (validare membri, facturare, webhook-uri)
  - Recomandări pentru migrare
  - Comenzi de dezvoltare
  - Checklist testare

- **[PROGRESS.md](PROGRESS.md)** - Tracker progres migrare
  - Status curent al proiectului
  - Task-uri completate și rămase
  - Decizii care trebuie luate
  - Informații critice (credentials, structuri)
  - Instrucțiuni pentru continuare după context loss

## 🚀 Quick Start

### Pregătire

1. **Review documentația**:
   ```bash
   cat CLAUDE.md    # Înțelege arhitectura și business logic
   cat PROGRESS.md  # Vezi statusul și next steps
   ```

2. **Alege baza de date**:
   - **Opțiune A**: Păstrează Google Sheets (mai rapid)
   - **Opțiune B**: Migrează la PostgreSQL/Supabase (recomandat producție)

3. **Activează Vercel MCP**:
   - ⚠️ **Restart Claude Code** pentru a încărca configurația MCP
   - După restart: deployment direct din conversație

### Inițializare Proiect

```bash
# Creează proiect Next.js
npm create next-app@latest workshop-registration

# Opțiuni recomandate:
# ✓ TypeScript
# ✓ ESLint
# ✓ Tailwind CSS
# ✓ App Router
# ✓ Import alias (@/*)

# Navighează în proiect
cd workshop-registration

# Instalează dependențe
npm install react-hook-form zod
npm install googleapis  # Dacă păstrezi Google Sheets
# SAU
npm install @supabase/supabase-js  # Dacă migrezi la Supabase

# Start development
npm run dev
```

## 📋 Faze de Migrare

### ✅ Faza 0: Documentație & Setup
- [x] Analiza aplicației Google Apps Script
- [x] CLAUDE.md creat
- [x] PROGRESS.md creat
- [x] Vercel Agent Skills instalate
- [x] Vercel MCP configurat
- [x] **În așteptare**: Restart Claude Code pentru MCP

### 🔄 Faza 1: Infrastructură Core (Next)
- [ ] Inițializare Next.js + TypeScript
- [ ] Setup structură proiect
- [ ] Configurare environment variables
- [ ] Conexiune Google Sheets / Database

### 🔄 Faza 2: Validare Membri
- [ ] Port logică validare (3-way matching)
- [ ] Unit tests
- [ ] API endpoint `/api/check-member`

### 🔄 Faza 3: UI Formular
- [ ] Step 1: Email + verificare membru
- [ ] Step 2: Detalii personale
- [ ] Step 3: Plată + Factură (PJ/PF)

### 🔄 Faza 4: Integrări
- [ ] Google Sheets / Database write
- [ ] n8n webhook (Basic Auth)
- [ ] Stripe payment routing

### 🔄 Faza 5: Deploy
- [ ] Testing complet
- [ ] Environment variables în Vercel
- [ ] Deploy la Vercel
- [ ] Monitoring

## 🔑 Informații Critice

### Business Logic Esențial

**Validare Membri** (3-way matching):
- Name + Phone SAU
- Name + Email SAU
- Email + Phone SAU
- Email alone (fallback)

**Facturare PF vs PJ**:
- **PF** (Persoană Fizică): Company = Nume persoană, CUI = `"0000000000000"`
- **PJ** (Persoană Juridică): Company + CUI din formular

### Integrări

**Google Sheets**:
- ID: `1doznv9U9oT1pA_MJwVrNPYA-9sK6Ap7VMWphOJgD14A`
- Tab-uri: "Configurare Workshop", "Membri", "Inscrieri"

**n8n Webhook**:
- URL: `https://youprotect.app.n8n.cloud/webhook/83507047-9b65-4640-8453-a6657a5bd037`
- Auth: Basic (`BIZZ.CLUB-SM` / `BizzClub!2026Safe`)

**Stripe**:
- Member link: `https://buy.stripe.com/fZu00ifCQ8TkgLLbR05ZC0a`
- Standard link: `https://buy.stripe.com/eVqcN4cqE2uWeDD9IS5ZC0b`

## 🛠️ Tools Instalate

### Vercel Agent Skills
- `vercel-composition-patterns` - Component patterns
- `vercel-react-best-practices` - 45+ reguli optimizare React
- `vercel-react-native-skills` - React Native development
- `web-design-guidelines` - Web design best practices

### MCP Servers
- `@open-mcp/vercel` - Vercel deployment și management
  - **Status**: Configurat cu token ✅
  - **Acțiune**: Restart Claude Code pentru activare

## 📖 Comenzi Utile

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build pentru producție
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript check

# Testing (după setup)
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Vercel (după MCP activation)
vercel                   # Deploy preview
vercel --prod            # Deploy production
vercel logs              # View logs
```

## 🤝 Contribuție

Pentru continuarea migrării:
1. Consultă **PROGRESS.md** pentru task-uri rămase
2. Verifică **CLAUDE.md** pentru detalii tehnice
3. Actualizează **PROGRESS.md** după fiecare task completat
4. Folosește Vercel Agent Skills pentru best practices

## 📝 Notes

- **Limba**: Română (toate mesajele către utilizatori)
- **Caractere speciale**: Testează cu ă, â, î, ș, ț
- **Webhook**: Nu bloca registration dacă webhook fail
- **CUI format**: 13 zerouri pentru PF, text format în Sheets

---

**Status Proiect**: 🟡 Faza 0 Completată - Pregătit pentru Faza 1

**Ultimă Actualizare**: 2026-02-02

**Next Step**: Restart Claude Code → Decide database → Initialize Next.js
