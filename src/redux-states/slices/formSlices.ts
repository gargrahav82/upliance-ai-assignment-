import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Field {
  id: string;
  label: string;
  fieldType: string;
  required: boolean;
  defaultValue?: any;
}

export interface Form {
  id: string;
  name: string;
  fields: Field[];
  createdAt : string;
}

export interface FormsState {
  savedForms: Form[];
}

const initialState: FormsState = {
  savedForms: [],
};

const formsSlice = createSlice({
  name: 'forms',
  initialState,
  reducers: {
    // Now Action payload must include the `id` generated before dispatch
    saveForm: (state, action: PayloadAction<Form>) => {
      state.savedForms.push({
        ...action.payload,
        createdAt: action.payload.createdAt || new Date().toISOString(),
      });
    },
  },
});


export const { saveForm } = formsSlice.actions;
export default formsSlice.reducer;
