import React from 'react';
import { FileImageOutlined } from '@ant-design/icons';

interface Page {
  illustrationBase64?: string;
  illustration_url?: string;
  content?: string;
}

const renderPageImage = (page: Page, currentPage: number) => {
  if (page.illustrationBase64) {
    return (
      <img 
        src={page.illustrationBase64.startsWith('http')
          ? page.illustrationBase64
          : `data:image/png;base64,${page.illustrationBase64}`}
        alt={`Illustration for page ${currentPage + 1}`}
        className="w-full h-auto rounded-lg shadow-md"
      />
    );
  } else if (page.illustration_url) {
    return (
      <img 
        src={page.illustration_url}
        alt={`Illustration for page ${currentPage + 1}`}
        className="w-full h-auto rounded-lg shadow-md"
      />
    );
  } else {
    return (
      <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
        <FileImageOutlined style={{ fontSize: '3rem', color: '#999' }} />
      </div>
    );
  }
}; 