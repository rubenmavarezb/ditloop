# DitLoop — TUI Mockups v1

## Concepto
Terminal IDE centrado en Developer In The Loop para developers que trabajan en múltiples proyectos.
Comando: `ditloop`

---

## 1. HOME — Sidebar persistente + Main area

El sidebar SIEMPRE está visible (como Codex). Muestra workspaces con sus
tasks/threads agrupados. El main area muestra el contenido del item seleccionado.

El sidebar es la columna vertebral de ditloop — nunca desaparece.

### 1a. Vista inicial (welcome)

```
╔════════════════════════════╦═════════════════════════════════════════════╗
║  ◉ ditloop           v0.1 ║                                             ║
╠════════════════════════════╣                                             ║
║                            ║                                             ║
║  🟢 Pivotree               ║                                             ║
║    #042 Fix auth token  1d ║                                             ║
║    #043 Add unit tests  1d ║                                             ║
║    #044 Update docs     3d ║             ◉                               ║
║                            ║                                             ║
║  🟡 Solu                   ║         Welcome back, Ruben.                ║
║    ● #015 Migrate Pris… now║         Today: 3 completed, 1 running       ║
║    ✓ #014 Fix webhook  12m ║                                             ║
║                            ║                                             ║
║  ⚪ OnyxOdds               ║    ┌─────────────┐ ┌────────────────┐       ║
║    (no active tasks)       ║    │ 📋 New task  │ │ 💬 Start chat  │       ║
║                            ║    │ Create a     │ │ Ask anything   │       ║
║  ⚪ Personal               ║    │ scoped task  │ │ about your     │       ║
║    (no active tasks)       ║    │ with DoD     │ │ codebase       │       ║
║                            ║    └─────────────┘ └────────────────┘       ║
║                            ║                                             ║
║  + Add workspace           ║    ┌──────────────┐ ┌───────────────┐       ║
║                            ║    │ 📁 Files      │ │ 🔀 Git status │       ║
║                            ║    │ Explore the   │ │ See changes   │       ║
║                            ║    │ directory     │ │ and commit    │       ║
║                            ║    └──────────────┘ └───────────────┘       ║
║                            ║                                             ║
║ ─────────────────────────  ║                                             ║
║  ⚙ Settings               ║  ▸ pivotree-commerce                  ▾     ║
║                            ║  Ask ditloop anything, / for commands...  ⏎ ║
╠════════════════════════════╩═════════════════════════════════════════════╣
║  ↑↓ navigate  enter select  c chat  g git  f files  m mission ctrl     ║
╚═════════════════════════════════════════════════════════════════════════╝
```

### 1b. Sidebar con task seleccionada → detalle en main area

```
╔════════════════════════════╦═════════════════════════════════════════════╗
║  ◉ ditloop           v0.1 ║  #042 — Fix auth token refresh              ║
╠════════════════════════════╣  ─────────────────────────────────────────  ║
║                            ║                                             ║
║  🟢 Pivotree               ║  Status:    pending                         ║
║  ❯ #042 Fix auth token  1d ║  Scope:     src/auth/**                     ║
║    #043 Add unit tests  1d ║  Provider:  claude-cli                      ║
║    #044 Update docs     3d ║  Mode:      strict                          ║
║                            ║  Profile:   pivotree                        ║
║  🟡 Solu                   ║                                             ║
║    ● #015 Migrate Pris… now║  Description:                               ║
║    ✓ #014 Fix webhook  12m ║  The auth token refresh flow doesn't check  ║
║                            ║  if the token is expired before attempting   ║
║  ⚪ OnyxOdds               ║  to refresh, causing 401 errors on the      ║
║    (no active tasks)       ║  first request after token expiry.          ║
║                            ║                                             ║
║  ⚪ Personal               ║  Definition of Done:                        ║
║    (no active tasks)       ║  □ Token expiry check added                 ║
║                            ║  □ Tests passing                            ║
║                            ║  □ No regression in login flow              ║
║  + Add workspace           ║                                             ║
║                            ║  Files:                                     ║
║                            ║   allowed:   src/auth/**                    ║
║                            ║   forbidden: src/auth/secrets.ts            ║
║                            ║                                             ║
║ ─────────────────────────  ║                                             ║
║  ⚙ Settings               ║  ▸ pivotree-commerce                  ▾     ║
║                            ║  Ask ditloop anything, / for commands...  ⏎ ║
╠════════════════════════════╩═════════════════════════════════════════════╣
║  r run  e edit  c chat about this  d delete  ← back                     ║
╚═════════════════════════════════════════════════════════════════════════╝
```

### 1c. Sidebar con task corriendo → execution en main area (REAL-TIME)

Cuando una task está corriendo, el output se actualiza en tiempo real.
El sidebar muestra el indicador ● animado junto a la task activa.

```
╔════════════════════════════╦═════════════════════════════════════════════╗
║  ◉ ditloop           v0.1 ║  #042 Fix auth token             RUNNING ● ║
╠════════════════════════════╣  ─────────────────────────────────────────  ║
║                            ║                                             ║
║  🟢 Pivotree               ║  ██████████░░░░░░░░  iter 3/10    1m 42s   ║
║    ● #042 Fix auth tok… now║  tokens: 12.4k  cost: $0.08                ║
║    #043 Add unit tests  1d ║                                             ║
║    #044 Update docs     3d ║  ─────────────────────────────────────────  ║
║                            ║                                             ║
║  🟡 Solu                   ║  [iter 2] ✓ Tests: 17/17 passing            ║
║    ● #015 Migrate Pris… now║  [iter 2] ✓ Auto-committed: "test: add     ║
║    ✓ #014 Fix webhook  12m ║    token expiry edge cases"                 ║
║                            ║  ──────────────────────────────────────     ║
║  ⚪ OnyxOdds               ║  [iter 3] Evaluating Definition of Done...  ║
║                            ║  [iter 3] ✓ Token expiry check added        ║
║  ⚪ Personal               ║  [iter 3] ✓ Tests passing                   ║
║                            ║  [iter 3] ◻ Verifying no regression...      ║
║                            ║  [iter 3] Running: npm run test:e2e         ║
║  + Add workspace           ║  ▌                                          ║
║                            ║                                             ║
║                            ║                                             ║
║                            ║                                             ║
║ ─────────────────────────  ║                                             ║
║  ⚙ Settings               ║  ▸ pivotree-commerce                  ▾     ║
║                            ║  Ask ditloop anything, / for commands...  ⏎ ║
╠════════════════════════════╩═════════════════════════════════════════════╣
║  p pause  s stop  d diff  c chat  ← back (runs in bg)                   ║
╚═════════════════════════════════════════════════════════════════════════╝
```

### 1d. Chat en main area (sidebar siempre visible)

```
╔════════════════════════════╦═════════════════════════════════════════════╗
║  ◉ ditloop           v0.1 ║  💬 Chat · Pivotree                         ║
╠════════════════════════════╣  ─────────────────────────────────────────  ║
║                            ║                                             ║
║  🟢 Pivotree               ║  you  ¿dónde se maneja el refresh del      ║
║    #042 Fix auth token  1d ║       auth token?                           ║
║    #043 Add unit tests  1d ║                                             ║
║    #044 Update docs     3d ║   ai  En src/auth/token-manager.ts línea   ║
║    💬 Chat              now ║       42, método refreshToken(). El flujo: ║
║                            ║                                             ║
║  🟡 Solu                   ║       1. Recibe el token actual             ║
║    ● #015 Migrate Pris… now║       2. Llama authClient.refresh()         ║
║    ✓ #014 Fix webhook  12m ║       3. Retorna el nuevo AuthToken         ║
║                            ║                                             ║
║  ⚪ OnyxOdds               ║       El problema: NO verifica si el        ║
║                            ║       token está expirado antes de          ║
║  ⚪ Personal               ║       intentar el refresh.                  ║
║                            ║                                             ║
║                            ║  you  ok, creame un task para fixear eso    ║
║  + Add workspace           ║                                             ║
║                            ║   ai  ┌─ Task created ──────────────────┐  ║
║                            ║       │ #045 Fix token expiry check     │  ║
║                            ║       │ Scope: src/auth/**              │  ║
║                            ║       │ Run this task? [Y/n]            │  ║
║ ─────────────────────────  ║       └─────────────────────────────────┘  ║
║  ⚙ Settings               ║  ▸ pivotree-commerce                  ▾     ║
║                            ║  Type message...                        ⏎  ║
╠════════════════════════════╩═════════════════════════════════════════════╣
║  /task  /diff  /files  /clear                          esc back to tasks║
╚═════════════════════════════════════════════════════════════════════════╝
```

Nota: El chat aparece como un item en el sidebar debajo de las tasks del
workspace, igual que Codex muestra threads bajo cada proyecto.

### Sidebar features:
- **Siempre visible** — nunca desaparece, es la navegación principal
- **Real-time indicators** — ● pulsa cuando una task está corriendo
- **Cross-workspace** — ves TODOS tus proyectos y sus tasks de un vistazo
- **Collapsable** — `ctrl+b` para toggle sidebar on/off (ganar espacio)
- **Tiempo relativo** — "now", "12m", "1d", "3w" (como Codex)
- **Chat threads** — aparecen bajo el workspace como items navegables

### Indicadores de estado en sidebar:
- 🟢 Tiene tasks pendientes (hay trabajo por hacer)
- 🟡 Tiene tasks corriendo (algo está ejecutándose)
- ⚪ Sin actividad
- 🔴 Task bloqueada o fallida (necesita atención)
- ● (cyan, animado) Task corriendo ahora mismo
- ✓ (dim) Task completada
- 💬 Chat thread activo

---

## 2. WORKSPACE VIEW — Dentro de un proyecto

Al seleccionar un workspace. Split vertical: tasks a la izquierda, detalle a la derecha.

```
╔══════════════════════════════════════════════════════════════════════════╗
║  ◉ ditloop ❯ Pivotree                    ruben.mavarez@pivotree.com    ║
╠═══════════════════════════╦══════════════════════════════════════════════╣
║  TASKS                    ║  TASK DETAIL                               ║
║  ─────────────────────    ║  ──────────────────────────────────────     ║
║                           ║                                            ║
║  Pending                  ║  #042 — Fix auth token refresh             ║
║  ❯ #042 Fix auth token    ║                                            ║
║    #043 Add unit tests    ║  Status:   pending                         ║
║    #044 Update docs       ║  Scope:    src/auth/**                     ║
║                           ║  Provider: claude-cli                      ║
║  Running                  ║  Mode:     strict                          ║
║    (none)                 ║                                            ║
║                           ║  Description:                              ║
║  Completed today          ║  The auth token refresh flow doesn't       ║
║  ✓ #041 Refactor API      ║  check if the token is expired before      ║
║  ✓ #040 Fix CORS issue    ║  attempting to refresh, causing 401        ║
║                           ║  errors on the first request after         ║
║                           ║  token expiry.                             ║
║                           ║                                            ║
║                           ║  Files:                                    ║
║                           ║   allowed: src/auth/**                     ║
║                           ║   forbidden: src/auth/secrets.ts           ║
║                           ║                                            ║
║                           ║  Definition of Done:                       ║
║                           ║  □ Token expiry check added                ║
║                           ║  □ Tests passing                           ║
║                           ║  □ No regression in login flow             ║
║                           ║                                            ║
╠═══════════════════════════╩══════════════════════════════════════════════╣
║  r run task   n new task   e edit   ← back   / filter   q quit         ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 3. EXECUTION VIEW — Task corriendo

Cuando se lanza una task. Split: progreso arriba, output en vivo abajo.

```
╔══════════════════════════════════════════════════════════════════════════╗
║  ◉ ditloop ❯ Pivotree ❯ #042 Fix auth token          RUNNING ●        ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                        ║
║  Progress     ████████████░░░░░░░░░░  iteration 3/10   elapsed 1m 42s  ║
║  Tokens       input: 12.4k   output: 3.2k   cost: $0.08               ║
║  Scope        2 files modified   0 violations                          ║
║                                                                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║  LIVE OUTPUT                                                           ║
║  ──────────────────────────────────────────────────────────────────     ║
║                                                                        ║
║  [iter 1] Reading src/auth/login.ts...                                 ║
║  [iter 1] Reading src/auth/token-manager.ts...                         ║
║  [iter 1] Analysis: token expiry is not checked in refreshToken()      ║
║  [iter 1] ✎ Editing src/auth/token-manager.ts (line 45-62)             ║
║  [iter 1] Added isTokenExpired() check before refresh call             ║
║  [iter 1] ✓ Scope validation passed                                    ║
║  [iter 1] Running: npm test                                            ║
║  [iter 1] ✓ Tests: 14/14 passing                                       ║
║  [iter 1] ✓ Auto-committed: "fix: add token expiry check"             ║
║  ───────────────────────────────────────────────────────────────        ║
║  [iter 2] Reading test coverage report...                              ║
║  [iter 2] Coverage for token-manager.ts: 72% → adding edge cases      ║
║  [iter 2] ✎ Editing src/auth/__tests__/token-manager.test.ts           ║
║  [iter 2] Added 3 test cases for edge scenarios                        ║
║  [iter 2] Running: npm test                                            ║
║  [iter 2] ✓ Tests: 17/17 passing                                       ║
║  [iter 2] ✓ Auto-committed: "test: add token expiry edge cases"       ║
║  ───────────────────────────────────────────────────────────────        ║
║  [iter 3] Evaluating Definition of Done...                             ║
║  [iter 3] ✓ Token expiry check added                                   ║
║  [iter 3] ✓ Tests passing                                              ║
║  [iter 3] ◻ Verifying no regression in login flow...                   ║
║  [iter 3] Running: npm run test:e2e -- --grep "login"                  ║
║  ▌                                                                     ║
║                                                                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║  p pause   s stop   d diff   l full log   ← back (runs in bg)         ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 4. APPROVAL PROMPT — Developer In The Loop

Cuando el agente necesita decisión humana. Overlay modal sobre la execution view.

```
╔══════════════════════════════════════════════════════════════════════════╗
║  ◉ ditloop ❯ Pivotree ❯ #042 Fix auth token          WAITING ◉        ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                        ║
║  Progress     ████████████████░░░░░░  iteration 5/10   elapsed 3m 12s  ║
║                                                                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║  LIVE OUTPUT                                                           ║
║  ──────────────────────────────────────────────────────────────────     ║
║  [iter 4] ✓ All tests passing (17/17)                                  ║
║  [iter 4] ✓ E2E login tests passing                                    ║
║  [iter 5] Definition of Done: all criteria met                         ║
║  [iter 5] Ready to create PR                                           ║
║                                                                        ║
║  ┌─── ⚡ APPROVAL NEEDED ──────────────────────────────────────────┐   ║
║  │                                                                  │   ║
║  │  Task #042 completed all DoD criteria.                          │   ║
║  │  The agent wants to:                                            │   ║
║  │                                                                  │   ║
║  │    Create PR: "fix: check token expiry before refresh"          │   ║
║  │    Branch:    fix/042-auth-token-refresh                        │   ║
║  │    Files:     2 modified, 1 created                             │   ║
║  │    Commits:   3                                                 │   ║
║  │                                                                  │   ║
║  │  ❯ ✓ Approve              approve and create PR                 │   ║
║  │    ◻ View diff            see all changes before deciding       │   ║
║  │    ✗ Reject               reject and add feedback               │   ║
║  │    ⏸ Defer                decide later, move to next task       │   ║
║  │                                                                  │   ║
║  └──────────────────────────────────────────────────────────────────┘   ║
║                                                                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║  ↑↓ select   enter confirm                                            ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 5. MULTI-WORKSPACE VIEW — Vista panorámica

Para ver actividad across todos los proyectos simultáneamente.
Se accede con `m` desde cualquier vista.

```
╔══════════════════════════════════════════════════════════════════════════╗
║  ◉ ditloop ❯ Mission Control                                   14:45  ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                        ║
║  ┌─ Pivotree ──────────────────────────────────────────────────────┐   ║
║  │ ● #042 Fix auth token     iter 5/10  ██████████████░░░  WAITING │   ║
║  │   ⚡ Approval needed: Create PR "fix: check token expiry..."    │   ║
║  │ ○ #043 Add unit tests     queued                                │   ║
║  └─────────────────────────────────────────────────────────────────┘   ║
║                                                                        ║
║  ┌─ Solu ──────────────────────────────────────────────────────────┐   ║
║  │ ● #015 Migrate to Prisma  iter 2/8   ████████░░░░░░░░  RUNNING │   ║
║  │   Reading schema.prisma... creating migration...                │   ║
║  │ ✓ #014 Fix webhook retry  completed 12m ago                     │   ║
║  └─────────────────────────────────────────────────────────────────┘   ║
║                                                                        ║
║  ┌─ OnyxOdds ─────────────────────────────────────────────────────┐   ║
║  │ (no active tasks)                                               │   ║
║  │ Last activity: #031 Update odds parser — completed yesterday    │   ║
║  └─────────────────────────────────────────────────────────────────┘   ║
║                                                                        ║
║  TODAY'S SUMMARY                                                       ║
║  Tasks completed: 3    Tasks running: 2    Approvals pending: 1        ║
║  Total tokens: 45.2k   Total cost: $0.34   Time saved: ~2.5h          ║
║                                                                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║  1-3 jump to workspace   a approve pending   r refresh   ← back       ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 6. DIFF VIEW — Revisar cambios antes de aprobar

```
╔══════════════════════════════════════════════════════════════════════════╗
║  ◉ ditloop ❯ Pivotree ❯ #042 ❯ Diff                    3 files        ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                        ║
║  src/auth/token-manager.ts                              +12 -3         ║
║  ──────────────────────────────────────────────────────────────────     ║
║                                                                        ║
║   42 │   async refreshToken(token: AuthToken): Promise<AuthToken> {    ║
║   43 │ +   if (this.isTokenExpired(token)) {                           ║
║   44 │ +     logger.info('Token expired, requesting new token');       ║
║   45 │ +     return this.requestNewToken(token.refreshToken);          ║
║   46 │ +   }                                                          ║
║   47 │ +                                                               ║
║   48 │     try {                                                       ║
║   49 │       const response = await this.authClient.refresh({          ║
║   50 │         refreshToken: token.refreshToken,                       ║
║   51 │       });                                                       ║
║      │                                                                 ║
║   68 │ + private isTokenExpired(token: AuthToken): boolean {           ║
║   69 │ +   const now = Date.now();                                     ║
║   70 │ +   const expiresAt = token.issuedAt + token.expiresIn * 1000; ║
║   71 │ +   return now >= expiresAt - this.EXPIRY_BUFFER_MS;           ║
║   72 │ + }                                                             ║
║                                                                        ║
║  src/auth/__tests__/token-manager.test.ts               +45 -0         ║
║  ──────────────────────────────────────────────────────────────────     ║
║  (scroll down for more)                                                ║
║                                                                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║  ↑↓ scroll   n next file   p prev file   a approve   r reject   ← back║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 7. CHAT MODE — Conversación libre dentro de un workspace

Accesible con `c` desde el Workspace View. Chat directo con el agente en el
contexto del proyecto (lee el codebase, conoce la arquitectura). Puede derivar
en tasks si el developer quiere.

```
╔══════════════════════════════════════════════════════════════════════════╗
║  ◉ ditloop ❯ Pivotree ❯ Chat                ruben.mavarez@pivotree.com ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                        ║
║  ┊ Context: pivotree-commerce · 342 files · .ai/ loaded                ║
║  ┊ Provider: claude-cli · Model: claude-opus-4-6                       ║
║                                                                        ║
║  ─────────────────────────────────────────────────────────────────      ║
║                                                                        ║
║  you  ¿dónde se maneja el refresh del auth token?                      ║
║                                                                        ║
║   ai  El refresh se maneja en src/auth/token-manager.ts línea 42,      ║
║       en el método refreshToken(). El flujo es:                        ║
║                                                                        ║
║       1. Recibe el token actual                                        ║
║       2. Llama a authClient.refresh() con el refreshToken              ║
║       3. Retorna el nuevo AuthToken                                    ║
║                                                                        ║
║       El problema es que NO verifica si el token está expirado         ║
║       antes de intentar el refresh, lo que causa 401 en el primer      ║
║       request después de que expira.                                   ║
║                                                                        ║
║  you  ok, creame un task para fixear eso                               ║
║                                                                        ║
║   ai  Task creado:                                                     ║
║                                                                        ║
║       ┌──────────────────────────────────────────────────────────┐     ║
║       │  #042 — Fix auth token refresh                          │     ║
║       │  Scope: src/auth/**                                     │     ║
║       │  DoD:                                                   │     ║
║       │   □ Add token expiry check before refresh               │     ║
║       │   □ Tests passing                                       │     ║
║       │   □ No regression in login flow                         │     ║
║       │                                                         │     ║
║       │  Run this task? [Y/n]                                   │     ║
║       └──────────────────────────────────────────────────────────┘     ║
║                                                                        ║
║  you  sí, lánzalo en strict mode                                       ║
║                                                                        ║
║   ai  ✓ Launching #042 in strict mode...                               ║
║       → Switching to Execution View                                    ║
║                                                                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║  Type message...                                                  ⏎    ║
╠══════════════════════════════════════════════════════════════════════════╣
║  ← back   /task create from chat   /clear   /context show             ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Chat mode features:
- El agente tiene el contexto completo del proyecto (.ai/, codebase)
- Puede leer archivos bajo demanda para responder preguntas
- Puede crear tasks directamente desde la conversación
- Puede lanzar tasks desde el chat → transición automática a Execution View
- Historial de chats persistido por workspace
- Slash commands dentro del chat: `/task`, `/clear`, `/context`, `/diff`

---

## 8. CHAT MODE — Durante ejecución (side panel)

El developer puede chatear con el agente MIENTRAS una task está corriendo.
Split horizontal: execution arriba, chat abajo.

```
╔══════════════════════════════════════════════════════════════════════════╗
║  ◉ ditloop ❯ Pivotree ❯ #042 Fix auth token    RUNNING ●    + Chat 💬 ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                        ║
║  Progress     ████████████░░░░░░░░░░  iteration 3/10   elapsed 1m 42s  ║
║                                                                        ║
║  LIVE OUTPUT                                                           ║
║  [iter 3] Evaluating Definition of Done...                             ║
║  [iter 3] ✓ Token expiry check added                                   ║
║  [iter 3] ✓ Tests passing                                              ║
║  [iter 3] Running: npm run test:e2e -- --grep "login"                  ║
║                                                                        ║
╠═══════════════════════════════════ CHAT ═════════════════════════════════╣
║                                                                        ║
║  you  ¿puedes mostrarme qué cambió en token-manager.ts?                ║
║                                                                        ║
║   ai  Agregué isTokenExpired() check en línea 43-46 y el método       ║
║       helper en línea 68-72. El diff:                                  ║
║       + if (this.isTokenExpired(token)) {                              ║
║       +   return this.requestNewToken(token.refreshToken);             ║
║       + }                                                              ║
║                                                                        ║
║  you  ▌                                                                ║
║                                                                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║  tab toggle focus (output/chat)   ← back   p pause task               ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Side chat features:
- `tab` alterna el foco entre el output y el chat
- El chat tiene contexto de lo que la task está haciendo
- Podés preguntar sobre los cambios en tiempo real
- Podés dar instrucciones al agente mid-execution ("no toques ese archivo")
- Si el chat requiere acción, la task se pausa automáticamente

---

## 9. GIT PROFILES — Identity management nativo

DitLoop gestiona identidades git como feature de primera clase. Cada workspace
tiene un profile asociado. DitLoop verifica SIEMPRE antes de operaciones git.

### 9a. Configuración de profiles

```
╔══════════════════════════════════════════════════════════════════════════╗
║  ◉ ditloop ❯ Settings ❯ Git Profiles                                  ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                        ║
║  GIT PROFILES                                                          ║
║  ──────────────────────────────────────────────────────────────────     ║
║                                                                        ║
║  ❯ pivotree                                                            ║
║    Name:     Ruben Mavarez                                             ║
║    Email:    ruben.mavarez@pivotree.com                                ║
║    SSH key:  ~/.ssh/id_ed25519_pivotree                                ║
║    SSH host: github-work                                               ║
║    Platform: GitHub                                                    ║
║    Used by:  pivotree-commerce, pivotree-cms                           ║
║                                                                        ║
║    solu                                                                ║
║    Name:     Ruben Mavarez                                             ║
║    Email:    ruben.mavarez@wearesolu.com                               ║
║    SSH key:  ~/.ssh/id_ed25519_solu                                    ║
║    SSH host: github-solu                                               ║
║    Platform: GitHub + Bitbucket                                        ║
║    Used by:  solu-app, solu-api                                        ║
║                                                                        ║
║    onyxodds                                                            ║
║    Name:     Ruben Mavarez                                             ║
║    Email:    rmavarez@onyxodds.com                                     ║
║    SSH key:  ~/.ssh/id_ed25519_onyxodds                                ║
║    SSH host: github-onyxodds                                           ║
║    Platform: GitHub                                                    ║
║    Used by:  onyx-platform                                             ║
║                                                                        ║
║    personal                                                            ║
║    Name:     Ruben Mavarez                                             ║
║    Email:    rubennmavarezb@gmail.com                                  ║
║    SSH key:  ~/.ssh/id_ed25519_personal                                ║
║    SSH host: github-personal                                           ║
║    Platform: GitHub                                                    ║
║    Used by:  aidf, ditloop                                             ║
║                                                                        ║
║  + Add profile                                                         ║
║                                                                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║  e edit   d delete   ↑↓ navigate   ← back                             ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### 9b. Workspace ↔ Profile binding

Cuando creás un workspace, asignás un profile. Esto va en la config global:

```yaml
# ~/.ditloop/config.yml

profiles:
  pivotree:
    name: Ruben Mavarez
    email: ruben.mavarez@pivotree.com
    ssh_key: ~/.ssh/id_ed25519_pivotree
    ssh_host: github-work
    platform: github

  solu:
    name: Ruben Mavarez
    email: ruben.mavarez@wearesolu.com
    ssh_key: ~/.ssh/id_ed25519_solu
    ssh_host: github-solu
    platform: github  # also bitbucket-solu for BB repos

  onyxodds:
    name: Ruben Mavarez
    email: rmavarez@onyxodds.com
    ssh_key: ~/.ssh/id_ed25519_onyxodds
    ssh_host: github-onyxodds
    platform: github

  personal:
    name: Ruben Mavarez
    email: rubennmavarezb@gmail.com
    ssh_key: ~/.ssh/id_ed25519_personal
    ssh_host: github-personal
    platform: github

workspaces:
  pivotree-commerce:
    path: ~/projects/pivotree-commerce
    profile: pivotree              # ← linked profile
    provider: claude-cli
    # ...

  solu-app:
    path: ~/projects/solu-app
    profile: solu
    provider: claude-cli

  onyx-platform:
    path: ~/projects/onyx-platform
    profile: onyxodds
    provider: anthropic-api
```

### 9c. Smart verification — Pre-commit guard

DitLoop intercepta TODA operación git y verifica la identidad automáticamente.
Si hay mismatch, bloquea y muestra:

```
╔══════════════════════════════════════════════════════════════════════════╗
║  ◉ ditloop ❯ Pivotree ❯ #042                          RUNNING ●       ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                        ║
║  [iter 3] ✓ Tests passing                                              ║
║  [iter 3] Preparing commit: "fix: add token expiry check"              ║
║                                                                        ║
║  ┌─── ⚠️  IDENTITY MISMATCH ─────────────────────────────────────┐     ║
║  │                                                                │     ║
║  │  Git is configured with the WRONG identity for this workspace │     ║
║  │                                                                │     ║
║  │  Current:   rubennmavarezb@gmail.com (personal)               │     ║
║  │  Expected:  ruben.mavarez@pivotree.com (pivotree)             │     ║
║  │  Workspace: pivotree-commerce                                 │     ║
║  │                                                                │     ║
║  │  ❯ Fix automatically     switch to pivotree profile & continue│     ║
║  │    Abort                 stop the task                        │     ║
║  │    Ignore once           commit with current identity         │     ║
║  │                                                                │     ║
║  └────────────────────────────────────────────────────────────────┘     ║
║                                                                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║  ↑↓ select   enter confirm                                            ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### 9d. Auto-switch on workspace enter

Cuando el developer entra a un workspace (desde Home o Mission Control),
ditloop automáticamente:

1. Verifica `git config user.email` del directorio del proyecto
2. Compara con el profile asignado al workspace
3. Si hay mismatch → auto-fix silencioso:
   - `git config user.name` + `user.email` (local al repo)
   - Carga la SSH key correcta en el agent
   - Muestra en el header: ✓ Profile: pivotree (auto-switched)
4. Si ya está correcto → no hace nada

```
╔══════════════════════════════════════════════════════════════════════════╗
║  ◉ ditloop ❯ Pivotree          ✓ pivotree · ruben.mavarez@pivotree.com ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                        ║
║  ┊ Auto-switched git profile: personal → pivotree                      ║
║  ┊ SSH key loaded: id_ed25519_pivotree                                 ║
║                                                                        ║
```

### 9e. Protecciones automáticas

DitLoop verifica identidad en estos momentos:
- **Workspace enter**: auto-switch al profile correcto
- **Pre-commit**: verificar antes de cada commit (task o manual)
- **Pre-push**: verificar antes de push (no pusheás con email incorrecto)
- **PR creation**: verificar que el profile matchea la plataforma del remote
- **Clone**: sugerir el SSH host correcto según el profile

### 9f. CLI commands

```bash
ditloop profile list              # Ver todos los profiles
ditloop profile add               # Wizard interactivo para crear profile
ditloop profile edit pivotree     # Editar un profile
ditloop profile current           # ¿Qué profile está activo?
ditloop profile switch solu       # Cambiar manualmente (raro, lo normal es automático)
ditloop workspace set-profile pivotree-commerce pivotree  # Asignar profile a workspace
```

---

## 10. SOURCE CONTROL — Changed files panel (estilo VS Code)

Vista de archivos modificados dentro de un workspace, similar al panel de
Source Control de VS Code. Muestra staged, unstaged, untracked, y permite
ver diff de cualquier archivo.

Se accede con `g` (git) desde el Workspace View.

### 10a. Source Control overview

```
╔══════════════════════════════════════════════════════════════════════════╗
║  ◉ ditloop ❯ Pivotree ❯ Source Control       branch: fix/042-auth ↑2  ║
╠═══════════════════════════════╦══════════════════════════════════════════╣
║  CHANGES                      ║  DIFF: token-manager.ts                ║
║  ─────────────────────────    ║  ──────────────────────────────────     ║
║                               ║                                        ║
║  Staged (2)                   ║  @@ -42,6 +42,12 @@                   ║
║  ✓ M token-manager.ts        ║   async refreshToken(token) {          ║
║  ✓ A token-manager.test.ts   ║  +  if (this.isTokenExpired(token)) {  ║
║                               ║  +    logger.info('Token expired');    ║
║  Unstaged (1)                 ║  +    return this.requestNewToken(     ║
║  ❯ M login.ts                 ║  +      token.refreshToken            ║
║                               ║  +    );                              ║
║  Untracked (1)                ║  +  }                                  ║
║    ? debug.log                ║     try {                              ║
║                               ║       const response = await          ║
║                               ║         this.authClient.refresh({     ║
║                               ║                                        ║
║                               ║  ─────────────────────────────────     ║
║                               ║                                        ║
║                               ║  @@ -68,0 +75,5 @@                    ║
║                               ║  +  private isTokenExpired(            ║
║                               ║  +    token: AuthToken                 ║
║                               ║  +  ): boolean {                       ║
║                               ║  +    const now = Date.now();          ║
║                               ║  +    const expiresAt =                ║
║                               ║  +      token.issuedAt +               ║
║                               ║  +      token.expiresIn * 1000;       ║
║                               ║  +    return now >= expiresAt -        ║
║                               ║  +      this.EXPIRY_BUFFER_MS;        ║
║                               ║  +  }                                  ║
║                               ║                                        ║
╠═══════════════════════════════╩══════════════════════════════════════════╣
║  s stage   u unstage   enter diff   x discard   C commit   P push      ║
╚══════════════════════════════════════════════════════════════════════════╝
```

File status indicators (igual que VS Code):
- `M` Modified (yellow)
- `A` Added (green)
- `D` Deleted (red)
- `R` Renamed (cyan)
- `?` Untracked (gray)
- `✓` Staged (green prefix)

### 10b. Commit inline

Desde Source Control, `C` abre un commit prompt inline:

```
╠═══════════════════════════════╩══════════════════════════════════════════╣
║                                                                        ║
║  ┌─── COMMIT ────────────────────────────────────────────────────┐     ║
║  │                                                                │     ║
║  │  Profile: ✓ pivotree (ruben.mavarez@pivotree.com)             │     ║
║  │  Branch:  fix/042-auth-token-refresh                          │     ║
║  │  Staged:  2 files                                             │     ║
║  │                                                                │     ║
║  │  Message:                                                     │     ║
║  │  fix: add token expiry check before refresh▌                  │     ║
║  │                                                                │     ║
║  │                          ctrl+enter commit   esc cancel        │     ║
║  └────────────────────────────────────────────────────────────────┘     ║
║                                                                        ║
╠══════════════════════════════════════════════════════════════════════════╣
```

Nota: muestra el profile activo para que SIEMPRE sepas con qué identidad vas a commitear.

---

## 11. FILE EXPLORER — Directory tree navegable

Navegación del codebase del workspace activo. Como el sidebar de VS Code
pero en terminal. Se accede con `f` desde el Workspace View.

### 11a. Tree view con preview

```
╔══════════════════════════════════════════════════════════════════════════╗
║  ◉ ditloop ❯ Pivotree ❯ Files                    pivotree-commerce/   ║
╠═══════════════════════════════╦══════════════════════════════════════════╣
║  FILE TREE                    ║  PREVIEW: token-manager.ts   lines: 84 ║
║  ─────────────────────────    ║  ──────────────────────────────────     ║
║                               ║                                        ║
║  📁 pivotree-commerce/        ║   1 │ import { AuthClient }            ║
║  ├── 📁 src/                  ║   2 │   from '../clients/auth';        ║
║  │   ├── 📁 auth/             ║   3 │ import { AuthToken }             ║
║  │   │   ├── 📄 login.ts      ║   4 │   from '../types';              ║
║  │   │   ├── 📄 logout.ts     ║   5 │ import { logger }               ║
║  │   │   ├──❯📄 token-mgr.ts  ║   6 │   from '../utils/logger';      ║
║  │   │   ├── 📄 types.ts      ║   7 │                                 ║
║  │   │   └── 📁 __tests__/    ║   8 │ const EXPIRY_BUFFER_MS = 30000; ║
║  │   │       └── 📄 token…    ║   9 │                                 ║
║  │   ├── 📁 api/              ║  10 │ export class TokenManager {     ║
║  │   │   ├── 📄 routes.ts     ║  11 │   private authClient:           ║
║  │   │   └── 📄 middleware…   ║  12 │     AuthClient;                 ║
║  │   ├── 📁 components/       ║  13 │                                 ║
║  │   └── 📄 index.ts          ║  14 │   constructor(                  ║
║  ├── 📁 tests/                ║  15 │     client: AuthClient          ║
║  ├── 📁 public/               ║  16 │   ) {                           ║
║  ├── 📄 package.json          ║  17 │     this.authClient = client;   ║
║  ├── 📄 tsconfig.json         ║  18 │   }                             ║
║  └── 📄 .env.example          ║  19 │                                 ║
║                               ║  20 │   async refreshToken(           ║
║  3,421 files · 12.4 MB        ║      ···                              ║
║                               ║                                        ║
╠═══════════════════════════════╩══════════════════════════════════════════╣
║  ↑↓ navigate  → expand  ← collapse  enter open  / search  ← back      ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### 11b. File explorer features

- **Tree navigation**: `↑↓` para moverse, `→` expande carpeta, `←` colapsa
- **Preview panel**: Al seleccionar un archivo, se muestra preview a la derecha
- **Syntax highlighting**: Colores básicos por tipo de token (si el terminal lo soporta)
- **Search**: `/` para buscar archivos por nombre (fuzzy match)
- **Git status en el tree**: Archivos modificados se muestran en amarillo, nuevos en verde
- **Open in $EDITOR**: `o` abre el archivo en el editor configurado (code, vim, etc.)
- **Quick actions en archivos**:
  - `enter` — preview/leer completo (scroll con j/k)
  - `o` — abrir en editor externo
  - `y` — copiar path al clipboard
  - `e` — editar inline (mini editor básico)

### 11c. Search files (fuzzy finder)

Al presionar `/` en el file explorer:

```
╔══════════════════════════════════════════════════════════════════════════╗
║  ◉ ditloop ❯ Pivotree ❯ Files ❯ Search                                ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                        ║
║  Find file: token▌                                                     ║
║                                                                        ║
║  ──────────────────────────────────────────────────────────────────     ║
║                                                                        ║
║  ❯ src/auth/token-manager.ts                              M  84 lines  ║
║    src/auth/__tests__/token-manager.test.ts                A 120 lines  ║
║    src/auth/types.ts (TokenPayload, AuthToken)                45 lines  ║
║    src/utils/token-cache.ts                                   32 lines  ║
║                                                                        ║
║  4 results                                                             ║
║                                                                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║  ↑↓ select   enter open   esc cancel                                   ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### 11d. Archivo con git status integrado en el tree

Los archivos en el tree muestran su estado git con colores:

```
  ├── 📁 auth/
  │   ├── 📄 login.ts              ← blanco (sin cambios)
  │   ├── 📄 token-manager.ts  M   ← amarillo (modified)
  │   └── 📁 __tests__/
  │       └── 📄 token-mgr…    A   ← verde (added/new)
```

---

## Navegación — Mapa de flujo

```
HOME (workspace selector)
 │
 ├─→ WORKSPACE VIEW (tasks de un proyecto)
 │    │
 │    ├─→ EXECUTION VIEW (task corriendo)
 │    │    │
 │    │    ├─→ APPROVAL PROMPT (modal)
 │    │    │    └─→ DIFF VIEW
 │    │    │
 │    │    ├─→ SIDE CHAT (split panel, chat during execution)
 │    │    │
 │    │    └─→ FULL LOG VIEW
 │    │
 │    ├─→ CHAT MODE (free conversation with agent)
 │    │    │
 │    │    └─→ /task → creates task → can launch → EXECUTION VIEW
 │    │
 │    ├─→ SOURCE CONTROL (changed files + inline diff)
 │    │    │
 │    │    └─→ COMMIT (inline prompt with identity verification)
 │    │
 │    ├─→ FILE EXPLORER (directory tree + preview)
 │    │    │
 │    │    ├─→ FILE PREVIEW (read file with scroll)
 │    │    └─→ FUZZY SEARCH (find files by name)
 │    │
 │    └─→ NEW TASK (crear task)
 │
 ├─→ MISSION CONTROL (multi-workspace overview)
 │    │
 │    └─→ Jump to any workspace/task
 │
 └─→ SETTINGS
      ├─→ Git Profiles
      └─→ Workspaces
```

---

## Keyboard Shortcuts (globales)

| Key       | Action                          |
|-----------|---------------------------------|
| `1-9`     | Jump to workspace by number     |
| `m`       | Mission Control view            |
| `a`       | Approve pending (if any)        |
| `←` / `h` | Back / up one level            |
| `→` / `l` | Enter / drill down             |
| `↑` / `k` | Navigate up                    |
| `↓` / `j` | Navigate down                  |
| `/`       | Filter / search                 |
| `c`       | Chat mode (in workspace)        |
| `g`       | Source Control (git changes)    |
| `f`       | File Explorer (directory tree)  |
| `r`       | Run selected task               |
| `n`       | New task                        |
| `?`       | Show all shortcuts              |
| `q`       | Quit (with confirmation)        |

---

## Color Scheme

| Element          | Color            |
|------------------|------------------|
| Active/running   | Cyan             |
| Success          | Green            |
| Warning/waiting  | Yellow           |
| Error/blocked    | Red              |
| Muted/completed  | Dim gray         |
| Selected item    | Bold + underline |
| Borders          | Dim white        |
| Shortcuts bar    | Inverse          |

---

## Notifications

Cuando ditloop está corriendo y una task necesita aprobación:
- macOS: native notification via terminal-notifier
- Sound: terminal bell
- Badge en el tab del terminal (si lo soporta, como Ghostty/iTerm2)

Si el developer está en otra app, la notificación lo trae de vuelta.
