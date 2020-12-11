/* eslint-disable no-useless-escape */
import React, {useState, useEffect, useCallback} from "react";
import PropTypes from "prop-types";
import { 
  Box,
  Grid, 
  Typography, 
  withWidth, 
  withStyles, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  MenuItem, 
  List, 
  ListItem, 
  ListItemText, 
  FormControl,
  ListItemSecondaryAction,
  Select,
  OutlinedInput,
  IconButton} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Bordered from "../../../shared/components/Bordered";
// import calculateSpacing from "./calculateSpacing"
import classNames from "classnames";
//import theme from "../../../theme";
import Sandbox from "./Sandbox";
import Weather from "./Weather";
import WeatherData from "../../../shared/functions/getWeather";
import withDataLoading from "../../../shared/components/withDataLoading";
import Axios from "axios";
import { RefreshOutlined } from "@material-ui/icons";
import cheerio from "cheerio"

// const cheerio = require('cheerio')

const styles = theme => ({
  sandboxActive: {
    [theme.breakpoints.down("md")]: {
      marginLeft: "auto",
      marginRight: "auto",
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
      // maxWidth: 360,
      border: `3px solid ${theme.palette.primary.dark}`,
      borderRadius: theme.shape.borderRadius
    }
  },
  card: {
    boxShadow: theme.shadows[4],
    //border: `1px solid ${theme.palette.primary.dark}`,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("xs")]: {
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(3),
    },
    [theme.breakpoints.up("sm")]: {
      paddingTop: theme.spacing(5),
      paddingBottom: theme.spacing(5),
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
    },
    [theme.breakpoints.up("md")]: {
      paddingTop: theme.spacing(5.5),
      paddingBottom: theme.spacing(5.5),
      paddingLeft: theme.spacing(5),
      paddingRight: theme.spacing(5),
    },
    [theme.breakpoints.up("lg")]: {
      paddingTop: theme.spacing(6),
      paddingBottom: theme.spacing(6),
      paddingLeft: theme.spacing(6),
      paddingRight: theme.spacing(6),
    },
    [theme.breakpoints.down("md")]: {
      width: "auto",
    },
  },
  wrapper: {
    position: "relative",
    backgroundColor: theme.palette.warning.dark,
    marginTop: theme.spacing(6),
    paddingBottom: theme.spacing(2),
  },
  container: {
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(12),
    [theme.breakpoints.down("md")]: {
      marginBottom: theme.spacing(9),
    },
    [theme.breakpoints.down("sm")]: {
      marginBottom: theme.spacing(6),
    },
    [theme.breakpoints.down("sm")]: {
      marginBottom: theme.spacing(3),
    },
  },
  containerFix: {
    [theme.breakpoints.up("md")]: {
      maxWidth: "none !important",
    },
  },
  containerFluid:{
    background: theme.palette.common.black,
    border: `1px solid ${theme.palette.primary.dark}`,
    borderRadius: theme.shape.borderRadius
  },
  accordion: {
    backgroundColor: theme.palette.primary.dark,
  },
  numberInput: {
    width: 510,
  },
  numberInputInput: {
    padding: "9px 34px 9px 14.5px",
  },
  dBlock: { display: "block" },
  listItemLeftPadding: {
    paddingRight: theme.spacing(1),
  },
  AccordionDetails: {
    paddintTop: theme.spacing(0),
    justifyContent: "flex-start",
    backgroundColor: theme.palette.primary.dark
  },
});

function SandboxSection(props) {
  const { classes } = props;
  const DataLoading = withDataLoading(WeatherData);
  const [accordionState, setAccordionState] = useState("Area Forecast Discussion");
  const [accordionBody, setAccordionBody] = useState("Select a section");
  const [appState, setAppState] = useState({
    loading: false,
    data: "",
    product: "Area Forecast Discussion",
    title: "",
    body: "",
    station: "",
    date: "",
    location: "",
    synopsisT: "",
    synopsisB: "",
    nearTermT:"",
    nearTermB: "",
    shortTermT: "",
    shortTermB: "",
    longTermT: "",
    longTermB: "",
  });

  const handleChange = useCallback(
    (event) => {
      const {name, value} = event.target;
      // setSectionT(sectionT);
      if (name) {
        setAccordionState(value);
        setAccordionBody(name);
      }
    },
    [setAccordionState, setAccordionBody]
  );

  const fetchWeather = useCallback(() => {
    setAppState({loading: true});
    const afdUrl = 'https://forecast.weather.gov/product.php?site=NWS&issuedby=LWX&product=AFD';
    Axios.get(afdUrl)
      .then((data) => {
        const allData = cheerio.load(data.data);
        const afd = allData('pre.glossaryProduct')
        const afdText = afd.text();
        // console.log(afdText);
        var afdSynopsis = /^(\.[A-Z]+\.\.\.)/mg;
        var stationTest = /((\w|\n|\d| |\/)+(Area Forecast Discussion(\w|\.)+)?(\w|\n|\d| |\/)+)[^&&][A-Z]{2}$/mg;
        var locationTest = new RegExp(/^National Weather Service ([\w|\/| ]+)/, 'gm');
        var locationResult = locationTest.exec(afdText);
        console.log(locationResult);
        var dateTest = new RegExp(/^\d{3,4} (A|P)M(.)*\d{4}$/, 'gm');
        var sectionsTest = new RegExp(/((\.[A-Z| |\/]+\.\.\.)+((.[^&&]|\n)*))/, 'gm');
        var nearTermTest = new RegExp(/((\.N[A-Z| |\/|\d]+\.\.\.)+((.[^&&]|\n)*))/, 'gm');
        var shortTermTest = new RegExp(/((\.SH[A-Z| |\/|\d]+\.\.\.)+((.[^&&]|\n)*))/, 'gm');
        var longTermTest = new RegExp(/((\.L[A-Z| |\/|\d]+\.\.\.)+((.[^&&]|\n)*))/, 'gm');
        var stationResult = stationTest.exec(afdText);
        var dateResult = dateTest.exec(afdText);
        var synopsisResult = afdSynopsis.exec(afdText);
        var sectionsResult = sectionsTest.exec(afdText);
        var nearTermResult = nearTermTest.exec(afdText);
        console.log(nearTermResult);
        var shortTermResult = shortTermTest.exec(afdText);
        var longTermResult = longTermTest.exec(afdText);
        console.log(stationResult);
        const stat = stationResult[0];
        const location = locationResult[1];
        const product = stationResult[3];
        const date = dateResult[0];
        const synopT = synopsisResult[0];
        const synopB = sectionsResult[3];
        const nearTT = nearTermResult[2];
        const nearTB = nearTermResult[3];
        const shortTT = shortTermResult[2];
        const shortTB = shortTermResult[3];
        const longTT = longTermResult[2];
        const longTB = longTermResult[3];
        console.log(stat);
        console.log(synopsisResult);
        sectionsResult.forEach((match, groupIndex) => {
          console.log(`Found match, group ${groupIndex}: ${match}`);
        });
        setAppState({
          loading: false, 
          data: afdText,
          title: "",
          body: "", 
          station: stat,
          date: date,
          product: product,
          location: location, 
          synopsisT: synopT, 
          synopsisB: synopB, 
          nearTermT: nearTT,
          nearTermB: nearTB,
          shortTermT: shortTT,
          shortTermB: shortTB,
          longTermT: longTT,
          longTermB: longTB
        });
      });
  }, [setAppState]);

  const sections = [
    {
      title: appState.date,
      body: appState.location,
      sectionName: "Header"
    },
    {
      title: appState.synopsisT,
      body: appState.synopsisB,
      sectionName: "Synopsis"
    },
    {
      title: appState.nearTermT,
      body: appState.nearTermB,
      sectionName: "Near Term"
    },
    {
      title: appState.shortTermT,
      body: appState.shortTermB,
      sectionName: "Short Term"
    },
    {
      title: appState.longTermT,
      body: appState.longTermB,
      sectionName: "Long Term"
    }
  ];

  useEffect(() => {
    setAppState({loading: true});
    const afdUrl = 'https://forecast.weather.gov/product.php?site=NWS&issuedby=LWX&product=AFD';
    Axios.get(afdUrl)
      .then((data) => {
        const allData = cheerio.load(data.data);
        const afd = allData('pre.glossaryProduct')
        const afdText = afd.text();
        // console.log(afdText);
        var afdSynopsis = /^(\.[A-Z]+\.\.\.)/mg;
        var stationTest = /((\w|\n|\d| |\/)+(Area Forecast Discussion(\w|\.)+)?(\w|\n|\d| |\/)+)[^&&][A-Z]{2}$/mg;
        var locationTest = new RegExp(/^National Weather Service ([\w|\/| ]+)/, 'gm');
        var locationResult = locationTest.exec(afdText);
        console.log(locationResult);
        var dateTest = new RegExp(/^\d{3,4} (A|P)M(.)*\d{4}$/, 'gm');
        var sectionsTest = new RegExp(/((\.[A-Z| |\/]+\.\.\.)+((.[^&&]|\n)*))/, 'gm');
        var nearTermTest = new RegExp(/((\.N[A-Z| |\/|\d]+\.\.\.)+((.[^&&]|\n)*))/, 'gm');
        var shortTermTest = new RegExp(/((\.SH[A-Z| |\/|\d]+\.\.\.)+((.[^&&]|\n)*))/, 'gm');
        var longTermTest = new RegExp(/((\.L[A-Z| |\/|\d]+\.\.\.)+((.[^&&]|\n)*))/, 'gm');
        var stationResult = stationTest.exec(afdText);
        var dateResult = dateTest.exec(afdText);
        var synopsisResult = afdSynopsis.exec(afdText);
        var sectionsResult = sectionsTest.exec(afdText);
        var nearTermResult = nearTermTest.exec(afdText);
        console.log(nearTermResult);
        var shortTermResult = shortTermTest.exec(afdText);
        var longTermResult = longTermTest.exec(afdText);
        console.log(stationResult);
        const stat = stationResult[0];
        const location = locationResult[1];
        const product = stationResult[3];
        const date = dateResult[0];
        const synopT = synopsisResult[0];
        const synopB = sectionsResult[3];
        const nearTT = nearTermResult[2];
        const nearTB = nearTermResult[3];
        const shortTT = shortTermResult[2];
        const shortTB = shortTermResult[3];
        const longTT = longTermResult[2];
        const longTB = longTermResult[3];
        console.log(stat);
        console.log(synopsisResult);
        sectionsResult.forEach((match, groupIndex) => {
          console.log(`Found match, group ${groupIndex}: ${match}`);
        });
        setAppState({
          loading: false, 
          data: afdText, 
          station: stat,
          date: date,
          product: product,
          location: location, 
          synopsisT: synopT, 
          synopsisB: synopB, 
          nearTermT: nearTT,
          nearTermB: nearTB,
          shortTermT: shortTT,
          shortTermB: shortTB,
          longTermT: longTT,
          longTermB: longTB
        });
      });
  }, [setAppState]);

  return (
    <div id='sandbox-top'>
    <div className={classNames(classes.wrapper)}>
      <div className={classNames("container-fluid lg-mg-top")}>
        <section id='sandbox'>
          <Typography variant="h3" align="center" className="lg-mg-bottom text-white" id='sandbox'>
          Sandbox Section!
          </Typography>
        </section>

        <Weather>

        </Weather>
        <Grid 
          item
          className={classNames(classes.card, classes.containerFluid)}
        >
          <Box mb={4} justifyContent="center">
            <Sandbox
              title={appState.synopsisT}
              content={appState.synopsisB}
              highlighted={appState.loading}
            />
            <Sandbox
              title={appState.nearTermT}
              content={appState.nearTermB}
              highlighted={appState.loading}
           />
          </Box>
          <Box className={classes.containerFix}>
            <Sandbox
              highlighted
              title={appState.station}
              content={appState.date}
            />
          </Box>
          <Box className={classes.containerFix}>
            <DataLoading>

            </DataLoading>
          </Box>
        </Grid>
      </div>
    </div>
    </div>
  );
}

SandboxSection.propTypes = {
  width: PropTypes.string.isRequired,
  classes: PropTypes.object,
  theme: PropTypes.object,
  // pushMessageToSnackbar: PropTypes.func,
};

export default withStyles(styles, { withTheme: true })(
  withWidth()(SandboxSection)
);

/*
 <div>
          <Box align="center">
            <IconButton
              color="secondary"
              className={classes.IconButton}
              onClick={() => {
                fetchWeather();
              }}
              aria-label="Refresh"
            >
              <RefreshOutlined />
            </IconButton>
          </Box>
        </div>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>
              {appState.product}
              {appState.location}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
          <ListItem
            className={classes.numberInput}
            disableGutters
            divider
          >
            <ListItemText>
              <Typography>
                
              </Typography>
            </ListItemText>
            <FormControl variant="outlined">
              <ListItemSecondaryAction
              className={classes.ListItemSecondaryAction}
              >
                <Select
                  value={accordionState}
                  onChange={handleChange}
                  input={
                    <OutlinedInput
                    name={accordionState}
                    labelWidth={0}
                    className={classes.numberInput}
                    classes={{ input: classes.numberInputInput }}
                  />
                  }
                >
                  {sections.map((innerElement, index) => (
                    <MenuItem value={innerElement.body} key={innerElement.title}>
                    {innerElement.title}
                    </MenuItem>
                ))}
                </Select>
              </ListItemSecondaryAction>
            </FormControl>
          </ListItem>
          </AccordionDetails>
          <AccordionSummary>
            <Typography>
              {accordionState}
            </Typography>
          </AccordionSummary>
          </Accordion>
        <Accordion className={classes.AccordionDetails}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className="text-white">
              {appState.date}
              {"\n"}
              -
              {"\n"}
              {appState.station}
            </Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.dblock}>
            <List disablePadding>
              <Bordered disableVerticalPadding disableBorderRadius>
                {sections.map((element, index) => (
                <ListItem
                  className="listItemLeftPadding"
                  disableGutters
                  divider
                  key={index}
                >
                  <ListItemText>
                    <Typography variant="body2">{element.title}</Typography>
                  </ListItemText>
                  
                  <AccordionDetails>
                    <ListItemText>
                      <Typography className="text-white">
                        {element.body}
                      </Typography>
                    </ListItemText>
                  </AccordionDetails>
                </ListItem>
                ))}
              </Bordered>
            </List>
          </AccordionDetails>
          <AccordionDetails className={classes.AccordionDetails}>
            <Box display="flex" justifyContent="flex-end">
              <IconButton
                className={classes.IconButton}
                onClick={() => {
                  fetchWeather();
                }}
                aria-label="Refresh"
              >
                <RefreshOutlined />
              </IconButton>
            </Box>
          </AccordionDetails>
        </Accordion>
*/
