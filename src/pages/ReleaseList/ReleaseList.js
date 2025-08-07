import React, { useContext, useEffect, useState } from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Dropdown, ProgressBar } from 'react-bootstrap';
import DoughnutChart from '@components/Charts/Doughnut/DoughnutChart';
import BarChart from '@components/Charts/BarChart/BarChart';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Collapse,
  IconButton,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { Modal, Form, Table } from 'react-bootstrap';
import Chatbot from '@components/Chatbot/Chatbot';
import Loader from '@components/Loader/Loader';
import AIFormHelper from '@components/AIFormHelper/AIFormHelper';
import { UserContext } from '@context/User.context';
import useAlert from '@hooks/useAlert';
import { routes } from '@routes/routesConstants';
import { getAllProductQuery } from '@react-query/queries/product/getAllProductQuery';
import { getAllReleaseQuery } from '@react-query/queries/release/getAllReleaseQuery';
import { getAllFeatureQuery } from '@react-query/queries/release/getAllFeatureQuery';
import { getAllIssueQuery } from '@react-query/queries/release/getAllIssueQuery';
import { getReleaseSummaryQuery } from '@react-query/queries/release/getReleaseSummaryQuery';
import { useCreateReleaseMutation } from '@react-query/mutations/release/createReleaseMutation';
import { useDeleteReleaseMutation } from '@react-query/mutations/release/deleteReleaseMutation';
import { useStore } from '@zustand/product/productStore';
import './ReleaseList.css';

const ReleaseList = () => {
  const user = useContext(UserContext);
  const organization = user.organization.organization_uuid;

  const { displayAlert } = useAlert();
  const { activeProduct, setActiveProduct } = useStore();

  const [selectedProduct, setSelectedProduct] = useState(activeProduct || 0);
  const [releasesSummary, setReleasesSummary] = useState(null);
  const [displayReleases, setDisplayReleases] = useState([]);

  const [selectedFeatures, setSelectedFeatures] = useState([]);

  const [showReleaseModal, setShow] = useState(false);
  const [formData, setFormData] = useState({});

  const uncheckedIcon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const { data: productData, isLoading: isAllProductLoading } = useQuery(
    ['allProducts', organization],
    () => getAllProductQuery(organization, displayAlert),
    { refetchOnWindowFocus: false },
  );

  const { data: releases, isLoading: isAllReleaseLoading } = useQuery(
    ['allReleases', selectedProduct],
    () => getAllReleaseQuery(selectedProduct, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(selectedProduct) && !_.isEqual(_.toNumber(selectedProduct), 0) },
  );

  const { data: features, isLoading: isAllFeatureLoading } = useQuery(
    ['allFeatures', selectedProduct],
    () => getAllFeatureQuery(selectedProduct, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(selectedProduct) && !_.isEqual(_.toNumber(selectedProduct), 0) },
  );

  const { data: issues, isLoading: isAllIssueLoading } = useQuery(
    ['allIssues', selectedProduct],
    () => getAllIssueQuery(selectedProduct, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(selectedProduct) && !_.isEqual(_.toNumber(selectedProduct), 0) },
  );

  const { data: releaseDetails, isLoading: isReleaseDetailsLoading } = useQuery(
    ['releaseSummary', selectedProduct],
    () => getReleaseSummaryQuery(null, selectedProduct, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(selectedProduct) && !_.isEqual(_.toNumber(selectedProduct), 0) },
  );

  const { mutate: createReleaseMutation, isLoading: isCreatingReleaseLoading } = useCreateReleaseMutation(selectedProduct, null, null, displayAlert);
  const { mutate: deleteReleaseMutation, isLoading: isDeletingReleaseLoading } = useDeleteReleaseMutation(selectedProduct, null, null, displayAlert);

  useEffect(() => {
    if (!_.isEmpty(releases)) {
      releases.sort((a, b) => b.release_date.localeCompare(a.release_date));

      let modifiedReleases = [];
      _.forEach(releases, (rel) => {
        modifiedReleases = [
          ...modifiedReleases,
          {
            ...rel,
            featuresList: _.filter(features, { release_uuid: rel.release_uuid }),
          },
        ];
      });
      setDisplayReleases(modifiedReleases);
    }
  }, [releases, features]);

  useEffect(() => {
    if (!_.isEmpty(releaseDetails)) {
      const issuesSummaryObj = generateBarChartData(
        releaseDetails.issues,
        'issues_data',
      );

      const featuresSummaryObj = generateBarChartData(
          releaseDetails.features,
        'features_data',
      );

      setReleasesSummary({
        releases: Object.values(releaseDetails.releases),
        features: featuresSummaryObj,
        issues: issuesSummaryObj,
      });
    }
  }, [releaseDetails]);

  const generateBarChartData = (data, dataField) => {
    const releaseNames = [];
    const barChartSummaryData = [
      {
        label: 'Completed',
        key: 'completed',
        backgroundColor: '#0D5595',
        data: [],
      },
      {
        label: 'In progress',
        key: 'in_progress',
        backgroundColor: '#F8943C',
        data: [],
      },
      {
        label: 'Overdue',
        key: 'overdue',
        backgroundColor: '#C91B1A',
        data: [],
      },
    ];

    data.forEach((entry) => {
      releaseNames.push(entry.release);
      Object.keys(entry[dataField]).forEach((key) => {
        const index = barChartSummaryData.findIndex(
          (summaryEntry) => summaryEntry.key === key,
        );
        if (index > -1) {
          barChartSummaryData[index].data.push(entry[dataField][key]);
        }
      });
    });
    return { releaseNames, barChartSummaryData };
  };

  const handleShow = () => {
    setFormData({
      ...formData,
      name: '',
      release_date: '',
    });
    setShow(true);
  };

  const handleClose = () => setShow(false);

  const handleAIGenerateRelease = async () => {
    console.log('Generate AI release from unfinished features');
    
    if (!selectedProduct) {
      displayAlert('warning', 'Please select a product first');
      return;
    }
    
    try {
      // Analyze unfinished features
      const unfinishedFeatures = features?.filter(feature => 
        feature.status !== 'Completed' && feature.status !== 'Released'
      ) || [];
      
      console.log('Unfinished features found:', unfinishedFeatures.length);
      
      if (unfinishedFeatures.length === 0) {
        displayAlert('info', 'No unfinished features found to create a release');
        return;
      }

      // Debug: Check feature structure
      console.log('Sample feature structure:', unfinishedFeatures[0]);
      console.log('Feature UUID field exists?', 'feature_uuid' in unfinishedFeatures[0]);
      console.log('Available feature keys:', Object.keys(unfinishedFeatures[0] || {}));

      // Find current product info for repository details
      const currentProduct = productData?.find(p => p.product_uuid === selectedProduct);
      console.log('Current product data:', currentProduct);
      
      // Get product info which might contain repository details
      let productInfo = {};
      try {
        productInfo = typeof currentProduct?.product_info === 'string' 
          ? JSON.parse(currentProduct.product_info) 
          : (currentProduct?.product_info || {});
      } catch (e) {
        console.warn('Failed to parse product_info:', e);
      }
      
      console.log('Product info:', productInfo);

      // Select high-priority unfinished features for the release
      const priorityFeatures = unfinishedFeatures
        .sort((a, b) => {
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        })
        .slice(0, Math.min(8, unfinishedFeatures.length)); // Limit to 8 features max

      // Create AI-suggested release
      const nextReleaseNumber = (releases?.length || 0) + 1;
      const releaseDate = new Date();
      releaseDate.setMonth(releaseDate.getMonth() + 3); // 3 months from now

      const releaseData = {
        name: `AI Release v${nextReleaseNumber}.0`,
        description: `AI-generated release based on ${priorityFeatures.length} high-priority unfinished features`,
        release_date: releaseDate.toISOString().split('T')[0],
        product_uuid: selectedProduct,
        features: priorityFeatures.map(f => f.feature_uuid || f.id), // Fallback to id if feature_uuid doesn't exist
        // Add repository information if available to prevent 500 error
        repository: productInfo.repository || currentProduct?.repository || 'default-repo',
        owner_name: productInfo.owner_name || currentProduct?.owner_name || currentProduct?.name || 'default-owner'
      };

      // Validate the release data
      if (!releaseData.name || !releaseData.release_date || !releaseData.product_uuid) {
        console.error('Missing required fields:', releaseData);
        displayAlert('error', 'Missing required fields for release creation');
        return;
      }

      console.log('Creating release with data:', releaseData);
      console.log('Features being sent:', releaseData.features);
      console.log('Repository info:', { repository: releaseData.repository, owner_name: releaseData.owner_name });
      createReleaseMutation(releaseData);
    } catch (error) {
      console.error('Failed to generate AI release:', error);
      displayAlert('error', 'Failed to generate AI release');
    }
  };

  const updateFormData = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const submitRelease = (event) => {
    event.preventDefault();
    if (selectedProduct) {
      const data = {
        ...formData,
        product_uuid: selectedProduct,
        features: _.map(selectedFeatures, (obj) => obj.feature_uuid),
      };
      createReleaseMutation(data);
      handleClose();
    }
  };

  const deleteRelease = (row) => {
    deleteReleaseMutation(row);
  };

  const pieChartLabels = ['Completed', 'Overdue', 'In progress'];
  const backgroundColor = '#02b844';
  const borderWidth = 1;
  const borderColor = '#000000';

  const initProgressBar = (row) => {
    const value = Math.round((row.features_done / row.features_count) * 100);
    // eslint-disable-next-line no-nested-ternary
    const theme = value > 74 ? 'info' : value > 40 ? 'warning' : 'danger';
    return { value, theme };
  };

  const Row = (props) => {
    const { row } = props;
    const [open, setOpen] = React.useState(false);

    let progressBarObj = {
      value: 0,
      theme: 'danger',
    };

    if (row.features_count > 0) {
      progressBarObj = initProgressBar(row);
    }

    return (
      <>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell>
            <Link to={`${routes.RELEASE}/${row.release_uuid}`}>{row.name}</Link>
            {' '}
          </TableCell>
          <TableCell>
            <Tooltip
              title={`${progressBarObj.value}% achieved`}
              placement="right-start"
            >
              <ProgressBar
                now={progressBarObj.value}
                label={`${progressBarObj.value}%`}
                variant={progressBarObj.theme}
              />
            </Tooltip>
          </TableCell>
          <TableCell align="center">{row.features_count}</TableCell>
          <TableCell align="center">{row.issues_count}</TableCell>
          <TableCell align="center">{row.release_date}</TableCell>
          <TableCell align="right">
            <Dropdown>
              <Dropdown.Toggle variant="light" id="dropdown-basic">
                <MoreVertIcon />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => deleteRelease(row)}>
                  Delete release
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell
            style={{
              paddingBottom: 0,
              paddingTop: 0,
              paddingLeft: 8,
              backgroundColor: '#f5f5f5',
            }}
            colSpan={12}
          >
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Table size="small" aria-label="features">
                  <TableHead>
                    <TableRow>
                      <TableCell width="12" />
                      <TableCell width="33%">Name</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell align="center">Complexity</TableCell>
                      <TableCell align="center">Issues</TableCell>
                      <TableCell align="right">Assignees</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row?.featuresList?.length > 0 ? (
                      row.featuresList.map((feature) => (
                        <FeatureRow
                          key={feature.feature_uuid}
                          feature={feature}
                        />
                      ))
                    ) : (
                      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                        <TableCell />
                        <TableCell>No features to display</TableCell>
                        <TableCell />
                        <TableCell />
                        <TableCell />
                        <TableCell />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  };

  const FeatureRow = (props) => {
    const { feature } = props;
    const [featureOpen, setFeatureOpen] = React.useState(false);
    const [relatedIssues, setRelatedIssues] = React.useState([]);

    useEffect(() => {
      setRelatedIssues(
        _.filter(
          issues,
          (issueItem) => _.isEqual(_.toString(issueItem.feature), _.toString(feature.feature_uuid)),
        ),
      );
    }, [feature]);

    return (
      <>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setFeatureOpen(!featureOpen)}
            >
              {featureOpen ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )}
            </IconButton>
          </TableCell>
          <TableCell>{feature.name}</TableCell>
          <TableCell>{feature.progress}</TableCell>
          <TableCell align="center">{feature.complexity}</TableCell>
          <TableCell align="center">{relatedIssues.length}</TableCell>
          <TableCell align="right">{feature.assignees}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell
            style={{
              paddingBottom: 0,
              paddingTop: 0,
              paddingLeft: 8,
              backgroundColor: '#f5f5f5',
            }}
            colSpan={12}
          >
            <Collapse in={featureOpen} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Table size="small" aria-label="features">
                  <TableHead>
                    <TableRow>
                      <TableCell width="33%">Name</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell align="center">Complexity</TableCell>
                      <TableCell align="right">Assignees</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {relatedIssues.length > 0 ? (
                      relatedIssues.map((issue) => (
                        <TableRow key={issue.issue_uuid}>
                          <TableCell>{issue.name}</TableCell>
                          <TableCell>{issue.progress}</TableCell>
                          <TableCell align="center">
                            {issue.complexity}
                          </TableCell>
                          <TableCell align="right">{issue.assignees}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                        <TableCell>No issues to display</TableCell>
                        <TableCell />
                        <TableCell />
                        <TableCell />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  };

  return (
    <>
      <Grid item xs={12} className="release-list-menu-right">
        <TextField
          variant="outlined"
          margin="normal"
          select
          id="selected-product"
          color="primary"
          label="Product Options"
          className="release-list-selected-product"
          value={selectedProduct}
          onChange={(e) => {
            setActiveProduct(e.target.value);
            setSelectedProduct(e.target.value);
          }}
        >
          <MenuItem value={0}>Select</MenuItem>
          {productData && !_.isEmpty(productData)
          && _.map(productData, (prod) => (
            <MenuItem
              key={`product-${prod.product_uuid}`}
              value={prod.product_uuid}
            >
              {prod.name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {(_.isEmpty(selectedProduct) || _.isEqual(_.toNumber(selectedProduct), 0)) && (
        <Typography className="release-list-no-product" component="div" variant="body1">
          No product selected yet. Please select a product to view related features and/or issues.
        </Typography>
      )}

      {(isAllProductLoading || isAllReleaseLoading || isAllFeatureLoading || isAllIssueLoading
      || isReleaseDetailsLoading || isCreatingReleaseLoading || isDeletingReleaseLoading) && (
        <Loader
          open={
              isAllProductLoading || isAllReleaseLoading || isAllFeatureLoading
              || isAllIssueLoading || isReleaseDetailsLoading
              || isCreatingReleaseLoading || isDeletingReleaseLoading
            }
        />
      )}
      {!_.isEmpty(selectedProduct) && !_.isEqual(_.toNumber(selectedProduct), 0) && (
        <>
          {' '}
          {!_.isEmpty(displayReleases) ? (
            <>
              <div className="d-flex justify-content-between">
                <Typography variant="h6">Releases summary</Typography>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handleShow}
                  >
                    New release
                  </Button>
                  <Button
                    type="button"
                    variant="contained"
                    size="small"
                    style={{ 
                      backgroundColor: '#9c27b0',
                      color: 'white'
                    }}
                    onClick={handleAIGenerateRelease}
                    disabled={isCreatingReleaseLoading}
                  >
                    🤖 AI Generate Release
                  </Button>
                </div>
              </div>
              {!_.isEmpty(releasesSummary) && (
                <div className="container-fluid charts-parent-container">
                  <div
                    className="row flex-nowrap justify-content-between"
                    style={{ height: '100%' }}
                  >
                    <div
                      className="chart-container"
                      style={{
                        width: '32%',
                      }}
                    >
                      <DoughnutChart
                        id="releases"
                        labels={pieChartLabels}
                        label="Releases summary"
                        data={releasesSummary.releases}
                      />
                    </div>
                    <div
                      className="chart-container"
                      style={{
                        width: '32%',
                      }}
                    >
                      <BarChart
                        id="features"
                        label="Features summary"
                        labels={releasesSummary.features.releaseNames}
                        data={releasesSummary.features.barChartSummaryData}
                        backgroundColor={backgroundColor}
                        borderWidth={borderWidth}
                        borderColor={borderColor}
                      />
                    </div>
                    <div
                      className="chart-container"
                      style={{
                        width: '32%',
                      }}
                    >
                      <BarChart
                        id="issues"
                        label="Issues summary"
                        labels={releasesSummary.issues.releaseNames}
                        data={releasesSummary.issues.barChartSummaryData}
                        backgroundColor={backgroundColor}
                        borderWidth={borderWidth}
                        borderColor={borderColor}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div className="d-flex justify-content-between">
                <Typography variant="h6">Releases</Typography>
              </div>
              <TableContainer component={Paper} className="mt-2">
                <Table aria-label="collapsible table">
                  <TableHead
                    sx={{
                      '& .MuiTableCell-root': {
                        backgroundColor: '#EDEDED',
                      },
                    }}
                  >
                    <TableRow
                      sx={{
                        '& th': {
                          fontWeight: '500',
                        },
                      }}
                    >
                      <TableCell width="12" />
                      <TableCell width="33%">Name</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell align="center">Features</TableCell>
                      <TableCell align="center">Issues</TableCell>
                      <TableCell align="center">Release date</TableCell>
                      <TableCell align="right" />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!_.isEmpty(displayReleases)
                      ? displayReleases.map((row) => (
                        <Row key={row.release_uuid} row={row} />
                      ))
                      : []}
                  </TableBody>
                </Table>
              </TableContainer>
              <div style={{ height: 100 }} />
            </>
          ) : (
            <>
              {' '}
              <div className="d-flex flex-column align-items-center justify-content-center h-50">
                <Typography variant="h6" className="text-center pb-2">
                  No releases to display for the current product.
                  {' '}
                  <br />
                  To get you started, create a release!
                </Typography>
                <Button
                  type="button"
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={handleShow}
                >
                  New release
                </Button>
              </div>
            </>
          )}
          <Modal
            show={showReleaseModal}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
            centered
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>New release</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {' '}
              <Form noValidate>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>Name*</Form.Label>
                  <Box display="flex" alignItems="center">
                    <Form.Control
                      size="sm"
                      type="text"
                      placeholder="Name"
                      name="name"
                      required
                      onChange={(event) => updateFormData(event)}
                      style={{ flex: 1 }}
                    />
                    <AIFormHelper
                      fieldType="release-title"
                      onSuggestion={(suggestion) => {
                        const event = { target: { name: 'name', value: suggestion } };
                        updateFormData(event);
                      }}
                      size="small"
                    />
                  </Box>
                </Form.Group>
                <Form.Group className="mb-3" controlId="description">
                  <Form.Label>Description</Form.Label>
                  <Box display="flex" alignItems="flex-start">
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="description"
                      onChange={(event) => updateFormData(event)}
                      style={{ flex: 1 }}
                    />
                    <AIFormHelper
                      fieldType="release-description"
                      onSuggestion={(suggestion) => {
                        const event = { target: { name: 'description', value: suggestion } };
                        updateFormData(event);
                      }}
                      size="small"
                      context={{ releaseName: formData.name }}
                    />
                  </Box>
                </Form.Group>
                <Form.Group className="mb-3" controlId="date">
                  <Form.Label>Release date*</Form.Label>
                  <Form.Control
                    size="sm"
                    type="date"
                    placeholder="Release date"
                    name="release_date"
                    required
                    onChange={(event) => updateFormData(event)}
                  />
                </Form.Group>
                <Form.Group
                  className="mb-3 releaseFeaturesAdd"
                  controlId="features"
                >
                  <Form.Label>Add Features</Form.Label>
                  <Autocomplete
                    multiple
                    id="features-multiple"
                    disableCloseOnSelect
                    filterSelectedOptions
                    options={_.orderBy(features, ['name'], ['asc'])}
                    getOptionLabel={(option) => option && option.name}
                    value={selectedFeatures}
                    onChange={(event, newValue) => {
                      if (_.size(newValue) > _.size(selectedFeatures)) {
                        setSelectedFeatures([
                          ...selectedFeatures,
                          _.last(newValue),
                        ]);
                      } else {
                        setSelectedFeatures(newValue);
                      }
                    }}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          icon={uncheckedIcon}
                          checkedIcon={checkedIcon}
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        {option.name}
                      </li>
                    )}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                type="button"
                variant="outlined"
                color="primary"
                size="small"
                onClick={handleClose}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="contained"
                color="primary"
                size="small"
                disabled={
                  !(
                    formData?.name?.trim().length > 0
                    && formData?.release_date?.length > 0
                    && selectedFeatures.length > 0
                  )
                }
                onClick={(event) => submitRelease(event)}
              >
                Save
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}

      <Chatbot />
    </>
  );
};

export default ReleaseList;
