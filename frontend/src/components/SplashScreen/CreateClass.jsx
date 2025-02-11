import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  MdPerson,
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
  
    if (formData.creatorEmail && !/^\S+@\S+\.\S+$/.test(formData.creatorEmail)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
  
    return {
      isValid: missingFields.length === 0,
      error: missingFields.length > 0 ? `Please fill in: ${missingFields.join(', ')}` : ''
    };
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
    difficulty: 'beginner',
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
        const formDataToSend = new FormData();
        Object.keys(formData).forEach(key => {
          if (key === 'requirements' || key === 'sections') {
            formDataToSend.append(key, JSON.stringify(formData[key]));
          } else if (key === 'thumbnail') {
            if (formData.thumbnail) {
              formDataToSend.append('thumbnail', formData.thumbnail);
            }
          } else if (key !== 'thumbnailPreview') {
            formDataToSend.append(key, formData[key]);
          }
        });
  
        // Your API call here
        // const response = await axios.post('your-api-endpoint', formDataToSend);
        
        // Navigate to success page or show success message
        navigate('/success'); // Or wherever you want to redirect
      } catch (error) {
        setError('Failed to create class. Please try again.');
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
    setTouched(prev => ({ ...prev, [getCurrentStepKey()]: true }));
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(steps.length, currentStep + 1));
      setError('');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200">
        <motion.div 
          className="h-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
            >
              <MdArrowBack className="text-2xl text-gray-600" />
            </motion.button>
            <h1 className="text-4xl font-bold text-gray-800">Create Your Class</h1>
          </div>
          <div className="text-sm text-gray-500">
            Step {currentStep} of {steps.length}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={`relative p-6 rounded-2xl ${
                currentStep === index + 1
                  ? 'bg-white shadow-lg scale-105'
                  : currentStep > index + 1
                  ? 'bg-blue-50'
                  : 'bg-gray-50'
              } cursor-pointer transition-all`}
              onClick={() => setCurrentStep(index + 1)}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${
                  currentStep > index + 1 
                    ? 'bg-green-500 text-white' 
                    : currentStep === index + 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > index + 1 ? <MdCheck className="text-2xl" /> : step.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="absolute top-1/2 -right-2 w-4 h-0.5 bg-gray-200 transform -translate-y-1/2" />
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
                className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm flex items-center"
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
                    px-8 py-4 rounded-lg flex items-center gap-2 transition-all duration-200
                    ${currentStep === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-200'
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
                    px-8 py-4 rounded-lg flex items-center gap-2 transition-all duration-200
                    ${loading || (touched[getCurrentStepKey()] && error)
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 hover:shadow-lg'
                    }
                    text-white font-medium
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

const BasicInformationStep = ({ formData, setFormData, touched, error }) => {

    const getInputClassName = (fieldName) => 
        "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10";

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Basic Information</h2>
          <p className="text-gray-600">Let's start with the essential details of your class.</p>
        </div>
  
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Main Class Info */}
          <div className="space-y-6">
            {/* Class Title */}
            <div className="relative space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Class Title
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={getInputClassName('title')}
                  placeholder="Enter an engaging title"
                />
                <MdTitle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />

                {touched && !formData.title?.trim() && (
                    <span className="text-xs text-red-500">This field is required</span>
                )}
              </div>
            </div>
  
            {/* Class Description */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <div className="relative">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={getInputClassName('description')}
                  placeholder="Describe what students will learn..."
                  rows={4}
                />
                {touched && !formData.description?.trim() && (
                <p className="mt-1 text-sm text-red-500">Description is required</p>
                )}
                <MdDescription className="absolute left-3 top-4 text-gray-400 text-xl" />
              </div>
            </div>
  
            {/* Class Category & Level */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={getInputClassName('category')}
                  >
                    <option value="">Select Category</option>
                    <option value="technology">Technology</option>
                    <option value="art">Art & Design</option>
                    <option value="business">Business</option>
                    <option value="music">Music</option>
                    <option value="cooking">Cooking</option>
                    <option value="language">Language</option>
                    <option value="other">Other</option>
                  </select>

                    {touched && !formData.category && (
                    <p className="mt-1 text-sm text-red-500">Category is required</p>
                    )}
                  <MdSchool className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                </div>
              </div>
  
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level
                </label>
                <div className="relative">
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className={getInputClassName('difficulty')}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                  <MdPeople className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />

                  {touched && !formData.difficulty && (
                    <p className="mt-1 text-sm text-red-500">Difficulty level is required</p>
                    )}
                </div>
              </div>
            </div>
          </div>
  
          {/* Right Column - Creator Info */}
          <div className="space-y-6 bg-gray-50 p-6 rounded-xl">
            <h3 className="font-semibold text-gray-800">Creator Information</h3>
            
            {/* Creator Name */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.creatorName}
                  onChange={(e) => setFormData({ ...formData, creatorName: e.target.value })}
                  className={getInputClassName('creatorName')}
                  placeholder="Your full name"
                />

                {touched && !formData.creatorName?.trim() && (
                <p className="mt-1 text-sm text-red-500">Name is required</p>
                )}
                <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              </div>
            </div>
  
            {/* Creator Email */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.creatorEmail}
                  onChange={(e) => setFormData({ ...formData, creatorEmail: e.target.value })}
                  className={getInputClassName('creatorEmail')}
                  placeholder="your@email.com"
                />

                {touched && !formData.creatorEmail?.trim() && (
                <p className="mt-1 text-sm text-red-500">Email is required</p>
                )}
                <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              </div>
            </div>
  
            {/* Creator Phone */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone (Optional)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.creatorPhone}
                  onChange={(e) => setFormData({ ...formData, creatorPhone: e.target.value })}
                  className={getInputClassName('creatorPhone')}
                  placeholder="Your phone number"
                />

                {touched && !formData.creatorPhone?.trim() && (
                <p className="mt-1 text-sm text-red-500">Phone number is required</p>
                )}
                <MdPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              </div>
            </div>
  
            {/* Creator Credentials */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credentials/Expertise
              </label>
              <div className="relative">
                <textarea
                  value={formData.creatorCredentials}
                  onChange={(e) => setFormData({ ...formData, creatorCredentials: e.target.value })}
                  className={getInputClassName('creatorCredentials')}
                  placeholder="Describe your expertise and qualifications..."
                  rows={3}
                />

                {touched && !formData.creatorCredentials?.trim() && (
                <p className="mt-1 text-sm text-red-500">Credentials are required</p>
                )}
                <MdWorkOutline className="absolute left-3 top-4 text-gray-400 text-xl" />
              </div>
            </div>
  
            {/* Social Media Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Social Media (Optional)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                    placeholder="LinkedIn URL"
                  />
                  <FaLinkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                </div>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                    placeholder="Portfolio URL"
                  />
                  <MdLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };


const ThumbnailStep = ({ formData, setFormData,touched, error }) => {
    const getInputClassName = () => 
        "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10";

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
              <h3 className="text-lg font-semibold mb-4">Upload Thumbnail</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white">
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
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <MdDelete className="text-xl" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-8">
                    <MdCloudUpload className="text-5xl text-blue-500 mx-auto mb-4" />
                    <label className="cursor-pointer">
                      <span className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
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
                      <p className="mt-4 text-xs text-red-500">Please upload a thumbnail image</p>
                    )}
                  </div>
                )}
              </div>
            </div>
  
            <div className="relative bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center">
                2
              </div>
              <h3 className="text-lg font-semibold mb-4">Thumbnail Description</h3>
              <textarea
                placeholder="Add a description for your thumbnail..."
                className={getInputClassName('thumbnail')}
                rows="4"
              />

                {touched && !formData.thumbnail?.trim() && (
                <p className="mt-1 text-sm text-red-500">Thumbnail description is required</p>
                )}
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
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No preview available
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Recommended:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>16:9 aspect ratio</li>
                <li>High resolution (1280x720 or better)</li>
                <li>Clear and relevant to your class</li>
                <li>No text overlay recommended</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const RequirementsStep = ({ formData, setFormData, touched, error }) => {

    const getInputClassName = (fieldName) => `
    w-full px-4 py-3 rounded-lg border 
    ${touched && !formData[fieldName]?.trim() 
      ? 'border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:ring-blue-500'} 
    focus:border-transparent pl-10
  `;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Class Requirements</h2>
          <p className="text-gray-600">List what students need to know before taking your class.</p>
        </div>
  
        <div className="grid md:grid-cols-2 gap-8">
          {/* Requirements List */}
          <div className="space-y-4">
            {formData.requirements.map((req, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-4"
              >
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex-shrink-0 flex items-center justify-center">
                  {index + 1}
                </div>
                <div className="flex-grow">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => {
                      const newRequirements = [...formData.requirements];
                      newRequirements[index] = e.target.value;
                      setFormData({ ...formData, requirements: newRequirements });
                    }}
                    className={getInputClassName('requirements')}
                    placeholder={`Requirement #${index + 1}`}
                  />

                    {touched && !req?.trim() && (
                    <p className="mt-1 text-sm text-red-500">Requirement is required</p>
                    )}
                </div>
                {formData.requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newRequirements = formData.requirements.filter((_, i) => i !== index);
                      setFormData({ ...formData, requirements: newRequirements });
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <MdDelete className="text-xl" />
                  </button>
                )}
              </motion.div>
            ))}
  
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFormData({
                ...formData,
                requirements: [...formData.requirements, '']
              })}
              className="w-full py-3 border-2 border-dashed border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <MdAdd className="inline-block mr-2" />
              Add Requirement
            </motion.button>
          </div>
  
          {/* Tips and Examples */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
            <h3 className="text-lg font-semibold mb-4">Tips for Good Requirements</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex-shrink-0 flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <p className="font-medium">Be Specific</p>
                  <p className="text-sm text-gray-600">
                    "Basic knowledge of JavaScript" instead of "Programming experience"
                  </p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex-shrink-0 flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <p className="font-medium">List Tools Needed</p>
                  <p className="text-sm text-gray-600">
                    "A computer with Photoshop installed" or "A DSLR camera"
                  </p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex-shrink-0 flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <p className="font-medium">Mention Prerequisites</p>
                  <p className="text-sm text-gray-600">
                    "Completion of Beginner's Course" or "Understanding of basic math"
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    );
  };


  const SectionsStep = ({ formData, setFormData, touched, error }) => {

    const getInputClassName = (fieldName) => `
    w-full px-4 py-3 rounded-lg border 
    ${touched && !formData[fieldName]?.trim() 
      ? 'border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:ring-blue-500'} 
    focus:border-transparent pl-10
  `;


    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Class Content</h2>
          <p className="text-gray-600">Organize your class into clear, structured sections.</p>
        </div>
  
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sections List - Takes up 2 columns */}
          <div className="md:col-span-2 space-y-6">
            {formData.sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white flex justify-between items-center">
                  <h3 className="font-medium">Section {index + 1}</h3>
                  {formData.sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newSections = formData.sections.filter((_, i) => i !== index);
                        setFormData({ ...formData, sections: newSections });
                      }}
                      className="p-1 hover:bg-white/20 rounded"
                    >
                      <MdDelete className="text-xl" />
                    </button>
                  )}
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => {
                        const newSections = [...formData.sections];
                        newSections[index] = { ...section, title: e.target.value };
                        setFormData({ ...formData, sections: newSections });
                      }}
                      className={getInputClassName('title')}
                      placeholder="Section title"
                    />

                    {touched && !section.title?.trim() && (
                    <p className="mt-1 text-sm text-red-500">Title is required</p>
                    )}
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      value={section.content}
                      onChange={(e) => {
                        const newSections = [...formData.sections];
                        newSections[index] = { ...section, content: e.target.value };
                        setFormData({ ...formData, sections: newSections });
                      }}
                      className={getInputClassName('content')}
                      rows="4"
                      placeholder="Section content"
                    />

                    {touched && !section.content?.trim() && (
                    <p className="mt-1 text-sm text-red-500">Content is required</p>
                    )}
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={section.duration}
                      onChange={(e) => {
                        const newSections = [...formData.sections];
                        newSections[index] = { ...section, duration: e.target.value };
                        setFormData({ ...formData, sections: newSections });
                      }}
                      className={getInputClassName('duration')}
                      placeholder="e.g., 30 minutes"
                    />

                    {touched && !section.duration?.trim() && (
                    <p className="mt-1 text-sm text-red-500">Duration is required</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
  
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormData({
                ...formData,
                sections: [...formData.sections, { title: '', content: '', duration: '' }]
              })}
              className="w-full py-4 border-2 border-dashed border-blue-500 text-blue-500 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <MdAdd className="inline-block mr-2" />
              Add New Section
            </motion.button>
          </div>
  
          {/* Section Tips - Takes up 1 column */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Section Structure Tips</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex-shrink-0 flex items-center justify-center text-sm">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Start with Basics</p>
                    <p className="text-sm text-gray-600">
                      Begin with foundational concepts before advanced topics
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex-shrink-0 flex items-center justify-center text-sm">
                  2
                </div>
                <div>
                  <p className="font-medium">Keep it Concise</p>
                  <p className="text-sm text-gray-600">
                    Aim for 5-10 minute sections to maintain engagement
                  </p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex-shrink-0 flex items-center justify-center text-sm">
                  3
                </div>
                <div>
                  <p className="font-medium">Clear Objectives</p>
                  <p className="text-sm text-gray-600">
                    Each section should have a specific learning outcome
                  </p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex-shrink-0 flex items-center justify-center text-sm">
                  4
                </div>
                <div>
                  <p className="font-medium">Include Practice</p>
                  <p className="text-sm text-gray-600">
                    Add exercises or assignments when appropriate
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Section Overview */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Sections Created</span>
                  <span>{formData.sections.length}</span>
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
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Sections Completed</span>
                  <span>
                    {formData.sections.filter(s => s.title && s.content && s.duration).length}/{formData.sections.length}
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

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const newSections = [...formData.sections];
                  // Sort sections by title
                  newSections.sort((a, b) => a.title.localeCompare(b.title));
                  setFormData({ ...formData, sections: newSections });
                }}
                className="w-full p-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Sort Sections Alphabetically
              </button>
              <button
                onClick={() => {
                  const newSections = [...formData.sections];
                  // Sort sections by duration
                  newSections.sort((a, b) => {
                    const durationA = parseInt(a.duration) || 0;
                    const durationB = parseInt(b.duration) || 0;
                    return durationA - durationB;
                  });
                  setFormData({ ...formData, sections: newSections });
                }}
                className="w-full p-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Sort by Duration
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all sections?')) {
                    setFormData({ ...formData, sections: [{ title: '', content: '', duration: '' }] });
                  }
                }}
                className="w-full p-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear All Sections
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
  
export default CreateClass;