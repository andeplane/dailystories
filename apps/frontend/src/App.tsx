// src/App.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import 'antd/dist/reset.css';
import StoryViewer from './components/StoryViewer';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { StoryProvider, useStories } from './contexts/StoryContext';
import { Story } from '@dailystories/shared';
import WelcomeModal from './components/WelcomeModal';
import { MixpanelService } from '@dailystories/shared';
import AuthCallback from './components/AuthCallback';
import { AuthProvider } from './contexts/AuthContext';

const StoryRoute = () => {
  const { id } = useParams();
  const { getStory } = useStories();
  const [story, setStory] = useState<Story | undefined>();

  useEffect(() => {
    if (id) {
      getStory(id).then(setStory);
    }
  }, [id, getStory]);
  
  if (!story) return <div>Loading...</div>;
  return <StoryViewer story={story} />;
};

const App: React.FC = () => {
  useEffect(() => {
    MixpanelService.trackAppLoad();
  }, []);

  return (
    <AuthProvider>
      <StoryProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/story/:id" element={<StoryRoute />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
          <WelcomeModal />
        </Router>
      </StoryProvider>
    </AuthProvider>
  );
};

export default App;
