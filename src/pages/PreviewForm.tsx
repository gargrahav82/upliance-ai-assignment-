// src/components/PreviewForm.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux-states/store';

const PreviewForm = () => {
  const { formId } = useParams<{ formId: string }>();

  const form = useSelector((state: RootState) =>
    state.forms.savedForms.find(f => f.id === formId)
  );

  if (!form) return <h2>Form not found</h2>;

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>Preview: {form.name}</h2>
      <form>
        {form.fields.map(field => (
          <div key={field.id} style={{ marginBottom: 12 }}>
            <label>
              {field.label} {field.required && '*'}
            </label>
            {field.fieldType === 'text' && (
              <input type="text" defaultValue={field.defaultValue as string} />
            )}
            {field.fieldType === 'number' && (
              <input type="number" defaultValue={field.defaultValue as number} />
            )}
            {field.fieldType === 'date' && (
              <input type="date" defaultValue={field.defaultValue as string} />
            )}
            {field.fieldType === 'checkbox' && (
              <input type="checkbox" checked={Boolean(field.defaultValue)} />
            )}
          </div>
        ))}
      </form>
    </div>
  );
};

export default PreviewForm;
