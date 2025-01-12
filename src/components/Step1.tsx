// src/components/Step1.tsx

import React, { useState } from 'react';
import { BookSettings } from '../App';

interface Step1Props {
  nextStep: () => void;
  handleChange: (input: Partial<BookSettings>) => void;
  values: Partial<BookSettings>;
}

const Step1: React.FC<Step1Props> = ({ nextStep, handleChange, values }) => {
  const [title, setTitle] = useState<string>(values.title || 'Ludwig og piratene');
  const [bookTheme, setBookTheme] = useState<string>(values.bookTheme || 'pirater');
  const [language, setLanguage] = useState<string>(values.language || 'no');
  const [illustrationStyle, setIllustrationStyle] = useState<string>(values.illustrationStyle || 'fantasy');
  const [numPages, setNumPages] = useState<number>(values.numPages || 5);
  const [storylineInstructions, setStorylineInstructions] = useState<string>(values.storylineInstructions || 'En pirat banker på hos Ludwig og trenger hjelp til å finne en skatt');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleChange({ title, bookTheme, language, illustrationStyle, numPages, storylineInstructions });
    nextStep();
  };

  return (
    <div className="form-container">
      <h2>Step 1: General Book Settings</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Book Title:
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Book Theme:
          <input type="text" value={bookTheme } onChange={(e) => setBookTheme(e.target.value)} required />
        </label>
        <label>
          Language:
          <select value={language} onChange={(e) => setLanguage(e.target.value)} required>
            <option value="no">Norwegian</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </label>
        <label>
          Illustration Style:
          <input type="text" value={illustrationStyle} onChange={(e) => setIllustrationStyle(e.target.value)} required />
        </label>
        <label>
          Number of Pages:
          <input type="number" value={numPages} onChange={(e) => setNumPages(Number(e.target.value))} min={1} required />
        </label>
        <label>
          Storyline Instructions (optional):
          <textarea value={storylineInstructions} onChange={(e) => setStorylineInstructions(e.target.value)} />
        </label>
        <button type="submit">Next</button>
      </form>
    </div>
  );
};

export default Step1;
