import EventEmitter from 'eventemitter3';
import type { HitLoopEventMap, HitLoopEventName } from './events.js';

type EventPayload<K extends HitLoopEventName> = HitLoopEventMap[K];
type EventHandler<K extends HitLoopEventName> = (payload: EventPayload<K>) => void;

export class EventBus {
  private emitter = new EventEmitter();

  emit<K extends HitLoopEventName>(event: K, payload: EventPayload<K>): void {
    this.emitter.emit(event, payload);
  }

  on<K extends HitLoopEventName>(event: K, handler: EventHandler<K>): void {
    this.emitter.on(event, handler);
  }

  once<K extends HitLoopEventName>(event: K, handler: EventHandler<K>): void {
    this.emitter.once(event, handler);
  }

  off<K extends HitLoopEventName>(event: K, handler: EventHandler<K>): void {
    this.emitter.off(event, handler);
  }

  removeAllListeners(event?: HitLoopEventName): void {
    this.emitter.removeAllListeners(event);
  }
}

let defaultBus: EventBus | undefined;

export function getEventBus(): EventBus {
  if (!defaultBus) {
    defaultBus = new EventBus();
  }
  return defaultBus;
}

export function resetEventBus(): void {
  if (defaultBus) {
    defaultBus.removeAllListeners();
    defaultBus = undefined;
  }
}
