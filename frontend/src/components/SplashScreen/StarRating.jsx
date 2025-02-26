import { useState, useEffect } from 'react';
import { MdStar, MdStarBorder, MdStarHalf } from 'react-icons/md';
import PropTypes from 'prop-types';

const StarRating = ({ initialRating = 0, onRatingUpdate, readOnly = false }) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  const handleStarClick = async (value) => {
    if (readOnly) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onRatingUpdate(value);
      setRating(value);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((value) => {
          const showHover = hoverRating >= value;
          const showRating = rating >= value;
          const showHalf = rating > value - 0.5 && rating < value;

          return (
            <div
              key={value}
              className={`
                px-1.5 py-1 inline-block cursor-pointer select-none
                ${readOnly ? 'cursor-default' : ''}
              `}
              style={{ touchAction: 'manipulation' }}
              onClick={() => !isSubmitting && !readOnly && handleStarClick(value)}
              onMouseEnter={() => !readOnly && setHoverRating(value)}
              onMouseLeave={() => !readOnly && setHoverRating(0)}
            >
              {showHover || showRating ? (
                <MdStar
                  size={24}
                  className="text-yellow-400 transition-colors duration-150"
                />
              ) : showHalf ? (
                <MdStarHalf
                  size={24}
                  className="text-yellow-400 transition-colors duration-150"
                />
              ) : (
                <MdStarBorder
                  size={24}
                  className="text-gray-300 transition-colors duration-150"
                />
              )}
            </div>
          );
        })}
      </div>

      {isSubmitting && (
        <div className="ml-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isSubmitting && rating > 0 && (
        <div className="ml-3 text-sm font-medium text-gray-600">
          {rating.toFixed(1)}
        </div>
      )}
    </div>
  );
};

StarRating.propTypes = {
  initialRating: PropTypes.number,
  onRatingUpdate: PropTypes.func.isRequired,
  readOnly: PropTypes.bool
};

export default StarRating;