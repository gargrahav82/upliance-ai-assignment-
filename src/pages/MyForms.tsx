// src/components/FormsList.tsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../redux-states/store";
import { deleteForm } from "../redux-states/slices/formSlices";

const FormsList: React.FC = () => {
  const savedForms = useSelector((state: RootState) => state.forms.savedForms);
  const dispatch = useDispatch();

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this form?")) {
      dispatch(deleteForm(id));
    }
  };

  if (!savedForms || savedForms.length === 0) {
    return <h3 style={{ textAlign: "center" }}>No forms saved yet.</h3>;
  }

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <h2>Saved Forms</h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 12,
          border: "1px solid #ccc",
        }}
      >
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={{ padding: 8, border: "1px solid #ccc" }}>Name</th>
            <th style={{ padding: 8, border: "1px solid #ccc" }}>Created</th>
            <th style={{ padding: 8, border: "1px solid #ccc" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {savedForms.map((form) => (
            <tr key={form.id}>
              <td style={{ padding: 8, border: "1px solid #ccc" }}>{form.name}</td>
              <td style={{ padding: 8, border: "1px solid #ccc" }}>
                {form.createdAt
                  ? new Date(form.createdAt).toLocaleString()
                  : "N/A"}
              </td>
              <td style={{ padding: 8, border: "1px solid #ccc" }}>
                <Link to={`/preview/${form.id}`}>
                  <button style={{ marginRight: 8 }}>Preview</button>
                </Link>
                <button
                  onClick={() => handleDelete(form.id)}
                  style={{ background: "red", color: "white", border: "none", padding: "4px 8px", cursor: "pointer" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FormsList;
