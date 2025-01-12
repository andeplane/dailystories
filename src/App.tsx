// src/App.tsx

import React, { useState } from 'react';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';
import Review from './components/Review';
import './App.css';

export interface BookSettings {
  title: string;
  childName: string;
  childAge: number;
  childPreferences: {
    colors?: string[];
    interests?: string[];
  };
  otherCharacters?: { name: string; age: number; description: string }[];
  bookTheme: string;
  storylineInstructions?: string;
  language: string;
  illustrationStyle: string;
  numPages: number;
  models: {
    outlineModel: string;
    generationModel: string;
    feedbackModel: string;
    imageModel?: string;
  };
  openAIApiKey: string;
}

const App: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [bookSettings, setBookSettings] = useState<Partial<BookSettings>>({
    models: {
      outlineModel: 'gpt-4o-mini',
      generationModel: 'gpt-4o-mini',
      feedbackModel: 'gpt-4o-mini',
      imageModel: 'dall-e-3',
    },
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleChange = (input: Partial<BookSettings>) => {
    setBookSettings({ ...bookSettings, ...input });
  };

  switch (step) {
    case 1:
      return <Step1 nextStep={nextStep} handleChange={handleChange} values={bookSettings} />;
    case 2:
      return <Step2 nextStep={nextStep} prevStep={prevStep} handleChange={handleChange} values={bookSettings} />;
    case 3:
      return <Step3 nextStep={nextStep} prevStep={prevStep} handleChange={handleChange} values={bookSettings} />;
    case 4:
      return <Step4 nextStep={nextStep} prevStep={prevStep} handleChange={handleChange} values={bookSettings} />;
    case 5:
      return <Review bookSettings={bookSettings as BookSettings} prevStep={prevStep} />;
    default:
      return <div>Invalid Step</div>;
  }
};

export default App;
