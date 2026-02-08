export class History<State, Cmd> {
  readonly commands: Cmd[] = [];
  private position = 0;
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
      if (pos <= this.position && pos > startPos) {
        startPos = pos;
        state = snap;
      }
    }

    return this.commands
      .slice(startPos, this.position)
      .reduce((s, cmd) => this.apply(s, cmd), state);
  }

  push(cmd: Cmd) {
    this.commands.length = this.position; // truncate to current cursor
    this.commands.push(cmd);
    this.position++;

    if (this.position % this.snapshotInterval === 0) {
      this.snapshots.set(this.position, this.getState());
    }
  }

  undo(): State | null {
    if (this.position === 0) return null;
    this.position--;
    return this.getState();
  }

  redo(): State | null {
    if (this.position === this.commands.length) return null;
    this.position++;
    return this.getState();
  }

  snapshot(): { state: State; position: number } {
    return { state: this.getState(), position: this.position };
  }

  get command(): Cmd | null {
    return this.commands[this.position - 1] ?? null;
  }

  get currentPosition() {
    return this.position;
  }

  get direction(): 1 | -1 {
    return this.commands.length === this.position ? 1 : -1;
  }
}
