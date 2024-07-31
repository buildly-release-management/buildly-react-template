import React, { useState, useEffect, useContext } from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';
import makeStyles from '@mui/styles/makeStyles';
import {
  useTheme,
  useMediaQuery,
  Grid,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { UserContext } from '@context/User.context';
import FormModal from '@components/Modal/FormModal';
import Loader from '@components/Loader/Loader';
import useAlert from '@hooks/useAlert';
import { getAllProductQuery } from '@react-query/queries/product/getAllProductQuery.js';
import { getAllCredentialQuery } from '@react-query/queries/product/getAllCredentialQuery';
import { useCreateIssueMutation } from '@react-query/mutations/release/createIssueMutation';

const useStyles = makeStyles((theme) => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
      width: '70%',
      margin: 'auto',
    },
  },
  accordion: {
    width: '100%',
    color: theme.palette.secondary.main,
    border: `1px solid ${theme.palette.secondary.main}`,
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    borderRadius: '18px',
  },
  formTitle: {
    fontWeight: 'bold',
    marginTop: '1em',
    textAlign: 'center',
  },
  noSuggestions: {
    width: '100%',
    padding: theme.spacing(4),
    textAlign: 'center',
  },
}));

const IssueSuggestions = ({
  history,
  location,
  convertIssue,
}) => {
  const classes = useStyles();
  const user = useContext(UserContext);
  const displayAlert = useAlert();

  const redirectTo = location.state && location.state.from;
  const editData = (
    location.state
    && (location.state.type === 'edit' || location.state.type === 'view')
    && location.state.data
  ) || {};
  const product_uuid = location.state && location.state.product_uuid;
  const showData = (
    location.state
    && location.state.type === 'show'
    && location.state.data
  ) || {};

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const [openFormModal, setFormModal] = useState(true);
  const [openConfirmModal, setConfirmModal] = useState(false);
  const [product, setProduct] = useState('');

  const { data: products, isLoading: areProductsLoading } = useQuery(
    ['allProducts', user.organization.organization_uuid],
    () => getAllProductQuery(user.organization.organization_uuid, displayAlert),
    { refetchOnWindowFocus: false },
  );
  const { data: credentials, isLoading: areCredentialsLoading } = useQuery(
    ['allCredentials', product_uuid],
    () => getAllCredentialQuery(product_uuid, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(product_uuid) },
  );
  const { mutate: createIssueMutation, isLoading: isCreatingIssueLoading } = useCreateIssueMutation(product_uuid, history, redirectTo, displayAlert);

  useEffect(() => {
    const prod = _.find(products, { product_uuid });
    setProduct(prod);
  }, [products]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const dateTime = new Date();
    const issueCred = _.find(credentials, (cred) => (_.toLower(cred.auth_detail.tool_type) === 'issue'));

    const formData = {
      ...editData,
      edit_date: dateTime,
      feature: showData.feature_uuid,
      start_date: dateTime,
      end_date: dateTime,
      status: showData.status,
      tags: showData.tags,
      product_uuid,
      estimate: showData.total_estimate,
      complexity: Number(),
      repository: product.issue_tool_detail?.repository_list[0]?.name,
      create_date: dateTime,
      column_id: product.issue_tool_detail?.column_list[0]?.column_id,
      ...issueCred?.auth_detail,
      issue_detail: {},
    };

    const issueSuggestionsData = _.map(showData.suggested_issues, (issue) => ({
      ...formData,
      name: issue.name,
      description: issue.description,
      issue_type: issue.ticket_type,
    }));

    createIssueMutation(issueSuggestionsData);
    history.push(redirectTo);
  };

  const closeFormModal = () => {
    setFormModal(false);
    history.push(redirectTo);
  };

  const discardFormData = () => {
    setConfirmModal(false);
    setFormModal(false);
    history.push(redirectTo);
  };

  return (
    <>
      {openFormModal && (
        <FormModal
          open={openFormModal}
          handleClose={closeFormModal}
          title="Issue Suggestions"
          titleClass={classes.formTitle}
          maxWidth="md"
          wantConfirm
          openConfirmModal={openConfirmModal}
          setConfirmModal={setConfirmModal}
          handleConfirmModal={discardFormData}
        >
          {(areProductsLoading || areCredentialsLoading || isCreatingIssueLoading) && <Loader open={areProductsLoading || areCredentialsLoading || isCreatingIssueLoading} />}
          <form className={classes.form} noValidate onSubmit={handleSubmit}>
            <Grid container rowGap={2}>
              {showData && _.isEmpty(showData.suggested_issues) && (
                <Typography variant="body1" className={classes.noSuggestions}>
                  No suggested issues found
                </Typography>
              )}

              {showData && !_.isEmpty(showData.suggested_issues)
              && _.map(showData.suggested_issues, (issue, index) => (
                <Accordion
                  key={`${issue.name}-${index}`}
                  className={classes.accordion}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon color="secondary" />}>
                    <Typography color="inherit" variant="h6">{`${issue.name} (${issue.ticket_type} ticket)`}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div dangerouslySetInnerHTML={{ __html: `Description: ${issue.description || 'Not available'}` }} />
                  </AccordionDetails>
                </Accordion>
              ))}
            </Grid>

            <Grid container spacing={isDesktop ? 3 : 0} justifyContent="center">
              {(showData && (
                <Grid item xs={12} sm={4}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    disabled={_.isEmpty(showData.suggested_issues)}
                  >
                    Go with suggestions
                  </Button>
                </Grid>
              ))}

              <Grid item xs={12} sm={4}>
                <Button
                  type="button"
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={(e) => convertIssue(showData, 'convert')}
                  className={classes.submit}
                >
                  Create own issue
                </Button>
              </Grid>
            </Grid>
          </form>
        </FormModal>
      )}
    </>
  );
};

export default IssueSuggestions;
