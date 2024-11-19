import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';
import makeStyles from '@mui/styles/makeStyles';
import {
  Divider, IconButton, ListItemIcon, MenuItem, Typography,
} from '@mui/material';
import {
  AddTask as AddTaskIcon,
  CallSplit as CallSplitIcon,
  Close as CloseIcon,
  Comment as CommentIcon,
  Link as LinkIcon,
  Task as TaskIcon,
} from '@mui/icons-material';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import Loader from '@components/Loader/Loader';
import SearchInput from '@components/SearchInput/SearchInput';
import useAlert from '@hooks/useAlert';
import { getAllStatusQuery } from '@react-query/queries/release/getAllStatusQuery';
import { getAllFeatureQuery } from '@react-query/queries/release/getAllFeatureQuery';
import { getAllIssueQuery } from '@react-query/queries/release/getAllIssueQuery';
import { getAllCommentQuery } from '@react-query/queries/release/getAllCommentQuery';
import { featureColumns, issueColumns } from '../ProductRoadmapConstants';

const useStyles = makeStyles((theme) => ({
  upgrade: {},
  tabular: {
    padding: theme.spacing(5),
    paddingTop: 0,
  },
  tabular2: {
    marginTop: `-${theme.spacing(5)}`,
  },
  noProduct: {
    marginTop: theme.spacing(12),
    textAlign: 'center',
  },
}));

const Tabular = ({
  selectedProduct,
  addItem,
  editItem,
  deleteItem,
  commentItem,
  issueSuggestions,
  upgrade,
  suggestedFeatures,
  createSuggestedFeature,
  removeSuggestedFeature,
  showRelatedIssues,
  featSearch,
  setFeatSearch,
  issSearch,
  setIssSearch,
}) => {
  const classes = useStyles();
  const { displayAlert } = useAlert();

  const [featureRows, setFeatureRows] = useState([]);
  const [featMenuActions, setFeatMenuActions] = useState([]);
  const [issueRows, setIssueRows] = useState([]);
  const [issueMenuActions, setIssueMenuActions] = useState([]);
  const [finalSugCols, setFinalSugCols] = useState([]);
  const [menuIndex, setMenuIndex] = useState(0);

  const { data: statuses, isLoading: isAllStatusLoading } = useQuery(
    ['allStatuses', selectedProduct],
    () => getAllStatusQuery(selectedProduct, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(selectedProduct) && _.toNumber(selectedProduct) !== 0 },
  );
  const { data: features, isLoading: isAllFeatureLoading } = useQuery(
    ['allFeatures', selectedProduct],
    () => getAllFeatureQuery(selectedProduct, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(selectedProduct) && _.toNumber(selectedProduct) !== 0 },
  );
  const { data: issues, isLoading: isAllIssueLoading } = useQuery(
    ['allIssues', selectedProduct],
    () => getAllIssueQuery(selectedProduct, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(selectedProduct) && _.toNumber(selectedProduct) !== 0 },
  );

  const { data: comments, isLoading: isAllCommentLoading } = useQuery(
    ['allComments', selectedProduct],
    () => getAllCommentQuery(selectedProduct, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(selectedProduct) && _.toNumber(selectedProduct) !== 0 },
  );

  useEffect(() => {
    const fma = (
      <div>
        <Divider />
        <MenuItem onClick={(e) => commentItem(featureRows[menuIndex])}>
          <ListItemIcon>
            <CommentIcon fontSize="small" />
          </ListItemIcon>
          Comments (
          {_.size(_.filter(comments, { feature: featureRows[menuIndex]?.feature_uuid }))}
          )
        </MenuItem>
        <Divider />
        <MenuItem onClick={(e) => issueSuggestions(featureRows[menuIndex])}>
          <ListItemIcon>
            <TaskIcon fontSize="small" />
          </ListItemIcon>
          Convert to issue/ticket for dev team
        </MenuItem>
        <Divider />
        <MenuItem onClick={(e) => showRelatedIssues(featureRows[menuIndex]?.feature_uuid)}>
          <ListItemIcon>
            <CallSplitIcon fontSize="small" />
          </ListItemIcon>
          Show Related Issues
        </MenuItem>
      </div>
    );
    setFeatMenuActions(fma);
  }, [featureRows, menuIndex, comments]);

  useEffect(() => {
    const ima = (
      <div>
        <Divider />
        <MenuItem onClick={(e) => commentItem(issueRows[menuIndex])}>
          <ListItemIcon>
            <CommentIcon fontSize="small" />
          </ListItemIcon>
          Comments
        </MenuItem>
        {!!issueRows[menuIndex] && !!issueRows[menuIndex].feature_uuid && (
          <>
            <Divider />
            <MenuItem
              onClick={(e) => {
                const feat = _.find(features, { feature_uuid: issueRows[menuIndex].feature_uuid });
                editItem(feat, 'feat', true);
              }}
            >
              <ListItemIcon>
                <LinkIcon fontSize="small" />
              </ListItemIcon>
              View linked feature
            </MenuItem>
          </>
        )}
      </div>
    );
    setIssueMenuActions(ima);
  }, [features, issueRows, menuIndex, comments]);

  useEffect(() => {
    const featRows = _.map(features, (feat) => ({
      ...feat,
      _status: _.find(statuses, { status_uuid: feat.status })?.name,
      _url: feat.feature_detail?.url || '',
    }));

    const issRows = _.map(issues, (iss) => ({
      ...iss,
      _status: _.find(statuses, { status_uuid: iss.status })?.name,
      _url: iss.issue_detail?.url || '',
    }));

    setFeatureRows(featRows);
    setIssueRows(issRows);
  }, [statuses, features, issues]);

  useEffect(() => {
    if (!_.isEmpty(suggestedFeatures)) {
      const cols = [
        {
          name: 'suggested_feature',
          label: 'Suggested Feature',
          options: {
            sort: true,
            sortThirdClickReset: true,
            filter: true,
            customBodyRender: (value) => value || '',
          },
        },
        {
          name: 'Accept this suggestion',
          options: {
            filter: false,
            sort: false,
            empty: true,
            setCellProps: (value) => ({
              style: { width: 200 },
            }),
            setCellHeaderProps: (value) => ({
              style: { width: 200 },
            }),
            customBodyRenderLite: (dataIndex) => (
              <IconButton onClick={() => createSuggestedFeature(suggestedFeatures[dataIndex])}>
                <AddTaskIcon />
              </IconButton>
            ),
          },
        },
        {
          name: 'Discard this suggestion',
          options: {
            filter: false,
            sort: false,
            empty: true,
            setCellProps: (value) => ({
              style: { width: 200 },
            }),
            setCellHeaderProps: (value) => ({
              style: { width: 200 },
            }),
            customBodyRenderLite: (dataIndex) => (
              <IconButton onClick={() => removeSuggestedFeature(suggestedFeatures[dataIndex])}>
                <CloseIcon />
              </IconButton>
            ),
          },
        },
      ];
      setFinalSugCols(cols);
    }
  }, [suggestedFeatures]);

  const customSearch = (searchQuery, currentRow, columns) => {
    let isFound = false;
    currentRow.forEach((col) => {
      if (col && (col.toString().indexOf(searchQuery) >= 0)) {
        isFound = true;
      }
    });
    return isFound;
  };

  return (
    <>
      {(isAllStatusLoading || isAllFeatureLoading || isAllIssueLoading || isAllCommentLoading) && (
        <Loader open={isAllStatusLoading || isAllFeatureLoading || isAllIssueLoading || isAllCommentLoading} />
      )}
      {(_.isEmpty(selectedProduct) || _.isEqual(_.toNumber(selectedProduct), 0)) && (
        <Typography className={classes.noProduct} component="div" variant="body1">
          No product selected yet. Please select a product to view related features and/or issues.
        </Typography>
      )}
      {!_.isEmpty(selectedProduct) && upgrade && !_.isEqual(_.toNumber(selectedProduct), 0) && (
        <Typography variant="h6" align="center">
          Upgrade to be able to create more features
        </Typography>
      )}
      {!_.isEmpty(selectedProduct) && !_.isEmpty(suggestedFeatures) && !_.isEqual(_.toNumber(selectedProduct), 0) && (
        <div className={classes.tabular}>
          <DataTableWrapper
            rows={suggestedFeatures}
            columns={finalSugCols}
            filename="SuggestedFeaturesList"
            hideAddButton
            tableHeader="Suggested Features"
          />
        </div>
      )}
      {!!selectedProduct && !_.isEqual(_.toNumber(selectedProduct), 0) && (
        <div
          className={
            suggestedFeatures && !_.isEmpty(suggestedFeatures)
              ? `${classes.tabular} ${classes.tabular2}`
              : classes.tabular
          }
        >
          <DataTableWrapper
            rows={featureRows}
            columns={featureColumns}
            filename="FeaturesList"
            hideAddButton={!selectedProduct || (!!selectedProduct && upgrade)}
            addButtonHeading="Add Feature"
            onAddButtonClick={(e) => addItem('feat')}
            editAction={(feat) => editItem(feat, 'feat')}
            deleteAction={(feat) => deleteItem(feat, 'feat')}
            tableHeader="Features"
            menuActions={featMenuActions}
            menuIndex={menuIndex}
            setMenuIndex={setMenuIndex}
            extraOptions={{
              searchText: featSearch,
              searchProps: {
                onChange: (e) => {
                  setFeatSearch(e.target.value);
                },
              },
              customSearch,
              customSearchRender: (searchText, handleSearch, hideSearch, options) => (
                <SearchInput
                  searchText={featSearch}
                  setSearchText={setFeatSearch}
                  onSearch={handleSearch}
                  onHide={hideSearch}
                  options={options}
                />
              ),
            }}
          />
        </div>
      )}
      {!!selectedProduct && _.toNumber(selectedProduct) !== 0 && (
        <div className={`${classes.tabular} ${classes.tabular2}`}>
          <DataTableWrapper
            rows={issueRows}
            columns={issueColumns}
            filename="IssuesList"
            hideAddButton={!selectedProduct || (!!selectedProduct && upgrade)}
            addButtonHeading="Add Issue"
            onAddButtonClick={(e) => addItem('issue')}
            editAction={(issue) => editItem(issue, 'issue')}
            deleteAction={(issue) => deleteItem(issue, 'issue')}
            tableHeader="Issues"
            menuActions={issueMenuActions}
            menuIndex={menuIndex}
            setMenuIndex={setMenuIndex}
            extraOptions={{
              searchText: issSearch,
              searchProps: {
                onChange: (e) => {
                  setIssSearch(e.target.value);
                },
              },
              customSearch,
              customSearchRender: (searchText, handleSearch, hideSearch, options) => (
                <SearchInput
                  searchText={issSearch}
                  setSearchText={setIssSearch}
                  onSearch={handleSearch}
                  onHide={hideSearch}
                  options={options}
                />
              ),
            }}
          />
        </div>
      )}
    </>
  );
};

export default Tabular;
