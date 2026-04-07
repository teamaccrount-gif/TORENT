import React, { useState } from 'react';
import { useAppDispatch } from '../../Redux/Store';
import { registerRM, registerCM, registerSM } from '../../Redux/Slices/registrationSlice';

import { EmailField } from './fields/EmailField';
import { PasswordField } from './fields/PasswordField';
import { PhoneField } from './fields/PhoneField';
import { CitySelector } from './CitySelector';
import { StationSelector } from './StationSelector';
import { Button } from '../ui/Button';
import type { RegistrationPayload, Role } from '../../types';

type FieldConfig = {
  name: string;
  Component: React.ElementType;
  props: object;
  colSpan?: number;
};

interface RegistrationFormProps {
  targetRole: Role;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ targetRole }) => {
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [cityIds, setCityIds] = useState<string[]>([]);
  const [stationId, setStationId] = useState<string>('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (targetRole === 'REGION_MANAGER' && cityIds.length === 0) {
      setErrorMsg('Please select at least one assigned city.');
      return;
    }

    if (targetRole === 'STATION_MANAGER' && !stationId) {
      setErrorMsg('Please select an assigned station.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: RegistrationPayload = {
        email,
        phone,
        role: targetRole,
        password,
        ...(targetRole === 'REGION_MANAGER' ? { assigned_city_ids: cityIds } : {}),
        ...(targetRole === 'STATION_MANAGER' ? { assigned_station_id: stationId } : {}),
      };

      let thunkAction;
      if (targetRole === 'REGION_MANAGER') thunkAction = registerRM;
      else if (targetRole === 'CITY_MANAGER') thunkAction = registerCM;
      else if (targetRole === 'STATION_MANAGER') thunkAction = registerSM;

      if (!thunkAction) return;

      const resultAction = await dispatch(
        thunkAction({
          method: 'POST',
          payload: payload as unknown as Record<string, unknown>,
        })
      );

      if (thunkAction.fulfilled.match(resultAction)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseData = resultAction.payload as any;
        if (responseData.success) {
          setSuccessMsg(`Successfully registered ${targetRole}.`);
          setEmail('');
          setPassword('');
          setPhone('');
          setCityIds([]);
          setStationId('');
        } else {
          setErrorMsg(responseData.message || 'Registration failed.');
        }
      } else {
        setErrorMsg((resultAction.payload as string) || 'Server error occurred.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
      setPassword('');
    }
  };

  // Build the dynamic config array based on the role
  const formFields: FieldConfig[] = [
    { name: 'email', Component: EmailField, props: { value: email, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value), required: true, disabled: isSubmitting } },
    { name: 'phone', Component: PhoneField, props: { value: phone, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value), required: true, disabled: isSubmitting, placeholder: "+91..." } },
    { name: 'password', Component: PasswordField, props: { value: password, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value), required: true, disabled: isSubmitting }, colSpan: 2 },
  ];

  if (targetRole === 'REGION_MANAGER') {
    formFields.push({
      name: 'cities',
      Component: CitySelector,
      props: { value: cityIds, onChange: setCityIds },
      colSpan: 2
    });
  }

  if (targetRole === 'STATION_MANAGER') {
    formFields.push({
      name: 'station',
      Component: StationSelector,
      props: { value: stationId, onChange: setStationId },
      colSpan: 2
    });
  }

  return (
    <form className="space-y-6 bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200" onSubmit={handleSubmit}>
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Register New {targetRole.replace('_', ' ')}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Enter the details to create a new access account.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        {formFields.map((field) => (
          <div key={field.name} className={field.colSpan === 2 ? "sm:col-span-2" : ""}>
            <field.Component {...field.props} />
          </div>
        ))}
      </div>

      {errorMsg && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="text-sm text-green-700 bg-green-50 p-3 rounded-md border border-green-100">
          {successMsg}
        </div>
      )}

      <div className="pt-4 flex justify-end">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          className="min-w-[150px]"
        >
          Create User
        </Button>
      </div>
    </form>
  );
};
