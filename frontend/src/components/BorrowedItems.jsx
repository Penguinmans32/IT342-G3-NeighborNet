import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BorrowedItems = () => {
  const [borrowedItems, setBorrowedItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBorrowedItems();
  }, []);

  const fetchBorrowedItems = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/borrowing/items/borrowed', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setBorrowedItems(data);
    } catch (error) {
      console.error('Error fetching borrowed items:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Borrowed Items</h1>
        <button
          onClick={() => navigate('/your-items')}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back to Your Items
        </button>
      </div>

      {borrowedItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {borrowedItems.map(item => (
            <div key={item.id} className="border rounded-lg p-4 shadow-sm">
              <img 
                src={item.imageUrls[0]} 
                alt={item.name} 
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <div className="bg-blue-100 p-2 rounded">
                <p className="text-blue-800">Owner: {item.owner?.username || 'Unknown'}</p>
                <p className="text-blue-800">Contact: {item.contactPreference}</p>
                {item.email && <p className="text-blue-800">Email: {item.email}</p>}
                {item.phone && <p className="text-blue-800">Phone: {item.phone}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-xl text-gray-600">You haven't borrowed any items yet.</p>
        </div>
      )}
    </div>
  );
};

export default BorrowedItems;