
// src/components/MyForms.tsx
import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../redux-states/store";

const MyForms = () => {
  // Get saved forms from Redux (already loaded from localStorage)
  const savedForms = useSelector((state: RootState) => state.forms.savedForms);

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
          border: "1px solid #ccc"
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
                {new Date().toLocaleDateString()}
              </td>
              <td style={{ padding: 8, border: "1px solid #ccc" }}>
                <Link to={`/preview/${form.id}`}>
                  <button>Preview</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyForms;
