import { Workspace } from '../Workspace';

describe('Workspace entity', () => {
  it('exposes id, name, and slug via getters', () => {
    const ws = new Workspace({ id: 'ws_01', name: 'My Team', slug: 'my-team' });
    expect(ws.id).toBe('ws_01');
    expect(ws.name).toBe('My Team');
    expect(ws.slug).toBe('my-team');
  });

  it('allows id to be undefined for unsaved workspaces', () => {
    const ws = new Workspace({ name: 'Test', slug: 'test' });
    expect(ws.id).toBeUndefined();
  });
});

describe('Workspace.generateSlug', () => {
  it('lowercases the name', () => {
    expect(Workspace.generateSlug('MyTeam')).toBe('myteam');
  });

  it('replaces spaces with hyphens', () => {
    expect(Workspace.generateSlug('My Team')).toBe('my-team');
  });

  it('collapses multiple separators into a single hyphen', () => {
    expect(Workspace.generateSlug('Test  &  Demo')).toBe('test-demo');
  });

  it('removes apostrophes without adding hyphens', () => {
    expect(Workspace.generateSlug("Rafael's workspace")).toBe('rafaels-workspace');
  });

  it('strips leading and trailing hyphens', () => {
    expect(Workspace.generateSlug('  Leading Trailing  ')).toBe('leading-trailing');
  });

  it('handles names that are already valid slugs', () => {
    expect(Workspace.generateSlug('civic-ops')).toBe('civic-ops');
  });
});
