// src/components/Step3.tsx

import React, { useState } from 'react';
import { BookSettings } from '../App';

interface Step3Props {
  nextStep: () => void;
  prevStep: () => void;
  handleChange: (input: Partial<BookSettings>) => void;
  values: Partial<BookSettings>;
}

const Step3: React.FC<Step3Props> = ({ nextStep, prevStep, handleChange, values }) => {
  const [characters, setCharacters] = useState<{ name: string; age: number; description: string }[]>(
    values.otherCharacters || [{ name: 'Pappa', age: 37, description: 'Pappaen til Ludwig' }]
  );

  const handleCharacterChange = (index: number, field: string, value: string | number) => {
    const updatedCharacters = [...characters];
    updatedCharacters[index] = { ...updatedCharacters[index], [field]: value };
    setCharacters(updatedCharacters);
  };

  const addCharacter = () => {
    setCharacters([...characters, { name: '', age: 0, description: '' }]);
  };

  const removeCharacter = (index: number) => {
    const updatedCharacters = characters.filter((_, i) => i !== index);
    setCharacters(updatedCharacters);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out incomplete characters
    const filteredCharacters = characters.filter((char) => char.name && char.description);
    handleChange({
      otherCharacters: filteredCharacters.length > 0 ? filteredCharacters : undefined,
    });
    nextStep();
  };

  return (
    <div className="form-container">
      <h2>Step 3: Other Characters (Optional)</h2>
      <form onSubmit={handleSubmit}>
        {characters.map((char, index) => (
          <div key={index} className="character-section">
            <h4>Character {index + 1}</h4>
            <label>
              Name:
              <input
                type="text"
                value={char.name}
                onChange={(e) => handleCharacterChange(index, 'name', e.target.value)}
                required
              />
            </label>
            <label>
              Age:
              <input
                type="number"
                value={char.age}
                onChange={(e) => handleCharacterChange(index, 'age', Number(e.target.value))}
                min={1}
                required
              />
            </label>
            <label>
              Description:
              <textarea
                value={char.description}
                onChange={(e) => handleCharacterChange(index, 'description', e.target.value)}
                required
              />
            </label>
            {characters.length > 1 && (
              <button type="button" onClick={() => removeCharacter(index)}>Remove Character</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addCharacter}>Add Another Character</button>
        <div className="button-group">
          <button type="button" onClick={prevStep}>Back</button>
          <button type="submit">Next</button>
        </div>
      </form>
    </div>
  );
};

export default Step3;
