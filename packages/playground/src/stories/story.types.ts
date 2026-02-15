/** Metadata for a story module. */
export interface StoryMeta {
  /** Display title of the component. */
  title: string;
  /** Category grouping (e.g., 'primitives', 'composite'). */
  category: string;
}

/** A single story variant render function. */
export type StoryVariant = () => JSX.Element;

/** Resolved story entry in the registry. */
export interface StoryEntry {
  /** Story metadata. */
  meta: StoryMeta;
  /** Named variants keyed by variant name. */
  variants: Record<string, StoryVariant>;
}

/** Registry grouped by category. */
export type StoryRegistry = StoryEntry[];
