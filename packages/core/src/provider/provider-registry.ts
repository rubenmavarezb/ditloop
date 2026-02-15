import type { ProviderAdapter } from './provider-adapter.js';

/**
 * Registry for managing AI provider adapters. Allows registering,
 * retrieving, and listing providers by name.
 */
export class ProviderRegistry {
  private adapters = new Map<string, ProviderAdapter>();

  /**
   * Register a provider adapter.
   *
   * @param adapter - The provider adapter to register
   * @throws Error if a provider with the same name is already registered
   */
  register(adapter: ProviderAdapter): void {
    if (this.adapters.has(adapter.name)) {
      throw new Error(`Provider "${adapter.name}" is already registered`);
    }
    this.adapters.set(adapter.name, adapter);
  }

  /**
   * Get a registered provider by name.
   *
   * @param name - Provider name
   * @returns The provider adapter, or undefined if not found
   */
  get(name: string): ProviderAdapter | undefined {
    return this.adapters.get(name);
  }

  /**
   * List all registered provider names.
   *
   * @returns Array of registered provider names
   */
  list(): string[] {
    return [...this.adapters.keys()];
  }

  /**
   * Check if a provider is registered.
   *
   * @param name - Provider name
   * @returns true if the provider is registered
   */
  has(name: string): boolean {
    return this.adapters.has(name);
  }

  /**
   * Remove a registered provider.
   *
   * @param name - Provider name to remove
   * @returns true if the provider was removed
   */
  remove(name: string): boolean {
    return this.adapters.delete(name);
  }
}
