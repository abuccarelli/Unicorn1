import React from 'react';
import { currencies } from '../../data/currencies';

interface CurrencySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
    >
      <option value="">Select currency</option>
      {currencies.map((currency) => (
        <option key={currency.code} value={currency.code}>
          {currency.code} ({currency.symbol}) - {currency.name}
        </option>
      ))}
    </select>
  );
}