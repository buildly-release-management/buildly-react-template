import React, { useEffect, useState, useContext } from 'react';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import { useQuery } from 'react-query';
import makeStyles from '@mui/styles/makeStyles';
import { 
  Box, 
  Tabs, 
  Tab, 
  Button, 
  Menu, 
  MenuItem, 
  Chip, 
  FormControl, 
  InputLabel, 
  Select,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  LinearProgress
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Assignment as BacklogIcon,
  Assessment as ReportIcon,
  Schedule as ReleaseIcon,
  FilterList as FilterIcon,
  Upload as ImportIcon
} from '@mui/icons-material';
import { UserContext } from '@context/User.context';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import Chatbot from '@components/Chatbot/Chatbot';
import { routes } from '@routes/routesConstants';
import useAlert from '@hooks/useAlert';
import { getAllProductQuery } from '@react-query/queries/product/getAllProductQuery';
import { useDeleteProductMutation } from '@react-query/mutations/product/deleteProductMutation';
import AddProduct from '@pages/NewProduct/NewProduct';
import { useStore } from '@zustand/product/productStore';
import { productColumns, getProductsData } from './ProductPortfolioConstants';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(5),
    paddingTop: 0,
  },
  productCard: {
    margin: theme.spacing(1),
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4],
    },
  },
  productNavigation: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  filterSection: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: '#f5f5f5',
    borderRadius: theme.spacing(1),
  },
  statusChip: {
    marginLeft: theme.spacing(1),
  },
  releaseStatus: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
  },
}));

const ProductPortfolio = ({ history }) => {
  const redirectTo = location.state && location.state.from;
  const classes = useStyles();
  const [rows, setRows] = useState([]);
  const [openConfirmModal, setConfirmModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState('');
  const [menuIndex, setMenuIndex] = useState(0);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'green', 'yellow', 'red'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productNavAnchor, setProductNavAnchor] = useState(null);
  const [importAnchor, setImportAnchor] = useState(null);

  const user = useContext(UserContext);
  const organization = user.organization.organization_uuid;
  const { displayAlert } = useAlert();
  const { setActiveProduct } = useStore();

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
    setActiveProduct(item.product_uuid);
    history.push(routes.PRODUCT_ROADMAP_REPORT);
  };

  // Product status helper functions
  const getProductStatus = (product) => {
    // Calculate overall status based on releases, features, issues
    const score = product.health_score || 0;
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  const getCurrentReleaseStatus = (product) => {
    // Mock current release status - in production would come from API
    const statuses = ['green', 'yellow', 'red'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  // Navigation functions for product quick actions
  const navigateToBacklog = (product) => {
    setActiveProduct(product.product_uuid);
    history.push(`${routes.DASHBOARD}?view=backlog&product=${product.product_uuid}`);
  };

  const navigateToReport = (product) => {
    setActiveProduct(product.product_uuid);
    history.push(routes.INSIGHTS);
  };

  const navigateToReleases = (product) => {
    setActiveProduct(product.product_uuid);
    history.push(`${routes.PRODUCT_ROADMAP_REPORT}?section=releases`);
  };

  // Filter products based on status
  const getFilteredProducts = () => {
    if (statusFilter === 'all') return rows;
    return rows.filter(product => {
      const status = getProductStatus(product);
      const releaseStatus = getCurrentReleaseStatus(product);
      return status === statusFilter || releaseStatus === statusFilter;
    });
  };

  // Handle CSV import for business tasks
  const handleImportTasks = (product) => {
    // Navigate to business tasks with CSV import
    setActiveProduct(product.product_uuid);
    history.push(`${routes.DASHBOARD}?import=csv&product=${product.product_uuid}`);
  };

  return (
    <div className={classes.root}>
      {/* Filter Section */}
      <Box className={classes.filterSection}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                label="Filter by Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                startAdornment={<FilterIcon />}
              >
                <MenuItem value="all">All Products</MenuItem>
                <MenuItem value="green">Green Status</MenuItem>
                <MenuItem value="yellow">Yellow Status</MenuItem>
                <MenuItem value="red">Red Status</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              startIcon={<ImportIcon />}
              onClick={(e) => setImportAnchor(e.currentTarget)}
            >
              Bulk Import Tasks
            </Button>
            <Menu
              anchorEl={importAnchor}
              open={Boolean(importAnchor)}
              onClose={() => setImportAnchor(null)}
            >
              {getFilteredProducts().map((product) => (
                <MenuItem 
                  key={product.product_uuid}
                  onClick={() => {
                    handleImportTasks(product);
                    setImportAnchor(null);
                  }}
                >
                  Import to {product.name}
                </MenuItem>
              ))}
            </Menu>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant={viewMode === 'table' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('table')}
                sx={{ mr: 1 }}
              >
                Table View
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('cards')}
              >
                Card View
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Card View */}
      {viewMode === 'cards' && (
        <Grid container spacing={2}>
          {getFilteredProducts().map((product) => (
            <Grid item xs={12} md={6} lg={4} key={product.product_uuid}>
              <Card className={classes.productCard}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {product.name}
                    <Chip 
                      size="small" 
                      label={getProductStatus(product)} 
                      color={getProductStatus(product) === 'green' ? 'success' : getProductStatus(product) === 'yellow' ? 'warning' : 'error'}
                      className={classes.statusChip}
                    />
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {product.description || 'No description available'}
                  </Typography>
                  
                  {/* Current Release Status */}
                  <Box className={classes.releaseStatus}>
                    <Typography variant="body2">Current Release:</Typography>
                    <Chip 
                      size="small" 
                      label={getCurrentReleaseStatus(product)} 
                      color={getCurrentReleaseStatus(product) === 'green' ? 'success' : getCurrentReleaseStatus(product) === 'yellow' ? 'warning' : 'error'}
                      className={classes.statusChip}
                    />
                  </Box>
                  
                  {/* Health Score Progress */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Health Score: {product.health_score || 0}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={product.health_score || 0}
                      color={getProductStatus(product) === 'green' ? 'success' : getProductStatus(product) === 'yellow' ? 'warning' : 'error'}
                    />
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Tabs 
                    value={0} 
                    variant="scrollable" 
                    scrollButtons="auto"
                    className={classes.productNavigation}
                  >
                    <Tab 
                      icon={<BacklogIcon />} 
                      label="Backlog" 
                      onClick={() => navigateToBacklog(product)}
                    />
                    <Tab 
                      icon={<ReportIcon />} 
                      label="Report" 
                      onClick={() => navigateToReport(product)}
                    />
                    <Tab 
                      icon={<ReleaseIcon />} 
                      label="Releases" 
                      onClick={() => navigateToReleases(product)}
                    />
                  </Tabs>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <DataTableWrapper
          loading={isAllProductLoading || isDeletingProductLoading}
          rows={getFilteredProducts() || []}
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
      )}
      
      <Chatbot />
    </div>
  );
};

export default ProductPortfolio;
