import React, { useState } from 'react';
import { Box } from '@mui/material';
import AIEnhancedProductWizard from '@components/AIEnhancedProductWizard/AIEnhancedProductWizard';

const NewProductAI = () => {
  const [wizardOpen, setWizardOpen] = useState(true);

  const handleWizardClose = () => {
    setWizardOpen(false);
    // Redirect to product portfolio after closing
    window.location.href = '/app/product-portfolio';
  };

  const handleWizardSave = (productData) => {
    // Handle product creation logic here
    console.log('Product created with AI wizard:', productData);
    setWizardOpen(false);
    window.location.href = '/app/product-portfolio';
  };

  return (
    <Box sx={{ mt: 8 }}>
      <AIEnhancedProductWizard
        open={wizardOpen}
        onClose={handleWizardClose}
        onSave={handleWizardSave}
      />
    </Box>
  );
};

export default NewProductAI;
