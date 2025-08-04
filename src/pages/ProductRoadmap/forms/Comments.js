import React, { useContext, useEffect, useState } from 'react';
import _ from 'lodash';
import moment from 'moment-timezone';
import { useQuery } from 'react-query';
import makeStyles from '@mui/styles/makeStyles';
import {
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  MenuItem,
} from '@mui/material';
import FormModal from '@components/Modal/FormModal';
import Loader from '@components/Loader/Loader';
import useAlert from '@hooks/useAlert';
import { useInput } from '@hooks/useInput';
import useOrganizationMembers from '@hooks/useOrganizationMembers';
import { validators } from '@utils/validators';
import { UserContext } from '@context/User.context';
import { getAllCredentialQuery } from '@react-query/queries/product/getAllCredentialQuery';
import { getAllCommentQuery } from '@react-query/queries/release/getAllCommentQuery';
import { useCreateCommentMutation } from '@react-query/mutations/release/createCommentMutation';

const useStyles = makeStyles((theme) => ({
  formTitle: {
    fontWeight: 'bold',
    marginTop: '1em',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(5),
    [theme.breakpoints.up('sm')]: {
      width: '70%',
      margin: 'auto',
      marginTop: theme.spacing(5),
    },
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    borderRadius: '18px',
  },
  commentCard: {
    width: '100%',
    marginTop: theme.spacing(3),
    boxShadow: '0px 0px 16px 1px rgba(0,0,0,0.2)',
    [theme.breakpoints.up('sm')]: {
      width: '70%',
      margin: 'auto',
      marginTop: theme.spacing(3),
    },
  },
  fromNow: {
    textAlign: 'end',
  },
  userName: {
    color: theme.palette.secondary.main,
    fontWeight: 500,
  },
}));

const Comments = ({ location, history }) => {
  const classes = useStyles();
  const redirectTo = location.state && location.state.from;
  const { feature, issue, product_uuid } = location && location.state;

  const { displayAlert } = useAlert();

  const theme = useTheme();
  const user = useContext(UserContext);
  const organization = user?.organization;
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const [filteredComments, setFilteredComments] = useState([]);
  const [openFormModal, setFormModal] = useState(true);
  const [openConfirmModal, setConfirmModal] = useState(false);
  const commentText = useInput('');
  const [formError, setFormError] = useState({});

  // Assignment state variables
  const [assignedUser, setAssignedUser] = useState(null);
  const [ownerUser, setOwnerUser] = useState(user?.core_user_uuid || null);

  const { data: comments, isLoading: isAllCommentsLoading } = useQuery(
    ['allComments', product_uuid],
    () => getAllCommentQuery(product_uuid, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(product_uuid) && !_.isEqual(_.toNumber(product_uuid), 0) },
  );
  const { data: credentials, isLoading: isAllCredentialLoading } = useQuery(
    ['allCredentials', product_uuid],
    () => getAllCredentialQuery(product_uuid, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(product_uuid) && !_.isEqual(_.toNumber(product_uuid), 0) },
  );

  // Use custom hook for organization members
  const { data: organizationMembers = [], isLoading: isMembersLoading } = useOrganizationMembers();

  useEffect(() => {
    if (!_.isEmpty(feature)) {
      setFilteredComments(_.filter(comments, { feature: feature.feature_uuid }));
    }
    if (!_.isEmpty(issue)) {
      setFilteredComments(_.filter(comments, { issue: issue.issue_uuid }));
    }
  }, [comments]);

  const closeFormModal = () => {
    if (commentText.value) {
      setConfirmModal(true);
    } else {
      setFormModal(false);
      history.push(redirectTo);
    }
  };

  const discardFormData = () => {
    setConfirmModal(false);
    setFormModal(false);
    history.push(redirectTo);
  };

  const { mutate: createCommentMutation, isLoading: isCreatingCommentLoading } = useCreateCommentMutation(product_uuid, history, redirectTo, displayAlert);

  const handleSubmit = (event) => {
    event.preventDefault();
    const featCred = _.find(credentials, (cred) => (_.toLower(cred.auth_detail.tool_type) === 'feature'));
    const issueCred = _.find(credentials, (cred) => (_.toLower(cred.auth_detail.tool_type) === 'issue'));
    const authDetail = !_.isEmpty(feature) ? featCred?.auth_detail : issueCred?.auth_detail;
    const commentData = {
      ...authDetail,
      comment: commentText.value,
      product_uuid: feature?.product_uuid || issue?.product_uuid,
      feature: feature?.feature_uuid,
      issue: issue?.issue_uuid,
      card_number: feature?.feature_tracker_id || issue?.issue_number,
      repository: issue?.repository,
      user_signoff_uuid: user?.core_user_uuid,
      assigned_user_uuid: assignedUser,
      owner_user_uuid: ownerUser,
      user_info: user,
    };
    createCommentMutation(commentData);
  };

  const handleBlur = (e, validation, input, parentId) => {
    const validateObj = validators(validation, input);
    const prevState = { ...formError };
    if (validateObj && validateObj.error) {
      setFormError({
        ...prevState,
        [e.target.id || parentId]: validateObj,
      });
    } else {
      setFormError({
        ...prevState,
        [e.target.id || parentId]: {
          error: false,
          message: '',
        },
      });
    }
  };

  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);
    if (!commentText.value) {
      return true;
    }
    let errorExists = false;
    _.forEach(errorKeys, (key) => {
      if (formError[key].error) {
        errorExists = true;
      }
    });
    return errorExists;
  };

  return (
    <>
      {openFormModal && (
        <FormModal
          open={openFormModal}
          handleClose={closeFormModal}
          title="Comments"
          titleClass={classes.formTitle}
          maxWidth="md"
          wantConfirm
          openConfirmModal={openConfirmModal}
          setConfirmModal={setConfirmModal}
          handleConfirmModal={discardFormData}
        >
          {(isCreatingCommentLoading || isAllCommentsLoading || isAllCredentialLoading || isMembersLoading) && <Loader open={isCreatingCommentLoading || isAllCommentsLoading || isAllCredentialLoading || isMembersLoading} />}
          {!_.isEmpty(filteredComments) && _.map(filteredComments, (comment, index) => (
            <Card key={comment.comment_uuid} className={classes.commentCard}>
              <CardContent>
                <Typography variant="body1" className={classes.userName}>
                  {`${comment?.user_info?.first_name} ${comment?.user_info?.last_name}`}
                </Typography>
                <Typography variant="body2">{comment.comment}</Typography>
                <Typography variant="caption" component="p" className={classes.fromNow}>
                  {moment(comment.create_date).fromNow()}
                </Typography>
              </CardContent>
            </Card>
          ))}
          <form className={classes.form} noValidate onSubmit={handleSubmit}>
            <Grid container spacing={isDesktop ? 2 : 0}>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="commentText"
                  placeholder="Leave a comment"
                  name="commentText"
                  autoComplete="commentText"
                  onBlur={(e) => handleBlur(e, 'required', commentText)}
                  {...commentText.bind}
                />
              </Grid>

              {/* Assignment Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 1, mb: 1 }}>
                  Assignment
                </Typography>
              </Grid>

              {/* Assigned User */}
              <Grid item xs={12} md={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  select
                  id="assignedUser"
                  label="Assign to User"
                  value={assignedUser || ''}
                  onChange={(e) => setAssignedUser(e.target.value)}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {organizationMembers.map((member) => (
                    <MenuItem key={member.core_user_uuid || member.id} value={member.core_user_uuid || member.id}>
                      {member.first_name && member.last_name 
                        ? `${member.first_name} ${member.last_name}` 
                        : member.username || member.email
                      }
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Owner User */}
              <Grid item xs={12} md={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  select
                  id="ownerUser"
                  label="Comment Owner"
                  value={ownerUser || ''}
                  onChange={(e) => setOwnerUser(e.target.value)}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {organizationMembers.map((member) => (
                    <MenuItem key={member.core_user_uuid || member.id} value={member.core_user_uuid || member.id}>
                      {member.first_name && member.last_name 
                        ? `${member.first_name} ${member.last_name}` 
                        : member.username || member.email
                      }
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <Grid container spacing={isDesktop ? 3 : 0} justifyContent="right">
              <Grid item xs={12} sm={4}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  disabled={isAllCommentsLoading || isAllCredentialLoading || submitDisabled()}
                >
                  Comment
                </Button>
              </Grid>
            </Grid>
          </form>
        </FormModal>
      )}
    </>
  );
};

export default Comments;
