import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const classService = {
  async getMyClasses() {
    try {
      const response = await axios.get(`${API_BASE_URL}/classes/my-classes`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  },

  async getClassesByCategory(category) {
    try {
      const response = await axios.get(`${API_BASE_URL}/classes`, {
        params: { category },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching classes by category:', error);
      throw error;
    }
  },

  getFullThumbnailUrl(thumbnailUrl) {
    if (!thumbnailUrl) return '/default-class-image.jpg';
    return thumbnailUrl.startsWith('http') 
      ? thumbnailUrl 
      : `${API_BASE_URL}${thumbnailUrl}`;
  }
};

export default classService;