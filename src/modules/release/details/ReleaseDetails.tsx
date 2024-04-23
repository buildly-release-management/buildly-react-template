import React, { useContext, useEffect, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
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
import { useActor } from "@xstate/react";
import { GlobalStateContext } from "../../../context/globalState";
import Chatbot from "../../../components/Chatbot/Chatbot";
import { routes } from "../../../routes/routesConstants";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

interface BarChartData {
  label: string;
  key: string;
  backgroundColor: string;
  data: number[];
}

const httpService = new HttpService();

function ReleaseDetails() {
  const { releaseUuid } = useParams();
  const history = useHistory();

  const [releaseSummary, setReleaseSummary] = useState(null as any);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const globalContext = useContext(GlobalStateContext);
  const [productState] = useActor(globalContext.productMachineService);

  const [tabKey, setTabKey] = React.useState<string>("report");
  const [value, setValue] = React.useState("1");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const pieChartLabels = ["Done", "In progress", "Overdue"];
  const pieChartLabel = "Releases summary";
  const pieChartData = [7, 5, 3];

  let featureNames: string[] = [];
  let barChartSummaryData: any[] = [];

  const backgroundColor = "#02b844";
  const borderWidth = 1;
  const borderColor = "#000000";

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

  const [releaseDetails, setReleaseDetails] = useState(null as any);
  const [releaseFeatures, setReleaseFeatures] = useState(null as any);

  useEffect(() => {
    if (releaseUuid) {
      if (!releaseDetails) {
        setSummaryLoading(true);
        try {
          httpService
            .fetchData(
              `/release/release_summary/?release_uuid=${releaseUuid}`,
              "release"
            )
            .then((response: any) => {
              if (response && response.data) {
                setReleaseDetails(response.data);
                const releaseSummaryObj = response.data;
                if (releaseSummaryObj && releaseSummaryObj.summary) {
                  // Construct issues summary data
                  const featuresSummaryObj = generateBarChartData(
                    releaseSummaryObj.summary.feature_issues
                  );
                  setReleaseSummary({
                    progressSummary: {
                      labels: Object.keys(
                        releaseSummaryObj.summary.features_summary
                      ),
                      values: Object.values(
                        releaseSummaryObj.summary.features_summary
                      ),
                    },
                    features: featuresSummaryObj,
                    assignees: {
                      labels: releaseSummaryObj.summary.assignee_data
                        ? Object.keys(releaseSummaryObj.summary.assignee_data)
                        : [],
                      values: Object.keys(
                        releaseSummaryObj.summary.assignee_data
                      ).length
                        ? Object.values(releaseSummaryObj.summary.assignee_data)
                        : [],
                    },
                  });
                }
                setSummaryLoading(false);
              }
            });
        } catch (httpError) {
          console.log("httpError : ", httpError);
          setSummaryLoading(false);
        }
      }

      if (!releaseFeatures) {
        setSummaryLoading(true);
        try {
          httpService
            .fetchData(
              `/feature/?release_features__release_uuid=${releaseUuid}`,
              "release"
            )
            .then((response: any) => {
              if (response && response.data) {
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
                      setSummaryLoading(false);
                    }
                  });
                }
                setReleaseFeatures(features);
                setSummaryLoading(false);
              }
            });
        } catch (httpError) {
          setSummaryLoading(false);
        }
      }
    }
  }, [productState]);

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

    if (open && row) {
      setSummaryLoading(true);
      try {
        httpService
          .fetchData(`/issue/?feature=${row.feature_uuid}`, "release")
          .then((response: any) => {
            if (response && response.data) {
              const featureEntryIndex = releaseFeatures.findIndex(
                (r: any) => r.feature_uuid === row.feature_uuid
              );
              if (featureEntryIndex > -1) {
                releaseFeatures[featureEntryIndex].featuresList = response.data;
                row.issuesList = response.data;
                setReleaseFeatures(releaseFeatures);
              }
              setSummaryLoading(false);
            }
          });
      } catch (httpError) {
        console.log("httpError : ", httpError);
        setSummaryLoading(false);
      }
    }

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
                    {row?.issuesList?.map((issue) => (
                      <TableRow key={issue.issue_uuid}>
                        <TableCell>{issue.name}</TableCell>
                        <TableCell align="center">{issue.complexity}</TableCell>
                        <TableCell>{issue.assignees}</TableCell>
                      </TableRow>
                    ))}
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
        <>
          <div className="d-flex flex-column align-items-center justify-content-center h-50">
            <Loader open={summaryLoading} />
          </div>
        </>
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
                    {" "}
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
                            labels={releaseSummary?.progressSummary?.labels}
                            data={releaseSummary?.progressSummary?.values}
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
                            labels={releaseSummary?.features?.featureNames}
                            data={releaseSummary?.features?.barChartSummaryData}
                            backgroundColor={backgroundColor}
                            borderWidth={borderWidth}
                            borderColor={borderColor}
                          />
                        </div>
                        <div
                          className="chart-container"
                          style={{
                            width: "32%",
                          }}
                        >
                          {releaseSummary?.assignees?.labels.length ? (
                            <DoughnutChart
                              id="resourceAllocation"
                              label="Resource allocation"
                              labels={releaseSummary?.assignees?.labels}
                              data={releaseSummary?.assignees?.values}
                            />
                          ) : (
                            <>
                              {" "}
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
                      {releaseFeatures && releaseFeatures.length
                        ? releaseFeatures.map((row: any) => (
                            <Row key={row.feature_uuid} row={row} />
                          ))
                        : []}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
            </TabContext>
          </Box>
        </>
      )}
      <Chatbot />
    </>
  );
}
export default ReleaseDetails;
