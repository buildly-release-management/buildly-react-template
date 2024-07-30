import React, { useEffect, useState, useContext } from 'react';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import { useQuery } from 'react-query';
import makeStyles from '@mui/styles/makeStyles';
import { UserContext } from '@context/User.context';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import Chatbot from '@components/Chatbot/Chatbot';
import { routes } from '@routes/routesConstants';
import useAlert from '@hooks/useAlert';
import { getAllProductQuery } from '@react-query/queries/product/getAllProductQuery';
import { useDeleteProductMutation } from '@react-query/mutations/product/deleteProductMutation';
import AddProduct from '@pages/NewProduct/NewProduct';
import { productColumns, getProductsData } from './ProductPortfolioConstants';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(5),
    paddingTop: 0,
  },
}));

const ProductPortfolio = ({ history }) => {
  const redirectTo = location.state && location.state.from;
  const classes = useStyles();
  const [rows, setRows] = useState([]);
  const [openConfirmModal, setConfirmModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState('');
  const [menuIndex, setMenuIndex] = useState(0);

  const user = useContext(UserContext);
  const organization = user.organization.organization_uuid;
  const { displayAlert } = useAlert();

  const { data: productData, isLoading: isAllProductLoading } = useQuery(
    ['allProducts', organization],
    () => getAllProductQuery(organization, displayAlert),
    { refetchOnWindowFocus: false },
  );
  const { mutate: deleteProductMutation, isLoading: isDeletingProductLoading } = useDeleteProductMutation(organization, displayAlert);

  const addProductPath = redirectTo
    ? `${redirectTo}/product`
    : `${routes.NEW_PRODUCT}`;

  const editProductPath = redirectTo
    ? `${redirectTo}/product`
    : `${routes.PRODUCT_PORTFOLIO}/edit`;

  const deleteProduct = (item) => {
    setDeleteItemId(item.product_uuid);
    setConfirmModal(true);
  };

  const handleConfirmModal = () => {
    const deleteData = {
      product_uuid: deleteItemId,
    };
    setConfirmModal(false);
    deleteProductMutation(deleteData);
  };

  useEffect(() => {
    setRows(_.orderBy(getProductsData(productData), 'create_date', 'desc'));
  }, [productData]);

  const onAddButtonClick = () => {
    history.push(addProductPath, {
      from: redirectTo || location.pathname,
    });
  };

  const editProduct = (item) => {
    history.push(`${editProductPath}/:${item.product_uuid}`, {
      type: 'editP',
      from: redirectTo || location.pathname,
      data: item,
      product_uuid: item.product_uuid,
    });
  };

  const viewProductRoadmap = (item) => {
    localStorage.setItem('activeProduct', item.product_uuid);
    history.push(routes.PRODUCT_ROADMAP_REPORT);
  };

  return (
    <div className={classes.root}>
      <DataTableWrapper
        loading={isAllProductLoading || isDeletingProductLoading}
        rows={rows || []}
        columns={productColumns}
        filename="ProductList"
        addButtonHeading="Add Product"
        onAddButtonClick={onAddButtonClick}
        editAction={editProduct}
        roadmapAction={viewProductRoadmap}
        deleteAction={deleteProduct}
        openDeleteModal={openConfirmModal}
        setDeleteModal={setConfirmModal}
        handleDeleteModal={handleConfirmModal}
        deleteModalTitle="Are you sure you want to delete this product?"
        tableHeader="Product Portfolio"
        menuIndex={menuIndex}
        setMenuIndex={setMenuIndex}
      >
        <Route path={addProductPath} component={AddProduct} />
        <Route path={`${editProductPath}/:id`} component={AddProduct} />
      </DataTableWrapper>
      <Chatbot />
    </div>
  );
};

export default ProductPortfolio;
