import React from 'react';
import { motion } from 'framer-motion';
import { MdInfo, MdNotificationsActive, MdNotifications, MdClose, MdChat } from 'react-icons/md';

const notificationTypes = {
    REQUEST: {
        icon: <MdNotificationsActive className="text-blue-500" />,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800'
    },
    ALERT: {
        icon: <MdNotificationsActive className="text-red-500" />,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800'
    },
    UPDATE: {
        icon: <MdInfo className="text-green-500" />,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800'
    },
    MESSAGE: {
        icon: <MdChat className="text-purple-500" />,
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-800'
    },
    DEFAULT: {
        icon: <MdNotifications className="text-gray-500" />,
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-800'
    }
};

const Notification = ({ title, message, type = 'DEFAULT', show = true, onClose }) => {
    const notificationStyle = notificationTypes[type] || notificationTypes.DEFAULT;
    const { icon, bgColor, borderColor, textColor } = notificationStyle;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`w-full max-w-sm overflow-hidden rounded-lg shadow-lg 
                       border ${borderColor} ${bgColor} p-4`}
        >
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    {icon}
                </div>
                <div className="ml-3 w-0 flex-1">
                    <p className={`text-sm font-medium ${textColor}`}>
                        {title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                        {message}
                    </p>
                </div>
                <div className="ml-4 flex flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="inline-flex rounded-md hover:text-gray-500 focus:outline-none"
                    >
                        <MdClose className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default Notification;