export interface IHistory<State, Act> {
  readonly action: Act | null;
  readonly position: number;
  readonly direction: 1 | -1;
  snapshot(): { state: State; position: number };
  push(cmd: Act): void;
  undo(dryRun?: boolean): boolean;
  redo(dryRun?: boolean): boolean;
}

export class History<State, Act> implements IHistory<State, Act> {
  readonly actions: Act[] = [];
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

  static clone<T, A>(base: History<T, A>): History<T, A> {
    const h = new History(base.initialState, base.apply);

    h.actions.push(...base.actions);
    h.currentPosition = base.currentPosition;
    h.lastPosition = base.lastPosition;
    h.snapshots = new Map(base.snapshots);

    return h;
  }

  /**
   * Creates a view of this history with a different state and action type.
   * State is projected and actions are translated when pushed. The mapped
   * history's bus fires the same events as the base.
   */
  static map<S, A, T, B>(
    base: History<S, A>,
    mapState: (s: S) => T,
    mapAction: (a: B) => A,
  ): IHistory<T, B> {
    return {
      action: null,
      get position() {
        return base.position;
      },
      get direction() {
        return base.direction;
      },
      snapshot() {
        const snapshot = base.snapshot();
        return {
          state: mapState(snapshot.state),
          position: snapshot.position,
        };
      },
      push(b) {
        base.push(mapAction(b));
      },
      undo(dryRun) {
        return base.undo(dryRun);
      },
      redo(dryRun) {
        return base.redo(dryRun);
      },
    };
  }
}
