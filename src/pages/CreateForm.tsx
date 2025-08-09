import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { saveForm, FieldType, Field } from "../redux-states/slices/formSlices";
import { useNavigate } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "@hello-pangea/dnd";
import "./CreateForm.css";

const fieldTypes: { value: FieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "checkbox", label: "Checkbox" },
  { value: "textarea", label: "Textarea" },
  { value: "radio", label: "Radio" }
];

const CreateForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formName, setFormName] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [newFieldType, setNewFieldType] = useState<FieldType>("text");
  const [newFieldOptions, setNewFieldOptions] = useState("");
  const [newDefaultValue, setNewDefaultValue] = useState("");

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdFormId, setCreatedFormId] = useState("");

  // -------- Add Field ----------
  const addField = () => {
    const optionsArray =
      newFieldType === "radio"
        ? newFieldOptions.split(",").map(o => o.trim()).filter(Boolean)
        : undefined;

    const newField: Field = {
      id: Date.now().toString(),
      label: "Untitled",
      fieldType: newFieldType,
      required: false,
      defaultValue:
        newFieldType === "checkbox"
          ? false
          : newFieldType === "radio"
          ? ""
          : newDefaultValue || "",
      options: optionsArray,
      minLength: undefined,
      maxLength: undefined,
      fieldSubtype: undefined,
      pattern: undefined
    };
    setFields(prev => [...prev, newField]);
    setNewDefaultValue("");
    setNewFieldOptions("");
  };

  // -------- Update Field ----------
  const updateField = (id: string, key: keyof Field, value: any) => {
    setFields(prev =>
      prev.map(f => (f.id === id ? { ...f, [key]: value } : f))
    );
  };

  // -------- Delete Field ----------
  const deleteField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
  };

  // -------- Drag & Drop reorder ----------
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(fields);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setFields(reordered);
  };

  // -------- Validation ----------
  const validateForm = (): string | null => {
    if (!formName.trim()) return "Please enter a form name.";
    if (!fields.length) return "Please add at least one field.";

    for (let i = 0; i < fields.length; i++) {
  const field = fields[i];
      if (!field.label.trim()) return `Field ${i + 1} is missing a label.`;
      if (field.fieldType === "radio" && (!field.options || field.options.length < 2)) {
        return `Radio field "${field.label}" must have at least 2 options.`;
      }
      if (field.minLength && field.maxLength && field.minLength > field.maxLength) {
        return `Field "${field.label}" min length cannot exceed max length.`;
      }
      if (field.fieldSubtype === "password" && (!field.minLength || field.minLength < 8)) {
        return `Password field "${field.label}" must have at least 8 characters.`;
      }
    }
    return null;
  };

  // -------- Save ----------
  const saveFormHandler = () => {
    const err = validateForm();
    if (err) {
      alert(err);
      return;
    }
    const newId = Date.now().toString();
    dispatch(
      saveForm({
        id: newId,
        name: formName,
        fields,
        createdAt: new Date().toISOString()
      })
    );
    setCreatedFormId(newId);
    setShowSuccessDialog(true);
  };

  return (
    <div className="form-container">
      <h2>Create New Form</h2>

      {/* Form Name */}
      <div style={{ marginBottom: 12 }}>
        <label><strong>Form Name:</strong></label>
        <input
          type="text"
          className="form-input"
          value={formName}
          onChange={e => setFormName(e.target.value)}
        />
      </div>

      {/* Add Field Controls */}
      <div className="add-field-controls">
        <label>Field Type:</label>
        <select
          value={newFieldType}
          onChange={e => setNewFieldType(e.target.value as FieldType)}
        >
          {fieldTypes.map(ft => (
            <option key={ft.value} value={ft.value}>{ft.label}</option>
          ))}
        </select>

        {newFieldType !== "checkbox" && newFieldType !== "radio" && (
          <input
            type="text"
            placeholder="Default Value"
            value={newDefaultValue}
            onChange={e => setNewDefaultValue(e.target.value)}
          />
        )}

        {newFieldType === "radio" && (
          <input
            type="text"
            placeholder="Options (comma separated)"
            value={newFieldOptions}
            onChange={e => setNewFieldOptions(e.target.value)}
          />
        )}

        <button onClick={addField} className="btn btn-add">➕ Add Field</button>
      </div>
      <h3 style={{ marginTop: 20 }}>Fields</h3>
<p className="drag-hint">💡 Tip: Drag and drop fields to rearrange their order.</p>

      {/* Fields List with Drag & Drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="fieldsList">
          {(provided : any) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {fields.map((field, index) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(provided : any , snapshot : any) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="field-card"
                      style={{
                        background: snapshot.isDragging ? "#e3f2fd" : "#fff",
                        ...provided.draggableProps.style
                      }}
                    >
                      <input
                        type="text"
                        className="form-input"
                        value={field.label}
                        onChange={e => updateField(field.id, "label", e.target.value)}
                        placeholder="Field Label"
                      />

                      <label style={{ marginLeft: 8 }}>
                        Required:
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={e =>
                            updateField(field.id, "required", e.target.checked)
                          }
                        />
                      </label>

                      {field.fieldType !== "checkbox" && field.fieldType !== "radio" && (
                        <input
                          type="text"
                          value={field.defaultValue || ""}
                          onChange={e =>
                            updateField(field.id, "defaultValue", e.target.value)
                          }
                          placeholder="Default Value"
                          style={{ marginLeft: 8 }}
                        />
                      )}

                      {field.fieldType === "radio" && (
                        <input
                          type="text"
                          value={field.options?.join(", ") || ""}
                          onChange={e =>
                            updateField(
                              field.id,
                              "options",
                              e.target.value.split(",").map(o => o.trim())
                            )
                          }
                          placeholder="Options (comma separated)"
                          style={{ marginLeft: 8 }}
                        />
                      )}

                      {field.fieldType === "text" && (
                        <select
                          value={field.fieldSubtype || ""}
                          onChange={e =>
                            updateField(field.id, "fieldSubtype", e.target.value || undefined)
                          }
                          style={{ marginLeft: 8 }}
                        >
                          <option value="">Normal</option>
                          <option value="email">Email</option>
                          <option value="password">Password</option>
                        </select>
                      )}

                      {["text", "textarea", "password", "email"].includes(
                        field.fieldSubtype || field.fieldType
                      ) && (
                        <>
                          <input
                            type="number"
                            placeholder="Min Len"
                            value={field.minLength ?? ""}
                            onChange={e =>
                              updateField(
                                field.id,
                                "minLength",
                                e.target.value ? parseInt(e.target.value) : undefined
                              )
                            }
                            style={{ width: 80, marginLeft: 8 }}
                          />
                          <input
                            type="number"
                            placeholder="Max Len"
                            value={field.maxLength ?? ""}
                            onChange={e =>
                              updateField(
                                field.id,
                                "maxLength",
                                e.target.value ? parseInt(e.target.value) : undefined
                              )
                            }
                            style={{ width: 80, marginLeft: 4 }}
                          />
                        </>
                      )}

                      <button
                        onClick={() => deleteField(field.id)}
                        className="btn btn-danger"
                        style={{ marginLeft: 8 }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Save */}
      <button onClick={saveFormHandler} className="save-btn">
        💾 Save Form
      </button>

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>✅ Form Created Successfully!</h3>
            <p><strong>Name:</strong> {formName}</p>
            <div style={{ marginTop: 10 }}>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/preview/${createdFormId}`)}
                style={{ marginRight: 8 }}
              >
                Preview
              </button>
              <button
                className="btn btn-danger"
                onClick={() => setShowSuccessDialog(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateForm;
