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
  LinearProgress,
  Tooltip,
  Badge
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Assignment as BacklogIcon,
  Assessment as ReportIcon,
  Schedule as ReleaseIcon,
  FilterList as FilterIcon,
  Upload as ImportIcon,
  CheckCircle as HealthyIcon,
  Warning as AtRiskIcon,
  Error as CriticalIcon
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
import { calculateProductStatus, getStatusColor, getStatusLabel } from '@utils/productStatus';
import useOrganizationMembers from '@hooks/useOrganizationMembers';

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
    marginTop: theme.spacing(2), // Increased spacing from theme.spacing(1)
    marginBottom: theme.spacing(2),
  },
  filterSection: {
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(3), // Added top margin for better spacing
    padding: theme.spacing(2),
    backgroundColor: '#f5f5f5',
    borderRadius: theme.spacing(1),
    boxShadow: theme.shadows[1], // Added subtle shadow
  },
  statusChip: {
    marginLeft: theme.spacing(1),
  },
  releaseStatus: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  healthScore: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  statusDetails: {
    display: 'flex',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
    flexWrap: 'wrap',
  },
  miniStatusChip: {
    height: 20,
    fontSize: '0.7rem',
  }
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

  // Get organization members for resource analysis
  const { data: organizationMembers = [] } = useOrganizationMembers();

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

  // Enhanced product status calculation
  const getProductStatusData = (product) => {
    // Mock data for demonstration - in production these would come from actual APIs
    const mockReleases = [
      { 
        name: 'v1.0', 
        status: 'completed', 
        target_date: '2024-01-15',
        team: [
          { role: 'Frontend Developer', count: 1, weeklyRate: 2500 },
          { role: 'Backend Developer', count: 1, weeklyRate: 2800 }
        ]
      },
      { 
        name: 'v1.1', 
        status: 'active', 
        target_date: '2024-03-01',
        duration: { weeks: 12 },
        team: [
          { role: 'Frontend Developer', count: 2, weeklyRate: 2500 },
          { role: 'Backend Developer', count: 1, weeklyRate: 2800 },
          { role: 'QA Engineer', count: 1, weeklyRate: 2200 }
        ]
      }
    ];
    
    const mockFeatures = Array.from({ length: 10 }, (_, i) => ({
      feature_uuid: `feat-${i}`,
      name: `Feature ${i + 1}`,
      status: i < 6 ? 'completed' : i < 8 ? 'in_progress' : 'planned',
      end_date: `2024-0${Math.floor(Math.random() * 3) + 1}-15`
    }));

    const mockIssues = Array.from({ length: 5 }, (_, i) => ({
      issue_uuid: `issue-${i}`,
      name: `Issue ${i + 1}`,
      status: i < 3 ? 'completed' : 'in_progress'
    }));

    const mockBudget = {
      total_budget: 75000,
      spent_budget: product.health_score ? (product.health_score / 100) * 75000 : 35000
    };

    return calculateProductStatus(
      product, 
      mockReleases, 
      mockFeatures, 
      mockIssues, 
      mockBudget, 
      organizationMembers
    );
  };

  // Product status helper functions
  const getProductStatus = (product) => {
    const statusData = getProductStatusData(product);
    return statusData.overall;
  };

  const getCurrentReleaseStatus = (product) => {
    const statusData = getProductStatusData(product);
    return statusData.timeline;
  };

  // Get status icon component
  const getStatusIcon = (status) => {
    switch (status) {
      case 'green':
        return <HealthyIcon style={{ color: '#4caf50', fontSize: '1.2rem' }} />;
      case 'yellow':
        return <AtRiskIcon style={{ color: '#ff9800', fontSize: '1.2rem' }} />;
      case 'red':
        return <CriticalIcon style={{ color: '#f44336', fontSize: '1.2rem' }} />;
      default:
        return <HealthyIcon style={{ color: '#9e9e9e', fontSize: '1.2rem' }} />;
    }
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
      {/* Page Header */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0C5595', marginBottom: 1 }}>
          📊 Product Portfolio
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Monitor product health, timeline, budget, and team performance
        </Typography>
      </Box>

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
                <MenuItem value="green">
                  <Box display="flex" alignItems="center">
                    <HealthyIcon style={{ color: '#4caf50', marginRight: 8 }} />
                    Healthy Products
                  </Box>
                </MenuItem>
                <MenuItem value="yellow">
                  <Box display="flex" alignItems="center">
                    <AtRiskIcon style={{ color: '#ff9800', marginRight: 8 }} />
                    At Risk Products
                  </Box>
                </MenuItem>
                <MenuItem value="red">
                  <Box display="flex" alignItems="center">
                    <CriticalIcon style={{ color: '#f44336', marginRight: 8 }} />
                    Critical Products
                  </Box>
                </MenuItem>
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
          {getFilteredProducts().map((product) => {
            const statusData = getProductStatusData(product);
            return (
              <Grid item xs={12} md={6} lg={4} key={product.product_uuid}>
                <Card className={classes.productCard}>
                  <CardContent>
                    {/* Product Name and Overall Status */}
                    <Box className={classes.statusIndicator}>
                      <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {product.name}
                      </Typography>
                      <Tooltip title={`Overall Status: ${getStatusLabel(statusData.overall)}`}>
                        <Chip 
                          size="small" 
                          icon={getStatusIcon(statusData.overall)}
                          label={getStatusLabel(statusData.overall)} 
                          style={{ 
                            backgroundColor: getStatusColor(statusData.overall),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Tooltip>
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      {product.description || 'No description available'}
                    </Typography>
                    
                    {/* Detailed Status Breakdown */}
                    <Box className={classes.statusDetails}>
                      <Tooltip title={`Timeline: ${statusData.details.timeline.daysRemaining ? 
                        `${statusData.details.timeline.daysRemaining} days remaining` : 'No timeline set'}`}>
                        <Chip 
                          size="small" 
                          label="Timeline"
                          className={classes.miniStatusChip}
                          style={{ 
                            backgroundColor: getStatusColor(statusData.timeline),
                            color: 'white'
                          }}
                        />
                      </Tooltip>
                      
                      <Tooltip title={`Budget: ${statusData.details.budget.budgetUtilization}% utilized`}>
                        <Chip 
                          size="small" 
                          label="Budget"
                          className={classes.miniStatusChip}
                          style={{ 
                            backgroundColor: getStatusColor(statusData.budget),
                            color: 'white'
                          }}
                        />
                      </Tooltip>
                      
                      <Tooltip title={`Resources: ${statusData.details.resources.activeTeamMembers} active team members`}>
                        <Chip 
                          size="small" 
                          label="Team"
                          className={classes.miniStatusChip}
                          style={{ 
                            backgroundColor: getStatusColor(statusData.resources),
                            color: 'white'
                          }}
                        />
                      </Tooltip>
                    </Box>
                    
                    {/* Health Score Progress */}
                    <Box className={classes.healthScore}>
                      <Typography variant="body2" gutterBottom>
                        Health Score: {statusData.score}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={statusData.score}
                        style={{ 
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getStatusColor(statusData.overall)
                          }
                        }}
                        sx={{
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getStatusColor(statusData.overall)
                          }
                        }}
                      />
                    </Box>

                    {/* Quick Stats */}
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'text.secondary' }}>
                      <span>Features: {statusData.details.features.completed || 0}/{statusData.details.features.total || 0}</span>
                      <span>Issues: {statusData.details.issues.completed || 0}/{statusData.details.issues.total || 0}</span>
                      <span>Releases: {statusData.details.releases.completed || 0}/{statusData.details.releases.total || 0}</span>
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
            );
          })}
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
