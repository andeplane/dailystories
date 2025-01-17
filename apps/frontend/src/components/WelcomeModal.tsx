import React, { useState, useEffect } from 'react';
import { Modal, Typography, Button, Space, Image, Carousel } from 'antd';
import { EditOutlined, PictureOutlined, KeyOutlined } from '@ant-design/icons';
import './WelcomeModal.css';

const { Title, Paragraph } = Typography;

const carouselSlideStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  height: '400px',
  width: '100%'
};

const carouselContainerStyle = {
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
  paddingBottom: '20px'
};

const WelcomeModal: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    let hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setIsModalVisible(true);
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  }, []);

  const handleOk = () => {
    setIsModalVisible(false);
  };

  return (
    <Modal
      title={<Title level={2} style={{ margin: '8px 0' }}>Welcome to Daily Stories</Title>}
      visible={isModalVisible}
      onOk={handleOk}
      onCancel={handleOk}
      footer={[
        <Button key="start" type="primary" onClick={handleOk} size="large">
          Start Creating Stories
        </Button>,
      ]}
      width={1000}
      className="welcome-modal"
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Paragraph>
          DailyStories is an AI-powered children's book generator that creates unique, personalized stories for your little ones.
          Provide your own OpenAI API key to generate stories.
        </Paragraph>
        
        <div style={carouselContainerStyle}>
          <Carousel 
            autoplay 
            dots={true}
            className="welcome-carousel"
          >
            <div style={carouselSlideStyle}>
              <div className="carousel-slide-container">
                <Image
                  src="/dailystories/IMG_7740-portrait.png"
                  alt="Read the book"
                  preview={false}
                  className="carousel-image"
                />
              </div>
              <Paragraph style={{ textAlign: 'center', margin: '8px 0 0' }}>
                Generate personalized stories with colorful illustrations
              </Paragraph>
            </div>
            <div style={carouselSlideStyle}>
              <div className="carousel-slide-container">
                <Image
                  src="/dailystories/IMG_7738-portrait.png"
                  alt="Customize a story"
                  preview={false}
                  className="carousel-image"
                />
              </div>
              <Paragraph style={{ textAlign: 'center', margin: '8px 0 0' }}>
                Create a custom story for your child, with them as main character
              </Paragraph>
            </div>
            <div style={carouselSlideStyle}>
              <div className="carousel-slide-container">
                <Image
                  src="/dailystories/IMG_7739-portrait.png"
                  alt="Generate using AI"
                  preview={false}
                  className="carousel-image"
                />
              </div>
              <Paragraph style={{ textAlign: 'center', margin: '8px 0 0' }}>
                The story with illustrations is generated using AI
              </Paragraph>
            </div>
          </Carousel>
        </div>

        <Space direction="vertical" size="small">
          <Space>
            <EditOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <Paragraph style={{ margin: 0 }}>Generate personalized stories</Paragraph>
          </Space>
          <Space>
            <PictureOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <Paragraph style={{ margin: 0 }}>Beautiful illustrations generated by AI</Paragraph>
          </Space>
          <Space>
            <KeyOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <Paragraph style={{ margin: 0 }}>Use your own OpenAI API key</Paragraph>
          </Space>
        </Space>
      </Space>
    </Modal>
  );
};

export default WelcomeModal;

