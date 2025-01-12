// src/components/Review.tsx

import React, { useState } from 'react';
import { BookSettings } from '../App';
import { BookGenerator } from '../utils/BookGenerator';
import Progress from './Progress';

interface ReviewProps {
  bookSettings: BookSettings;
  prevStep: () => void;
}

const Review: React.FC<ReviewProps> = ({ bookSettings, prevStep }) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<string>("Ready to generate your book.");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    setMessage("Initializing book generation...");
    setError(null);

    const generator = new BookGenerator(bookSettings);

    try {
      // Generate the story
      await generator.generateBook((progress: number, msg: string) => {
        setMessage(msg);
        setProgress(progress);
      });

      setMessage("Book generation completed successfully!");
      setProgress(100);
    } catch (err: any) {
      setError(`Error during generation: ${err.message}`);
      setMessage("Book generation failed.");
      setProgress(100);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Review Your Settings</h2>
      <div className="review-section">
        <h3>General Book Settings</h3>
        <p><strong>Title:</strong> {bookSettings.title}</p>
        <p><strong>Theme:</strong> {bookSettings.bookTheme}</p>
        <p><strong>Language:</strong> {bookSettings.language}</p>
        <p><strong>Illustration Style:</strong> {bookSettings.illustrationStyle}</p>
        <p><strong>Number of Pages:</strong> {bookSettings.numPages}</p>
        <p><strong>Storyline Instructions:</strong> {bookSettings.storylineInstructions || 'N/A'}</p>
      </div>
      <div className="review-section">
        <h3>Child's Information</h3>
        <p><strong>Name:</strong> {bookSettings.childName}</p>
        <p><strong>Age:</strong> {bookSettings.childAge}</p>
        <p><strong>Favorite Colors:</strong> {bookSettings.childPreferences.colors?.join(', ') || 'N/A'}</p>
        <p><strong>Interests:</strong> {bookSettings.childPreferences.interests?.join(', ') || 'N/A'}</p>
      </div>
      {bookSettings.otherCharacters && (
        <div className="review-section">
          <h3>Other Characters</h3>
          {bookSettings.otherCharacters.map((char, index) => (
            <div key={index}>
              <p><strong>Name:</strong> {char.name}</p>
              <p><strong>Age:</strong> {char.age}</p>
              <p><strong>Description:</strong> {char.description}</p>
              <hr />
            </div>
          ))}
        </div>
      )}
      <div className="review-section">
        <h3>OpenAI API Key</h3>
        <p>****** (Hidden for security)</p>
      </div>
      {isGenerating && <Progress progress={progress} message={message} />}
      {error && <p className="error-message">{error}</p>}
      <div className="button-group">
        <button type="button" onClick={prevStep} disabled={isGenerating}>Back</button>
        {!isGenerating && <button type="button" onClick={handleGenerate}>Generate</button>}
        {isGenerating && <button type="button" disabled>Generating...</button>}
      </div>
      <p>
        Click "Generate" to create your book. This process may take several minutes depending on the number of pages.
      </p>
    </div>
  );
};

export default Review;
