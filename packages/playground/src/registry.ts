import type { StoryEntry, StoryMeta, StoryVariant } from './stories/story.types.js';

import * as PanelStory from './stories/primitives/Panel.story.js';
import * as DividerStory from './stories/primitives/Divider.story.js';
import * as StatusBadgeStory from './stories/primitives/StatusBadge.story.js';
import * as BreadcrumbStory from './stories/primitives/Breadcrumb.story.js';
import * as HeaderStory from './stories/primitives/Header.story.js';
import * as ShortcutsBarStory from './stories/primitives/ShortcutsBar.story.js';
import * as SplitViewStory from './stories/primitives/SplitView.story.js';

import * as SidebarStory from './stories/composite/Sidebar.story.js';
import * as TaskItemStory from './stories/composite/TaskItem.story.js';
import * as WorkspaceItemStory from './stories/composite/WorkspaceItem.story.js';

import * as SelectListStory from './stories/input/SelectList.story.js';
import * as RelativeTimeStory from './stories/data-display/RelativeTime.story.js';

type StoryModule = {
  meta: StoryMeta;
  [key: string]: StoryVariant | StoryMeta;
};

/** Extract variants (all exported functions) from a story module. */
function extractVariants(mod: StoryModule): Record<string, StoryVariant> {
  const variants: Record<string, StoryVariant> = {};
  for (const [key, value] of Object.entries(mod)) {
    if (key !== 'meta' && typeof value === 'function') {
      variants[key] = value as StoryVariant;
    }
  }
  return variants;
}

/** Build a StoryEntry from a story module. */
function entryFrom(mod: StoryModule): StoryEntry {
  return {
    meta: mod.meta,
    variants: extractVariants(mod),
  };
}

const modules: StoryModule[] = [
  PanelStory,
  DividerStory,
  StatusBadgeStory,
  BreadcrumbStory,
  HeaderStory,
  ShortcutsBarStory,
  SplitViewStory,
  SidebarStory,
  TaskItemStory,
  WorkspaceItemStory,
  SelectListStory,
  RelativeTimeStory,
];

/** All stories registered in the playground catalog. */
export const registry: StoryEntry[] = modules.map(entryFrom);

/** Get unique category names in order. */
export function getCategories(): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const entry of registry) {
    if (!seen.has(entry.meta.category)) {
      seen.add(entry.meta.category);
      result.push(entry.meta.category);
    }
  }
  return result;
}

/** Get stories for a specific category. */
export function getStoriesByCategory(category: string): StoryEntry[] {
  return registry.filter((e) => e.meta.category === category);
}
