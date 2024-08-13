import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import parse from 'html-react-parser';
import { useQuery } from 'react-query';
import makeStyles from '@mui/styles/makeStyles';
import {
  Card, CardContent, Typography,
} from '@mui/material';
import Loader from '@components/Loader/Loader';
import FormModal from '@components/Modal/FormModal';
import useAlert from '@hooks/useAlert';
import { getAllIssueQuery } from '@react-query/queries/release/getAllIssueQuery';

const useStyles = makeStyles((theme) => ({
  formTitle: {
    fontWeight: 'bold',
    marginTop: '1em',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
      width: '70%',
      margin: 'auto',
    },
  },
  card: {
    marginBottom: theme.spacing(2),
  },
}));

const ShowRelatedIssues = ({ location, history, selectedProduct }) => {
  const classes = useStyles();
  const { displayAlert } = useAlert();

  const redirectTo = location.state && location.state.from;
  const feature = location.state && location.state.feature_uuid;
  const [openFormModal, setFormModal] = useState(true);
  const [relatedIssues, setRelatedIssues] = useState([]);

  const { data: issues, isLoading: isAllIssueLoading } = useQuery(
    ['allIssues', selectedProduct],
    () => getAllIssueQuery(selectedProduct, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(selectedProduct) && _.toNumber(selectedProduct) !== 0 },
  );

  useEffect(() => {
    setRelatedIssues(_.filter(issues, { feature }));
  }, [issues]);

  const handleClose = () => {
    setFormModal(false);
    history.push(redirectTo);
  };

  return (
    <>
      {openFormModal && (
        <FormModal
          open={openFormModal}
          handleClose={handleClose}
          title="Related Issues"
          titleClass={classes.formTitle}
          maxWidth="md"
          className={classes.form}
        >
          {isAllIssueLoading && <Loader open={isAllIssueLoading} />}
          {_.isEmpty(relatedIssues) && (
            <Typography variant="body1" component="div">
              No related issues found.
            </Typography>
          )}
          {!_.isEmpty(relatedIssues) && _.map(relatedIssues, (issue) => (
            <Card key={`issue-${issue.issue_uuid}`} className={classes.card}>
              <CardContent>
                <Typography variant="h6">
                  {issue.name}
                </Typography>
                <Typography variant="body1">
                  {parse(issue.description)}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </FormModal>
      )}
    </>
  );
};

export default ShowRelatedIssues;
