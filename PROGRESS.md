# 📊 Migration Progress Tracker

**Project**: Workshop Registration Form - Google Apps Script → Vercel
**Started**: 2026-02-02
**Last Updated**: 2026-02-02
**Status**: 🟡 Planning & Documentation Phase

---

## ✅ Completed Tasks

### Phase 0: Documentation & Setup (2026-02-02)
- [x] Analyzed original Google Apps Script application
- [x] Created comprehensive CLAUDE.md with:
  - Core business logic documentation
  - Member validation algorithm (3-way matching)
  - Invoice handling (PJ/PF)
  - Google Sheets structure
  - n8n webhook integration
  - Migration architecture recommendations
  - Testing checklist
  - 5-phase implementation plan
- [x] Installed Vercel Agent Skills package
  - vercel-composition-patterns
  - vercel-react-best-practices (45+ optimization rules)
  - vercel-react-native-skills
  - web-design-guidelines
- [x] Created PROGRESS.md (this file)
- [x] Configured Vercel MCP server
  - Created `~/.config/claude-code/mcp_settings.json`
  - Using `@open-mcp/vercel` server
  - Added Vercel authentication token
  - **Action Required**: Restart Claude Code to activate MCP

---

## 🚧 Current Phase: Planning

### Decisions Needed

#### 1. Database Choice
**Options:**
- **A) Keep Google Sheets** (easier migration, minimal changes)
  - ✅ Pros: Existing data, no migration, familiar to client
  - ❌ Cons: Performance limits, API rate limits (100 req/100s)

- **B) Migrate to PostgreSQL/Supabase** (recommended for production)
  - ✅ Pros: Better performance, proper indexes, scalability
  - ❌ Cons: Data migration needed, learning curve

**👉 Next Action**: Decide on database approach before starting Phase 1

#### 2. Deployment Strategy
**Options:**
- **A) Direct Vercel deployment** (recommended)
- **B) Containerized deployment** (overkill for this project)

**👉 Recommended**: Option A - Vercel deployment

#### 3. Form State Management
**Options:**
- **A) URL-based routing** (`/registration/step-1`, `/step-2`, `/step-3`)
- **B) Client-side state only** (single route, hide/show steps)
- **C) Hybrid** (URL routing + localStorage persistence)

**👉 Recommended**: Option C - Best UX with back button support

---

## 📋 Remaining Tasks

### Phase 1: Core Infrastructure (Not Started)
- [ ] Initialize Next.js 14+ project with TypeScript
  - Command: `npm create next-app@latest`
  - Options: TypeScript ✓, ESLint ✓, Tailwind CSS ✓, App Router ✓
- [ ] Set up project structure (see CLAUDE.md)
- [ ] Configure environment variables
- [ ] Set up Google Sheets API OR database connection
- [ ] Install dependencies:
  - `googleapis` (if keeping Sheets)
  - `react-hook-form` + `zod` (form validation)
  - `axios` (HTTP client for webhooks)

### Phase 2: Member Validation (Not Started)
- [ ] Create `/lib/member-validator.ts`
- [ ] Port exact validation logic from code.gs:
  - Name normalization (lowercase, no spaces, both orders)
  - Phone normalization (digits only, substring matching)
  - Email normalization (lowercase, trim)
  - 3-way matching logic
- [ ] Write unit tests with known data from Members sheet
- [ ] Create API endpoint `/api/check-member`
- [ ] Test with Romanian characters (ă, â, î, ș, ț)

### Phase 3: Form UI (Not Started)
- [ ] Create registration page structure
- [ ] Build Step 1: Email validation component
  - Real-time member check
  - Display member/non-member status
- [ ] Build Step 2: Personal details form
  - All required fields
  - Phone validation
  - Romanian text labels
- [ ] Build Step 3: Payment & Invoice
  - Invoice type toggle (PJ/PF)
  - Conditional company fields
  - GDPR consent (required)
  - Marketing consent (optional)
  - Payment link display
- [ ] Add loading states
- [ ] Add error handling with Romanian messages
- [ ] Test responsive design (mobile-first)

### Phase 4: Submission & Integration (Not Started)
- [ ] Create `/api/submit-registration` endpoint
- [ ] Implement data write to Sheets/Database:
  - Timestamp
  - Workshop name (from config)
  - User data
  - Member status
  - Invoice type & details
  - PF defaults (CUI: "0000000000000", company: person name)
- [ ] Implement webhook integration:
  - `/lib/webhook.ts` with Basic Auth
  - Error handling (don't block registration on failure)
  - Retry logic (optional)
- [ ] Test end-to-end flow
- [ ] Verify Stripe redirect works

### Phase 5: Polish & Deploy (Not Started)
- [ ] Add loading animations
- [ ] Improve error messages
- [ ] Add form validation feedback
- [ ] Test all edge cases (see CLAUDE.md checklist)
- [ ] Set up environment variables in Vercel dashboard
- [ ] Deploy to Vercel preview
- [ ] Test production deployment
- [ ] Update DNS (if custom domain)
- [ ] Monitor initial usage
- [ ] Set up Vercel Analytics (optional)

---

## 🔑 Critical Information

### Original Google Apps Script Details

**Sheet ID**: `1doznv9U9oT1pA_MJwVrNPYA-9sK6Ap7VMWphOJgD14A`

**Sheet Tabs**:
1. "Configurare Workshop" - Config (keys: WORKSHOP_NAME, LINK_PLATA_MEMBRU, LINK_PLATA_STANDARD, WEBHOOK_URL)
2. "Membri" - Members list (columns: Prenume, Nume, Companie, Email, Telefon)
3. "Inscrieri" - Registrations (14 columns, see CLAUDE.md)

**n8n Webhook**:
- URL: `https://youprotect.app.n8n.cloud/webhook/83507047-9b65-4640-8453-a6657a5bd037`
- Auth: Basic (User: `BIZZ.CLUB-SM`, Pass: `BizzClub!2026Safe`)

**Stripe Links**:
- Member: `https://buy.stripe.com/fZu00ifCQ8TkgLLbR05ZC0a`
- Standard: `https://buy.stripe.com/eVqcN4cqE2uWeDD9IS5ZC0b`

### Vercel MCP Configuration

**MCP Config Location**: `~/.config/claude-code/mcp_settings.json`

**Status**: ✅ Configured with authentication token

**MCP Server**: `@open-mcp/vercel` (runs via npx)

**⚠️ Next Action**: Restart Claude Code to activate MCP connection

**Available Commands** (after restart):

- Deploy to Vercel
- View deployment logs
- Manage environment variables
- List projects and deployments

### Business Logic Reminders

1. **Member Validation = 3-way matching**:
   - Name + Phone OR
   - Name + Email OR
   - Email + Phone OR
   - Email alone (fallback)

2. **PF Invoice Defaults**:
   - Company Name → Person's full name
   - CUI → `"0000000000000"` (13 zeros)

3. **Webhook Failure** = Don't block registration success

4. **Romanian Characters** = Must work in all fields (ă, â, î, ș, ț)

---

## 🎯 Next Steps (When Resuming)

### If Starting Fresh
1. Review CLAUDE.md for full context
2. Review decisions needed (Database choice)
3. Run: `npm create next-app@latest`
4. Follow Phase 1 checklist

### If Continuing Mid-Phase
1. Check which phase is current
2. Review completed tasks in that phase
3. Continue with next unchecked task
4. Update this file when completing tasks

### If Debugging
1. Check "Critical Information" section
2. Review business logic reminders
3. Consult CLAUDE.md testing checklist
4. Verify Romanian character handling

---

## 📝 Notes & Issues

### Open Questions
- [ ] Does client prefer keeping Google Sheets or migrating to database?
- [ ] Is custom domain needed for Vercel deployment?
- [ ] Should we add email notifications on registration?
- [ ] Analytics/monitoring requirements?

### Known Issues
- None yet (project not started)

### Future Enhancements (Post-Migration)
- [ ] Admin dashboard for viewing registrations
- [ ] Export registrations to CSV/Excel
- [ ] Email confirmations after registration
- [ ] SMS confirmations (optional)
- [ ] Multi-language support (currently Romanian only)
- [ ] Payment confirmation webhook handler
- [ ] Duplicate submission prevention

---

## 🔄 Update Instructions

**When completing a task:**
1. Change `[ ]` to `[x]` in the relevant checklist
2. Update "Last Updated" date at the top
3. Move completed phase to "Completed Tasks" section
4. Update "Current Phase" if changing phases
5. Add any notes/issues encountered

**When resuming after context loss:**
1. Read "Current Phase" section
2. Review "Critical Information"
3. Check last unchecked task in current phase
4. Continue from there

---

## 📚 Related Files

- [CLAUDE.md](CLAUDE.md) - Full project documentation and guidance
- [/.agents/skills/](/.agents/skills/) - Vercel best practices skills
- Original files (for reference):
  - `code.gs` - Backend logic (Google Apps Script)
  - `index.html` - Frontend form (Google Apps Script)

---

**⚠️ Important**: Always update this file when making progress. It's the source of truth for project status.
