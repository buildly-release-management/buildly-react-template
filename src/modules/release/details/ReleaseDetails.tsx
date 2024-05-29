import React, { useEffect, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import _ from "lodash";
import DoughnutChart from "../../../components/Charts/Doughnut";
import BarChart from "../../../components/Charts/BarChart";
import "./ReleaseDetails.css";
import {
  Box,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import ReleaseForm from "./components/ReleaseForm";
import { HttpService } from "../../../services/http.service";
import Loader from "../../../components/Loader/Loader";
import Chatbot from "../../../components/Chatbot/Chatbot";
import { routes } from "../../../routes/routesConstants";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

function ReleaseDetails() {
  const { releaseUuid } = useParams();
  const history = useHistory();
  const httpService = new HttpService();

  const [releaseDetails, setReleaseDetails] = useState<any>([]);
  const [releaseSummary, setReleaseSummary] = useState<any>([]);
  const [releaseFeatures, setReleaseFeatures] = useState<any>([]);
  const [progressSummaryLabels, setProgressSummaryLabels] = useState<any>([]);
  const [progressSummaryValues, setProgressSummaryValues] = useState<any>([]);
  const [assigneesLabels, setAssigneesLabels] = useState<any>([]);
  const [assigneesValues, setAssigneesValues] = useState<any>([]);
  const [barFeatureNames, setBarFeatureNames] = useState<any>([]);
  const [barSummary, setBarSummary] = useState<any>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [value, setValue] = useState("1");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  let featureNames: string[] = [];
  let barChartSummaryData: any[] = [];

  function createData(
    feature_uuid: string,
    name: string,
    progress: number,
    progress_bar_variant: string,
    complexity: number,
    status: number,
    features: number,
    issues: number,
    release_date: string,
    issuesList: any[]
  ) {
    return {
      feature_uuid,
      name,
      progress,
      progress_bar_variant,
      complexity,
      status,
      features,
      issues,
      release_date,
      issuesList,
      history: [
        {
          date: "2020-01-05",
          customerId: "11091700",
          amount: 3,
        },
        {
          date: "2020-01-02",
          customerId: "Anonymous",
          amount: 1,
        },
      ],
    };
  }

  useEffect(() => {
    setSummaryLoading(true);
    try {
      httpService
        .fetchData(
          `/release/release_summary/?release_uuid=${releaseUuid}`,
          "release"
        )
        .then((response: any) => {
          setReleaseDetails(response.data);
          const releaseSummaryObj = response.data;
          if (releaseSummaryObj && releaseSummaryObj.summary) {
            const featuresSummaryObj = generateBarChartData(
              releaseSummaryObj.summary.feature_issues
            );
            setReleaseSummary({
              progressSummary: {
                labels: Object.keys(releaseSummaryObj.summary.features_summary),
                values: Object.values(
                  releaseSummaryObj.summary.features_summary
                ),
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
          setSummaryLoading(false);
        });
    } catch (httpError) {
      console.log("httpError : ", httpError);
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    setSummaryLoading(true);
    try {
      httpService
        .fetchData(
          `/feature/?release_features__release_uuid=${releaseUuid}`,
          "release"
        )
        .then((response: any) => {
          const features = response.data;
          if (features && features.length) {
            features.forEach((feature: any, index: number) => {
              try {
                httpService
                  .fetchData(
                    `/issue/?feature=${feature.feature_uuid}`,
                    "release"
                  )
                  .then((response: any) => {
                    if (response.data) {
                      features[index].issuesList = response.data;
                    }
                  });
              } catch (httpError) {
                console.log("httpError : ", httpError);
              }
            });
          }
          setReleaseFeatures(features);
          setSummaryLoading(false);
        });
    } catch (httpError) {
      console.log("httpError : ", httpError);
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!releaseSummary) return;

    const { progressSummary, features, assignees } = releaseSummary;

    progressSummary?.labels && setProgressSummaryLabels(progressSummary.labels);
    progressSummary?.values && setProgressSummaryValues(progressSummary.values);
    features?.featureNames && setBarFeatureNames(features.featureNames);
    features?.barChartSummaryData &&
      setBarSummary(features.barChartSummaryData);
    assignees?.labels && setAssigneesLabels(assignees.labels);
    assignees?.values && setAssigneesValues(assignees.values);
  }, [releaseSummary]);

  const generateBarChartData = (data: any) => {
    featureNames = [];
    barChartSummaryData = [
      {
        label: "Completed",
        key: "completed",
        backgroundColor: "#0D5595",
        data: [],
      },
      {
        label: "In progress",
        key: "in_progress",
        backgroundColor: "#F8943C",
        data: [],
      },
      {
        label: "Overdue",
        key: "overdue",
        backgroundColor: "#C91B1A",
        data: [],
      },
    ];

    data.forEach((entry: any) => {
      featureNames.push(entry.name);
      Object.keys(entry["issues_data"]).forEach((key) => {
        const index = barChartSummaryData.findIndex(
          (summaryEntry) => summaryEntry.key === key
        );

        if (index > -1) {
          barChartSummaryData[index].data.push(entry["issues_data"][key]);
        }
      });
    });

    return { featureNames, barChartSummaryData };
  };

  function Row(props: { row: ReturnType<typeof createData> }) {
    const { row } = props;
    const [open, setOpen] = React.useState(false);

    return (
      <React.Fragment>
        <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
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
                      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
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
      </React.Fragment>
    );
  }

  return (
    <>
      {summaryLoading ? (
        <Loader open={summaryLoading} />
      ) : (
        <>
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
          <Box sx={{ width: "100%", typography: "body1" }}>
            <TabContext value={value}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <TabList onChange={handleChange} aria-label="release tabs">
                  <Tab label="Report" value="1" />
                  <Tab label="Details" value="2" />
                  <Tab label="Features & Issues" value="3" />
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
                            width: "32%",
                            height: "100%",
                          }}
                        >
                          <DoughnutChart
                            id="progressSummary"
                            label="Progress summary"
                            labels={
                              progressSummaryLabels ? progressSummaryLabels : []
                            }
                            data={
                              progressSummaryValues ? progressSummaryValues : []
                            }
                          />
                        </div>
                        <div
                          className="chart-container"
                          style={{
                            width: "32%",
                          }}
                        >
                          <BarChart
                            id="features"
                            label="Features summary"
                            labels={barFeatureNames ? barFeatureNames : []}
                            data={barSummary ? barSummary : []}
                            backgroundColor="#02b844"
                            borderWidth={1}
                            borderColor="#000"
                          />
                        </div>
                        <div
                          className="chart-container"
                          style={{
                            width: "32%",
                          }}
                        >
                          {!_.isEmpty(assigneesLabels) ? (
                            <DoughnutChart
                              id="resourceAllocation"
                              label="Resource allocation"
                              labels={assigneesLabels ? assigneesLabels : []}
                              data={assigneesValues ? assigneesValues : []}
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
                <ReleaseForm releasesDetails={releaseDetails} />
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
                      {releaseFeatures.length ? (
                        releaseFeatures.map((row: any) => (
                          <Row key={row.feature_uuid} row={row} />
                        ))
                      ) : (
                        <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
                          <TableCell />
                          <TableCell>No features to display</TableCell>
                          <TableCell />
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
            </TabContext>
          </Box>
        </>
      )}
      {/* <Chatbot /> */}
    </>
  );
}

export default ReleaseDetails;
