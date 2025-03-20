import { useState, useEffect } from 'react';
import axios from 'axios';

export const useAchievements = (userId) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        // Change the endpoint to include userId
        const response = await axios.get(`http://localhost:8080/api/achievements/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        // Map the backend data to match our frontend structure
        const mappedAchievements = response.data.map(achievement => ({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          iconName: achievement.icon,
          unlocked: achievement.unlocked,
          progress: (achievement.currentProgress / achievement.requiredProgress) * 100,
          unlockedAt: achievement.unlockedAt
        }));

        setAchievements(mappedAchievements);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAchievements();
    }
  }, [userId]);

  return { achievements, loading, error };
};