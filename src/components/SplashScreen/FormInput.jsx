const FormInput = ({ icon: Icon, ...props }) => {
    return (
      <div className="relative">
        <Icon 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" 
        />
        <input
          {...props}
          className="w-full px-12 py-3 bg-gray-50 border border-gray-200 rounded-xl
                   focus:border-blue-400 focus:ring-2 focus:ring-blue-100 
                   outline-none"
        />
      </div>
    );
  };

export default FormInput;