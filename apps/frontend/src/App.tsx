// src/App.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import 'antd/dist/reset.css';
import StoryViewer from './components/StoryViewer';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { StoryProvider, useStories } from './contexts/StoryContext';
import WelcomeModal from './components/WelcomeModal';
import { AuthProvider } from './contexts/AuthContext';
import StreamTest from './utils/StreamTest';

interface Page {
  text: string;
  illustrationBase64: string;
}

interface Story {
  id: string;
  title: string;
  summary: string;
  coverImageBase64: string;
  pages: Page[];
}

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
  return (
    <AuthProvider>
      <StoryProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/stream-test" element={<StreamTest />} />
            <Route path="/story/:id" element={<StoryRoute />} />
          </Routes>
          
          <WelcomeModal />
        </Router>
      </StoryProvider>
    </AuthProvider>
  );
};

export default App;
