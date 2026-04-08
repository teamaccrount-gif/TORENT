import React from 'react';
import { FormField } from '../../ui/FormField';
import { Input, type InputProps } from '../../ui/Input';

interface PasswordFieldProps extends InputProps {
  label?: string;
  errorMsg?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({ 
  label = "Password", 
  errorMsg, 
  id = "password", 
  ...props 
}) => {
  return (
    <FormField label={label} error={errorMsg} htmlFor={id}>
      <Input type="password" id={id} error={!!errorMsg} {...props} />
    </FormField>
  );
};
