import { MdError } from 'react-icons/md';
import { useState } from 'react';

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const InputField = ({ 
    label, 
    fieldName, 
    type = "text", 
    placeholder, 
    icon: Icon,
    isOptional = false,
    isTextArea = false,
    formData,
    setFormData,
    touched
}) => {
    const [isValidEmail, setIsValidEmail] = useState(true);

    const ErrorMessage = ({ message }) => (
        <div className="absolute -bottom-6 left-0 flex items-center gap-1.5">
            <MdError className="text-lg text-red-500" />
            <span className="text-sm font-medium text-red-500">{message}</span>
        </div>
    );

    const inputClassName = `
        w-full px-4 ${isTextArea ? 'py-2' : 'py-3'} rounded-lg transition-all duration-200
        ${touched && !formData[fieldName]?.trim() || (type === 'email' && !isValidEmail && formData[fieldName])
            ? 'border-2 border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
            : 'border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        }
        pl-10
    `;

    const handleChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, [fieldName]: value }));

        if (type === 'email') {
            setIsValidEmail(value === '' || validateEmail(value));
        }
    };

    return (
        <div className="relative mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                {label}
                {!isOptional && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
                {isTextArea ? (
                    <textarea
                        value={formData[fieldName] || ''}
                        onChange={handleChange}
                        className={inputClassName}
                        placeholder={placeholder}
                        rows={4}
                    />
                ) : type === "select" ? (
                    <select
                        value={formData[fieldName] || ''}
                        onChange={handleChange}
                        className={inputClassName}
                    >
                        {fieldName === 'category' ? (
                            <>
                                <option value="">Select Category</option>
                                <option value="technology">Technology</option>
                                <option value="art">Art & Design</option>
                                <option value="business">Business</option>
                                <option value="music">Music</option>
                                <option value="cooking">Cooking</option>
                                <option value="language">Language</option>
                                <option value="other">Other</option>
                            </>
                        ) : (
                            <>
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advanced</option>
                                <option value="EXPERT">Expert</option>
                            </>
                        )}
                    </select>
                ) : (
                    <input
                        type={type}
                        value={formData[fieldName] || ''}
                        onChange={handleChange}
                        className={inputClassName}
                        placeholder={placeholder}
                    />
                )}
                <Icon className={`absolute left-3 ${isTextArea ? 'top-3' : 'top-1/2 transform -translate-y-1/2'} text-gray-400 text-xl`} />
                
                {/* Error Messages */}
                {touched && !isOptional && !formData[fieldName]?.trim() && (
                    <ErrorMessage message={`${label} is required`} />
                )}
                {type === 'email' && formData[fieldName] && !isValidEmail && (
                    <div className="absolute -bottom-6 left-0 flex items-center gap-1.5">
                        <MdError className="text-lg text-red-500" />
                        <span className="text-sm font-medium text-red-500">
                            Please enter a valid email address
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InputField;