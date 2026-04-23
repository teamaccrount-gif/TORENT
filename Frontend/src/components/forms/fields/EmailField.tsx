import React from 'react';
import { FormField } from '../../ui/formfield';
import { Input, type InputProps } from '../../ui/input';

interface EmailFieldProps extends InputProps {
  label?: string;
  errorMsg?: string;
}

export const EmailField: React.FC<EmailFieldProps> = ({ 
  label = "Email Address", 
  errorMsg, 
  id = "email", 
  ...props 
}) => {
  return (
    <FormField label={label} error={errorMsg} htmlFor={id}>
      <Input type="email" id={id} error={!!errorMsg} {...props} />
    </FormField>
  );
};
