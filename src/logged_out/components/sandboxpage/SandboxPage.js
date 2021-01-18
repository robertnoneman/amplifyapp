/* eslint-disable no-useless-escape */
import React, {useState, useEffect, Fragment, useRef} from "react";
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
import mapboxgl from 'mapbox-gl/dist/mapbox-gl'
// import WeatherCharts from "../real_data/WeatherCharts";

// const mapbox_key = ;
 //mapbox_key;

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
        maxWidth: 1280,
        paddingRight: theme.spacing(8),
        paddingLeft: theme.spacing(8),
      },
      [theme.breakpoints.up("xl")]: {
        maxWidth: 1800,
        paddingRight: theme.spacing(2),
        paddingLeft: theme.spacing(2),
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
    mapContainer: {
      // position: 'absolute',
      display: 'flex',
      width: "1132px",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      flexGrow: 1,
      flexBasis: 0,
      maxWidth: "100%",
      maxHeight: "100%"
      // paddingTop: 1200
    }
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
  const [map, setMap] = useState(null);
  const [active, setActive] = useState([]);
  const [lng, setLng] = useState(-77.26044311523435);
  const [lat, setLat] = useState(38.93598268628932);
  const [zoom, setZoom] = useState(1.5);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const mapContainerRef = useRef(null);

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
        const afdSynopsis = /^(\.[A-Z]+\.\.\.)/mg;
        const stationTest = /((\w|\n|\d| |\/)+(Area Forecast Discussion(\w|\.)+)?(\w|\n|\d| |\/)+)[^&&][A-Z]{2}$/mg;
        const locationTest = new RegExp(/^National Weather Service ([\w|\/| ]+)/, 'gm');
        const locationResult = locationTest.exec(afdText);
        const dateTest = new RegExp(/^\d{3,4} (A|P)M(.)*\d{4}$/, 'gm');
        const sectionsTest = new RegExp(/((\.[A-Z| |\/]+\.\.\.)+((.[^&&]|\n)*))/, 'gm');
        const nearTermTest = new RegExp(/((\.N[A-Z| |\/|\d]+\.\.\.)+((.[^&&]|\n)*))/, 'gm');
        const shortTermTest = new RegExp(/((\.SH[A-Z| |\/|\d]+\.\.\.)+((.[^&&]|\n)*))/, 'gm');
        const longTermTest = new RegExp(/((\.L[A-Z| |\/|\d]+\.\.\.)+((.[^&&]|\n)*))/, 'gm');
        const stationResult = stationTest.exec(afdText);
        const dateResult = dateTest.exec(afdText);
        const synopsisResult = afdSynopsis.exec(afdText);
        const sectionsResult = sectionsTest.exec(afdText);
        const nearTermResult = nearTermTest.exec(afdText);
        const shortTermResult = shortTermTest.exec(afdText);
        const longTermResult = longTermTest.exec(afdText);
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

  useEffect(() => {
    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;
    const myMap = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [lng, lat],
      zoom: 8.5
    })
    myMap.on('load', () => {
      myMap.addSource('bref_raw', {
        type: 'raster',
        tiles: [
          // 'https://opengeo.ncep.noaa.gov:443/geoserver/klwx/ows?service=WMS&bbox={bbox-epsg-3857}&format=image/png&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layer=klwx_bref_raw&style=radar_time'
          // 'https://opengeo.ncep.noaa.gov/geoserver/klwx/ows?service=wms&version=1.3.0&request=GetMap&width=256&height=256&layers=klwx_bvel&format=image%2Fpng&TRANSPARENT=true&TILED=true&&SRS=EPSG%3A3857&BBOX(geom,-77.86834716796875,38.49713091673101,-76.05560302734375,39.43778393700683,%27EPSG:4326%27)'
          "https://opengeo.ncep.noaa.gov:443/geoserver/klwx/ows?service=WMS&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&station=klwx&layer=bref_raw&style=radar_time",
        ],
        // tiles: 'https://opengeo.ncep.noaa.gov:443/geoserver/klwx/ows?SERVICE=WMS&request=GetMap&outputFormat=application%2Fjson&width=256&height=256&layers=klwx_bvel&format=image%2Fpng&TRANSPARENT=true&TILED=true&&SRS=EPSG%3A3857&BBOX=-8531595.349078232%2C4696291.017841229%2C-8453323.832114212%2C4774562.534805249',
        // url: 'https://mrms.ncep.noaa.gov/data/RIDGEII/L2/KLWX/BREF_RAW',
        // url: 'https://opengeo.ncep.noaa.gov:443/geoserver/styles/reflectivity.png',
        // scheme: "tms",
        tileSize: 256
      })
      myMap.addLayer(
        {
          id: 'local',
          type: 'raster',
          source: 'bref_raw',
          'paint': {}
        },
        'bref_raw'
      );
    })
      // setMap(myMap);})
      
    // return () => myMap.remove();
  }, []); 

  const DataLoading = withDataLoading(WeatherData);

  return (
    <Fragment>
      <div id='sandbox-top'>
        <div > 
          <div className={classes.containerWeather} > 
            <section id='SandboxPage'>
            </section>
            <AppBar position="fixed" color="inherit" style={ { marginTop: 50 }}>
              <Tabs
                value={value}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="secondary"
                variant="scrollable"
                aria-label="action tabs example"
                style={{flexGrow: 1,  }}>
                <Tab label="Charts" {...a11yProps(0)} 
                  // HEY ROB LOOK AT THIS!
                  // icon={<TimelineIcon />} 
                />
                <Tab label="Accordion" {...a11yProps(1)} />
                <Tab label="Button" {...a11yProps(2)} />
                <Tab label="Resizeable boxes" {...a11yProps(3)} />
                <Tab label="Timeline" {...a11yProps(4)} />
              </Tabs>
            </AppBar>
            {/* <SwipeableViews
              axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
              index={value}
              onChangeIndex={handleChangeIndex}
              style={ { marginTop: "100px" } }
            > */}
            <Grid container>
            <Grid item>
            
            <Box marginTop="100px">
            
              <TabPanel value={value} index={0} dir={theme.direction}>
                <HourlyForecast title={["Temp", "Humidity"]} height={350}/>
              </TabPanel>
              <TabPanel value={value} index={1} dir={theme.direction}>
                <Weather displayType="accordion"/>             
              </TabPanel>
              <TabPanel value={value} index={2} dir={theme.direction}>
                <DataLoading data={appState.data}/>
                <Weather displayType="button"/>
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
                <Weather displayType="timeline"/>
                {/* <HourlyForecast title={["temp", "humidity"]} height={300}/> */}
                <Box m={theme.spacing(0)}>
                </Box>
              </TabPanel>
            </Box>
            </Grid>
            <Grid item xs={12} className={classes.mapContainer}>
            <Box display="flex" xs={12} height="600px">
            <div ref={mapContainerRef} className={classes.mapContainer} />
            </Box>
            </Grid>
            </Grid>
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
