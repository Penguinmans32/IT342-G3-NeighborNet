import { useState, useEffect } from 'react';
import axios from 'axios';

export const useActivities = (userId) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Change the endpoint to include userId
        const response = await axios.get(`http://localhost:8080/api/tracking/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const mappedActivities = response.data.map(activity => ({
          id: activity.id,
          type: activity.type,
          title: activity.title,
          description: activity.description,
          date: new Date(activity.createdAt),
          iconName: activity.icon
        }));

        setActivities(mappedActivities);
        console.log(mappedActivities);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchActivities();
    }
  }, [userId]);

  return { activities, loading, error };
};