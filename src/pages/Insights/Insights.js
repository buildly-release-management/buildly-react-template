import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
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
import FlowChartComponent from '@components/FlowChart/FlowChart';
import Chatbot from '@components/Chatbot/Chatbot';
import { httpService } from '@modules/http/http.service';

// architecture designs
import microservice from '@assets/architecture-suggestions/GCP - MicroServices.png';
import monolith from '@assets/architecture-suggestions/GCP - Monolithic.png';
import multiCloud from '@assets/architecture-suggestions/GCP - MicroServices w_ DataPipeline.png';
import microApp from '@assets/architecture-suggestions/Digital Ocean - MicroApp w_ FrontEnd.png';
import { addColorsAndIcons, getReleaseBudgetData } from './utils';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Grid, TextField, Typography } from '@mui/material';
import { getAllProducts } from '@redux/product/actions/product.actions';

const Insights = ({
  dispatch,
  reduxLoading,
  user,
  products,
}) => {
  let displayReport = true;
  const activeProd = localStorage.getItem('activeProduct');

  // states
  const [selectedProduct, setSelectedProduct] = useState(activeProd || 0);
  const [productData, setProductData] = useState([]);
  const [releaseData, setReleaseData] = useState([]);
  const [architectureImg, setArchitectureImg] = useState(null);
  const [loading, setLoading] = useState(false);

  // Email report modal
  const [showEmailModal, setShow] = useState(false);
  const closeEmailModal = () => setShow(false);
  const openEmailModal = () => {
    closeDownloadMenu();
    setRecipients([{
      name: '',
      email: ''
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
      email: ''
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
      httpService.sendDirectServiceRequest(
        `pdf_report/${selectedProduct}/`,
        'POST',
        {
          senders_name: `${user.first_name} ${user.last_name}`,
          senders_title: user.title,
          company_name: user.organization.name,
          contact_information: user.contact_info,
          recipients,
        },
        'product',
      )
        .then((response) => (
          <Alert key="success" variant="success">
            Report successfully emailed!
          </Alert>
        ));
    } catch (error) {
      console.log(error);
    }
  };

  // effects
  useEffect(() => {
    dispatch(getAllProducts(user.organization.organization_uuid));
  }, [user]);

  useEffect(() => {
    if (selectedProduct && _.toNumber(selectedProduct) !== 0) {
      setLoading(true);
      // define requests
      const requestsArray = [];
      // Load product data
      [`product/${selectedProduct}/report/`, `product_report/${selectedProduct}/`].forEach(
        (url, index) => {
          if (index === 0) {
            requestsArray.push(
              httpService.sendDirectServiceRequest(
                `product/${selectedProduct}/report/`,
                'GET',
                null,
                'product',
              ),
            );
          } else {
            requestsArray.push(
              httpService.sendDirectServiceRequest(
                `product_report/${selectedProduct}/`,
                'GET',
                null,
                'release',
              ),
            );
          }
        },
      );
      // handle promises
      Promise.all(requestsArray)
        .then((results) => {
          const reportData = results[0].data;
          const releaseReport = results[1].data;

          if (reportData && reportData.budget) {
            // set the image to display
            let img = null;
            if (reportData.architecture_type.toLowerCase() === 'monolith') {
              img = monolith;
            } else if (reportData.architecture_type.toLowerCase() === 'microservice') {
              img = microservice;
            } else if (['micro-app', 'mini-app'].includes(reportData.architecture_type.toLowerCase())) {
              img = microApp;
            } else if (reportData.architecture_type.toLowerCase() === 'multicloud microservice') {
              img = multiCloud;
            }
            // set states
            setProductData(reportData);
            setArchitectureImg(img);

            // get release data
            releaseReport.release_data = getReleaseBudgetData(
              reportData.budget?.release_data, releaseReport?.release_data,
            );

            releaseReport.release_data = addColorsAndIcons(
              releaseReport.release_data,
            );

            // set release data
            setReleaseData(releaseReport);
            setLoading(false);
          }
        })
        .catch((error) => {
          setLoading(false);
          displayReport = false;
        });
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

  // Set selected product
  const setActiveProduct = (prod) => {
    localStorage.setItem('activeProduct', prod);
    setSelectedProduct(prod);
  };

  return (
    <>
      {loading && <Loader open={loading || reduxLoading}/>}
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
                endIcon={<KeyboardArrowDownIcon/>}
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
                    <Image src={architectureImg} fluid style={{ height: '100%' }}/>
                  </div>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-5">
              <Card className="w-100">
                <Card.Body>
                  <Card.Title>Buidly components</Card.Title>
                  <div className="w-100 m-2">
                    <FlowChartComponent
                      componentsData={productData && productData.components_tree}/>
                  </div>
                </Card.Body>
              </Card>

            </div>
          </div>
          <Card className="w-100 mt-2">
            <Card.Body>
              <Card.Title>Timeline</Card.Title>
              <div className="m-2">
                {
                  releaseData.release_data && releaseData.release_data.length
                    ? (
                      <TimelineComponent
                        reportData={releaseData.release_data}
                        suggestedFeatures={productData?.feature_suggestions}
                      />
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
                        <RangeSlider rangeValues={productData?.budget_range}/>
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
                              <b>{releaseItem.name}</b>
                            </ListGroup.Item>
                            <ListGroup.Item as="li">
                              <strong>
                                {`${releaseItem?.duration.weeks} Weeks`}
                              </strong>
                            </ListGroup.Item>
                            {(
                              releaseItem?.team && releaseItem?.team.map(
                                (team, idx) => (
                                  <ListGroup.Item
                                    key={`team-${idx}`}
                                    as="li"
                                    disabled
                                  >
                                    {`${team.count} ${team.role}`}
                                  </ListGroup.Item>
                                ),
                              )
                            )}
                            <ListGroup.Item as="li">
                              <b>
                                {
                                  `Cost: ${releaseItem?.totalCost}`
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
                                onChange={(event) => updateRecipients(event, index)}/>
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

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  reduxLoading: state.authReducer.loading || state.productReducer.loading,
  user: state.authReducer.data,
  products: state.productReducer.products,
});

export default connect(mapStateToProps)(Insights);

