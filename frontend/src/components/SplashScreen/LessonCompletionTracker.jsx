import { MdCheck, MdPlayCircle } from 'react-icons/md';


const LessonCompletionTracker = ({ isCompleted, canMarkComplete, onComplete }) => {
    return (
      <div className="mt-4 p-4 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between">
          {!isCompleted ? (
            <button
              onClick={onComplete}
              disabled={!canMarkComplete}
              className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all
                ${canMarkComplete
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              {canMarkComplete ? (
                <>
                  <MdCheck className="text-xl" />
                  Complete and Continue
                </>
              ) : (
                <>
                  <MdPlayCircle className="text-xl" />
                  Watch the lesson to continue
                </>
              )}
            </button>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 py-3 text-green-500 bg-green-50 rounded-lg">
              <MdCheck className="text-xl" />
              <span>Lesson Completed!</span>
            </div>
          )}
        </div>
      </div>
    );
  };

export default LessonCompletionTracker;