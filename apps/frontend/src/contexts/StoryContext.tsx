import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Story, Page } from '../types/story';

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

    const response = await fetch(`${API_BASE_URL}/generatestory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        settings: {
          title: storyData.title,
          // Add other required settings here
          childName: "User",
          childAge: 7,
          language: "English",
          numPages: 5,
          generate_images: true,
          illustrationStyle: "Watercolor, children's book style",
          bookTheme: storyData.summary || "Adventure",
          childPreferences: {
            colors: ["blue", "green"],
            interests: ["adventure", "learning"]
          }
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate story');
    }

    // The response is a stream of events
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    let bookId: string | undefined;
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);
        const events = chunk.trim().split('\n');

        // Process each event
        for (const event of events) {
          try {
            const data = JSON.parse(event);
            if (data.event === 'book_created') {
              bookId = data.book_id;
            } else if (data.event === 'error') {
              throw new Error(data.error);
            }
          } catch (e) {
            console.error('Error parsing event:', e);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    if (!bookId) {
      throw new Error('Failed to get book ID from response');
    }

    // Fetch the created story
    const story = await getStory(bookId);
    if (!story) {
      throw new Error('Failed to fetch created story');
    }

    setStories(prev => [...prev, story]);
    return story;
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