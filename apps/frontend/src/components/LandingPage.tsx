// src/components/LandingPage.tsx
import React, { useState } from 'react';
import { Card, Row, Col, Popconfirm, Tooltip, Button } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useStories } from '../contexts/StoryContext';
import CreateStoryModal from './CreateStoryModal';
import LoginButton from './LoginButton';
import { StorySettings } from '../types/story';

const { Meta } = Card;

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

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer style={{
      position: 'fixed',
      bottom: 0,
      width: '100%',
      textAlign: 'center',
      padding: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderTop: '1px solid #eaeaea'
    }}>
      <p style={{ margin: 0 }}>© {currentYear} Anders Hafreager. All Rights Reserved</p>
    </footer>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { stories, addStory, deleteStory } = useStories();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateNew = () => {
    setIsModalOpen(true);
  };

  const handleModalSubmit = (settings: StorySettings) => {
    setIsModalOpen(false);
    addStory({
      title: settings.title,
      summary: `A story about ${settings.bookTheme}`,
      coverImageBase64: '',
      pages: []
    }).then(newStory => {
      navigate(`/story/${newStory.id}`);
    });
  };

  const handleBookClick = (bookId: string) => {
    navigate(`/story/${bookId}`);
  };

  const handleDeleteStory = (storyId: string) => {
    deleteStory(storyId);
  };

  return (
    <>
      <div style={{ padding: '20px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ margin: 0 }}>Daily Stories</h1>
          <LoginButton />
        </div>

        <a
          href="https://github.com/andeplane/dailystories"
          className="github-corner"
          aria-label="View source on GitHub"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            border: 0,
          }}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 250 250"
            style={{
              fill: '#151513',
              color: '#fff',
              position: 'absolute',
              top: 0,
              border: 0,
              right: 0,
            }}
            aria-hidden="true"
          >
            <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" />
            <path
              d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
              fill="currentColor"
              style={{ transformOrigin: '130px 106px' }}
              className="octo-arm"
            />
            <path
              d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
              fill="currentColor"
              className="octo-body"
            />
          </svg>
        </a>

        <style>
          {`          .github-corner:hover .octo-arm {
            animation: octocat-wave 560ms ease-in-out;
          }
          @keyframes octocat-wave {
            0%, 100% { transform: rotate(0) }
            20%, 60% { transform: rotate(-25deg) }
            40%, 80% { transform: rotate(10deg) }
          }
          @media (max-width: 500px) {
            .github-corner:hover .octo-arm {
              animation: none;
            }
            .github-corner .octo-arm {
              animation: octocat-wave 560ms ease-in-out;
            }
          }
        `}
        </style>

        <Row gutter={[16, 16]}>
          <Col
            xs={24}
            sm={24}
            md={12}
            lg={8}
            xl={6}
          >
            <Tooltip title="Create a new story">
              <Card
                hoverable
                style={{
                  height: '100%',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '20px',
                  backgroundColor: '#fafafa'
                }}
                onClick={handleCreateNew}
              >
                <PlusOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <Meta
                  title="Create New Story"
                  description="Start writing a new story"
                />
              </Card>
            </Tooltip>
          </Col>
          {stories.map((story: Story) => (
            <Col
              key={story.id}
              xs={24}
              sm={24}
              md={12}
              lg={8}
              xl={6}
            >
              <Card
                hoverable
                style={{ height: '100%', cursor: 'pointer' }}
                onClick={() => handleBookClick(story.id)}
                cover={
                  story.coverImageBase64 ? (
                    <img
                      alt={story.title}
                      src={story.coverImageBase64}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        height: '200px',
                        backgroundColor: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999'
                      }}
                    >
                      No Cover Image
                    </div>
                  )
                }
              >
                <Meta
                  title={story.title}
                  description={story.summary}
                />
                <Popconfirm
                  title="Are you sure you want to delete this story?"
                  onConfirm={() => handleDeleteStory(story.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStory(story.id);
                    }}
                  />
                </Popconfirm>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      <CreateStoryModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
      <Footer />
    </>
  );
};

export default LandingPage;

