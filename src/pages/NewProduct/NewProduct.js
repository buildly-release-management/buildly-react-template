import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';
import makeStyles from '@mui/styles/makeStyles';
import {
  Stepper,
  Step,
  StepLabel,
  Hidden,
  Grid,
} from '@mui/material';
import Chatbot from '@components/Chatbot/Chatbot';
import Loader from '@components/Loader/Loader';
import FormModal from '@components/Modal/FormModal';
import { routes } from '@routes/routesConstants';
import useAlert from '@hooks/useAlert';
import { getAllCredentialQuery } from '@react-query/queries/product/getAllCredentialQuery';
import { useStore } from '@zustand/product/productStore';
import ApplicationMarket, { checkIfApplicationMarketEdited } from './components/ApplicationMarket';
import BudgetTechnology, { checkIfBudgetTechnologyEdited } from './components/BudgetTechnology';
import ProductSetup, { checkIfProductSetupEdited } from './components/ProductSetup';
import Setup, { checkIfSetupEdited } from './components/Setup';
import TeamUser, { checkIfTeamUserEdited } from './components/TeamUser';
import UseInfo, { checkIfUseInfoEdited } from './components/UseInfo';
import ViewDetailsWrapper from './components/ViewDetailsWrapper';

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
  'Setup Details',
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
            handleNext={handleNext}
            handleBack={handleBack}
            editData={editData}
          />
        </ViewDetailsWrapper>
      );

    case 5:
      return (
        <ViewDetailsWrapper
          {...props}
          handleBack={handleBack}
          title="New Product Setup"
          maxSteps={maxSteps}
          activeStep={stepIndex}
        >
          <Setup
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
  const { history, location, productFormData } = props;
  const classes = useStyles();
  const steps = getSteps();
  const maxSteps = steps.length;

  const { displayAlert } = useAlert();
  const { clearProductFormData } = useStore();

  const redirectTo = (location.state && location.state.from) || routes.PRODUCT_ROADMAP;
  const product_uuid = location.state && location.state.product_uuid;
  const editPage = location.state && location.state.type === 'editP';
  const editData = (
    location.state
    && (location.state.type === 'editP')
    && location.state.data
  ) || null;
  const viewPage = location.state && location.state.type === 'view';
  const formTitle = editPage ? 'Edit Product' : 'New Product Setup';

  const [activeStep, setActiveStep] = useState(0);
  const [openFormModal, setFormModal] = useState(true);
  const [openConfirmModal, setConfirmModal] = useState(false);
  const [confirmModalFor, setConfirmModalFor] = useState(null);
  const [featCred, setFeatCred] = useState(null);
  const [issueCred, setIssueCred] = useState(null);

  const { data: allCredentialData, isLoading: areCredentialsLoading } = useQuery(
    ['allCredentials', product_uuid],
    () => getAllCredentialQuery(product_uuid, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(product_uuid) },
  );

  useEffect(() => {
    setFeatCred(_.find(allCredentialData, { auth_detail: { tool_type: 'Feature' } }));
    setIssueCred(_.find(allCredentialData, { auth_detail: { tool_type: 'Issue' } }));
  }, [allCredentialData]);

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
    if ((!editData && productFormData && !_.isEmpty(productFormData))
      || checkIfFormEdited(activeStep)) {
      setConfirmModal(true);
      setConfirmModalFor(null);
    } else {
      clearProductFormData();
      setFormModal(false);
      history.push(redirectTo);
    }
  };

  const handleConfirmModal = () => {
    if (_.isNumber(confirmModalFor)) {
      setConfirmModal(false);
      setActiveStep(confirmModalFor);
    } else {
      clearProductFormData();
      history.push(redirectTo);
    }
  };

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

      case 5:
        return checkIfSetupEdited();

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
            {areCredentialsLoading && <Loader open={areCredentialsLoading} />}
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
          <Chatbot />
        </FormModal>
      )}
    </div>
  );
};

export default NewProductForm;
