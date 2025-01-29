import React, { useEffect, useState } from 'react';
import { Link, Route, useParams } from 'react-router-dom';
import _ from 'lodash';
import { useQuery } from 'react-query';
import {
  Box,
  Collapse,
  IconButton,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
} from '@mui/icons-material';
import Loader from '@components/Loader/Loader';
import Chatbot from '@components/Chatbot/Chatbot';
import DoughnutChart from '@components/Charts/Doughnut/DoughnutChart';
import BarChart from '@components/Charts/BarChart/BarChart';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import useAlert from '@hooks/useAlert';
import { routes } from '@routes/routesConstants';
import { getReleaseSummaryQuery } from '@react-query/queries/release/getReleaseSummaryQuery.js';
import { getReleaseFeaturesIssuesQuery } from '@react-query/queries/release/getReleaseFeaturesIssuesQuery';
import { getBugsPunchListQuery } from '@react-query/queries/collabhub/getBugsPunchListQuery';
import { useStore } from '@zustand/product/productStore';
import ReleaseForm from './components/ReleaseForm';
import { punchListColumns, bugsColumns } from './ReleaseConstants';
import './ReleaseDetails.css';

const ReleaseDetails = ({ history }) => {
  const { releaseUuid } = useParams();
  const { displayAlert } = useAlert();

  const { activeProduct } = useStore();

  const [releaseSummary, setReleaseSummary] = useState([]);
  const [progressSummaryLabels, setProgressSummaryLabels] = useState([]);
  const [progressSummaryValues, setProgressSummaryValues] = useState([]);
  const [assigneesLabels, setAssigneesLabels] = useState([]);
  const [assigneesValues, setAssigneesValues] = useState([]);
  const [barFeatureNames, setBarFeatureNames] = useState([]);
  const [barSummary, setBarSummary] = useState([]);
  const [value, setValue] = useState('2');

  const { data: releaseDetails, isLoading: isReleaseDetailsLoading } = useQuery(
    ['releaseSummary', releaseUuid],
    () => getReleaseSummaryQuery(releaseUuid, null, displayAlert),
    { refetchOnWindowFocus: false },
  );
  const { data: releaseFeatures, isLoading: isReleaseFeaturesLoading } = useQuery(
    ['releaseFeatures', releaseUuid],
    () => getReleaseFeaturesIssuesQuery(releaseUuid, displayAlert),
    { refetchOnWindowFocus: false },
  );
  const { data: bugsPunchList, isLoading: isBugsPunchListLoading } = useQuery(
    ['releaseBugsPunchList', releaseUuid],
    () => getBugsPunchListQuery(activeProduct, releaseDetails?.name, displayAlert),
    { refetchOnWindowFocus: false },
  );

  let featureNames = [];
  let barChartSummaryData = [];

  useEffect(() => {
    const releaseSummaryObj = releaseDetails;
    if (!_.isEmpty(releaseSummaryObj) && releaseSummaryObj.summary) {
      const featuresSummaryObj = generateBarChartData(releaseSummaryObj.summary.feature_issues);
      setReleaseSummary({
        progressSummary: {
          labels: Object.keys(releaseSummaryObj.summary.features_summary),
          values: Object.values(releaseSummaryObj.summary.features_summary),
        },
        features: featuresSummaryObj,
        assignees: {
          labels: releaseSummaryObj.summary.assignee_data
            ? Object.keys(releaseSummaryObj.summary.assignee_data)
            : [],
          values: Object.keys(releaseSummaryObj.summary.assignee_data)
            .length
            ? Object.values(releaseSummaryObj.summary.assignee_data)
            : [],
        },
      });
    }
  }, [releaseDetails]);

  useEffect(() => {
    if (!releaseSummary) return;

    const { progressSummary, features, assignees } = releaseSummary;

    if (progressSummary) {
      if (progressSummary.labels) {
        setProgressSummaryLabels(progressSummary.labels);
      }
      if (progressSummary.values) {
        setProgressSummaryValues(progressSummary.values);
      }
    }

    if (features) {
      if (features.featureNames) {
        setBarFeatureNames(features.featureNames);
      }
      if (features.barChartSummaryData) {
        setBarSummary(features.barChartSummaryData);
      }
    }

    if (assignees) {
      if (assignees.labels) {
        setAssigneesLabels(assignees.labels);
      }
      if (assignees.values) {
        setAssigneesValues(assignees.values);
      }
    }
  }, [releaseSummary]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const generateBarChartData = (data) => {
    featureNames = [];
    barChartSummaryData = [
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

    _.forEach(data, (entry) => {
      featureNames.push(entry.name);
      Object.keys(entry.issues_data).forEach((key) => {
        const index = barChartSummaryData.findIndex(
          (summaryEntry) => summaryEntry.key === key,
        );

        if (index > -1) {
          barChartSummaryData[index].data.push(entry.issues_data[key]);
        }
      });
    });

    return { featureNames, barChartSummaryData };
  };

  const onAddPunchListButtonClick = () => {
    history.push(routes.ADD_PUNCHLIST, { from: location.pathname, release_uuid: releaseUuid });
  };

  const onAddBugButtonClick = () => {
    history.push(routes.ADD_BUG, { from: location.pathname, release_uuid: releaseUuid });
  };

  const Row = (props) => {
    const { row } = props;
    const [open, setOpen] = React.useState(false);

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
          <TableCell>{row.name}</TableCell>
          <TableCell align="center">{row.complexity}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Table size="small" aria-label="issues">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell align="center">Complexity</TableCell>
                      <TableCell>Assignees</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row?.issuesList?.length ? (
                      row?.issuesList?.map((issue) => (
                        <TableRow key={issue.issue_uuid}>
                          <TableCell>{issue.name}</TableCell>
                          <TableCell align="center">
                            {issue.complexity}
                          </TableCell>
                          <TableCell>{issue.assignees}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                        <TableCell>No issues to display</TableCell>
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
      {(isReleaseDetailsLoading || isReleaseFeaturesLoading || isBugsPunchListLoading) && <Loader open={isReleaseDetailsLoading || isReleaseFeaturesLoading || isBugsPunchListLoading} />}
      <Box className="toolbar" display="flex" alignItems="center">
        <IconButton
          aria-label="back"
          onClick={(e) => history.push(routes.RELEASE)}
        >
          <KeyboardArrowLeftIcon />
        </IconButton>
        <Link
          className="toolbar-header"
          to={{
            pathname: routes.RELEASE,
          }}
        >
          {releaseDetails && releaseDetails.name}
        </Link>
      </Box>

      <Box sx={{ width: '100%', typography: 'body1' }}>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange} aria-label="release tabs">
              <Tab label="Report" value="1" />
              <Tab label="Details" value="2" />
              <Tab label="Features & Issues" value="3" />
              <Tab label="PunchList" value="4" />
              <Tab label="Bugs" value="5" />
            </TabList>
          </Box>
          <TabPanel value="1">
            {releaseDetails?.features?.length ? (
              <>
                <div className="container-fluid release-summary-container">
                  <div className="row flex-nowrap justify-content-between">
                    <div
                      className="chart-container"
                      style={{
                        width: '32%',
                        height: '100%',
                      }}
                    >
                      <DoughnutChart
                        id="progressSummary"
                        label="Progress summary"
                        labels={
                          progressSummaryLabels || []
                        }
                        data={
                          progressSummaryValues || []
                        }
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
                        labels={barFeatureNames || []}
                        data={barSummary || []}
                        backgroundColor="#02b844"
                        borderWidth={1}
                        borderColor="#000"
                      />
                    </div>
                    <div
                      className="chart-container"
                      style={{
                        width: '32%',
                      }}
                    >
                      {!_.isEmpty(assigneesLabels) ? (
                        <DoughnutChart
                          id="resourceAllocation"
                          label="Resource allocation"
                          labels={assigneesLabels || []}
                          data={assigneesValues || []}
                        />
                      ) : (
                        <>
                          <Typography>Resource allocation</Typography>
                          <Typography className="m-auto">
                            No data to display
                          </Typography>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <Typography>No features added yet</Typography>
            )}
          </TabPanel>
          <TabPanel value="2">
            <ReleaseForm releasesDetails={releaseDetails} displayAlert={displayAlert} />
          </TabPanel>
          <TabPanel value="3">
            <TableContainer component={Paper}>
              <Table aria-label="collapsible table">
                <TableHead>
                  <TableRow>
                    <TableCell width="12" />
                    <TableCell width="33%">Name</TableCell>
                    <TableCell align="center">Complexity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!_.isEmpty(releaseFeatures) ? (
                    _.map(releaseFeatures, (row) => (
                      <Row key={row.feature_uuid} row={row} />
                    ))
                  ) : (
                    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                      <TableCell />
                      <TableCell>No features to display</TableCell>
                      <TableCell />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
          <TabPanel value="4">
            <DataTableWrapper
              loading={isBugsPunchListLoading}
              rows={bugsPunchList?.punchLists || []}
              columns={punchListColumns}
              filename="PunchList"
              addButtonHeading="PunchList"
              onAddButtonClick={onAddPunchListButtonClick}
              tableHeader="PunchList"
            />
          </TabPanel>
          <TabPanel value="5">
            <DataTableWrapper
              loading={isBugsPunchListLoading}
              rows={bugsPunchList?.bugs || []}
              columns={bugsColumns}
              filename="Bugs"
              addButtonHeading="Bug"
              onAddButtonClick={onAddBugButtonClick}
              tableHeader="Bugs"
            />
          </TabPanel>
        </TabContext>
      </Box>

      <Chatbot />
    </>
  );
};

export default ReleaseDetails;
