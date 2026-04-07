import React from 'react';
import { FormField } from '../../ui/FormField';
import { Input, type InputProps } from '../../ui/Input';

interface PhoneFieldProps extends InputProps {
  label?: string;
  errorMsg?: string;
}

export const PhoneField: React.FC<PhoneFieldProps> = ({ 
  label = "Phone Number", 
  errorMsg, 
  id = "phone", 
  ...props 
}) => {
  return (
    <FormField label={label} error={errorMsg} htmlFor={id}>
      <Input type="tel" id={id} error={!!errorMsg} {...props} />
    </FormField>
  );
};
