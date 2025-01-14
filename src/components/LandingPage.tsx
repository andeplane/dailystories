// src/components/LandingPage.tsx
import React, { useState } from 'react';
import { Card, Row, Col, Popconfirm, Tooltip, Input, Button, Select } from 'antd';
import { PlusOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useStories } from '../contexts/StoryContext';
import { Story } from '../types/Story';
import CreateStoryModal from './CreateStoryModal';
import { StorySettings } from '../utils/StoryGenerator';
import { MixpanelService } from '../utils/MixpanelService';

const { Meta } = Card;

const OPENAI_KEY_STORAGE = 'openai_api_key';
const OPENAI_MODEL_STORAGE = 'openai_model';
const MODEL_OPTIONS = [
  { label: 'gpt-4o', value: 'gpt-4o' },
  { label: 'gpt-4o-mini', value: 'gpt-4o-mini' },
  { label: 'o1-preview', value: 'o1-preview' },
];

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
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem(OPENAI_KEY_STORAGE) || '';
  });
  const [showApiSettings, setShowApiSettings] = useState(() => !localStorage.getItem(OPENAI_KEY_STORAGE));
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem(OPENAI_MODEL_STORAGE) || 'gpt-4o-mini';
  });

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    localStorage.setItem(OPENAI_KEY_STORAGE, newKey);
  };

  const handleCreateNew = () => {
    if (!apiKey) return; // Early return if no API key
    MixpanelService.trackNewStoryClick();
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

  const handleDeleteStory = (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation(); // Prevent card click event
    deleteStory(storyId);
  };

  return (
    <>
      <div style={{ padding: '20px' }}>
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

        <Row style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={24} md={12} lg={8}>
            {showApiSettings ? (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <Button 
                    icon={<SettingOutlined />}
                    onClick={() => setShowApiSettings(false)}
                  >
                    Hide Settings
                  </Button>
                </div>
                <div style={{ display: 'flex', marginBottom: '16px' }}>
                  <div style={{ width: '120px', paddingTop: '4px' }}>
                    OpenAI API Key:
                  </div>
                  <div style={{ flex: 1 }}>
                    <Input.Password
                      value={apiKey}
                      onChange={handleApiKeyChange}
                      placeholder="Enter your OpenAI API key"
                    />
                    <div style={{ fontSize: '12px', marginTop: '4px', color: 'rgba(0, 0, 0, 0.45)' }}>
                      {!apiKey ? (
                        <>
                          Enter your{' '}
                          <a 
                            href="https://platform.openai.com/docs/quickstart"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            OpenAI API key
                          </a>
                          . The API key is only stored locally.
                        </>
                      ) : (
                        "✓ API key saved in your browser's local storage"
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex' }}>
                  <div style={{ width: '120px', paddingTop: '4px' }}>Model:</div>
                  <div style={{ flex: 1 }}>
                    <Select
                      value={selectedModel}
                      onChange={(value) => {
                        setSelectedModel(value);
                        localStorage.setItem(OPENAI_MODEL_STORAGE, value);
                      }}
                      options={MODEL_OPTIONS}
                      style={{ width: '100%' }}
                    />
                    <div style={{ fontSize: '12px', marginTop: '4px', color: 'rgba(0, 0, 0, 0.45)' }}>
                      Select the OpenAI model to use for story generation.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Button 
                icon={<SettingOutlined />}
                onClick={() => setShowApiSettings(true)}
                style={{ marginBottom: '16px' }}
              >
                API Settings
              </Button>
            )}
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col
            xs={24}
            sm={24}
            md={12}
            lg={8}
            xl={6}
          >
            <Tooltip title={!apiKey ? "Please enter your OpenAI API key first" : "Create a new story"}>
              <Card
                hoverable={!!apiKey}
                style={{
                  height: '100%',
                  cursor: apiKey ? 'pointer' : 'not-allowed',
                  opacity: apiKey ? 1 : 0.5,
                }}
                onClick={handleCreateNew}
                cover={
                  <div
                    style={{
                      height: '200px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#f0f0f0',
                    }}
                  >
                    <PlusOutlined style={{ fontSize: '48px', color: '#999' }} />
                  </div>
                }
              >
                <Meta title="Generate New Story" />
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
              <Tooltip title={story.summary}>
                <Card
                  hoverable
                  onClick={() => handleBookClick(story.id)}
                  cover={
                    story.coverImageBase64 ? (
                      <img
                        alt={story.title}
                        src={`data:image/png;base64,${story.coverImageBase64}`}
                        style={{ objectFit: 'cover', height: '200px', width: '100%' }}
                      />
                    ) : (
                      <div
                        style={{
                          height: '200px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: '#f0f0f0',
                        }}
                      >
                        <span>No Image</span>
                      </div>
                    )
                  }
                >
                  <Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginRight: '8px'
                        }}>
                          {story.title}
                        </span>
                        <Popconfirm
                          title="Delete this story?"
                          description="This action cannot be undone."
                          onConfirm={(e) => handleDeleteStory(e as React.MouseEvent, story.id)}
                          onCancel={(e) => e?.stopPropagation()}
                          okText="Yes"
                          cancelText="No"
                        >
                          <div onClick={(e) => e.stopPropagation()}>
                            <DeleteOutlined style={{ 
                              color: '#ff4d4f',
                              flexShrink: 0
                            }} />
                          </div>
                        </Popconfirm>
                      </div>
                    }
                  />
                </Card>
              </Tooltip>
            </Col>
          ))}
        </Row>

        <CreateStoryModal 
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={(settings) => {
            handleModalSubmit({ 
              ...settings, 
              openAIApiKey: apiKey,
              models: {
                ...settings.models,
                outlineModel: selectedModel,
                generationModel: selectedModel,
                feedbackModel: selectedModel,
                imageModel: 'dall-e-3'
              }
            });
          }}
          apiKey={apiKey}
          selectedModel={selectedModel}
        />
      </div>
      <Footer />
    </>
  );
};

export default LandingPage;

