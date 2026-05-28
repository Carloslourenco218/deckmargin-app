'use client';

import { useImmerReducer } from 'use-immer';
import type { DesignState, DesignAction, DesignComponent } from '@/lib/design/types';

const MAX_HISTORY = 50;

function makeInitialState(components: DesignComponent[] = []): DesignState {
  return {
    components,
    selected_id: null,
    snap_ft: 1,
    is_dirty: false,
    history: [],
    history_index: -1,
  };
}

function designReducer(draft: DesignState, action: DesignAction): void {
  const pushHistory = () => {
    // Trim any redo future
    draft.history = draft.history.slice(0, draft.history_index + 1);
    draft.history.push(JSON.parse(JSON.stringify(draft.components)));
    if (draft.history.length > MAX_HISTORY) {
      draft.history.shift();
    } else {
      draft.history_index++;
    }
  };

  switch (action.type) {
    case 'ADD_COMPONENT':
      pushHistory();
      draft.components.push(action.component);
      draft.selected_id = action.component.id;
      draft.is_dirty = true;
      break;

    case 'UPDATE_COMPONENT': {
      const idx = draft.components.findIndex((c) => c.id === action.id);
      if (idx !== -1) {
        pushHistory();
        Object.assign(draft.components[idx], action.changes);
        draft.is_dirty = true;
      }
      break;
    }

    case 'DELETE_COMPONENT':
      pushHistory();
      draft.components = draft.components.filter((c) => c.id !== action.id);
      if (draft.selected_id === action.id) draft.selected_id = null;
      draft.is_dirty = true;
      break;

    case 'MOVE_COMPONENT': {
      const idx = draft.components.findIndex((c) => c.id === action.id);
      if (idx !== -1) {
        draft.components[idx].position = action.position;
        draft.is_dirty = true;
      }
      break;
    }

    case 'SELECT_COMPONENT':
      draft.selected_id = action.id;
      break;

    case 'UNDO':
      if (draft.history_index > 0) {
        draft.history_index--;
        draft.components = JSON.parse(JSON.stringify(draft.history[draft.history_index]));
        draft.is_dirty = true;
      } else if (draft.history_index === 0) {
        draft.history_index = -1;
        draft.components = [];
        draft.is_dirty = false;
      }
      break;

    case 'REDO':
      if (draft.history_index < draft.history.length - 1) {
        draft.history_index++;
        draft.components = JSON.parse(JSON.stringify(draft.history[draft.history_index]));
        draft.is_dirty = true;
      }
      break;

    case 'SET_SNAP':
      draft.snap_ft = action.snap_ft;
      break;

    case 'LOAD_DESIGN':
      draft.components = action.components;
      draft.selected_id = null;
      draft.is_dirty = false;
      draft.history = [];
      draft.history_index = -1;
      break;

    case 'MARK_SAVED':
      draft.is_dirty = false;
      break;
  }
}

export function useDesignReducer(initialComponents: DesignComponent[] = []) {
  return useImmerReducer(designReducer, makeInitialState(initialComponents));
}
