import React from 'react';
import { Modal, Progress, Typography, Card, Image } from 'antd';
import type { BookSettings } from '../utils/BookGenerator';
import { BookGenerator } from '../utils/BookGenerator';
import { useBooks } from '../contexts/BookContext';
import { MixpanelService } from '../utils/MixpanelService';

const { Text, Paragraph } = Typography;

interface BookGenerationModalProps {
  open: boolean;
  onCancel: () => void;
  settings: BookSettings;
  estimatedTime: number;
  elapsedTime: number;
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

const BookGenerationModal: React.FC<BookGenerationModalProps> = ({ 
  open, 
  onCancel, 
  settings,
  estimatedTime,
  elapsedTime
}) => {
  const [state, setState] = React.useState<GenerationState>({
    progress: 0,
    statusMessage: '',
    storyOutline: '',
    coverImage: '',
    pageImages: [],
    pagesGenerated: 0
  });
  const { addBook } = useBooks();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const generationAttempted = React.useRef(false);
  const [timeRemaining, setTimeRemaining] = React.useState(0);

  const calculateEstimatedTime = React.useCallback(() => {
    const remainingPages = settings.numPages - state.pagesGenerated;
    return remainingPages * 30;
  }, [settings.numPages, state.pagesGenerated]);

  React.useEffect(() => {
    if (isGenerating) {
      setTimeRemaining(calculateEstimatedTime());
      
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isGenerating, state.pagesGenerated, settings.numPages, calculateEstimatedTime]);

  React.useEffect(() => {
    if (isGenerating) {
      setTimeRemaining(calculateEstimatedTime());
    }
  }, [state.pagesGenerated, calculateEstimatedTime, isGenerating]);

  const generateBook = React.useCallback(async () => {
    if (generationAttempted.current) return;
    
    const startTime = Date.now();
    const pageTimings: number[] = [];
    
    try {
      setIsGenerating(true);
      generationAttempted.current = true;
      
      const generator = new BookGenerator(settings);
      const book = await generator.generateBook(
        (progress, message) => {
          setState(prev => ({ ...prev, progress, statusMessage: message }));
        },
        (outline) => {
          setState(prev => ({ ...prev, storyOutline: outline }));
        },
        (pageText, pageImage) => {
          if (pageImage) {
            const currentTime = Date.now();
            pageTimings.push(currentTime - startTime);
            
            setState(prev => ({ 
              ...prev, 
              pageImages: [...prev.pageImages, pageImage],
              pagesGenerated: prev.pagesGenerated + 1
            }));
          }
        },
        (coverImage) => {
          setState(prev => ({ ...prev, coverImage }));
        }
      );
      
      const totalTime = Date.now() - startTime;
      const averageTimePerPage = pageTimings.reduce((acc, time) => acc + time, 0) / pageTimings.length;
      
      MixpanelService.trackBookGeneration(settings, {
        totalTime,
        averageTimePerPage,
        numPages: settings.numPages
      });

      await addBook(book);
      onCancel();
    } catch (error) {
      console.error('Error generating book:', error);
      setState(prev => ({ 
        ...prev, 
        statusMessage: 'Error generating book. Please try again.' 
      }));
    } finally {
      setIsGenerating(false);
    }
  }, [settings, addBook, onCancel]);

  React.useEffect(() => {
    if (open && !isGenerating && !generationAttempted.current) {
      generateBook();
    }
  }, [open, generateBook, isGenerating]);

  React.useEffect(() => {
    if (!open) {
      generationAttempted.current = false;
      setState({
        progress: 0,
        statusMessage: '',
        storyOutline: '',
        coverImage: '',
        pageImages: [],
        pagesGenerated: 0
      });
    }
  }, [open]);

  return (
    <Modal
      title="Generating Your Story"
      open={open}
      onCancel={onCancel}
      footer={null}
      closable={!isGenerating}
      maskClosable={!isGenerating}
      width="95vw"
      style={{ maxWidth: '1000px' }}
    >
      <div style={{ textAlign: 'center', padding: '12px' }}>
        <Progress 
          percent={Math.round(state.progress)} 
          status={state.progress === 100 ? 'success' : 'active'}
        />
        
        {isGenerating && (
          <div style={{ margin: '8px 0' }}>
            <Text type="secondary">
              Estimated time remaining: {formatTime(timeRemaining)}
            </Text>
          </div>
        )}

        <Text style={{ display: 'block', margin: '16px 0' }}>
          {state.statusMessage}
        </Text>

        {(state.storyOutline || state.coverImage) && (
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
              {state.coverImage && (
                <Image
                  src={`data:image/png;base64,${state.coverImage}`}
                  alt="Book cover"
                  style={{ 
                    width: '100%',
                    maxWidth: '400px',
                    height: 'auto'
                  }}
                />
              )}
              {state.storyOutline && (
                <Paragraph style={{ width: '100%' }}>{state.storyOutline}</Paragraph>
              )}
            </div>
          </Card>
        )}

        {state.pageImages.length > 0 && (
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
              {state.pageImages.map((image, index) => (
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

export default BookGenerationModal; 