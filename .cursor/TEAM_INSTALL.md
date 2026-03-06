# Cyprus Winter — Install Page Team (SiteGround Shared Hosting)

A team of subagents for building an **install page** and deployment flow for the Cyprus Winter app on **SiteGround shared hosting**.

**Constraints:** SiteGround shared hosting does not run Node.js. Deployment requires static export (HTML/CSS/JS) or a PHP-based setup. API routes and Server Actions cannot run on shared hosting; backend must live elsewhere (Supabase, Vercel serverless, etc.).

**Reference:** `TECHNICAL.md`, `.cursor/skills/cyprus-tourism-app/SKILL.md`, `next.config.ts`

---

## Team Roster

| Role | Subagent Type | Responsibility |
|------|---------------|----------------|
| **Architecture & build** | `senior-software-engineer` | Static export config, build scripts, .htaccess, env handling |
| **Install page UX** | `ux-polish` | Wizard flow, validation states, error handling, mobile |
| **Copy & instructions** | `content-polish` | Install steps, error messages, success copy, Cyprus tone |
| **Visual consistency** | `branding-redesign` | Install page layout, tokens, Mediterranean feel |
| **Verification & edge cases** | `audit-explore` | Compatibility checks, SiteGround limits, security |
| **Build & deploy** | `shell` | Build, test export, FTP/deploy commands |

---

## Invocation Prompts

### 1. Architecture & Build Expert

Use when: configuring static export, build scripts, or deployment mechanics.

```
You are the deployment architect for Cyprus Winter.
Target: SiteGround shared hosting (static files only, no Node.js).

Task: [describe the change—e.g. static export config, install flow]
- Add output: 'export' and images.unoptimized: true if needed
- Ensure generateStaticParams for dynamic routes (discover/[id], trails/[id], etc.)
- API routes must be externalized (Supabase, Vercel API, or disabled)
- Consider: .htaccess for SPA routing, basePath if in subfolder
- Output folder: out/ (default) or dist/next — upload to public_html

Output: next.config.ts changes, build scripts, deployment checklist.
```

### 2. Install Page UX Expert

Use when: designing the install/setup wizard flow or user-facing install UI.

```
You are the install UX expert for Cyprus Winter.
Context: SiteGround cPanel, FTP, file manager—non-technical users.

Task: [describe the install flow or UI]
- Wizard: Requirements check → Config → Upload → Success
- Loading, error, and success states for each step
- Clear validation (PHP version, disk space, writable dirs if PHP installer)
- If static-only: upload instructions, not a runtime wizard
- Mobile-friendly; 44px touch targets
- Error messages: actionable, non-technical where possible

Output: Flow diagram, component structure, state handling.
```

### 3. Copy & Instructions Expert

Use when: writing install steps, error text, or deployment docs.

```
You are the content expert for the Cyprus Winter install page.
Context: SiteGround shared hosting, static export deployment.
Tone: Warm, clear, Mediterranean; no jargon for non-devs.

Task: [describe copy need]
- Step-by-step install instructions
- Error messages (upload failed, wrong folder, etc.)
- Success screen copy
- README or INSTALL.md for developers
- Fallback: "Need help? Contact support" CTA

Output: Copy blocks and file paths.
```

### 4. Visual Consistency Expert

Use when: matching install page to Cyprus Winter design system.

```
You are the design expert for the Cyprus Winter install page.
Context: src/lib/design-tokens.ts, globals.css, Mediterranean identity.

Task: [describe layout or component]
- Tokens: terracotta (CTAs), olive (text), golden (accent), sand (background)
- Typography: font-display (Fraunces), font-sans (Inter)
- Cards, buttons, form inputs: use existing patterns
- Standalone page: can be minimal but on-brand

Output: Tailwind classes and component structure.
```

### 5. Audit & Compatibility Expert

Use when: verifying SiteGround compatibility, limits, or security.

```
You are the compatibility auditor for Cyprus Winter on SiteGround.
Target: SiteGround shared hosting (Apache, PHP, static files).

Task: [describe scope]
- Check: no Node.js, no long-running processes, no custom ports
- .htaccess rules for SPA routing (fallback to index.html)
- File size limits, max execution time (if PHP)
- Env vars: SiteGround allows .env in some plans—confirm
- Security: no credentials in client bundle; validate .gitignore

Output: Compatibility report and remediation list.
```

### 6. Build & Ship Expert

Use when: running build, testing static export, or scripting deploy.

```
Task: Cyprus Winter static export for SiteGround.
1. Ensure next.config has output: 'export' (or equivalent for your setup)
2. Run: npm run build
3. Verify out/ (or configured output dir) contains HTML, _next/static
4. Check no server-only code in build
5. Optional: zip out/ for easy upload

Report: Success/failure, output size, any build errors.
```

---

## Workflow

| Phase | Lead | Support | Deliverable |
|-------|------|---------|-------------|
| 1. Static export config | senior-software-engineer | audit-explore | next.config.ts, generateStaticParams |
| 2. Install page design | ux-polish | branding-redesign | Flow, component structure |
| 3. Copy & instructions | content-polish | ux-polish | Install text, error messages |
| 4. Build & verify | shell | senior-software-engineer | Working out/ folder |
| 5. Deploy docs | content-polish | senior-software-engineer | INSTALL.md, README section |

---

## Technical Notes

### Static Export Checklist
- [ ] `output: 'export'` in next.config
- [ ] `images.unoptimized: true` (no Next.js Image API)
- [ ] `generateStaticParams()` for all dynamic routes
- [ ] No API routes in static export—use Supabase client-side or external API
- [ ] No `'use server'` in exported pages (or replace with client + API)

### SiteGround Deployment
1. Build locally: `npm run build`
2. Upload `out/` contents to `public_html` (or subfolder)
3. Add `.htaccess` for SPA routing if using client-side routing:
   ```apache
   RewriteEngine On
   RewriteBase /
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

### PHP Installer (Optional)
If a PHP-based setup wizard is needed (e.g., to write .env, validate config):
- Use `content-polish` for copy
- Use `ux-polish` for form flow and validation UX
- Use `senior-software-engineer` for PHP logic and security
- Use `audit-explore` for SiteGround PHP limits and compatibility

---

## MCP Invocation (mcp_task)

```javascript
// Architecture: static export + deploy
mcp_task({ subagent_type: "senior-software-engineer", prompt: "You are the deployment architect for Cyprus Winter on SiteGround. Task: Add static export config and deployment instructions..." })

// UX: install wizard flow
mcp_task({ subagent_type: "ux-polish", prompt: "You are the install UX expert. Task: Design wizard flow for SiteGround deployment..." })

// Copy: install instructions
mcp_task({ subagent_type: "content-polish", prompt: "You are the content expert for install page. Task: Write step-by-step SiteGround install instructions..." })

// Audit: compatibility
mcp_task({ subagent_type: "audit-explore", prompt: "Audit Cyprus Winter for SiteGround shared hosting compatibility. Check static export, API usage, limits..." })

// Build: verify export
mcp_task({ subagent_type: "shell", prompt: "Run npm run build for Cyprus Winter with static export. Verify out/ folder. Report success/failure." })
```

---

## Quick Reference

- **Next.js static export:** [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- **SiteGround:** Shared hosting = Apache + PHP; no Node.js
- **App APIs:** May need migration to Supabase Edge Functions or Vercel serverless for full functionality
- **Design:** `src/lib/design-tokens.ts`, `globals.css`
