import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const JoinWithRoleModal = ({ isOpen, onClose, roomId, roomCodes }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async (e) => {
      e.preventDefault();
      setIsLoading(true);

      try {
          if (!code) {
              throw new Error('Please enter a room code');
          }

          // Convert input code to lowercase for comparison
          const lowerCaseCode = code.toLowerCase();

          // Convert all room codes to lowercase for comparison
          const roleForCode = Object.entries(roomCodes).find(([role, roleCode]) => 
              roleCode.toLowerCase() === lowerCaseCode
          );

          if (!roleForCode) {
              throw new Error('Invalid room code');
          }

          // Use the lowercase code in the URL
          window.location.href = `https://a-livestream-1114.app.100ms.live/meeting/${lowerCaseCode}`;
          
      } catch (error) {
          toast.error(error.message);
      } finally {
          setIsLoading(false);
      }
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Join Study Room</h2>
              
              {/* Show available codes */}
              <div className="mb-6">
                  <h3 className="font-medium mb-2">Available Room Codes:</h3>
                  <div className="space-y-2 text-sm">
                      <div>
                          <span className="font-medium">Speaker:</span>
                          <code className="ml-2 p-1 bg-gray-100 rounded">
                              {roomCodes?.speaker?.toLowerCase() || 'N/A'}
                          </code>
                      </div>
                      <div>
                          <span className="font-medium">Listener:</span>
                          <code className="ml-2 p-1 bg-gray-100 rounded">
                              {roomCodes?.listener?.toLowerCase() || 'N/A'}
                          </code>
                      </div>
                  </div>
              </div>

              <form onSubmit={handleJoin}>
                  <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toLowerCase())} // Change to toLowerCase
                      placeholder="Enter room code"
                      className="w-full px-4 py-2 border rounded-lg mb-4 lowercase" // Add lowercase class
                      style={{ textTransform: 'lowercase' }} // Force lowercase style
                  />
                  <div className="flex justify-end gap-3">
                      <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                          Cancel
                      </button>
                      <button
                          type="submit"
                          disabled={isLoading || !code}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg 
                                   hover:bg-indigo-700 disabled:bg-indigo-400"
                      >
                          {isLoading ? 'Joining...' : 'Join Room'}
                      </button>
                  </div>
              </form>
          </div>
      </div>
  );
};

const StudyRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [isJoiningRoom, setIsJoiningRoom] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomDescription, setNewRoomDescription] = useState('');
    const [roomCodes, setRoomCodes] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleRoomClick = (room) => {
      setSelectedRoom(room);
  };

    const fetchRooms = async () => {
      try {
          const response = await fetch('http://localhost:8080/api/rooms', {
              headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
          });
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          // Make sure each room has its codes
          setRooms(data.map(room => ({
              ...room,
              codes: room.codes || {}
          })));
      } catch (error) {
          console.error('Error fetching rooms:', error);
          toast.error('Failed to load study rooms');
          setRooms([]);
      }
  };

    const createRoom = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    name: newRoomName,
                    description: newRoomDescription || 'Study Room',
                }),
            });

            const data = await response.json();
            setRooms([...rooms, data]);
            setRoomCodes(data.codes); // Show the codes modal
            setIsCreatingRoom(false);
            setNewRoomName('');
            setNewRoomDescription('');
            toast.success('Study room created successfully!');
        } catch (error) {
            console.error('Error creating room:', error);
            toast.error('Failed to create study room');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Study Rooms</h1>
                <div className="flex gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsJoiningRoom(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg 
                               hover:bg-green-700 transition-colors"
                    >
                        Join Room
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsCreatingRoom(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg 
                               hover:bg-indigo-700 transition-colors"
                    >
                        Create Room
                    </motion.button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                    <motion.div
                        key={room?.id || Math.random()}
                        whileHover={{ y: -5 }}
                        className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleRoomClick(room)}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {room.name}
                            </h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{room.description}</p>
                        <div className="flex items-center text-sm text-gray-500">
                            <span>Click to join</span>
                        </div>
                    </motion.div>
                ))}
            </div>

             {/* Join with Role Modal */}
             <JoinWithRoleModal 
              isOpen={selectedRoom !== null}
              onClose={() => setSelectedRoom(null)}
              roomId={selectedRoom?.hmsRoomId}
              roomCodes={selectedRoom?.codes}
          />

            {/* Create Room Modal */}
            {isCreatingRoom && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex 
                              items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-lg p-6 w-full max-w-md"
                    >
                        <h2 className="text-xl font-semibold mb-4">Create Study Room</h2>
                        <input
                            type="text"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            placeholder="Enter room name"
                            className="w-full px-4 py-2 border rounded-lg mb-4"
                        />
                        <input
                            type="text"
                            value={newRoomDescription}
                            onChange={(e) => setNewRoomDescription(e.target.value)}
                            placeholder="Enter room description"
                            className="w-full px-4 py-2 border rounded-lg mb-4"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsCreatingRoom(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createRoom}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg 
                                         hover:bg-indigo-700"
                            >
                                Create
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

           {/* Room Codes Modal */}
            {roomCodes && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex 
                              items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-lg p-6 w-full max-w-md"
                    >
                        <h2 className="text-xl font-semibold mb-4">Room Access Codes</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="font-medium">Moderator Code:</p>
                                <code className="block p-2 bg-gray-100 rounded lowercase">
                                    {roomCodes.moderator?.toLowerCase()}
                                </code>
                            </div>
                            <div>
                                <p className="font-medium">Speaker Code:</p>
                                <code className="block p-2 bg-gray-100 rounded lowercase">
                                    {roomCodes.speaker?.toLowerCase()}
                                </code>
                            </div>
                            <div>
                                <p className="font-medium">Listener Code:</p>
                                <code className="block p-2 bg-gray-100 rounded lowercase">
                                    {roomCodes.listener?.toLowerCase()}
                                </code>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setRoomCodes(null)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg 
                                        hover:bg-indigo-700"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default StudyRooms;