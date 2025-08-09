import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type FieldType =
  | "text"
  | "number"
  | "date"
  | "checkbox"
  | "textarea"
  | "radio";

export interface Field {
  id: string;
  label: string;
  fieldType: FieldType;
  required: boolean;
  defaultValue?: any;
  options?: string[];      // For radio fields
  minLength?: number;      // For length validation
  maxLength?: number;      // For length validation
  pattern?: string;        // For custom regex validation
  fieldSubtype?: string;   // e.g., "email", "password"
}

export interface Form {
  id: string;
  name: string;
  fields: Field[];
  createdAt?: string;
}

export interface FormsState {
  savedForms: Form[];
}

const initialState: FormsState = {
  savedForms: [],
};

const formsSlice = createSlice({
  name: "forms",
  initialState,
  reducers: {
    saveForm: (state, action: PayloadAction<Form>) => {
      // Pushes a full form object into savedForms array
      state.savedForms.push({
        ...action.payload,
        createdAt: action.payload.createdAt || new Date().toISOString(),
      });
    },
    deleteForm: (state, action: PayloadAction<string>) => {
      // Removes form by ID
      state.savedForms = state.savedForms.filter(
        (form) => form.id !== action.payload
      );
    }
  },
});

export const { saveForm, deleteForm } = formsSlice.actions;
export default formsSlice.reducer;
