import { configureStore } from '@reduxjs/toolkit';
import formsReducer, { FormsState } from './slices/formSlices';

const LOCAL_STORAGE_KEY = 'savedForms';

// Load persisted state from localStorage
const loadStateFromLocalStorage = (): { forms: FormsState } | undefined => {
  try {
    const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!serializedState) return undefined;
    const savedFormsArray = JSON.parse(serializedState); // array
    return { forms: { savedForms: savedFormsArray } }; // wrap to match store
  } catch (error) {
    console.warn('Failed to load state from localStorage:', error);
    return undefined;
  }
};

// Save state to localStorage
const saveStateToLocalStorage = (state: { forms: FormsState }) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.forms.savedForms)); // save only array
  } catch (error) {
    console.warn('Failed to save state to localStorage:', error);
  }
};

const persistedState = loadStateFromLocalStorage();

export const store = configureStore({
  reducer: {
    forms: formsReducer,
  },
  preloadedState: persistedState,
});

store.subscribe(() => {
  saveStateToLocalStorage(store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
