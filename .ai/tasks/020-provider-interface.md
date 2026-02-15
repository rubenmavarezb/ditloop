# TASK: Provider Interface

## Goal
Define the ProviderAdapter interface, ProviderRegistry, and extend config schema for providers.

## Scope

### Allowed
- packages/core/src/provider/provider-adapter.ts
- packages/core/src/provider/provider-registry.ts
- packages/core/src/provider/provider-registry.test.ts
- packages/core/src/provider/index.ts
- packages/core/src/config/schema.ts (extend only)

### Forbidden
- packages/ui/**
- packages/tui/**

## Requirements
1. ProviderAdapter interface: sendMessage() → AsyncIterable<StreamChunk>, listModels(), getCapabilities()
2. Types: Message, StreamChunk (delta, toolUse, done), SendOptions
3. ProviderRegistry with register(), get(), list()
4. Extend DitLoopConfig with providers section (Zod schema)

## Definition of Done
- [ ] Interface defined with TypeScript types
- [ ] Registry CRUD operations work
- [ ] Config validates providers section
- [ ] Types exported from index
- [ ] Tests pass

## Status: ⏳ Pending
