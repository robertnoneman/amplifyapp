/* eslint-disable no-useless-escape */
import React, {useState, useEffect, Fragment} from "react";
import PropTypes from "prop-types";
import { 
  AppBar,
  Box,
  Grid, 
  Typography, 
  withWidth, 
  withStyles,
  useTheme,
  Tab,
  Tabs, 
} from "@material-ui/core";
import classNames from "classnames";
import Sandbox from "../home/Sandbox";
import Weather from "../home/Weather";
//import calculateSpacing from "../home/calculateSpacing";
import WeatherData from "../../../shared/functions/getWeather";
import withDataLoading from "../../../shared/components/withDataLoading";
import Axios from "axios";
import cheerio from "cheerio"
import SwipeableViews from "react-swipeable-views";
import HourlyForecast from "../real_data/OpenWeatherData";
// import WeatherCharts from "../real_data/WeatherCharts";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`action-tabpanel-${index}`}
      aria-labelledby={`action-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={0}>{children}</Box>}
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

const styles = theme => ({
    sandboxActive: {
      [theme.breakpoints.down("md")]: {
        marginLeft: "auto",
        marginRight: "auto",
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(4),
        border: `3px solid ${theme.palette.primary.dark}`,
        borderRadius: theme.shape.borderRadius
      }
    },
    card: {
      boxShadow: theme.shadows[4],
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
      // backgroundColor: theme.palette.warning.dark,
      marginTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    },
    containerFix: {
      [theme.breakpoints.up("md")]: {
        maxWidth: "none !important",
      },
    },
    containerWeather: {
      width: "100%",
      paddingRight: theme.spacing(4),
      paddingLeft: theme.spacing(4),
      marginRight: "auto",
      marginLeft: "auto",
      [theme.breakpoints.up("xs")]: {
        maxWidth: 390,
        paddingRight: theme.spacing(0),
        paddingLeft: theme.spacing(0),
      },
      [theme.breakpoints.up("sm")]: {
        maxWidth: 840
      },
      [theme.breakpoints.up("md")]: {
        maxWidth: 940
      },
      [theme.breakpoints.up("lg")]: {
        maxWidth: 1280
      },
      [theme.breakpoints.up("xl")]: {
        maxWidth: 1920
      },
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

function a11yProps(index) {
  return {
    id: `action-tab-${index}`,
    'aria-controls': `action-tabpanel-${index}`,
  };
}
  
function SandboxPage(props) {
  const { classes, selectSandbox, } = props;
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  // const transitionDuration = {
  //   enter: theme.transitions.duration.enteringScreen,
  //   exit: theme.transitions.duration.leavingScreen,
  // };

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
    
  useEffect(() => {
    setAppState({loading: true});
    const afdUrl = 'https://forecast.weather.gov/product.php?site=NWS&issuedby=LWX&product=AFD';
    Axios.get(afdUrl)
      .then((data) => {
        const allData = cheerio.load(data.data);
        const afd = allData('pre.glossaryProduct')
        const afdText = afd.text();
        var afdSynopsis = /^(\.[A-Z]+\.\.\.)/mg;
        var stationTest = /((\w|\n|\d| |\/)+(Area Forecast Discussion(\w|\.)+)?(\w|\n|\d| |\/)+)[^&&][A-Z]{2}$/mg;
        var locationTest = new RegExp(/^National Weather Service ([\w|\/| ]+)/, 'gm');
        var locationResult = locationTest.exec(afdText);
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
        var shortTermResult = shortTermTest.exec(afdText);
        var longTermResult = longTermTest.exec(afdText);
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
        // sectionsResult.forEach((match, groupIndex) => {
        //   console.log(`Found match, group ${groupIndex}: ${match}`);
        // });
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
  
  useEffect(() => {
    selectSandbox();
  }, [selectSandbox]);

  const DataLoading = withDataLoading(WeatherData);

  return (
    <Fragment>
      <div id='sandbox-top'>
        <div > {/*className={classNames(classes.wrapper)}*/}
          <div className={classes.containerWeather} //{classNames("containerWeather")}
            > {/*className={classNames("container-fluid lg-mg-top")}*/}
            <section id='SandboxPage'>
              {/* <Typography variant="h3" align="center" className="lg-mg-bottom text-white" id='sandbox'>
                Weather Playground
              </Typography> */}
            </section>
            <AppBar position="fixed" color="inherit" style={ { marginTop: 50 }}>
              <Tabs
                value={value}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="secondary"
                variant="scrollable"
                aria-label="action tabs example"
                // centered={true}
                style={{flexGrow: 1,  }}
                // style={{flexGrow: 1, }}
                // orientation="vertical"
              >
                <Tab label="Weather timeline" {...a11yProps(0)} 
                  // HEY ROB LOOK AT THIS!
                  // icon={<TimelineIcon />} 
                />
                <Tab label="Weather accordion" {...a11yProps(1)} />
                <Tab label="Weather button" {...a11yProps(2)} />
                <Tab label="Weather resizeable boxes" {...a11yProps(3)} />
                <Tab label="Hourly charts" {...a11yProps(4)} />
              </Tabs>
            </AppBar>
            {/* <SwipeableViews
              axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
              index={value}
              onChangeIndex={handleChangeIndex}
              style={ { marginTop: "100px" } }
            > */}
            <Box marginTop="100px">
              <TabPanel value={value} index={0} dir={theme.direction}>
                <HourlyForecast title={["Temp", "Humidity"]} height="270px"/>
                <Weather displayType="timeline"/>
              </TabPanel>
              <TabPanel value={value} index={1} dir={theme.direction}>
                <Weather displayType="accordion"/>             
              </TabPanel>
              <TabPanel value={value} index={2} dir={theme.direction}>
                <Weather displayType="button"/>
                <DataLoading data={appState.data}/>
              </TabPanel>
              <TabPanel value={value} index={3} dir={theme.direction}>
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
                  </Box>
                </Grid>
              </TabPanel>
              <TabPanel value={value} index={4} dir={theme.direction}>
                
                  <HourlyForecast title={["temp", "humidity"]} height={300}/>
                
                <Box m={theme.spacing(0)}>
                  {/* <WeatherCharts /> */}
                  <DataLoading data={appState.data}/>
                </Box>
              </TabPanel>
            </Box>
            {/* </SwipeableViews> */}
          </div>
        </div>
      </div>
    </Fragment>
  );
}
  
SandboxPage.propTypes = {
  width: PropTypes.string.isRequired,
  classes: PropTypes.object,
  theme: PropTypes.object,
  selectSandbox: PropTypes.func.isRequired
  // pushMessageToSnackbar: PropTypes.func,
};
  
export default withStyles(styles, { withTheme: true })(
  withWidth()(SandboxPage)
);
