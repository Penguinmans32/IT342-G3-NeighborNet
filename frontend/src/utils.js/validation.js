export const validateBasicInfo = (formData) => {
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

  export const validateThumbnail = (formData) => {
    const { thumbnail, thumbnailPreview, thumbnailDescription } = formData;

    if (!thumbnail && !thumbnailPreview) {
        return {
            isValid: false,
            error: 'Please upload a thumbnail image'
        };
    }

    if (!thumbnailDescription?.trim()) {
        return {
            isValid: false,
            error: 'Please add a description for your thumbnail'
        };
    }

    return { isValid: true, error: '' };
};

  export const validateRequirements = (formData) => {
    const hasValidRequirements = formData.requirements.some(req => req.trim() !== '');
    return {
      isValid: hasValidRequirements,
      error: !hasValidRequirements ? 'Please add at least one requirement' : ''
    };
  };

  export const validateSections = (formData) => {
    const hasValidSections = formData.sections.some(
      section => section.title.trim() && section.content.trim() && section.duration.trim()
    );
    return {
      isValid: hasValidSections,
      error: !hasValidSections ? 'Please complete at least one section with title, content, and duration' : ''
    };
  };