import React from 'react';
import { BookOutlined } from '@ant-design/icons';

// Define the Story interface
interface Story {
  id?: string;
  title: string;
  coverImageBase64?: string;
  cover_image_url?: string;
}

interface StoryCardProps {
  story: Story;
}

const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  const renderCoverImage = () => {
    if (story.coverImageBase64) {
      return (
        <img
          alt={`Cover for ${story.title}`}
          src={story.coverImageBase64.startsWith('http') 
            ? story.coverImageBase64 
            : `data:image/png;base64,${story.coverImageBase64}`}
          className="w-full h-full object-cover"
          width={200}
          height={200}
        />
      );
    } else if (story.cover_image_url) {
      return (
        <img
          alt={`Cover for ${story.title}`}
          src={story.cover_image_url}
          className="w-full h-full object-cover"
          width={200}
          height={200}
        />
      );
    } else {
      return (
        <div className="flex items-center justify-center h-full bg-gray-200">
          <BookOutlined style={{ fontSize: '3rem', color: '#999' }} />
        </div>
      );
    }
  };

  return (
    <div className="w-full h-full">
      {renderCoverImage()}
    </div>
  );
};

export default StoryCard; 