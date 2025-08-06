import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useHistory } from 'react-router-dom';
import AIEnhancedProductWizard from '@components/AIEnhancedProductWizard/AIEnhancedProductWizard';

const NewProductAI = () => {
  const [wizardOpen, setWizardOpen] = useState(true);
  const history = useHistory();

  const handleWizardClose = () => {
    setWizardOpen(false);
    // Redirect to product portfolio after closing
    history.push('/app/product-portfolio');
  };

  return (
    <Box sx={{ mt: 8 }}>
      <AIEnhancedProductWizard
        open={wizardOpen}
        onClose={handleWizardClose}
        onSave={() => {}} // This is now handled internally by the wizard
      />
    </Box>
  );
};

export default NewProductAI;
