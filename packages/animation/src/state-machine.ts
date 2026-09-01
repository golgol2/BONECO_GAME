import type { AnimationState } from "./types";

export class AnimationStateMachine {
  private currentState: AnimationState;

  constructor(
    initialState: AnimationState = "idle",
  ) {
    this.currentState = initialState;
  }

  get state(): AnimationState {
    return this.currentState;
  }

  setState(state: AnimationState): boolean {
    if (state === this.currentState) {
      return false;
    }

    this.currentState = state;
    return true;
  }
}
