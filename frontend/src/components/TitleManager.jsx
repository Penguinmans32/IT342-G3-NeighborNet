import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const getTitleFromPath = (pathname) => {
  // Remove leading slash and split by '/'
  const paths = pathname.split('/').filter(Boolean);
  const mainPath = paths[0];
  
  const titleMap = {
    '': 'Welcome', // root path
    'homepage': 'Homepage',
    'profile': 'Profile',
    'edit-profile': 'Edit Profile',
    'messages': 'Messages',
    'borrowing': 'Community Borrowing',
    'your-classes': 'Your Classes',
    'create-class': 'Create Class',
    'your-items': 'Your Items',
    'borrowed-items': 'Borrowed Items',
    'community': 'Community',
    'skills': 'Skills Map',
    'about': 'About Us',
    'support': 'Support',
    'teaching-center': 'Teaching Center',
    'roadmap': 'Learning Roadmap',
    'careers': 'Careers',
    'privacy': 'Privacy Policy',
    'docs': 'Documentation',
    'blog': 'Blog',
    'search': 'Search Results',
    'forgot-password': 'Reset Password',
    'admin': 'Admin Dashboard',
    'verify-email': 'Verify Email',
  };

  // Special cases for dynamic routes
  if (paths.length >= 2) {
    if (paths[0] === 'class' && paths[1]) {
      if (paths[2] === 'edit') return 'Edit Class';
      if (paths[2] === 'create-quiz') return 'Create Quiz';
      if (paths[2] === 'quiz') return 'Quiz';
      return 'Class Details';
    }
    if (paths[0] === 'borrowing' && paths[1] === 'item') return 'Item Details';
    if (paths[0] === 'borrowing' && paths[1] === 'add-item') return 'Add Item';
    if (paths[0] === 'your-classes' && paths[2] === 'lessons') return 'Lesson View';
    if (paths[0] === 'chat') return 'Messages';
  }

  return titleMap[mainPath] || 'NeighborNet';
};

const TitleManager = () => {
  const location = useLocation();

  useEffect(() => {
    const title = getTitleFromPath(location.pathname);
    document.title = `${title} | NeighborNet`;
  }, [location]);

  return null;
};

export default TitleManager;