export type VoiceClip = { bytes: number; durationMs: number };
export type VoiceState = {
  phase:
    | 'idle'
    | 'requesting'
    | 'preparing'
    | 'recording'
    | 'stopping'
    | 'ready'
    | 'playing'
    | 'denied'
    | 'error';
  hasTake: boolean;
  canAskAgain: boolean;
  clip?: VoiceClip;
};
export type VoicePorts = {
  permission(): Promise<{ granted: boolean; canAskAgain: boolean }>;
  prepare(): Promise<void>;
  begin(seconds: number): void;
  stopCapture(): Promise<void>;
  clip(): Promise<VoiceClip>;
  discard(): Promise<void>;
  play(): Promise<void>;
  stopPlayback(): void;
  restoreMode(): Promise<void>;
};
export class VoicePractice {
  state: VoiceState = { phase: 'idle', hasTake: false, canAskAgain: true };
  private listeners = new Set<(state: VoiceState) => void>();
  private epoch = 0;
  private closed = false;
  private busy = false;
  private captureMayBeActive = false;
  private pending: Promise<void> = Promise.resolve();
  private timer?: ReturnType<typeof setTimeout>;
  constructor(private ports: VoicePorts) {}
  subscribe(listener: (state: VoiceState) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  private update(patch: Partial<VoiceState>) {
    this.state = { ...this.state, ...patch };
    if (!this.closed) this.listeners.forEach((listener) => listener(this.state));
  }
  private cancel() {
    this.epoch++;
    if (!this.captureMayBeActive) clearTimeout(this.timer);
    try {
      this.ports.stopPlayback();
      return true;
    } catch {
      this.update({ phase: 'error' });
      return false;
    }
  }
  private work(action: () => Promise<void>) {
    if (this.busy) return this.pending;
    this.busy = true;
    this.pending = (async () => {
      try {
        await action();
      } catch {
        this.update({ phase: 'error' });
      } finally {
        this.busy = false;
      }
    })();
    return this.pending;
  }
  private async clear() {
    // A failed stop must not be followed by deleting a file still being written.
    if (this.state.hasTake) {
      await this.ports.stopCapture();
      this.captureMayBeActive = false;
      clearTimeout(this.timer);
      await this.ports.discard();
    }
    await this.ports.restoreMode();
    this.update({ phase: 'idle', hasTake: false, clip: undefined });
  }
  start() {
    if (this.closed || this.busy || this.state.hasTake) return this.pending;
    if (!this.cancel()) return this.pending;
    const id = this.epoch;
    return this.work(async () => {
      this.update({ phase: 'requesting' });
      const permission = await this.ports.permission();
      if (!permission.granted) {
        this.update({ phase: 'denied', canAskAgain: permission.canAskAgain });
        return;
      }
      if (id !== this.epoch) {
        await this.clear();
        return;
      }
      this.captureMayBeActive = true;
      this.update({ phase: 'preparing', hasTake: true });
      await this.ports.prepare();
      if (id !== this.epoch) {
        await this.clear();
        return;
      }
      this.ports.begin(30);
      this.update({ phase: 'recording' });
      this.timer = setTimeout(() => {
        void this.stop();
      }, 30000);
    });
  }
  async stop() {
    if (!this.cancel()) return;
    if (this.busy) {
      await this.pending;
    }
    if (this.closed) return;
    if (this.state.phase === 'playing') {
      this.update({ phase: 'ready' });
      return;
    }
    if (!this.captureMayBeActive) return;
    return this.work(async () => {
      this.update({ phase: 'stopping' });
      await this.ports.stopCapture();
      this.captureMayBeActive = false;
      clearTimeout(this.timer);
      const clip = await this.ports.clip();
      await this.ports.restoreMode();
      if (
        !Number.isFinite(clip.bytes) ||
        clip.bytes <= 0 ||
        clip.bytes > 2 * 1024 * 1024 ||
        !Number.isFinite(clip.durationMs) ||
        clip.durationMs <= 0 ||
        clip.durationMs > 31000
      )
        throw new Error('Unavailable recording');
      this.update({ phase: 'ready', clip });
    });
  }
  play() {
    if (this.closed || this.busy || !this.state.clip || this.state.phase !== 'ready')
      return this.pending;
    if (!this.cancel()) return this.pending;
    const id = this.epoch;
    return this.work(async () => {
      await this.ports.play();
      if (id !== this.epoch) {
        this.ports.stopPlayback();
        return;
      }
      this.update({ phase: 'playing' });
    });
  }
  async discard() {
    if (!this.cancel()) return;
    await this.pending;
    return this.work(() => this.clear());
  }
  async suspend() {
    const unfinished =
      this.captureMayBeActive ||
      this.busy ||
      ['recording', 'preparing', 'requesting', 'stopping'].includes(this.state.phase);
    if (!this.cancel()) return;
    await this.pending;
    if (unfinished && this.state.phase !== 'denied') await this.work(() => this.clear());
    else if (this.state.phase === 'playing') this.update({ phase: 'ready' });
  }
  async close() {
    this.closed = true;
    if (!this.cancel()) throw new Error('Playback cleanup incomplete');
    await this.pending;
    await this.work(() => this.clear());
    if (this.state.hasTake || this.state.phase === 'error')
      throw new Error('Recording cleanup incomplete');
    this.listeners.clear();
  }
}
