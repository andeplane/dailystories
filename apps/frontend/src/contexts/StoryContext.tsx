import React, { createContext, useContext, useEffect, useState } from 'react';
import { Story } from '@dailystories/shared';
import { openDB } from 'idb';
import { stories as storiesData } from '../data/stories';

interface StoryContextType {
  stories: Story[];
  addStory: (story: Omit<Story, 'id'>) => Promise<Story>;
  getStory: (id: string) => Promise<Story | undefined>;
  deleteStory: (id: string) => Promise<void>;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

// Initialize IndexedDB
const initDB = async () => {
  const db = await openDB('stories-db', 1, {
    upgrade(db) {
      db.createObjectStore('stories', { keyPath: 'id' });
    },
  });
  return db;
};

export const StoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    // Load books when component mounts
    const loadBooks = async () => {
      const db = await initDB();
      const allStories = await db.getAll('stories');
      // Mark preinstalled stories
      const preinstalledWithFlag = storiesData.map(story => ({
        ...story,
        isPreinstalled: true
      }));
      setStories([...preinstalledWithFlag, ...allStories]);
    };
    loadBooks();
  }, []);

  const addStory = async (storyData: Omit<Story, 'id'>) => {
    const db = await initDB();
    const newStory: Story = {
      ...storyData,
      id: crypto.randomUUID(),
    };
    
    await db.add('stories', newStory);
    setStories(prev => [...prev, newStory]);
    return newStory;
  };

  const getStory = async (id: string) => {
    const db = await initDB();
    const dbStory = await db.get('stories', id);
    const dataStory = storiesData.find(story => story.id === id);
    return dbStory || dataStory;
  };

  const deleteStory = async (id: string) => {
    const db = await initDB();
    await db.delete('stories', id);
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