/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import { makeStyles } from '@mui/styles';
import {
  Button, Grid, MenuItem, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import { Sync as SyncIcon } from '@mui/icons-material';
import Chatbot from '@components/Chatbot/Chatbot';
import ConfirmModal from '@components/Modal/ConfirmModal';
import Loader from '@components/Loader/Loader';
import { routes } from '@routes/routesConstants';
import {
  clearProductRelatedProductData, getAllCredentials, getAllProducts, getBoard, updateProduct,
} from '@redux/product/actions/product.actions';
import {
  clearProductRelatedReleaseData,
  createFeature,
  deleteFeature,
  deleteIssue,
  getAllComments,
  getAllFeatures,
  getAllIssues,
  getAllStatuses,
  thirdPartyToolSync, getAllReleases,
} from '@redux/release/actions/release.actions';
import Kanban from './components/Kanban';
import Tabular from './components/Tabular';
import AddFeatures from './forms/AddFeatures';
import AddIssues from './forms/AddIssues';
import Comments from './forms/Comments';
import IssueSuggestions from './forms/IssueSuggestions';
import StatusBoard from './forms/StatusBoard';
import ToolBoard from './forms/ToolBoard';
import ShowRelatedIssues from './forms/ShowRelatedIssues';

const useStyles = makeStyles((theme) => ({
  firstTimeMessage: {
    textAlign: 'center',
    padding: '25% 10%',
  },
  firstTimeButton: {
    marginTop: theme.spacing(2),
  },
  roadmapRoot: {
    marginTop: theme.spacing(2),
  },
  menuRight: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  selectedProduct: {
    width: theme.spacing(31.25),
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '& .MuiInputBase-input': {
      paddingTop: theme.spacing(1.2),
      paddingBottom: theme.spacing(1.2),
    },
  },
  viewTabs: {
    '& .MuiTabs-root': {
      color: theme.palette.contrast.text,
      '& .Mui-selected': {
        color: theme.palette.secondary.main,
      },
      '& .MuiTabs-indicator': {
        backgroundColor: theme.palette.secondary.main,
      },
    },
  },
  configBoard: {
    margin: '10%',
    textAlign: 'center',
  },
  configBoardButton: {
    marginTop: theme.spacing(1),
  },
  syncDataFromTools: {
    height: theme.spacing(6),
    marginRight: theme.spacing(2),
  },
}));

const ProductRoadmap = ({
  history,
  loading,
  loaded,
  user,
  dispatch,
  products,
  features,
  credentials,
  statuses,
  dataSynced,
}) => {
  const classes = useStyles();
  const subNav = [
    {
      label: 'Tabular',
      value: 'tabular',
    },
    {
      label: 'Kanban',
      value: 'kanban',
    },
  ];
  const viewPath = (
    subNav.find((item) => location.pathname.endsWith(item.value))
    || subNav.find((item) => item.value.toLowerCase() === 'tabular')
  ).value;
  const [view, setView] = useState(viewPath);
  const [selectedProduct, setSelectedProduct] = useState((history && history.location
    && history.location.state && history.location.state.selected_product) || 0);
  const [product, setProduct] = useState(null);
  const [upgrade, setUpgrade] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteItemID, setDeleteItemID] = useState({
    id: 0,
    type: 'feat',
  });
  const [isDataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    history.push(`/app/product-roadmap/${view || location.state}`);
  }, [view]);

  useEffect(() => {
    dispatch(getAllProducts(user.organization.organization_uuid));
  }, [user]);

  useEffect(() => {
    if (selectedProduct && !!selectedProduct && _.toNumber(selectedProduct) !== 0) {
      dispatch(getAllStatuses(selectedProduct));
      dispatch(getAllReleases(selectedProduct));
      dispatch(getAllFeatures(selectedProduct));
      dispatch(getAllIssues(selectedProduct));
      dispatch(getAllCredentials(selectedProduct));
      dispatch(getAllComments(selectedProduct));
    } else {
      dispatch(clearProductRelatedProductData());
      dispatch(clearProductRelatedReleaseData());
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (selectedProduct && !!selectedProduct && (_.size(features) >= 5)
      && user && user.organization && !user.organization.unlimited_free_plan) {
      setUpgrade(true);
    } else {
      setUpgrade(false);
    }
  }, [selectedProduct, features, dataSynced]);

  useEffect(() => {
    if (selectedProduct && !!selectedProduct && _.toNumber(selectedProduct) !== 0) {
      setProduct(_.find(products, { product_uuid: selectedProduct }));
    }
  }, [selectedProduct, products]);

  useEffect(() => {
    if (selectedProduct && !!selectedProduct && _.toNumber(selectedProduct) !== 0) {
      dispatch(getBoard(selectedProduct));
    } else {
      const activeProd = localStorage.getItem('activeProduct');
      if (activeProd) {
        setSelectedProduct(activeProd);
      }
    }
  }, [selectedProduct, statuses]);

  const setActiveProduct = (prod) => {
    localStorage.setItem('activeProduct', prod);
    setSelectedProduct(prod);
  };

  const addItem = (type) => {
    let path;
    if (type === 'feat') {
      path = routes.ADD_FEATURE;
    } else if (type === 'issue') {
      path = routes.ADD_ISSUE;
    }
    history.push(path, {
      from: location.pathname,
      product_uuid: selectedProduct,
    });
  };

  const editItem = (item, type, viewOnly = false) => {
    let path;
    if (type === 'feat') {
      path = `${viewOnly ? routes.VIEW_FEATURE : routes.EDIT_FEATURE}:${item.feature_uuid}`;
    } else if (type === 'issue') {
      path = `${routes.EDIT_ISSUE}:${item.issue_uuid}`;
    }
    history.push(path, {
      type: viewOnly ? 'view' : 'edit',
      from: location.pathname,
      data: item,
      product_uuid: selectedProduct,
    });
  };

  const deleteItem = (item, type) => {
    const deleteID = type === 'feat'
      ? item.feature_uuid
      : item.issue_uuid;
    setDeleteItemID({
      id: deleteID,
      type,
    });
    setOpenDeleteModal(true);
  };

  const handleDeleteModal = () => {
    const {
      id,
      type,
    } = deleteItemID;
    const featCred = _.find(credentials, (cred) => (_.toLower(cred.auth_detail.tool_type) === 'feature'));
    const issueCred = _.find(credentials, (cred) => (_.toLower(cred.auth_detail.tool_type) === 'issue'));
    if (type === 'feat') {
      const deleteCred = {
        ...featCred?.auth_detail,
        feature_uuid: id,
      };
      dispatch(deleteFeature(deleteCred));
    } else if (type === 'issue') {
      const deleteCreds = {
        ...issueCred?.auth_detail,
        issue_uuid: id,
      };
      dispatch(deleteIssue(deleteCreds));
    }
    setOpenDeleteModal(false);
  };

  const commentItem = (item) => {
    let data = { from: location.pathname };
    if (item.issue_uuid) {
      data = {
        ...data,
        issue: item,
      };
    } else {
      data = {
        ...data,
        feature: item,
      };
    }
    history.push(routes.COMMENTS, { ...data });
  };

  const issueSuggestions = (item) => {
    history.push(routes.ISSUE_SUGGESTIONS, {
      type: 'show',
      from: location.pathname,
      product_uuid: selectedProduct,
      data: item,
    });
  };

  const convertIssue = (item, type) => {
    let path;
    if (type === 'convert') {
      path = routes.FEATURE_TO_ISSUE;
    }
    history.push(path, {
      type: 'convert',
      from: location.pathname,
      product_uuid: selectedProduct,
      data: item,
    });
  };

  const createSuggestedFeature = (suggestion) => {
    const datetime = new Date();
    const featCred = _.find(credentials, (cred) => (_.toLower(cred.auth_detail.tool_type) === 'feature'));
    const formData = {
      create_date: datetime,
      edit_date: datetime,
      name: suggestion.suggested_feature,
      description: suggestion.suggested_feature,
      product_uuid: selectedProduct,
      ...featCred?.auth_detail,
      feature_detail: {},
    };
    if (suggestion.suggested_issue) {
      formData.suggestions = [{
        name: suggestion.suggested_issue,
        description: suggestion.suggested_issue,
        ticket_type: suggestion.issue_repo_type,
      }];
    }
    dispatch(createFeature(formData));
    removeSuggestedFeature(suggestion);
  };

  const removeSuggestedFeature = (suggestion) => {
    const formData = {
      ...product,
      product_info: {
        ...product.product_info,
        suggestions: _.without(product.product_info.suggestions, suggestion),
      },
    };
    dispatch(updateProduct(formData));
  };

  const configureBoard = () => {
    history.push(routes.TOOL_BOARD, {
      from: location.pathname,
      product_uuid: selectedProduct,
    });
  };

  const configureStatus = () => {
    history.push(routes.STATUS_BOARD, {
      from: location.pathname,
      product_uuid: selectedProduct,
    });
  };

  const syncDataFromTools = (e) => {
    e.preventDefault();
    const featCred = _.find(credentials, (cred) => (_.toLower(cred.auth_detail.tool_type) === 'feature'));
    const issueCred = _.find(credentials, (cred) => (_.toLower(cred.auth_detail.tool_type) === 'issue'));

    if (!_.isEmpty(product) && (!_.isEmpty(featCred) || !_.isEmpty(issueCred))) {
      let creds = [];

      if (!_.isEmpty(product.feature_tool_detail) && !_.isEmpty(featCred)) {
        creds = [
          ...creds,
          {
            ...featCred?.auth_detail,
            product_uuid: selectedProduct,
            board_id: product.feature_tool_detail.board_detail?.board_id,
          },
        ];
      }

      if (!_.isEmpty(product.issue_tool_detail) && !_.isEmpty(issueCred)) {
        creds = [
          ...creds,
          {
            ...issueCred?.auth_detail,
            product_uuid: selectedProduct,
            board_id: product.issue_tool_detail.board_detail?.board_id,
            repo_list: _.map(product.issue_tool_detail.repository_list, 'name'),
          },
        ];
      }

      dispatch(thirdPartyToolSync(creds));
    }
  };

  const showRelatedIssues = (feature_uuid) => {
    history.push(routes.SHOW_RELATED_ISSUES, {
      from: location.pathname,
      feature_uuid,
    });
  };

  return (
    <>
      {(loading || !loaded || !user || isDataLoading) ? <Loader open={loading || !loaded || !user || isDataLoading} /> : (
        user.survey_status === true ? (
          <div className={classes.roadmapRoot}>
            <Grid container mb={2} alignItems="center">
              <Grid item md={4}>
                <Typography variant="h4">
                  Product Roadmap
                </Typography>
              </Grid>
              <Grid item md={8} className={classes.menuRight}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  select
                  id="selected-product"
                  color="primary"
                  label="Product Options"
                  className={classes.selectedProduct}
                  value={selectedProduct}
                  onChange={(e) => {
                    if (e.target.value === -1) {
                      history.push(routes.NEW_PRODUCT, {
                        from: routes.PRODUCT_ROADMAP_TABULAR,
                      });
                    } else {
                      setActiveProduct(e.target.value);
                    }
                  }}
                >
                  <MenuItem value={0}>Select</MenuItem>
                  <MenuItem value={-1}>Create New Product</MenuItem>
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
                {
                  (
                    product && !_.isEmpty(product.third_party_tool)
                    && _.includes(_.uniq(_.map(statuses, 'product_uuid')), selectedProduct) && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={syncDataFromTools}
                        className={classes.syncDataFromTools}
                      >
                        <SyncIcon />
                        {' '}
                        Sync Data from Tool(s)
                      </Button>
                    )
                  )
                }
              </Grid>
            </Grid>
            <Grid mb={3} container justifyContent="center">
              <Grid item className={classes.viewTabs}>
                <Tabs value={view} onChange={(event, vw) => setView(vw)}>
                  {subNav.map((itemProps, index) => (
                    <Tab {...itemProps} key={`tab${index}:${itemProps.value}`} />
                  ))}
                </Tabs>
              </Grid>
            </Grid>
            {selectedProduct && _.toNumber(selectedProduct) !== 0 && !_.includes(_.uniq(_.map(statuses, 'product_uuid')), selectedProduct)
              ? (
                <>
                  <Grid item xs={4} className={classes.configBoard}>
                    <Typography component="div" variant="h4" align="center">
                      Configure Project Board
                    </Typography>
                    <Typography variant="subtitle1" align="center">
                      Add a configuration to get started
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        if (product && !_.isEmpty(product) && !_.isEmpty(product.third_party_tool)
                          && (
                            (_.isEqual(_.size(product.third_party_tool), 2) && _.isEmpty(product.feature_tool_detail) && _.isEmpty(product.issue_tool_detail))
                            || (_.isEqual(_.size(product.third_party_tool), 1) && (_.isEmpty(product.feature_tool_detail) || _.isEmpty(product.issue_tool_detail)))
                          )) {
                          configureBoard();
                        } else {
                          configureStatus();
                        }
                      }}
                      className={classes.configBoardButton}
                    >
                      Add Configuration
                    </Button>
                  </Grid>
                  {
                    product && !_.isEmpty(product) && !_.isEmpty(product.third_party_tool)
                      && (
                        (_.isEqual(_.size(product.third_party_tool), 2) && _.isEmpty(product.feature_tool_detail) && _.isEmpty(product.issue_tool_detail))
                        || (_.isEqual(_.size(product.third_party_tool), 1) && (_.isEmpty(product.feature_tool_detail) || _.isEmpty(product.issue_tool_detail)))
                      )
                      ? <Route path={routes.TOOL_BOARD} component={ToolBoard} />
                      : <Route path={routes.STATUS_BOARD} component={StatusBoard} />
                  }
                </>
              ) : (
                <>
                  <ConfirmModal
                    open={openDeleteModal}
                    setOpen={setOpenDeleteModal}
                    submitAction={handleDeleteModal}
                    title="Are you sure you want to delete?"
                    submitText="Delete"
                  />
                  <Route
                    path={routes.PRODUCT_ROADMAP_TABULAR}
                    render={(prps) => (
                      <Tabular
                        {...prps}
                        selectedProduct={selectedProduct}
                        addItem={addItem}
                        editItem={editItem}
                        deleteItem={deleteItem}
                        commentItem={commentItem}
                        issueSuggestions={issueSuggestions}
                        upgrade={upgrade}
                        suggestedFeatures={
                          product && product.product_info && product.product_info.suggestions
                        }
                        createSuggestedFeature={createSuggestedFeature}
                        removeSuggestedFeature={removeSuggestedFeature}
                        showRelatedIssues={showRelatedIssues}
                        setDataLoading={setDataLoading}
                      />
                    )}
                  />
                  <Route
                    path={routes.PRODUCT_ROADMAP_KANBAN}
                    render={(prps) => (
                      <Kanban
                        {...prps}
                        selectedProduct={selectedProduct}
                        addItem={addItem}
                        editItem={editItem}
                        deleteItem={deleteItem}
                        commentItem={commentItem}
                        issueSuggestions={issueSuggestions}
                        upgrade={upgrade}
                        suggestedFeatures={
                          product && product.product_info && product.product_info.suggestions
                        }
                        createSuggestedFeature={createSuggestedFeature}
                        removeSuggestedFeature={removeSuggestedFeature}
                        showRelatedIssues={showRelatedIssues}
                      />
                    )}
                  />
                  <Route path={routes.ADD_FEATURE} component={AddFeatures} />
                  <Route path={routes.EDIT_FEATURE} component={AddFeatures} />
                  <Route path={routes.VIEW_FEATURE} component={AddFeatures} />
                  <Route path={routes.ADD_ISSUE} component={AddIssues} />
                  <Route path={routes.EDIT_ISSUE} component={AddIssues} />
                  <Route path={routes.FEATURE_TO_ISSUE} component={AddIssues} />
                  <Route path={routes.COMMENTS} component={Comments} />
                  <Route path={routes.SHOW_RELATED_ISSUES} component={ShowRelatedIssues} />
                  <Route
                    path={routes.ISSUE_SUGGESTIONS}
                    render={(renderProps) => (
                      <IssueSuggestions {...renderProps} convertIssue={convertIssue} />
                    )}
                  />
                </>
              )}
          </div>
        ) : (
          <div className={classes.firstTimeMessage}>
            {user.user_type.toLowerCase() === 'developer'
              ? (
                <>
                  <Typography variant="h6" component="h6">
                    Thanks for registering.
                    It will be greatly appreciated if you could complete out a
                    short survey to assist us guide the application's future path
                    and find a match within the Buildly ecosystem of tools.
                  </Typography>
                  <Button
                    variant="contained"
                    type="button"
                    className={classes.firstTimeButton}
                    onClick={() => history.push(routes.DEVELOPER_FORM)}
                  >
                    Fill in the developer survey form!
                  </Button>
                </>
              )
              : (
                <>
                  <Typography variant="h6" component="h6">
                    Thanks for registering.
                    To get you started we want to take your through a new product
                    wizard. This will help you get oriented with the system, and
                    create your first product with Buildly Product Labs!
                  </Typography>
                  <Button
                    variant="contained"
                    type="button"
                    className={classes.firstTimeButton}
                    onClick={() => history.push(routes.NEW_PRODUCT)}
                  >
                    Let's get started!
                  </Button>
                </>
              )}
          </div>
        )
      )}
      {/* <Chatbot /> */}
    </>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  loading: state.authReducer.loading || state.productReducer.loading || state.releaseReducer.loading,
  loaded: state.authReducer.loaded && state.productReducer.loaded && state.releaseReducer.loaded,
  user: state.authReducer.data,
  products: state.productReducer.products,
  features: state.releaseReducer.features,
  credentials: state.productReducer.credentials,
  statuses: state.releaseReducer.statuses,
  dataSynced: state.releaseReducer.dataSynced,
  releases: state.releaseReducer.releases,
});

export default connect(mapStateToProps)(ProductRoadmap);
