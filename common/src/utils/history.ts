export class History<State, Cmd> {
  readonly commands: Cmd[] = [];
  private currentPosition = 0;
  private lastPosition = 0;
  private snapshots: Map<number, State> = new Map();
  private snapshotInterval = 50;

  constructor(
    private initialState: State,
    private apply: (state: State, cmd: Cmd) => State,
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

    return this.commands
      .slice(startPos, this.currentPosition)
      .reduce((s, cmd) => this.apply(s, cmd), state);
  }

  push(cmd: Cmd) {
    this.commands.length = this.currentPosition; // truncate to current cursor
    this.commands.push(cmd);
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
    if (this.currentPosition === this.commands.length) return null;
    this.lastPosition = this.currentPosition;
    this.currentPosition++;
    return this.getState();
  }

  snapshot(): { state: State; position: number } {
    return { state: this.getState(), position: this.currentPosition };
  }

  get command(): Cmd | null {
    if (this.commands.length === 0) return null;
    return this.direction === -1
      ? (this.commands[this.currentPosition] ?? null)
      : (this.commands[this.currentPosition - 1] ?? null);
  }

  get position() {
    return this.currentPosition;
  }

  get direction(): 1 | -1 {
    return this.currentPosition >= this.lastPosition ? 1 : -1;
  }
}
