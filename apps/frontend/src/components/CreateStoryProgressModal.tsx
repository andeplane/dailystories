import { Modal, Progress, Typography, Card, Button, Image } from 'antd';
import { useState, useEffect, useCallback, useRef } from "react";
import { storyGenerationService, StoryState } from "../utils/StoryGenerationService";
import { useAuth } from "../contexts/AuthContext";

const { Text, Title, Paragraph } = Typography;

interface Props {
  open: boolean;
  settings: any;
  onClose: () => void;
  onComplete: (story: any) => void;
  estimatedTime: number;
  elapsedTime: number;
  idToken: string | null;
}

export default function CreateStoryProgressModal({ open, settings, onClose, onComplete, estimatedTime, elapsedTime, idToken }: Props) {
  const [state, setState] = useState<StoryState>(storyGenerationService.getState());
  const isGeneratingRef = useRef(false);

  const handleUpdate = useCallback((newState: StoryState) => {
    console.log("MODAL: Received update:", newState);
    setState(newState);
  }, []);

  const handleComplete = useCallback((story: any) => {
    console.log("MODAL: Received complete event:", story);
    onComplete(story);
  }, [onComplete]);

  const handleError = useCallback((error: string) => {
    console.error("MODAL: Error in story generation:", error);
  }, []);

  // Set up event listeners only once when component mounts
  useEffect(() => {
    console.log("MODAL: Setting up event listeners");
    
    const unsubscribeUpdate = storyGenerationService.onUpdate(handleUpdate);
    const unsubscribeComplete = storyGenerationService.onComplete(handleComplete);
    const unsubscribeError = storyGenerationService.onError(handleError);
    
    return () => {
      console.log("MODAL: Cleaning up event listeners");
      unsubscribeUpdate();
      unsubscribeComplete();
      unsubscribeError();
    };
  }, []); // Only run on mount and unmount

  // Handle story generation separately
  useEffect(() => {
    if (open && idToken && settings && !isGeneratingRef.current) {
      console.log("MODAL: Starting story generation with settings:", settings);
      isGeneratingRef.current = true;
      storyGenerationService.generateStory(settings, idToken);
    }
    
    return () => {
      isGeneratingRef.current = false;
    };
  }, [open, idToken, settings]);

  const handleCancel = () => {
    console.log("MODAL: Cancelling story generation");
    storyGenerationService.cancel();
    onClose();
  };

  return (
    <Modal
      title={`Creating "${settings?.title || 'Your Story'}"`}
      open={open}
      onCancel={handleCancel}
      footer={[
        state.isGenerating ? (
          <Button key="cancel" type="primary" danger onClick={handleCancel}>
            Cancel
          </Button>
        ) : (
          <Button key="close" type="primary" onClick={onClose}>
            Close
          </Button>
        )
      ]}
      maskClosable={!state.isGenerating}
      closable={!state.isGenerating}
      width={600}
      centered
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Progress
          type="circle"
          percent={Math.round(state.progress)}
          status={state.progress === 100 ? 'success' : 'active'} 
          width={80}
        />
        
        <Paragraph style={{ margin: '20px 0' }}>
          {state.statusMessage}
        </Paragraph>
        
        {state.error && (
          <Text type="danger" style={{ display: 'block', margin: '10px 0' }}>
            Error: {state.error}
          </Text>
        )}
        
        {state.coverImage && (
          <Card title="Cover Preview" style={{ marginTop: 20 }}>
            <Image
              src={state.coverImage}
              alt="Book Cover"
              style={{ maxWidth: '100%', maxHeight: '200px' }}
            />
          </Card>
        )}
        
        {state.pageImages.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <Title level={4}>Generated Pages</Title>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '10px',
              marginTop: '10px'
            }}>
              {state.pageImages.map((image, index) => (
                <Card key={index} size="small" title={`Page ${index + 1}`}>
                  <Image
                    src={image}
                    alt={`Page ${index + 1}`}
                    style={{ width: '100%' }}
                  />
                </Card>
              ))}
            </div>
          </div>
        )}

        {estimatedTime > 0 && (
          <div style={{ marginTop: 20 }}>
            <Progress
              percent={Math.min((elapsedTime / estimatedTime) * 100, 100)}
              status="active"
              format={() => `${Math.floor(elapsedTime / 60)}:${String(elapsedTime % 60).padStart(2, '0')} / ${Math.floor(estimatedTime / 60)}:${String(estimatedTime % 60).padStart(2, '0')}`}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}