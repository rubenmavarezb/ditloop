import EventEmitter from 'eventemitter3';
import type { DitLoopEventMap, DitLoopEventName } from './events.js';

type EventPayload<K extends DitLoopEventName> = DitLoopEventMap[K];
type EventHandler<K extends DitLoopEventName> = (payload: EventPayload<K>) => void;

export class EventBus {
  private emitter = new EventEmitter();

  emit<K extends DitLoopEventName>(event: K, payload: EventPayload<K>): void {
    this.emitter.emit(event, payload);
  }

  on<K extends DitLoopEventName>(event: K, handler: EventHandler<K>): void {
    this.emitter.on(event, handler);
  }

  once<K extends DitLoopEventName>(event: K, handler: EventHandler<K>): void {
    this.emitter.once(event, handler);
  }

  off<K extends DitLoopEventName>(event: K, handler: EventHandler<K>): void {
    this.emitter.off(event, handler);
  }

  removeAllListeners(event?: DitLoopEventName): void {
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
