// usePurchaseInteract.tsx
import React, { useState } from 'react';

interface PurchaseInteractHook {
  status: string | null;
  param: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const usePurchaseInteract = (): PurchaseInteractHook => {
  const [status, setStatus] = useState<string | null>(null);
  const [param, setParam] = useState<string>('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setParam(event.target.value);
  };

  return { status, param, handleInputChange };
};
