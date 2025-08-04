import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import _ from 'lodash';
import { useQuery } from 'react-query';
import moment from 'moment-timezone';
import {
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  LinearProgress,
  Avatar,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Fab,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  BugReport as BugReportIcon,
  Star as FeatureIcon,
  Assignment as AssignmentIcon,
  Comment as CommentIcon,
  OpenInNew as OpenInNewIcon,
  PriorityHigh as PriorityHighIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import { UserContext } from '@context/User.context';
import Loader from '@components/Loader/Loader';
import Chatbot from '@components/Chatbot/Chatbot';
import BusinessTasksImport from '@components/BusinessTasksImport/BusinessTasksImport';
import useAlert from '@hooks/useAlert';
import { routes } from '@routes/routesConstants';
import { getAllProductQuery } from '@react-query/queries/product/getAllProductQuery';

// Styled components for score visualization
const ScoreContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const ScoreProgress = styled(LinearProgress)(({ theme, scorecolor }) => ({
  height: '6px',
  borderRadius: '3px',
  backgroundColor: '#E5E7EB',
  flex: 1,
  '& .MuiLinearProgress-bar': {
    backgroundColor: scorecolor || theme.palette.primary.main,
    borderRadius: '3px',
  },
}));

const ScoreText = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  fontSize: '0.75rem',
  color: '#374151',
  minWidth: '45px',
}));

// Function to get color based on score
const getScoreColor = (score, maxScore = 20) => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return '#10B981'; // Green
  if (percentage >= 60) return '#F59E0B'; // Yellow
  if (percentage >= 40) return '#EF4444'; // Red
  return '#6B7280'; // Gray
};

// Component to render score with progress bar
const ScoreDisplay = ({ score, maxScore = 20, label, icon }) => {
  const percentage = Math.min((score / maxScore) * 100, 100);
  const color = getScoreColor(score, maxScore);
  
  return (
    <ScoreContainer>
      {icon}
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <ScoreProgress 
          variant="determinate" 
          value={percentage} 
          scorecolor={color}
        />
      </Box>
      <ScoreText>
        {score}/{maxScore}
      </ScoreText>
    </ScoreContainer>
  );
};
import { getAllFeatureQuery } from '@react-query/queries/release/getAllFeatureQuery';
import { getAllIssueQuery } from '@react-query/queries/release/getAllIssueQuery';
import { getAllReleaseQuery } from '@react-query/queries/release/getAllReleaseQuery';
import { getAllCommentQuery } from '@react-query/queries/release/getAllCommentQuery';
import { getBusinessTasksByUserQuery } from '@react-query/queries/businessTasks/getAllBusinessTasksQuery';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    background: 'linear-gradient(135deg, #FAFBFC 0%, #F8F9FA 100%)',
    minHeight: '100vh',
  },
  welcomeCard: {
    marginBottom: theme.spacing(4),
    background: 'linear-gradient(135deg, #4A90C5 0%, #6BA4D5 25%, #FBB65B 75%, #FCC88A 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    boxShadow: '0px 8px 24px rgba(74, 144, 197, 0.2)',
    '& .MuiCardContent-root': {
      padding: theme.spacing(4),
    },
  },
  productCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
    '&:hover': {
      transform: 'translateY(-4px) scale(1.02)',
      boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.1)',
      borderColor: '#F9943B',
    },
  },
  productCardContent: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  priorityChip: {
    fontWeight: 600,
    borderRadius: '8px',
    fontSize: '0.75rem',
    height: '24px',
  },
  highPriority: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    border: '1px solid #FECACA',
  },
  mediumPriority: {
    backgroundColor: '#FEF3C7',
    color: '#D97706',
    border: '1px solid #FDE68A',
  },
  lowPriority: {
    backgroundColor: '#D1FAE5',
    color: '#047857',
    border: '1px solid #A7F3D0',
  },
  sectionHeader: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(2, 3),
    background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
  },
  taskList: {
    maxHeight: 400,
    overflow: 'auto',
    padding: theme.spacing(1),
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#F7FAFC',
      borderRadius: '3px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#CBD5E0',
      borderRadius: '3px',
    },
  },
  releaseProgress: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    background: '#F8F9FA',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
  },
  overdue: {
    color: '#DC2626',
  },
  upcoming: {
    color: theme.palette.warning.main,
  },
  commentItem: {
    borderLeft: `3px solid ${theme.palette.primary.main}`,
    marginBottom: theme.spacing(1),
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const history = useHistory();
  const user = useContext(UserContext);
  const { displayAlert } = useAlert();
  
  // Safely access user properties with null checking
  const organization = user?.organization?.organization_uuid;
  const isDeveloper = user?.user_type?.toLowerCase() === 'developer';

  const [userProducts, setUserProducts] = useState([]);
  const [userIssues, setUserIssues] = useState([]);
  const [userFeatures, setUserFeatures] = useState([]);
  const [pendingComments, setPendingComments] = useState([]);
  const [upcomingReleases, setUpcomingReleases] = useState([]);
  const [userBusinessTasks, setUserBusinessTasks] = useState([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Fetch all products
  const { data: allProducts, isLoading: isLoadingProducts } = useQuery(
    ['allProducts', organization],
    () => getAllProductQuery(organization, displayAlert),
    { refetchOnWindowFocus: false }
  );

  // Fetch data for each product
  const productQueries = useQuery(
    ['dashboardData', allProducts],
    async () => {
      if (!allProducts || allProducts.length === 0) return {};
      
      const productData = {};
      
      for (const product of allProducts) {
        try {
          const [features, issues, releases, comments] = await Promise.all([
            getAllFeatureQuery(product.product_uuid, displayAlert),
            getAllIssueQuery(product.product_uuid, displayAlert),
            getAllReleaseQuery(product.product_uuid, displayAlert),
            getAllCommentQuery(product.product_uuid, displayAlert),
          ]);
          
          productData[product.product_uuid] = {
            product,
            features,
            issues,
            releases,
            comments,
          };
        } catch (error) {
          console.error(`Error fetching data for product ${product.name}:`, error);
        }
      }
      
      return productData;
    },
    {
      enabled: !!allProducts && allProducts.length > 0,
      refetchOnWindowFocus: false,
    }
  );

  // Debug user context
  useEffect(() => {
    console.log('Dashboard User Context:', {
      user: user,
      core_user_uuid: user?.core_user_uuid,
      organization: user?.organization?.organization_uuid,
      user_type: user?.user_type
    });
  }, [user]);

  // Fetch business tasks assigned to current user
  const { data: businessTasks = [], isLoading: isLoadingBusinessTasks } = useQuery(
    ['userBusinessTasks', user?.core_user_uuid],
    () => {
      console.log('Fetching business tasks for user:', user?.core_user_uuid);
      return getBusinessTasksByUserQuery(user?.core_user_uuid, { status: 'not_started,in_progress,blocked,review' }, displayAlert);
    },
    { 
      refetchOnWindowFocus: false,
      enabled: !!user?.core_user_uuid 
    }
  );

  useEffect(() => {
    if (productQueries.data && user) {
      processUserData(productQueries.data);
    }
  }, [productQueries.data, user]);

  useEffect(() => {
    console.log('Business Tasks Data Updated:', {
      businessTasks: businessTasks,
      length: businessTasks?.length,
      isLoading: isLoadingBusinessTasks,
      user_uuid: user?.core_user_uuid
    });
    if (businessTasks) {
      setUserBusinessTasks(businessTasks);
    }
  }, [businessTasks]);

  const processUserData = (productData) => {
    if (!productData || !user) {
      console.warn('processUserData: Missing productData or user data');
      return;
    }
    const userEmail = user.email || '';
    const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    const username = user.username || '';
    
    let allIssues = [];
    let allFeatures = [];
    let allComments = [];
    let allReleases = [];
    let productsWithAccess = [];

    Object.values(productData).forEach(({ product, features, issues, releases, comments }) => {
      // Add product info to all items
      const productInfo = { product_name: product.name, product_uuid: product.product_uuid };
      
      // Show ALL products (user has access if they can see the data)
      productsWithAccess.push(product);
      
      // Filter issues: assigned to user, created by user, or mentioning user
      const userRelatedIssues = issues.filter(issue => {
        // Check if user created the issue
        const isCreator = issue.created_by === user.core_user_uuid || 
                         issue.creator_email === userEmail ||
                         issue.creator?.includes(userEmail) ||
                         issue.creator?.includes(username);
        
        // Check if user is assigned
        const assignees = issue.issue_detail?.assignees || [];
        const isAssigned = assignees.some(assignee => {
          const assigneeStr = typeof assignee === 'string' ? assignee : 
                             assignee?.email || assignee?.username || assignee?.name || String(assignee);
          return assigneeStr && (
            assigneeStr.includes(userEmail) || 
            assigneeStr.includes(userName) ||
            assigneeStr.includes(username)
          );
        });
        
        // Check if user is mentioned or commented
        const isMentioned = issue.description?.includes(`@${username}`) || 
                           issue.description?.includes(userEmail);
        
        return isCreator || isAssigned || isMentioned;
      });

      // Filter features: assigned to user, created by user, or mentioning user  
      const userRelatedFeatures = features.filter(feature => {
        // Check if user created the feature
        const isCreator = feature.created_by === user.core_user_uuid || 
                         feature.creator_email === userEmail ||
                         feature.creator?.includes(userEmail) ||
                         feature.creator?.includes(username);
        
        // Check if user is assigned
        const assignees = feature.assignees || [];
        const isAssigned = Array.isArray(assignees) ? 
          assignees.some(assignee => {
            const assigneeStr = typeof assignee === 'string' ? assignee : 
                               assignee?.email || assignee?.username || assignee?.name || String(assignee);
            return assigneeStr && (
              assigneeStr.includes(userEmail) || 
              assigneeStr.includes(userName) ||
              assigneeStr.includes(username)
            );
          }) :
          typeof assignees === 'string' && assignees.includes(userEmail);
        
        // Check if user is mentioned  
        const isMentioned = feature.description?.includes(`@${username}`) || 
                           feature.description?.includes(userEmail);
          
        return isCreator || isAssigned || isMentioned;
      });

      // Filter comments: created by user or requesting feedback from user
      const userRelatedComments = comments.filter(comment => {
        const isCreator = comment.created_by === user.core_user_uuid ||
                         comment.creator_email === userEmail;
        const isMentioned = comment.comment?.includes(`@${username}`) || 
                           comment.comment?.includes(userEmail);
        const needsSignoff = comment.user_signoff_uuid && comment.user_signoff_uuid === user.core_user_uuid;
        
        return isCreator || isMentioned || needsSignoff;
      });

      allIssues.push(...userRelatedIssues.map(issue => ({ ...issue, ...productInfo })));
      allFeatures.push(...userRelatedFeatures.map(feature => ({ ...feature, ...productInfo })));
      allComments.push(...userRelatedComments.map(comment => ({ ...comment, ...productInfo })));
      allReleases.push(...releases.map(release => ({ ...release, ...productInfo })));
    });

    // Set state
    console.log('Dashboard Debug:', {
      totalProducts: Object.keys(productData).length,
      productsWithAccess: productsWithAccess.length,
      allIssues: allIssues.length,
      allFeatures: allFeatures.length,
      allComments: allComments.length,
      userInfo: { userEmail, userName, username }
    });
    
    setUserProducts(productsWithAccess);
    setUserIssues(allIssues);
    setUserFeatures(allFeatures);
    setPendingComments(allComments);
    
    // Filter upcoming releases (next 30 days)
    const now = moment();
    const upcoming = allReleases.filter(release => {
      const releaseDate = moment(release.release_date);
      return releaseDate.isAfter(now) && releaseDate.isBefore(now.clone().add(30, 'days'));
    }).sort((a, b) => moment(a.release_date).diff(moment(b.release_date)));
    
    setUpcomingReleases(upcoming);
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'critical':
        return classes.highPriority;
      case 'medium':
        return classes.mediumPriority;
      case 'low':
        return classes.lowPriority;
      default:
        return '';
    }
  };

  const formatDate = (date) => {
    return moment(date).format('MMM DD, YYYY');
  };

  const isOverdue = (date) => {
    return moment().isAfter(moment(date));
  };

  const navigateToProduct = (productUuid) => {
    history.push(routes.PRODUCT_ROADMAP, { product_uuid: productUuid });
  };

  const navigateToReleases = (productUuid) => {
    history.push(routes.RELEASE, { product_uuid: productUuid });
  };

  const getGreeting = () => {
    const hour = moment().hour();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getProductReleaseStatus = (productData) => {
    if (!productData) return { current: null, next: null, progress: 0 };
    
    const { releases } = productData;
    const now = moment();
    
    const currentRelease = releases.find(release => {
      const startDate = moment(release.create_date);
      const endDate = moment(release.release_date);
      return now.isBetween(startDate, endDate);
    });
    
    const nextRelease = releases
      .filter(release => moment(release.release_date).isAfter(now))
      .sort((a, b) => moment(a.release_date).diff(moment(b.release_date)))[0];
    
    let progress = 0;
    if (currentRelease) {
      const startDate = moment(currentRelease.create_date);
      const endDate = moment(currentRelease.release_date);
      const totalDuration = endDate.diff(startDate);
      const elapsed = now.diff(startDate);
      progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
    }
    
    return { current: currentRelease, next: nextRelease, progress };
  };

  // Early return if user context is not ready
  if (!user || !organization) {
    return <Loader open={true} />;
  }

  if (isLoadingProducts || productQueries.isLoading) {
    return <Loader open={true} />;
  }

  return (
    <div className={`${classes.root} animate-fade-in`}>
      {/* Welcome Section */}
      <Card className={`${classes.welcomeCard} modern-card`}>
        <CardContent>
          <Typography 
            variant="h3" 
            gutterBottom 
            sx={{
              color: '#ffffff',
              fontWeight: 800,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.3), 0px 0px 20px rgba(255, 255, 255, 0.1)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              textAlign: 'center',
              background: 'linear-gradient(45deg, #ffffff 30%, #f0f8ff 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: '#ffffff',
              filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))',
            }}
          >
            {getGreeting()}, {user.first_name}! 👋
          </Typography>
          <Typography 
            variant="h5" 
            gutterBottom
            sx={{
              color: '#ffffff',
              fontWeight: 600,
              fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' },
              textShadow: '1px 1px 4px rgba(0, 0, 0, 0.4)',
              textAlign: 'center',
              opacity: 0.95,
              letterSpacing: '0.02em',
            }}
          >
            {isDeveloper ? 'Developer Dashboard' : 'Product Dashboard'}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mt: 2,
              color: '#ffffff',
              fontWeight: 500,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)',
              textAlign: 'center',
              opacity: 0.9,
              lineHeight: 1.6,
            }}
          >
            {userProducts.length === 0 
              ? "Welcome to Buildly! No products are available or accessible to you yet."
              : `You have access to ${userProducts.length} product${userProducts.length > 1 ? 's' : ''} with ${userIssues.length} issue${userIssues.length !== 1 ? 's' : ''} and ${userFeatures.length} feature${userFeatures.length !== 1 ? 's' : ''} you're involved with.`
            }
          </Typography>
        </CardContent>
      </Card>

      {/* Quick Actions Section */}
      <Typography variant="h5" className={classes.sectionHeader}>
        <TrendingUpIcon />
        Quick Actions
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="outlined"
            fullWidth
            sx={{ p: 2, height: '100px', flexDirection: 'column' }}
            onClick={() => {
              if (userProducts.length > 0) {
                history.push({
                  pathname: routes.ADD_BUSINESS_TASK,
                  state: {
                    from: routes.DASHBOARD,
                    product_uuid: userProducts[0].product_uuid,
                  }
                });
              } else {
                displayAlert('info', 'Please create or get access to a product first');
              }
            }}
          >
            <AddIcon sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="caption">New Business Task</Typography>
          </Button>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="outlined"
            fullWidth
            sx={{ p: 2, height: '100px', flexDirection: 'column' }}
            onClick={() => {
              if (userProducts.length > 0) {
                setImportDialogOpen(true);
              } else {
                displayAlert('info', 'Please create or get access to a product first');
              }
            }}
          >
            <UploadIcon sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="caption">Import Tasks</Typography>
          </Button>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="outlined"
            fullWidth
            sx={{ p: 2, height: '100px', flexDirection: 'column' }}
            onClick={() => history.push(routes.PRODUCT_ROADMAP)}
          >
            <FeatureIcon sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="caption">Product Roadmap</Typography>
          </Button>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="outlined"
            fullWidth
            sx={{ p: 2, height: '100px', flexDirection: 'column' }}
            onClick={() => history.push(routes.NEW_PRODUCT)}
          >
            <AssignmentIcon sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="caption">New Product</Typography>
          </Button>
        </Grid>
      </Grid>

      {userProducts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Products Available
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            No products are currently available or accessible to you. Contact your administrator to get access to products and start collaborating.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            className="modern-button"
            onClick={() => history.push(routes.PRODUCT_PORTFOLIO)}
            sx={{ mt: 2 }}
          >
            Browse All Products
          </Button>
        </Paper>
      ) : (
        <>
          {/* Products Section */}
          <div className="animate-slide-in">
            <Typography variant="h5" className={classes.sectionHeader}>
              <AssignmentIcon />
              Your Products
            </Typography>
          </div>
          
          <Grid container spacing={3}>
            {userProducts.map((product, index) => {
              const productData = productQueries.data?.[product.product_uuid];
              const releaseStatus = getProductReleaseStatus(productData);
              
              return (
                <Grid item xs={12} md={6} lg={4} key={product.product_uuid}>
                  <Card className={classes.productCard}>
                    <CardContent className={classes.productCardContent}>
                      <Typography variant="h6" gutterBottom>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {product.description || 'No description available'}
                      </Typography>
                      
                      {/* Complexity and Cost Scores */}
                      <Box sx={{ mb: 2 }}>
                        <ScoreDisplay 
                          score={product.product_info?.complexity_score || 0}
                          maxScore={20}
                          label="Complexity"
                          icon={<AssessmentIcon fontSize="small" color="action" />}
                        />
                        <ScoreDisplay 
                          score={product.product_info?.cost_score || 0}
                          maxScore={20}
                          label="Cost"
                          icon={<TrendingUpIcon fontSize="small" color="action" />}
                        />
                      </Box>
                      
                      {/* Release Information */}
                      {releaseStatus.current && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Current Release: {releaseStatus.current.name}
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={releaseStatus.progress}
                            className={classes.releaseProgress}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {Math.round(releaseStatus.progress)}% complete
                          </Typography>
                        </Box>
                      )}
                      
                      {releaseStatus.next && (
                        <Box sx={{ mb: 1 }}>
                          <Chip 
                            size="small" 
                            label={`Next: ${releaseStatus.next.name}`}
                            color="primary"
                            variant="outlined"
                            icon={<ScheduleIcon />}
                          />
                          <Typography variant="caption" color="text.secondary" display="block">
                            Due: {formatDate(releaseStatus.next.release_date)}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                    
                    <CardActions>
                      <Button 
                        size="small" 
                        onClick={() => navigateToProduct(product.product_uuid)}
                        startIcon={<OpenInNewIcon />}
                      >
                        Open Roadmap
                      </Button>
                      <Button 
                        size="small" 
                        onClick={() => navigateToReleases(product.product_uuid)}
                        startIcon={<TimelineIcon />}
                      >
                        Releases
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            {/* Issues Assigned to User */}
            <Grid item xs={12} lg={6}>
              <Typography variant="h5" className={classes.sectionHeader}>
                <BugReportIcon />
                Your Issues ({userIssues.length})
              </Typography>
              
              <Paper className={classes.taskList}>
                <List>
                  {userIssues.length === 0 ? (
                    <ListItem>
                      <ListItemText primary="No issues assigned to you" />
                    </ListItem>
                  ) : (
                    userIssues.slice(0, 10).map((issue) => (
                      <ListItem key={issue.issue_uuid} divider>
                        <ListItemAvatar>
                          <Avatar>
                            <BugReportIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <span>{issue.name}</span>
                              {issue.priority && (
                                <Chip 
                                  label={issue.priority} 
                                  size="small"
                                  className={`${classes.priorityChip} ${getPriorityColor(issue.priority)}`}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {issue.product_name}
                              </Typography>
                              {issue.end_date && (
                                <Typography 
                                  variant="caption" 
                                  className={isOverdue(issue.end_date) ? classes.overdue : ''}
                                >
                                  Due: {formatDate(issue.end_date)}
                                  {isOverdue(issue.end_date) && ' (Overdue)'}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Open in Product Roadmap">
                            <IconButton 
                              edge="end" 
                              onClick={() => navigateToProduct(issue.product_uuid)}
                            >
                              <OpenInNewIcon />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))
                  )}
                </List>
              </Paper>
            </Grid>

            {/* Features Assigned to User or Pending Review */}
            <Grid item xs={12} lg={6}>
              <Typography variant="h5" className={classes.sectionHeader}>
                <FeatureIcon />
                Your Features ({userFeatures.length})
              </Typography>
              
              <Paper className={classes.taskList}>
                <List>
                  {userFeatures.length === 0 ? (
                    <ListItem>
                      <ListItemText primary="No features assigned to you" />
                    </ListItem>
                  ) : (
                    userFeatures.slice(0, 10).map((feature) => (
                      <ListItem key={feature.feature_uuid} divider>
                        <ListItemAvatar>
                          <Avatar>
                            <FeatureIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <span>{feature.name}</span>
                              {feature.priority && (
                                <Chip 
                                  label={feature.priority} 
                                  size="small"
                                  className={`${classes.priorityChip} ${getPriorityColor(feature.priority)}`}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {feature.product_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Complexity: {feature.complexity || 'N/A'}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Open in Product Roadmap">
                            <IconButton 
                              edge="end" 
                              onClick={() => navigateToProduct(feature.product_uuid)}
                            >
                              <OpenInNewIcon />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))
                  )}
                </List>
              </Paper>
            </Grid>
          </Grid>

          {/* Comments/Feedback Section */}
          {pendingComments.length > 0 && (
            <>
              <Typography variant="h5" className={classes.sectionHeader}>
                <CommentIcon />
                Pending Feedback ({pendingComments.length})
              </Typography>
              
              <Grid container spacing={2}>
                {pendingComments.slice(0, 6).map((comment) => (
                  <Grid item xs={12} md={6} key={comment.comment_uuid}>
                    <Paper className={classes.commentItem} sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {comment.product_name}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {comment.comment?.substring(0, 150)}
                        {comment.comment?.length > 150 && '...'}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(comment.create_date)}
                        </Typography>
                        <Button 
                          size="small" 
                          onClick={() => navigateToProduct(comment.product_uuid)}
                        >
                          Respond
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {/* Upcoming Releases */}
          {upcomingReleases.length > 0 && (
            <>
              <Typography variant="h5" className={classes.sectionHeader}>
                <ScheduleIcon />
                Upcoming Releases
              </Typography>
              
              <Grid container spacing={2}>
                {upcomingReleases.slice(0, 4).map((release) => (
                  <Grid item xs={12} sm={6} md={3} key={release.release_uuid}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {release.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {release.product_name}
                        </Typography>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ mt: 1 }}
                          className={moment(release.release_date).isBefore(moment().add(7, 'days')) ? classes.upcoming : ''}
                        >
                          {formatDate(release.release_date)}
                        </Typography>
                        {moment(release.release_date).isBefore(moment().add(7, 'days')) && (
                          <Typography variant="caption" color="warning.main">
                            Due soon!
                          </Typography>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          onClick={() => navigateToReleases(release.product_uuid)}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {/* Business Tasks Section */}
          <Typography variant="h5" className={classes.sectionHeader}>
            <AssignmentIcon />
            My Business Tasks ({userBusinessTasks.length})
          </Typography>
          
          {userBusinessTasks.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', mb: 3 }}>
              <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Business Tasks Found
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                You don't have any business tasks assigned yet. Create your first task to get started with project management.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => {
                  // Navigate to add business task - we'll need a product first
                  if (userProducts.length > 0) {
                    history.push({
                      pathname: routes.ADD_BUSINESS_TASK,
                      state: {
                        from: routes.DASHBOARD,
                        product_uuid: userProducts[0].product_uuid,
                      }
                    });
                  } else {
                    displayAlert('info', 'Please create or get access to a product first to add business tasks');
                  }
                }}
                className="modern-button"
              >
                Create New Business Task
              </Button>
            </Paper>
          ) : (
            <>
              <Grid container spacing={2}>
                {userBusinessTasks.slice(0, 6).map((task) => {
                  const isOverdue = task.is_overdue || (task.due_date && moment(task.due_date).isBefore(moment()));
                  const daysUntilDue = task.due_date ? moment(task.due_date).diff(moment(), 'days') : null;
                  
                  return (
                    <Grid item xs={12} md={6} key={task.task_uuid}>
                      <Paper className={classes.commentItem} sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                          <Typography variant="subtitle2" gutterBottom>
                            {task.title}
                          </Typography>
                          <Chip
                            size="small"
                            label={task.priority}
                            color={task.priority === 'critical' || task.priority === 'high' ? 'error' : 
                                   task.priority === 'medium' ? 'warning' : 'default'}
                            variant="outlined"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {task.description?.substring(0, 100)}
                          {task.description?.length > 100 && '...'}
                        </Typography>
                        
                        <Box display="flex" justifyContent="between" alignItems="center" mb={1}>
                          <Chip
                            size="small"
                            label={task.status?.replace('_', ' ')}
                            color={task.status === 'completed' ? 'success' : 
                                   task.status === 'blocked' ? 'error' : 
                                   task.status === 'in_progress' ? 'primary' : 'default'}
                            variant="filled"
                          />
                          {task.progress_percentage > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              {task.progress_percentage}% complete
                            </Typography>
                          )}
                        </Box>

                        {task.due_date && (
                          <Typography 
                            variant="caption" 
                            color={isOverdue ? "error" : "text.secondary"}
                            className={isOverdue ? classes.overdue : ''}
                          >
                            {isOverdue ? 'Overdue' : 
                             daysUntilDue === 0 ? 'Due today' : 
                             daysUntilDue === 1 ? 'Due tomorrow' : 
                             daysUntilDue > 0 ? `Due in ${daysUntilDue} days` : 
                             `${Math.abs(daysUntilDue)} days overdue`}
                          </Typography>
                        )}

                        {task.product_name && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Product: {task.product_name}
                          </Typography>
                        )}

                        {task.release_version && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Release: {task.release_version}
                          </Typography>
                        )}

                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                          <Typography variant="caption" color="text.secondary">
                            {task.custom_category_name || task.category?.replace('_', ' ')}
                          </Typography>
                          <Box>
                            <Button 
                              size="small" 
                              onClick={() => {
                                history.push({
                                  pathname: routes.EDIT_BUSINESS_TASK,
                                  state: {
                                    from: routes.DASHBOARD,
                                    type: 'edit',
                                    data: task,
                                    product_uuid: task.product_uuid,
                                  }
                                });
                              }}
                              sx={{ mr: 1 }}
                            >
                              Edit
                            </Button>
                            <Button 
                              size="small" 
                              onClick={() => navigateToProduct(task.product_uuid)}
                            >
                              View Product
                            </Button>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
              
              {userBusinessTasks.length > 6 && (
                <Box textAlign="center" mt={2}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      // Navigate to a full business tasks list if we had one
                      displayAlert('info', 'Full business tasks view coming soon! Use the Product Roadmap to see all tasks.');
                    }}
                  >
                    View All {userBusinessTasks.length} Tasks
                  </Button>
                </Box>
              )}
              
              {/* Floating Add Button */}
              <Fab
                color="primary"
                aria-label="add business task"
                sx={{
                  position: 'fixed',
                  bottom: 80,
                  right: 16,
                }}
                onClick={() => {
                  if (userProducts.length > 0) {
                    history.push({
                      pathname: routes.ADD_BUSINESS_TASK,
                      state: {
                        from: routes.DASHBOARD,
                        product_uuid: userProducts[0].product_uuid,
                      }
                    });
                  } else {
                    displayAlert('info', 'Please create or get access to a product first to add business tasks');
                  }
                }}
              >
                <AddIcon />
              </Fab>
            </>
          )}
        </>
      )}
      
      {/* AI Chatbot with Dashboard-specific contextual help */}
      <Chatbot />
      
      {/* Business Tasks Import Dialog */}
      <BusinessTasksImport
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        productUuid={userProducts.length > 0 ? userProducts[0].product_uuid : null}
      />
    </div>
  );
};

export default Dashboard;
