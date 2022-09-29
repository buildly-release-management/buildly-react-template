import React, { useEffect, useState } from 'react';
import { Route } from 'react-router-dom';
import { connect } from 'react-redux';
import _ from 'lodash';
import makeStyles from '@mui/styles/makeStyles';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import { getAllProducts } from '@redux/product/actions/product.actions';
import { routes } from '@routes/routesConstants';
import AddProduct from '@pages/NewProduct/NewProduct';
import { productColumns, getProductsData } from './ProductConstants';
import ConfirmModal from '@components/Modal/ConfirmModal';
import { clearProductData } from '@redux/decision/actions/decision.actions';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(5),
    paddingTop: 0,
  },
}));

const Products = ({
  dispatch, loading, history, products, user,
}) => {
  const redirectTo = location.state && location.state.from;
  const classes = useStyles();
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState(productColumns);
  const [openConfirmModal, setConfirmModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState('');

  const addProductPath = redirectTo
    ? `${redirectTo}/product`
    : `${routes.NEW_PRODUCT}`;

  const editProductPath = redirectTo
    ? `${redirectTo}/product`
    : `${routes.PRODUCTS}/edit`;

  const deleteProduct = (item) => {
    setDeleteItemId(item.product_uuid);
    setConfirmModal(true);
  };

  const handleConfirmModal = () => {
    const deleteData = {
      product_uuid: deleteItemId,
    };
    dispatch(clearProductData(deleteData));
    setConfirmModal(false);
  };

  useEffect(() => {
    if (!products || _.isEmpty(products)) {
      dispatch(getAllProducts());
    }
  }, []);

  useEffect(() => {
    const currentProd = _.filter(products,
      { organization_uuid: user.organization.organization_uuid });
    if (currentProd && currentProd.length > 0) {
      const rws = _.orderBy(getProductsData(currentProd), 'create_date', 'desc');
      setRows(rws);
    }
  }, [JSON.stringify(products)]);

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

  return (
    <div className={classes.root}>
      <DataTableWrapper
        loading={loading}
        rows={rows || []}
        columns={columns}
        filename="ProductList"
        addButtonHeading="Add Product"
        onAddButtonClick={onAddButtonClick}
        editAction={editProduct}
        deleteAction={deleteProduct}
        openDeleteModal={openConfirmModal}
        setDeleteModal={setConfirmModal}
        tableHeader="Products"
      >
        <Route path={addProductPath} component={AddProduct} />
        <Route path={`${editProductPath}/:id`} component={AddProduct} />
        <ConfirmModal
          open={openConfirmModal}
          setOpen={setConfirmModal}
          submitAction={handleConfirmModal}
          title="Are you sure you want to delete this product?"
          submitText="Delete"
        />
      </DataTableWrapper>
    </div>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.productReducer,
  user: state.authReducer.data,
});

export default connect(mapStateToProps)(Products);
