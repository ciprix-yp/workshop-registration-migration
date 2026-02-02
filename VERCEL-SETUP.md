# Vercel Setup Instructions

## Custom Domain Configuration

**Target Domain**: `formular.bizzclub-satumare.app`

### Step 1: Connect GitHub Repository to Vercel

1. Mergi la: <https://vercel.com/new>

2. **Import Git Repository**:
   - Click "Import Git Repository"
   - Autentifică-te cu GitHub (dacă nu ești)
   - Selectează: `ciprix-yp/workshop-registration-migration`
   - Click "Import"

3. **Configure Project**:
   - **Project Name**: `workshop-registration-migration`
   - **Framework Preset**: Other (deocamdată - va fi Next.js mai târziu)
   - **Root Directory**: `./`
   - **Build Command**: (lasă gol)
   - **Output Directory**: (lasă gol)
   - **Install Command**: (lasă gol)

4. **Environment Variables**: Skip for now (vom adăuga mai târziu)

5. **Deploy**: Click "Deploy"
   - **NOTĂ**: Deployment-ul va eșua (normal - nu e cod Next.js încă)
   - Scopul este să conectăm repo-ul pentru deployment automat

### Step 2: Configure Custom Domain

După ce deployment-ul inițial s-a terminat (chiar dacă a eșuat):

1. **Mergi la Settings**:
   - În dashboard-ul proiectului tău
   - Click pe tab-ul "Settings"

2. **Domains Section**:
   - Scroll la "Domains"
   - Click "Add Domain"

3. **Add Custom Domain**:
   - Introdu: `formular.bizzclub-satumare.app`
   - Click "Add"

4. **Verifică DNS Settings**:
   Vercel îți va arăta ce înregistrări DNS trebuie configurate:

   **Opțiunea A - CNAME (Recomandat)**:
   ```
   Type:  CNAME
   Name:  formular
   Value: cname.vercel-dns.com
   ```

   **SAU Opțiunea B - A Record**:
   ```
   Type:  A
   Name:  formular
   Value: 76.76.21.21
   ```

### Step 3: Configure DNS (la Furnizorul de Domeniu)

Mergi la furnizorul de domeniu `bizzclub-satumare.app` și adaugă:

1. **Dacă folosești CNAME** (recomandat):
   ```
   Tip:    CNAME
   Host:   formular
   Target: cname.vercel-dns.com
   TTL:    3600 (sau Auto)
   ```

2. **Dacă DNS nu suportă CNAME pentru subdomenii, folosește A Record**:
   ```
   Tip:    A
   Host:   formular
   Target: 76.76.21.21
   TTL:    3600
   ```

3. **Salvează** și așteaptă propagarea DNS (poate dura până la 48h, de obicei 5-30 min)

### Step 4: Verificare

1. **În Vercel Dashboard**:
   - După ce DNS s-a propagat, Vercel va verifica automat
   - Când vezi "Valid Configuration" ✓, domeniul este activ

2. **Test Manual**:
   ```bash
   # Test DNS propagare
   nslookup formular.bizzclub-satumare.app

   # SAU
   dig formular.bizzclub-satumare.app
   ```

3. **HTTPS Automatic**:
   - Vercel va genera automat certificat SSL (Let's Encrypt)
   - Poate dura 1-2 minute după validarea DNS

### Step 5: Git Integration Settings

După configurarea domain-ului:

1. **Mergi la Settings → Git**

2. **Production Branch**:
   - Verifică că `main` este production branch
   - Toggle ON: "Automatically deploy new commits"

3. **Preview Deployments**:
   - Toggle ON: "Enable preview deployments for all branches"
   - Fiecare PR va avea propriul URL de preview

## Environment Variables (Pentru Viitor)

Când vei avea cod Next.js, va trebui să adaugi:

**Settings → Environment Variables**:

```env
# Google Sheets (dacă păstrezi Sheets)
GOOGLE_SHEET_ID=1doznv9U9oT1pA_MJwVrNPYA-9sK6Ap7VMWphOJgD14A
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@...
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...

# n8n Webhook
N8N_WEBHOOK_URL=https://youprotect.app.n8n.cloud/webhook/...
N8N_WEBHOOK_USER=BIZZ.CLUB-SM
N8N_WEBHOOK_PASS=BizzClub!2026Safe

# Stripe Links (sau din Sheets config)
STRIPE_MEMBER_LINK=https://buy.stripe.com/fZu00ifCQ8TkgLLbR05ZC0a
STRIPE_STANDARD_LINK=https://buy.stripe.com/eVqcN4cqE2uWeDD9IS5ZC0b
```

**NOTĂ**: Bifează "Production", "Preview", "Development" pentru fiecare variabilă.

## Deployment Workflow (După Setup)

Odată configurat totul:

1. **Development**:
   ```bash
   git checkout -b feature/new-feature
   # lucrezi pe cod
   git commit -m "Add feature"
   git push origin feature/new-feature
   ```
   → Vercel va crea preview deployment automat

2. **Production**:
   ```bash
   git checkout main
   git merge feature/new-feature
   git push origin main
   ```
   → Deployment automat pe `formular.bizzclub-satumare.app`

## Troubleshooting

### Domain nu se validează?

1. Verifică DNS:
   ```bash
   dig formular.bizzclub-satumare.app
   ```

2. Așteaptă propagarea (până la 48h, de obicei 30 min)

3. Verifică că nu ai alte înregistrări care intră în conflict

### Deployment eșuat?

1. Check logs în Vercel Dashboard → Deployments → Click pe deployment → Logs

2. După ce adaugi cod Next.js, deployment-ul ar trebui să reușească

### HTTPS nu funcționează?

1. Vercel generează automat certificat SSL
2. Durează 1-2 minute după validarea DNS
3. Verifică în Settings → Domains că vezi "✓ Valid Configuration"

## Quick Links

- **Vercel Dashboard**: <https://vercel.com/dashboard>
- **Project Settings**: `https://vercel.com/[your-project]/settings`
- **GitHub Repo**: <https://github.com/ciprix-yp/workshop-registration-migration>
- **Production URL** (după config): <https://formular.bizzclub-satumare.app>

---

**Last Updated**: 2026-02-02
