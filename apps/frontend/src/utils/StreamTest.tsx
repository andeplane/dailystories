import React, { useEffect, useState } from 'react';
import { Button, Typography, Card } from 'antd';
import { useAuth } from '../contexts/AuthContext';

const { Text, Title } = Typography;

export const StreamTest: React.FC = () => {
  const { idToken } = useAuth();
  const [messages, setMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = (message: string) => {
    setMessages(prev => [...prev, message]);
  };

  const testStream = async () => {
    if (!idToken) {
      addMessage('No auth token available');
      return;
    }

    setIsLoading(true);
    addMessage('Starting test...');

    try {
      // Simple test settings
      const settings = {
        title: "Test Story",
        childName: "Test",
        childAge: 5,
        language: "English",
        illustrationStyle: "Fantasy",
        numPages: 3,
        bookTheme: "Adventure",
        childPreferences: {
          interests: ["dinosaurs"],
          colors: ["blue"]
        },
        models: {
          outlineModel: "gpt-4o-mini",
          generationModel: "gpt-4o-mini",
          feedbackModel: "gpt-4o-mini",
          imageModel: "dall-e-3"
        }
      };

      addMessage(`Making fetch request to api/generatestory...`);
      const response = await fetch('http://localhost:8000/api/generatestory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          settings: {
            ...settings,
            generate_images: false
          }
        })
      });

      addMessage(`Response status: ${response.status} ${response.statusText}`);
      addMessage(`Content-Type: ${response.headers.get('content-type')}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        addMessage('No response body received');
        return;
      }

      addMessage('Setting up stream reader...');

      // Set up stream reading
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let chunkCounter = 0;
      
      // Processing loop
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          addMessage('Stream complete');
          break;
        }
        
        // Decode binary chunk to text
        const chunkText = decoder.decode(value, { stream: true });
        chunkCounter++;
        
        addMessage(`Chunk #${chunkCounter}: ${chunkText.length} bytes`);
        
        if (chunkText.length > 100) {
          addMessage(`Content (first 100 chars): ${chunkText.substring(0, 100)}...`);
        } else {
          addMessage(`Content: ${chunkText}`);
        }
        
        // Add to buffer and split by newlines
        const completeText = buffer + chunkText;
        const lines = completeText.split('\n');
        
        // Last line might be incomplete, keep it for next time
        buffer = lines.pop() || '';
        
        addMessage(`Got ${lines.length} complete lines, ${buffer.length} chars in buffer`);
        
        // Process each complete line
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;
          
          try {
            const data = JSON.parse(line);
            addMessage(`Event: ${data.event}`);
          } catch (error) {
            addMessage(`Error parsing JSON: ${line}`);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        addMessage(`Error: ${error.message}`);
      } else {
        addMessage(`Unknown error: ${String(error)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Stream Test</Title>
      <Button 
        type="primary" 
        onClick={testStream} 
        loading={isLoading}
        disabled={!idToken}
        style={{ marginBottom: '20px' }}
      >
        Test Stream
      </Button>
      
      <Card title="Messages" style={{ maxHeight: '600px', overflow: 'auto' }}>
        {messages.map((message, index) => (
          <div key={index} style={{ marginBottom: '8px' }}>
            <Text>{message}</Text>
          </div>
        ))}
        {messages.length === 0 && <Text type="secondary">No messages yet. Click "Test Stream" to start.</Text>}
      </Card>
    </div>
  );
};

export default StreamTest; 