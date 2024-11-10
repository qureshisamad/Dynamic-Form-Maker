import React, { useState, useEffect } from 'react';
import { Plus, X, ChevronDown, ChevronUp, Save, Eye, EyeOff, Settings, Trash2, Edit, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { AddFieldButton } from '@/components/ui/addFieldButton';

// Extended field types
const FIELD_TYPES = {
  TEXT: 'text',
  TEXTAREA: 'textarea',
  EMAIL: 'email',
  PASSWORD: 'password',
  NUMBER: 'number',
  DROPDOWN: 'dropdown',
  RADIO: 'radio',
  FILE: 'file',
  CHECKBOX: 'checkbox',
  COUNTRY: 'country',
  DATE: 'date',
  TIME: 'time',
  PHONE: 'phone',
  URL: 'url',
  SECTION: 'section',
  RATING: 'rating',
  SLIDER: 'slider'
};

// Validation rules
const VALIDATION_RULES = {
  required: { message: 'This field is required' },
  email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' },
  minLength: { message: 'Minimum length not met' },
  maxLength: { message: 'Maximum length exceeded' },
  pattern: { message: 'Invalid format' },
  number: { pattern: /^\d+$/, message: 'Must be a number' },
  url: { pattern: /^https?:\/\/.+\..+/, message: 'Invalid URL format' },
  phone: { pattern: /^\+?[\d\s-]+$/, message: 'Invalid phone number' }
};

// Sample countries data
const COUNTRIES = [
  { code: 'US', name: 'United States', phoneCode: '+1' },
  { code: 'GB', name: 'United Kingdom', phoneCode: '+44' },
  { code: 'CA', name: 'Canada', phoneCode: '+1' },
  { code: 'AU', name: 'Australia', phoneCode: '+61' },
  { code: 'IN', name: 'India', phoneCode: '+91' },
  { code: 'DE', name: 'Germany', phoneCode: '+49' },
  { code: 'FR', name: 'France', phoneCode: '+33' },
  { code: 'JP', name: 'Japan', phoneCode: '+81' }
];

const DynamicFormBuilder = () => {
  const [formStructure, setFormStructure] = useState([]);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('builder');
  const [savedForms, setSavedForms] = useState([]);
  const [currentFormName, setCurrentFormName] = useState('');
  const [showValidationSettings, setShowValidationSettings] = useState(false);

  // Add new state for section management
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [draggedField, setDraggedField] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  // Enhanced load form function
  const loadForm = (form) => {
    try {
      // Update form structure with the saved form's structure
      setFormStructure(form.structure);
      
      // Reset form data and errors
      setFormData({});
      setErrors({});
      
      // Set the current form name
      setCurrentFormName(form.name);
      
      // Switch to builder tab
      setActiveTab('builder');
      
      // Reset validation settings panel
      setShowValidationSettings(false);
      
      // Show success message (you can add a toast notification here if you have one)
      console.log('Form loaded successfully:', form.name);
    } catch (error) {
      // Handle any potential errors during loading
      console.error('Error loading form:', error);
      // You can add error notification here
    }
  };

  // Save form function (updated to handle duplicates)
  const saveForm = () => {
    if (!currentFormName) return;
    
    // Check if a form with this name already exists
    const existingFormIndex = savedForms.findIndex(
      form => form.name === currentFormName
    );
    
    let newSavedForms;
    if (existingFormIndex >= 0) {
      // Update existing form
      newSavedForms = savedForms.map((form, index) => 
        index === existingFormIndex
          ? { name: currentFormName, structure: formStructure, date: new Date().toISOString() }
          : form
      );
    } else {
      // Add new form
      newSavedForms = [
        ...savedForms,
        { name: currentFormName, structure: formStructure, date: new Date().toISOString() }
      ];
    }
    
    setSavedForms(newSavedForms);
    localStorage.setItem('savedForms', JSON.stringify(newSavedForms));
  };

  // Render saved forms section (updated with better error handling)
  const renderSavedForms = () => {
    if (!savedForms.length) {
      return (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <p>No saved forms yet. Build a form and save it to see it here.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedForms.map((form, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{form.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Created: {format(new Date(form.date), 'PPP')}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Fields: {countFields(form.structure)}
              </p>
              <div className="mt-4 flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => loadForm(form)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Load
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    const newForms = savedForms.filter((_, i) => i !== index);
                    setSavedForms(newForms);
                    localStorage.setItem('savedForms', JSON.stringify(newForms));
                  }}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };


  // Helper function to count fields in a form
  const countFields = (structure) => {
    return structure.reduce((count, field) => {
      let fieldCount = 1;
      if (field.children) {
        fieldCount += countFields(field.children);
      }
      return count + fieldCount;
    }, 0);
  };

  // Enhanced useEffect for loading saved forms
  useEffect(() => {
    try {
      const saved = localStorage.getItem('savedForms');
      if (saved) {
        const parsedForms = JSON.parse(saved);
        // Validate the structure of loaded forms
        if (Array.isArray(parsedForms)) {
          setSavedForms(parsedForms);
        } else {
          console.error('Invalid saved forms structure');
          localStorage.removeItem('savedForms'); // Clear invalid data
        }
      }
    } catch (error) {
      console.error('Error loading saved forms:', error);
      localStorage.removeItem('savedForms'); // Clear invalid data
    }
  }, []);

    // Enhanced addField function to support sections
    const addField = (type, parentId = null) => {
      const newField = {
        id: `field-${Date.now()}`,
        type,
        label: type === FIELD_TYPES.SECTION ? 'New Section' : '',
        validations: {
          required: false
        },
        options: type === FIELD_TYPES.DROPDOWN || type === FIELD_TYPES.RADIO ? [] : undefined,
        conditions: [],
        children: type === FIELD_TYPES.SECTION ? [] : undefined,
        parentId
      };
  
      if (parentId) {
        setFormStructure(prev => updateChildren(prev, parentId, newField));
        // Automatically expand new sections
        if (type === FIELD_TYPES.SECTION) {
          setExpandedSections(prev => new Set([...prev, newField.id]));
        }
      } else {
        setFormStructure(prev => [...prev, newField]);
      }
    };
  
    // Toggle section expansion
    const toggleSection = (sectionId) => {
      setExpandedSections(prev => {
        const newSet = new Set(prev);
        if (newSet.has(sectionId)) {
          newSet.delete(sectionId);
        } else {
          newSet.add(sectionId);
        }
        return newSet;
      });
    };
  
    // Move field up in order
    const moveFieldUp = (fieldId, parentId = null) => {
      setFormStructure(prev => {
        const fields = parentId ? 
          findField(parentId, prev).children :
          prev;
        
        const index = fields.findIndex(f => f.id === fieldId);
        if (index <= 0) return prev;
  
        const newFields = [...fields];
        [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
  
        if (parentId) {
          return updateFieldRecursive(prev, parentId, { children: newFields });
        }
        return newFields;
      });
    };
  
    // Move field down in order
    const moveFieldDown = (fieldId, parentId = null) => {
      setFormStructure(prev => {
        const fields = parentId ? 
          findField(parentId, prev).children :
          prev;
        
        const index = fields.findIndex(f => f.id === fieldId);
        if (index === -1 || index === fields.length - 1) return prev;
  
        const newFields = [...fields];
        [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
  
        if (parentId) {
          return updateFieldRecursive(prev, parentId, { children: newFields });
        }
        return newFields;
      });
    };
  

    // Update field properties
    const updateField = (id, updates) => {
      setFormStructure(prev => updateFieldRecursive(prev, id, updates));
    };
  
    // Recursively update field in structure
    const updateFieldRecursive = (fields, id, updates) => {
      return fields.map(field => {
        if (field.id === id) {
          return { ...field, ...updates };
        }
        if (field.children) {
          return {
            ...field,
            children: updateFieldRecursive(field.children, id, updates)
          };
        }
        return field;
      });
    };
  
    // Remove field from structure
    const removeField = (id) => {
      setFormStructure(prev => removeFieldRecursive(prev, id));
    };
  
    // Recursively remove field
    const removeFieldRecursive = (fields, id) => {
      return fields.filter(field => {
        if (field.id === id) {
          return false;
        }
        if (field.children) {
          field.children = removeFieldRecursive(field.children, id);
        }
        return true;
      });
    };
  
    // Update field validation rules
    const updateValidation = (id, rule, value) => {
      setFormStructure(prev => updateFieldRecursive(prev, id, {
        validations: {
          ...findField(id, prev)?.validations,
          [rule]: value
        }
      }));
    };
  
    // Add new option to dropdown/radio field
    const addOption = (id) => {
      const field = findField(id, formStructure);
      if (field && (field.type === FIELD_TYPES.DROPDOWN || field.type === FIELD_TYPES.RADIO)) {
        updateField(id, {
          options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`]
        });
      }
    };
  
    // Update option in dropdown/radio field
    const updateOption = (id, index, value) => {
      const field = findField(id, formStructure);
      if (field && field.options) {
        const newOptions = [...field.options];
        newOptions[index] = value;
        updateField(id, { options: newOptions });
      }
    };
  
    // Remove option from dropdown/radio field
    const removeOption = (id, index) => {
      const field = findField(id, formStructure);
      if (field && field.options) {
        updateField(id, {
          options: field.options.filter((_, i) => i !== index)
        });
      }
    };
  
    // Add new condition
    const addCondition = (id) => {
      const field = findField(id, formStructure);
      if (field) {
        updateField(id, {
          conditions: [
            ...(field.conditions || []),
            { targetField: '', operator: 'equals', value: '' }
          ]
        });
      }
    };
  
    // Update condition
    const updateCondition = (id, index, key, value) => {
      const field = findField(id, formStructure);
      if (field && field.conditions) {
        const newConditions = [...field.conditions];
        newConditions[index] = {
          ...newConditions[index],
          [key]: value
        };
        updateField(id, { conditions: newConditions });
      }
    };
  
    // Remove condition
    const removeCondition = (id, index) => {
      const field = findField(id, formStructure);
      if (field && field.conditions) {
        updateField(id, {
          conditions: field.conditions.filter((_, i) => i !== index)
        });
      }
    };

  // Validate field
  const validateField = (field, value) => {
    const errors = [];
    
    if (field.validations) {
      Object.entries(field.validations).forEach(([rule, config]) => {
        switch (rule) {
          case 'required':
            if (config && !value) {
              errors.push(VALIDATION_RULES.required.message);
            }
            break;
          case 'minLength':
            if (value?.length < config) {
              errors.push(`${VALIDATION_RULES.minLength.message} (${config} characters)`);
            }
            break;
          case 'maxLength':
            if (value?.length > config) {
              errors.push(`${VALIDATION_RULES.maxLength.message} (${config} characters)`);
            }
            break;
          case 'pattern':
            if (config && !new RegExp(config).test(value)) {
              errors.push(VALIDATION_RULES.pattern.message);
            }
            break;
          case 'email':
            if (config && !VALIDATION_RULES.email.pattern.test(value)) {
              errors.push(VALIDATION_RULES.email.message);
            }
            break;
          case 'url':
            if (config && !VALIDATION_RULES.url.pattern.test(value)) {
              errors.push(VALIDATION_RULES.url.message);
            }
            break;
          case 'phone':
            if (config && !VALIDATION_RULES.phone.pattern.test(value)) {
              errors.push(VALIDATION_RULES.phone.message);
            }
            break;
        }
      });
    }

    return errors;
  };

  // Handle form data changes with validation
  const handleDataChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    
    const field = findField(id, formStructure);
    if (field) {
      const fieldErrors = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [id]: fieldErrors
      }));
    }
  };

  // Find field by ID in structure
  const findField = (id, fields) => {
    for (const field of fields) {
      if (field.id === id) return field;
      if (field.children) {
        const found = findField(id, field.children);
        if (found) return found;
      }
    }
    return null;
  };

  // Update children recursively
  const updateChildren = (items, parentId, newField) => {
    return items.map(item => {
      if (item.id === parentId) {
        return {
          ...item,
          children: [...(item.children || []), newField]
        };
      }
      if (item.children) {
        return {
          ...item,
          children: updateChildren(item.children, parentId, newField)
        };
      }
      return item;
    });
  };

  // Render field
  const renderField = (field) => {
    // if (!evaluateConditions(field)) return null;

    const commonProps = {
      id: field.id,
      required: field.validations?.required,
      className: `w-full p-2 border rounded ${errors[field.id]?.length ? 'border-red-500' : 'border-gray-200'}`,
      value: formData[field.id] || '',
      onChange: (e) => handleDataChange(field.id, e.target.value)
    };

    let fieldComponent;
    switch (field.type) {
      case FIELD_TYPES.TEXT:
      case FIELD_TYPES.EMAIL:
      case FIELD_TYPES.PASSWORD:
      case FIELD_TYPES.URL:
        fieldComponent = (
          <Input
            type={field.type}
            {...commonProps}
          />
        );
        break;

      case FIELD_TYPES.TEXTAREA:
        fieldComponent = (
          <textarea
            {...commonProps}
            rows={4}
          />
        );
        break;

      case FIELD_TYPES.NUMBER:
        fieldComponent = (
          <Input
            type="number"
            {...commonProps}
            min={field.min}
            max={field.max}
          />
        );
        break;

      case FIELD_TYPES.DROPDOWN:
        fieldComponent = (
          <Select
            value={formData[field.id] || ''}
            onValueChange={(value) => handleDataChange(field.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, idx) => (
                <SelectItem key={idx} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        break;

      case FIELD_TYPES.RADIO:
        fieldComponent = (
          <div className="space-y-2">
            {field.options?.map((option, idx) => (
              <Label key={idx} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={formData[field.id] === option}
                  onChange={(e) => handleDataChange(field.id, e.target.value)}
                />
                <span>{option}</span>
              </Label>
            ))}
          </div>
        );
        break;

      case FIELD_TYPES.CHECKBOX:
        fieldComponent = (
          <Switch
            checked={formData[field.id] || false}
            onCheckedChange={(checked) => handleDataChange(field.id, checked)}
          />
        );
        break;

      case FIELD_TYPES.DATE:
        fieldComponent = (
          <Input
            type="date"
            {...commonProps}
          />
        );
        break;

      case FIELD_TYPES.TIME:
        fieldComponent = (
          <Input
            type="time"
            {...commonProps}
          />
        );
        break;

      case FIELD_TYPES.PHONE:
        fieldComponent = (
          <div className="flex space-x-2">
            <Select
              value={formData[`${field.id}-code`] || ''}
              onValueChange={(value) => handleDataChange(`${field.id}-code`, value)}
              className="w-32"
            >
              <SelectTrigger>
                <SelectValue placeholder="Code" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.phoneCode}>
                    {country.name} ({country.phoneCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="tel"
              className="flex-1"
              value={formData[field.id] || ''}
              onChange={(e) => handleDataChange(field.id, e.target.value)}
            />
          </div>
        );
        break;

      case FIELD_TYPES.FILE:
        fieldComponent = (
          <Input
            type="file"
            onChange={(e) => handleDataChange(field.id, e.target.files[0]?.name)}
          />
        );
        break;

      case FIELD_TYPES.RATING:
        fieldComponent = (
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                className={`p-2 rounded ${
                  formData[field.id] === rating ? 'bg-yellow-400' : 'bg-gray-200'
                }`}
                onClick={() => handleDataChange(field.id, rating)}
              >
                {rating}
              </button>
            ))}
          </div>
        );
        break;

      case FIELD_TYPES.SLIDER:
        fieldComponent = (
          <Input
            type="range"
            min={field.min || 0}
            max={field.max || 100}
            step={field.step || 1}
            {...commonProps}
          />
        );
        break;

      default:
        fieldComponent = null;
    }

    return (
      <div className="space-y-2">
        <Label>
          {field.label}
          {field.validations?.required && <span className="text-red-500">*</span>}
        </Label>
        {fieldComponent}
        {errors[field.id]?.map((error, index) => (
          <Alert variant="destructive" key={index}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ))}
      </div>
    );
  };

  const renderBuilder = (fields, parentId = null, level = 0) => {
    return (
      <TooltipProvider>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card
              key={field.id}
              className={`relative ${level > 0 ? 'ml-6' : ''}`}
              draggable
              onDragStart={(e) => {
                setDraggedField({ field, parentId });
                e.dataTransfer.setData('text/plain', ''); // Required for Firefox
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDropTarget({ field, parentId });
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedField && dropTarget && draggedField.field.id !== dropTarget.field.id) {
                  // Handle field reordering logic here
                  const sourceParentId = draggedField.parentId;
                  const targetParentId = dropTarget.parentId;
                  
                  setFormStructure(prev => {
                    let newStructure = [...prev];
                    
                    // Remove from source
                    const sourceFields = sourceParentId ? 
                      findField(sourceParentId, newStructure).children :
                      newStructure;
                    const fieldToMove = sourceFields.find(f => f.id === draggedField.field.id);
                    sourceFields.splice(sourceFields.indexOf(fieldToMove), 1);
                    
                    // Add to target
                    const targetFields = targetParentId ?
                      findField(targetParentId, newStructure).children :
                      newStructure;
                    const targetIndex = targetFields.indexOf(dropTarget.field);
                    targetFields.splice(targetIndex + 1, 0, fieldToMove);
                    
                    return newStructure;
                  });
                }
                setDraggedField(null);
                setDropTarget(null);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {field.type === FIELD_TYPES.SECTION && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleSection(field.id)}
                      >
                        {expandedSections.has(field.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <Input
                      type="text"
                      placeholder={field.type === FIELD_TYPES.SECTION ? "Section Name" : "Field Label"}
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      className="w-64"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveFieldUp(field.id, parentId)}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Move Up</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveFieldDown(field.id, parentId)}
                          disabled={index === fields.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Move Down</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowValidationSettings(field.id)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Field Settings</TooltipContent>
                    </Tooltip>

                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeField(field.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Show validation settings if this field is selected */}
                {showValidationSettings === field.id &&  (
                <div className="mb-4 p-4 bg-gray-50 rounded">
                  <h4 className="font-medium mb-2">Validation Rules</h4><div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Label className="flex items-center space-x-2">
                        <Switch
                          checked={field.validations?.required || false}
                          onCheckedChange={(checked) => updateValidation(field.id, 'required', checked)}
                        />
                        <span>Required</span>
                      </Label>

                      {(field.type === FIELD_TYPES.TEXT || field.type === FIELD_TYPES.TEXTAREA) && (
                        <>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              placeholder="Min Length"
                              className="w-24"
                              value={field.validations?.minLength || ''}
                              onChange={(e) => updateValidation(field.id, 'minLength', parseInt(e.target.value))}
                            />
                            <span>Min Length</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              placeholder="Max Length"
                              className="w-24"
                              value={field.validations?.maxLength || ''}
                              onChange={(e) => updateValidation(field.id, 'maxLength', parseInt(e.target.value))}
                            />
                            <span>Max Length</span>
                          </div>
                        </>
                      )}
                    </div>

                    {field.type === FIELD_TYPES.EMAIL && (
                      <Label className="flex items-center space-x-2">
                        <Switch
                          checked={field.validations?.email || false}
                          onCheckedChange={(checked) => updateValidation(field.id, 'email', checked)}
                        />
                        <span>Email Validation</span>
                      </Label>
                    )}

                    {field.type === FIELD_TYPES.URL && (
                      <Label className="flex items-center space-x-2">
                        <Switch
                          checked={field.validations?.url || false}
                          onCheckedChange={(checked) => updateValidation(field.id, 'url', checked)}
                        />
                        <span>URL Validation</span>
                      </Label>
                    )}

                    {field.type === FIELD_TYPES.PHONE && (
                      <Label className="flex items-center space-x-2">
                        <Switch
                          checked={field.validations?.phone || false}
                          onCheckedChange={(checked) => updateValidation(field.id, 'phone', checked)}
                        />
                        <span>Phone Number Validation</span>
                      </Label>
                    )}

                    <div className="mt-4">
                      <Label>Conditional Display</Label>
                      <div className="space-y-2 mt-2">
                        {field.conditions?.map((condition, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Select
                              value={condition.targetField}
                              onValueChange={(value) => updateCondition(field.id, index, 'targetField', value)}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select field" />
                              </SelectTrigger>
                              <SelectContent>
                                {formStructure
                                  .filter(f => f.id !== field.id)
                                  .map(f => (
                                    <SelectItem key={f.id} value={f.id}>
                                      {f.label || 'Unnamed Field'}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={condition.operator}
                              onValueChange={(value) => updateCondition(field.id, index, 'operator', value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Operator" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equals">Equals</SelectItem>
                                <SelectItem value="notEquals">Not Equals</SelectItem>
                                <SelectItem value="contains">Contains</SelectItem>
                                <SelectItem value="greaterThan">Greater Than</SelectItem>
                                <SelectItem value="lessThan">Less Than</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Value"
                              value={condition.value}
                              onChange={(e) => updateCondition(field.id, index, 'value', e.target.value)}
                              className="w-40"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => removeCondition(field.id, index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addCondition(field.id)}
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Condition
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

                {/* Render section content if expanded */}
                {field.type === FIELD_TYPES.SECTION && expandedSections.has(field.id) && (
                  <div className="mt-4 pl-4 border-l-2 border-gray-200">
                    {renderBuilder(field.children || [], field.id, level + 1)}
                    <div className="mt-4 flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => addField(FIELD_TYPES.SECTION, field.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Section
                      </Button>
                      <AddFieldButton onAddField={addField} parentId={parentId} />
                    </div>
                  </div>
                )}

                {/* Render other field type specific content */}
                {(field.type === FIELD_TYPES.DROPDOWN || field.type === FIELD_TYPES.RADIO) && (
                <div className="pl-4 mt-4 border-l-2 border-gray-200">
                  {renderBuilder(field.children || [], field.id)}
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => addField(FIELD_TYPES.TEXT, field.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Field to Section
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      </TooltipProvider>
    );
  };

  // Enhanced preview renderer to handle nested fields
  const renderPreview = (fields = formStructure, level = 0) => {
    return (
      <div className={`space-y-6 ${level > 0 ? 'ml-6' : ''}`}>
        {fields.map(field => {
          if (field.type === FIELD_TYPES.SECTION) {
            return (
              <Card key={field.id} className="p-4">
                <CardHeader>
                  <CardTitle>{field.label || 'Unnamed Section'}</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderPreview(field.children, level + 1)}
                </CardContent>
              </Card>
            );
          }
          return (
            <div key={field.id}>
              {renderField(field)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dynamic Form Maker</h1>
        <p className="text-gray-600 mt-2">Create, Preview, and Manage Dynamic Forms with Ease</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="saved">Saved Forms</TabsTrigger>
        </TabsList>
  
        <TabsContent value="builder">
          <div className="mb-4 flex items-center space-x-4">
            <Input
              placeholder="Form Name"
              value={currentFormName}
              onChange={(e) => setCurrentFormName(e.target.value)}
              className="w-64"
            />
            <Button onClick={saveForm} disabled={!currentFormName}>
              <Save className="h-4 w-4 mr-2" />
              Save Form
            </Button>
            <div className="flex-1" />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => addField(FIELD_TYPES.SECTION)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
              <AddFieldButton onAddField={addField} parentId={null} />
            </div>
          </div>
          {renderBuilder(formStructure)}
        </TabsContent>
  
        <TabsContent value="preview">
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Form Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                console.log('Form Data:', formData);
              }}>
                {renderPreview()}
                <Button type="submit" className="mt-6">Submit Form</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="saved">
          {renderSavedForms()}
        </TabsContent>
      </Tabs>
  
      <footer className="mt-12 border-t pt-6">
        <div className="text-center">
          <p className="text-gray-700 font-medium mb-2">Created by Samad Ali Qureshi</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>Built with:</span>
            <a href="https://react.dev" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">React</a>
            <span>•</span>
            <a href="https://ui.shadcn.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">shadcn/ui</a>
            <span>•</span>
            <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Tailwind CSS</a>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            A powerful form builder for creating dynamic and interactive forms
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DynamicFormBuilder;

