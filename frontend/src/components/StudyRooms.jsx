"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { BookOpen, Users, ChevronRight, Copy, ExternalLink, Key } from "lucide-react"

const ReturnLinkModal = ({ isOpen, onClose, onContinue }) => {
    const appUrl = window.location.origin;
  
    const copyToClipboard = () => {
      navigator.clipboard.writeText(appUrl);
      toast.success("Return link copied to clipboard!", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
        iconTheme: {
          primary: "#10B981",
          secondary: "#FFFFFF",
        },
      });
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Save Return Link</h2>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5">
            <p className="text-sm text-emerald-800">
              You will be redirected to a 100ms-powered interface. 100ms is our trusted video conferencing provider. Learn
              more about{" "}
              <a
                href="https://www.100ms.live"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                100ms
              </a>
              .
            </p>
          </div>
          <p className="text-gray-600 mb-4">
            Please save this link to return to the application after your session:
          </p>
          <div className="flex items-center gap-2 mb-6">
            <input
              type="text"
              value={appUrl}
              readOnly
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 font-mono text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 
                       transition-colors flex items-center gap-2"
            >
              <Copy size={16} />
              <span>Copy</span>
            </button>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-gray-600 hover:text-gray-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onContinue}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 
                       transition-colors flex items-center gap-2 font-medium"
            >
              <span>Continue to Session</span>
              <ExternalLink size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const JoinWithRoleModal = ({ isOpen, onClose, roomId, roomCodes, room }) => {
    const [selectedRole, setSelectedRole] = useState("");
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showReturnLink, setShowReturnLink] = useState(false);
    const [redirectUrl, setRedirectUrl] = useState("");
  
    const handleJoin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
      
        try {
          if (!code) {
            throw new Error("Please enter a room code");
          }
      
          const lowerCaseCode = code.toLowerCase();
          const roleForCode = Object.entries(roomCodes).find(
            ([role, roleCode]) => roleCode?.toLowerCase() === lowerCaseCode
          );
      
          if (!roleForCode) {
            throw new Error("Invalid room code");
          }
      
          // Increment participant count when joining
          await fetch(`http://localhost:8080/api/rooms/${room.id}/join`, { 
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
      
          setRedirectUrl(`https://a-livestream-1114.app.100ms.live/meeting/${lowerCaseCode}`);
          setShowReturnLink(true);
      
          window.addEventListener('beforeunload', async () => {
            await fetch(`http://localhost:8080/api/rooms/${room.id}/leave`, { 
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
          });
          
        } catch (error) {
          toast.error(error.message, {
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
          });
          setIsLoading(false);
        }
      };
      
  
    const handleContinueToSession = () => {
      window.location.href = redirectUrl;
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100"
        >
          <h2 className="text-2xl font-bold mb-5 text-gray-800">Join Study Room</h2>
  
          <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="font-semibold mb-3 text-gray-700 flex items-center gap-2">
              <Key size={16} />
              <span>Available Room Codes:</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <span className="font-medium text-gray-600 w-24">Speaker:</span>
                <code className="ml-2 p-2 bg-gray-100 rounded-lg text-emerald-600 font-mono">
                  {roomCodes?.speaker?.toLowerCase() || "N/A"}
                </code>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-600 w-24">Listener:</span>
                <code className="ml-2 p-2 bg-gray-100 rounded-lg text-emerald-600 font-mono">
                  {roomCodes?.listener?.toLowerCase() || "N/A"}
                </code>
              </div>
            </div>
          </div>
  
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label htmlFor="room-code" className="block text-sm font-medium text-gray-700 mb-1.5">
                Enter your access code:
              </label>
              <input
                id="room-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toLowerCase())}
                placeholder="Enter room code"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-4 lowercase
                         bg-white text-gray-800 focus:ring-2 focus:ring-emerald-500 
                         focus:border-transparent outline-none transition-all"
                style={{ textTransform: "lowercase" }}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-gray-600 hover:text-gray-800 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !code}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl 
                         hover:bg-emerald-700 transition-colors disabled:bg-emerald-400 
                         disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Joining...</span>
                  </>
                ) : (
                  <>
                    <span>Join Room</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
  
        <ReturnLinkModal
          isOpen={showReturnLink}
          onClose={() => {
            setShowReturnLink(false);
            setIsLoading(false);
          }}
          onContinue={handleContinueToSession}
        />
      </div>
    );
  };

const StudyRooms = () => {
  const [rooms, setRooms] = useState([])
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [isJoiningRoom, setIsJoiningRoom] = useState(false)
  const [newRoomName, setNewRoomName] = useState("")
  const [newRoomDescription, setNewRoomDescription] = useState("")
  const [roomCodes, setRoomCodes] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchRooms();
    // Refresh rooms every 30 seconds to update participant counts
    const interval = setInterval(fetchRooms, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRoomClick = (room) => {
    setSelectedRoom(room)
  }

  const fetchRooms = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/rooms", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      // Make sure each room has its codes
      setRooms(
        data.map((room) => ({
          ...room,
          codes: room.codes || {},
        })),
      )
    } catch (error) {
      console.error("Error fetching rooms:", error)
      toast.error("Failed to load study rooms", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      })
      setRooms([])
    }
  }

  const createRoom = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: newRoomName,
          description: newRoomDescription || "Study Room",
        }),
      })

      const data = await response.json()
      setRooms([...rooms, data])
      setRoomCodes(data.codes) // Show the codes modal
      setIsCreatingRoom(false)
      setNewRoomName("")
      setNewRoomDescription("")
      toast.success("Study room created successfully!", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
        iconTheme: {
          primary: "#10B981",
          secondary: "#FFFFFF",
        },
      })
    } catch (error) {
      console.error("Error creating room:", error)
      toast.error("Failed to create study room", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      })
    }
  }

  // Sample room data for empty state
  const sampleRooms =
    rooms.length === 0
      ? [
          {
            id: "sample-1",
            name: "Mathematics 101",
            description: "Advanced calculus and algebra study group",
            codes: {},
          },
          { id: "sample-2", name: "Computer Science", description: "Algorithm design and data structures", codes: {} },
          { id: "sample-3", name: "Physics Lab", description: "Quantum mechanics discussion group", codes: {} },
        ]
      : []

  const displayRooms = rooms.length > 0 ? rooms : sampleRooms

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Rooms</h1>
            <p className="text-gray-600">
              Join or create virtual study spaces for collaborative learning
            </p>
          </div>
          <div className="flex gap-3 self-end sm:self-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsCreatingRoom(true)}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl 
                       hover:bg-emerald-700 transition-all shadow-sm hover:shadow
                       flex items-center gap-2"
            >
              <BookOpen size={18} />
              <span>Create Room</span>
            </motion.button>
          </div>
        </div>

        {rooms.length === 0 && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
            <p className="text-gray-600 text-center py-2">
              Sample rooms shown below. Create your first room to get started!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayRooms.map((room) => (
            <motion.div
            key={room?.id || Math.random()}
            whileHover={{
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            }}
            className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg 
                        transition-all duration-300 cursor-pointer border border-gray-100"
            onClick={() => handleRoomClick(room)}
            >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{room.name}</h3>
                <div className="flex items-center gap-3">
                <div className="flex items-center text-gray-500 text-sm">
                    <Users size={14} className="mr-1" />
                    <span>{room.activeParticipants || 0}</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <BookOpen size={16} className="text-emerald-600" />
                </div>
                </div>
            </div>
            <p className="text-gray-600 mb-6">{room.description}</p>
            <div className="flex items-center text-sm text-emerald-600 font-medium">
                <span>Click to join</span>
                <ChevronRight size={16} className="ml-1" />
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
        room={selectedRoom} 
        />


        {/* Create Room Modal */}
        {isCreatingRoom && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100"
            >
              <h2 className="text-2xl font-bold mb-5 text-gray-800">Create Study Room</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="room-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Room Name
                  </label>
                  <input
                    id="room-name"
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Enter room name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl
                             bg-white text-gray-800 focus:ring-2 focus:ring-emerald-500 
                             focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="room-description" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Room Description
                  </label>
                  <input
                    id="room-description"
                    type="text"
                    value={newRoomDescription}
                    onChange={(e) => setNewRoomDescription(e.target.value)}
                    placeholder="Enter room description"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl
                             bg-white text-gray-800 focus:ring-2 focus:ring-emerald-500 
                             focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsCreatingRoom(false)}
                  className="px-5 py-2.5 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={createRoom}
                  disabled={!newRoomName}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl 
                           hover:bg-emerald-700 transition-colors disabled:bg-emerald-400 
                           disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                >
                  Create Room
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Room Codes Modal */}
        {roomCodes && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100"
            >
              <h2 className="text-2xl font-bold mb-5 text-gray-800 flex items-center gap-2">
                <Key size={20} className="text-emerald-600" />
                Room Access Codes
              </h2>
              <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <p className="font-medium text-gray-700 mb-1.5">Moderator Code:</p>
                  <code className="block p-3 bg-gray-100 rounded-lg lowercase text-emerald-600 font-mono">
                    {roomCodes.moderator?.toLowerCase()}
                  </code>
                </div>
                <div>
                  <p className="font-medium text-gray-700 mb-1.5">Speaker Code:</p>
                  <code className="block p-3 bg-gray-100 rounded-lg lowercase text-emerald-600 font-mono">
                    {roomCodes.speaker?.toLowerCase()}
                  </code>
                </div>
                <div>
                  <p className="font-medium text-gray-700 mb-1.5">Listener Code:</p>
                  <code className="block p-3 bg-gray-100 rounded-lg lowercase text-emerald-600 font-mono">
                    {roomCodes.listener?.toLowerCase()}
                  </code>
                </div>
              </div>
              <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> Save these codes. After joining a session, you can return to this
                  application using the URL that will be provided.
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setRoomCodes(null)}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl 
                           hover:bg-emerald-700 transition-colors flex items-center gap-2 font-medium"
                >
                  <span>Got it</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 100ms Credits Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span>Powered by</span>
              <a
                href="https://www.100ms.live"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-800 transition-colors"
              >
                <img src="https://www.100ms.live/assets/logo.svg" alt="100ms" className="h-5" />
                <span className="font-medium">100ms</span>
              </a>
            </div>
            <p>
              Video conferencing functionality is provided by 100ms.
              <a
                href="https://www.100ms.live/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-emerald-600 hover:text-emerald-800 transition-colors font-medium"
              >
                Learn more
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudyRooms
