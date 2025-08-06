const handleInputs = (event) => {
  // Input handling logic here
};

// Upload callback function for image uploads
const uploadCallback = (file) => {
  return new Promise((resolve, reject) => {
    // Simple file reader for demo purposes
    // In production, you would upload to your server/CDN
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({ data: { link: e.target.result } });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const toolbarConfig = {
  options: [
    'inline',
    'blockType',
    'fontSize',
    'fontFamily',
    'list',
    'textAlign',
    'colorPicker',
    'link',
    // 'embedded',
    'emoji',
    // 'image',
    'remove',
    'history',
  ],
  fontFamily: {
    options: ['Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana'],
    className: undefined,
    component: undefined,
    dropdownClassName: undefined,
  },
  image: {
    popupClassName: undefined,
    urlEnabled: true,
    uploadEnabled: true,
    alignmentEnabled: true,
    uploadCallback,
    previewImage: true,
    inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
    alt: { present: false, mandatory: false },
    defaultSize: {
      height: 'auto',
      width: 'auto',
    },
  },
};
