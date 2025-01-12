import React from 'react';
import { Typography, Image, Space, Card, Button } from 'antd';
import { Book } from '../types/Book';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { MixpanelService } from '../utils/MixpanelService';

const { Title, Paragraph } = Typography;

interface ScrollableBookViewerProps {
  book: Book;
}

const ScrollableBookViewer: React.FC<ScrollableBookViewerProps> = ({ book }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    MixpanelService.trackBookRead(book.id, book.title);
  }, [book.id, book.title]);

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
        <Title level={2} style={{ fontSize: '2.5em', textAlign: 'center' }}>{book.title}</Title>
        {book.summary && (
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
            {book.summary}
          </Paragraph>
        )}
        {book.pages.map((page, index) => (
          <Space key={index} direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              <Image
                src={`data:image/png;base64,${page.illustrationBase64}`}
                alt={`Illustration for section ${index + 1}`}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
              <Paragraph 
                style={{ 
                  fontSize: '1.5em',
                  textAlign: 'justify',
                  letterSpacing: '0.02em',
                  lineHeight: '1.6',
                  wordSpacing: '0.05em',
                  hyphens: 'auto',
                  marginTop: '1em'
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

export default ScrollableBookViewer;
