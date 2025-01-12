// src/components/Step4.tsx

import React, { useState } from 'react';
import { BookSettings } from '../App';

interface Step4Props {
  nextStep: () => void;
  prevStep: () => void;
  handleChange: (input: Partial<BookSettings>) => void;
  values: Partial<BookSettings>;
}

const Step4: React.FC<Step4Props> = ({ nextStep, prevStep, handleChange, values }) => {
  const [openAIApiKey, setOpenAIApiKey] = useState<string>(values.openAIApiKey || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleChange({ openAIApiKey });
    nextStep();
  };

  return (
    <div className="form-container">
      <h2>Step 4: OpenAI API Key</h2>
      <form onSubmit={handleSubmit}>
        <label>
          OpenAI API Key:
          <input
            type="password"
            value={openAIApiKey}
            onChange={(e) => setOpenAIApiKey(e.target.value)}
            required
          />
        </label>
        <p>
          Please ensure your API key is kept secure. It will be used to generate your book.
        </p>
        <div className="button-group">
          <button type="button" onClick={prevStep}>Back</button>
          <button type="submit">Review</button>
        </div>
      </form>
    </div>
  );
};

export default Step4;
