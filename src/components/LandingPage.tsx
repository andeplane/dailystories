// src/components/LandingPage.tsx
import React from 'react';
import { Card, Row, Col, Button, Popconfirm, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useBooks } from '../contexts/BookContext';
import { Book } from '../types/Book';

const { Meta } = Card;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { books, addBook, deleteBook } = useBooks();

  const handleCreateNew = () => {
    addBook({
      title: 'New Book',
      summary: 'A new book summary',
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
    <div style={{ padding: '30px' }}>
      <Row gutter={[16, 16]}>
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

        {/* Generate New Story Card */}
        <Col
          xs={24}
          sm={24}
          md={12}
          lg={8}
          xl={6}
        >
          <Card
            hoverable
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              cursor: 'pointer',
            }}
            onClick={handleCreateNew}
          >
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              size="large"
            >
              Generate New Story
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LandingPage;
