import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBackground from './AnimatedBackground';
import { format } from 'date-fns';
import { 
  MdCloudUpload, 
  MdDelete, 
  MdArrowBack,
  MdAccessTime,
  MdLocationOn,
  MdCategory,
  MdDescription,
  MdTitle,
  MdOutlineMessage,
  MdCalendarToday,
  MdAdd,
  MdCheck, 
} from 'react-icons/md';
import axios from 'axios';
import LocationInput from './LocationInput';
import DateRangeCalendar from './DateRangeCalendar';
import { showSimpleNotification } from './SimpleNotification';

const AddBorrowingItem = () => {
  const navigate = useNavigate();
  const [itemData, setItemData] = useState({
    name: '',
    description: '',
    category: '',
    location: 'Cebu City, Cebu, Philippines',
    coordinates: {
      lat: null,
      lng: null
    },
    availabilityPeriod: '',
    terms: '',
    availableFrom: '',
    availableUntil: '',
    contactPreference: '',
    email: '',
    phone: '',
    images: []
  });
  const [isOtherCategory, setIsOtherCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');


  const [loading, setLoading] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState([]);
  const totalSteps = 2;
  const maxImages = 4;

  // Handle image selection
  const handleImageChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (itemData.images.length + files.length > maxImages) {
        showSimpleNotification(
          `You can only upload up to ${maxImages} images. You currently have ${itemData.images.length}.`,
          'warning'
        );
      }
      handleFiles(files);
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    return format(today, 'yyyy-MM-dd');
  };

  const formatDateForInput = (date) => {
    return format(new Date(date), 'yyyy-MM-dd');
  };

  const handleDateRangeChange = ({ start, end }) => {
    setItemData(prev => ({
      ...prev,
      availableFrom: start,
      availableUntil: end || start // If end is not selected yet, use start date as end date temporarily
    }));
  };

  const handleFiles = (files) => {
    if (files && files.length > 0) {
      const remainingSlots = maxImages - itemData.images.length;
      if (remainingSlots <= 0) {
        return;
      }
  
      const filesToAdd = Array.from(files).slice(0, remainingSlots);
      
      filesToAdd.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setItemData(prev => ({
            ...prev,
            images: [...prev.images, {
              file,
              preview: reader.result
            }]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      if (itemData.images.length + droppedFiles.length > maxImages) {
        showSimpleNotification(`You can only upload up to ${maxImages} images. You currently have ${itemData.images.length}.`, 'warning');
      }
      handleFiles(droppedFiles);
    }
  };

  const removeImage = (index) => {
    setItemData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Adding this function that was missing in your original code
  const isValidPhone = (phone) => {
    // Simple validation for demonstration
    return /^[0-9+\s-]{7,15}$/.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const today = new Date(getCurrentDate());
    const startDate = new Date(itemData.availableFrom);
    const endDate = new Date(itemData.availableUntil);

    if (startDate < today) {
      showSimpleNotification('Start date cannot be before today', 'error');
      return;
    }
  
    if (endDate < startDate) {
      showSimpleNotification('End date cannot be before start date', 'error');
      return;
    }

    setLoading(true);
  
    try {
      const formData = new FormData();
      
      formData.append('name', itemData.name);
      formData.append('description', itemData.description);
      formData.append('category', itemData.category);
      formData.append('location', itemData.location);

      if (itemData.coordinates.lat && itemData.coordinates.lng) {
        formData.append('latitude', itemData.coordinates.lat);
        formData.append('longitude', itemData.coordinates.lng);
      } else {
        formData.append('latitude', 10.3157);
        formData.append('longitude', 123.8854);
      }
  
      formData.append('availabilityPeriod', itemData.availabilityPeriod);
      formData.append('terms', itemData.terms);
      formData.append('availableFrom', itemData.availableFrom);
      formData.append('availableUntil', itemData.availableUntil);
      formData.append('contactPreference', itemData.contactPreference);
      formData.append('email', itemData.email);
      formData.append('phone', itemData.phone);
  
      itemData.images.forEach((img, index) => {
        formData.append(`images`, img.file);
      });
  
      console.log('Submitting form data:', {
        location: itemData.location,
        latitude: formData.get('latitude'),
        longitude: formData.get('longitude')
      });
  
      const response = await axios.post('http://localhost:8080/api/borrowing/items', 
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      navigate('/borrowing');
    } catch (error) {
      console.error('Error adding item:', error);
      showSimpleNotification('Error adding item. Please ensure all fields are filled correctly.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'availableFrom') {
      setItemData(prev => ({
        ...prev,
        [name]: value,
        availableUntil: prev.availableUntil && prev.availableUntil < value ? value : prev.availableUntil
      }));
    } else if (name === 'availableUntil') {
      if (!itemData.availableFrom || value >= itemData.availableFrom) {
        setItemData(prev => ({
          ...prev,
          [name]: value
        }));
      } else {
        showSimpleNotification('End date cannot be before start date', 'error');
        return;
      }
    } else if (name === 'category') {
      if (value === 'other') {
        setIsOtherCategory(true);
        setItemData(prev => ({
          ...prev,
          category: 'other'
        }));
      } else {
        setIsOtherCategory(false);
        setCustomCategory('');
        setItemData(prev => ({
          ...prev,
          category: value
        }));
      }
    } else if (name === 'customCategory') {
      setCustomCategory(value);
      setItemData(prev => ({
        ...prev,
        category: value
      }));
    } else if (name === 'contactPreference') {
      setItemData(prev => ({
        ...prev,
        [name]: value,
        email: '',
        phone: ''
      }));
    } else {
      setItemData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  useEffect(() => {
    if (itemData.category === 'other' && customCategory) {
      setItemData(prev => ({
        ...prev,
        category: customCategory
      }));
    }
  }, [customCategory]);

  const memoizedBackground = useMemo(() => <AnimatedBackground />, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50/50 via-white/50 to-purple-50/50">
      {memoizedBackground}
      <div className="max-w-3xl mx-auto px-4">
          <div className="relative mb-16">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 
                            transform -skew-y-2 h-48 -z-10" />
            
            {/* Top Navigation Bar */}
            <div className="max-w-4xl mx-auto px-4">
              <nav className="flex items-center justify-between py-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/borrowing')}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 
                            bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm
                            transition-all duration-300 group"
                >
                  <MdArrowBack className="text-xl group-hover:-translate-x-1 transition-transform" />
                  <span className="font-medium">Back to Borrowing</span>
                </motion.button>    
              </nav>

              {/* Main Header Content */}
              <div className="text-center py-8">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h1 className="text-4xl md:text-5xl font-bold">
                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 
                                  bg-clip-text text-transparent">
                      List an Item for Borrowing
                    </span>
                  </h1>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Share your items with the community. Fill out the details below to create your listing.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex justify-center items-center space-x-4">
            {[...Array(totalSteps)].map((_, index) => (
              <div key={index} className="flex items-center">
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ 
                    scale: formStep >= index + 1 ? 1 : 0.8,
                    backgroundColor: formStep > index + 1 ? '#10B981' : formStep === index + 1 ? '#3B82F6' : '#E5E7EB'
                  }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold
                            shadow-lg transform transition-all duration-300`}
                >
                  {formStep > index + 1 ? <MdCheck className="text-2xl" /> : index + 1}
                </motion.div>
                {index < totalSteps - 1 && (
                  <div className="w-24 h-1 mx-4 bg-gray-200 rounded">
                    <motion.div 
                      initial={{ width: '0%' }}
                      animate={{ 
                        width: formStep > index + 1 ? '100%' : '0%'
                      }}
                      className="h-full bg-blue-500 rounded transition-all duration-500"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4 text-gray-600 font-medium">
            {formStep === 1 ? 'Item Details' : 'Availability & Terms'}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {formStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-8"
                >
                  {/* Image Upload Section */}
                  <div className="mb-8">
                    <label className="block text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <MdCloudUpload className="text-blue-500 text-2xl" />
                      Item Images (Up to 4)
                    </label>
                    <div 
                      className={`
                        border-3 border-dashed rounded-2xl p-8 transition-all duration-300
                        ${dragActive 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                        }
                      `}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {itemData.images.map((img, index) => (
                          <div key={index} className="relative aspect-square">
                            <img
                              src={img.preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full 
                                      hover:bg-red-600 transition-colors"
                            >
                              <MdDelete />
                            </button>
                          </div>
                        ))}

                        {itemData.images.length < maxImages && (
                          <label 
                            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg
                                    flex flex-col items-center justify-center cursor-pointer
                                    hover:border-blue-500 hover:bg-blue-50 transition-all"
                          >
                            <MdAdd className="text-4xl text-gray-400" />
                            <span className="text-sm text-gray-500 mt-2">Add Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                              multiple={itemData.images.length < maxImages}
                              disabled={itemData.images.length >= maxImages}
                            />
                          </label>
                        )}
                      </div>
                      <p className="text-center text-gray-500 text-sm mt-4">
                        Drag & drop images here or click to select
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <MdTitle className="text-blue-500" />
                        Item Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={itemData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                                focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="What are you offering to share?"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <MdDescription className="text-blue-500" />
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={itemData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                                focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        rows="4"
                        placeholder="Describe your item, its condition, and any specific details borrowers should know."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <MdCategory className="text-blue-500" />
                          Category
                        </label>
                        <select
                          name="category"
                          value={isOtherCategory ? 'other' : itemData.category}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                                  focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="tools">Tools</option>
                          <option value="electronics">Electronics</option>
                          <option value="sports">Sports Equipment</option>
                          <option value="books">Books</option>
                          <option value="kitchen">Kitchen Appliances</option>
                          <option value="garden">Garden Tools</option>
                          <option value="other">Other</option>
                        </select>

                        <AnimatePresence mode="wait">
                          {isOtherCategory && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="mt-4"
                            >
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Specify Category
                              </label>
                              <input
                                type="text"
                                name="customCategory"
                                value={customCategory}
                                onChange={handleChange}
                                placeholder="Enter custom category"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                                          focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                required={isOtherCategory}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>


                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <MdLocationOn className="text-blue-500" />
                          Location
                        </label>
                        <p className="text-sm text-gray-500 mb-2">
                          Please enter a specific location (e.g., "SM City Cebu, Cebu City" or "Basak Pardo, Cebu City") or maybe use your own location
                        </p>
                        <LocationInput
                            value={itemData.location} // Pass the current location value
                            onChange={(location) => {
                              console.log('Location selected:', location); // Debug log
                              setItemData(prev => ({
                                ...prev,
                                location: location.address,
                                coordinates: {
                                  lat: location.lat,
                                  lng: location.lng
                                }
                              }));
                            }}
                          />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {formStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-8"
                >
                  <div className="space-y-6">
                    {/* New Calendar Range Picker */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <MdCalendarToday className="text-blue-500" />
                        Available Dates
                      </label>
                      <DateRangeCalendar
                        startDate={itemData.availableFrom}
                        endDate={itemData.availableUntil}
                        onChange={handleDateRangeChange}
                        minDate={getCurrentDate()}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Select the date range when your item will be available for borrowing
                      </p>
                    </div>

                    {/* Original date inputs (hidden, but kept for form submission) */}
                    <input
                      type="hidden"
                      name="availableFrom"
                      value={itemData.availableFrom}
                    />
                    <input
                      type="hidden"
                      name="availableUntil"
                      value={itemData.availableUntil}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <MdAccessTime className="text-blue-500" />
                        Availability Period
                      </label>
                      <input
                        type="text"
                        name="availabilityPeriod"
                        value={itemData.availabilityPeriod}
                        onChange={handleChange}
                        placeholder="e.g., Weekends only, 1-2 weeks maximum"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                                focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <MdDescription className="text-blue-500" />
                        Borrowing Terms
                      </label>
                      <textarea
                        name="terms"
                        value={itemData.terms}
                        onChange={handleChange}
                        placeholder="Specify any conditions, deposit requirements, or special instructions"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                                focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        rows="4"
                        required
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <MdOutlineMessage className="text-blue-500" />
                          Contact Preferences
                        </label>
                        <select
                          name="contactPreference"
                          value={itemData.contactPreference}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                                  focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          required
                        >
                          <option value="">Select Contact Method</option>
                          <option value="app">In-App Messages</option>
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                        </select>
                      </div>

                      {/* Conditional Email Input */}
                      <AnimatePresence mode="wait">
                        {itemData.contactPreference === 'email' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <MdOutlineMessage className="text-blue-500" />
                              Your Email Address
                            </label>
                            <div className="relative">
                              <input
                                type="email"
                                name="email"
                                value={itemData.email}
                                onChange={handleChange}
                                placeholder="Enter your email address"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                                        focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                required={itemData.contactPreference === 'email'}
                              />
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                              >
                                {itemData.email && isValidEmail(itemData.email) && (
                                  <MdCheck className="text-green-500 text-xl" />
                                )}
                              </motion.div>
                            </div>
                          </motion.div>
                        )}

                        {/* Conditional Phone Input */}
                        {itemData.contactPreference === 'phone' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <MdOutlineMessage className="text-blue-500" />
                              Your Phone Number
                            </label>
                            <div className="relative">
                              <input
                                type="tel"
                                name="phone"
                                value={itemData.phone}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                                        focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                required={itemData.contactPreference === 'phone'}
                              />
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                              >
                                {itemData.phone && isValidPhone(itemData.phone) && (
                                  <MdCheck className="text-green-500 text-xl" />
                                )}
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {formStep > 1 && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormStep(formStep - 1)}
                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl 
                          hover:bg-gray-200 transition-colors font-medium"
              >
                Back
              </motion.button>
            )}
            
            <motion.button
              type={formStep === totalSteps ? 'submit' : 'button'}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => formStep < totalSteps && setFormStep(formStep + 1)}
              disabled={loading}
              className={`
                px-8 py-3 rounded-xl font-medium
                ${formStep === totalSteps
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-blue-500 text-white'
                }
                ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'}
                transition-all duration-300
              `}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                formStep === totalSteps ? 'List Item' : 'Next Step'
              )}
            </motion.button>
          </div>
          </form>
   
           {/* Preview Card */}
           {formStep === totalSteps && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-8 mt-20" // Added mt-16 for more top margin
            >
              <h2 className="text-2xl font-bold mb-6">Preview Your Listing</h2>
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Image Gallery */}
                <div className="bg-gray-100 p-4">
                  {itemData.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {itemData.images.map((img, index) => (
                        <div 
                          key={index} 
                          className="aspect-[4/3] relative overflow-hidden rounded-lg shadow-md bg-white"
                        >
                          <img
                            src={img.preview}
                            alt={`Item ${index + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 text-sm rounded">
                            Image {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48">
                      <p className="text-gray-400">No images provided</p>
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-4 py-1.5 bg-green-100 text-green-600 text-sm font-medium rounded-full">
                      {isOtherCategory ? customCategory || "Custom Category" : itemData.category || "Uncategorized"}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <MdLocationOn className="text-green-500" />
                      {itemData.location || "No location specified"}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {itemData.name}
                  </h3>

                  <p className="text-gray-600 mb-6">
                    {itemData.description || "No description provided"}
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MdCalendarToday className="text-green-500" />
                        <span>
                          {itemData.availableFrom && itemData.availableUntil 
                            ? `${new Date(itemData.availableFrom).toLocaleDateString()} - ${new Date(itemData.availableUntil).toLocaleDateString()}`
                            : "Dates not specified"}
                        </span>
                      </div>
                    </div>

                    {itemData.availabilityPeriod && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MdAccessTime className="text-green-500" />
                        <span>{itemData.availabilityPeriod}</span>
                      </div>
                    )}

                    {itemData.terms && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <h4 className="font-medium text-gray-700 mb-2">Borrowing Terms</h4>
                        <p className="text-sm text-gray-600">{itemData.terms}</p>
                      </div>
                    )}

                    {itemData.contactPreference && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MdOutlineMessage className="text-green-500" />
                        <span>Contact via: {itemData.contactPreference}</span>
                        {itemData.contactPreference === 'email' && itemData.email && (
                          <span className="text-green-500">{itemData.email}</span>
                        )}
                        {itemData.contactPreference === 'phone' && itemData.phone && (
                          <span className="text-green-500">{itemData.phone}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
         </div>
       </div>
     );
   };
   
   export default AddBorrowingItem;