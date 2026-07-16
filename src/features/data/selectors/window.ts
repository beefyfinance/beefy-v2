import type { BeefyState } from '../store/types.ts';

export const selectIsWindowFocused = (state: BeefyState) => state.ui.window.focused;
