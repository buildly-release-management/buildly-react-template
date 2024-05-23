import React, { useEffect, useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';

import Image from 'react-bootstrap/Image';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import './Report.css';

import Loader from '@components/Loader/Loader';
import TimelineComponent from '@components/Timeline/TimelineComponent';
import RangeSlider from '@components/RangeSlider/RangeSlider';
import FlowChartComponent from '@components/FlowChart/FlowChart';
import { httpService } from '@modules/http/http.service';

// architecture designs
import microservice from '@assets/architecture-suggestions/GCP - MicroServices.png';
import monolith from '@assets/architecture-suggestions/GCP - Monolithic.png';
import multiCloud from '@assets/architecture-suggestions/GCP - MicroServices w_ DataPipeline.png';
import microApp from '@assets/architecture-suggestions/Digital Ocean - MicroApp w_ FrontEnd.png';
import { addColorsAndIcons, getReleaseBudgetData } from '@pages/Roadmap/components/Report/utils';

import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Chip from '@mui/material/Chip';
import { Autocomplete } from '@mui/lab';
import { TextField } from '@mui/material';
import { showAlert } from '../../../../redux/alert/actions/alert.actions';
import { dispatch } from '../../../../redux/store';

const Report = ({ selectedProduct }) => {
  let displayReport = true;

  // states
  const [productData, setProductData] = useState([]);
  const [releaseData, setReleaseData] = useState([]);
  const [architectureImg, setArchitectureImg] = useState(null);
  const [loading, setLoading] = useState(false);

  // Email report modal
  const [showEmailModal, setShow] = useState(false);
  const closeEmailModal = () => setShow(false);
  const openEmailModal = () => {
    closeDownloadMenu();
    setShow(true);
  };

  const [formData, setFormData] = useState({ message: '', emails: [] });
  const updateFormData = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const setEmails = (emailAddresses) => {
    setFormData({
      ...formData,
      emails: emailAddresses,
    });
  };

  const emailReport = (event) => {
    event.preventDefault();
    try {
      closeEmailModal();
      httpService.sendDirectServiceRequest(
        `pdf_report/${selectedProduct}/`,
        'POST',
        {
          email: formData.emails,
        },
        'product',
      )
        .then((response) => {
          dispatch(showAlert({
            type: 'success',
            open: true,
            message: 'PDF report successfully sent!',
          }));

          setFormData({
            ...formData,
            emails: [],
            message: '',
          });
        });
    } catch { }
  };

  // effects
  useEffect(() => {
    if (selectedProduct) {
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
          setLoading(false);
          const reportData = results[0].data;
          const releaseReport = JSON.parse(JSON.stringify(results[1].data));

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
            releaseReport.release_budget = getReleaseBudgetData(
              reportData.budget?.team_data,
              releaseReport.release_data,
            );

            releaseReport.release_budget = addColorsAndIcons(
              JSON.parse(JSON.stringify(releaseReport.release_budget)),
            );
            // set release data
            setReleaseData(releaseReport);
          }
        })
        .catch((error) => {
          setLoading(false);
          displayReport = false;
        });
    }
  }, []);

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

  if (selectedProduct && displayReport) {
    return (
      <>
        {loading && <Loader open={loading} />}
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
                  {`Architecture suggestion: (${productData?.architecture_type?.toUpperCase()})`}
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
                <Card.Title>Buidly components</Card.Title>
                <div className="w-100 m-2">
                  <FlowChartComponent componentsData={productData && productData.components_tree} />
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
                releaseData.release_budget && releaseData.release_budget.length
                  ? (
                    <TimelineComponent
                      reportData={releaseData.release_budget}
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
                          <th>BUDGET</th>
                        </tr>
                        <tr>
                          <th className="light-header">Payroll</th>
                          <th className="light-header">Monthly ($)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          productData && productData.budget && productData.budget?.team_data.map(
                            (item, index) => (
                              <tr key={`budget-${index}`}>
                                <td>{item.role}</td>
                                <td>{`$${item.budget}`}</td>
                              </tr>
                            ),
                          )
                        }
                        <tr>
                          <th className="text-right totals-header">Payroll Total</th>
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
                              && productData.budget?.total_costs) || '0.00'}`}
                          </th>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-5 row">
                {(
                  releaseData && releaseData.release_budget && releaseData.release_budget.map(
                    (releaseItem, index) => (
                      <div className="col-md-6" key={`rc-${index}`}>
                        <ListGroup as="ul">
                          <ListGroup.Item
                            as="li"
                            style={{ backgroundColor: releaseItem.bgColor }}
                          >
                            <b>{releaseItem.name}</b>
                          </ListGroup.Item>
                          <ListGroup.Item as="li">
                            <strong>
                              {`${releaseItem?.duration.weeks} Weeks`}
                            </strong>
                          </ListGroup.Item>
                          {(
                            releaseItem.team && releaseItem.team.map(
                              (team, idx) => (
                                <ListGroup.Item
                                  key={`team-${idx}`}
                                  as="li"
                                  disabled
                                >
                                  {`${team.count} ${team.title}`}
                                </ListGroup.Item>
                              ),
                            )
                          )}
                          <ListGroup.Item as="li">
                            <b>
                              {
                                `Cost: $${(releaseItem.totalCost || 0.00) * releaseItem?.duration.months}`
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
          dialogClassName="modal-60w"
        >
          <Modal.Header closeButton>
            <Modal.Title>Email report</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form noValidate>
              <Form.Group className="mb-3" controlId="email">
                {/* <Form.Label>Email addresses</Form.Label> */}
                <Autocomplete
                  clearIcon={false}
                  options={[]}
                  freeSolo
                  multiple
                  value={formData.emails}
                  onChange={(e, newValue) => setEmails(newValue)}
                  renderTags={(value, props) => value.map((option, index) => (
                    <Chip label={option} {...props({ index })} />
                  ))}
                  renderInput={(params) => <TextField label="Add an email address and press enter" {...params} />}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="message">
                <Form.Label>Message</Form.Label>
                <Form.Control as="textarea" rows={3} name="message" onChange={(event) => updateFormData(event)} />
              </Form.Group>
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
              disabled={!formData?.emails?.length}
              onClick={(event) => emailReport(event)}
            >
              Email report
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }

  return (
    <Alert variant="warning">
      There was a problem loading report data
    </Alert>
  );
};

export default Report;
