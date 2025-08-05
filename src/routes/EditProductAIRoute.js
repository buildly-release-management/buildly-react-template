import React from 'react';
import { Route } from 'react-router-dom';
import EditProductAI from '@pages/NewProduct/EditProductAI';

const EditProductAIRoute = () => (
  <Route path="/app/product-portfolio/edit/:productId" component={EditProductAI} />
);

export default EditProductAIRoute;
