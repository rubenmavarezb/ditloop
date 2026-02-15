import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { ScaffoldWizard } from './scaffold.js';

describe('ScaffoldWizard', () => {
  it('renders the scaffold title', () => {
    const { lastFrame } = render(
      <ScaffoldWizard workspacePath="/tmp/test" />,
    );

    expect(lastFrame()).toContain('ditloop scaffold');
  });

  it('shows type selection on start', () => {
    const { lastFrame } = render(
      <ScaffoldWizard workspacePath="/tmp/test" />,
    );

    expect(lastFrame()).toContain('Task');
    expect(lastFrame()).toContain('Role');
    expect(lastFrame()).toContain('Skill');
    expect(lastFrame()).toContain('Plan');
  });

  it('skips type selection when preselected', () => {
    const { lastFrame } = render(
      <ScaffoldWizard workspacePath="/tmp/test" preselectedType="task" />,
    );

    // Should show template selection, not type selection
    expect(lastFrame()).toContain('template');
  });
});
