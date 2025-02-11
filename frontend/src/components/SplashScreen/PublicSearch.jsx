import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaGraduationCap, FaClock, FaStar, FaUser } from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../backendApi/AuthContext';
import AuthModals from './AuthModal';

const PublicSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const query = searchParams.get('query') || '';

  const handleSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/public/classes/search?query=${searchQuery}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      handleSearch(query);
    }
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchQuery = formData.get('search');
    setSearchParams({ query: searchQuery });
  };

  const handleClassClick = (classId) => {
    if (user) {
      navigate(`/class/${classId}`);
    } else {
      setIsSignInOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                name="search"
                defaultValue={query}
                placeholder="Search for classes, skills, or topics..."
                className="w-full pl-12 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((classItem) => (
              <motion.div
                key={classItem.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                onClick={() => handleClassClick(classItem.id)}
              >
                {/* Class Preview Image */}
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={classItem.thumbnail || '/default-class-image.jpg'}
                    alt={classItem.title}
                    className="w-full h-full object-cover"
                  />
                  {!user && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-sm font-medium px-4 py-2 bg-blue-500 rounded-full">
                        Sign in to view
                      </span>
                    </div>
                  )}
                </div>

                {/* Class Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{classItem.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{classItem.description}</p>
                  
                  {/* Class Meta Info */}
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <div className="flex items-center">
                      <FaUser className="mr-1" />
                      <span>{classItem.instructor}</span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-1" />
                      <span>{classItem.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <FaStar className="mr-1 text-yellow-400" />
                      <span>{classItem.rating}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* No Results State */}
        {!loading && searchResults.length === 0 && query && (
          <div className="text-center py-12">
            <FaGraduationCap className="mx-auto text-5xl text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No classes found</h3>
            <p className="text-gray-600">Try adjusting your search terms or browse our categories</p>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModals
        isSignInOpen={isSignInOpen}
        isSignUpOpen={false}
        closeSignInModal={() => setIsSignInOpen(false)}
        closeSignUpModal={() => {}}
        setIsSignInOpen={setIsSignInOpen}
        setIsSignUpOpen={() => {}}
      />
    </div>
  );
};

export default PublicSearch;