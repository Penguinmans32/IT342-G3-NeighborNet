import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MdArrowBack, MdArrowForward, MdCheck, MdError, 
    MdTitle, MdCloudUpload, MdSchool, MdDescription 
} from 'react-icons/md';
import axios from 'axios';
import toast from 'react-hot-toast';
import { validateBasicInfo, validateRequirements, validateSections, validateThumbnail } from '../../utils.js/validation';


import CreateClass from './CreateClass';

const EditClass = () => {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [error, setError] = useState('');
    const [touched, setTouched] = useState({
        basicInfo: false,
        thumbnail: false,
        requirements: false,
        sections: false
    });
    const [loading, setLoading] = useState(true);
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

    // Fetch existing class data
    useEffect(() => {
        const fetchClassData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `https://it342-g3-neighbornet.onrender.com/api/classes/${classId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const classData = response.data;
                setFormData({
                    title: classData.title || '',
                    description: classData.description || '',
                    requirements: classData.requirements?.length ? classData.requirements : [''],
                    thumbnailPreview: classData.thumbnailUrl 
                    ? `https://it342-g3-neighbornet.onrender.com${classData.thumbnailUrl}`
                    : null,
                    thumbnailDescription: classData.thumbnailDescription || '',
                    duration: classData.duration || '',
                    difficulty: classData.difficulty || 'BEGINNER',
                    category: classData.category || '',
                    creatorName: classData.creatorName || '',
                    creatorEmail: classData.creatorEmail || '',
                    creatorPhone: classData.creatorPhone || '',
                    creatorCredentials: classData.creatorCredentials || '',
                    linkedinUrl: classData.linkedinUrl || '',
                    portfolioUrl: classData.portfolioUrl || '',
                    sections: classData.sections?.length ? classData.sections : [{ title: '', content: '', duration: '' }]
                });
                setLoading(false);
            } catch (error) {
                console.error('Error fetching class:', error);
                toast.error('Failed to load class data');
                navigate('/your-classes');
            }
        };

        fetchClassData();
    }, [classId, navigate]);

    useEffect(() => {
        let completed = 0;
        const total = 4;

        if (formData.title && formData.description) completed++;
        if (formData.thumbnailPreview) completed++;
        if (formData.requirements.some(req => req.trim() !== '')) completed++;
        if (formData.sections.some(section => section.title && section.content)) completed++;

        setProgress((completed / total) * 100);
    }, [formData]);

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
                
                // Clean up the data
                const classData = {
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    thumbnailDescription: formData.thumbnailDescription?.trim() || '',
                    duration: formData.duration?.trim() || '',
                    difficulty: formData.difficulty,
                    thumbnailUrl: !formData.thumbnail ? formData.thumbnailPreview : undefined,
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

                // Only append thumbnail if a new one is selected
                if (formData.thumbnail) {
                    formDataToSend.append('thumbnail', formData.thumbnail);
                }
                
                formDataToSend.append('classData', new Blob([JSON.stringify(classData)], {
                    type: 'application/json'
                }));

                const response = await axios.put(
                    `https://it342-g3-neighbornet.onrender.com/api/classes/${classId}`,
                    formDataToSend,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                        }
                    }
                );

                if (response.status === 200) {
                    toast.success('Class updated successfully!');
                    navigate('/your-classes');
                }
            } catch (error) {
                console.error('Error updating class:', error);
                setError(error.response?.data?.message || 'Failed to update class');
                toast.error('Failed to update class');
            } finally {
                setLoading(false);
            }
        }
    };

    const steps = [
        {
            title: "Basic Information",
            icon: <MdTitle className="text-3xl" />,
            description: "Edit the fundamentals of your class"
        },
        {
            title: "Class Preview",
            icon: <MdCloudUpload className="text-3xl" />,
            description: "Update thumbnail and preview"
        },
        {
            title: "Requirements",
            icon: <MdSchool className="text-3xl" />,
            description: "What do students need to know?"
        },
        {
            title: "Class Content",
            icon: <MdDescription className="text-3xl" />,
            description: "Modify your class content"
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

    if (loading && !formData.title) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated Background - same as CreateClass */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                {/* ... your background animations ... */}
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
                                Edit Your Class
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-gray-500 mt-1"
                            >
                                Update and improve your class content
                            </motion.p>
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                        <span className="text-sm font-medium text-gray-600">
                            Step {currentStep} of {steps.length}
                        </span>
                    </div>
                </div>

                {/* Steps Indicators - same as CreateClass */}
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
                        {currentStep === 1 && (
                            <CreateClass.BasicInformationStep 
                                formData={formData} 
                                setFormData={setFormData}
                                touched={touched.basicInfo}
                                error={error}
                            />
                        )}
                        {currentStep === 2 && (
                            <CreateClass.ThumbnailStep 
                                formData={formData} 
                                setFormData={setFormData}
                                touched={touched.thumbnail}
                                error={error}
                            />
                        )}
                        {currentStep === 3 && (
                            <CreateClass.RequirementsStep 
                                formData={formData} 
                                setFormData={setFormData}
                                touched={touched.requirements}
                                error={error}
                            />
                        )}
                        {currentStep === 4 && (
                            <CreateClass.SectionsStep 
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
                                    Update Class
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

export default EditClass;