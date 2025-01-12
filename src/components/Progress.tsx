// src/components/Progress.tsx

import React from 'react';
import './Progress.css';

interface ProgressProps {
  progress: number; // Percentage (0 - 100)
  message: string;
}

const Progress: React.FC<ProgressProps> = ({ progress, message }) => {
  return (
    <div className="progress-container">
      <div className="progress-bar" style={{ width: `${progress}%` }}>
        {progress}%
      </div>
      <p>{message}</p>
    </div>
  );
};

export default Progress;
