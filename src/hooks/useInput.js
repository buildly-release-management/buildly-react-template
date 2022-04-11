import { useState } from 'react';

export const useInput = (initialValue = '', validators = {}) => {
  const [value, setValue] = useState(initialValue);

  return {
    value,
    required: validators.required,
    ...(validators.productFeatures && { productFeatures: validators.productFeatures }),
    confirm: validators.confirm,
    ...(validators.confirm
      && validators.matchField && { matchField: validators.matchField.value }),
    bind: {
      onChange: (e) => setValue(e.target.value),
      value,
      required: validators.required,
    },
    clear: () => setValue(''),
    reset: () => setValue(initialValue),
    setNewValue: (newValue) => setValue(newValue),
    hasChanged: () => {
      let newValue = value;
      if (typeof (initialValue) === 'number') {
        newValue = Number(value);
      }
      return !!(initialValue !== newValue);
    },
  };
};
