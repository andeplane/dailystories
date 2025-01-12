// src/components/LandingPage.tsx
import React, { useState } from 'react';
import { Card, Row, Col, Button, Popconfirm, Tooltip, Input, Form } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useBooks } from '../contexts/BookContext';
import { Book } from '../types/Book';
import BookSettingsModal from './BookSettingsModal';
import { BookSettings } from '../utils/BookGenerator';
import { MixpanelService } from '../utils/MixpanelService';

const { Meta } = Card;

const OPENAI_KEY_STORAGE = 'openai_api_key';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { books, addBook, deleteBook } = useBooks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem(OPENAI_KEY_STORAGE) || '';
  });

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    localStorage.setItem(OPENAI_KEY_STORAGE, newKey);
  };

  const handleCreateNew = () => {
    MixpanelService.trackNewBookClick();
    setIsModalOpen(true);
  };

  const handleModalSubmit = (settings: BookSettings) => {
    setIsModalOpen(false);
    // TODO: Initialize BookGenerator with settings and start generation
    addBook({
      title: settings.title,
      summary: `A story about ${settings.bookTheme}`,
      coverImageBase64: undefined,
      pages: []
    }).then(newBook => {
      navigate(`/book/${newBook.id}`);
    });
  };

  const handleBookClick = (bookId: string) => {
    navigate(`/book/${bookId}`);
  };

  const handleDeleteBook = (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation(); // Prevent card click event
    deleteBook(bookId);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Row style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={24} md={12} lg={8}>
          <Form.Item
            label={
              <span style={{ display: 'block', marginBottom: '8px' }}>
                OpenAI API Key
              </span>
            }
            help={
              <span style={{ 
                fontSize: '12px',
                display: 'block',
                wordBreak: 'break-word' 
              }}>
                {!apiKey 
                  ? "Enter your OpenAI API key to generate stories" 
                  : "✓ API key saved in your browser's local storage"}
              </span>
            }
            extra={
              <span style={{ 
                fontSize: '12px', 
                color: '#666',
                display: 'block',
                marginTop: '4px',
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
        </Col>

        {books.map((book: Book) => (
          <Col
            key={book.id}
            xs={24}
            sm={24}
            md={12}
            lg={8}
            xl={6}
          >
            <Tooltip title={book.summary}>
              <Card
                hoverable
                onClick={() => handleBookClick(book.id)}
                cover={
                  book.coverImageBase64 ? (
                    <img
                      alt={book.title}
                      src={`data:image/png;base64,${book.coverImageBase64}`}
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
                      <span>{book.title}</span>
                      <Popconfirm
                        title="Delete this book?"
                        description="This action cannot be undone."
                        onConfirm={(e) => handleDeleteBook(e as React.MouseEvent, book.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <DeleteOutlined 
                          style={{ color: '#ff4d4f' }} 
                          onClick={e => e.stopPropagation()} 
                        />
                      </Popconfirm>
                    </div>
                  }
                />
              </Card>
            </Tooltip>
          </Col>
        ))}
      </Row>

      <BookSettingsModal 
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
