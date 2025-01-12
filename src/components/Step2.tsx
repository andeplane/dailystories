// src/components/Step2.tsx

import React, { useState } from 'react';
import { BookSettings } from '../App';

interface Step2Props {
  nextStep: () => void;
  prevStep: () => void;
  handleChange: (input: Partial<BookSettings>) => void;
  values: Partial<BookSettings>;
}

const Step2: React.FC<Step2Props> = ({ nextStep, prevStep, handleChange, values }) => {
  const [childName, setChildName] = useState<string>(values.childName || 'Ludwig');
  const [childAge, setChildAge] = useState<number>(values.childAge || 5);
  const [colors, setColors] = useState<string>(values.childPreferences?.colors?.join(', ') || 'blue, black');
  const [interests, setInterests] = useState<string>(values.childPreferences?.interests?.join(', ') || 'pirates, ships');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const colorsArray = colors.split(',').map((color) => color.trim()).filter((color) => color);
    const interestsArray = interests.split(',').map((interest) => interest.trim()).filter((interest) => interest);
    handleChange({
      childName,
      childAge,
      childPreferences: {
        colors: colorsArray.length > 0 ? colorsArray : undefined,
        interests: interestsArray.length > 0 ? interestsArray : undefined,
      },
    });
    nextStep();
  };

  return (
    <div className="form-container">
      <h2>Step 2: Child's Information</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Child's Name:
          <input type="text" value={childName} onChange={(e) => setChildName(e.target.value)} required />
        </label>
        <label>
          Child's Age:
          <input type="number" value={childAge} defaultValue={5} onChange={(e) => setChildAge(Number(e.target.value))} min={1} required />
        </label>
        <label>
          Favorite Colors (comma-separated):
          <input type="text" value={colors} onChange={(e) => setColors(e.target.value)} />
        </label>
        <label>
          Interests (comma-separated):
          <input type="text" value={interests} onChange={(e) => setInterests(e.target.value)} />
        </label>
        <div className="button-group">
          <button type="button" onClick={prevStep}>Back</button>
          <button type="submit">Next</button>
        </div>
      </form>
    </div>
  );
};

export default Step2;
