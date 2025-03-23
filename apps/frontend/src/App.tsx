// src/App.tsx
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import 'antd/dist/reset.css';
import StoryViewer from './components/StoryViewer';
import { StoryProvider, useStories } from './contexts/StoryContext';
import WelcomeModal from './components/WelcomeModal';
import { AuthProvider } from './contexts/AuthContext';
import StreamTest from './utils/StreamTest';
import { Story } from './types/story';

const StoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getStory } = useStories();
  const [story, setStory] = useState<Story>();

  useEffect(() => {
    if (id) {
      getStory(id).then(setStory);
    }
  }, [id, getStory]);
  
  if (!story) {
    return <div>Loading...</div>;
  }

  return <StoryViewer story={story} />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <StoryProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/story/:id" element={<StoryPage />} />
            <Route path="/stream-test" element={<StreamTest />} />
          </Routes>
          
          <WelcomeModal />
        </Router>
      </StoryProvider>
    </AuthProvider>
  );
};

export default App;
