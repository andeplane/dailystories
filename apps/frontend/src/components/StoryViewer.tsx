import React from 'react';
import { Typography, Image, Space, Card, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface Page {
  text: string;
  illustrationBase64?: string;
  illustration_url?: string;
}

interface Story {
  id: string;
  title: string;
  summary: string;
  coverImageBase64: string;
  pages: Page[];
}

interface StoryViewerProps {
  story: Story;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ story }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Add keyboard event listener
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  const getImageSrc = (page: Page) => {
    console.log('Page data:', {
      hasIllustrationUrl: !!page.illustration_url,
      hasBase64: !!page.illustrationBase64,
      base64Length: page.illustrationBase64?.length,
      url: page.illustration_url
    });
    
    if (page.illustration_url) {
      return page.illustration_url;
    }
    if (page.illustrationBase64) {
      const base64Data = `data:image/png;base64,${page.illustrationBase64}`;
      console.log('Base64 data length:', base64Data.length);
      return base64Data;
    }
    return '';
  };

  return (
    <Card style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Button 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/')}
          style={{ marginBottom: '20px' }}
        >
          Back to Main Menu
        </Button>
        <Title level={2} style={{ fontSize: '2.5em', textAlign: 'center' }}>{story.title}</Title>
        {story.summary && (
          <Paragraph 
            style={{ 
              fontSize: '1.5em',
              textAlign: 'justify',
              letterSpacing: '0.02em',
              lineHeight: '1.6',
              maxWidth: '800px',
              margin: '0 auto'
            }}
          >
            {story.summary}
          </Paragraph>
        )}
        {story.pages.map((page: Page, index: number) => (
          <Space key={index} direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
              <img
                src={getImageSrc(page)}
                alt={`Illustration for section ${index + 1}`}
                style={{ 
                  width: '100%',
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block',
                  marginBottom: '2em'
                }}
              />
              <Paragraph 
                style={{ 
                  fontSize: '1.5em',
                  textAlign: 'justify',
                  letterSpacing: '0.02em',
                  lineHeight: '1.6',
                  wordSpacing: '0.05em',
                  hyphens: 'auto'
                }}
              >
                {page.text}
              </Paragraph>
            </div>
          </Space>
        ))}
      </Space>
    </Card>
  );
};

export default StoryViewer;