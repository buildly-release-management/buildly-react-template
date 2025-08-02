/* eslint-disable no-nested-ternary */
import React, { useEffect, useState, useContext } from 'react';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import { useQuery } from 'react-query';
import { makeStyles } from '@mui/styles';
import {
  Button, Grid, MenuItem, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import { Sync as SyncIcon } from '@mui/icons-material';
import { UserContext } from '@context/User.context';
import Chatbot from '@components/Chatbot/Chatbot';
import ConfirmModal from '@components/Modal/ConfirmModal';
import Loader from '@components/Loader/Loader';
import useAlert from '@hooks/useAlert';
import { routes } from '@routes/routesConstants';
import { getAllProductQuery } from '@react-query/queries/product/getAllProductQuery';
import { getAllCredentialQuery } from '@react-query/queries/product/getAllCredentialQuery';
import { getAllStatusQuery } from '@react-query/queries/release/getAllStatusQuery';
import { getAllFeatureQuery } from '@react-query/queries/release/getAllFeatureQuery';
import { useThirdPartyToolSyncMutation } from '@react-query/mutations/release/thirdPartyToolSyncMutation';
import { useCreateFeatureMutation } from '@react-query/mutations/release/createFeatureMutation';
import { useUpdateProductMutation } from '@react-query/mutations/product/updateProductMutation';
import { useDeleteFeatureMutation } from '@react-query/mutations/release/deleteFeatureMutation';
import { useDeleteIssueMutation } from '@react-query/mutations/release/deleteIssueMutation';
import { useStore } from '@zustand/product/productStore';
import Kanban from './components/Kanban';
import Tabular from './components/Tabular';
import AddFeatures from './forms/AddFeatures';
import AddIssues from './forms/AddIssues';
import Comments from './forms/Comments';
import IssueSuggestions from './forms/IssueSuggestions';
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
    height: '75%',
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

const ProductRoadmap = ({ history }) => {
  const classes = useStyles();
  const user = useContext(UserContext);
  const organization = user.organization.organization_uuid;

  const { displayAlert } = useAlert();
  const { activeProduct, setActiveProduct } = useStore();

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
  const [selectedProduct, setSelectedProduct] = useState(activeProduct || 0);
  const [product, setProduct] = useState(null);
  const [upgrade, setUpgrade] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteItemID, setDeleteItemID] = useState({
    id: 0,
    type: 'feat',
  });
  const [featSearch, setFeatSearch] = useState('');
  const [issSearch, setIssSearch] = useState('');

  const { data: productData, isLoading: isAllProductLoading } = useQuery(
    ['allProducts', organization],
    () => getAllProductQuery(organization, displayAlert),
    { refetchOnWindowFocus: false },
  );

  const { data: credentialData, isLoading: isAllCredentialLoading } = useQuery(
    ['allCredentials', selectedProduct],
    () => getAllCredentialQuery(selectedProduct, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(selectedProduct) && _.toNumber(selectedProduct) !== 0 },
  );

  const { data: statusData, isLoading: isAllStatusLoading } = useQuery(
    ['allStatuses', selectedProduct],
    () => getAllStatusQuery(selectedProduct, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(selectedProduct) && _.toNumber(selectedProduct) !== 0 },
  );

  const { data: featureData, isLoading: isAllFeatureLoading } = useQuery(
    ['allFeatures', selectedProduct],
    () => getAllFeatureQuery(selectedProduct, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(selectedProduct) && _.toNumber(selectedProduct) !== 0 },
  );

  const { mutate: thirdPartyToolSyncMutation, isLoading: isThirdPartyToolSyncLoading } = useThirdPartyToolSyncMutation(displayAlert);
  const { mutate: createFeatureMutation, isLoading: isCreatingFeatureLoading } = useCreateFeatureMutation(selectedProduct, null, null, displayAlert);
  const { mutate: updateProductMutation, isLoading: isUpdatingProductLoading } = useUpdateProductMutation(organization, null, null, null, displayAlert);
  const { mutate: deleteFeatureMutation, isLoading: isDeletingFeatureLoading } = useDeleteFeatureMutation(selectedProduct, displayAlert);
  const { mutate: deleteIssueMutation, isLoading: isDeletingIssueLoading } = useDeleteIssueMutation(selectedProduct, displayAlert);

  useEffect(() => {
    history.push(`/app/product-roadmap/${view || location.state}`);
  }, [view]);

  useEffect(() => {
    if (selectedProduct && !!selectedProduct && (_.size(featureData) >= 5)
      && user && user.organization && !user.organization.unlimited_free_plan) {
      setUpgrade(true);
    } else {
      setUpgrade(false);
    }
  }, [selectedProduct, featureData]);

  useEffect(() => {
    if (selectedProduct && !!selectedProduct && _.toNumber(selectedProduct) !== 0) {
      setProduct(_.find(productData, { product_uuid: selectedProduct }));
    }
  }, [selectedProduct, productData]);

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
    const featCred = _.find(credentialData, (cred) => (_.toLower(cred.auth_detail.tool_type) === 'feature'));
    const issueCred = _.find(credentialData, (cred) => (_.toLower(cred.auth_detail.tool_type) === 'issue'));
    if (type === 'feat') {
      const deleteCred = {
        ...featCred?.auth_detail,
        feature_uuid: id,
      };
      deleteFeatureMutation(deleteCred);
    } else if (type === 'issue') {
      const deleteCreds = {
        ...issueCred?.auth_detail,
        issue_uuid: id,
      };
      deleteIssueMutation(deleteCreds);
    }
    setOpenDeleteModal(false);
  };

  const commentItem = (item) => {
    let data = { from: location.pathname, product_uuid: selectedProduct };
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
    const featCred = _.find(credentialData, (cred) => (_.toLower(cred.auth_detail.tool_type) === 'feature'));
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
    createFeatureMutation(formData);
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
    updateProductMutation(formData);
  };

  const generateAIFeatureSuggestion = async () => {
    try {
      // Gather comprehensive context about the product and existing features
      const existingFeatures = featureData || [];
      const productDetails = product || {};
      
      const context = {
        product: {
          name: productDetails.name,
          description: productDetails.description,
          architecture_type: productDetails.product_info?.architecture_type,
          language: productDetails.product_info?.language,
          database: productDetails.product_info?.database,
          hosting: productDetails.product_info?.hosting,
          storage: productDetails.product_info?.storage,
          start_date: productDetails.start_date,
          end_date: productDetails.end_date,
        },
        existing_features: existingFeatures.map(feature => ({
          name: feature.feature_name,
          description: feature.description,
          status: feature.status,
          issues_count: feature.issues?.length || 0,
        })),
        current_suggestions: product?.product_info?.suggestions || [],
      };

      const prompt = `
You are an AI product manager helping to suggest new features for a software product. 

Product Details:
- Name: ${context.product.name}
- Description: ${context.product.description}
- Architecture: ${context.product.architecture_type}
- Technology Stack: ${context.product.language}, ${context.product.database}, ${context.product.hosting}
- Project Timeline: ${context.product.start_date} to ${context.product.end_date}

Existing Features:
${context.existing_features.map(f => `- ${f.name}: ${f.description} (Status: ${f.status})`).join('\n')}

Current Suggestions:
${context.current_suggestions.map(s => `- ${s.suggested_feature}`).join('\n')}

Based on this context, please suggest ONE new feature that would be valuable for this product. The feature should:
1. Complement existing features without duplicating them
2. Be technically feasible given the architecture and technology stack
3. Provide clear user value
4. Be appropriately scoped for the project timeline

Please respond with a JSON object in this exact format:
{
  "suggested_feature": "Feature Name",
  "description": "Detailed description of the feature and its benefits",
  "rationale": "Why this feature would be valuable for this specific product"
}
`;

      console.log('generateAIFeatureSuggestion: Sending request to AI with context:', context);

      // Use the configured chatbot URL (automatically set based on environment)
      const chatbotUrl = window.env.BABBLE_CHATBOT_URL;
      
      console.log('ProductRoadmap: Using chatbot URL:', chatbotUrl, 'Production:', window.env.PRODUCTION);
      console.log('ProductRoadmap: Full environment config:', {
        PRODUCTION: window.env.PRODUCTION,
        BABBLE_CHATBOT_URL: window.env.BABBLE_CHATBOT_URL,
        hostname: window.location.hostname
      });
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(chatbotUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`AI service responded with status: ${response.status}`);
      }

      const aiResponse = await response.json();
      console.log('generateAIFeatureSuggestion: AI response:', aiResponse);

      // Parse the AI response
      let suggestion;
      try {
        suggestion = JSON.parse(aiResponse.response || aiResponse.message || '{}');
      } catch (parseError) {
        // If response is not JSON, create a basic suggestion from the text
        const responseText = aiResponse.response || aiResponse.message || 'AI Feature Suggestion';
        suggestion = {
          suggested_feature: responseText.substring(0, 100),
          description: responseText,
          rationale: 'AI-generated suggestion based on product analysis',
        };
      }

      // Create a new suggestion and add it to the product
      const newSuggestion = {
        suggestion_uuid: `ai-${Date.now()}`,
        suggested_feature: suggestion.suggested_feature || 'AI Generated Feature',
        description: suggestion.description || suggestion.suggested_feature,
        rationale: suggestion.rationale || 'AI-generated based on product context',
        source: 'AI',
        created_at: new Date().toISOString(),
      };

      // Update the product with the new suggestion
      const currentSuggestions = product?.product_info?.suggestions || [];
      const formData = {
        ...product,
        product_info: {
          ...product.product_info,
          suggestions: [...currentSuggestions, newSuggestion],
        },
      };

      updateProductMutation(formData);
      displayAlert('success', 'AI feature suggestion generated successfully!');

    } catch (error) {
      console.error('generateAIFeatureSuggestion: Error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to generate AI feature suggestion. Please try again.';
      if (error.name === 'AbortError') {
        errorMessage = 'AI service request timed out. Please try again.';
      } else if (error.message && error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to AI service. Please check your internet connection and try again.';
      } else if (error.message && error.message.includes('status:')) {
        errorMessage = `AI service error: ${error.message}. Please try again later.`;
      }
      
      displayAlert('error', errorMessage);
    }
  };

  const configureBoard = () => {
    history.push(routes.TOOL_BOARD, {
      from: location.pathname,
      product_uuid: selectedProduct,
    });
  };

  const editBoard = () => {
    history.push(routes.TOOL_BOARD, {
      from: location.pathname,
      product_uuid: selectedProduct,
      editStatus: true,
      productData: _.find(productData, { product_uuid: selectedProduct }),
    });
  };

  const syncDataFromTools = (e) => {
    e.preventDefault();
    const featCred = _.find(credentialData, (cred) => (_.toLower(cred.auth_detail.tool_type) === 'feature'));
    const issueCred = _.find(credentialData, (cred) => (_.toLower(cred.auth_detail.tool_type) === 'issue'));

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

      thirdPartyToolSyncMutation(creds);
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
      {(isAllProductLoading || isAllCredentialLoading || isAllStatusLoading || isAllFeatureLoading || isThirdPartyToolSyncLoading
      || isCreatingFeatureLoading || isUpdatingProductLoading || isDeletingFeatureLoading || isDeletingIssueLoading)
        ? (
          <Loader
            open={isAllProductLoading || isAllCredentialLoading || isAllStatusLoading || isAllFeatureLoading || isThirdPartyToolSyncLoading
              || isCreatingFeatureLoading || isUpdatingProductLoading || isDeletingFeatureLoading || isDeletingIssueLoading}
          />
        ) : (
          user.survey_status
            ? (
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
                          setSelectedProduct(e.target.value);
                        }
                      }}
                    >
                      <MenuItem value={0}>Select</MenuItem>
                      <MenuItem value={-1}>Create New Product</MenuItem>
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
                    {
                    (
                      product && !_.isEmpty(product.third_party_tool)
                      && _.includes(_.uniq(_.map(statusData, 'product_uuid')), selectedProduct) && (
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
                {selectedProduct && _.toNumber(selectedProduct) !== 0 && !_.includes(_.uniq(_.map(statusData, 'product_uuid')), selectedProduct)
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
                          onClick={configureBoard}
                          className={classes.configBoardButton}
                        >
                          Add Configuration
                        </Button>
                      </Grid>
                      <Route path={routes.TOOL_BOARD} component={ToolBoard} />
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
                            generateAIFeatureSuggestion={generateAIFeatureSuggestion}
                            showRelatedIssues={showRelatedIssues}
                            featSearch={featSearch}
                            setFeatSearch={setFeatSearch}
                            issSearch={issSearch}
                            setIssSearch={setIssSearch}
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
                            generateAIFeatureSuggestion={generateAIFeatureSuggestion}
                            showRelatedIssues={showRelatedIssues}
                            editBoard={editBoard}
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
                      <Route
                        path={routes.SHOW_RELATED_ISSUES}
                        render={(renderProps) => (
                          <ShowRelatedIssues {...renderProps} selectedProduct={selectedProduct} />
                        )}
                      />
                      <Route
                        path={routes.ISSUE_SUGGESTIONS}
                        render={(renderProps) => (
                          <IssueSuggestions {...renderProps} convertIssue={convertIssue} />
                        )}
                      />
                      <Route path={routes.TOOL_BOARD} component={ToolBoard} />
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
      <Chatbot />
    </>
  );
};

export default ProductRoadmap;
