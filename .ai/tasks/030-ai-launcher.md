# TASK: AI Launcher

## Goal
Create AiLauncher service that detects installed AI CLI tools, spawns them with injected workspace/AIDF context, and manages child process lifecycle.

## Scope

### Allowed
- packages/core/src/launcher/ai-launcher.ts
- packages/core/src/launcher/ai-launcher.test.ts
- packages/core/src/launcher/cli-registry.ts
- packages/core/src/launcher/cli-registry.test.ts

### Forbidden
- packages/ui/**
- packages/tui/**

## Requirements
1. **CLI Registry** — define supported AI CLIs with detection and launch config:
   - Claude Code: detect `claude` binary, inject via `--system-prompt` flag or temp CLAUDE.md in workspace
   - Aider: detect `aider` binary, inject via `--message` or config file
   - Extensible: registry pattern for adding future CLIs (Copilot, Continue, etc.)
2. **Detection** — `detectAvailable()` returns list of installed CLIs with version info
   - Use `which`/`command -v` to check binary existence
   - Run `<cli> --version` to get version string
   - Cache detection results (invalidate on explicit refresh)
3. **Launch** — `launch(cliName, options)` spawns the AI CLI:
   - `options`: workspacePath, taskId?, role?, interactive (default true)
   - Use ContextBuilder to generate context
   - Spawn as child process with `stdio: 'inherit'` (interactive mode — TUI hands off terminal)
   - Set `cwd` to workspace path
   - Set git identity before launch (via IdentityGuard)
4. **Lifecycle** — manage child process:
   - Emit `launcher:started` event when CLI starts
   - Emit `launcher:exited` event with exit code when CLI exits
   - Forward SIGINT/SIGTERM to child process
   - Cleanup temp files on exit
5. **Non-interactive mode** — `launch(cliName, { interactive: false })`:
   - Capture stdout/stderr instead of inheriting
   - Return output as string (for future server/API use in v0.4)

## Definition of Done
- [ ] CliRegistry with Claude Code and Aider entries
- [ ] Detection works for installed CLIs
- [ ] Launch spawns CLI with injected context
- [ ] Interactive mode hands off terminal correctly
- [ ] Process cleanup on exit (temp files, signals)
- [ ] Events emitted at start/exit
- [ ] Unit tests with mocked binaries
- [ ] Integration test with real `claude` CLI (optional, skip in CI)

## Status: 📋 Planned
