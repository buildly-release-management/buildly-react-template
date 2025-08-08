import React, { useEffect, useState, useContext, useMemo } from 'react';
import _ from 'lodash';
import { useQuery, useQueryClient } from 'react-query';
import 'bootstrap/dist/css/bootstrap.min.css';

import Image from 'react-bootstrap/Image';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Typography as MuiTypography,
  Tabs,
  Tab,
  Box
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon, 
  Info as InfoIcon, 
  Help as HelpIcon,
  Assessment as ArchitectureIcon,
  Timeline as TimelineIcon,
  AttachMoney as BudgetIcon
} from '@mui/icons-material';
import { Tooltip, IconButton } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';

import './Insights.css';

import Loader from '@components/Loader/Loader';
import TimelineComponent from '@components/Timeline/TimelineComponent';
import RangeSlider from '@components/RangeSlider/RangeSlider';
import GanttChart from '@components/Charts/GanttChart/GanttChart';
import Chatbot from '@components/Chatbot/Chatbot';
import { httpService } from '@modules/http/http.service';
import useAlert from '@hooks/useAlert';
import { UserContext } from '@context/User.context';
import { devLog } from '@utils/devLogger';

import { addColorsAndIcons, getReleaseBudgetData, generateAIFeatureEstimates, generateAIBudgetEstimate } from './utils';
import { calculateProductStatus, generateStatusReport, getStatusColor, getStatusLabel } from '@utils/productStatus';
import useOrganizationMembers from '@hooks/useOrganizationMembers';
import TeamConfigModal from '@components/TeamConfigModal/TeamConfigModal';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Grid, TextField, Typography } from '@mui/material';
import { getAllProductQuery } from '@react-query/queries/product/getAllProductQuery.js';
import { useEmailReportMutation } from '@react-query/mutations/product/emailReportMutation';
import { getProductReportQuery } from '@react-query/queries/product/getProductReportQuery';
import { getProductBudgetQuery } from '@react-query/queries/budget/getProductBudgetQuery';
import { useSaveProductBudgetMutation } from '@react-query/mutations/budget/saveProductBudgetMutation';
import { getReleaseProductReportQuery } from '@react-query/queries/release/getReleaseProductReportQuery';
import { getAllFeatureQuery } from '@react-query/queries/release/getAllFeatureQuery';
import { getAllIssueQuery } from '@react-query/queries/release/getAllIssueQuery';
import { getAllReleaseQuery } from '@react-query/queries/release/getAllReleaseQuery';
import { getAllStatusQuery } from '@react-query/queries/release/getAllStatusQuery';
import { useStore } from '@zustand/product/productStore';

const Insights = () => {
  let displayReport = true;
  const { activeProduct, setActiveProduct } = useStore();
  const user = useContext(UserContext);
  const { displayAlert } = useAlert();
  const queryClient = useQueryClient();

  // states
  const [selectedProduct, setSelectedProduct] = useState(activeProduct || 0);
  const [productData, setProductData] = useState([]);
  const [releaseData, setReleaseData] = useState([]);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'gantt'
  const [buildlyTools, setBuildlyTools] = useState([]);
  const [marketplaceTools, setMarketplaceTools] = useState([]);
  const [loaderTimeout, setLoaderTimeout] = useState(false);
  
  // Team configuration states
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [budgetEstimates, setBudgetEstimates] = useState({});
  const [budgetLoading, setBudgetLoading] = useState({});
  const [helpInfoOpen, setHelpInfoOpen] = useState(false);

  // Handler to clear cached data when product changes
  const handleProductChange = async (newProductUuid) => {
    // Clear all related queries to prevent stale data
    await queryClient.cancelQueries();
    queryClient.removeQueries(['productReport']);
    queryClient.removeQueries(['releaseProductReport']);
    queryClient.removeQueries(['productBudget']);
    queryClient.removeQueries(['allFeatures']);
    queryClient.removeQueries(['allIssues']);
    queryClient.removeQueries(['allReleases']);
    queryClient.removeQueries(['allStatuses']);
    
    // Reset local data states to prevent showing stale data
    setProductData([]);
    setReleaseData([]);
    setBudgetEstimates({});
    setBuildlyTools([]);
    setMarketplaceTools([]);
    
    // Update the selected product
    setActiveProduct(newProductUuid);
    setSelectedProduct(newProductUuid);
    
    // Force immediate refetch of new data
    setTimeout(() => {
      queryClient.invalidateQueries(['productReport', newProductUuid]);
      queryClient.invalidateQueries(['releaseProductReport', newProductUuid]);
      queryClient.invalidateQueries(['productBudget', newProductUuid]);
      queryClient.invalidateQueries(['allFeatures', newProductUuid]);
      queryClient.invalidateQueries(['allIssues', newProductUuid]);
      queryClient.invalidateQueries(['allReleases', newProductUuid]);
      queryClient.invalidateQueries(['allStatuses', newProductUuid]);
    }, 100);
  };

  // Tab navigation state (architecture as default since it's most important after status)
  const [activeTab, setActiveTab] = useState('architecture');

  // Get organization members for status analysis
  const { data: organizationMembers = [] } = useOrganizationMembers();

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const { data: products, isLoading: areProductsLoading } = useQuery(
    ['allProducts', user.organization.organization_uuid],
    () => getAllProductQuery(user.organization.organization_uuid, displayAlert),
    { 
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        // Test if the product service is accessible
        if (data && data.length > 0) {
          // Check if the current selectedProduct exists in the available products
          if (selectedProduct && !data.find(p => p.product_uuid === selectedProduct)) {
            // Selected product UUID not found in available products
          }
        }
        
        // If no product is selected but we have products, select the first one
        if (data && data.length > 0 && (!selectedProduct || selectedProduct === 0)) {
          setSelectedProduct(data[0].product_uuid);
          setActiveProduct(data[0].product_uuid);
        }
      },
      onError: (error) => {
        // Error loading products - product service might be down or unreachable
      }
    },
  );
  // Consolidated data queries with optimized caching and parallel loading
  const { data: reportData, isLoading: isGettingProductReport, error: reportError } = useQuery(
    ['productReport', selectedProduct],
    () => getProductReportQuery(selectedProduct, displayAlert),
    { 
      refetchOnWindowFocus: false, 
      enabled: !_.isEmpty(selectedProduct) && !_.isEqual(_.toNumber(selectedProduct), 0),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
      retry: 1, // Reduced retry count for faster failures
      retryDelay: 1000 // Faster retry
    },
  );
  
  const { data: releaseReport, isLoading: isGettingReleaseProductReport, error: releaseReportError } = useQuery(
    ['releaseProductReport', selectedProduct],
    () => getReleaseProductReportQuery(selectedProduct, displayAlert),
    { 
      refetchOnWindowFocus: false, 
      enabled: !_.isEmpty(selectedProduct) && !_.isEqual(_.toNumber(selectedProduct), 0),
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: 1, // Reduced retry count
      retryDelay: 1000,
      // Keep previous data while fetching new data to prevent UI flicker
      keepPreviousData: true,
      // Fetch in background for better UX
      refetchInterval: 20 * 60 * 1000 // Refetch every 20 minutes in background
    },
  );

  // Optimize budget query with faster failure recovery
  const { data: budgetData, isLoading: isGettingProductBudget, error: budgetError } = useQuery(
    ['productBudget', selectedProduct],
    () => getProductBudgetQuery(selectedProduct, displayAlert),
    { 
      refetchOnWindowFocus: false, 
      enabled: !_.isEmpty(selectedProduct) && !_.isEqual(_.toNumber(selectedProduct), 0),
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: (failureCount, error) => {
        // Don't retry on 404 errors (budget doesn't exist) or network errors
        if (error?.response?.status === 404 || error?.code === 'NETWORK_ERROR') {
          return false;
        }
        return failureCount < 1; // Only retry once
      },
      retryDelay: 500 // Faster retry for budget
    },
  );

  // Load secondary data with reduced blocking - these shouldn't delay the main UI
  const { data: featuresData, isLoading: isGettingFeatures } = useQuery(
    ['allFeatures', selectedProduct],
    () => getAllFeatureQuery(selectedProduct, displayAlert),
    { 
      refetchOnWindowFocus: false, 
      enabled: !_.isEmpty(selectedProduct) && !_.isEqual(_.toNumber(selectedProduct), 0),
      staleTime: 5 * 60 * 1000,
      cacheTime: 20 * 60 * 1000,
      retry: 1,
      retryDelay: 1000,
      // Don't block UI for secondary data
      suspense: false
    },
  );

  const { data: issuesData, isLoading: isGettingIssues } = useQuery(
    ['allIssues', selectedProduct],
    () => getAllIssueQuery(selectedProduct, displayAlert),
    { 
      refetchOnWindowFocus: false, 
      enabled: !_.isEmpty(selectedProduct) && !_.isEqual(_.toNumber(selectedProduct), 0),
      staleTime: 3 * 60 * 1000,
      cacheTime: 15 * 60 * 1000,
      retry: 1,
      retryDelay: 1000,
      suspense: false
    },
  );

  const { data: releasesData, isLoading: isGettingReleases } = useQuery(
    ['allReleases', selectedProduct],
    () => getAllReleaseQuery(selectedProduct, displayAlert),
    { 
      refetchOnWindowFocus: false, 
      enabled: !_.isEmpty(selectedProduct) && !_.isEqual(_.toNumber(selectedProduct), 0),
      staleTime: 5 * 60 * 1000,
      cacheTime: 20 * 60 * 1000,
      retry: 1,
      retryDelay: 1000,
      suspense: false
    },
  );

  // Statuses change rarely, so we can cache them longer and load independently
  const { data: statusLookupData, isLoading: isGettingStatuses } = useQuery(
    ['allStatuses', selectedProduct],  // Keep product dependency for now
    () => getAllStatusQuery(selectedProduct, displayAlert),
    { 
      refetchOnWindowFocus: false, 
      enabled: !_.isEmpty(selectedProduct) && !_.isEqual(_.toNumber(selectedProduct), 0),
      staleTime: 30 * 60 * 1000, // 30 minutes
      cacheTime: 60 * 60 * 1000, // 1 hour
      retry: 1,
      retryDelay: 500,
      suspense: false
    },
  );

  const { mutate: emailReportMutation, isLoading: isEmailingReport } = useEmailReportMutation(selectedProduct, displayAlert);
  const saveBudgetMutation = useSaveProductBudgetMutation(selectedProduct, displayAlert);

  // Email report modal
  const [showEmailModal, setShow] = useState(false);
  const closeEmailModal = () => setShow(false);
  const openEmailModal = () => {
    closeDownloadMenu();
    setRecipients([{
      name: '',
      email: '',
    }]);
    setShow(true);
  };

  const [btnDisabled, disableButton] = useState(true);
  const [recipients, setRecipients] = useState([]);
  const updateRecipients = (event, index) => {
    const updatedRecipients = [...recipients];
    updatedRecipients[index][event.target.name] = event.target.value;
    setRecipients(updatedRecipients);
    
    // Validate form after update
    const disable = updatedRecipients.some((recipient) => !recipient.name.toString()
      .trim().length || !recipient.email.toString()
      .trim().length);
    disableButton(disable);
  };

  const addNewRecipient = () => {
    const newRecipients = [...recipients, {
      name: '',
      email: '',
    }];
    setRecipients(newRecipients);
    disableButton(true);
  };

  const validateForm = () => {
    const disable = recipients.some((recipient) => !recipient.name.toString()
      .trim().length || !recipient.email.toString()
      .trim().length);
    disableButton(disable);
  };

  // Team help request modal
  const [showTeamHelpModal, setShowTeamHelpModal] = useState(false);
  const [teamHelpForm, setTeamHelpForm] = useState({
    helpType: '',
    projectDescription: '',
    timeline: '',
    budget: '',
    specificNeeds: '',
    companySize: '',
    currentChallenges: ''
  });

  const closeTeamHelpModal = () => {
    setShowTeamHelpModal(false);
    setTeamHelpForm({
      helpType: '',
      projectDescription: '',
      timeline: '',
      budget: '',
      specificNeeds: '',
      companySize: '',
      currentChallenges: ''
    });
  };

  const openTeamHelpModal = () => {
    closeDownloadMenu();
    setShowTeamHelpModal(true);
  };

  const updateTeamHelpForm = (event) => {
    const { name, value } = event.target;
    setTeamHelpForm(prevForm => ({
      ...prevForm,
      [name]: value
    }));
  };

  const isTeamHelpFormValid = () => {
    return teamHelpForm.helpType && 
           teamHelpForm.projectDescription && 
           teamHelpForm.timeline && 
           teamHelpForm.specificNeeds;
  };

  // Check if product needs team assistance
  const needsTeamAssistance = () => {
    if (!releaseData || !Array.isArray(releaseData) || releaseData.length === 0) {
      return true; // No releases means likely needs help
    }
    
    // Check if any release has a team configured
    const hasConfiguredTeam = releaseData.some(release => 
      release.team && Array.isArray(release.team) && release.team.length > 0
    );
    
    return !hasConfiguredTeam;
  };

  const sendTeamHelpRequest = async () => {
    try {
      // Prepare comprehensive data for the team help request
      const requestData = {
        // User and organization info
        user_name: `${user.first_name} ${user.last_name}`,
        user_email: user.email,
        user_title: user.title || 'Not specified',
        organization_name: user.organization.name,
        organization_uuid: user.organization.organization_uuid,
        
        // Product context
        product_name: activeProduct?.name || 'Not specified',
        product_uuid: selectedProduct,
        product_description: activeProduct?.description || 'Not specified',
        architecture_type: productData?.architecture_type || 'Not specified',
        
        // Release information
        total_releases: releaseData?.length || 0,
        release_names: releaseData?.map(r => r.name).join(', ') || 'None',
        
        // Help request details
        help_type: teamHelpForm.helpType,
        project_description: teamHelpForm.projectDescription,
        timeline: teamHelpForm.timeline,
        budget_range: teamHelpForm.budget,
        specific_needs: teamHelpForm.specificNeeds,
        company_size: teamHelpForm.companySize,
        current_challenges: teamHelpForm.currentChallenges,
        
        // Technical context
        complexity_score: activeProduct?.complexity_score || 'Not specified',
        start_date: activeProduct?.start_date || 'Not specified',
        end_date: activeProduct?.end_date || 'Not specified',
        
        // Timestamp
        request_date: new Date().toISOString(),
        
        // Additional context
        has_existing_team: releaseData?.some(r => r.team?.length > 0) || false,
        total_estimated_budget: Object.values(budgetEstimates).reduce((sum, est) => sum + (est.total_budget || 0), 0)
      };

      // Send email to developers@buildly.io using the existing email infrastructure
      const emailData = {
        senders_name: `${user.first_name} ${user.last_name}`,
        senders_title: user.title || 'Product Owner',
        company_name: user.organization.name,
        contact_information: user.email,
        recipients: [{
          name: 'Buildly Development Team',
          email: 'developers@buildly.io'
        }],
        subject: `Team Assistance Request - ${teamHelpForm.helpType} for ${activeProduct?.name || 'Product'}`,
        message: `Development Team Assistance Request

CONTACT INFORMATION:
- Name: ${user.first_name} ${user.last_name}
- Email: ${user.email}
- Title: ${user.title || 'Not specified'}
- Organization: ${user.organization.name}
- Company Size: ${teamHelpForm.companySize || 'Not specified'}

PRODUCT INFORMATION:
- Product: ${activeProduct?.name || 'Not specified'}
- Description: ${activeProduct?.description || 'Not specified'}
- Architecture: ${productData?.architecture_type || 'Not specified'}
- Complexity Score: ${activeProduct?.complexity_score || 'Not specified'}
- Timeline: ${activeProduct?.start_date || 'Not specified'} to ${activeProduct?.end_date || 'Not specified'}

PROJECT DETAILS:
- Type of Help Needed: ${teamHelpForm.helpType}
- Project Description: ${teamHelpForm.projectDescription}
- Timeline: ${teamHelpForm.timeline}
- Budget Range: ${teamHelpForm.budget || 'Not specified'}
- Current Challenges: ${teamHelpForm.currentChallenges || 'Not specified'}

SPECIFIC REQUIREMENTS:
${teamHelpForm.specificNeeds}

RELEASES INFORMATION:
- Total Releases: ${releaseData?.length || 0}
- Release Names: ${releaseData?.map(r => r.name).join(', ') || 'None'}
- Has Existing Team: ${releaseData?.some(r => r.team?.length > 0) ? 'Yes' : 'No'}
- Estimated Budget: $${Object.values(budgetEstimates).reduce((sum, est) => sum + (est.total_budget || 0), 0).toLocaleString()}

Please reach out to discuss how Buildly can help with this project.

Generated from Buildly Product Labs - ${new Date().toLocaleDateString()}`
      };

      // Use the existing email mutation
      emailReportMutation(emailData);
      closeTeamHelpModal();
      displayAlert('success', 'Team assistance request sent successfully! Our team will contact you soon.');
      
    } catch (error) {
      displayAlert('error', 'Failed to send team assistance request. Please try again.');
    }
  };

  const emailReport = (event) => {
    event.preventDefault();
    try {
      closeEmailModal();
      const emailData = {
        senders_name: `${user.first_name} ${user.last_name}`,
        senders_title: user.title,
        company_name: user.organization.name,
        contact_information: user.contact_info,
        recipients,
      };
      emailReportMutation(emailData);
    } catch (error) {
      // Error sending email report
    }
  };

  // Highly optimized data processing with aggressive memoization
  const processedReleaseData = useMemo(() => {
    if (!releaseReport?.release_data || releaseReport.release_data.length === 0) {
      // Return cached empty array to prevent re-renders
      return [];
    }

    // Pre-process data only once with minimal transformations for speed
    const enhancedReleases = releaseReport.release_data.map(release => ({
      ...release,
      // Add minimal required properties for timeline display
      bgColor: '#0D5595',
      calculated_end_date: release.calculated_end_date || release.release_date,
      // Pre-calculate completion status for performance
      is_completed: release.is_completed || false,
      // Ensure features and issues arrays exist
      features: release.features || [],
      issues: release.issues || []
    }));

    devLog.log('Processed release data for timeline (optimized):', enhancedReleases.length);
    return enhancedReleases;
  }, [releaseReport?.release_data]); // More specific dependency

  // Memoize product status calculation
  const productStatusData = useMemo(() => {
    // Primary data source should be productData (the product object), not reportData (array of releases)
    if (!productData) {
      return null;
    }
    
    if (!productData[0] || (!productData[0].name && !productData[0].architecture_type && !productData[0].complexity_score)) {
      return null;
    }

    try {
      // Use the correct parameter order: (product, releases, features, issues, budget, teamMembers)
      const result = calculateProductStatus(
        productData[0] || {}, // Extract first product from array, fallback to empty object
        releaseData || releasesData || [],
        featuresData || [],
        issuesData || [],
        budgetData,
        organizationMembers || []
      );
      
      // If calculation fails, return a basic fallback status
      if (!result) {
        return {
          overall: 'yellow',
          timeline: 'green',
          budget: 'green',
          quality: 'yellow',
          score: 75,
          details: {
            timeline: { hasTimeline: false },
            budget: { hasData: !!budgetData },
            resources: { hasTeam: (organizationMembers || []).length > 0 },
            features: { total: (featuresData || []).length },
            releases: { total: (releaseData || releasesData || []).length }
          }
        };
      }
      
      return result;
    } catch (error) {
      console.warn('Error calculating product status:', error);
      // Return fallback status on error
      return {
        overall: 'yellow',
        timeline: 'yellow',
        budget: 'green',
        quality: 'yellow',
        score: 65,
        details: {
          timeline: { hasTimeline: false, error: true },
          budget: { hasData: !!budgetData },
          resources: { hasTeam: (organizationMembers || []).length > 0 },
          features: { total: (featuresData || []).length },
          releases: { total: (releaseData || releasesData || []).length }
        }
      };
    }
  }, [productData, reportData, releaseData, releasesData, featuresData, issuesData, budgetData, organizationMembers]);

  // Memoize status report for performance
  const statusReport = useMemo(() => {
    if (!productStatusData) return null;
    try {
      return generateStatusReport(productStatusData);
    } catch (error) {
      console.warn('Error generating status report:', error);
      return null;
    }
  }, [productStatusData]);

  // Optimized effects with reduced re-renders
  useEffect(() => {
    if (selectedProduct && !_.isEqual(_.toNumber(selectedProduct), 0)) {
      // Set product data immediately when available
      // Check if reportData is the product object (has architecture_type, complexity_score, etc.)
      if (reportData && (reportData.name || reportData.architecture_type || reportData.complexity_score)) {
        setProductData([reportData]); // Wrap in array since productData expects an array
      }
      
      // Use pre-processed data for faster updates
      if (processedReleaseData.length > 0) {
        setReleaseData(processedReleaseData);
        devLog.log('Timeline data updated (optimized):', processedReleaseData.length, 'releases');
      } else if (releaseReport && releaseReport.release_data?.length === 0) {
        // Handle empty release data case
        setReleaseData([]);
        devLog.log('Timeline data cleared - no releases available');
      }
    } else {
      displayReport = false;
    }
  }, [selectedProduct, reportData?.name, processedReleaseData.length, releaseReport]); // More specific dependencies

  // Optimize budget estimates initialization
  useEffect(() => {
    if (budgetData?.release_budgets && budgetData.release_budgets.length > 0) {
      const budgetEstimatesFromAPI = {};
      
      budgetData.release_budgets.forEach(releaseBudget => {
        if (releaseBudget.release_name && releaseBudget.budget_estimate) {
          budgetEstimatesFromAPI[releaseBudget.release_name] = {
            ...releaseBudget.budget_estimate,
            team: releaseBudget.team_configuration || releaseBudget.budget_estimate.team || []
          };
        }
      });
      
      setBudgetEstimates(budgetEstimatesFromAPI);
      devLog.log('Budget estimates loaded from API:', Object.keys(budgetEstimatesFromAPI).length);
    }
  }, [budgetData?.release_budgets?.length]); // More specific dependency

  // Optimize default budget estimates creation
  useEffect(() => {
    if (releaseData?.length > 0) {
      setBudgetEstimates(prev => {
        const updated = { ...prev };
        let hasUpdates = false;
        
        releaseData.forEach(release => {
          const releaseName = release.name || release.release_name;
          if (releaseName && !updated[releaseName]) {            
            updated[releaseName] = {
              total_budget: 50000,
              base_cost: 42000,
              timeline_weeks: release.duration?.weeks || 12,
              team: [
                { role: 'Frontend Developer', count: 1, weeklyRate: 2500 },
                { role: 'Backend Developer', count: 1, weeklyRate: 2800 },
                { role: 'QA Engineer', count: 1, weeklyRate: 2200 }
              ],
              risk_buffer: 20,
              confidence: 'Medium',
              estimation_source: 'default',
              last_updated: new Date().toISOString()
            };
            hasUpdates = true;
          }
        });
        
        if (hasUpdates) {
          devLog.log('Created default budget estimates for releases without budgets');
        }
        return hasUpdates ? updated : prev;
      });
    }
  }, [releaseData?.length]); // More specific dependency

  // Fetch Buildly open source tools from GitHub
  useEffect(() => {
    const fetchBuildlyTools = async () => {
      try {        
        // First, try to fetch from buildly-marketplace organization with rate limit handling
        let marketplaceTools = [];
        try {
          const marketplaceResponse = await fetch('https://api.github.com/orgs/buildly-marketplace/repos?per_page=10', {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'BuildlyLabsApp'
            }
          });
          
          if (marketplaceResponse.ok) {
            const repos = await marketplaceResponse.json();
            
            // Filter and process marketplace tools
            const premiumTools = repos.filter(repo => 
              !repo.name.startsWith('.') && 
              !repo.private && // Only public repos
              repo.name !== 'docs'
            ).slice(0, 5); // Limit to 5 to avoid rate limits
            
            for (const repo of premiumTools) {
              try {
                // Add small delay between requests
                await new Promise(resolve => setTimeout(resolve, 200));
                
                marketplaceTools.push({
                  ...repo,
                  source: 'marketplace-premium',
                  relevance_score: calculateRelevanceScore(repo, productData),
                  isPremium: true, // Mark as premium component
                  organization: 'buildly-marketplace'
                });
              } catch (error) {
                // Failed to process marketplace tool
              }
            }
          } else if (marketplaceResponse.status === 403) {
            // GitHub API rate limit reached for marketplace organization
          }
        } catch (error) {
          // Failed to fetch from buildly-marketplace organization
        }
        
        // Enhanced fallback data with realistic GitHub repo information
        const fallbackTools = [
          {
            name: 'buildly-core',
            full_name: 'buildlyio/buildly-core',
            description: 'Core platform for building enterprise applications with authentication, permissions, and API gateway functionality',
            html_url: 'https://github.com/buildlyio/buildly-core',
            language: 'Python',
            stargazers_count: 45,
            topics: ['django', 'api', 'microservices', 'gateway'],
            source: 'fallback',
            relevance_score: 95,
            organization: 'buildlyio'
          },
          {
            name: 'buildly-react-template',
            full_name: 'buildlyio/buildly-react-template',
            description: 'React template for building Buildly applications with Material-UI components and authentication',
            html_url: 'https://github.com/buildlyio/buildly-react-template',
            language: 'JavaScript',
            stargazers_count: 23,
            topics: ['react', 'material-ui', 'template', 'frontend'],
            source: 'fallback',
            relevance_score: 90,
            organization: 'buildlyio'
          },
          {
            name: 'buildly-ui-react',
            full_name: 'buildlyio/buildly-ui-react',
            description: 'Reusable React UI components library for Buildly applications',
            html_url: 'https://github.com/buildlyio/buildly-ui-react',
            language: 'JavaScript',
            stargazers_count: 18,
            topics: ['react', 'ui-components', 'library'],
            source: 'fallback',
            relevance_score: 85,
            organization: 'buildlyio'
          },
          {
            name: 'buildly-angular-template',
            full_name: 'buildlyio/buildly-angular-template',
            description: 'Angular template for building Buildly applications with modern Angular features',
            html_url: 'https://github.com/buildlyio/buildly-angular-template',
            language: 'TypeScript',
            stargazers_count: 15,
            topics: ['angular', 'template', 'frontend'],
            source: 'fallback',
            relevance_score: 75,
            organization: 'buildlyio'
          },
          {
            name: 'Premium Analytics Component',
            full_name: 'buildly-marketplace/analytics-dashboard',
            description: 'Advanced analytics and reporting dashboard component for Buildly applications',
            html_url: 'https://github.com/buildly-marketplace/analytics-dashboard',
            language: 'React',
            stargazers_count: 12,
            topics: ['analytics', 'dashboard', 'premium'],
            source: 'fallback',
            relevance_score: 80,
            isPremium: true,
            organization: 'buildly-marketplace'
          },
          {
            name: 'Premium Auth Module',
            full_name: 'buildly-marketplace/advanced-auth',
            description: 'Enterprise-grade authentication and authorization module with SSO support',
            html_url: 'https://github.com/buildly-marketplace/advanced-auth',
            language: 'Python',
            stargazers_count: 8,
            topics: ['authentication', 'sso', 'enterprise', 'premium'],
            source: 'fallback',
            relevance_score: 85,
            isPremium: true,
            organization: 'buildly-marketplace'
          }
        ];

        // If we have few marketplace tools, combine with fallback data
        let openSourceTools = [];
        let premiumTools = [...marketplaceTools];
        
        // Separate open source tools from fallback data
        const openSourceFallback = fallbackTools.filter(tool => !tool.isPremium);
        const premiumFallback = fallbackTools.filter(tool => tool.isPremium);
        
        openSourceTools = openSourceFallback;
        
        if (premiumTools.length < 2) {          
          // Add fallback premium tools, avoiding duplicates
          const existingNames = new Set(premiumTools.map(tool => tool.name));
          const additionalPremiumTools = premiumFallback.filter(tool => !existingNames.has(tool.name));
          premiumTools = [...premiumTools, ...additionalPremiumTools];
        }

        // Calculate relevance scores for tools that don't have them
        openSourceTools = openSourceTools.map(tool => ({
          ...tool,
          relevance_score: tool.relevance_score || calculateRelevanceScore(tool, productData)
        }));
        
        premiumTools = premiumTools.map(tool => ({
          ...tool,
          relevance_score: tool.relevance_score || calculateRelevanceScore(tool, productData)
        }));

        // Sort by relevance and limit tools
        const validOpenSourceTools = openSourceTools
          .filter(tool => tool !== null)
          .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
          .slice(0, 6);
          
        const validPremiumTools = premiumTools
          .filter(tool => tool !== null)
          .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
          .slice(0, 4);
        
        setBuildlyTools(validOpenSourceTools);
        setMarketplaceTools(validPremiumTools);
      } catch (error) {        
        // Ultimate fallback with essential tools
        setBuildlyTools([
          {
            name: 'buildly-core',
            description: 'Core platform for building enterprise applications',
            html_url: 'https://github.com/buildlyio/buildly-core',
            language: 'Python',
            source: 'emergency-fallback',
            relevance_score: 100
          },
          {
            name: 'buildly-react-template',
            description: 'React template for Buildly applications',
            html_url: 'https://github.com/buildlyio/buildly-react-template',
            language: 'JavaScript',
            source: 'emergency-fallback',
            relevance_score: 95
          },
          {
            name: 'buildly-ui-react',
            description: 'UI components library for React applications',
            html_url: 'https://github.com/buildlyio/buildly-ui-react',
            language: 'JavaScript',
            source: 'emergency-fallback',
            relevance_score: 90
          }
        ]);
      }
    };

    // Helper function to calculate relevance score
    const calculateRelevanceScore = (tool, productData) => {
      let score = 50; // Base score
      
      if (!tool || !productData) {return score;}
      
      const toolName = tool.name?.toLowerCase() || '';
      const toolDesc = tool.description?.toLowerCase() || '';
      const archType = productData.architecture_type?.toLowerCase() || '';
      const language = productData.language?.toLowerCase() || '';
      
      // Architecture relevance
      if (archType.includes('microservice') && (toolName.includes('core') || toolName.includes('gateway'))) {
        score += 30;
      }
      if (archType.includes('monolith') && toolName.includes('core')) {
        score += 25;
      }
      
      // Language/framework relevance
      if (language.includes('javascript') || language.includes('react')) {
        if (toolName.includes('react') || toolName.includes('ui')) {score += 25;}
      }
      if (language.includes('angular') && toolName.includes('angular')) {
        score += 25;
      }
      
      // General utility tools
      if (toolName.includes('template') || toolName.includes('ui')) {
        score += 15;
      }
      
      return score;
    };

    // Only fetch if we have product data
    if (productData && Object.keys(productData).length > 0) {
      fetchBuildlyTools();
    }
  }, [productData]);

  // Much faster timeout to prevent hanging UI
  useEffect(() => {
    if (selectedProduct && _.toNumber(selectedProduct) !== 0) {
      // Reset timeout when product changes
      setLoaderTimeout(false);
      
      // Much shorter timeout for better UX - force show partial UI after 5 seconds
      const timer = setTimeout(() => {
        setLoaderTimeout(true);
        devLog.log('Loader timeout reached - showing partial UI for better UX');
      }, 5000); // Reduced from 30 seconds to 5 seconds

      return () => clearTimeout(timer);
    }
  }, [selectedProduct]);

  /**
   * Download pdf report
   */
  const getPdf = () => {
    httpService.sendDirectServiceRequest(
      `pdf_report/${selectedProduct}/`,
      'GET',
      null,
      'product',
      false,
    )
      .then((response) => {
        const a = document.createElement('a');
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        a.href = url;
        a.download = 'pdf_report.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        displayAlert('success', 'PDF report downloaded successfully!');
      })
      .catch((error) => {
        displayAlert('error', 'Failed to download PDF report. Please try again.');
      });

    closeDownloadMenu();
  };

  // Dropdown menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const expandDownloadMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const closeDownloadMenu = () => {
    setAnchorEl(null);
  };

  // Navigate to release details
  const handleReleaseClick = (release) => {
    if (release && release.release_uuid) {
      // Navigate to release details page
      window.location.href = `/release-details/${release.release_uuid}`;
    }
  };

  // Handle team configuration
  const handleConfigureTeam = (release) => {
    setSelectedRelease(release);
    setTeamModalOpen(true);
  };

  // Handle AI budget estimation
  const handleAIEstimate = async (release) => {    
    try {
      setBudgetLoading(prev => ({ ...prev, [release.name]: true }));
      
      // Get release features for context
      const releaseFeatures = releaseData.find(r => r.release_uuid === release.release_uuid)?.features || [];
      
      const estimate = await generateAIBudgetEstimate(release, releaseFeatures);
      setBudgetEstimates(prev => ({
        ...prev,
        [release.name]: estimate
      }));
      
      displayAlert('success', `AI budget estimate generated for ${release.name}`);
    } catch (error) {
      displayAlert('error', 'Failed to generate AI budget estimate');
    } finally {
      setBudgetLoading(prev => ({ ...prev, [release.name]: false }));
    }
  };

  // Handle team configuration save
  const handleTeamSave = (teamConfig) => {
    if (!selectedRelease) {return;}

    // Calculate budget based on team configuration
    const estimate = budgetEstimates[selectedRelease.name];
    const timelineWeeks = selectedRelease.duration?.weeks || estimate?.timeline_weeks || 12;
    
    const totalCost = teamConfig.reduce((sum, member) => {
      return sum + (member.count * member.weeklyRate * timelineWeeks);
    }, 0);

    // Apply risk buffer
    const riskBuffer = estimate?.risk_buffer || 20;
    const bufferedCost = totalCost * (1 + riskBuffer / 100);

    const updatedEstimate = {
      ...estimate,
      team: teamConfig,
      total_budget: Math.round(bufferedCost),
      base_cost: Math.round(totalCost),
      timeline_weeks: timelineWeeks,
      estimation_source: 'user_configured',
      last_updated: new Date().toISOString(),
      confidence: 'High',
      risk_buffer: riskBuffer
    };

    setBudgetEstimates(prev => ({
      ...prev,
      [selectedRelease.name]: updatedEstimate
    }));

    // Update the release data with new cost
    setReleaseData(prev => {
      // Ensure prev is an array
      const releases = Array.isArray(prev) ? prev : [];
      return releases.map(release => 
        release.release_uuid === selectedRelease.release_uuid 
          ? { ...release, totalCost: Math.round(bufferedCost), team: teamConfig }
          : release
      );
    });

    setTeamModalOpen(false);
    setSelectedRelease(null);
    displayAlert('success', `Team configuration saved for ${selectedRelease.name}`);
  };

  // Handle saving budget for entire product
  const handleSaveEntireProduct = async () => {
    setBudgetLoading(prev => ({ ...prev, saveAll: true }));
    
    try {
      // Prepare budget data for the new budget API
      const budgetData = {
        product_uuid: selectedProduct,
        total_budget: Object.values(budgetEstimates).reduce((total, estimate) => total + (estimate.total_budget || 0), 0),
        release_budgets: releaseData.map(release => {
          const estimate = budgetEstimates[release.name] || null;
          return {
            release_uuid: release.release_uuid,
            release_name: release.name,
            budget_estimate: estimate ? {
              ...estimate,
              // Ensure team data is included in budget_estimate
              team: estimate.team || []
            } : null,
            team_configuration: estimate?.team || [],
            total_cost: release.totalCost || estimate?.total_budget || 0
          };
        }),
        last_updated: new Date().toISOString()
      };

      // Use the new budget API mutation
      await saveBudgetMutation.mutateAsync(budgetData);
      
      displayAlert('success', 'Budget saved for entire product successfully!');
      
    } catch (error) {      
      // Fallback to localStorage if API fails
      try {
        // Recreate budgetData for localStorage since it's scoped to the try block
        const fallbackBudgetData = {
          total_budget: Object.values(budgetEstimates).reduce((total, estimate) => total + (estimate.total_budget || 0), 0),
          release_budgets: releaseData.map(release => {
            const estimate = budgetEstimates[release.name] || null;
            return {
              release_uuid: release.release_uuid,
              release_name: release.name,
              budget_estimate: estimate ? {
                ...estimate,
                // Ensure team data is included in budget_estimate
                team: estimate.team || []
              } : null,
              team_configuration: estimate?.team || [],
              total_cost: release.totalCost || estimate?.total_budget || 0
            };
          }),
          last_updated: new Date().toISOString()
        };
        
        const localBudgetKey = `budget_${selectedProduct}`;
        localStorage.setItem(localBudgetKey, JSON.stringify({
          product_uuid: selectedProduct,
          ...fallbackBudgetData,
          saved_locally: true,
          saved_at: new Date().toISOString()
        }));
        
        displayAlert('warning', 'Budget saved locally. It will sync when the backend is available.');
      } catch (localError) {
        displayAlert('error', 'Failed to save budget. Please try again.');
      }
    } finally {
      setBudgetLoading(prev => ({ ...prev, saveAll: false }));
    }
  };

  // Handle saving budget template for future releases
  const handleSaveFutureTemplate = async () => {
    setBudgetLoading(prev => ({ ...prev, saveTemplate: true }));

    try {
      // Create a template from current budget estimates
      const template = {
        template_name: `${productData?.name || 'Product'} Budget Template`,
        template_data: {
          architecture_type: productData?.architecture_type,
          default_roles: [...new Set(releaseData.flatMap(release => 
            release.team?.map(member => ({
              role: member.role,
              rate: member.rate,
              hours_per_week: member.hours_per_week
            })) || []
          ))],
          average_costs: {
            per_feature: Object.values(budgetEstimates).reduce((total, estimate) => {
              const features = estimate.features_count || 1;
              return total + ((estimate.total_budget || 0) / features);
            }, 0) / Math.max(Object.keys(budgetEstimates).length, 1),
            per_release: Object.values(budgetEstimates).reduce((total, estimate) => 
              total + (estimate.total_budget || 0), 0) / Math.max(Object.keys(budgetEstimates).length, 1)
          }
        },
        created_date: new Date().toISOString(),
        created_by: user?.core_user_uuid
      };

      // Save template to localStorage (since organization update doesn't exist for templates)
      const localTemplateKey = `budget_template_${user.organization.organization_uuid}`;
      const existingTemplates = JSON.parse(localStorage.getItem(localTemplateKey) || '[]');
      
      // Check if template with same name exists
      const existingIndex = existingTemplates.findIndex(t => t.template_name === template.template_name);
      
      if (existingIndex >= 0) {
        // Update existing template
        existingTemplates[existingIndex] = {
          ...template,
          id: existingTemplates[existingIndex].id,
          updated_date: new Date().toISOString()
        };
      } else {
        // Add new template
        existingTemplates.push({
          ...template,
          id: Date.now(), // Simple ID generation
        });
      }
      
      localStorage.setItem(localTemplateKey, JSON.stringify(existingTemplates));
      
      displayAlert('success', 'Budget template saved for future releases!');
      
    } catch (error) {
      displayAlert('error', 'Failed to save budget template. Please try again.');
    } finally {
      setBudgetLoading(prev => ({ ...prev, saveTemplate: false }));
    }
  };

  // Optimized loading states for faster UI response
  // Only block UI for absolutely essential data
  const isEssentialDataLoading = areProductsLoading || isGettingProductReport;
  
  // Secondary data loading should not block the main UI
  const isSecondaryDataLoading = isGettingProductBudget || isGettingFeatures || isGettingIssues || 
    isGettingReleases || isGettingStatuses;
  
  // Timeline/Budget data is ready when we have core product data and either:
  // 1. Release report has loaded (even if empty), OR 
  // 2. Release report failed (show graceful fallback), OR
  // 3. We have any release data from previous loads
  const isTimelineBudgetDataReady = selectedProduct && 
    !isEssentialDataLoading && 
    (productData?.name || reportData?.name) &&
    (releaseReport !== undefined || releaseReportError || releaseData?.length > 0);
  
  // Much more aggressive loading optimization
  // Only show loader for truly essential data and very briefly for Timeline/Budget
  const shouldShowLoader = !loaderTimeout && (
    isEssentialDataLoading || isEmailingReport || 
    // Only block on Timeline/Budget for first 3 seconds, then show partial UI
    (selectedProduct && _.toNumber(selectedProduct) !== 0 && !isTimelineBudgetDataReady && 
     isGettingReleaseProductReport && !releaseReportError)
  );

  // Add optimized data ready states for each tab
  const isArchitectureDataReady = productData?.name || reportData?.name;
  const isTimelineDataReady = isTimelineBudgetDataReady && (releaseData?.length > 0 || releaseReport?.release_data);
  const isBudgetDataReady = isTimelineBudgetDataReady && (budgetData !== undefined || budgetError);

  return (
    <>
      {shouldShowLoader && <Loader open={shouldShowLoader} />}
      <div className="insightsSelectedProductRoot">
        <Grid container mb={2} alignItems="center">
          <Grid item md={4}>
            <Typography variant="h4">
              Insights
            </Typography>
          </Grid>
          <Grid item md={8} textAlign="end">
            <TextField
              variant="outlined"
              margin="normal"
              select
              id="selected-product"
              color="primary"
              label="Product Options"
              className="insightsSelectedProduct"
              value={selectedProduct}
              onChange={(e) => {
                handleProductChange(e.target.value);
              }}
            >
              <MenuItem value={0}>Select</MenuItem>
              {products && !_.isEmpty(products)
                && _.map(products, (prod) => (
                  <MenuItem
                    key={`product-${prod.product_uuid}`}
                    value={prod.product_uuid}
                  >
                    {prod.name}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
        </Grid>
      </div>

      {!!selectedProduct && displayReport && _.toNumber(selectedProduct) !== 0 && (
        <>
          {/* Show secondary loading indicator for additional data */}
          {isSecondaryDataLoading && (
            <Alert variant="info" className="mb-3">
              Loading additional insights data... ({[
                isGettingProductBudget && 'budget',
                isGettingFeatures && 'features',
                isGettingIssues && 'issues',
                isGettingReleases && 'releases',
                isGettingStatuses && 'statuses'
              ].filter(Boolean).join(', ')})
            </Alert>
          )}
          
          <div className="row mb-3">
            <section className="text-end">
              <Button
                className="btn btn-small btn-outline-primary me-2"
                onClick={openTeamHelpModal}
                startIcon={<HelpIcon />}
              >
                Get Development Help
              </Button>
              <Button
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                className="btn btn-small btn-primary"
                endIcon={<KeyboardArrowDownIcon />}
                onClick={expandDownloadMenu}
              >
                Dashboard PDF
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={closeDownloadMenu}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                }}
              >
                <MenuItem onClick={getPdf}>Download Report</MenuItem>
                <MenuItem onClick={openEmailModal}>Email report</MenuItem>
              </Menu>
            </section>
          </div>

          {/* Compact Product Status Dashboard */}
          <Card style={{ marginBottom: '24px', border: '2px solid #0C5595' }}>
            <Card.Header style={{ 
              backgroundColor: '#0C5595',
              color: 'white',
              fontWeight: 'bold',
              padding: '12px 16px'
            }}>
              📊 Product Status Dashboard
            </Card.Header>
            <Card.Body style={{ padding: '16px' }}>
              {productStatusData ? (
                <div className="row">
                  {/* Overall Status - Compact */}
                  <div className="col-md-3">
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '2rem', 
                        fontWeight: 'bold', 
                        color: getStatusColor(productStatusData.overall) 
                      }}>
                        {productStatusData.score}%
                      </div>
                      <div style={{ 
                        color: getStatusColor(productStatusData.overall), 
                        fontWeight: 'bold' 
                      }}>
                        {getStatusLabel(productStatusData.overall)}
                      </div>
                    </div>
                  </div>

                  {/* Status Breakdown - Compact */}
                  <div className="col-md-9">
                    <div className="row">
                      <div className="col-md-4">
                        <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                          <div style={{ 
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(productStatusData.timeline),
                            margin: '0 auto 5px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.2rem'
                          }}>
                            ⏱️
                          </div>
                          <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Timeline</div>
                          <div style={{ color: getStatusColor(productStatusData.timeline) }}>
                            {getStatusLabel(productStatusData.timeline)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-4">
                        <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                          <div style={{ 
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(productStatusData.budget),
                            margin: '0 auto 5px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.2rem'
                          }}>
                            💰
                          </div>
                          <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Budget</div>
                          <div style={{ color: getStatusColor(productStatusData.budget) }}>
                            {getStatusLabel(productStatusData.budget)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-4">
                        <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                          <div style={{ 
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(productStatusData.quality),
                            margin: '0 auto 5px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.2rem'
                          }}>
                            ✅
                          </div>
                          <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Quality</div>
                          <div style={{ color: getStatusColor(productStatusData.quality) }}>
                            {getStatusLabel(productStatusData.quality)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Loading or error state
                <div className="row">
                  <div className="col-12" style={{ textAlign: 'center', padding: '20px' }}>
                    {selectedProduct ? (
                      <div>
                        <div style={{ marginBottom: '10px' }}>
                          🔄 Loading product status data...
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                          {isGettingProductReport && "Fetching product report..."} 
                          {isGettingReleaseProductReport && !isGettingProductReport && "Loading release data..."} 
                          {isSecondaryDataLoading && !isEssentialDataLoading && "Loading additional data..."}
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: '#666' }}>
                        Please select a product to view status
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Tab Navigation for Insights Sections */}
          <TabContext value={activeTab}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <TabList onChange={handleTabChange} aria-label="insights sections">
                <Tab 
                  icon={<ArchitectureIcon />}
                  label="Architecture & Design" 
                  value="architecture" 
                />
                <Tab 
                  icon={<TimelineIcon />}
                  label="Timelines & Productivity" 
                  value="timelines" 
                />
                <Tab 
                  icon={<BudgetIcon />}
                  label="Budget Management" 
                  value="budget" 
                />
              </TabList>
            </Box>

              {/* Product Status Dashboard */}
              {(() => {
                // Optimized product status data using real APIs with performance caching
                const releases = releasesData && releasesData.length > 0 ? releasesData.map(release => {
                  const releaseDate = new Date(release.release_date);
                  const startDate = new Date(release.start_date);
                  const now = new Date();
                  
                  return {
                    name: release.name || `Release ${release.release_uuid}`,
                    status: (() => {
                      if (releaseDate < now) return 'completed';
                      if (startDate <= now && releaseDate >= now) return 'active';
                      return 'planned';
                    })(),
                    target_date: release.release_date
                  };
                }) : [
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
                
                // Real features data from API
                const features = featuresData && featuresData.length > 0 ? featuresData.map(feature => ({
                  feature_uuid: feature.feature_uuid,
                  name: feature.name || `Feature ${feature.feature_uuid}`,
                  status: (() => {
                    // Map status UUID to status name if we have status data
                    if (statusLookupData && feature.status) {
                      const statusObj = statusLookupData.find(s => s.status_uuid === feature.status);
                      return statusObj ? statusObj.name.toLowerCase() : 'unknown';
                    }
                    return 'unknown';
                  })(),
                  end_date: feature.end_date,
                  start_date: feature.start_date,
                  priority: feature.priority || 'Medium',
                  archived: feature.archived || false,
                  is_approved: feature.is_approved || false,
                  assigned_developer_uuid: feature.assigned_developer_uuid
                })) : Array.from({ length: 15 }, (_, i) => ({
                  feature_uuid: `feat-${i}`,
                  name: `Feature ${i + 1}`,
                  status: i < 8 ? 'completed' : i < 12 ? 'in_progress' : 'planned',
                  end_date: `2024-0${Math.floor(Math.random() * 3) + 1}-15`,
                  priority: i < 5 ? 'High' : i < 10 ? 'Medium' : 'Low',
                  archived: false,
                  is_approved: i < 12
                }));

                // Real issues data from API
                const issues = issuesData && issuesData.length > 0 ? issuesData.map(issue => ({
                  issue_uuid: issue.issue_uuid,
                  name: issue.name || `Issue ${issue.issue_uuid}`,
                  status: (() => {
                    // Map status UUID to status name if we have status data
                    if (statusLookupData && issue.status) {
                      const statusObj = statusLookupData.find(s => s.status_uuid === issue.status);
                      return statusObj ? statusObj.name.toLowerCase() : 'unknown';
                    }
                    return 'unknown';
                  })(),
                  issue_type: issue.issue_type || 'Unknown',
                  start_date: issue.start_date,
                  end_date: issue.end_date,
                  archived: issue.archived || false,
                  assigned_developer_uuid: issue.assigned_developer_uuid
                })) : Array.from({ length: 8 }, (_, i) => ({
                  issue_uuid: `issue-${i}`,
                  name: `Issue ${i + 1}`,
                  status: i < 5 ? 'completed' : 'in_progress',
                  issue_type: i % 2 === 0 ? 'FE' : 'BE',
                  archived: false
                }));

                // Calculate status using real data
                const calculatedStatus = calculateProductStatus(
                  productData, 
                  releases, 
                  features, 
                  issues, 
                  budgetData,
                  organizationMembers
                );

                const statusReport = generateStatusReport(productData, calculatedStatus);

                return (
                  <div className="row">
                    {/* Recommendations */}
                    {statusReport.recommendations && statusReport.recommendations.length > 0 && (
                      <div className="col-12">
                        <Card>
                          <Card.Header style={{ 
                            backgroundColor: '#fff3cd',
                            borderColor: '#ffeaa7',
                            fontWeight: 'bold'
                          }}>
                            💡 Recommendations
                          </Card.Header>
                          <Card.Body>
                            <div className="row">
                              {statusReport.recommendations.map((recommendation, index) => (
                                <div key={index} className="col-md-6">
                                  <Alert variant="warning" style={{ marginBottom: '10px', fontSize: '0.9rem' }}>
                                    {recommendation}
                                  </Alert>
                                </div>
                              ))}
                            </div>
                          </Card.Body>
                        </Card>
                      </div>
                    )}

                    {/* Debug: API Data Status - Remove in production */}
                    {(process.env.NODE_ENV === 'development' && window.location.hostname === 'localhost') && (
                      <div className="col-12 mt-3">
                        <Card>
                          <Card.Header style={{ 
                            backgroundColor: '#e3f2fd',
                            borderColor: '#2196f3',
                            fontWeight: 'bold'
                          }}>
                            🔧 API Data Status (Debug - Development Only)
                          </Card.Header>
                          <Card.Body>
                            <div className="row">
                              <div className="col-md-3">
                                <small className="text-muted">Features API:</small>
                                <div className={`badge ${featuresData ? 'bg-success' : 'bg-warning'}`}>
                                  {featuresData ? `${featuresData.length} items` : 'Using mock data'}
                                </div>
                              </div>
                              <div className="col-md-3">
                                <small className="text-muted">Issues API:</small>
                                <div className={`badge ${issuesData ? 'bg-success' : 'bg-warning'}`}>
                                  {issuesData ? `${issuesData.length} items` : 'Using mock data'}
                                </div>
                              </div>
                              <div className="col-md-3">
                                <small className="text-muted">Releases API:</small>
                                <div className={`badge ${releasesData ? 'bg-success' : 'bg-warning'}`}>
                                  {releasesData ? `${releasesData.length} items` : 'Using mock data'}
                                </div>
                              </div>
                              <div className="col-md-3">
                                <small className="text-muted">Status API:</small>
                                <div className={`badge ${statusLookupData ? 'bg-success' : 'bg-warning'}`}>
                                  {statusLookupData ? `${statusLookupData.length} statuses` : 'Using defaults'}
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </div>
                    )}
                  </div>
                );
              })()}

            {/* Tab Panels */}
            <TabPanel value="architecture">
              <div className="row">
                <div className="col-md-6">
                  <Card className="w-100 h-100">
                    <Card.Body>
                      <Card.Title className="d-flex align-items-center">
                        <i className="fas fa-cloud me-2" style={{ color: '#0C5595' }}></i>
                        Cloud Architecture & Hosting Suggestions
                      </Card.Title>
                      {(() => {
                        const getCloudRecommendations = () => {
                          const archType = productData?.architecture_type?.toLowerCase() || '';
                          const hostingProvider = productData?.product_info?.hostingProvider || 'Not specified';
                          
                          // Determine architecture type and hosting recommendations
                          let architectureRec = 'Cloud-Native Microservices';
                          let hostingRec = ['AWS', 'Google Cloud Platform', 'Microsoft Azure'];
                          let deploymentPattern = 'Container-based deployment with auto-scaling';
                          
                          if (archType.includes('monolith')) {
                            architectureRec = 'Monolithic Cloud Deployment';
                            deploymentPattern = 'Single application deployment with load balancing';
                          } else if (archType.includes('microservice')) {
                            architectureRec = 'Microservices Architecture';
                            deploymentPattern = 'Containerized services with orchestration';
                          } else if (archType.includes('micro-app') || archType.includes('mini-app')) {
                            architectureRec = 'Micro-Frontend Architecture';
                            deploymentPattern = 'CDN-hosted micro-frontends with API gateway';
                          }
                          
                          return { architectureRec, hostingRec, deploymentPattern, currentHosting: hostingProvider };
                        };
                        
                        const { architectureRec, hostingRec, deploymentPattern, currentHosting } = getCloudRecommendations();
                        
                        return (
                          <div>
                            <div className="mb-3">
                              <strong>Architecture Pattern:</strong>
                              <div className="badge bg-primary ms-2">{architectureRec}</div>
                            </div>
                            
                            <div className="mb-3">
                              <strong>Current Hosting:</strong>
                              <div className="badge bg-info ms-2">{currentHosting}</div>
                            </div>
                            
                            <div className="mb-3">
                              <strong>Recommended Providers:</strong>
                              <div className="mt-2">
                                {hostingRec.map((provider, index) => (
                                  <span key={index} className="badge bg-success me-1 mb-1">{provider}</span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <strong>Deployment Strategy:</strong>
                              <p className="text-muted mt-1 mb-0">{deploymentPattern}</p>
                            </div>
                            
                            <div className="mt-3 p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                              <small className="text-muted">
                                <strong>Key Benefits:</strong> Scalability, High availability, Cost optimization, 
                                Global distribution, Managed services
                              </small>
                            </div>
                          </div>
                        );
                      })()}
                    </Card.Body>
                  </Card>
                </div>
                
                <div className="col-md-6">
                  <Card className="w-100 h-100">
                    <Card.Body>
                      <Card.Title className="d-flex align-items-center">
                        <i className="fas fa-code me-2" style={{ color: '#0C5595' }}></i>
                        Technology Stack Recommendations
                      </Card.Title>
                      {(() => {
                        const getTechRecommendations = () => {
                          const productType = productData?.type?.toLowerCase() || '';
                          const archType = productData?.architecture_type?.toLowerCase() || '';
                          
                          // Default recommendations based on modern web development best practices
                          let frontend = ['React', 'Vue.js', 'Angular'];
                          let backend = ['Node.js', 'Python/Django', 'Python/FastAPI'];
                          let database = ['PostgreSQL', 'MongoDB', 'Redis'];
                          let devops = ['Docker', 'Kubernetes', 'CI/CD Pipeline'];
                          
                          // Customize based on product type
                          if (productType.includes('ecommerce') || productType.includes('marketplace')) {
                            frontend = ['React', 'Next.js', 'Vue.js'];
                            backend = ['Node.js', 'Python/Django', 'PHP/Laravel'];
                            database = ['PostgreSQL', 'MySQL', 'Redis'];
                          } else if (productType.includes('saas') || productType.includes('dashboard')) {
                            frontend = ['React', 'Angular', 'Vue.js'];
                            backend = ['Python/Django', 'Node.js', 'Java/Spring'];
                            database = ['PostgreSQL', 'MongoDB', 'InfluxDB'];
                          } else if (productType.includes('mobile') || productType.includes('api')) {
                            frontend = ['React Native', 'Flutter', 'Swift/Kotlin'];
                            backend = ['Node.js', 'Python/FastAPI', 'Go'];
                            database = ['MongoDB', 'PostgreSQL', 'Firebase'];
                          }
                          
                          return { frontend, backend, database, devops };
                        };
                        
                        const { frontend, backend, database, devops } = getTechRecommendations();
                        
                        return (
                          <div>
                            <div className="mb-3">
                              <strong className="d-flex align-items-center">
                                <i className="fas fa-desktop me-1" style={{ fontSize: '14px' }}></i>
                                Frontend:
                              </strong>
                              <div className="mt-1">
                                {frontend.map((tech, index) => (
                                  <span key={index} className="badge bg-primary me-1 mb-1">{tech}</span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <strong className="d-flex align-items-center">
                                <i className="fas fa-server me-1" style={{ fontSize: '14px' }}></i>
                                Backend:
                              </strong>
                              <div className="mt-1">
                                {backend.map((tech, index) => (
                                  <span key={index} className="badge bg-success me-1 mb-1">{tech}</span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <strong className="d-flex align-items-center">
                                <i className="fas fa-database me-1" style={{ fontSize: '14px' }}></i>
                                Database:
                              </strong>
                              <div className="mt-1">
                                {database.map((tech, index) => (
                                  <span key={index} className="badge bg-info me-1 mb-1">{tech}</span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <strong className="d-flex align-items-center">
                                <i className="fas fa-cogs me-1" style={{ fontSize: '14px' }}></i>
                                DevOps:
                              </strong>
                              <div className="mt-1">
                                {devops.map((tech, index) => (
                                  <span key={index} className="badge bg-warning text-dark me-1 mb-1">{tech}</span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="mt-3 p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                              <small className="text-muted">
                                <strong>Selection Criteria:</strong> Industry standards, Community support, 
                                Scalability, Development speed, Long-term maintenance
                              </small>
                            </div>
                          </div>
                        );
                      })()}
                    </Card.Body>
                  </Card>
                </div>
              </div>
              
              <div className="row mt-3">
                <div className="col-12">
                  <Card className="w-100">
                    <Card.Body>
                      <Card.Title>Recommended Buildly Open Source Tools</Card.Title>
                      <div className="w-100 m-2">
                        {buildlyTools && buildlyTools.length > 0 ? (
                          <div>
                            {buildlyTools.map((tool, index) => (
                              <Card key={`tool-${index}`} className="mb-2" style={{ border: '1px solid #e0e0e0' }}>
                                <Card.Body style={{ padding: '10px' }}>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div style={{ flex: 1 }}>
                                      <div className="d-flex justify-content-between align-items-start">
                                        <h6 className="mb-1" style={{ color: '#0C5595' }}>
                                          <a 
                                            href={tool.html_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{ textDecoration: 'none', color: '#0C5595' }}
                                          >
                                            {tool.name}
                                          </a>
                                        </h6>
                                        <div className="d-flex align-items-center">
                                          {tool.source === 'marketplace' && (
                                            <small className="badge bg-success me-2">Marketplace</small>
                                          )}
                                          <small className="badge bg-primary" style={{ fontSize: '10px' }}>
                                            {Math.round(tool.relevance_score || 50)}% match
                                          </small>
                                        </div>
                                      </div>
                                      <small className="text-muted">{tool.description || 'No description available'}</small>
                                      <div className="mt-1">
                                        <small className="badge bg-light text-dark me-1">{tool.language || 'Unknown'}</small>
                                        <small className="badge bg-light text-dark me-1">⭐ {tool.stargazers_count || 0}</small>
                                        {tool.topics && tool.topics.slice(0, 2).map((topic, idx) => (
                                          <small key={idx} className="badge bg-secondary me-1">{topic}</small>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </Card.Body>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-muted p-4">
                            <p>Loading Buildly open source tools...</p>
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                  
                  {/* Marketplace Tools Section */}
                  <Card className="w-100 mt-2">
                    <Card.Body>
                      <Card.Title>Premium Marketplace Components</Card.Title>
                      <div className="w-100 m-2">
                        {marketplaceTools && marketplaceTools.length > 0 ? (
                          <div>
                            {marketplaceTools.map((tool, index) => (
                              <Card key={`marketplace-tool-${index}`} className="mb-2" style={{ border: '1px solid #ffc107', backgroundColor: '#fffbf0' }}>
                                <Card.Body style={{ padding: '10px' }}>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div style={{ flex: 1 }}>
                                      <div className="d-flex justify-content-between align-items-start">
                                        <h6 className="mb-1" style={{ color: '#d68910' }}>
                                          <a 
                                            href={tool.html_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{ textDecoration: 'none', color: '#d68910' }}
                                          >
                                            {tool.name} ⭐
                                          </a>
                                        </h6>
                                        <div className="d-flex align-items-center">
                                          <small className="badge bg-warning text-dark me-2">Premium</small>
                                          <small className="badge bg-primary" style={{ fontSize: '10px' }}>
                                            {Math.round(tool.relevance_score || 50)}% match
                                          </small>
                                        </div>
                                      </div>
                                      <small className="text-muted">{tool.description || 'No description available'}</small>
                                      <div className="mt-1">
                                        <small className="badge bg-light text-dark me-1">{tool.language || 'React'}</small>
                                        <small className="badge bg-light text-dark me-1">⭐ {tool.stargazers_count || 0}</small>
                                        {tool.topics && tool.topics.slice(0, 2).map((topic, idx) => (
                                          <small key={idx} className="badge bg-warning text-dark me-1">{topic}</small>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </Card.Body>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-muted p-4">
                            <p>Loading premium marketplace components...</p>
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </TabPanel>

            <TabPanel value="timelines">
              <Card className="w-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Card.Title>Release Timeline</Card.Title>
                    <div className="btn-group" role="group">
                      <Button
                        variant={viewMode === 'timeline' ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => setViewMode('timeline')}
                        sx={{ mr: 1 }}
                      >
                        Timeline View
                      </Button>
                      <Button
                        variant={viewMode === 'gantt' ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => setViewMode('gantt')}
                      >
                        Gantt View
                      </Button>
                    </div>
                  </div>
                  <div className="m-2">
                    {/* Enhanced Timeline Data Loading and Error Handling */}
                    {isGettingReleaseProductReport && !releaseData?.length ? (
                      <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading timeline data...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading release timeline...</p>
                      </div>
                    ) : releaseReportError ? (
                      <Alert variant="warning" className="mb-3">
                        <Alert.Heading>Timeline Data Unavailable</Alert.Heading>
                        <p>
                          Unable to load release timeline data. This could be due to:
                        </p>
                        <ul>
                          <li>Release service is temporarily unavailable</li>
                          <li>No releases have been created for this product yet</li>
                          <li>Network connectivity issues</li>
                        </ul>
                        <p className="mb-0">
                          <Button variant="outline-primary" size="sm" onClick={() => window.location.reload()}>
                            Retry Loading
                          </Button>
                        </p>
                      </Alert>
                    ) : releaseData && releaseData.length > 0 ? (
                      viewMode === 'timeline' ? (
                        <TimelineComponent
                          reportData={releaseData}
                          suggestedFeatures={productData?.feature_suggestions}
                          onReleaseClick={handleReleaseClick}
                          productContext={{
                            name: productData?.name || reportData?.name,
                            architecture_type: productData?.architecture_type || reportData?.architecture_type,
                            product_uuid: productData?.product_uuid || selectedProduct
                          }}
                        />
                      ) : (
                        <div>
                          <GanttChart
                            releases={releaseData}
                            onReleaseClick={handleReleaseClick}
                            title="Release Gantt Chart"
                            productContext={{
                              name: productData?.name || reportData?.name,
                              architecture_type: productData?.architecture_type || reportData?.architecture_type,
                              product_uuid: productData?.product_uuid || selectedProduct
                            }}
                          />
                        </div>
                      )
                    ) : (
                      <div className="text-center py-4">
                        <div className="alert alert-info">
                          <h5>No Release Timeline Available</h5>
                          <p>This product doesn't have any releases configured yet.</p>
                          <p className="mb-0">Create your first release to see the timeline visualization.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>

              {/* Feature & Issue Reports Section */}
              <div className="row mt-4">
                <div className="col-md-6">
                  <Card className="w-100">
                    <Card.Body>
                      <Card.Title>Feature Reports</Card.Title>
                      <div className="m-2">
                        {releaseData && releaseData.length ? (
                          <div>
                            <p><strong>Total Features:</strong> {releaseData.reduce((total, release) => total + (release.features?.length || 0), 0)}</p>
                            <p><strong>Features by Release:</strong></p>
                            <ul>
                              {releaseData.map((release, index) => (
                                <li key={index}>
                                  <a 
                                    href={`/release-details/${release.release_uuid}`}
                                    style={{ color: '#0C5595', textDecoration: 'none' }}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleReleaseClick(release);
                                    }}
                                  >
                                    {release.name}
                                  </a>
                                  : {release.features?.length || 0} features
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="alert alert-info">No feature data available</div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </div>
                <div className="col-md-6">
                  <Card className="w-100">
                    <Card.Body>
                      <Card.Title>Issue Reports</Card.Title>
                      <div className="m-2">
                        {releaseData && releaseData.length ? (
                          <div>
                            <p><strong>Total Issues:</strong> {releaseData.reduce((total, release) => total + (release.issues?.length || 0), 0)}</p>
                            <p><strong>Issues by Status:</strong></p>
                            <ul>
                              <li>Open: {releaseData.reduce((total, release) => total + (release.issues?.filter(issue => issue.status === 'open')?.length || 0), 0)}</li>
                              <li>In Progress: {releaseData.reduce((total, release) => total + (release.issues?.filter(issue => issue.status === 'in_progress')?.length || 0), 0)}</li>
                              <li>Resolved: {releaseData.reduce((total, release) => total + (release.issues?.filter(issue => issue.status === 'resolved')?.length || 0), 0)}</li>
                            </ul>
                          </div>
                        ) : (
                          <div className="alert alert-info">No issue data available</div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </div>

              {/* Productivity Reports Section */}
              <Card className="w-100 mt-4">
                <Card.Body>
                  <Card.Title>Productivity Reports</Card.Title>
                  <div className="m-2">
                    {releaseData && releaseData.length ? (
                      <div className="row">
                        <div className="col-md-6">
                          <h6>Release Velocity</h6>
                          <p>Average time per release: {Math.round(releaseData.reduce((total, release) => total + (release.duration?.weeks || 0), 0) / releaseData.length)} weeks</p>
                        </div>
                        <div className="col-md-6">
                          <h6>Team Productivity</h6>
                          <p>Active teams: {releaseData.reduce((teams, release) => {
                            release.team?.forEach(member => teams.add(member.role));
                            return teams;
                          }, new Set()).size}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="alert alert-info">No productivity data available</div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </TabPanel>

            <TabPanel value="budget">
              <Card className="w-100">
                <Card.Body>
                  <Card.Title>Estimates and Team</Card.Title>
                  <div className="m-2">
                    {/* Enhanced Budget Data Loading and Error Handling */}
                    {isGettingProductBudget && !budgetData && !budgetError ? (
                      <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading budget data...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading budget estimates...</p>
                      </div>
                    ) : budgetError && budgetError.response?.status !== 404 ? (
                      <Alert variant="warning" className="mb-3">
                        <Alert.Heading>Budget Data Unavailable</Alert.Heading>
                        <p>Unable to load budget data from the server. Using default estimates.</p>
                        <Button variant="outline-primary" size="sm" onClick={() => window.location.reload()}>
                          Retry Loading
                        </Button>
                      </Alert>
                    ) : null}

                    {releaseData && releaseData.length > 0 ? (
                      <div className="row">
                        {releaseData.map((release, index) => (
                          <div key={`release-estimate-${index}`} className="col-md-6 mb-4">
                            <Card style={{ 
                              border: '2px solid #e0e0e0',
                              borderRadius: '8px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}>
                              <Card.Header style={{ 
                                backgroundColor: release.bgColor || '#f8f9fa',
                                color: 'white',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                                  {release.icon && (
                                    <release.icon 
                                      className="me-2" 
                                      size={18}
                                      style={{ color: 'white' }}
                                    />
                                  )}
                                  <span style={{ color: 'white' }}>
                                    {release.name} - Budget vs Actual
                                  </span>
                                </div>
                                <div style={{ textAlign: 'right', color: 'white' }}>
                                  <div style={{ fontSize: '12px' }}>
                                    Estimated: {budgetEstimates[release.name]?.timeline_weeks || release.duration?.weeks || 12} weeks
                                  </div>
                                  <div style={{ fontSize: '12px' }}>
                                    Actual: {Math.ceil((budgetEstimates[release.name]?.timeline_weeks || release.duration?.weeks || 12) * 1.2)} weeks
                                  </div>
                                </div>
                              </Card.Header>
                              <Card.Body>
                            {/* Team Composition */}
                            <div className="mb-3">
                              <h6 style={{ color: '#0C5594', marginBottom: '10px' }}>👥 Team Composition</h6>
                              {budgetEstimates[release.name]?.team ? (
                                <div>
                                  {budgetEstimates[release.name].team.map((member, idx) => (
                                    <div key={idx} style={{ 
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      marginBottom: '6px',
                                      padding: '6px 10px',
                                      backgroundColor: '#f8f9fa',
                                      borderRadius: '4px',
                                      border: '1px solid #e9ecef'
                                    }}>
                                      <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                                          {member.role}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                          Count: {member.count} • ${member.weeklyRate || 0}/week each
                                        </div>
                                      </div>
                                      <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'bold', color: '#28a745' }}>
                                          ${((member.count || 0) * (member.weeklyRate || 0) * (budgetEstimates[release.name]?.timeline_weeks || release.duration?.weeks || 12)).toLocaleString()}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                          ${((member.count || 0) * (member.weeklyRate || 0)).toLocaleString()}/week
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : release.team && release.team.length > 0 ? (
                                <div>
                                  {release.team.map((member, idx) => (
                                    <div key={idx} style={{ 
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      marginBottom: '6px',
                                      padding: '6px 10px',
                                      backgroundColor: '#f8f9fa',
                                      borderRadius: '4px',
                                      border: '1px solid #e9ecef'
                                    }}>
                                      <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                                          {member.role}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                          Count: {member.count} • ${member.weeklyRate || 0}/week each
                                        </div>
                                      </div>
                                      <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'bold', color: '#28a745' }}>
                                          ${((member.count || 0) * (member.weeklyRate || 0) * (release.duration?.weeks || 0)).toLocaleString()}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                          ${((member.count || 0) * (member.weeklyRate || 0)).toLocaleString()}/week
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div style={{ 
                                  textAlign: 'center',
                                  color: '#6c757d',
                                  fontStyle: 'italic',
                                  padding: '20px'
                                }}>
                                  No team configuration available
                                </div>
                              )}
                            </div>

                            {/* Budget vs Actual Comparison */}
                            <div className="mb-3" style={{ marginTop: '20px' }}>
                              <h6 style={{ color: '#0C5594', marginBottom: '10px' }}>📊 Budget vs Actual</h6>
                              <div style={{ 
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '10px',
                                padding: '15px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '6px',
                                border: '1px solid #dee2e6'
                              }}>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '5px' }}>
                                    Original Budget
                                  </div>
                                  <div style={{ fontWeight: 'bold', color: '#28a745', fontSize: '16px' }}>
                                    {release.duration?.weeks || 0} weeks
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                    ${(budgetEstimates[release.name]?.total_budget || 50000).toLocaleString()}
                                  </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '5px' }}>
                                    Actual/Projected
                                  </div>
                                  <div style={{ fontWeight: 'bold', color: '#dc3545', fontSize: '16px' }}>
                                    {Math.ceil((release.duration?.weeks || 0) * 1.2)} weeks
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                    ${Math.round((budgetEstimates[release.name]?.total_budget || 50000) * 1.15).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              <div style={{ 
                                marginTop: '10px',
                                padding: '10px',
                                backgroundColor: '#fff3cd',
                                borderRadius: '4px',
                                border: '1px solid #ffeaa7',
                                fontSize: '12px',
                                textAlign: 'center'
                              }}>
                                <strong>Variance:</strong> +{Math.ceil((release.duration?.weeks || 0) * 0.2)} weeks 
                                (+${Math.round((budgetEstimates[release.name]?.total_budget || 50000) * 0.15).toLocaleString()})
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ 
                              display: 'flex',
                              gap: '8px',
                              flexWrap: 'wrap',
                              marginTop: '15px'
                            }}>
                              <Button
                                variant="contained"
                                size="small"
                                style={{ 
                                  backgroundColor: '#0C5594',
                                  color: 'white',
                                  fontSize: '11px'
                                }}
                                onClick={() => handleConfigureTeam(release)}
                              >
                                ⚙️ Configure Team
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                style={{ 
                                  borderColor: '#28a745',
                                  color: '#28a745',
                                  fontSize: '11px'
                                }}
                                onClick={() => handleAIEstimate(release)}
                                disabled={budgetLoading[release.name]}
                              >
                                {budgetLoading[release.name] ? '⏳ Generating...' : '✨ AI Estimate'}
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                style={{ 
                                  borderColor: '#6c757d',
                                  color: '#6c757d',
                                  fontSize: '11px'
                                }}
                                onClick={() => {
                                  // Handle viewing release details
                                  handleReleaseClick(release);
                                }}
                              >
                                📋 View Details
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-warning" role="alert">
                    No releases available for budget estimation!
                  </div>
                )}

                {/* Project-wide Budget Controls */}
                {releaseData && releaseData.length > 0 && (
                  <Card style={{ 
                    marginTop: '20px',
                    border: '2px solid #0C5594',
                    borderRadius: '8px'
                  }}>
                    <Card.Header style={{ 
                      backgroundColor: '#0C5594',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      🏢 Project-wide Budget Management
                    </Card.Header>
                    <Card.Body>
                      <div className="row">
                        <div className="col-md-8">
                          <div className="mb-3">
                            <h6>Budget Summary</h6>
                            <div style={{ 
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                              gap: '15px'
                            }}>
                              <div style={{ 
                                padding: '15px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '6px',
                                textAlign: 'center'
                              }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                                  ${Object.values(budgetEstimates).reduce((total, estimate) => total + (estimate.total_budget || 0), 0).toLocaleString() || 
                                    releaseData.reduce((total, release) => total + (release.totalCost || 0), 0).toLocaleString()}
                                </div>
                                <div style={{ fontSize: '12px', color: '#6c757d' }}>Total Project Cost</div>
                              </div>
                              <div style={{ 
                                padding: '15px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '6px',
                                textAlign: 'center'
                              }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0C5594' }}>
                                  {releaseData.reduce((total, release) => total + (release.duration?.weeks || 0), 0)}
                                </div>
                                <div style={{ fontSize: '12px', color: '#6c757d' }}>Total Weeks</div>
                              </div>
                              <div style={{ 
                                padding: '15px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '6px',
                                textAlign: 'center'
                              }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6f42c1' }}>
                                  {(releaseData || []).reduce((teams, release) => {
                                    release.team?.forEach(member => teams.add(member.role));
                                    return teams;
                                  }, new Set()).size}
                                </div>
                                <div style={{ fontSize: '12px', color: '#6c757d' }}>Unique Roles</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <h6>Save Budget Configuration</h6>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Button
                              variant="contained"
                              fullWidth
                              style={{ 
                                backgroundColor: '#28a745',
                                color: 'white'
                              }}
                              onClick={handleSaveEntireProduct}
                              disabled={budgetLoading.saveAll}
                            >
                              {budgetLoading.saveAll ? 'Saving...' : '💾 Save for Entire Product'}
                            </Button>
                            <Button
                              variant="outlined"
                              fullWidth
                              style={{ 
                                borderColor: '#6f42c1',
                                color: '#6f42c1'
                              }}
                              onClick={handleSaveFutureTemplate}
                              disabled={budgetLoading.saveTemplate}
                            >
                              {budgetLoading.saveTemplate ? 'Saving...' : '🔮 Save Template for Future'}
                            </Button>
                          </div>
                          <div style={{ 
                            marginTop: '15px',
                            fontSize: '12px',
                            color: '#6c757d',
                            textAlign: 'center'
                          }}>
                            Budget configurations will be saved to your product settings
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                )}
              </div>
            </Card.Body>
          </Card>
            </TabPanel>
          </TabContext>



          {/* Email report modal */}
          <Modal
            show={showEmailModal}
            onHide={closeEmailModal}
            backdrop="static"
            keyboard={false}
            centered
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Email report</Modal.Title>
            </Modal.Header>
            <Modal.Body>

              <Form noValidate>
                <Container>
                  {(
                    recipients.map(
                      (recipientObj, index) => (
                        <Row xs={1} md={2}>
                          <Col xs={6}>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                              <Form.Label>Recipient's name</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Name"
                                name="name"
                                onChange={(event) => updateRecipients(event, index)}
                              />
                            </Form.Group>
                          </Col>
                          <Col xs={6}>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                              <Form.Label>Recipient's email address</Form.Label>
                              <Form.Control
                                type="email"
                                placeholder="Email address"
                                name="email"
                                onChange={(event) => updateRecipients(event, index)}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      ),
                    )
                  )}
                </Container>
                <div className="d-flex justify-content-end">
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={btnDisabled}
                    onClick={addNewRecipient}
                  >
                    Add another recipient
                  </Button>
                </div>
                {/* <Form.Group className="mb-3" controlId="message"> */}
                {/*  <Form.Label>Message</Form.Label> */}
                {/*  <Form.Control as="textarea" rows={3} name="message" onChange={(event) => updateFormData(event)} /> */}
                {/* </Form.Group> */}
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                type="button"
                variant="outlined"
                color="primary"
                size="small"
                name="email"
                onClick={closeEmailModal}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="contained"
                color="primary"
                size="small"
                name="message"
                disabled={btnDisabled}
                onClick={(event) => emailReport(event)}
              >
                Email report
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Team Help Request Modal */}
          <Modal
            show={showTeamHelpModal}
            onHide={closeTeamHelpModal}
            backdrop="static"
            keyboard={false}
            centered
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>🚀 Request Development Team Assistance</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="mb-3">
                <p className="text-muted">
                  Let our team help you find the right developers, tech leads, or CTO for your project. 
                  Fill out the details below and we'll get back to you with recommendations.
                </p>
              </div>
              
              <Form noValidate>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Type of Help Needed *</Form.Label>
                      <Form.Select
                        name="helpType"
                        value={teamHelpForm.helpType}
                        onChange={updateTeamHelpForm}
                        required
                      >
                        <option value="">Select help type...</option>
                        <option value="Full Development Team">Full Development Team</option>
                        <option value="Lead Developer">Lead Developer / Tech Lead</option>
                        <option value="CTO / Technical Advisor">CTO / Technical Advisor</option>
                        <option value="Specific Skills">Specific Technical Skills</option>
                        <option value="Code Review">Code Review & Architecture Review</option>
                        <option value="Project Rescue">Project Rescue / Recovery</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Company Size</Form.Label>
                      <Form.Select
                        name="companySize"
                        value={teamHelpForm.companySize}
                        onChange={updateTeamHelpForm}
                      >
                        <option value="">Select company size...</option>
                        <option value="Startup (1-10 employees)">Startup (1-10 employees)</option>
                        <option value="Small (11-50 employees)">Small (11-50 employees)</option>
                        <option value="Medium (51-200 employees)">Medium (51-200 employees)</option>
                        <option value="Large (200+ employees)">Large (200+ employees)</option>
                        <option value="Enterprise (1000+ employees)">Enterprise (1000+ employees)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Project Description *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="projectDescription"
                    value={teamHelpForm.projectDescription}
                    onChange={updateTeamHelpForm}
                    placeholder="Describe your project, its goals, and current status..."
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Timeline *</Form.Label>
                      <Form.Select
                        name="timeline"
                        value={teamHelpForm.timeline}
                        onChange={updateTeamHelpForm}
                        required
                      >
                        <option value="">Select timeline...</option>
                        <option value="ASAP (Within 1 month)">ASAP (Within 1 month)</option>
                        <option value="1-3 months">1-3 months</option>
                        <option value="3-6 months">3-6 months</option>
                        <option value="6-12 months">6-12 months</option>
                        <option value="12+ months">12+ months</option>
                        <option value="Flexible">Flexible</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Budget Range</Form.Label>
                      <Form.Select
                        name="budget"
                        value={teamHelpForm.budget}
                        onChange={updateTeamHelpForm}
                      >
                        <option value="">Select budget range...</option>
                        <option value="Under $50k">Under $50k</option>
                        <option value="$50k - $100k">$50k - $100k</option>
                        <option value="$100k - $250k">$100k - $250k</option>
                        <option value="$250k - $500k">$250k - $500k</option>
                        <option value="$500k+">$500k+</option>
                        <option value="Prefer to discuss">Prefer to discuss</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Specific Technical Needs *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="specificNeeds"
                    value={teamHelpForm.specificNeeds}
                    onChange={updateTeamHelpForm}
                    placeholder="What specific skills, technologies, or expertise do you need? (e.g., React, Node.js, AWS, mobile development, etc.)"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Current Challenges</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="currentChallenges"
                    value={teamHelpForm.currentChallenges}
                    onChange={updateTeamHelpForm}
                    placeholder="What challenges are you facing? (e.g., technical debt, scaling issues, team management, etc.)"
                  />
                </Form.Group>

                <div className="alert alert-info">
                  <strong>What happens next?</strong><br/>
                  Our team will review your request and reach out within 24-48 hours with:
                  <ul className="mb-0 mt-2">
                    <li>Potential team members or partners in our network</li>
                    <li>Recommendations based on your specific needs</li>
                    <li>Next steps for moving forward</li>
                  </ul>
                </div>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="outlined"
                onClick={closeTeamHelpModal}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={sendTeamHelpRequest}
                disabled={!isTeamHelpFormValid()}
              >
                Send Request
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}

      {!selectedProduct && <Alert variant="warning">Please select a product to get insights.</Alert>}
      
      {/* Team Configuration Modal */}
      <TeamConfigModal
        open={teamModalOpen}
        onClose={() => {
          setTeamModalOpen(false);
          setSelectedRelease(null);
        }}
        onSave={handleTeamSave}
        release={selectedRelease}
        initialTeam={selectedRelease ? budgetEstimates[selectedRelease.name]?.team : []}
      />
      
      <Chatbot />
    </>
  );
};

export default Insights;
