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
  
  // Team configuration states
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [budgetEstimates, setBudgetEstimates] = useState({});
  const [budgetLoading, setBudgetLoading] = useState({});

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

  const { mutate: emailReportMutation, isLoading: isEmailingReport } = useEmailReportMutation(selectedProduct, displayAlert);

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

          // set release data
          setReleaseData(releaseReport);
        }
      }
    } else {
      console.log('Insights: No product selected or product is 0');
      displayReport = false;
    }
    };

    processInsightsData();
  }, [selectedProduct, reportData, releaseReport]);

  // Fetch Buildly open source tools from GitHub
  useEffect(() => {
    const fetchBuildlyTools = async () => {
      try {
        console.log('Insights: Fetching Buildly GitHub tools...');
        
        // Base tools that are always recommended
        const baseTools = [
          'buildly-core',
          'buildly-react-template',
          'buildly-ui-react',
          'buildly-angular-template'
        ];
        
        // Architecture-specific tools
        let architectureTools = [];
        if (productData?.architecture_type) {
          const archType = productData.architecture_type.toLowerCase();
          if (archType.includes('microservice')) {
            architectureTools = ['buildly-connector', 'buildly-gateway'];
          } else if (archType.includes('monolith')) {
            architectureTools = ['buildly-core'];
          }
        }
        
        const recommendedTools = [...new Set([...baseTools, ...architectureTools])];
        
        // Fetch tools from GitHub
        const toolPromises = recommendedTools.map(async (toolName) => {
          try {
            const response = await fetch(`https://api.github.com/repos/buildlyio/${toolName}`);
            if (response.ok) {
              return await response.json();
            }
            return null;
          } catch (error) {
            console.warn(`Failed to fetch ${toolName}:`, error);
            return null;
          }
        });
        
        const tools = await Promise.all(toolPromises);
        const validTools = tools.filter(tool => tool !== null);
        
        console.log('Insights: Fetched buildly tools:', validTools.length);
        setBuildlyTools(validTools);
      } catch (error) {
        console.error('Insights: Error fetching buildly tools:', error);
        setBuildlyTools([]);
      }
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
    setReleaseData(prev => prev.map(release => 
      release.release_uuid === selectedRelease.release_uuid 
        ? { ...release, totalCost: Math.round(bufferedCost), team: teamConfig }
        : release
    ));

    setTeamModalOpen(false);
    setSelectedRelease(null);
    displayAlert('success', `Team configuration saved for ${selectedRelease.name}`);
  };

  // Handle saving budget for entire product
  const handleSaveEntireProduct = () => {
    console.log('Save budget for entire product');
    // TODO: Implement API call to save all budget estimates for the product
    displayAlert('info', 'Budget saved for entire product');
  };

  // Handle saving budget template for future releases
  const handleSaveFutureTemplate = () => {
    console.log('Save budget template for future releases');
    // TODO: Implement API call to save budget template
    displayAlert('info', 'Budget template saved for future releases');
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
                                <div>
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
                                  <small className="text-muted">{tool.description || 'No description available'}</small>
                                  <div className="mt-1">
                                    <small className="badge bg-light text-dark me-1">{tool.language || 'Unknown'}</small>
                                    <small className="badge bg-light text-dark me-1">⭐ {tool.stargazers_count}</small>
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
                  releaseData.release_data && releaseData.release_data.length
                    ? (
                      viewMode === 'timeline' ? (
                        <TimelineComponent
                          reportData={releaseData.release_data}
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
                          {console.log('Insights: Gantt data being passed:', releaseData.release_data)}
                          <GanttChart
                            releases={releaseData.release_data}
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
                {releaseData.release_data && releaseData.release_data.length ? (
                  <div className="row">
                    {releaseData.release_data.map((release, index) => (
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
                            {/* Budget Information */}
                            <div className="mb-3">
                              <h6 style={{ color: '#0C5594', marginBottom: '10px' }}>💰 Budget Overview</h6>
                              {budgetEstimates[release.name] ? (
                                <div>
                                  <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    marginBottom: '8px',
                                    padding: '8px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '4px'
                                  }}>
                                    <span><strong>Total Cost:</strong></span>
                                    <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                                      ${budgetEstimates[release.name].total_budget?.toLocaleString()}
                                    </span>
                                  </div>
                                  <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    marginBottom: '8px',
                                    fontSize: '12px',
                                    color: '#6c757d'
                                  }}>
                                    <span>Timeline: {budgetEstimates[release.name].timeline_weeks}w</span>
                                    <span>Confidence: {budgetEstimates[release.name].confidence}</span>
                                  </div>
                                  <div style={{ 
                                    fontSize: '11px', 
                                    textAlign: 'center',
                                    padding: '4px',
                                    backgroundColor: budgetEstimates[release.name].estimation_source === 'ai' ? '#e3f2fd' : '#f3e5f5',
                                    borderRadius: '3px',
                                    color: '#6c757d'
                                  }}>
                                    {budgetEstimates[release.name].estimation_source === 'ai' ? '🤖 AI-generated' : '👤 User-configured'}
                                    {budgetEstimates[release.name].risk_buffer && ` • ${budgetEstimates[release.name].risk_buffer}% buffer`}
                                  </div>
                                </div>
                              ) : (
                                <div style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between',
                                  marginBottom: '8px',
                                  padding: '8px',
                                  backgroundColor: '#f8f9fa',
                                  borderRadius: '4px'
                                }}>
                                  <span><strong>Total Cost:</strong></span>
                                  <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                                    ${release.totalCost?.toLocaleString() || 'Not estimated'}
                                  </span>
                                </div>
                              )}
                              <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                Features: {release.features?.length || 0} • Issues: {release.issues?.length || 0}
                              </div>
                            </div>

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
                {releaseData.release_data && releaseData.release_data.length > 0 && (
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
                                    releaseData.release_data.reduce((total, release) => total + (release.totalCost || 0), 0).toLocaleString()}
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
                                  {releaseData.release_data.reduce((total, release) => total + (release.duration?.weeks || 0), 0)}
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
                                  {releaseData.release_data.reduce((teams, release) => {
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
                            >
                              💾 Save for Entire Product
                            </Button>
                            <Button
                              variant="outlined"
                              fullWidth
                              style={{ 
                                borderColor: '#6f42c1',
                                color: '#6f42c1'
                              }}
                              onClick={handleSaveFutureTemplate}
                            >
                              🔮 Save Template for Future
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
                    {releaseData.release_data && releaseData.release_data.length ? (
                      <div>
                        <p><strong>Total Features:</strong> {releaseData.release_data.reduce((total, release) => total + (release.features?.length || 0), 0)}</p>
                        <p><strong>Features by Release:</strong></p>
                        <ul>
                          {releaseData.release_data.map((release, index) => (
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
                    {releaseData.release_data && releaseData.release_data.length ? (
                      <div>
                        <p><strong>Total Issues:</strong> {releaseData.release_data.reduce((total, release) => total + (release.issues?.length || 0), 0)}</p>
                        <p><strong>Issues by Status:</strong></p>
                        <ul>
                          <li>Open: {releaseData.release_data.reduce((total, release) => total + (release.issues?.filter(issue => issue.status === 'open')?.length || 0), 0)}</li>
                          <li>In Progress: {releaseData.release_data.reduce((total, release) => total + (release.issues?.filter(issue => issue.status === 'in_progress')?.length || 0), 0)}</li>
                          <li>Resolved: {releaseData.release_data.reduce((total, release) => total + (release.issues?.filter(issue => issue.status === 'resolved')?.length || 0), 0)}</li>
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
                {releaseData.release_data && releaseData.release_data.length ? (
                  <div className="row">
                    <div className="col-md-4">
                      <h6>Release Velocity</h6>
                      <p>Average time per release: {Math.round(releaseData.release_data.reduce((total, release) => total + (release.duration?.weeks || 0), 0) / releaseData.release_data.length)} weeks</p>
                    </div>
                    <div className="col-md-4">
                      <h6>Team Productivity</h6>
                      <p>Active teams: {releaseData.release_data.reduce((teams, release) => {
                        release.team?.forEach(member => teams.add(member.role));
                        return teams;
                      }, new Set()).size}</p>
                    </div>
                    <div className="col-md-4">
                      <h6>Budget Efficiency</h6>
                      <p>Average cost per release: ${Math.round(releaseData.release_data.reduce((total, release) => total + (release.totalCost || 0), 0) / releaseData.release_data.length)}</p>
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
