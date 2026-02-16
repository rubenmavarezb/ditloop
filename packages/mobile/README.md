# @ditloop/mobile

Progressive Web App for DitLoop — review, approve, and monitor AI executions from any device.

## Development

```bash
pnpm dev      # Start Vite dev server
pnpm build    # Production build
pnpm preview  # Preview production build
pnpm test     # Run tests
```

## Key Features

| Feature | Description |
|---------|-------------|
| Workspace view | Browse and select workspaces |
| Approval flow | Review and approve/reject AI-proposed changes |
| Execution monitor | Real-time execution status with SSE streaming |
| Push notifications | VAPID-based Web Push for approval requests |
| Offline support | Service Worker with offline queue and delta sync |
| Settings | Server connection, notification preferences |

## Tech Stack

- [React](https://react.dev/) — UI framework
- [Vite](https://vitejs.dev/) — Build tool + PWA plugin
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [Zustand](https://zustand-demo.pmnd.rs/) — State management
- [React Router](https://reactrouter.com/) — Client-side routing
- [Workbox](https://developer.chrome.com/docs/workbox) — Service Worker

See the [root README](../../README.md) for full documentation.
