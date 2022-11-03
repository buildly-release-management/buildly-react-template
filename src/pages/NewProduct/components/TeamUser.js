/* eslint-disable no-param-reassign */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import makeStyles from '@mui/styles/makeStyles';
import {
  Grid,
  Typography,
  Box,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  TextField,
  Button,
  ImageList,
  ImageListItem,
} from '@mui/material';
import { useInput } from '@hooks/useInput';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { docIdentifier } from '@redux/product/actions/product.actions';

const useStyles = makeStyles((theme) => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
      width: '70%',
      margin: 'auto',
    },
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    borderRadius: theme.spacing(2.25),
  },
  formTitle: {
    fontWeight: 'bold',
    marginTop: '1em',
    textAlign: 'center',
  },
  buttonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  loadingWrapper: {
    position: 'relative',
  },
  inputWithTooltip: {
    display: 'flex',
    alignItems: 'center',
  },
  filesText: {
    marginTop: theme.spacing(2),
  },
  uploadedFiles: {
    border: `1px solid ${theme.palette.neutral.text}`,
  },
}));

const StyledRadio = (props) => <Radio color="info" {...props} />;

// eslint-disable-next-line import/no-mutable-exports
export let checkIfTeamUserEdited;

const TeamUser = ({
  productFormData, handleNext, handleBack, dispatch, editData,
}) => {
  const classes = useStyles();
  const [filesUpload, setFilesUpload] = useState([]);

  const teamSize = useInput((editData
    && editData.product_info
    && editData.product_info.team_size)
  || (productFormData
      && productFormData.product_info
      && productFormData.product_info.team_size)
    || '5 - 10',
  { required: true });

  const [roleCount, setRoleCount] = useState((editData
    && editData.product_info
    && editData.product_info.role_count)
  || (productFormData
      && productFormData.product_info
      && productFormData.product_info.role_count)
    || [
      { role: 'CTO (Budget Approval?)', count: 0 },
      { role: 'COO (Budget Approval?)', count: 0 },
      { role: 'UI/UX', count: 0 },
      { role: 'Lead Developer', count: 0 },
      { role: 'Product Manager', count: 0 },
      { role: 'Product Manager (Budget Approval?)', count: 0 },
      { role: 'Others', count: 0 },
    ]);

  const doc_file = useInput((editData
    && editData.product_info
    && editData.product_info.doc_file)
  || (productFormData
    && productFormData.product_info
    && productFormData.product_info.doc_file)
  || []);

  const submitDisabled = () => {
    let countNum = 0;
    _.forEach(roleCount, (roleCountObject) => {
      if (roleCountObject.count === 0) {
        countNum += 1;
      }
    });
    if (countNum === roleCount.length) {
      return true;
    }
    return false;
  };

  checkIfTeamUserEdited = () => (
    teamSize.hasChanged()
    || !!(productFormData
      && productFormData.product_info
      && productFormData.product_info.role_count
      && !_.isEqual(roleCount,
        productFormData.product_info.role_count))
    || !!(filesUpload && !_.isEmpty(filesUpload))
  );

  const fileChange = (event) => {
    setFilesUpload(event.target.files);
  };

  /**
   * Submit The form and add/edit custodian
   * @param {Event} event the default submit event
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const uploadFile = new FormData();
    _.mapKeys(filesUpload, (value, key) => {
      uploadFile.append('file', value);
    });
    const formData = {
      ...productFormData,
      product_info: {
        ...productFormData.product_info,
        team_size: teamSize.value,
        role_count: roleCount,
        doc_file: doc_file.value,
      },
      edit_date: new Date(),
    };

    dispatch(docIdentifier(uploadFile, formData));
    handleNext();
  };

  return (
    <div>
      <form className={classes.form} noValidate onSubmit={handleSubmit}>
        <Box mb={2} mt={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <Typography variant="h6" gutterBottom component="div">
                What is the size of your current team and backgrounds/roles?
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12}>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  aria-label="current-team-size"
                  name="current-team-size-radio-group"
                  {...teamSize.bind}
                >
                  <FormControlLabel
                    value="1 - 5"
                    control={<StyledRadio />}
                    label="1 - 5"
                  />
                  <FormControlLabel
                    value="5 - 10"
                    control={<StyledRadio />}
                    label="5 - 10"
                  />
                  <FormControlLabel
                    value="10 - 20 or more"
                    control={<StyledRadio />}
                    label="10 - 20 or more"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Roles</TableCell>
                      <TableCell />
                      <TableCell>Count</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {_.map(roleCount, (row, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          {row.role}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={() => {
                              if (roleCount[index].count > 0) {
                                setRoleCount((prc) => {
                                  prc[index].count -= 1;
                                  return [...prc];
                                });
                              }
                            }}
                            size="large"
                          >
                            <RemoveIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell style={{ width: '30%' }}>
                          <TextField
                            disabled
                            onChange={(e) => {
                              setRoleCount((pvrc) => {
                                pvrc[index].count += parseInt(
                                  e.target.value,
                                  10,
                                );
                                return [...pvrc];
                              });
                            }}
                            value={row.count}
                            type="number"
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell align="left">
                          <IconButton
                            onClick={() => {
                              setRoleCount((prvrc) => {
                                prvrc[index].count += 1;
                                return [...prvrc];
                              });
                            }}
                            size="large"
                          >
                            <AddIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom component="div">
                Do you have any existing requirements documents, mockups,
                designs etc.?
              </Typography>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                type="file"
                id="uploadFiles"
                label="Upload Files"
                name="uploadFiles"
                autoComplete="uploadFiles"
                inputProps={{ multiple: true }}
                InputLabelProps={{ shrink: true }}
                onChange={fileChange}
              />
            </Grid>
          </Grid>

          {doc_file.value && !_.isEmpty(doc_file.value) && (
            <>
              <Grid item xs={12} className={classes.filesText}>
                <Typography variant="body1" gutterBottom component="div">
                  Already uploaded files
                </Typography>
              </Grid>

              <ImageList sx={{ width: '100%', height: 200 }} cols={4} rowHeight={200} gap={40}>
                {_.map(doc_file.value, (file, index) => (
                  <ImageListItem key={`${index}-${file}`}>
                    <a href={file} target="_blank" rel="noopener noreferrer">
                      <img
                        src={`${file}?w=164&h=164&fit=crop&auto=format`}
                        srcSet={`${file}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                        alt={`Uploaded file ${index + 1}`}
                        loading="lazy"
                        className={classes.uploadedFiles}
                      />
                    </a>
                  </ImageListItem>
                ))}
              </ImageList>
            </>
          )}

          <Grid container spacing={3} className={classes.buttonContainer}>
            <Grid item xs={12} sm={4}>
              <Button
                type="button"
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleBack}
                className={classes.submit}
              >
                Back
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={submitDisabled()}
                className={classes.submit}
              >
                Next
              </Button>
            </Grid>
          </Grid>
        </Box>
      </form>
    </div>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  productFormData: state.productReducer.productFormData,
});

export default connect(mapStateToProps)(TeamUser);
