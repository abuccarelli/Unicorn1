import React, { useState } from 'react';
import { MapPin, Clock, RefreshCw } from 'lucide-react';
import { EditableField } from './EditableField';
import { getTimezoneFromLocation, formatTimezoneDisplay } from '../../utils/timezone';
import type { Profile } from '../../types/profile';

interface AddressFieldsProps {
  profile: Profile;
  onUpdate: (field: string, value: string) => Promise<void>;
}

export function AddressFields({ profile, onUpdate }: AddressFieldsProps) {
  const [userTimezone, setUserTimezone] = useState(getTimezoneFromLocation());
  const timezoneDisplay = userTimezone ? formatTimezoneDisplay(userTimezone) : null;

  const handleRefreshTimezone = () => {
    setUserTimezone(getTimezoneFromLocation());
  };

  return (
    <div className="bg-white px-4 py-5 sm:px-6">
      <div className="flex items-center mb-4">
        <MapPin className="h-5 w-5 text-gray-400 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <EditableField
            label="Street"
            value={profile.street || ''}
            onSave={(value) => onUpdate('street', value)}
            placeholder="Enter street name"
          />
          <EditableField
            label="Street Number"
            value={profile.street_number || ''}
            onSave={(value) => onUpdate('street_number', value)}
            placeholder="Enter street number"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <EditableField
            label="Postal Code"
            value={profile.postal_code || ''}
            onSave={(value) => onUpdate('postal_code', value)}
            placeholder="Enter postal code"
          />
          <EditableField
            label="City"
            value={profile.city || ''}
            onSave={(value) => onUpdate('city', value)}
            placeholder="Enter city"
          />
        </div>

        <EditableField
          label="Country"
          value={profile.country || ''}
          onSave={(value) => onUpdate('country', value)}
          placeholder="Enter country"
        />

        {timezoneDisplay && (
          <div className="bg-gray-50 px-4 py-3 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>Time Zone: {timezoneDisplay}</span>
              </div>
              <button
                onClick={handleRefreshTimezone}
                className="inline-flex items-center px-2 py-1 text-sm text-indigo-600 hover:text-indigo-700 focus:outline-none"
                title="Refresh timezone"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}