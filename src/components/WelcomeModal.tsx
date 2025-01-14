import React, { useState, useEffect } from 'react';
import { Modal, Typography, Button, Space, Image, Carousel } from 'antd';
import { BookOutlined, RocketOutlined, SmileOutlined } from '@ant-design/icons';
import './WelcomeModal.css';

const { Title, Paragraph } = Typography;

const carouselSlideStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  height: '500px',
  width: '100%'
};

const carouselContainerStyle = {
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto'
};

const WelcomeModal: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    let hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (true || !hasSeenWelcome) {
      setIsModalVisible(true);
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  }, []);

  const handleOk = () => {
    setIsModalVisible(false);
  };

  return (
    <Modal
      title={<Title level={2}>Welcome to DailyStories!</Title>}
      visible={isModalVisible}
      onOk={handleOk}
      onCancel={handleOk}
      footer={[
        <Button key="start" type="primary" onClick={handleOk} size="large">
          Start Creating Stories
        </Button>,
      ]}
      width={800}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Paragraph>
          DailyStories is an AI-powered children's book generator that creates unique, personalized stories for your little ones.
        </Paragraph>
        
        <div style={carouselContainerStyle}>
          <Carousel 
            autoplay 
            dots={true}
            className="welcome-carousel"
          >
            <div style={carouselSlideStyle}>
              <Image
                src="/dailystories/IMG_7738-portrait.png"
                alt="Customize a story"
                preview={false}
                style={{ maxHeight: '450px', width: 'auto', objectFit: 'contain' }}
              />
              <Paragraph style={{ textAlign: 'center', marginTop: '10px' }}>
                Create a custom story for your child
              </Paragraph>
            </div>
            <div style={carouselSlideStyle}>
              <Image
                src="/dailystories/IMG_7739-portrait.png"
                alt="Generate using AI"
                preview={false}
                style={{ maxHeight: '450px', width: 'auto', objectFit: 'contain' }}
              />
              <Paragraph style={{ textAlign: 'center', marginTop: '10px' }}>
                The story with illustrations is generated using AI
              </Paragraph>
            </div>
            <div style={carouselSlideStyle}>
              <Image
                src="/dailystories/IMG_7740-portrait.png"
                alt="Read the book"
                preview={false}
                style={{ maxHeight: '450px', width: 'auto', objectFit: 'contain' }}
              />
              <Paragraph style={{ textAlign: 'center', marginTop: '10px' }}>
                Read the story on your phone
              </Paragraph>
            </div>
          </Carousel>
        </div>

        <Space direction="vertical">
          <Space>
            <BookOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <Paragraph>Generate custom books with themes you choose</Paragraph>
          </Space>
          <Space>
            <RocketOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <Paragraph>Powered by advanced AI for creative and engaging stories</Paragraph>
          </Space>
          <Space>
            <SmileOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <Paragraph>Create lasting memories with personalized adventures</Paragraph>
          </Space>
        </Space>
      </Space>
    </Modal>
  );
};

export default WelcomeModal;

