import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import styled from "styled-components"
import { useAuth } from "../backendApi/AuthContext"
import axios from "axios"
import { useNotification } from "../backendApi/NotificationContext"
import webSocketService from "../backendApi/websocketService"
import Footer from './SplashScreen/Footer';
import toast from 'react-hot-toast';
import {
  MdArrowBack,
  MdLocationOn,
  MdPerson,
  MdCalendarToday,
  MdAccessTime,
  MdEmail,
  MdPhone,
  MdInfo,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
} from "react-icons/md"


// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom right, rgba(64, 75, 92, 0.1), rgba(42, 81, 143, 0.1), rgba(147, 51, 234, 0.1));
`

const NavBar = styled.div`
  background: linear-gradient(to right,rgb(97, 120, 155),rgb(42, 81, 143), #9333ea);
  box-shadow: 0 2px 4px rgba(248, 239, 239, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
`

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
`

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color:rgb(251, 251, 252);
  background: none;
  border: none;
  font-size: 1rem;
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    color:rgb(207, 211, 231);
    background-color:rgb(138, 165, 192);
  }
`

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`

const ImageGallery = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const MainImageContainer = styled.div`
  position: relative;
  aspect-ratio: 4/3;
  background-color: #f1f3f5;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`

const MainImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const ImageNavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${(props) => (props.direction === "prev" ? "left: 1rem;" : "right: 1rem;")}
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;

  &:hover {
    background-color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`

const ThumbnailsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f3f5;
    border-radius: 9999px;
  }

  &::-webkit-scrollbar-thumb {
    background: #dee2e6;
    border-radius: 9999px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #ced4da;
  }
`

const ThumbnailButton = styled.button`
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid ${(props) => (props.$active ? "#4361ee" : "transparent")};
  transition: all 0.3s ease;
  padding: 0;
  background: none;
  cursor: pointer;
  box-shadow: ${(props) => (props.$active ? "0 0 0 2px rgba(67, 97, 238, 0.3)" : "none")};
`;

const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: slideUp 0.5s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`

const ItemTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: transparent;
  background: linear-gradient(135deg, #4361ee, #7209b7);
  -webkit-background-clip: text;
  background-clip: text;
  margin-bottom: 0.5rem;
  display: inline-block;

  @media (max-width: 767px) {
    font-size: 1.5rem;
  }
`

const ItemMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
`

const Category = styled.span`
  padding: 0.5rem 1rem;
  background-color: white; /* Change background color to white */
  color: #4361ee; /* Keep the text color as it is */
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid #4361ee; /* Optional: Add a border to make it more visible */
`

const Location = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #6c757d;
  font-size: 0.875rem;
`

const Description = styled.div`
  color: #6c757d;
  line-height: 1.6;
  background-color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #4361ee;
`

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #343a40;
  margin-bottom: 1rem;
  position: relative;
  padding-left: 1rem;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(135deg, #4361ee, #7209b7);
    border-radius: 9999px;
  }

  @media (max-width: 767px) {
    font-size: 1.125rem;
  }
`

const AvailabilityGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 480px) {
    grid-template-columns: 1fr 1fr;
  }
`

const Card = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background-color: ${(props) => (props.$variant === "owner" ? "rgba(114, 9, 183, 0.05)" : "rgba(67, 97, 238, 0.05)")};
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid ${(props) => (props.$variant === "owner" ? "rgba(114, 9, 183, 0.1)" : "rgba(67, 97, 238, 0.1)")};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    background-color: ${(props) => (props.$variant === "owner" ? "rgba(114, 9, 183, 0.08)" : "rgba(67, 97, 238, 0.08)")};
  }
`;

const IconContainer = styled.div`
  font-size: 1.5rem;
  color: ${(props) => (props.$variant === "owner" ? "#7209b7" : "#4361ee")};
  background-color: ${(props) => (props.$variant === "owner" ? "rgba(114, 9, 183, 0.1)" : "rgba(67, 97, 238, 0.1)")};
  padding: 0.75rem;
  border-radius: 50%;
`;

const CardContent = styled.div`
  flex: 1;
`

const CardLabel = styled.p`
  font-size: 0.75rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
`

const CardValue = styled.p`
  font-weight: 500;
  color: #343a40;
`

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-direction: column;

  @media (min-width: 480px) {
    flex-direction: row;
  }
`

const Button = styled(motion.button)`
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  flex: 1;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

   ${(props) => {
    if (props.$variant === "primary") {
      return `
        background: linear-gradient(135deg, #4361ee, #7209b7);
        color: white;
        border: none;

        &:hover {
          box-shadow: 0 6px 15px rgba(67, 97, 238, 0.4);
        }
      `;
    } else if (props.$variant === "secondary") {
      return `
        background-color: white;
        color: #4361ee;
        border: 2px solid #4361ee;

        &:hover {
          background-color: rgba(67, 97, 238, 0.05);
          box-shadow: 0 6px 15px rgba(67, 97, 238, 0.2);
        }
      `;
    } else if (props.$variant === "delete") {
      return `
        background-color: white;
        color: #e63946;
        border: 2px solid #e63946;

        &:hover {
          background-color: rgba(230, 57, 70, 0.05);
          box-shadow: 0 6px 15px rgba(230, 57, 70, 0.2);
        }
      `;
    }
  }}
`;

const Modal = styled(motion.div)`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 50;
`



const ModalContent = styled(motion.div)`
  background-color: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #e9ecef;

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #343a40;
  }
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #adb5bd;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background-color: #f1f3f5;
    color: #495057;
  }
`

const Form = styled.form`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-weight: 500;
  color: #495057;
  font-size: 0.875rem;
`

const DateRange = styled.span`
  font-size: 0.75rem;
  color: #6c757d;
  font-weight: normal;
  margin-top: 0.25rem;
`

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    border-color: #4361ee;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
    outline: none;
  }
`

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;

  &:focus {
    border-color: #4361ee;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
    outline: none;
  }
`

const SuggestedMessages = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`

const SuggestedMessageButton = styled.button`
  padding: 0.5rem 0.75rem;
  background-color: rgba(67, 97, 238, 0.1);
  color: #4361ee;
  border: none;
  border-radius: 9999px;
  font-size: 0.75rem;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background-color: rgba(67, 97, 238, 0.2);
  }
`

const ContactInfo = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const ContactNote = styled.div`
  margin-top: 0.5rem;
  padding: 1rem;
  background-color: rgba(67, 97, 238, 0.05);
  border-radius: 8px;
  border-left: 4px solid #4361ee;

  p {
    font-size: 0.875rem;
    color: #4361ee;
  }
`

const LoadingSpinner = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid rgba(67, 97, 238, 0.1);
  border-top-color: #4361ee;
  animation: spin 1s infinite linear;
  box-shadow: 0 4px 10px rgba(67, 97, 238, 0.2);

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
`

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(to right, blue, purple);
  color: white;
  text-align: center;

  h2 {
    font-size: 2rem;
    font-weight: 600;
    color: #495057;
    margin-bottom: 1.5rem;
  }
`

const ItemDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [showBorrowForm, setShowBorrowForm] = useState(false)
  const { showNotification } = useNotification()
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(null);

  useEffect(() => {
    if (item) {
      setEditedItem({
        name: item.name || '',
        description: item.description || '',
        category: item.category || '',
        location: item.location || '',
        availabilityPeriod: item.availabilityPeriod || '',
        availableFrom: formatDateForInput(item.availableFrom) || '',
        availableUntil: formatDateForInput(item.availableUntil) || '',
        terms: item.terms || '',
        contactPreference: item.contactPreference || '',
        email: item.email || '',
        phone: item.phone || ''
      });
    }
  }, [item]);

  useEffect(() => {
    let mounted = true

    const connectWebSocket = async () => {
      if (user && mounted) {
        try {
          await webSocketService.connect(user.data.id, (notification) => {
            if (mounted) {
              toast(notification.message, {
                icon: '🔔',
              });
            }
          })
        } catch (error) {
          console.error("WebSocket connection failed:", error)
        }
      }
    };

    connectWebSocket()

    return () => {
      mounted = false
      webSocketService.disconnect()
    }
  }, [user, showNotification])

  const [borrowRequest, setBorrowRequest] = useState({
    startDate: "",
    endDate: "",
    message: "",
  })

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString)
    return date.toISOString().split("T")[0]
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item? This will also delete all associated borrow requests.')) {
      try {
        await axios.delete(`http://localhost:8080/api/borrowing/items/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        
        toast.success('The item and all associated borrow requests have been successfully deleted.');
        navigate('/borrowing');
      } catch (error) {
        console.error("Error deleting item:", error);
        toast.error(error.response?.data?.message || "Failed to delete the item. Please try again.");
      }
    }
  };

  const handleUpdate = async () => {
    try {
        const updateRequest = {
            name: editedItem.name,
            description: editedItem.description,
            category: editedItem.category,
            location: editedItem.location,
            availabilityPeriod: editedItem.availabilityPeriod,
            availableFrom: editedItem.availableFrom,
            availableUntil: editedItem.availableUntil,
            terms: editedItem.terms,
            contactPreference: editedItem.contactPreference,
            email: editedItem.email,
            phone: editedItem.phone
        };

        const response = await axios.put(
            `http://localhost:8080/api/borrowing/items/${id}`,
            updateRequest,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (response.data) {
            setItem(response.data);
            setIsEditing(false);
            toast.success('Your item has been successfully updated.');
        } else {
            throw new Error('No data received from server');
        }
    } catch (error) {
        console.error("Error updating item:", error);
        console.error("Error response:", error.response?.data);
        toast.error(error.response?.data?.message || "Failed to update the item");
    }
};

  const handleInputChange = (e) => {
    if (!editedItem) return;
    
    const { name, value } = e.target;
    setEditedItem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/borrowing/items/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        setItem(response.data)
        //console.log("Item details:", response.data)
      } catch (error) {
        console.error("Error fetching item details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchItemDetails()
  }, [id])

  const handleBorrowSubmit = async (e) => {
    e.preventDefault()
    try {
      const formattedRequest = {
        itemId: Number.parseInt(id),
        startDate: new Date(borrowRequest.startDate).toISOString().split("T")[0],
        endDate: new Date(borrowRequest.endDate).toISOString().split("T")[0],
        message: borrowRequest.message,
        itemName: item.name,
      }
  
      const response = await axios.post(`http://localhost:8080/api/borrowing/requests`, formattedRequest, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })
  
      if (response.status === 200 || response.status === 201) {
        setShowBorrowForm(false)
        toast.success('Your borrow request has been sent to the owner.');
      }
    } catch (error) {
      console.error("Borrow request error:", error)
      const errorMessage = error.response?.data?.message || "Failed to send borrow request. Please try again."
      toast.error(errorMessage);
    }
  };

  const suggestedMessages = [
    "Hi! I'm interested in borrowing this item. Is it still available?",
    "Hello! I'd like to borrow this. Can you confirm if it's in good condition?",
    "I'd love to borrow this item. I'll take good care of it!",
  ]

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
      </LoadingContainer>
    )
  }

  if (!item) {
    return (
      <NotFoundContainer>
        <h2>Item not found</h2>
        <Button $variant="primary" onClick={() => navigate("/borrowing")}>
          Back to Items
        </Button>
      </NotFoundContainer>
    )
  }

  return (
    <Container>
      <NavBar>
        <NavContent>
          <BackButton onClick={() => navigate("/borrowing")}>
            <MdArrowBack />
            <span>Back to Items</span>
          </BackButton>
        </NavContent>
      </NavBar>

      <MainContent>
        <Grid>
          <ImageGallery>
            <MainImageContainer>
              {item.imageUrls && item.imageUrls.length > 0 ? (
                <>
                  <MainImage src={item.imageUrls[currentImageIndex] || "/placeholder.svg"} alt={item.name} />
                  {item.imageUrls.length > 1 && (
                    <>
                      <ImageNavButton
                        direction="prev"
                        onClick={() =>
                          setCurrentImageIndex((prev) => (prev === 0 ? item.imageUrls.length - 1 : prev - 1))
                        }
                      >
                        <MdChevronLeft />
                      </ImageNavButton>
                      <ImageNavButton
                        direction="next"
                        onClick={() =>
                          setCurrentImageIndex((prev) => (prev === item.imageUrls.length - 1 ? 0 : prev + 1))
                        }
                      >
                        <MdChevronRight />
                      </ImageNavButton>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p>No images available</p>
                </div>
              )}
            </MainImageContainer>

            {item.imageUrls && item.imageUrls.length > 1 && (
              <ThumbnailsContainer>
                {item.imageUrls.map((url, index) => (
                  <ThumbnailButton
                    key={index}
                    $active={currentImageIndex === index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2
                              ${currentImageIndex === index ? 'border-blue-500' : 'border-transparent'}`}
                  >
                    <ThumbnailImage src={url} alt={`${item.name} thumbnail ${index + 1}`} />
                  </ThumbnailButton>
                ))}
              </ThumbnailsContainer>
            )}
          </ImageGallery>

          <ItemDetails>
              {!isEditing ? (
                // Regular View Mode - Your existing code
                <>
                  <div>
                    <ItemTitle>{item.name}</ItemTitle>
                    <ItemMeta>
                      <Category>{item.category}</Category>
                      <Location>
                        <MdLocationOn />
                        {item.location}
                      </Location>
                    </ItemMeta>
                  </div>

                  <Description>
                    <p>{item.description}</p>
                  </Description>

                  <div>
                    <SectionTitle>Availability</SectionTitle>
                    <AvailabilityGrid>
                      <Card>
                        <IconContainer>
                          <MdCalendarToday />
                        </IconContainer>
                        <CardContent>
                          <CardLabel>Available From</CardLabel>
                          <CardValue>{new Date(item.availableFrom).toLocaleDateString()}</CardValue>
                        </CardContent>
                      </Card>
                      <Card>
                        <IconContainer>
                          <MdCalendarToday />
                        </IconContainer>
                        <CardContent>
                          <CardLabel>Available Until</CardLabel>
                          <CardValue>{new Date(item.availableUntil).toLocaleDateString()}</CardValue>
                        </CardContent>
                      </Card>
                    </AvailabilityGrid>
                  </div>

                  <div>
                    <SectionTitle>Owner</SectionTitle>
                    <Card $variant="owner">
                      <IconContainer $variant="owner">
                        <MdPerson />
                      </IconContainer>
                      <CardContent>
                        <CardValue>{item.owner?.username || "Anonymous"}</CardValue>
                        <CardLabel>{item.availabilityPeriod}</CardLabel>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <SectionTitle>Contact Preference</SectionTitle>
                    <Card $variant="owner">
                      <IconContainer $variant="owner">
                        <MdPerson />
                      </IconContainer>
                      <CardContent>
                        <CardValue>
                          {item.contactPreference 
                            ? item.contactPreference.charAt(0).toUpperCase() + item.contactPreference.slice(1) 
                            : "Anonymous"}
                        </CardValue>
                        <CardLabel>
                          {item.email
                            ? item.email.charAt(0).toUpperCase() + item.email.slice(1)
                            : ""}
                        </CardLabel>
                      </CardContent>
                    </Card>
                  </div>

                  {item.terms && (
                    <div>
                      <SectionTitle>Terms and Conditions</SectionTitle>
                      <Description>
                        <p>{item.terms}</p>
                      </Description>
                    </div>
                  )}

                  <ActionButtons>
                    {item.owner?.id !== user?.id ? (
                      <>
                        <Button
                          $variant="primary"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowBorrowForm(true)}
                        >
                          Request to Borrow
                        </Button>
                        <Button
                          $variant="secondary"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowContactInfo(true)}
                        >
                          Contact Owner
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          $variant="primary"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsEditing(true)}
                        >
                          Edit Item
                        </Button>
                        <Button
                          $variant="delete"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleDelete}
                        >
                          Delete Item
                        </Button>
                      </>
                    )}
                  </ActionButtons>
                </>
              ) : (
                // Edit Mode
                <Form onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdate();
                }}>
                  <FormGroup>
                    <Label>Name</Label>
                    <Input
                      type="text"
                      name="name"
                      value={editedItem.name}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Description</Label>
                    <Textarea
                      name="description"
                      value={editedItem.description}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Category</Label>
                    <Input
                      type="text"
                      name="category"
                      value={editedItem.category}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Location</Label>
                    <Input
                      type="text"
                      name="location"
                      value={editedItem.location}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Availability Period</Label>
                    <Input
                      type="text"
                      name="availabilityPeriod"
                      value={editedItem.availabilityPeriod}
                      onChange={handleInputChange}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Available From</Label>
                    <Input
                      type="date"
                      name="availableFrom"
                      value={editedItem.availableFrom}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Available Until</Label>
                    <Input
                      type="date"
                      name="availableUntil"
                      value={editedItem.availableUntil}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Terms and Conditions</Label>
                    <Textarea
                      name="terms"
                      value={editedItem.terms}
                      onChange={handleInputChange}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Contact Preference</Label>
                    <Input
                      type="text"
                      name="contactPreference"
                      value={editedItem.contactPreference}
                      onChange={handleInputChange}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      name="email"
                      value={editedItem.email}
                      onChange={handleInputChange}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Phone</Label>
                    <Input
                      type="tel"
                      name="phone"
                      value={editedItem.phone}
                      onChange={handleInputChange}
                    />
                  </FormGroup>

                  <ActionButtons>
                    <Button type="submit" variant="primary">
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      $variant="secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </ActionButtons>
                </Form>
              )}
            </ItemDetails>
        </Grid>
      </MainContent>

      <AnimatePresence>
        {showBorrowForm && (
          <Modal initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <ModalHeader>
                <h3>Request to Borrow</h3>
                <CloseButton onClick={() => setShowBorrowForm(false)}>
                  <MdClose />
                </CloseButton>
              </ModalHeader>

              <Form onSubmit={handleBorrowSubmit}>
                <FormGroup>
                  <Label>
                    Start Date
                    <DateRange>
                      (Available: {new Date(item.availableFrom).toLocaleDateString()} -
                      {new Date(item.availableUntil).toLocaleDateString()})
                    </DateRange>
                  </Label>
                  <Input
                    type="date"
                    value={borrowRequest.startDate}
                    onChange={(e) =>
                      setBorrowRequest({
                        ...borrowRequest,
                        startDate: e.target.value,
                        endDate:
                          new Date(e.target.value) > new Date(borrowRequest.endDate)
                            ? e.target.value
                            : borrowRequest.endDate,
                      })
                    }
                    min={formatDateForInput(item.availableFrom)}
                    max={formatDateForInput(item.availableUntil)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={borrowRequest.endDate}
                    onChange={(e) =>
                      setBorrowRequest({
                        ...borrowRequest,
                        endDate: e.target.value,
                      })
                    }
                    min={borrowRequest.startDate || formatDateForInput(item.availableFrom)}
                    max={formatDateForInput(item.availableUntil)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Message to Owner</Label>
                  <SuggestedMessages>
                    {suggestedMessages.map((msg, index) => (
                      <SuggestedMessageButton
                        key={index}
                        type="button"
                        onClick={() =>
                          setBorrowRequest((prev) => ({
                            ...prev,
                            message: msg,
                          }))
                        }
                      >
                        {msg}
                      </SuggestedMessageButton>
                    ))}
                  </SuggestedMessages>
                  <Textarea
                    value={borrowRequest.message}
                    onChange={(e) =>
                      setBorrowRequest({
                        ...borrowRequest,
                        message: e.target.value,
                      })
                    }
                    placeholder="Explain why you'd like to borrow this item..."
                    required
                  />
                </FormGroup>

                <Button type="submit" variant="primary">
                  Submit Request
                </Button>
              </Form>
            </ModalContent>
          </Modal>
        )}

        {showContactInfo && (
          <Modal initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <ModalHeader>
                <h3>Contact Information</h3>
                <CloseButton onClick={() => setShowContactInfo(false)}>
                  <MdClose />
                </CloseButton>
              </ModalHeader>

              <ContactInfo>
                {item.email && (
                  <Card $variant="owner">
                    <IconContainer $variant="owner">
                      <MdEmail />
                    </IconContainer>
                    <CardContent>
                      <CardLabel>Email</CardLabel>
                      <CardValue>{item.email}</CardValue>
                    </CardContent>
                  </Card>
                )}

                {item.phone && (
                  <Card $variant="owner">
                    <IconContainer $variant="owner">
                      <MdPhone />
                    </IconContainer>
                    <CardContent>
                      <CardLabel>Phone</CardLabel>
                      <CardValue>{item.phone}</CardValue>
                    </CardContent>
                  </Card>
                )}

                <Card $variant="owner">
                  <IconContainer $variant="owner">
                    <MdInfo />
                  </IconContainer>
                  <CardContent>
                    <CardLabel>Preferred Contact Method</CardLabel>
                    <CardValue>{item.contactPreference}</CardValue>
                  </CardContent>
                </Card>

                <ContactNote>
                  <p>Please respect the owner's preferred contact method and contact during reasonable hours.</p>
                </ContactNote>
              </ContactInfo>
            </ModalContent>
          </Modal>
        )}
        <Footer />
      </AnimatePresence>
    </Container>
  )
}

export default ItemDetail;