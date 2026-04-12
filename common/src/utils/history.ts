export interface ReadOnlyHistory<State> {
  readonly position: number;
  readonly direction: 1 | -1;
  getState(): State;
}

export class History<Act, State> implements ReadOnlyHistory<State> {
  private actions: Act[] = [];
  private currentPosition = 0;
  private lastPosition = 0;
  private snapshots: Map<number, State> = new Map();

  constructor(
    private initialState: State,
    private apply: (state: State, cmd: Act) => State,
  ) {}

  snapshot(): { state: State; position: number } {
    return { state: this.getState(), position: this.currentPosition };
  }

  getState() {
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

  push(action: Act) {
    this.actions.splice(this.currentPosition, this.actions.length, action);
    this.lastPosition = this.currentPosition;
    this.currentPosition++;
  }

  undo(dryRun?: boolean) {
    if (this.currentPosition === 0) return false;
    if (!dryRun) {
      this.lastPosition = this.currentPosition;
      this.currentPosition--;
    }
    return true;
  }

  redo(dryRun?: boolean) {
    if (this.currentPosition === this.actions.length) return false;
    if (!dryRun) {
      this.lastPosition = this.currentPosition;
      this.currentPosition++;
    }
    return true;
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

  static clone<A, T>(base: History<A, T>): History<A, T> {
    const h = new History(base.initialState, base.apply);

    h.actions.push(...base.actions);
    h.currentPosition = base.currentPosition;
    h.lastPosition = base.lastPosition;
    h.snapshots = new Map(base.snapshots);

    return h;
  }
}
