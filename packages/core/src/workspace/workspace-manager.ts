import type { DitLoopConfig, Workspace, SingleWorkspace, GroupWorkspace } from '../config/index.js';
import type { EventBus } from '../events/index.js';
import { GroupResolver, type SubProject } from './group-resolver.js';

/** Resolved workspace entry with a generated ID and its sub-projects (if group). */
export interface ResolvedWorkspace {
  /** Generated slug ID */
  id: string;
  /** Workspace name from config */
  name: string;
  /** Workspace type */
  type: 'single' | 'group';
  /** Root path of the workspace */
  path: string;
  /** Profile name associated with this workspace */
  profile: string;
  /** Whether AIDF is enabled */
  aidf: boolean;
  /** Sub-projects (only populated for group workspaces) */
  projects: SubProject[];
  /** Original workspace config */
  config: Workspace;
}

/**
 * Manages workspaces loaded from DitLoop configuration.
 * Supports single-type (one project) and group-type (parent with sub-projects) workspaces.
 * Emits events via EventBus when workspaces are activated or deactivated.
 */
export class WorkspaceManager {
  private workspaces: Map<string, ResolvedWorkspace> = new Map();
  private activeId: string | null = null;
  private groupResolver: GroupResolver;

  constructor(
    private config: DitLoopConfig,
    private eventBus: EventBus,
  ) {
    this.groupResolver = new GroupResolver();
    this.loadWorkspaces();
  }

  /** Load and resolve all workspaces from config. */
  private loadWorkspaces(): void {
    this.workspaces.clear();

    for (const ws of this.config.workspaces) {
      try {
        const resolved = this.resolveWorkspace(ws);
        this.workspaces.set(resolved.id, resolved);
      } catch (err) {
        const id = slugify(ws.name);
        const message = err instanceof Error ? err.message : String(err);
        this.eventBus.emit('workspace:error', { id, error: message });
      }
    }
  }

  /** Resolve a single workspace config entry into a ResolvedWorkspace. */
  private resolveWorkspace(ws: Workspace): ResolvedWorkspace {
    const id = slugify(ws.name);

    if (ws.type === 'single' || ws.type === undefined) {
      const single = ws as SingleWorkspace;
      return {
        id,
        name: single.name,
        type: 'single',
        path: single.path,
        profile: single.profile,
        aidf: single.aidf,
        projects: [{
          id,
          name: single.name,
          path: single.path,
        }],
        config: ws,
      };
    }

    // Group workspace
    const group = ws as GroupWorkspace;
    const projects = group.autoDiscover
      ? this.groupResolver.resolve(group)
      : [];

    return {
      id,
      name: group.name,
      type: 'group',
      path: group.path,
      profile: group.profile,
      aidf: group.aidf,
      projects,
      config: ws,
    };
  }

  /** List all resolved workspaces. */
  list(): ResolvedWorkspace[] {
    return Array.from(this.workspaces.values());
  }

  /** Get a workspace by ID. Returns undefined if not found. */
  get(id: string): ResolvedWorkspace | undefined {
    return this.workspaces.get(id);
  }

  /** Get the sub-projects for a workspace. Returns empty array if not found. */
  getProjects(workspaceId: string): SubProject[] {
    const ws = this.workspaces.get(workspaceId);
    return ws ? ws.projects : [];
  }

  /** Activate a workspace by ID. Deactivates any currently active workspace first. */
  activate(id: string): void {
    const ws = this.workspaces.get(id);
    if (!ws) {
      this.eventBus.emit('workspace:error', {
        id,
        error: `Workspace "${id}" not found`,
      });
      return;
    }

    // Deactivate current if different
    if (this.activeId && this.activeId !== id) {
      this.eventBus.emit('workspace:deactivated', { id: this.activeId });
    }

    this.activeId = id;
    this.eventBus.emit('workspace:activated', {
      id: ws.id,
      name: ws.name,
      path: ws.path,
    });
  }

  /** Get the currently active workspace, or null if none. */
  getActive(): ResolvedWorkspace | null {
    if (!this.activeId) return null;
    return this.workspaces.get(this.activeId) ?? null;
  }
}

/** Convert a name to a URL-safe slug. */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
