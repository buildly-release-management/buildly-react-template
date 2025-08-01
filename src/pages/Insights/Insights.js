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
import { addColorsAndIcons, getReleaseBudgetData } from './utils';

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
          
          // get release data - handle null budget properly
          const budgetReleaseData = reportData.budget?.release_data || [];
          releaseReport.release_data = getReleaseBudgetData(
            budgetReleaseData, releaseReport?.release_data,
          );

          releaseReport.release_data = addColorsAndIcons(
            releaseReport.release_data,
          );

          // set release data
          setReleaseData(releaseReport);
        }
      }
    } else {
      console.log('Insights: No product selected or product is 0');
      displayReport = false;
    }
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
                        />
                      ) : (
                        <GanttChart
                          releases={releaseData.release_data}
                          onReleaseClick={handleReleaseClick}
                          title="Release Gantt Chart"
                        />
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
          <Card className="w-100 mt-2 mb-4">
            <Card.Body>
              <Card.Title>Budget estimate</Card.Title>
              <div className="m-2 row">
                <div className="col-md-7">
                  <Card className="mb-2 row">
                    <Card.Body>
                      <div className="m-2">
                        <RangeSlider rangeValues={productData?.budget_range} />
                      </div>
                    </Card.Body>
                  </Card>
                  <Card className="row">
                    <Card.Body>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>PLATFORM DEV EXPENSES</th>
                            <th colSpan="2">BUDGET</th>
                          </tr>
                          <tr>
                            <th className="light-header">Payroll</th>
                            <th className="light-header">Monthly ($)</th>
                            <th className="light-header">Total ($)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                          productData && productData.budget && productData.budget?.total_roles_budget.map(
                            (item, index) => (
                              <tr key={`budget-${index}`}>
                                <td>{item.role}</td>
                                <td>{`$${item.monthly_budget}`}</td>
                                <td>{`$${item.budget}`}</td>
                              </tr>
                            ),
                          )
                        }
                          <tr>
                            <th className="text-right totals-header">Payroll Total</th>
                            <th className="totals-header">
                              {`$${(productData && productData.budget
                              && productData.budget?.total_monthly_budget) || '0.00'}`}
                            </th>
                            <th className="totals-header">
                              {`$${(productData && productData.budget
                              && productData.budget?.total_budget) || '0.00'}`}
                            </th>
                          </tr>
                        </tbody>
                        <thead>
                          <tr>
                            <th className="light-header">Additional</th>
                            <th className="light-header">Monthly ($)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                          productData && productData.budget
                          && productData.budget.other_costs?.map(
                            (item, index) => (
                              <tr key={`add-${index}`}>
                                <td>{item.item}</td>
                                <td>{`$${item.cost}`}</td>
                              </tr>
                            ),
                          )
                        }
                          <tr>
                            <th className="text-right totals-header">Additional Total</th>
                            <th className="totals-header">
                              {`$${(productData && productData.budget
                              && productData.budget?.other_costs_total) || '0.00'}`}
                            </th>
                          </tr>
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </div>
                <div className="col-md-5 row">
                  {(
                    releaseData && releaseData.release_data && releaseData.release_data.map(
                      (releaseItem, index) => (
                        <div className="col-md-6" style={{ marginBottom: 20 }} key={`rc-${index}`}>
                          <ListGroup as="ul">
                            <ListGroup.Item
                              as="li"
                              style={{
                                backgroundColor: releaseItem.bgColor,
                                color: releaseItem.bgColor === '#0C5594'
                                || releaseItem.bgColor === '#152944'
                                  ? '#fff'
                                  : '#000',
                              }}
                            >
                              <div className="d-flex align-items-center">
                                {releaseItem.icon && (
                                  <releaseItem.icon 
                                    className="me-2" 
                                    size={16}
                                    style={{ color: 'inherit' }}
                                  />
                                )}
                                <b>{releaseItem.name}</b>
                              </div>
                            </ListGroup.Item>
                            <ListGroup.Item as="li">
                              <strong>
                                {`${releaseItem?.duration?.weeks || 'N/A'} Weeks`}
                              </strong>
                            </ListGroup.Item>
                            {(
                              releaseItem?.team && Array.isArray(releaseItem.team) && releaseItem.team.map(
                                (team, idx) => (
                                  <ListGroup.Item
                                    key={`team-${idx}`}
                                    as="li"
                                    disabled
                                  >
                                    {`${team?.count || 0} ${team?.role || 'Member'}`}
                                  </ListGroup.Item>
                                ),
                              )
                            )}
                            <ListGroup.Item as="li">
                              <b>
                                {
                                  `Cost: ${releaseItem?.totalCost || 'N/A'}`
                                }
                              </b>
                            </ListGroup.Item>
                          </ListGroup>
                        </div>
                      ),
                    )
                  )}
                </div>
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
      <Chatbot />
    </>
  );
};

export default Insights;
