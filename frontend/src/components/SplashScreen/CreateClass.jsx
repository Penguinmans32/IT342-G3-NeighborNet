import { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import InputField from './InputField';
import Footer from './Footer';
import axios from 'axios';
import { 
  MdArrowBack, 
  MdCloudUpload, 
  MdAdd, 
  MdDelete,
  MdArrowForward,
  MdCheck,
  MdTitle,
  MdDescription,
  MdAccessTime,
  MdSchool,
  MdLink,
  MdPeople,
  MdWorkOutline,
  MdPhone,
  MdEmail,
  MdEdit,
  MdPerson,
  MdImage,
  MdSort,
  MdError,
} from 'react-icons/md';
import { FaLinkedin } from 'react-icons/fa';

const validateBasicInfo = (formData) => {
    const requiredFields = {
      title: 'Class Title',
      description: 'Description',
      category: 'Category',
      difficulty: 'Difficulty Level',
      creatorName: 'Full Name',
      creatorEmail: 'Contact Email'
    };
  
    const missingFields = [];
    for (const [key, label] of Object.entries(requiredFields)) {
      if (!formData[key]?.trim()) {
        missingFields.push(label);
      }
    }
  
    if (formData.creatorEmail && !validateEmail(formData.creatorEmail)) {
        return { isValid: false, error: 'Please enter a valid email address' };
    }
  
    return {
      isValid: missingFields.length === 0,
      error: missingFields.length > 0 ? `Please fill in: ${missingFields.join(', ')}` : ''
    };
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateThumbnail = (formData) => {
    return {
      isValid: !!formData.thumbnail,
      error: !formData.thumbnail ? 'Please upload a thumbnail image' : ''
    };
  };

  const validateRequirements = (formData) => {
    const hasValidRequirements = formData.requirements.some(req => req.trim() !== '');
    return {
      isValid: hasValidRequirements,
      error: !hasValidRequirements ? 'Please add at least one requirement' : ''
    };
  };

  const validateSections = (formData) => {
    const hasValidSections = formData.sections.some(
      section => section.title.trim() && section.content.trim() && section.duration.trim()
    );
    return {
      isValid: hasValidSections,
      error: !hasValidSections ? 'Please complete at least one section with title, content, and duration' : ''
    };
  };

  

const CreateClass = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({
    basicInfo: false,
    thumbnail: false,
    requirements: false,
    sections: false
  });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: [''],
    thumbnail: null,
    thumbnailPreview: null,
    thumbnailDescription: '',
    duration: '',
    difficulty: 'BEGINNER',
    category: '',
    creatorName: '',
    creatorEmail: '',
    creatorPhone: '',
    creatorCredentials: '',
    linkedinUrl: '',
    portfolioUrl: '',
    sections: [{ title: '', content: '', duration: '' }]
  });

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Create FormData object
            const formDataToSend = new FormData();
            
            // Clean up the data first
            const classData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                thumbnailDescription: formData.thumbnailDescription?.trim() || '',
                duration: formData.duration?.trim() || '',
                difficulty: formData.difficulty,
                category: formData.category.trim(),
                creatorName: formData.creatorName.trim(),
                creatorEmail: formData.creatorEmail.trim(),
                creatorPhone: formData.creatorPhone?.trim() || '',
                creatorCredentials: formData.creatorCredentials?.trim() || '',
                linkedinUrl: formData.linkedinUrl?.trim() || '',
                portfolioUrl: formData.portfolioUrl?.trim() || '',
                requirements: formData.requirements.filter(req => req.trim() !== ''),
                sections: formData.sections.filter(section => 
                    section.title.trim() !== '' || 
                    section.content.trim() !== '' || 
                    section.duration.trim() !== ''
                )
            };

            // Log the data being sent
            console.log('ClassData to be sent:', JSON.stringify(classData, null, 2));

            // Append thumbnail file
            if (formData.thumbnail) {
                formDataToSend.append('thumbnail', formData.thumbnail);
            } else {
                // Append an empty file if no thumbnail is provided
                formDataToSend.append('thumbnail', 
                    new File([], 'empty.jpg', { type: 'image/jpeg' })
                );
            }
            
            // Append classData as a string with proper name
            formDataToSend.append('classData', new Blob([JSON.stringify(classData)], {
                type: 'application/json'
            }));
            
            const response = await axios.post(
                'https://it342-g3-neighbornet.onrender.com/api/classes',
                formDataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    }
                }
            );
            
            if (response.status === 200) {
                navigate('/your-classes');
            }
        } catch (error) {
            if (error.message === 'No authentication token found') {
                setError('Please log in to create a class');
            } else {
                setError('Failed to create class. Please try again.');
                console.error('Error response data:', error.response?.data);
                console.error('Error status:', error.response?.status);
                console.error('Full error:', error);
            }
        } finally {
            setLoading(false);
        }
    }
};



  useEffect(() => {
    let completed = 0;
    const total = 4;

    if (formData.title && formData.description) completed++;
    if (formData.thumbnail) completed++;
    if (formData.requirements.some(req => req.trim() !== '')) completed++;
    if (formData.sections.some(section => section.title && section.content)) completed++;

    setProgress((completed / total) * 100);
  }, [formData]);

  const steps = [
    {
      title: "Basic Information",
      icon: <MdTitle className="text-3xl" />,
      description: "Let's start with the fundamentals of your class"
    },
    {
      title: "Class Preview",
      icon: <MdCloudUpload className="text-3xl" />,
      description: "Add a compelling thumbnail and preview"
    },
    {
      title: "Requirements",
      icon: <MdSchool className="text-3xl" />,
      description: "What do students need to know?"
    },
    {
      title: "Class Content",
      icon: <MdDescription className="text-3xl" />,
      description: "Structure your class content"
    }
  ];

  const validateStep = (step) => {
    let validation;
    switch (step) {
      case 1:
        validation = validateBasicInfo(formData);
        break;
      case 2:
        validation = validateThumbnail(formData);
        break;
      case 3:
        validation = validateRequirements(formData);
        break;
      case 4:
        validation = validateSections(formData);
        break;
      default:
        validation = { isValid: true, error: '' };
    }
    setError(validation.error);
    return validation.isValid;
  };

  const handleNext = () => {
    const isValid = validateStep(currentStep);
    if (isValid) {
      setError('');
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
    setError('');
  };

  const getCurrentStepKey = () => {
    switch (currentStep) {
      case 1: return 'basicInfo';
      case 2: return 'thumbnail';
      case 3: return 'requirements';
      case 4: return 'sections';
      default: return '';
    }
  };


  const pageVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <motion.div
                className="absolute inset-0 opacity-10"
                initial={{ backgroundSize: "100% 100%" }}
                animate={{ 
                    backgroundSize: ["100% 100%", "120% 120%", "100% 100%"],
                    backgroundPosition: ["0% 0%", "50% 50%", "0% 0%"]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{
                    background: `radial-gradient(circle at 50% 50%, 
                        rgba(59, 130, 246, 0.3),
                        rgba(99, 102, 241, 0.3),
                        rgba(139, 92, 246, 0.3))`
                }}
            />
            {/* Floating shapes */}
            <motion.div
                className="absolute top-20 left-20 w-64 h-64 rounded-full bg-blue-200 blur-3xl"
                animate={{
                    y: [0, 50, 0],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-indigo-200 blur-3xl"
                animate={{
                    y: [0, -50, 0],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>

        {/* Progress Bar */}
        <div className="fixed top-0 left-0 right-0 z-50">
            <motion.div 
                className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
            />
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center space-x-6">
                    <motion.button
                        whileHover={{ scale: 1.05, rotate: -10 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(-1)}
                        className="p-3 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300
                                 border border-gray-100 backdrop-blur-sm bg-opacity-80"
                    >
                        <MdArrowBack className="text-2xl text-gray-600" />
                    </motion.button>
                    <div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 
                                     bg-clip-text text-transparent"
                        >
                            Create Your Class
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-500 mt-1"
                        >
                            Share your knowledge with the world
                        </motion.p>
                    </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                    <span className="text-sm font-medium text-gray-600">
                        Step {currentStep} of {steps.length}
                    </span>
                </div>
            </div>

            {/* Steps Indicators */}
            <div className="grid grid-cols-4 gap-4 mb-12">
                {steps.map((step, index) => (
                    <motion.div
                        key={index}
                        className={`
                            relative p-6 rounded-2xl backdrop-blur-sm transition-all duration-300
                            ${currentStep === index + 1
                                ? 'bg-white/90 shadow-lg scale-105 border border-blue-100'
                                : currentStep > index + 1
                                ? 'bg-blue-50/80 border border-blue-100'
                                : 'bg-white/50 border border-gray-100'
                            }
                        `}
                        onClick={() => setCurrentStep(index + 1)}
                        whileHover={{ scale: currentStep !== index + 1 ? 1.02 : 1 }}
                    >
                        <div className="flex items-center space-x-4">
                            <motion.div 
                                className={`p-3 rounded-xl ${
                                    currentStep > index + 1 
                                        ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-lg' 
                                        : currentStep === index + 1
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg'
                                        : 'bg-gray-100'
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {currentStep > index + 1 ? (
                                    <motion.div
                                        initial={{ rotate: -180, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                    >
                                        <MdCheck className="text-2xl text-white" />
                                    </motion.div>
                                ) : (
                                    <div className={currentStep === index + 1 ? 'text-white' : 'text-gray-400'}>
                                        {step.icon}
                                    </div>
                                )}
                            </motion.div>
                            <div>
                                <h3 className="font-semibold text-gray-800">{step.title}</h3>
                                <p className="text-sm text-gray-500">{step.description}</p>
                            </div>
                        </div>
                        
                        {index < steps.length - 1 && (
                            <motion.div
                                className="absolute top-1/2 -right-2 w-4 h-0.5 bg-gray-200"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 }}
                            />
                        )}
                    </motion.div>
                ))}
            </div>

              {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            {/* Step content components will go here */}
            {currentStep === 1 && (
              <BasicInformationStep 
              formData={formData} 
              setFormData={setFormData}
              touched={touched.basicInfo}
              error={error}
              setError={setError}
             />
            )}
            {currentStep === 2 && (
              <ThumbnailStep 
              formData={formData} 
              setFormData={setFormData}
              touched={touched.thumbnail}
              error={error}
               />
            )}
            {currentStep === 3 && (
              <RequirementsStep 
              formData={formData} 
              setFormData={setFormData}
              touched={touched.requirements}
              error={error}
               />
            )}
            {currentStep === 4 && (
              <SectionsStep 
              formData={formData} 
              setFormData={setFormData} 
              touched={touched.sections}
              error={error}
              />
            )}
          </motion.div>
        </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex flex-col space-y-4 mt-12 mb-8">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-600 
                                 p-4 rounded-lg text-sm flex items-center shadow-sm"
                    >
                        <MdError className="text-xl mr-2" />
                        {error}
                    </motion.div>
                )}
                <div className="flex items-center justify-between gap-4">
                    <motion.button
                        whileHover={{ scale: 1.02, x: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePrevious}
                        className={`
                            px-8 py-4 rounded-lg flex items-center gap-2 transition-all duration-300
                            backdrop-blur-sm
                            ${currentStep === 1 
                                ? 'bg-gray-100/80 text-gray-400 cursor-not-allowed' 
                                : 'bg-white/80 text-gray-700 hover:bg-gray-50 hover:shadow-lg border border-gray-200'
                            }
                        `}
                        disabled={currentStep === 1}
                    >
                        <MdArrowBack className={`text-xl ${currentStep === 1 ? 'opacity-50' : 'animate-pulse-horizontal'}`} />
                        Previous Step
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading || (touched[getCurrentStepKey()] && error)}
                        onClick={() => {
                            if (currentStep === steps.length) {
                                handleSubmit();
                            } else {
                                handleNext();
                            }
                        }}
                        className={`
                            px-8 py-4 rounded-lg flex items-center gap-2 transition-all duration-300
                            ${loading || (touched[getCurrentStepKey()] && error)
                                ? 'bg-blue-300/80 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:shadow-lg hover:shadow-blue-500/25'
                            }
                            text-white font-medium backdrop-blur-sm
                        `}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : currentStep === steps.length ? (
                            <>
                                Create Class
                                <MdCheck className="text-xl animate-bounce" />
                            </>
                        ) : (
                            <>
                                Next Step
                                <MdArrowForward className="text-xl animate-pulse-horizontal" />
                            </>
                        )}
                    </motion.button>
                </div>
            </div>
        </div>
    </div>
  );
};

export const BasicInformationStep = ({ formData, setFormData, touched, error, setError }) => {
    const [showCustomCategory, setShowCustomCategory] = useState(false);

    const validateForm = () => {
        if (!formData.creatorEmail || !validateEmail(formData.creatorEmail)) {
            setError('Please enter a valid email address');
            return false;
        }
        setError('');
        return true;
    };

    const categories = [
        { id: "programming", name: "Programming" },
        { id: "design", name: "Design" },
        { id: "business", name: "Business" },
        { id: "marketing", name: "Marketing" },
        { id: "photography", name: "Photography" },
        { id: "music", name: "Music" },
        { id: "writing", name: "Writing" },
        { id: "other", name: "Other" },
      ];

      const handleCategoryChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
          ...prev,
          category: value,
          customCategory: value === 'other' ? '' : undefined
        }));
        setShowCustomCategory(value === 'other');
      };

  return (
      <div className="space-y-6">
          <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Basic Information</h2>
              <p className="text-gray-600">Let's start with the essential details of your class.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Main Class Info */}
              <div className="space-y-6">
                  <InputField
                      label="Class Title"
                      fieldName="title"
                      placeholder="Enter an engaging title"
                      icon={MdTitle}
                      formData={formData}
                      setFormData={setFormData}
                      touched={touched}
                  />

                  <InputField
                      label="Description"
                      fieldName="description"
                      placeholder="Describe what students will learn..."
                      icon={MdDescription}
                      isTextArea
                      formData={formData}
                      setFormData={setFormData}
                      touched={touched}
                  />

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Category
                    </label>
                    <div className="relative">
                        <select
                        value={formData.category || ''}
                        onChange={handleCategoryChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                        >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                            {cat.name}
                            </option>
                        ))}
                        </select>
                        <MdSchool className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                    </div>
                    </div>

                    {showCustomCategory && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                        Specify Category
                        </label>
                        <div className="relative">
                        <input
                            type="text"
                            value={formData.customCategory || ''}
                            onChange={(e) => setFormData(prev => ({
                            ...prev,
                            customCategory: e.target.value,
                            category: e.target.value // Update the actual category with the custom value
                            }))}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                            placeholder="Enter category name"
                        />
                        <MdEdit className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                        </div>
                    </div>
                    )}

                    <InputField
                    label="Difficulty Level"
                    fieldName="difficulty"
                    type="select"
                    icon={MdPeople}
                    formData={formData}
                    setFormData={setFormData}
                    touched={touched}
                    />
                </div>
                </div>

              {/* Right Column - Creator Info */}
              <div className="space-y-6 bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-800">Creator Information</h3>

                  <InputField
                      label="Full Name"
                      fieldName="creatorName"
                      placeholder="Your full name"
                      icon={MdPerson}
                      formData={formData}
                      setFormData={setFormData}
                      touched={touched}
                  />

                  <InputField
                      label="Contact Email"
                      fieldName="creatorEmail"
                      type="email"
                      placeholder="your@email.com"
                      icon={MdEmail}
                      formData={formData}
                      setFormData={setFormData}
                      touched={touched}
                  />

                  <InputField
                      label="Contact Phone"
                      fieldName="creatorPhone"
                      type="tel"
                      placeholder="Your phone number"
                      icon={MdPhone}
                      isOptional
                      formData={formData}
                      setFormData={setFormData}
                      touched={touched}
                  />

                  <InputField
                      label="Credentials/Expertise"
                      fieldName="creatorCredentials"
                      placeholder="Describe your expertise and qualifications..."
                      icon={MdWorkOutline}
                      isTextArea
                      formData={formData}
                      setFormData={setFormData}
                      touched={touched}
                  />

                  {/* Social Media Links */}
                  <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-700">
                          Social Media <span className="text-gray-500">(Optional)</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="relative">
                              <input
                                  type="url"
                                  value={formData.linkedinUrl || ''}
                                  onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                                  placeholder="LinkedIn URL"
                              />
                              <FaLinkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                          </div>
                          <div className="relative">
                              <input
                                  type="url"
                                  value={formData.portfolioUrl || ''}
                                  onChange={(e) => setFormData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                                  placeholder="Portfolio URL"
                              />
                              <MdLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );
};


export const ThumbnailStep = ({ formData, setFormData, touched, error }) => {
  const MAX_CHARS = 50;
  const currentChars = formData.thumbnailDescription?.length || 0;

  const getInputClassName = () => `
  w-full px-4 py-3 rounded-lg transition-all duration-200
  ${touched && !formData.thumbnailDescription?.trim() 
      ? 'border-2 border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
      : 'border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  }
  pl-10
`;

  const handleDescriptionChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      setFormData({ ...formData, thumbnailDescription: text });
    }
  };

  const getCharCountColor = () => {
    if (currentChars === 0) return 'text-gray-400';
    if (currentChars > MAX_CHARS * 0.8) return 'text-orange-500';
    if (currentChars === MAX_CHARS) return 'text-red-500';
    return 'text-green-500';
  };

  const ErrorMessage = ({ message }) => (
    <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1.5 mt-2"
    >
        <MdError className="text-lg text-red-500" />
        <span className="text-sm font-medium text-red-500">{message}</span>
    </motion.div>
);

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
      >
          <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Class Preview</h2>
              <p className="text-gray-600">Create a compelling visual presence for your class.</p>
          </div>

          {/* Thumbnail Upload Section */}
          <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                  <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                      <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                          1
                      </div>
                      <h3 className="text-lg font-semibold mb-4">
                          Upload Thumbnail
                          <span className="text-red-500 ml-1">*</span>
                      </h3>
                      <div className={`
                          border-2 border-dashed rounded-lg p-6 text-center bg-white transition-all duration-200
                          ${touched && !formData.thumbnail 
                              ? 'border-red-300 bg-red-50' 
                              : 'border-gray-300 hover:border-blue-500'
                          }
                      `}>
                          {formData.thumbnailPreview ? (
                              <div className="relative group">
                                  <img
                                      src={formData.thumbnailPreview}
                                      alt="Preview"
                                      className="max-h-48 mx-auto rounded-lg"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                      <button
                                          type="button"
                                          onClick={() => setFormData({ ...formData, thumbnail: null, thumbnailPreview: null })}
                                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transform transition-transform hover:scale-110"
                                      >
                                          <MdDelete className="text-xl" />
                                      </button>
                                  </div>
                              </div>
                          ) : (
                              <div className="py-8">
                                  <MdCloudUpload className="text-5xl text-blue-500 mx-auto mb-4" />
                                  <label className="cursor-pointer">
                                      <span className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all hover:shadow-lg inline-block">
                                          Choose Image
                                      </span>
                                      <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => {
                                              const file = e.target.files[0];
                                              if (file) {
                                                  setFormData({
                                                      ...formData,
                                                      thumbnail: file,
                                                      thumbnailPreview: URL.createObjectURL(file)
                                                  });
                                              }
                                          }}
                                          className="hidden"
                                      />
                                  </label>
                                  {touched && !formData.thumbnail && (
                                      <ErrorMessage message="Please upload a thumbnail image" />
                                  )}
                              </div>
                          )}
                      </div>
                  </div>

                  <div className="relative bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
                      <div className="absolute -top-4 -left-4 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center">
                          2
                      </div>
                      <h3 className="text-lg font-semibold mb-4">
                          Thumbnail Description
                          <span className="text-red-500 ml-1">*</span>
                      </h3>
                      <div className="relative space-y-2">
                          <textarea
                              value={formData.thumbnailDescription || ''}
                              onChange={handleDescriptionChange}
                              placeholder="Add a description for your thumbnail..."
                              className={getInputClassName()}
                              rows="4"
                              maxLength={MAX_CHARS}
                          />
                          <MdDescription className="absolute left-3 top-3 text-gray-400 text-xl" />
                          <div className={`absolute bottom-2 right-2 text-xs font-medium ${getCharCountColor()}`}>
                            {currentChars}/{MAX_CHARS}
                          </div>
                          {touched && !formData.thumbnailDescription?.trim() && (
                              <ErrorMessage message="Please add a description for your thumbnail" />
                          )}
                      </div>
                  </div>
              </div>

              {/* Preview Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Preview</h3>
                  <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                      {formData.thumbnailPreview ? (
                          <img
                              src={formData.thumbnailPreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                          />
                      ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                              <MdImage className="text-4xl" />
                              <span>No preview available</span>
                          </div>
                      )}
                  </div>
                  <div className="space-y-2">
                      <p className="text-sm text-gray-500 font-medium">Recommended:</p>
                      <ul className="list-none space-y-2">
                          {[
                              '16:9 aspect ratio',
                              'High resolution (1280x720 or better)',
                              'Clear and relevant to your class',
                              'No text overlay recommended'
                          ].map((item, index) => (
                              <li key={index} className="flex items-center text-sm text-gray-600">
                                  <MdCheck className="text-green-500 mr-2" />
                                  {item}
                              </li>
                          ))}
                      </ul>
                  </div>
              </div>
          </div>
      </motion.div>
  );
};

const ErrorMessage = memo(({ message }) => (
  <div className="flex items-center gap-1.5 mt-2">
      <MdError className="text-lg text-red-500" />
      <span className="text-sm font-medium text-red-500">{message}</span>
  </div>
));

ErrorMessage.displayName = 'ErrorMessage';

const TipItem = memo(({ title, description }) => (
  <li className="flex items-start space-x-3">
      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex-shrink-0 flex items-center justify-center">
          <MdCheck className="text-lg" />
      </div>
      <div>
          <p className="font-medium text-gray-800">{title}</p>
          <p className="text-sm text-gray-600">{description}</p>
      </div>
  </li>
));

TipItem.displayName = 'TipItem';

const RequirementInput = memo(({ requirement, index, onDelete, onChange, touched }) => {
  const inputClassName = `
      w-full px-4 py-3 rounded-lg transition-all duration-200
      ${touched && !requirement.trim() 
          ? 'border-2 border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
          : 'border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
      }
      pl-10
  `.trim();

  // Memoize the change handler to prevent recreation on every render
  const handleChange = useCallback((e) => {
      onChange(e.target.value);
  }, [onChange]);

  return (
      <div className="group relative flex items-start space-x-4">
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex-shrink-0 flex items-center justify-center font-medium">
              {index + 1}
          </div>
          <div className="flex-grow space-y-2">
              <div className="relative">
                  <input
                      type="text"
                      value={requirement}
                      onChange={handleChange}
                      className={inputClassName}
                      placeholder={`Requirement #${index + 1}`}
                  />
                  <MdEdit className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              </div>
              {touched && !requirement.trim() && (
                  <ErrorMessage message="Please specify a requirement" />
              )}
          </div>
          {index > 0 && (
              <button
                  type="button"
                  onClick={onDelete}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
              >
                  <MdDelete className="text-xl" />
              </button>
          )}
      </div>
  );
});

RequirementInput.displayName = 'RequirementInput';


export const RequirementsStep = ({ formData, setFormData, touched, error }) => {
  // Memoized handlers to prevent unnecessary recreations
  const handleRequirementChange = useCallback((index, value) => {
      setFormData(prev => ({
          ...prev,
          requirements: prev.requirements.map((req, i) => 
              i === index ? value : req
          )
      }));
  }, [setFormData]);

  const handleDeleteRequirement = useCallback((index) => {
      setFormData(prev => ({
          ...prev,
          requirements: prev.requirements.filter((_, i) => i !== index)
      }));
  }, [setFormData]);

  const addRequirement = useCallback((template = '') => {
      setFormData(prev => ({
          ...prev,
          requirements: [...prev.requirements, template]
      }));
  }, [setFormData]);

  // Template options
  const templates = [
      "Basic understanding of...",
      "Access to...",
      "Familiarity with...",
      "Prior experience in..."
  ];

  return (
      <div className="space-y-8">
          <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Class Requirements</h2>
              <p className="text-gray-600">List what students need to know before taking your class.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
              {/* Requirements List */}
              <div className="space-y-6">
                  {formData.requirements.map((req, index) => (
                      <RequirementInput
                          key={`requirement-${index}`}
                          requirement={req}
                          index={index}
                          onDelete={() => handleDeleteRequirement(index)}
                          onChange={(value) => handleRequirementChange(index, value)}
                          touched={touched}
                      />
                  ))}

                  <button
                      type="button"
                      onClick={() => addRequirement()}
                      className="w-full py-4 border-2 border-dashed border-blue-500 text-blue-500 rounded-xl 
                               hover:bg-blue-50 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                  >
                      <MdAdd className="text-xl" />
                      Add New Requirement
                  </button>
              </div>

              {/* Tips and Examples */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-sm">
                  <h3 className="text-lg font-semibold mb-6">Tips for Good Requirements</h3>
                  <ul className="space-y-6">
                      <TipItem
                          title="Be Specific"
                          description='"Basic knowledge of JavaScript" instead of "Programming experience"'
                      />
                      <TipItem
                          title="List Tools Needed"
                          description='"A computer with Photoshop installed" or "A DSLR camera"'
                      />
                      <TipItem
                          title="Mention Prerequisites"
                          description='"Completion of Beginners Course" or "Understanding of basic math"'
                      />
                  </ul>

                  {/* Quick Templates */}
                  <div className="mt-8 pt-6 border-t border-blue-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-4">Quick Templates</h4>
                      <div className="space-y-2">
                          {templates.map((template, index) => (
                              <button
                                  key={`template-${index}`}
                                  type="button"
                                  onClick={() => addRequirement(template)}
                                  className="w-full p-2 text-left text-sm text-gray-600 hover:bg-blue-100/50 rounded-lg transition-all"
                              >
                                  {template}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );
};

export const SectionField = memo(({ label, value, onChange, placeholder, icon: Icon, type = "text", rows, touched }) => (
  <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
          {label}
          <span className="text-red-500 ml-1">*</span>
      </label>
      <div className="relative">
          {type === "textarea" ? (
              <textarea
                  value={value}
                  onChange={onChange}
                  className={getInputClassName(!value?.trim() && touched)}
                  placeholder={placeholder}
                  rows={rows}
              />
          ) : (
              <input
                  type={type}
                  value={value}
                  onChange={onChange}
                  className={getInputClassName(!value?.trim() && touched)}
                  placeholder={placeholder}
              />
          )}
          <Icon className="absolute left-3 top-3 text-gray-400 text-xl" />
      </div>
      {touched && !value?.trim() && (
          <ErrorMessage message={`${label} is required`} />
      )}
  </div>
));

const SectionCard = memo(({ section, index, onDelete, onChange, formData, touched }) => {
  const handleTitleChange = useCallback((e) => {
      onChange({ ...section, title: e.target.value });
  }, [onChange, section]);

  const handleContentChange = useCallback((e) => {
      onChange({ ...section, content: e.target.value });
  }, [onChange, section]);

  const handleDurationChange = useCallback((e) => {
    let value = e.target.value;
    if (/^\d+$/.test(value)) {
      value = `${value} Minutes`;
    }
    onChange({ ...section, duration: value });
  }, [onChange, section]);

  

  return (
      <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      >
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white flex justify-between items-center">
              <h3 className="font-medium flex items-center gap-2">
                  <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm">
                      {index + 1}
                  </span>
                  Section {index + 1}
              </h3>
              {formData.sections.length > 1 && (
                  <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={onDelete}
                      className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                  >
                      <MdDelete className="text-xl" />
                  </motion.button>
              )}
          </div>
          
          <div className="p-6 space-y-6">
              <SectionField
                  label="Title"
                  value={section.title}
                  onChange={handleTitleChange}
                  placeholder="e.g., Introduction to React Basics"
                  icon={MdTitle}
                  touched={touched}
              />

              <SectionField
                  label="Content"
                  value={section.content}
                  onChange={handleContentChange}
                  placeholder="Describe what will be covered in this section..."
                  icon={MdDescription}
                  type="textarea"
                  rows={4}
                  touched={touched}
              />

            <SectionField
                label="Duration"
                value={section.duration}
                onChange={handleDurationChange}
                placeholder="e.g., 30 Minutes"
                icon={MdAccessTime}
                touched={touched}
                helperText="Enter duration in minutes (e.g., 30 Minutes) or hours (e.g., 1.5 Hours)"
                />
          </div>
      </motion.div>
  );
});

const getInputClassName = (isError) => `
    w-full px-4 py-3 rounded-lg transition-all duration-200
    ${isError 
        ? 'border-2 border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
        : 'border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
    }
    pl-10
`;


const RequirementTip = memo(({ number, title, description }) => (
  <motion.li 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: number * 0.1 }}
      className="flex items-start space-x-3"
  >
      <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex-shrink-0 flex items-center justify-center text-sm">
          {number}
      </div>
      <div>
          <p className="font-medium text-gray-800">{title}</p>
          <p className="text-sm text-gray-600">{description}</p>
      </div>
  </motion.li>
));

RequirementTip.displayName = 'RequirementTip';


const QuickActionButton = memo(({ onClick, label, danger = false }) => (
  <motion.button
      whileHover={{ x: 5 }}
      onClick={onClick}
      type="button"
      className={`w-full p-2 text-left text-sm ${
          danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-600 hover:bg-gray-50'
      } rounded-lg transition-colors flex items-center gap-2`}
  >
      {danger ? <MdDelete className="text-lg" /> : <MdSort className="text-lg" />}
      {label}
  </motion.button>
));

const SectionsStep = memo(({ formData, setFormData, touched, error }) => {
  const handleAddSection = useCallback(() => {
      setFormData(prev => ({
          ...prev,
          sections: [...prev.sections, { title: '', content: '', duration: '' }]
      }));
  }, [setFormData]);

  const handleSectionChange = useCallback((index, updatedSection) => {
      setFormData(prev => ({
          ...prev,
          sections: prev.sections.map((s, i) => i === index ? updatedSection : s)
      }));
  }, [setFormData]);

  const handleSectionDelete = useCallback((index) => {
      setFormData(prev => ({
          ...prev,
          sections: prev.sections.filter((_, i) => i !== index)
      }));
  }, [setFormData]);

  const handleSortAlphabetically = useCallback(() => {
      setFormData(prev => ({
          ...prev,
          sections: [...prev.sections].sort((a, b) => a.title.localeCompare(b.title))
      }));
  }, [setFormData]);

  const handleSortByDuration = useCallback(() => {
      setFormData(prev => ({
          ...prev,
          sections: [...prev.sections].sort((a, b) => {
              const durationA = parseInt(a.duration) || 0;
              const durationB = parseInt(b.duration) || 0;
              return durationA - durationB;
          })
      }));
  }, [setFormData]);

  const handleClearSections = useCallback(() => {
      if (window.confirm('Are you sure you want to clear all sections?')) {
          setFormData(prev => ({ 
              ...prev, 
              sections: [{ title: '', content: '', duration: '' }] 
          }));
      }
  }, [setFormData]);

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
      >
          {/* Header */}
          <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Class Content</h2>
              <p className="text-gray-600">Organize your class into clear, structured sections.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
              {/* Sections List */}
              <div className="md:col-span-2 space-y-6">
                  {formData.sections.map((section, index) => (
                      <SectionCard
                          key={`section-${index}`}
                          section={section}
                          index={index}
                          formData={formData}
                          touched={touched}
                          onDelete={() => handleSectionDelete(index)}
                          onChange={(updatedSection) => handleSectionChange(index, updatedSection)}
                      />
                  ))}

                  <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddSection}
                      type="button"
                      className="w-full py-4 border-2 border-dashed border-blue-500 text-blue-500 rounded-xl
                               hover:bg-blue-50 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                  >
                      <MdAdd className="text-xl" />
                      Add New Section
                  </motion.button>
              </div>

              <div className="space-y-6">
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold mb-6">Section Structure Tips</h3>
                      <ul className="space-y-6">
                          <RequirementTip
                              number={1}
                              title="Start with Basics"
                              description="Begin with foundational concepts before advanced topics"
                          />
                          <RequirementTip
                              number={2}
                              title="Keep it Concise"
                              description="Aim for 5-10 minute sections to maintain engagement"
                          />
                          <RequirementTip
                              number={3}
                              title="Clear Objectives"
                              description="Each section should have a specific learning outcome"
                          />
                          <RequirementTip
                              number={4}
                              title="Include Practice"
                              description="Add exercises or assignments when appropriate"
                          />
                      </ul>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
                      <div className="space-y-4">
                          <div>
                              <div className="flex justify-between text-sm text-gray-600 mb-2">
                                  <span>Sections Created</span>
                                  <span className="font-medium">{formData.sections.length}</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${Math.min((formData.sections.length / 5) * 100, 100)}%` }}
                                      className="h-full bg-blue-500"
                                  />
                              </div>
                          </div>

                          <div>
                              <div className="flex justify-between text-sm text-gray-600 mb-2">
                                  <span>Sections Completed</span>
                                  <span className="font-medium">
                                      {formData.sections.filter(s => s.title && s.content && s.duration).length}
                                      /{formData.sections.length}
                                  </span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ 
                                          width: `${(formData.sections.filter(s => s.title && s.content && s.duration).length / formData.sections.length) * 100}%` 
                                      }}
                                      className="h-full bg-green-500"
                                  />
                              </div>
                          </div>
                      </div>
                  </div>


                  <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                      <div className="space-y-2">
                          <QuickActionButton
                              onClick={handleSortAlphabetically}
                              label="Sort Sections Alphabetically"
                          />
                          <QuickActionButton
                              onClick={handleSortByDuration}
                              label="Sort by Duration"
                          />
                          <QuickActionButton
                              onClick={handleClearSections}
                              label="Clear All Sections"
                              danger
                          />
                      </div>
                  </div>
              </div>
          </div>
      </motion.div>
  );
});

CreateClass.BasicInformationStep = BasicInformationStep;
CreateClass.ThumbnailStep = ThumbnailStep;
CreateClass.RequirementsStep = RequirementsStep;
CreateClass.SectionsStep = SectionsStep;
  
export default CreateClass;