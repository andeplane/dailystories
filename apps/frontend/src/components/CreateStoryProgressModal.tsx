import React, { useState, useEffect } from 'react';
import { Modal, Progress, Typography, Card, Image } from 'antd';
import type { StorySettings } from '@dailystories/shared';
import { useStories } from '../contexts/StoryContext';
import { MixpanelService } from '@dailystories/shared';

const { Text, Paragraph } = Typography;

interface CreateStoryProgressModalProps {
  open: boolean;
  onCancel: () => void;
  settings: StorySettings;
  estimatedTime: number;
  elapsedTime: number;
  idToken: string | null;
}

interface GenerationState {
  progress: number;
  statusMessage: string;
  storyOutline: string;
  coverImage: string;
  pageImages: string[];
  pagesGenerated: number;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const CreateStoryProgressModal: React.FC<CreateStoryProgressModalProps> = ({ 
  open, 
  onCancel, 
  settings,
  estimatedTime,
  elapsedTime,
  idToken
}) => {
  const [generationState, setGenerationState] = useState<GenerationState>({
    progress: 0,
    statusMessage: 'Initializing story generation...',
    storyOutline: '',
    coverImage: '',
    pageImages: [],
    pagesGenerated: 0
  });
  const { addStory } = useStories();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const generationAttempted = React.useRef(false);
  const [timeRemaining, setTimeRemaining] = React.useState(0);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const calculateEstimatedTime = React.useCallback(() => {
    const remainingPages = settings.numPages - generationState.pagesGenerated;
    return remainingPages * 30;
  }, [settings.numPages, generationState.pagesGenerated]);

  useEffect(() => {
    if (!open || !idToken || generationAttempted.current || isGenerating) return;

    const startGeneration = async () => {
      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();
      
      try {
        setIsGenerating(true);
        generationAttempted.current = true;

        // Start the story generation
        const response = await fetch('http://localhost:8000/api/generatestory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({ settings }),
          signal: abortControllerRef.current.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { session_id } = await response.json();
        console.log('Got session ID:', session_id);

        // Connect to WebSocket for progress updates
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.hostname}:8000/ws/story/${session_id}?token=${idToken}`;
        console.log('Connecting to WebSocket:', wsUrl);
        
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('WebSocket connection established');
        };

        ws.onmessage = (event) => {
          console.log('WebSocket message received:', event.data);
          const data = JSON.parse(event.data);
          setGenerationState(prev => ({
            ...prev,
            progress: data.progress || prev.progress,
            statusMessage: data.message || prev.statusMessage,
            storyOutline: data.storyOutline || prev.storyOutline,
            coverImage: data.coverImage || prev.coverImage,
            pageImages: data.pageImages || prev.pageImages,
            pagesGenerated: data.pagesGenerated || prev.pagesGenerated
          }));

          if (data.status === 'completed') {
            console.log('Story generation completed');
            ws.close();
            addStory(data.story);
            onCancel();
          } else if (data.status === 'error') {
            console.error('Story generation error:', data.error);
            ws.close();
            setGenerationState(prev => ({
              ...prev,
              statusMessage: `Error: ${data.error || 'Failed to generate story'}`
            }));
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setGenerationState(prev => ({
            ...prev,
            statusMessage: 'Error: Connection lost. Please try again.'
          }));
          setIsGenerating(false);
        };

        ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          setIsGenerating(false);
        };

        return () => {
          ws.close();
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
        };
      } catch (error: unknown) {
        // Only show error if it's not an abort error
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error starting story generation:', error);
          setGenerationState(prev => ({
            ...prev,
            statusMessage: 'Error: Failed to start story generation. Please try again.'
          }));
        }
        setIsGenerating(false);
      }
    };

    startGeneration();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [open, settings, idToken, addStory, onCancel, isGenerating]);

  React.useEffect(() => {
    if (!open) {
      // Reset all state when modal closes
      generationAttempted.current = false;
      setIsGenerating(false);
      setGenerationState({
        progress: 0,
        statusMessage: '',
        storyOutline: '',
        coverImage: '',
        pageImages: [],
        pagesGenerated: 0
      });
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  }, [open]);

  React.useEffect(() => {
    if (isGenerating) {
      setTimeRemaining(calculateEstimatedTime());
    }
  }, [generationState.pagesGenerated, calculateEstimatedTime, isGenerating]);

  return (
    <Modal
      title={`Generating "${settings.title}"`}
      open={open}
      onCancel={onCancel}
      footer={null}
      closable={!isGenerating}
      maskClosable={!isGenerating}
      width="90vw"
      style={{ maxWidth: '800px' }}
    >
      <div style={{ textAlign: 'center', padding: '12px' }}>
        <Progress 
          percent={Math.round(generationState.progress)} 
          status={generationState.progress === 100 ? 'success' : 'active'}
        />
        
        {isGenerating && (
          <div style={{ margin: '8px 0' }}>
            <Text type="secondary">
              Estimated time remaining: {formatTime(timeRemaining)}
            </Text>
          </div>
        )}

        <Text style={{ display: 'block', margin: '16px 0' }}>
          {generationState.statusMessage}
        </Text>

        {(generationState.storyOutline || generationState.coverImage) && (
          <Card 
            title="Story Preview" 
            style={{ 
              width: '100%',
              textAlign: 'left'
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              alignItems: 'center'
            }}>
              {generationState.coverImage && (
                <Image
                  src={`data:image/png;base64,${generationState.coverImage}`}
                  alt="Book cover"
                  style={{ 
                    width: '100%',
                    maxWidth: '400px',
                    height: 'auto'
                  }}
                />
              )}
              {generationState.storyOutline && (
                <Paragraph style={{ width: '100%' }}>{generationState.storyOutline}</Paragraph>
              )}
            </div>
          </Card>
        )}

        {generationState.pageImages.length > 0 && (
          <Card 
            title="Story Illustrations" 
            style={{ 
              width: '100%',
              marginTop: '20px',
              textAlign: 'left'
            }}
          >
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '12px',
              width: '100%'
            }}>
              {generationState.pageImages.map((image, index) => (
                <Card
                  key={index}
                  bodyStyle={{ padding: '8px' }}
                  style={{ width: '100%' }}
                >
                  <Image
                    src={`data:image/png;base64,${image}`}
                    alt={`Page ${index + 1} illustration`}
                    style={{ 
                      width: '100%',
                      height: 'auto',
                      maxWidth: '400px'
                    }}
                  />
                </Card>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default CreateStoryProgressModal;