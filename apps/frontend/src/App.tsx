// src/App.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import 'antd/dist/reset.css';
import StoryViewer from './components/StoryViewer';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoryProvider, useStories } from './contexts/StoryContext';
import { Story } from '@dailystories/shared';
import WelcomeModal from './components/WelcomeModal';
import { MixpanelService } from '@dailystories/shared';

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
    <StoryProvider>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/story/:id" element={<StoryRoute />} />
        </Routes>
        <WelcomeModal />
      </BrowserRouter>
    </StoryProvider>
  );
};

export default App;
