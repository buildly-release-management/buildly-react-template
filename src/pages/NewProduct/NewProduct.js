import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import makeStyles from '@mui/styles/makeStyles';
import {
  Stepper,
  Step,
  StepLabel,
  Hidden,
  Grid,
} from '@mui/material';
import FormModal from '@components/Modal/FormModal';
import { clearValidateData, saveProductFormData, getAllCredentials } from '@redux/product/actions/product.actions';
import ProductSetup, {
  checkIfProductSetupEdited,
} from './components/ProductSetup';
import ApplicationMarket, {
  checkIfApplicationMarketEdited,
} from './components/ApplicationMarket';
import BudgetTechnology, {
  checkIfBudgetTechnologyEdited,
} from './components/BudgetTechnology';
import TeamUser, { checkIfTeamUserEdited } from './components/TeamUser';
import UseInfo, { checkIfUseInfoEdited } from './components/UseInfo';
import ViewDetailsWrapper from './components/ViewDetailsWrapper';
import { getAllStatuses } from '@redux/decision/actions/decision.actions';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& .MuiStepLabel-label': {
      color: theme.palette.neutral.text.light,
    },
  },
  formTitle: {
    fontWeight: 'bold',
    marginTop: '1em',
    textAlign: 'center',
  },
}));

const getSteps = () => [
  'Initial Configuration',
  'Application & Market',
  'Budget & Technology',
  'Team & Users',
  'Users Information',
];

const getStepContent = (
  stepIndex,
  props,
  handleNext,
  handleBack,
  maxSteps,
  editData,
  editPage,
  product_uuid,
  redirectTo,
  viewPage,
  featCred,
  issueCred,
) => {
  switch (stepIndex) {
    case 0:
      return (
        <ViewDetailsWrapper
          {...props}
          handleBack={handleBack}
          title="New Product Setup"
          maxSteps={maxSteps}
          activeStep={stepIndex}
        >
          <ProductSetup
            {...props}
            location={props.location}
            handleNext={handleNext}
            editData={editData}
            viewPage={viewPage}
            featCred={featCred}
            issueCred={issueCred}
          />
        </ViewDetailsWrapper>
      );

    case 1:
      return (
        <ViewDetailsWrapper
          {...props}
          handleBack={handleBack}
          title="New Product Setup"
          maxSteps={maxSteps}
          activeStep={stepIndex}
        >
          <ApplicationMarket
            {...props}
            location={props.location}
            handleNext={handleNext}
            handleBack={handleBack}
            editData={editData}
          />
        </ViewDetailsWrapper>
      );

    case 2:
      return (
        <ViewDetailsWrapper
          {...props}
          handleBack={handleBack}
          title="New Product Setup"
          maxSteps={maxSteps}
          activeStep={stepIndex}
        >
          <BudgetTechnology
            {...props}
            location={props.location}
            handleNext={handleNext}
            handleBack={handleBack}
            editData={editData}
          />
        </ViewDetailsWrapper>
      );

    case 3:
      return (
        <ViewDetailsWrapper
          {...props}
          handleBack={handleBack}
          title="New Product Setup"
          maxSteps={maxSteps}
          activeStep={stepIndex}
        >
          <TeamUser
            {...props}
            location={props.location}
            handleNext={handleNext}
            handleBack={handleBack}
            editData={editData}
          />
        </ViewDetailsWrapper>
      );

    case 4:
      return (
        <ViewDetailsWrapper
          {...props}
          handleBack={handleBack}
          title="New Product Setup"
          maxSteps={maxSteps}
          activeStep={stepIndex}
        >
          <UseInfo
            {...props}
            location={props.location}
            handleBack={handleBack}
            editData={editData}
            editPage={editPage}
            product_uuid={product_uuid}
            redirectTo={redirectTo}
          />
        </ViewDetailsWrapper>
      );

    default:
      return 'Unknown stepIndex';
  }
};

const NewProductForm = (props) => {
  const {
    history, productFormData, dispatch, location, statuses, credentials,
  } = props;
  const classes = useStyles();
  const steps = getSteps();
  const maxSteps = steps.length;
  const [status, setStatus] = useState('');

  const redirectTo = location.state && location.state.from;
  const product_uuid = location.state && location.state.product_uuid;
  const editPage = location.state && location.state.type === 'editP';
  const editData = (
    location.state
    && (location.state.type === 'editP')
    && location.state.data
  ) || {};
  const viewPage = status?.length > 0 || false;
  const formTitle = editPage ? 'Edit Product' : 'New Product Setup';

  const [activeStep, setActiveStep] = React.useState(0);
  const [openFormModal, setFormModal] = useState(true);
  const [openConfirmModal, setConfirmModal] = useState(false);
  const [confirmModalFor, setConfirmModalFor] = useState(null);

  const featCred = _.find(
    credentials,
    { product_uuid, auth_detail: { tool_type: 'Feature' } },
  );
  const issueCred = _.find(
    credentials,
    { product_uuid, auth_detail: { tool_type: 'Issue' } },
  );

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    if (checkIfFormEdited(activeStep)) {
      setConfirmModal(true);
      setConfirmModalFor(activeStep - 1);
    } else {
      setActiveStep(activeStep - 1);
    }
  };

  const handleClose = () => {
    if (checkIfFormEdited(activeStep)
      || (productFormData && !_.isEmpty(productFormData))
    ) {
      setConfirmModal(true);
      setConfirmModalFor(null);
    } else {
      dispatch(saveProductFormData(null));
      setFormModal(false);
      history.push(redirectTo);
    }
  };

  const handleConfirmModal = () => {
    if (_.isNumber(confirmModalFor)) {
      setConfirmModal(false);
      setActiveStep(confirmModalFor);
    } else {
      dispatch(saveProductFormData(null));
      history.push(redirectTo);
    }
  };

  useEffect(() => {
    const sta = _.filter(statuses, { product_uuid });
    setStatus(sta);
  }, [statuses, product_uuid]);

  useEffect(() => {
    dispatch(getAllStatuses());
    // dispatch(clearValidateData());
  }, []);

  useEffect(() => {
    dispatch(getAllCredentials());
  }, []);

  const checkIfFormEdited = (currentStep) => {
    switch (currentStep) {
      case 0:
        return checkIfProductSetupEdited();

      case 1:
        return checkIfApplicationMarketEdited();

      case 2:
        return checkIfBudgetTechnologyEdited();

      case 3:
        return checkIfTeamUserEdited();

      case 4:
        return checkIfUseInfoEdited();

      default:
        return false;
    }
  };

  return (
    <div>
      {openFormModal && (
        <FormModal
          open={openFormModal}
          handleClose={handleClose}
          title={formTitle}
          titleClass={classes.formTitle}
          maxWidth="md"
          wantConfirm
          openConfirmModal={openConfirmModal}
          setConfirmModal={setConfirmModal}
          handleConfirmModal={handleConfirmModal}
        >
          <div className={classes.root}>
            <Hidden smDown>
              <Grid container alignItems="center" justifyContent="center">
                <Grid item sm={10}>
                  <Stepper
                    activeStep={activeStep}
                    alternativeLabel
                    nonLinear
                    style={{ background: 'transparent' }}
                  >
                    {_.map(steps, (label, index) => (
                      <Step key={`step${index}:${label}`}>
                        <StepLabel style={{ color: 'white' }}>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Grid>
              </Grid>
            </Hidden>

            <div>
              {getStepContent(
                activeStep,
                props,
                handleNext,
                handleBack,
                maxSteps,
                editData,
                editPage,
                product_uuid,
                redirectTo,
                viewPage,
                featCred,
                issueCred,
              )}
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.optionsReducer,
  productFormData: state.productReducer.productFormData,
  ...state.productReducer,
  ...state.decisionReducer,
});

export default connect(mapStateToProps)(NewProductForm);
