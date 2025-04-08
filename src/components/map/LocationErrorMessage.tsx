
import React from 'react';

interface LocationErrorMessageProps {
  error: string;
}

const LocationErrorMessage: React.FC<LocationErrorMessageProps> = ({ error }) => {
  return (
    <div className="absolute top-4 left-0 right-0 mx-auto w-max bg-red-100 text-red-800 px-4 py-2 rounded z-10">
      {error}
    </div>
  );
};

export default LocationErrorMessage;
