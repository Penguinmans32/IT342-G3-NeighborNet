import React from 'react';
import { 
  BookOpen,
  Package,
  Star,
  Award,
  Heart,
  Users,
  Gift,
  MessageCircle,
  Target,
  Share2,
  ThumbsUp
} from 'lucide-react';

export const AchievementIcon = ({ iconName, className }) => {
  const icons = {
    'BookOpen': BookOpen,
    'Package': Package,
    'Star': Star,
    'Award': Award,
    'Heart': Heart,
    'Crown': Award,
    'HandShake': Users,
    'Gift': Gift,
    'MessageCircle': MessageCircle,
    'Target': Target,
    'Share2': Share2,
    'Users': Users,
    'ThumbsUp': ThumbsUp
  };

  const IconComponent = icons[iconName] || Award;
  return <IconComponent className={className || "h-8 w-8 text-gray-500"} />;
};