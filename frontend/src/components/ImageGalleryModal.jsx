import { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';

const ImageGalleryModal = ({ images = [], isOpen, onClose, currentIndex = 0 }) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  useEffect(() => {
    const handleKeydown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
          break;
        case 'ArrowRight':
          setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
          break;
        case 'Escape':
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isOpen, images.length, onClose]);

  if (!isOpen) return null;

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 p-2 bg-white rounded-full shadow-lg
                    hover:bg-gray-100 transition-colors"
        >
          <MdClose className="text-2xl text-gray-700" />
        </button>

        {/* Navigation arrows */}
        <div className="absolute inset-y-0 left-0 flex items-center">
          <button
            onClick={handlePrevious}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-r-xl transition-colors
                     text-white transform -translate-x-2 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            onClick={handleNext}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-l-xl transition-colors
                     text-white transform translate-x-2 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Main image */}
        <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
          <img
            src={images[activeIndex]}
            alt={`Gallery item ${activeIndex + 1}`}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
            }}
          />
          
          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 
                        bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {activeIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-4 justify-center overflow-x-auto py-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0
                          ${index === activeIndex ? 'border-blue-500 scale-110' : 'border-transparent'}`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGalleryModal;