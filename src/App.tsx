// src/App.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import 'antd/dist/reset.css';
import ScrollableBookViewer from './components/ScrollableBookViewer';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BookProvider, useBooks } from './contexts/BookContext';
import { Book } from './types/Book';

const BookRoute = () => {
  const { id } = useParams();
  const { getBook } = useBooks();
  const [book, setBook] = useState<Book | undefined>();

  useEffect(() => {
    if (id) {
      getBook(id).then(setBook);
    }
  }, [id, getBook]);
  
  if (!book) return <div>Loading...</div>;
  return <ScrollableBookViewer book={book} />;
};

const App: React.FC = () => {
  return (
    <BookProvider>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/book/:id" element={<BookRoute />} />
        </Routes>
      </BrowserRouter>
    </BookProvider>
  );
};

export default App;
