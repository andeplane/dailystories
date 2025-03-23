import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

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

interface StoryContextType {
  stories: Story[];
  addStory: (story: Omit<Story, 'id'>) => Promise<Story>;
  getStory: (id: string) => Promise<Story | undefined>;
  deleteStory: (id: string) => Promise<void>;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:8000/api';

export const StoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const { idToken } = useAuth();

  useEffect(() => {
    // Load stories from the API when component mounts or when idToken changes
    const loadStories = async () => {
      if (!idToken) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/stories`, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch stories');
        }
        const data = await response.json();
        setStories(data);
      } catch (error) {
        console.error('Error loading stories:', error);
        setStories([]);
      }
    };
    loadStories();
  }, [idToken]); // Re-run when idToken changes

  const addStory = async (storyData: Omit<Story, 'id'>) => {
    if (!idToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify(storyData),
    });

    if (!response.ok) {
      throw new Error('Failed to add story');
    }

    const newStory = await response.json();
    setStories(prev => [...prev, newStory]);
    return newStory;
  };

  const getStory = async (id: string) => {
    if (!idToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/stories/${id}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return undefined;
        }
        throw new Error('Failed to fetch story');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching story:', error);
      return undefined;
    }
  };

  const deleteStory = async (id: string) => {
    if (!idToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/stories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete story');
    }

    setStories(prev => prev.filter(story => story.id !== id));
  };

  return (
    <StoryContext.Provider value={{ stories, addStory, getStory, deleteStory }}>
      {children}
    </StoryContext.Provider>
  );
};

export const useStories = () => {
  const context = useContext(StoryContext);
  if (context === undefined) {
    throw new Error('useStories must be used within a StoryProvider');
  }
  return context;
}; 