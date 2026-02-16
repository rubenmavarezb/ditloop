import type { ViewName } from '../state/app-store.js';

/** Route parameters for views that need them. */
export interface RouteParams {
  /** Workspace index for workspace-detail view. */
  workspaceIndex?: number;
  /** Task ID for task-detail view. */
  taskId?: string;
}

/** A resolved route with view name and parameters. */
export interface Route {
  /** The view to render. */
  view: ViewName;
  /** Optional parameters for the view. */
  params: RouteParams;
}

/**
 * Create a route object for navigation.
 *
 * @param view - Target view name
 * @param params - Optional route parameters
 * @returns A resolved route object
 */
export function createRoute(view: ViewName, params: RouteParams = {}): Route {
  return { view, params };
}

/**
 * Get the display title for a view.
 *
 * @param view - View name
 * @returns Human-readable title for the view
 */
export function getViewTitle(view: ViewName): string {
  switch (view) {
    case 'home':
      return 'Home';
    case 'workspace-detail':
      return 'Workspace';
    case 'workspace-panels':
      return 'Workspace';
    case 'task-detail':
      return 'Task';
    case 'diff-review':
      return 'Review';
    case 'launcher':
      return 'AI Launcher';
    case 'task-editor':
      return 'Task Editor';
    case 'execution-dashboard':
      return 'Executions';
  }
}
