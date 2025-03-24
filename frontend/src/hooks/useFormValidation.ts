import { useState, useCallback } from 'react';

type ValidationRules<T> = {
  [K in keyof T]?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: T[K], formValues: T) => boolean;
    message?: string;
  };
};

type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

export default function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules<T>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));
      
      // Mark field as touched when changed
      if (!touched[name as keyof T]) {
        setTouched((prev) => ({ ...prev, [name]: true }));
      }
      
      // Validate field on change
      validateField(name as keyof T, value);
    },
    [touched]
  );
  
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      validateField(name as keyof T, values[name as keyof T]);
    },
    [values]
  );
  
  const validateField = useCallback(
    (name: keyof T, value: any) => {
      const rules = validationRules[name];
      if (!rules) return;
      
      let error = '';
      
      // Required check
      if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        error = rules.message || 'This field is required';
      }
      
      // Min length check
      else if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        error = rules.message || `Must be at least ${rules.minLength} characters`;
      }
      
      // Max length check
      else if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        error = rules.message || `Must be less than ${rules.maxLength} characters`;
      }
      
      // Pattern check
      else if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        error = rules.message || 'Invalid format';
      }
      
      // Custom validation
      else if (rules.custom && !rules.custom(value, values)) {
        error = rules.message || 'Invalid value';
      }
      
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
      
      return error === '';
    },
    [values, validationRules]
  );
  
  const validateAll = useCallback(() => {
    let isValid = true;
    const newErrors: ValidationErrors<T> = {};
    const newTouched: Record<keyof T, boolean> = {} as Record<keyof T, boolean>;
    
    // Validate all fields
    Object.keys(validationRules).forEach((key) => {
      const fieldName = key as keyof T;
      const fieldValue = values[fieldName];
      const valid = validateField(fieldName, fieldValue);
      
      if (!valid) {
        isValid = false;
      }
      
      // Mark all fields as touched
      newTouched[fieldName] = true;
    });
    
    setTouched((prev) => ({ ...prev, ...newTouched }));
    
    return isValid;
  }, [values, validateField, validationRules]);
  
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
  }, [initialValues]);
  
  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setValues,
  };
} 