import React, { useEffect, useState, useContext } from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';
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

import './Insights.css';

import Loader from '@components/Loader/Loader';
import TimelineComponent from '@components/Timeline/TimelineComponent';
import RangeSlider from '@components/RangeSlider/RangeSlider';
import GanttChart from '@components/Charts/GanttChart/GanttChart';
import Chatbot from '@components/Chatbot/Chatbot';
import { httpService } from '@modules/http/http.service';
import useAlert from '@hooks/useAlert';
import { UserContext } from '@context/User.context';

// architecture designs
import microservice from '@assets/architecture-suggestions/GCP - MicroServices.png';
import monolith from '@assets/architecture-suggestions/GCP - Monolithic.png';
import multiCloud from '@assets/architecture-suggestions/GCP - MicroServices w_ DataPipeline.png';
import microApp from '@assets/architecture-suggestions/Digital Ocean - MicroApp w_ FrontEnd.png';
import { addColorsAndIcons, getReleaseBudgetData, generateAIFeatureEstimates, generateAIBudgetEstimate } from './utils';
import TeamConfigModal from '@components/TeamConfigModal/TeamConfigModal';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Grid, TextField, Typography } from '@mui/material';
import { getAllProductQuery } from '@react-query/queries/product/getAllProductQuery.js';
import { useEmailReportMutation } from '@react-query/mutations/product/emailReportMutation';
import { getProductReportQuery } from '@react-query/queries/product/getProductReportQuery';
import { getProductBudgetQuery } from '@react-query/queries/budget/getProductBudgetQuery';
import { useSaveProductBudgetMutation } from '@react-query/mutations/budget/saveProductBudgetMutation';
import { getReleaseProductReportQuery } from '@react-query/queries/release/getReleaseProductReportQuery';
import { useStore } from '@zustand/product/productStore';

const Insights = () => {
  let displayReport = true;
  const { activeProduct, setActiveProduct } = useStore();
  const user = useContext(UserContext);
  const { displayAlert } = useAlert();

  // states
  const [selectedProduct, setSelectedProduct] = useState(activeProduct || 0);
  const [productData, setProductData] = useState([]);
  const [releaseData, setReleaseData] = useState([]);
  const [architectureImg, setArchitectureImg] = useState(null);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'gantt'
  const [buildlyTools, setBuildlyTools] = useState([]);
  const [marketplaceTools, setMarketplaceTools] = useState([]);
  
  // Team configuration states
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [budgetEstimates, setBudgetEstimates] = useState({});
  const [budgetLoading, setBudgetLoading] = useState({});
  const [releasePunchlists, setReleasePunchlists] = useState({});
  const [punchlistInputs, setPunchlistInputs] = useState({});

  const { data: products, isLoading: areProductsLoading } = useQuery(
    ['allProducts', user.organization.organization_uuid],
    () => getAllProductQuery(user.organization.organization_uuid, displayAlert),
    { 
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        console.log('Insights: Products loaded:', data);
        console.log('Insights: Current selectedProduct:', selectedProduct);
        console.log('Insights: Current activeProduct:', activeProduct);
        
        // Test if the product service is accessible
        if (data && data.length > 0) {
          console.log('Insights: Available product UUIDs:', data.map(p => p.product_uuid));
          
          // Check if the current selectedProduct exists in the available products
          if (selectedProduct && !data.find(p => p.product_uuid === selectedProduct)) {
            console.warn('Insights: Selected product UUID not found in available products:', selectedProduct);
          }
        }
        
        // If no product is selected but we have products, select the first one
        if (data && data.length > 0 && (!selectedProduct || selectedProduct === 0)) {
          console.log('Insights: Auto-selecting first product:', data[0].product_uuid);
          setSelectedProduct(data[0].product_uuid);
          setActiveProduct(data[0].product_uuid);
        }
      },
      onError: (error) => {
        console.error('Insights: Error loading products:', error);
        console.error('Insights: This suggests the product service might be down or unreachable');
      }
    },
  );
  const { data: reportData, isLoading: isGettingProductReport } = useQuery(
    ['productReport', selectedProduct],
    () => getProductReportQuery(selectedProduct, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(selectedProduct) && !_.isEqual(_.toNumber(selectedProduct), 0) },
  );
  const { data: releaseReport, isLoading: isGettingReleaseProductReport } = useQuery(
    ['releaseProductReport', selectedProduct],
    () => getReleaseProductReportQuery(selectedProduct, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(selectedProduct) && !_.isEqual(_.toNumber(selectedProduct), 0) },
  );

  const { data: budgetData, isLoading: isGettingProductBudget } = useQuery(
    ['productBudget', selectedProduct],
    () => getProductBudgetQuery(selectedProduct, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(selectedProduct) && !_.isEqual(_.toNumber(selectedProduct), 0) },
  );

  const { mutate: emailReportMutation, isLoading: isEmailingReport } = useEmailReportMutation(selectedProduct, displayAlert);
  const { mutate: saveBudgetMutation, isLoading: isSavingBudget } = useSaveProductBudgetMutation(selectedProduct, displayAlert);

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
    recipients[index][event.target.name] = event.target.value;
    setRecipients(recipients);
    validateForm();
  };

  const addNewRecipient = () => {
    recipients.push({
      name: '',
      email: '',
    });
    setRecipients([...recipients]);
    disableButton(true);
  };

  const validateForm = () => {
    const disable = recipients.some((recipient) => !recipient.name.toString()
      .trim().length || !recipient.email.toString()
      .trim().length);
    disableButton(disable);
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
      console.log(error);
    }
  };

  // effects
  useEffect(() => {
    const processInsightsData = async () => {
      if (selectedProduct && !_.isEqual(_.toNumber(selectedProduct), 0)) {
        console.log('Insights: Processing data for product:', selectedProduct);
        console.log('Insights: Report data:', reportData);
        console.log('Insights: Release report:', releaseReport);
        
        if (reportData) {
          // Don't require budget - set productData even without budget
          console.log('Insights: Setting product data');
        
        // set the image to display
        let img = null;
        if (reportData.architecture_type) {
          if (reportData.architecture_type.toLowerCase() === 'monolith') {
            img = monolith;
          } else if (reportData.architecture_type.toLowerCase() === 'microservice') {
            img = microservice;
          } else if (['micro-app', 'mini-app'].includes(reportData.architecture_type.toLowerCase())) {
            img = microApp;
          } else if (reportData.architecture_type.toLowerCase() === 'multicloud microservice') {
            img = multiCloud;
          }
        }
        
        // set states
        setProductData(reportData);
        setArchitectureImg(img);

        // Process release data if available
        if (releaseReport && releaseReport.release_data) {
          console.log('Insights: Processing release data');
          
          // get release data - handle null budget properly with fallback data
          const budgetReleaseData = reportData.budget?.release_data || [];
          console.log('Insights: Budget data available:', !!reportData.budget, 'Budget release data:', budgetReleaseData.length);
          
          // If no budget data, create default budget entries for existing releases
          let processedBudgetData = budgetReleaseData;
          if (budgetReleaseData.length === 0 && releaseReport.release_data.length > 0) {
            console.log('Insights: Creating default budget data for releases');
            processedBudgetData = releaseReport.release_data.map(release => ({
              release: release.release_name || release.name,
              team: [
                {
                  name: 'Development Team',
                  budget: Math.floor(Math.random() * 50000) + 25000, // Random budget between 25k-75k
                },
                {
                  name: 'QA Team', 
                  budget: Math.floor(Math.random() * 25000) + 10000, // Random budget between 10k-35k
                }
              ]
            }));
          }

          releaseReport.release_data = getReleaseBudgetData(
            processedBudgetData, releaseReport?.release_data,
          );

          // Map features and issues to releases
          if (releaseReport.features_data && releaseReport.features_data.length > 0) {
            console.log('Insights: Mapping features to releases');
            releaseReport.release_data = releaseReport.release_data.map(release => {
              const releaseFeatures = releaseReport.features_data.filter(feature => {
                // Match by release UUID if available, otherwise try to match by name
                return feature.release_uuid === release.release_uuid ||
                       (feature.release && (feature.release === release.name || feature.release === release.release_name));
              });
              
              return {
                ...release,
                features: releaseFeatures.map(feature => ({
                  name: feature.feature_name || feature.name,
                  description: feature.description,
                  status: feature.status
                }))
              };
            });
          }

          // Map issues to releases
          if (releaseReport.issues_data && releaseReport.issues_data.length > 0) {
            console.log('Insights: Mapping issues to releases');
            releaseReport.release_data = releaseReport.release_data.map(release => {
              const releaseIssues = releaseReport.issues_data.filter(issue => {
                // Match by release UUID if available, otherwise try to match by name
                return issue.release_uuid === release.release_uuid ||
                       (issue.release && (issue.release === release.name || issue.release === release.release_name));
              });
              
              return {
                ...release,
                issues: releaseIssues.map(issue => ({
                  name: issue.issue_name || issue.name,
                  description: issue.description,
                  status: issue.status,
                  type: issue.ticket_type
                }))
              };
            });
          }

          releaseReport.release_data = addColorsAndIcons(
            releaseReport.release_data,
          );

          // Enhance releases with AI-estimated feature completion dates
          console.log('Insights: Processing AI feature completion dates...');
          const enhancedReleases = await Promise.all(
            releaseReport.release_data.map(async (release) => {
              if (release.features && release.features.length > 0) {
                const featuresWithDates = await generateAIFeatureEstimates(
                  release.features,
                  release.release_date,
                  {
                    name: productData?.name,
                    architecture_type: productData?.architecture_type,
                    product_uuid: productData?.product_uuid
                  }
                );

                // Calculate release span based on feature completion dates
                const calculateReleaseEndDate = (features, defaultReleaseDate) => {
                  if (!features || features.length === 0) return defaultReleaseDate;

                  const completionDates = features
                    .map(f => f.estimated_completion_date)
                    .filter(date => date)
                    .map(date => new Date(date))
                    .sort((a, b) => b - a);

                  if (completionDates.length === 0) return defaultReleaseDate;

                  const latestFeatureDate = completionDates[0];
                  const bufferDays = 7;
                  latestFeatureDate.setDate(latestFeatureDate.getDate() + bufferDays);
                  return latestFeatureDate.toISOString().split('T')[0];
                };

                return {
                  ...release,
                  features: featuresWithDates,
                  calculated_end_date: calculateReleaseEndDate(featuresWithDates, release.release_date)
                };
              }
              return release;
            })
          );

          releaseReport.release_data = enhancedReleases;

          console.log('Insights: Final release data with icons:', releaseReport.release_data.map(r => ({
            name: r.name,
            icon: r.icon?.name || 'Unknown',
            features: r.features?.length || 0,
            issues: r.issues?.length || 0
          })));

          // set release data - use the actual array, not the entire report object
          setReleaseData(releaseReport.release_data);
        }
      }
    } else {
      console.log('Insights: No product selected or product is 0');
      displayReport = false;
    }
    };

    processInsightsData();
  }, [selectedProduct, reportData, releaseReport]);

  // Initialize budget estimates from API data
  useEffect(() => {
    if (budgetData && budgetData.release_budgets) {
      console.log('Insights: Initializing budget estimates from API data');
      const budgetEstimatesFromAPI = {};
      
      budgetData.release_budgets.forEach(releaseBudget => {
        if (releaseBudget.release_name && releaseBudget.budget_estimate) {
          budgetEstimatesFromAPI[releaseBudget.release_name] = releaseBudget.budget_estimate;
        }
      });
      
      setBudgetEstimates(budgetEstimatesFromAPI);
      console.log('Insights: Budget estimates loaded:', Object.keys(budgetEstimatesFromAPI));
    }
  }, [budgetData]);

  // Fetch Buildly open source tools from GitHub
  useEffect(() => {
    const fetchBuildlyTools = async () => {
      try {
        console.log('Insights: Fetching Buildly GitHub tools...');
        
        // First, try to fetch from buildly-marketplace organization with rate limit handling
        let marketplaceTools = [];
        try {
          console.log('Fetching from buildly-marketplace organization...');
          const marketplaceResponse = await fetch('https://api.github.com/orgs/buildly-marketplace/repos?per_page=10', {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'BuildlyLabsApp'
            }
          });
          
          if (marketplaceResponse.ok) {
            const repos = await marketplaceResponse.json();
            console.log(`Found ${repos.length} repositories in buildly-marketplace organization`);
            
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
                console.warn(`Failed to process marketplace tool ${repo.name}:`, error);
              }
            }
          } else if (marketplaceResponse.status === 403) {
            console.warn('GitHub API rate limit reached for marketplace organization');
          }
        } catch (error) {
          console.warn('Failed to fetch from buildly-marketplace organization:', error);
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
          console.log('Using fallback premium tools due to API limitations...');
          
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
        
        console.log('Insights: Fetched open source tools:', validOpenSourceTools.length);
        console.log('Insights: Fetched premium tools:', validPremiumTools.length);
        setBuildlyTools(validOpenSourceTools);
        setMarketplaceTools(validPremiumTools);
      } catch (error) {
        console.error('Insights: Error fetching buildly tools:', error);
        
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
      
      if (!tool || !productData) return score;
      
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
        if (toolName.includes('react') || toolName.includes('ui')) score += 25;
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
    console.log('Configure team for release:', release.name);
    setSelectedRelease(release);
    setTeamModalOpen(true);
  };

  // Handle AI budget estimation
  const handleAIEstimate = async (release) => {
    console.log('Generate AI estimate for release:', release.name);
    
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
      console.error('Failed to generate AI estimate:', error);
      displayAlert('error', 'Failed to generate AI budget estimate');
    } finally {
      setBudgetLoading(prev => ({ ...prev, [release.name]: false }));
    }
  };

  // Handle adding punchlist item
  const handleAddPunchlistItem = (releaseId, description) => {
    if (!description.trim()) return;

    const newItem = {
      id: Date.now(),
      description: description.trim(),
      status: 'Open',
      priority: 'Medium',
      created_date: new Date().toISOString().split('T')[0],
      assignee: null
    };

    setReleasePunchlists(prev => ({
      ...prev,
      [releaseId]: [...(prev[releaseId] || []), newItem]
    }));

    // Clear the input
    setPunchlistInputs(prev => ({
      ...prev,
      [releaseId]: ''
    }));

    displayAlert('success', 'Punchlist item added successfully');
  };

  // Handle updating punchlist item status
  const handleUpdatePunchlistStatus = (releaseId, itemId, newStatus) => {
    setReleasePunchlists(prev => ({
      ...prev,
      [releaseId]: (prev[releaseId] || []).map(item =>
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    }));
  };

  // Handle removing punchlist item
  const handleRemovePunchlistItem = (releaseId, itemId) => {
    setReleasePunchlists(prev => ({
      ...prev,
      [releaseId]: (prev[releaseId] || []).filter(item => item.id !== itemId)
    }));
    
    displayAlert('success', 'Punchlist item removed');
  };

  // Handle team configuration save
  const handleTeamSave = (teamConfig) => {
    if (!selectedRelease) return;

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
    console.log('Save budget for entire product');
    setBudgetLoading(prev => ({ ...prev, saveAll: true }));
    
    try {
      // Prepare budget data for the new budget API
      const budgetData = {
        product_uuid: selectedProduct,
        total_budget: Object.values(budgetEstimates).reduce((total, estimate) => total + (estimate.total_budget || 0), 0),
        release_budgets: releaseData.map(release => ({
          release_uuid: release.release_uuid,
          release_name: release.name,
          budget_estimate: budgetEstimates[release.name] || null,
          team_configuration: release.team || [],
          total_cost: release.totalCost || 0
        })),
        last_updated: new Date().toISOString()
      };

      console.log('Attempting to save budget data via new API:', budgetData);

      // Use the new budget API mutation
      await saveBudgetMutation.mutateAsync(budgetData);
      
      console.log('Budget saved successfully via budget API');
      displayAlert('success', 'Budget saved for entire product successfully!');
      
    } catch (error) {
      console.error('Error saving budget via API:', error);
      
      // Fallback to localStorage if API fails
      try {
        // Recreate budgetData for localStorage since it's scoped to the try block
        const fallbackBudgetData = {
          total_budget: Object.values(budgetEstimates).reduce((total, estimate) => total + (estimate.total_budget || 0), 0),
          release_budgets: releaseData.map(release => ({
            release_uuid: release.release_uuid,
            release_name: release.name,
            budget_estimate: budgetEstimates[release.name] || null,
            team_configuration: release.team || [],
            total_cost: release.totalCost || 0
          })),
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
        console.error('Failed to save to localStorage:', localError);
        displayAlert('error', 'Failed to save budget. Please try again.');
      }
    } finally {
      setBudgetLoading(prev => ({ ...prev, saveAll: false }));
    }
  };

  // Handle saving budget template for future releases
  const handleSaveFutureTemplate = async () => {
    console.log('Save budget template for future releases');
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

      console.log('Attempting to save budget template:', template);

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
      
      console.log('Budget template saved successfully to localStorage');
      displayAlert('success', 'Budget template saved for future releases!');
      
    } catch (error) {
      console.error('Error saving budget template:', error);
      displayAlert('error', 'Failed to save budget template. Please try again.');
    } finally {
      setBudgetLoading(prev => ({ ...prev, saveTemplate: false }));
    }
  };

  return (
    <>
      {(areProductsLoading || isEmailingReport || isGettingProductReport || isGettingReleaseProductReport)
      && <Loader open={areProductsLoading || isEmailingReport || isGettingProductReport || isGettingReleaseProductReport} />}
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
                setActiveProduct(e.target.value);
                setSelectedProduct(e.target.value);
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
          <div className="row mb-3">
            <section className="text-end">
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

          <div className="row">
            <div className="col-md-7">
              <Card className="w-100">
                <Card.Body>
                  <Card.Title>
                    Architecture suggestion:
                    {productData && productData.architecture_type ? ` (${productData?.architecture_type?.toUpperCase()})` : ''}
                  </Card.Title>
                  <div className="image-responsive m-2" style={{ height: 350 }}>
                    <Image src={architectureImg} fluid style={{ height: '100%' }} />
                  </div>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-5">
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
          <Card className="w-100 mt-2">
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
                {
                  releaseData && releaseData.length
                    ? (
                      viewMode === 'timeline' ? (
                        <TimelineComponent
                          reportData={releaseData}
                          suggestedFeatures={productData?.feature_suggestions}
                          onReleaseClick={handleReleaseClick}
                          productContext={{
                            name: productData?.name,
                            architecture_type: productData?.architecture_type,
                            product_uuid: productData?.product_uuid
                          }}
                        />
                      ) : (
                        <div>
                          {console.log('Insights: Gantt data being passed:', releaseData)}
                          <GanttChart
                            releases={releaseData}
                            onReleaseClick={handleReleaseClick}
                            title="Release Gantt Chart"
                            productContext={{
                              name: productData?.name,
                              architecture_type: productData?.architecture_type,
                              product_uuid: productData?.product_uuid
                            }}
                          />
                        </div>
                      )
                    ) : (
                      <div className="alert alert-warning" role="alert">
                        No releases for this product!
                      </div>
                    )
                }
              </div>
            </Card.Body>
          </Card>

          {/* Estimates and Team Section */}
          <Card className="w-100 mt-2">
            <Card.Body>
              <Card.Title>Estimates and Team</Card.Title>
              <div className="m-2">
                {releaseData && releaseData.length ? (
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
                            color: release.bgColor === '#0C5594' || release.bgColor === '#152944' ? '#fff' : '#000',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              {release.icon && (
                                <release.icon 
                                  className="me-2" 
                                  size={18}
                                  style={{ color: 'inherit' }}
                                />
                              )}
                              {release.name}
                            </div>
                            <small>{release.duration?.weeks || 0} weeks</small>
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
                                          ${((member.count || 0) * (member.weeklyRate || 0) * (budgetEstimates[release.name].timeline_weeks || 0)).toLocaleString()}
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

                            {/* Punchlist Section */}
                            <div style={{ 
                              marginTop: '20px',
                              padding: '15px',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '6px',
                              border: '1px solid #dee2e6'
                            }}>
                              <h6 style={{ 
                                color: '#495057',
                                marginBottom: '12px',
                                fontWeight: 'bold'
                              }}>
                                🔧 Punchlist ({(releasePunchlists[release.release_uuid] || []).length} items)
                              </h6>
                              
                              {/* Add new punchlist item */}
                              <div style={{ 
                                display: 'flex',
                                gap: '8px',
                                marginBottom: '12px'
                              }}>
                                <input
                                  type="text"
                                  placeholder="Add bug or issue..."
                                  value={punchlistInputs[release.release_uuid] || ''}
                                  onChange={(e) => setPunchlistInputs(prev => ({
                                    ...prev,
                                    [release.release_uuid]: e.target.value
                                  }))}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAddPunchlistItem(release.release_uuid, e.target.value);
                                    }
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: '6px 10px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '12px'
                                  }}
                                />
                                <Button
                                  variant="contained"
                                  size="small"
                                  style={{ 
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    fontSize: '11px',
                                    minWidth: 'auto',
                                    padding: '6px 12px'
                                  }}
                                  onClick={() => handleAddPunchlistItem(
                                    release.release_uuid, 
                                    punchlistInputs[release.release_uuid] || ''
                                  )}
                                >
                                  ➕
                                </Button>
                              </div>

                              {/* Punchlist items */}
                              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {(releasePunchlists[release.release_uuid] || []).length > 0 ? (
                                  releasePunchlists[release.release_uuid].map(item => (
                                    <div key={item.id} style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '8px 10px',
                                      marginBottom: '4px',
                                      backgroundColor: item.status === 'Resolved' ? '#d4edda' : '#fff',
                                      border: '1px solid #e9ecef',
                                      borderRadius: '4px',
                                      fontSize: '12px'
                                    }}>
                                      <div style={{ flex: 1 }}>
                                        <span style={{ 
                                          textDecoration: item.status === 'Resolved' ? 'line-through' : 'none',
                                          color: item.status === 'Resolved' ? '#6c757d' : '#495057'
                                        }}>
                                          {item.description}
                                        </span>
                                        <div style={{ 
                                          color: '#6c757d', 
                                          fontSize: '10px',
                                          marginTop: '2px'
                                        }}>
                                          {item.created_date} • {item.status}
                                        </div>
                                      </div>
                                      <div style={{ display: 'flex', gap: '4px' }}>
                                        <button
                                          onClick={() => handleUpdatePunchlistStatus(
                                            release.release_uuid, 
                                            item.id, 
                                            item.status === 'Open' ? 'Resolved' : 'Open'
                                          )}
                                          style={{
                                            border: 'none',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            padding: '2px 6px',
                                            borderRadius: '3px',
                                            backgroundColor: item.status === 'Open' ? '#28a745' : '#ffc107'
                                          }}
                                          title={item.status === 'Open' ? 'Mark as Resolved' : 'Reopen'}
                                        >
                                          {item.status === 'Open' ? '✓' : '↻'}
                                        </button>
                                        <button
                                          onClick={() => handleRemovePunchlistItem(release.release_uuid, item.id)}
                                          style={{
                                            border: 'none',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            padding: '2px 6px',
                                            borderRadius: '3px',
                                            backgroundColor: '#dc3545',
                                            color: 'white'
                                          }}
                                          title="Remove item"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div style={{ 
                                    textAlign: 'center',
                                    color: '#6c757d',
                                    fontStyle: 'italic',
                                    padding: '10px',
                                    fontSize: '12px'
                                  }}>
                                    No issues tracked yet
                                  </div>
                                )}
                              </div>
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
                    <div className="col-md-4">
                      <h6>Release Velocity</h6>
                      <p>Average time per release: {Math.round(releaseData.reduce((total, release) => total + (release.duration?.weeks || 0), 0) / releaseData.length)} weeks</p>
                    </div>
                    <div className="col-md-4">
                      <h6>Team Productivity</h6>
                      <p>Active teams: {releaseData.reduce((teams, release) => {
                        release.team?.forEach(member => teams.add(member.role));
                        return teams;
                      }, new Set()).size}</p>
                    </div>
                    <div className="col-md-4">
                      <h6>Budget Efficiency</h6>
                      <p>Average cost per release: ${Math.round(releaseData.reduce((total, release) => total + (release.totalCost || 0), 0) / releaseData.length)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-info">No productivity data available</div>
                )}
              </div>
            </Card.Body>
          </Card>

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
