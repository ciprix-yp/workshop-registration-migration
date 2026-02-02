# Google Sheets API Setup Guide

Pentru ca aplicația să funcționeze, trebuie să configurezi Google Sheets API și să obții credentials.

## Pași de Configurare

### 1. Creează Google Cloud Project

1. Mergi la [Google Cloud Console](https://console.cloud.google.com/)
2. Click pe **"Select a project"** → **"New Project"**
3. Nume proiect: **"Workshop Registration"**
4. Click **"Create"**

### 2. Activează Google Sheets API

1. În meniul lateral: **"APIs & Services"** → **"Library"**
2. Caută **"Google Sheets API"**
3. Click pe rezultat → **"Enable"**

### 3. Creează Service Account

1. În meniul lateral: **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"Service Account"**
3. Completează:
   - **Service account name**: workshop-registration
   - **Service account ID**: (se completează automat)
   - **Description**: Service account for workshop registration app
4. Click **"Create and Continue"**
5. **Role**: Skip (nu e necesar pentru Sheets)
6. Click **"Continue"** apoi **"Done"**

### 4. Generează JSON Key

1. Click pe service account-ul creat (workshop-registration@...)
2. Tab **"Keys"**
3. **"Add Key"** → **"Create new key"**
4. Selectează **JSON**
5. Click **"Create"**
6. Fișierul JSON se descarcă automat ✅

### 5. Extrage Credentials din JSON

Deschide fișierul JSON descărcat și extrage:

```json
{
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "workshop-registration@project-id.iam.gserviceaccount.com",
  ...
}
```

### 6. Configurează .env.local

Copiază valorile în [.env.local](./env.local):

```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=workshop-registration@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

**IMPORTANT**:
- `private_key` trebuie între ghilimele duble
- Păstrează `\n` în text (new line characters)
- Nu elimina `-----BEGIN PRIVATE KEY-----` și `-----END PRIVATE KEY-----`

### 7. Share Google Sheet cu Service Account

Pentru ca aplicația să acceseze Google Sheet-ul:

1. Deschide Google Sheet-ul: [BIZZ.CLUB Workshop](https://docs.google.com/spreadsheets/d/1doznv9U9oT1pA_MJwVrNPYA-9sK6Ap7VMWphOJgD14A)
2. Click **"Share"** (buton din dreapta sus)
3. Adaugă email-ul service account-ului:
   ```
   workshop-registration@project-id.iam.gserviceaccount.com
   ```
4. Setează permisiuni: **Editor** ✅
5. Click **"Send"**

## Verificare Setup

După configurare, testează aplicația:

```bash
cd workshop-registration
npm run dev
```

Deschide [http://localhost:3000](http://localhost:3000)

Dacă vezi formularul de înregistrare → **Setup funcționează!** ✅

## Troubleshooting

### Error: "The caller does not have permission"

**Cauză**: Service account nu are acces la Google Sheet

**Fix**: Verifică că ai făcut Share la Sheet cu email-ul corect

### Error: "Invalid key format"

**Cauză**: `GOOGLE_PRIVATE_KEY` nu e formatat corect

**Fix**:
- Asigură-te că ai copiat tot key-ul (inclusiv BEGIN/END)
- Păstrează `\n` în text
- Pune key-ul între ghilimele duble

### Error: "Service account email not found"

**Cauză**: Email-ul service account-ului e greșit

**Fix**: Verifică email-ul în Google Cloud Console → Service Accounts

## Security

⚠️ **IMPORTANT**:
- **NU** face commit la `.env.local` în Git (e deja în `.gitignore`)
- **NU** partaja JSON key file-ul public
- Pentru Vercel, adaugă credentials în **Environment Variables** (Settings → Environment Variables)

## Next Steps

După setup:
1. ✅ Testează local: `npm run dev`
2. ✅ Verifică member validation
3. ✅ Testează înregistrare completă
4. ✅ Deploy la Vercel cu environment variables configurate
