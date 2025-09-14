import React, { useState, useEffect } from 'react';
import { validateForm, validators } from '../../utils/dataManager';

const DataManagementForm = ({ 
  title, 
  fields, 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  validationRules = {},
  isLoading = false,
  submitText = "सहेजें / Save",
  cancelText = "रद्द करें / Cancel"
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: null
      }));
    }
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));

    // Validate field on blur
    if (validationRules[fieldName]) {
      const validation = validateForm({ [fieldName]: formData[fieldName] }, { [fieldName]: validationRules[fieldName] });
      if (!validation.isValid) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: validation.errors[fieldName]
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate entire form
    const validation = validateForm(formData, validationRules);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setTouched(Object.keys(validationRules).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      return;
    }

    onSubmit(formData);
  };

  const renderField = (field) => {
    const { name, label, type, options, placeholder, required, disabled } = field;
    const value = formData[name] || '';
    const hasError = errors[name] && touched[name];

    const commonProps = {
      id: name,
      name,
      value,
      onChange: (e) => handleChange(name, e.target.value),
      onBlur: () => handleBlur(name),
      disabled: disabled || isLoading,
      className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
        hasError ? 'border-red-500' : 'border-gray-300'
      }`
    };

    switch (type) {
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
            placeholder={placeholder}
          />
        );

      case 'checkbox':
        return (
          <input
            type="checkbox"
            id={name}
            name={name}
            checked={value}
            onChange={(e) => handleChange(name, e.target.checked)}
            onBlur={() => handleBlur(name)}
            disabled={disabled || isLoading}
            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
        );

      case 'date':
      case 'datetime-local':
      case 'time':
        return (
          <input
            {...commonProps}
            type={type}
            placeholder={placeholder}
          />
        );

      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            placeholder={placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
          />
        );

      default:
        return (
          <input
            {...commonProps}
            type={type || 'text'}
            placeholder={placeholder}
          />
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
        {title}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div key={field.name} className={field.fullWidth ? 'md:col-span-2' : ''}>
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {renderField(field)}
              
              {errors[field.name] && touched[field.name] && (
                <div className="mt-1 text-sm text-red-600">
                  {Array.isArray(errors[field.name]) 
                    ? errors[field.name].join(', ')
                    : errors[field.name]
                  }
                </div>
              )}
              
              {field.helpText && (
                <div className="mt-1 text-sm text-gray-500">
                  {field.helpText}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
          >
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {submitText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DataManagementForm;
