import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  MdCalendarToday 
} from 'react-icons/md';
import axios from 'axios';

const AddBorrowingItem = () => {
  const navigate = useNavigate();
  const [itemData, setItemData] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    availabilityPeriod: '',
    terms: '',
    availableFrom: '',
    availableUntil: '',
    contactPreference: '',
    imageUrl: null
  });
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [formStep, setFormStep] = useState(1);
  const totalSteps = 2;

  // Handle image selection
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setItemData({...itemData, imageUrl: file});
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(itemData).forEach(key => {
        if (itemData[key] !== null && itemData[key] !== undefined) {
          formData.append(key, itemData[key]);
        }
      });

      await axios.post('http://localhost:8080/api/borrowing/items', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Success notification could be added here
      navigate('/borrowing');
    } catch (error) {
      console.error('Error adding item:', error);
      // Error notification could be added here
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (formStep < totalSteps) setFormStep(formStep + 1);
  };

  const prevStep = () => {
    if (formStep > 1) setFormStep(formStep - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItemData({
      ...itemData,
      [name]: value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8 flex items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/borrowing')}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors mr-4"
          >
            <MdArrowBack className="text-xl" />
            <span>Back to Borrowing</span>
          </motion.button>
          
          <h1 className="text-3xl font-bold">List an Item for Borrowing</h1>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[...Array(totalSteps)].map((_, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center 
                            ${index + 1 === formStep ? 'bg-blue-500 text-white' : 
                              index + 1 < formStep ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                  {index + 1}
                </div>
                {index < totalSteps - 1 && (
                  <div className={`h-1 w-full ${index + 1 < formStep ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">
            Step {formStep} of {totalSteps}: {formStep === 1 ? 'Item Details' : 'Availability & Terms'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className={`p-8 ${formStep === 1 ? 'block' : 'hidden'}`}>
            {/* Step 1: Item Details */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MdCloudUpload className="text-blue-500" />
                Item Image
              </label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center
                          transition-all hover:border-blue-500 cursor-pointer"
                onClick={() => document.getElementById('itemImage').click()}
              >
                {previewImage ? (
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt="Item preview"
                      className="max-h-60 mx-auto rounded-lg object-contain"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(null);
                        setItemData({...itemData, imageUrl: null});
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <MdDelete />
                    </button>
                  </div>
                ) : (
                  <div className="py-8">
                    <MdCloudUpload className="mx-auto text-5xl text-gray-400 mb-4" />
                    <p className="text-blue-500 font-medium">Click to upload an image</p>
                    <p className="text-gray-400 text-sm mt-2">PNG, JPG or WEBP (max. 5MB)</p>
                  </div>
                )}
                <input
                  id="itemImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MdTitle className="text-blue-500" />
                  Item Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={itemData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                    value={itemData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MdLocationOn className="text-blue-500" />
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={itemData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Where can borrowers pick up the item?"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={nextStep}
                  className="px-8 py-3 bg-blue-500 text-white rounded-lg 
                            hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  Next Step
                </motion.button>
              </div>
            </div>
          </div>

          <div className={`p-8 ${formStep === 2 ? 'block' : 'hidden'}`}>
            {/* Step 2: Availability & Terms */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MdCalendarToday className="text-blue-500" />
                    Available From
                  </label>
                  <input
                    type="date"
                    name="availableFrom"
                    value={itemData.availableFrom}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MdCalendarToday className="text-blue-500" />
                    Available Until
                  </label>
                  <input
                    type="date"
                    name="availableUntil"
                    value={itemData.availableUntil}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>

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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  rows="4"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MdOutlineMessage className="text-blue-500" />
                  Contact Preferences
                </label>
                <select
                     name="contactPreference"
                     value={itemData.contactPreference}
                     onChange={handleChange}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                     required
                   >
                     <option value="">Select Contact Method</option>
                     <option value="app">In-App Messages</option>
                     <option value="email">Email</option>
                     <option value="phone">Phone</option>
                   </select>
                 </div>
   
                 <div className="flex justify-between pt-6">
                   <motion.button
                     type="button"
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     onClick={prevStep}
                     className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                   >
                     Back
                   </motion.button>
                   
                   <motion.button
                     type="submit"
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     disabled={loading}
                     className={`px-8 py-3 bg-blue-500 text-white rounded-lg 
                               hover:bg-blue-600 transition-colors flex items-center gap-2
                               ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                   >
                     {loading ? (
                       <>
                         <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                         <span>Listing Item...</span>
                       </>
                     ) : (
                       <span>List Item</span>
                     )}
                   </motion.button>
                 </div>
               </div>
             </div>
           </form>
   
           {/* Preview Card */}
           {formStep === 2 && itemData.name && (
             <div className="mt-8">
               <h2 className="text-xl font-bold mb-4">Item Preview</h2>
               <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                 <div className="aspect-video relative bg-gray-100">
                   {previewImage ? (
                     <img 
                       src={previewImage} 
                       alt="Item preview" 
                       className="w-full h-full object-contain"
                     />
                   ) : (
                     <div className="flex items-center justify-center h-full">
                       <p className="text-gray-400">No image provided</p>
                     </div>
                   )}
                 </div>
                 <div className="p-6">
                   <div className="flex items-center gap-2 mb-3">
                     <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                       {itemData.category || "Uncategorized"}
                     </span>
                     <span className="text-sm text-gray-500 flex items-center gap-1">
                       <MdLocationOn />
                       {itemData.location || "No location specified"}
                     </span>
                   </div>
                   <h3 className="text-lg font-semibold text-gray-900 mb-2">
                     {itemData.name}
                   </h3>
                   <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                     {itemData.description || "No description provided"}
                   </p>
                   <div className="flex items-center gap-2 text-sm text-gray-500">
                     <MdCalendarToday />
                     <span>
                       {itemData.availableFrom && itemData.availableUntil 
                         ? `Available: ${new Date(itemData.availableFrom).toLocaleDateString()} - ${new Date(itemData.availableUntil).toLocaleDateString()}`
                         : "Availability dates not specified"}
                     </span>
                   </div>
                 </div>
               </div>
             </div>
           )}
         </div>
       </div>
     );
   };
   
   export default AddBorrowingItem;