import { useActor, useSelector } from "@xstate/react";
import Table from "react-bootstrap/Table";
import { Release } from "../../../interfaces/release";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dropdown, ProgressBar } from "react-bootstrap";
import DoughnutChart from "../../../components/Charts/Doughnut";
import BarChart from "../../../components/Charts/BarChart";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Collapse,
  IconButton,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { HttpService } from "../../../services/http.service";
import Tooltip from "@mui/material/Tooltip";
import "./ReleaseList.css";
import { GlobalStateContext } from "../../../context/globalState";
import Chatbot from "../../../components/Chatbot/Chatbot";
import { routes } from "../../../routes/routesConstants";
import Loader from "../../../components/Loader/Loader";
import { connect } from "react-redux";
import {
  getAllFeatures,
  getAllIssues,
} from "../../../redux/release/actions/release.actions";
import _ from "lodash";

const httpService = new HttpService();

interface BarChartData {
  label: string;
  key: string;
  backgroundColor: string;
  data: number[];
}

function ReleaseList({ loading, loaded, dispatch, features, issues }: any) {
  const [releasesSummary, setReleasesSummary] = useState(null as any);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const globalContext = useContext(GlobalStateContext);
  const [productState] = useActor(globalContext.productMachineService);
  const [releaseState, sendRelease] = useActor(
    globalContext.releaseMachineService
  );
  const selectCurrentProduct = (state: any) => state.context.selectedProduct;
  const selectReleases = (state: any) => state.context.releases;

  const [selectedFeatures, setSelectedFeatures] = useState<any>([]);

  const uncheckedIcon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const currentProduct = useSelector(
    globalContext.productMachineService,
    selectCurrentProduct
  );
  const releases = useSelector(
    globalContext.releaseMachineService,
    selectReleases
  );

  useEffect(() => {
    if (currentProduct) {
      dispatch(getAllFeatures(currentProduct.product_uuid));
      dispatch(getAllIssues(currentProduct.product_uuid));
    }
  }, [currentProduct]);

  useEffect(() => {
    if (releases && releases.length > 0) {
      setSummaryLoading(true);
      releases.sort((a: any, b: any) =>
        a.release_date.localeCompare(b.release_date)
      );
      releases.forEach((release: any, index: number) => {
        try {
          httpService
            .fetchData(
              `/feature/?release_features__release_uuid=${release.release_uuid}`,
              "release"
            )
            .then((response: any) => {
              if (response.data) {
                releases[index].featuresList = response.data;
              }
            });
        } catch (httpError) {
          setSummaryLoading(false);
        }
      });
      setSummaryLoading(false);
    }
  }, [releases]);

  let featuresReleaseNames: string[] = [];
  let issuesReleaseNames: string[] = [];

  useEffect(() => {
    if (currentProduct) {
      sendRelease({
        type: "LoadReleases",
        product_uuid: currentProduct.product_uuid,
      });
      setSummaryLoading(true);
      try {
        httpService
          .fetchData(
            `/release/release_summary/?product_uuid=${currentProduct.product_uuid}`,
            "release"
          )
          .then((response: any) => {
            const issuesSummaryObj = generateBarChartData(
              response.data.issues,
              "issues_data"
            );
            issuesReleaseNames = issuesSummaryObj.releaseNames;
            const featuresSummaryObj = generateBarChartData(
              response.data.features,
              "features_data"
            );
            featuresReleaseNames = featuresSummaryObj.releaseNames;
            setReleasesSummary({
              releases: Object.values(response.data.releases),
              features: featuresSummaryObj.barChartSummaryData,
              issues: issuesSummaryObj.barChartSummaryData,
            });
            setSummaryLoading(false);
          });
      } catch (httpError) {
        setSummaryLoading(false);
      }
    }
  }, [productState, currentProduct]);

  const generateBarChartData = (data: any, dataField: string) => {
    setSummaryLoading(true);
    const releaseNames: string[] = [];
    const barChartSummaryData: BarChartData[] = [
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
      releaseNames.push(entry.release);
      Object.keys(entry[dataField]).forEach((key) => {
        const index = barChartSummaryData.findIndex(
          (summaryEntry) => summaryEntry.key === key
        );
        if (index > -1) {
          barChartSummaryData[index].data.push(entry[dataField][key]);
        }
      });
    });
    setSummaryLoading(false);
    return { releaseNames, barChartSummaryData };
  };

  const [showReleaseModal, setShow] = useState(false);

  const handleShow = () => {
    setFormData({
      ...formData,
      name: "",
      release_date: "",
    });
    setShow(true);
  };

  const handleClose = () => setShow(false);

  const [formData, setFormData] = useState({} as Release);

  const updateFormData = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const submitRelease = (event: any) => {
    event.preventDefault();
    if (currentProduct) {
      const data = {
        product_uuid: currentProduct.product_uuid,
        features:
          selectedFeatures &&
          selectedFeatures.map((obj: any) => obj.feature_uuid),
        ...formData,
      };
      sendRelease({ type: "Submit", release: data });
      handleClose();
    }
  };

  const deleteRelease = (row: any) => {
    sendRelease({ type: "Delete", release_uuid: row.release_uuid });
  };

  const pieChartLabels = ["Completed", "Overdue", "In progress"];
  const backgroundColor = "#02b844";
  const borderWidth = 1;
  const borderColor = "#000000";

  function createData(
    release_uuid: string,
    name: string,
    features_done: number,
    features_count: number,
    issues_count: number,
    release_date: string,
    featuresList: any[]
  ) {
    const barValue = (features_done / features_count) * 100;
    return {
      release_uuid,
      name,
      features_done,
      features_count,
      issues_count,
      release_date,
      featuresList,
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

  const initProgressBar = (row: any) => {
    const value = Math.round((row.features_done / row.features_count) * 100) ;
    const theme = value > 74 ? "info" : value > 40 ? "warning" : "danger";
    return { value, theme };
  };

  function Row(props: { row: ReturnType<typeof createData> }) {
    const { row } = props;
    const [open, setOpen] = React.useState(false);

    let progressBarObj = {
      value: 0,
      theme: "danger",
    };

    if (row.features_count > 0) {
      progressBarObj = initProgressBar(row);
    }

    if (open && row) {
      try {
        httpService
          .fetchData(
            `/feature/?release_features__release_uuid=${row.release_uuid}`,
            "release"
          )
          .then((response: any) => {
            if (response.data) {
              const releaseEntryIndex = releases.findIndex(
                (r: any) => r.release_uuid === row.release_uuid
              );
              if (releaseEntryIndex > -1) {
                releases[releaseEntryIndex].featuresList = response.data;
                row.featuresList = response.data;
              }
            }
          });
      } catch (httpError) {
        console.log("httpError : ", httpError);
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
          <TableCell>
            <Link to={`${routes.RELEASE}/${row.release_uuid}`}>{row.name}</Link>{" "}
          </TableCell>
          <TableCell>
            <Tooltip
              title={`${progressBarObj.value}% achieved`}
              placement="right-start"
            >
              <ProgressBar
                now={progressBarObj.value}
                label={`${progressBarObj.value}%`}
                variant={progressBarObj.theme}
              />
            </Tooltip>
          </TableCell>
          <TableCell align="center">{row.features_count}</TableCell>
          <TableCell align="center">{row.issues_count}</TableCell>
          <TableCell align="center">{row.release_date}</TableCell>
          <TableCell align="right">
            <Dropdown>
              <Dropdown.Toggle variant="light" id="dropdown-basic">
                <IconButton aria-label="expand row" size="small"></IconButton>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => deleteRelease(row)}>
                  Delete release
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell
            style={{
              paddingBottom: 0,
              paddingTop: 0,
              paddingLeft: 8,
              backgroundColor: "#f5f5f5",
            }}
            colSpan={12}
          >
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Table size="small" aria-label="features">
                  <TableHead>
                    <TableRow>
                      <TableCell width="12" />
                      <TableCell width="33%">Name</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell align="center">Complexity</TableCell>
                      <TableCell align="center">Issues</TableCell>
                      <TableCell align="right">Assignees</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row?.featuresList?.length > 0 ? (
                      row.featuresList.map((feature: any) => (
                        <FeatureRow
                          key={feature.feature_uuid}
                          feature={feature}
                        />
                      ))
                    ) : (
                      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
                        <TableCell />
                        <TableCell>No features to display</TableCell>
                        <TableCell />
                        <TableCell />
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

  function FeatureRow(props: any) {
    const { feature }: any = props;
    const [featureOpen, setFeatureOpen] = React.useState(false);
    const [relatedIssues, setRelatedIssues] = React.useState<any>([]);

    useEffect(() => {
      setRelatedIssues(
        _.filter(
          issues,
          (issueItem) =>
            _.toString(issueItem.feature) === _.toString(feature.feature_uuid)
        )
      );
    }, [feature]);

    return (
      <React.Fragment>
        <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setFeatureOpen(!featureOpen)}
            >
              {featureOpen ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )}
            </IconButton>
          </TableCell>
          <TableCell>{feature.name}</TableCell>
          <TableCell>{feature.progress}</TableCell>
          <TableCell align="center">{feature.complexity}</TableCell>
          <TableCell align="center">{relatedIssues.length}</TableCell>
          <TableCell align="right">{feature.assignees}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell
            style={{
              paddingBottom: 0,
              paddingTop: 0,
              paddingLeft: 8,
              backgroundColor: "#f5f5f5",
            }}
            colSpan={12}
          >
            <Collapse in={featureOpen} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Table size="small" aria-label="features">
                  <TableHead>
                    <TableRow>
                      <TableCell width="33%">Name</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell align="center">Complexity</TableCell>
                      <TableCell align="right">Assignees</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {relatedIssues.length > 0 ? (
                      relatedIssues.map((issue: any) => (
                        <TableRow key={issue.issue_uuid}>
                          <TableCell>{issue.name}</TableCell>
                          <TableCell>{issue.progress}</TableCell>
                          <TableCell align="center">
                            {issue.complexity}
                          </TableCell>
                          <TableCell align="right">{issue.assignees}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
                        <TableCell>No issues to display</TableCell>
                        <TableCell />
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
      {summaryLoading ||
      loading ||
      !loaded ||
      releaseState.matches("Entry.Loading") ||
      releaseState.matches("Submitting") ||
      releaseState.matches("Submitting.Creating") ||
      releaseState.matches("Submitting.Updating") ||
      releaseState.matches("Deleting") ||
      productState.matches("Products Loading") ? (
        <>
          <div className="d-flex flex-column align-items-center justify-content-center h-50">
            <Loader
              open={
                summaryLoading ||
                loading ||
                !loaded ||
                releaseState.matches("Entry.Loading") ||
                releaseState.matches("Submitting") ||
                releaseState.matches("Submitting.Creating") ||
                releaseState.matches("Submitting.Updating") ||
                releaseState.matches("Deleting") ||
                productState.matches("Products Loading")
              }
            />
          </div>
        </>
      ) : (
        <>
          {" "}
          {releases.length ? (
            <>
              <div className="d-flex justify-content-between">
                <Typography variant="h6">Releases summary</Typography>
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleShow}
                >
                  New release
                </Button>
              </div>
              {releasesSummary ? (
                <div className="container-fluid charts-parent-container">
                  <div
                    className="row flex-nowrap justify-content-between"
                    style={{ height: "100%" }}
                  >
                    <div
                      className="chart-container"
                      style={{
                        width: "32%",
                      }}
                    >
                      <DoughnutChart
                        id="releases"
                        labels={pieChartLabels}
                        label="Releases summary"
                        data={releasesSummary?.releases}
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
                        labels={featuresReleaseNames}
                        data={releasesSummary?.features}
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
                      <BarChart
                        id="issues"
                        label="Issues summary"
                        labels={issuesReleaseNames}
                        data={releasesSummary?.issues}
                        backgroundColor={backgroundColor}
                        borderWidth={borderWidth}
                        borderColor={borderColor}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
              <div className="d-flex justify-content-between">
                <Typography variant="h6">Releases</Typography>
              </div>
              <TableContainer component={Paper} className="mt-2">
                <Table aria-label="collapsible table">
                  <TableHead
                    sx={{
                      "& .MuiTableCell-root": {
                        backgroundColor: "#EDEDED",
                      },
                    }}
                  >
                    <TableRow
                      sx={{
                        "& th": {
                          fontWeight: "500",
                        },
                      }}
                    >
                      <TableCell width="12" />
                      <TableCell width="33%">Name</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell align="center">Features</TableCell>
                      <TableCell align="center">Issues</TableCell>
                      <TableCell align="center">Release date</TableCell>
                      <TableCell align="right" />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {releases.length
                      ? releases.map((row: any) => (
                          <Row key={row.release_uuid} row={row} />
                        ))
                      : []}
                  </TableBody>
                </Table>
              </TableContainer>
              <div style={{ height: 100 }} />
            </>
          ) : (
            <>
              {" "}
              <div className="d-flex flex-column align-items-center justify-content-center h-50">
                <Typography variant="h6" className="text-center pb-2">
                  No releases to display for the current product. <br />
                  To get you started, create a release!
                </Typography>
                <Button
                  type="button"
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={handleShow}
                >
                  New release
                </Button>
              </div>
            </>
          )}
          <Modal
            show={showReleaseModal}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
            centered
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>New release</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {" "}
              <Form noValidate>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>Name*</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Name"
                    name="name"
                    required
                    onChange={(event) => updateFormData(event)}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="description">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="description"
                    onChange={(event) => updateFormData(event)}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="date">
                  <Form.Label>Release date*</Form.Label>
                  <Form.Control
                    size="sm"
                    type="date"
                    placeholder="Release date"
                    name="release_date"
                    required
                    onChange={(event) => updateFormData(event)}
                  />
                </Form.Group>
                <Form.Group
                  className="mb-3 releaseFeaturesAdd"
                  controlId="features"
                >
                  <Form.Label>Add Features</Form.Label>
                  <Autocomplete
                    multiple
                    id="features-multiple"
                    disableCloseOnSelect
                    filterSelectedOptions
                    options={_.orderBy(features, ["name"], ["asc"])}
                    getOptionLabel={(option) => option && option.name}
                    value={selectedFeatures}
                    onChange={(event, newValue) => {
                      if (_.size(newValue) > _.size(selectedFeatures)) {
                        setSelectedFeatures([
                          ...selectedFeatures,
                          _.last(newValue),
                        ]);
                      } else {
                        setSelectedFeatures(newValue);
                      }
                    }}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          icon={uncheckedIcon}
                          checkedIcon={checkedIcon}
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        {option.name}
                      </li>
                    )}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                type="button"
                variant="outlined"
                color="primary"
                size="small"
                onClick={handleClose}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="contained"
                color="primary"
                size="small"
                disabled={
                  !(
                    formData?.name?.trim().length > 0 &&
                    formData?.release_date?.length > 0 &&
                    selectedFeatures.length > 0
                  )
                }
                onClick={(event) => submitRelease(event)}
              >
                Save
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
      {/* <Chatbot /> */}
    </>
  );
}

const mapStateToProps = (state: any, ownProps: any) => ({
  ...ownProps,
  loading: state.releaseReducer.loading,
  loaded: state.releaseReducer.loaded,
  features: state.releaseReducer.features,
  issues: state.releaseReducer.issues,
});

export default connect(mapStateToProps)(ReleaseList);
