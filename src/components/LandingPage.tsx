// src/components/LandingPage.tsx
import React, { useState } from 'react';
import { Card, Row, Col, Popconfirm, Tooltip, Input, Form, Button } from 'antd';
import { PlusOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useStories } from '../contexts/StoryContext';
import { Story } from '../types/Story';
import CreateStoryModal from './CreateStoryModal';
import { StorySettings } from '../utils/StoryGenerator';
import { MixpanelService } from '../utils/MixpanelService';

const { Meta } = Card;

const OPENAI_KEY_STORAGE = 'openai_api_key';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { stories, addStory, deleteStory } = useStories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem(OPENAI_KEY_STORAGE) || '';
  });
  const [showApiSettings, setShowApiSettings] = useState(!apiKey);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    localStorage.setItem(OPENAI_KEY_STORAGE, newKey);
    if (newKey) {
      // Collapse the settings after a short delay to show the success message
      setTimeout(() => setShowApiSettings(false), 1500);
    }
  };

  const handleCreateNew = () => {
    if (!apiKey) return; // Early return if no API key
    MixpanelService.trackNewBookClick();
    setIsModalOpen(true);
  };

  const handleModalSubmit = (settings: StorySettings) => {
    setIsModalOpen(false);
    // TODO: Initialize BookGenerator with settings and start generation
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
    <div style={{ padding: '20px' }}>
      <Row style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={24} md={12} lg={8}>
          {showApiSettings ? (
            <Form.Item
              label={
                <span style={{ display: 'block'}}>
                  OpenAI API Key
                </span>
              }
              help={
                <span style={{ 
                  fontSize: '12px',
                  display: 'block',
                  wordBreak: 'break-word',
                  minHeight: '32px'
                }}>
                  {!apiKey 
                    ? <>
                        Enter your OpenAI API key to generate stories.{' '}
                        <a 
                          href="https://platform.openai.com/docs/quickstart"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          How to get an API key.
                        </a>
                      </> 
                    : "✓ API key saved in your browser's local storage"}
                </span>
              }
              extra={
                <span style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  display: 'block',
                  marginTop: '-12px',
                  wordBreak: 'break-word'
                }}>
                  Your API key is stored locally in your browser.
                </span>
              }
            >
              <Input.Password
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="Enter your OpenAI API key"
                style={{ width: '100%' }}
              />
            </Form.Item>
          ) : (
            <Tooltip title="API Settings">
              <Button 
                icon={<SettingOutlined />}
                onClick={() => setShowApiSettings(true)}
                style={{ marginBottom: '16px' }}
              >
                API Settings
              </Button>
            </Tooltip>
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
                      <span>{story.title}</span>
                      <Popconfirm
                        title="Delete this story?"
                        description="This action cannot be undone."
                        onConfirm={(e) => handleDeleteStory(e as React.MouseEvent, story.id)}
                        onCancel={(e) => e?.stopPropagation()}
                        okText="Yes"
                        cancelText="No"
                      >
                        <div onClick={(e) => e.stopPropagation()}>
                          <DeleteOutlined style={{ color: '#ff4d4f' }} />
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
          handleModalSubmit({ ...settings, openAIApiKey: apiKey });
        }}
        apiKey={apiKey}
      />
    </div>
  );
};

export default LandingPage;
