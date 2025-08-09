import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux-states/store";
import { Field } from "../redux-states/slices/formSlices";
import "./PreviewForm.css";

const PreviewForm: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const form = useSelector((state: RootState) =>
    state.forms.savedForms.find((f) => f.id === formId)
  );

  // Initial values
  const [values, setValues] = useState<Record<string, any>>(() => {
    const result: Record<string, any> = {};
    form?.fields.forEach((field) => {
      result[field.id] =
        field.fieldType === "checkbox"
          ? Boolean(field.defaultValue)
          : field.defaultValue || "";
    });
    return result;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  if (!form) {
    return <h3 className="no-form">Form not found</h3>;
  }

  // Validate individual fields
  const validateField = (value: any, field: Field): string | null => {
    const val = value !== undefined && value !== null ? value.toString() : "";

    // Required rule
    if (field.required) {
      if (field.fieldType === "checkbox" && !value) {
        return "This field is required.";
      } else if (val.trim() === "") {
        return "This field is required.";
      }
    }

    // Length rules for text-like inputs
    if (field.minLength && val.length < field.minLength) {
      return `Minimum length is ${field.minLength} characters.`;
    }
    if (field.maxLength && val.length > field.maxLength) {
      return `Maximum length is ${field.maxLength} characters.`;
    }

    // Subtype: email
    if (field.fieldSubtype === "email" && val) {
      const emailRGX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRGX.test(val)) return "Invalid email address.";
    }

    // Subtype: password
    if (field.fieldSubtype === "password" && val) {
      if (val.length < (field.minLength || 8)) {
        return `Password must be at least ${field.minLength || 8} characters.`;
      }
      const numRGX = /\d/;
      if (!numRGX.test(val)) {
        return "Password must contain at least one number.";
      }
    }

    // Radio required check
    if (field.fieldType === "radio" && field.required && !val) {
      return "Please select an option.";
    }

    return null; // passes validation
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    form.fields.forEach((field) => {
      const error = validateField(values[field.id], field);
      if (error) newErrors[field.id] = error;
    });
    return newErrors;
  };

  // Handle change
  const handleChange = (field: Field, val: any) => {
    setValues((prev) => ({ ...prev, [field.id]: val }));
  };

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const foundErrors = validateForm();
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length === 0) {
      setSuccess(true);
    } else {
      setSuccess(false);
    }
  };

  return (
    <div className="form-container">
      <h2>{form.name}</h2>
      <form onSubmit={handleSubmit}>
        {form.fields.map((field) => (
          <div className="field-card" key={field.id}>
            <label>
              {field.label} {field.required && <span className="required">*</span>}
            </label>

            {/* Render field types */}
            {field.fieldType === "text" && (
              <input
                type={field.fieldSubtype === "password" ? "password" :
                      field.fieldSubtype === "email" ? "email" : "text"}
                className="form-input"
                value={values[field.id]}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            )}

            {field.fieldType === "number" && (
              <input
                type="number"
                className="form-input"
                value={values[field.id]}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            )}

            {field.fieldType === "date" && (
              <input
                type="date"
                className="form-input"
                value={values[field.id]}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            )}

            {field.fieldType === "textarea" && (
              <textarea
                className="form-input"
                rows={4}
                value={values[field.id]}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            )}

            {field.fieldType === "checkbox" && (
              <input
                type="checkbox"
                checked={Boolean(values[field.id])}
                onChange={(e) => handleChange(field, e.target.checked)}
              />
            )}

            {field.fieldType === "radio" && field.options && (
              <div style={{ marginTop: 6 }}>
                {field.options.map((opt, idx) => (
                  <label key={idx} style={{ marginRight: 12 }}>
                    <input
                      type="radio"
                      name={field.id}
                      value={opt}
                      checked={values[field.id] === opt}
                      onChange={() => handleChange(field, opt)}
                    />{" "}
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {/* Error */}
            {errors[field.id] && (
              <div className="error-msg">{errors[field.id]}</div>
            )}
          </div>
        ))}

        <button type="submit" className="save-btn">
          Submit
        </button>

        {success && (
          <div className="success-msg">✅ Form submitted successfully!</div>
        )}
      </form>
    </div>
  );
};

export default PreviewForm;
