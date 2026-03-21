export class History<State, Act> {
  readonly actions: Act[] = [];
  private currentPosition = 0;
  private lastPosition = 0;
  private snapshots: Map<number, State> = new Map();
  private snapshotInterval = 50;

  constructor(
    private initialState: State,
    private apply: (state: State, cmd: Act) => State,
  ) {}

  getState(): State {
    let startPos = 0;
    let state = this.initialState;

    for (const [pos, snap] of this.snapshots) {
      if (pos <= this.currentPosition && pos > startPos) {
        startPos = pos;
        state = snap;
      }
    }

    return this.actions
      .slice(startPos, this.currentPosition)
      .reduce((s, cmd) => this.apply(s, cmd), state);
  }

  push(cmd: Act) {
    this.actions.length = this.currentPosition; // truncate to current cursor
    this.actions.push(cmd);
    this.lastPosition = this.currentPosition;
    this.currentPosition++;

    if (this.currentPosition % this.snapshotInterval === 0) {
      this.snapshots.set(this.currentPosition, this.getState());
    }
  }

  undo(): State | null {
    if (this.currentPosition === 0) return null;
    this.lastPosition = this.currentPosition;
    this.currentPosition--;
    return this.getState();
  }

  redo(): State | null {
    if (this.currentPosition === this.actions.length) return null;
    this.lastPosition = this.currentPosition;
    this.currentPosition++;
    return this.getState();
  }

  snapshot(): { state: State; position: number } {
    return { state: this.getState(), position: this.currentPosition };
  }

  get action(): Act | null {
    if (this.actions.length === 0) return null;
    return this.direction === -1
      ? (this.actions[this.currentPosition] ?? null)
      : (this.actions[this.currentPosition - 1] ?? null);
  }

  get position() {
    return this.currentPosition;
  }

  get direction(): 1 | -1 {
    return this.currentPosition >= this.lastPosition ? 1 : -1;
  }
}
