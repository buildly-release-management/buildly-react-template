import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useParams, useHistory } from 'react-router-dom';
import AIEnhancedProductWizard from '@components/AIEnhancedProductWizard/AIEnhancedProductWizard';
import { useQuery } from 'react-query';
import { httpService } from '@modules/http/http.service';

const fetchProduct = async (productId) => {
  const response = await httpService.makeRequest(
    'get',
    `${window.env.API_URL}product/product/${productId}/`
  );
  return response.data;
};

const EditProductAI = () => {
  const { productId } = useParams();
  const history = useHistory();
  const [wizardOpen, setWizardOpen] = useState(true);

  const { data: productData, isLoading, error } = useQuery(
    ['product', productId],
    () => fetchProduct(productId),
    { enabled: !!productId }
  );

  const handleWizardClose = () => {
    setWizardOpen(false);
    history.push('/app/product-portfolio');
  };

  const handleWizardSave = () => {
    setWizardOpen(false);
    history.push('/app/product-portfolio');
  };

  if (isLoading) return <Box sx={{ mt: 8 }}>Loading...</Box>;
  if (error) return <Box sx={{ mt: 8, color: 'red' }}>Failed to load product.</Box>;

  return (
    <Box sx={{ mt: 8 }}>
      <AIEnhancedProductWizard
        open={wizardOpen}
        onClose={handleWizardClose}
        onSave={handleWizardSave}
        editData={productData}
      />
    </Box>
  );
};

export default EditProductAI;
