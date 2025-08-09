import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Box,
  List,
  ListItem,
  IconButton,
  Checkbox,
  FormControlLabel,
  Paper,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch } from 'react-redux';
import { saveForm as saveFormAction } from '../redux-states/slices/formSlices';

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';

import { create, all } from 'mathjs';
import { Link } from 'react-router-dom';
const math = create(all, {});

// Types

type FieldType = 'text' | 'number' | 'date' | 'checkbox' | 'derived';

interface Validations {
  minLength?: number;
  maxLength?: number;
  isEmail?: boolean;
  isPasswordRule?: boolean;
  min?: number | string;
  max?: number | string;
}

interface Field {
  id: string;
  label: string;
  fieldType: FieldType;
  required: boolean;
  defaultValue?: string | number | boolean;
  validations?: Validations;
  // Derived field properties
  isDerived?: boolean;
  parentFieldIds?: string[];
  formula?: string;
}

// Constants
const fieldTypes: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'derived', label: 'Derived Field' },
];

const CreateForm: React.FC = () => {
  const [formName, setFormName] = useState('');
  const [formId , setFormId] = useState<string>((Date.now()).toString())
  const [fields, setFields] = useState<Field[]>([]);
  const [newFieldType, setNewFieldType] = useState<FieldType>('text');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const dispatch = useDispatch();

  // Add new field handler
  const addField = () => {
    const newField: Field = {
      id: Date.now().toString(),
      label: 'Untitled',
      fieldType: newFieldType,
      required: false,
      defaultValue:
        newFieldType === 'checkbox' ? false : newFieldType === 'number' ? 0 : '',
      validations: {},
      isDerived: newFieldType === 'derived',
      parentFieldIds: newFieldType === 'derived' ? [] : undefined,
      formula: newFieldType === 'derived' ? '' : undefined,
    };
    setFields((prev) => [...prev, newField]);
  };

  // Update field top-level property (label, required, defaultValue)
  const updateField = (id: string, key: keyof Field, value: any) => {
    setFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, [key]: value } : field))
    );
  };

  // Update validations nested object
  const updateValidation = (id: string, key: keyof Validations, value: any) => {
    setFields((prev) =>
      prev.map((field) => {
        if (field.id === id) {
          return {
            ...field,
            validations: {
              ...field.validations,
              [key]: value,
            },
          };
        }
        return field;
      })
    );
  };

  // Update parent fields for derived
  const updateParentFields = (id: string, parents: string[]) => {
    setFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, parentFieldIds: parents } : field))
    );
  };

  // Update formula for derived field
  const updateFormula = (id: string, formula: string) => {
    setFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, formula } : field))
    );
  };

  // Delete field by id
  const deleteField = (id: string) => {
    setFields((prev) => prev.filter((field) => field.id !== id));
  };

  // Derived fields recalculation using mathjs on any related changes
 useEffect(() => {
  setFields(prevFields => {
    let updated = false;

    const valuesMap: Record<string, any> = {};

    prevFields.forEach((field) => {
      if (!field.isDerived) {
        if (field.fieldType === 'checkbox') {
          valuesMap[field.id] = field.defaultValue ? 1 : 0;
        } else if (field.fieldType === 'number') {
          valuesMap[field.id] =
            field.defaultValue !== '' && field.defaultValue !== undefined
              ? Number(field.defaultValue)
              : 0;
        } else if (field.fieldType === 'date') {
          const dateVal = field.defaultValue as string;
          valuesMap[field.id] = dateVal ? new Date(dateVal).getTime() : 0;
        } else {
          valuesMap[field.id] = field.defaultValue || 0;
        }
      }
    });

    const newFields = prevFields.map(field => {
      if (
        field.isDerived &&
        field.formula &&
        field.parentFieldIds &&
        field.parentFieldIds.length > 0
      ) {
        try {
          const scope: Record<string, any> = {};
          field.parentFieldIds.forEach(pid => {
            scope[pid] = valuesMap[pid] ?? 0;
          });
          scope['now'] = Date.now();

          const result = math.evaluate(field.formula, scope);

          const newValue = result === undefined || result === null ? '' : result.toString();

          if (field.defaultValue !== newValue) {
            updated = true;
            return { ...field, defaultValue: newValue };
          }
        } catch (e) {
          if (field.defaultValue !== 'Formula error') {
            updated = true;
            return { ...field, defaultValue: 'Formula error' };
          }
        }
      }
      return field;
    });

    return updated ? newFields : prevFields;
  });
}, [fields]);

useEffect(() => {
  console.log('Fields changed:', fields);
}, [fields]);

  // Drag and drop handler
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(fields);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    setFields(reordered);
  };

  // Validation before saving (basic)
  const validateForm = (): string | null => {
    if (!formName.trim()) return 'Form name is required';
    if (fields.length === 0) return 'Add at least one field';

    // Additional validation can be added here

    return null;
  };

  // Save form handler
  const saveForm = () => {
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }
    const formData = { formId , formName, fields };
    dispatch(saveFormAction({ id : formId , name: formName, fields , createdAt : Date.now().toString() }));
    setShowSuccessDialog(true);
    console.log('Form saved:', formData);
    alert('Form saved! Check console for details.');
  };

  const handleCloseDialog = () => {
    setShowSuccessDialog(false);
  };

  const parentFieldOptions = fields.filter(f => !f.isDerived && f.fieldType !== 'checkbox');

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom>
        Create New Form
      </Typography>

      {/* Form Name */}
      <TextField
        label="Form Name"
        fullWidth
        margin="normal"
        value={formName}
        onChange={e => setFormName(e.target.value)}
      />

      {/* Add Field Controls */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <TextField
          select
          label="Field Type"
          size="small"
          value={newFieldType}
          onChange={e => setNewFieldType(e.target.value as FieldType)}
        >
          {fieldTypes.map(({ value, label }) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="contained" onClick={addField}>
          Add Field
        </Button>
      </Box>

      {/* Fields List with Drag and Drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable-fields">
          {(provided : any) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {fields.map((field, index) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(provided : any, snapshot : any) => (
                    <Paper
                      elevation={snapshot.isDragging ? 6 : 1}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      sx={{
                        mb: 2,
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: snapshot.isDragging ? 'lightblue' : 'white',
                      }}
                    >
                      {/* Field Label */}
                      <TextField
                        label="Field Label"
                        size="small"
                        sx={{ mb: 1, width: '100%' }}
                        value={field.label}
                        onChange={e => updateField(field.id, 'label', e.target.value)}
                        disabled={field.isDerived}
                      />

                      {/* Required checkbox for non-derived */}
                      {!field.isDerived && (
                        <FormControlLabel
                          sx={{ mb: 1 }}
                          control={
                            <Checkbox
                              checked={field.required}
                              onChange={e =>
                                updateField(field.id, 'required', e.target.checked)
                              }
                            />
                          }
                          label="Required"
                        />
                      )}

                      {/* Default Value - type dependent and read-only for derived */}
                      {!field.isDerived && (
                        <>
                          {field.fieldType === 'text' && (
                            <TextField
                              label="Default Value"
                              size="small"
                              sx={{ mb: 1, width: '100%' }}
                              value={field.defaultValue as string || ''}
                              onChange={e =>
                                updateField(field.id, 'defaultValue', e.target.value)
                              }
                            />
                          )}
                          {field.fieldType === 'number' && (
                            <TextField
                              label="Default Value"
                              type="number"
                              size="small"
                              sx={{ mb: 1, width: '100%' }}
                              value={field.defaultValue !== undefined ? field.defaultValue : ''}
                              onChange={e =>
                                updateField(
                                  field.id,
                                  'defaultValue',
                                  e.target.value === '' ? '' : Number(e.target.value)
                                )
                              }
                            />
                          )}
                          {field.fieldType === 'date' && (
                            <TextField
                              label="Default Value"
                              type="date"
                              size="small"
                              sx={{ mb: 1, width: '100%' }}
                              value={field.defaultValue as string || ''}
                              onChange={e =>
                                updateField(field.id, 'defaultValue', e.target.value)
                              }
                              InputLabelProps={{ shrink: true }}
                            />
                          )}
                          {field.fieldType === 'checkbox' && (
                            <FormControlLabel
                              label="Default Checked"
                              sx={{ mb: 1 }}
                              control={
                                <Checkbox
                                  checked={Boolean(field.defaultValue)}
                                  onChange={e =>
                                    updateField(field.id, 'defaultValue', e.target.checked)
                                  }
                                  size="small"
                                />
                              }
                            />
                          )}
                        </>
                      )}
                      {field.isDerived && (
                        <TextField
                          label="Computed Value"
                          value={field.defaultValue?.toString() || ''}
                          size="small"
                          sx={{ mb: 1, width: '100%' }}
                          InputProps={{ readOnly: true }}
                        />
                      )}

                      {/* Validation UI (only for non-derived) */}
                      {!field.isDerived && (
                        <>
                          {/* Text field validations */}
                          {field.fieldType === 'text' && (
                            <>
                              <TextField
                                label="Min Length"
                                type="number"
                                size="small"
                                sx={{ mb: 1, width: '100%' }}
                                value={field.validations?.minLength ?? ''}
                                onChange={e =>
                                  updateValidation(
                                    field.id,
                                    'minLength',
                                    e.target.value === ''
                                      ? undefined
                                      : Number(e.target.value)
                                  )
                                }
                                inputProps={{ min: 0 }}
                              />
                              <TextField
                                label="Max Length"
                                type="number"
                                size="small"
                                sx={{ mb: 1, width: '100%' }}
                                value={field.validations?.maxLength ?? ''}
                                onChange={e =>
                                  updateValidation(
                                    field.id,
                                    'maxLength',
                                    e.target.value === ''
                                      ? undefined
                                      : Number(e.target.value)
                                  )
                                }
                                inputProps={{ min: 0 }}
                              />
                              <FormControlLabel
                                sx={{ mb: 1 }}
                                control={
                                  <Checkbox
                                    checked={field.validations?.isEmail || false}
                                    onChange={e =>
                                      updateValidation(field.id, 'isEmail', e.target.checked)
                                    }
                                    size="small"
                                  />
                                }
                                label="Validate as Email"
                              />
                              <FormControlLabel
                                sx={{ mb: 1 }}
                                control={
                                  <Checkbox
                                    checked={field.validations?.isPasswordRule || false}
                                    onChange={e =>
                                      updateValidation(field.id, 'isPasswordRule', e.target.checked)
                                    }
                                    size="small"
                                  />
                                }
                                label="Custom Password Rule (Min 8 chars, must contain a number)"
                              />
                            </>
                          )}

                          {/* Number validations */}
                          {field.fieldType === 'number' && (
                            <>
                              <TextField
                                label="Min Value"
                                type="number"
                                size="small"
                                sx={{ mb: 1, width: '100%' }}
                                value={field.validations?.min ?? ''}
                                onChange={e =>
                                  updateValidation(
                                    field.id,
                                    'min',
                                    e.target.value === '' ? undefined : Number(e.target.value)
                                  )
                                }
                              />
                              <TextField
                                label="Max Value"
                                type="number"
                                size="small"
                                sx={{ mb: 1, width: '100%' }}
                                value={field.validations?.max ?? ''}
                                onChange={e =>
                                  updateValidation(
                                    field.id,
                                    'max',
                                    e.target.value === '' ? undefined : Number(e.target.value)
                                  )
                                }
                              />
                            </>
                          )}

                          {/* Date validations */}
                          {field.fieldType === 'date' && (
                            <>
                              <TextField
                                label="Min Date"
                                type="date"
                                size="small"
                                sx={{ mb: 1, width: '100%' }}
                                value={field.validations?.min ?? ''}
                                onChange={e =>
                                  updateValidation(field.id, 'min', e.target.value || undefined)
                                }
                                InputLabelProps={{ shrink: true }}
                              />
                              <TextField
                                label="Max Date"
                                type="date"
                                size="small"
                                sx={{ mb: 1, width: '100%' }}
                                value={field.validations?.max ?? ''}
                                onChange={e =>
                                  updateValidation(field.id, 'max', e.target.value || undefined)
                                }
                                InputLabelProps={{ shrink: true }}
                              />
                            </>
                          )}
                        </>
                      )}

                      {/* Derived Field specific UI */}
                      {field.isDerived && (
                        <>
                          <Autocomplete
                            multiple
                            options={parentFieldOptions}
                            getOptionLabel={(opt) => opt.label}
                            value={field.parentFieldIds
                              ? parentFieldOptions.filter((opt) =>
                                field.parentFieldIds!.includes(opt.id))
                              : []}
                            onChange={(_, newParents) =>
                              updateParentFields(
                                field.id,
                                newParents.map((f) => f.id)
                              )
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                size="small"
                                label="Select Parent Fields"
                                sx={{ mb: 1, width: '100%' }}
                              />
                            )}
                          />
                          <TextField
                            label="Formula"
                            multiline
                            minRows={2}
                            size="small"
                            sx={{ mb: 1, width: '100%' }}
                            value={field.formula || ''}
                            placeholder={`Example: parentId1 + parentId2 * 2`}
                            onChange={e => updateFormula(field.id, e.target.value)}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                            Use parent field IDs in formula. e.g: <br />
                            <code>fieldId1 + fieldId2 * 2</code> <br />
                            For dates: Use timestamps (ms). <code>floor((now - fieldId) / (365.25*24*3600*1000))</code> to calculate age.
                          </Typography>
                        </>
                      )}

                      {/* Type display and Delete */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Type: {field.fieldType}
                        </Typography>
                        <IconButton
                          aria-label="delete"
                          color="error"
                          onClick={() => deleteField(field.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Paper>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Button variant="contained" color="primary" onClick={saveForm}>
        Save Form
      </Button>

      <Dialog open={showSuccessDialog} onClose={handleCloseDialog}>
        <DialogTitle>Form Saved Successfully</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Your form {formName} has been saved successfully.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Link to={`/preview/${formId}`}>
          <Button variant="contained">
            Preview Form
          </Button>
          </Link>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default CreateForm;
