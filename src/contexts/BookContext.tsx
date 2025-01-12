import React, { createContext, useContext, useEffect, useState } from 'react';
import { Book } from '../types/Book';
import { openDB } from 'idb';
// import { books as booksData } from '../data/books';

interface BookContextType {
  books: Book[];
  addBook: (book: Omit<Book, 'id'>) => Promise<Book>;
  getBook: (id: string) => Promise<Book | undefined>;
  deleteBook: (id: string) => Promise<void>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

// Initialize IndexedDB
const initDB = async () => {
  const db = await openDB('books-db', 1, {
    upgrade(db) {
      db.createObjectStore('books', { keyPath: 'id' });
    },
  });
  return db;
};

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    // Load books when component mounts
    const loadBooks = async () => {
      const db = await initDB();
      const allBooks = await db.getAll('books');
      setBooks(allBooks);
    //   setBooks([...booksData, ...allBooks]);
    };
    loadBooks();
  }, []);

  const addBook = async (bookData: Omit<Book, 'id'>) => {
    const db = await initDB();
    const newBook: Book = {
      ...bookData,
      id: crypto.randomUUID(),
    };
    
    await db.add('books', newBook);
    setBooks(prev => [...prev, newBook]);
    return newBook;
  };

  const getBook = async (id: string) => {
    const db = await initDB();
    const dbBook = await db.get('books', id);
    return dbBook;
  };

  const deleteBook = async (id: string) => {
    const db = await initDB();
    await db.delete('books', id);
    setBooks(prev => prev.filter(book => book.id !== id));
  };

  return (
    <BookContext.Provider value={{ books, addBook, getBook, deleteBook }}>
      {children}
    </BookContext.Provider>
  );
};

export const useBooks = () => {
  const context = useContext(BookContext);
  if (context === undefined) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
}; 