/* eslint-disable no-useless-escape */
import React, {useState, useEffect, useCallback} from "react";
import PropTypes from "prop-types";
import { 
  Box,
  Grid,
  Paper,
  Typography, 
  withWidth,
  isWidthUp, 
  withStyles, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  IconButton,
  Button,
  Zoom
} from "@material-ui/core";
import {useTheme} from '@material-ui/core/styles'
import Timeline from '@material-ui/lab/Timeline';
import TimelineItem from '@material-ui/lab/TimelineItem';
import TimelineSeparator from '@material-ui/lab/TimelineSeparator';
import TimelineConnector from '@material-ui/lab/TimelineConnector';
import TimelineContent from '@material-ui/lab/TimelineContent';
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent';
import TimelineDot from '@material-ui/lab/TimelineDot';
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Bordered from "../../../shared/components/Bordered";
import calculateSpacing from "./calculateSpacing";
import Axios from "axios";
import { AcUnit, Brightness3, Brightness5, CloudQueue, Dialpad, FilterDrama, Flare, FlashOn, Grain, InvertColors, NightsStay, RefreshOutlined, WbCloudy, WbSunny, } from "@material-ui/icons";
import assignIcon from "../../../shared/functions/assignIcon";
import NwsIcons from "../../../shared/components/NwsIcons"
//import "weather-icons";

const cheerio = require('cheerio')

const styles = theme => ({
    accordion: {
      backgroundColor: theme.palette.primary.dark,
      [theme.breakpoints.up("xs")]: {
        marginLeft: "auto",
        marginRight: "auto",
        maxWidth: 940
      }
    },
    cardWrapper: {
      [theme.breakpoints.up("xs")]: {
        marginLeft: "auto",
        marginRight: "auto",
        maxWidth: 940
      },
      backgroundColor: theme.palette.warning.dark,
      background: theme.palette.common.black,
    },
    containerFluid:{
      background: theme.palette.common.black,
      border: `1px solid ${theme.palette.primary.dark}`,
      borderRadius: theme.shape.borderRadius
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
      justifyContent: "center",
      backgroundColor: theme.palette.primary.dark,
    },
    paper: {
      padding: '6px 16px',
      backgroundColor: theme.palette.primary.dark,
      background: theme.palette.primary.dark,

    },
    secondaryTail: {
      backgroundColor: theme.palette.secondary.main,
    },
    text: {
      color: theme.palette.common.white
    },
    root: {
      maxWidth: 945,
    },
    media: {
      height: 0,
      paddingTop: '56.25%', // 16:9
    },
    expand: {
      transform: 'rotate(0deg)',
      marginLeft: 'auto',
      transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
      }),
    },
    expandOpen: {
      transform: 'rotate(180deg)',
    },
    weatherDotClearDay: {
      background: 'linear-gradient(30deg, #2196f3 30%, #21cbf3 90%)',
      borderColor: '#fff'
      // boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .30)',
    },
    weatherDotClearNight: {
      background: 'linear-gradient(30deg, #000 30%, #575757 90%)',
      borderColor: '#000'
      // boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .30)',
    },
    weatherDotCloudyDay: {
      background: 'linear-gradient(30deg, #555 30%, #ddd 90%)',
      borderColor: '#000'
      // boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .30)',
    },
});

const weatherIconMapping = {
  snow: <AcUnit />,
  sun: <Brightness5 />,
  sun2: <Flare />,
  sun3: <WbSunny />,
  clearNight: <Brightness3 />,
  cloudy: <CloudQueue />,
  cloudy2: <FilterDrama />,
  cloudy3: <WbCloudy />,
  rain: <InvertColors />,
  rain2: <Dialpad />,
  partlyCloudyNight: <NightsStay />,
}

const weatherLinks = {
  locations: 'https://forecast.weather.gov/product_sites.php?site=NWS&product=AFD',
  afd: (location) => `https://forecast.weather.gov/product.php?site=NWS&issuedby=${location}&product=AFD`,
  eol: 'https://forecast.weather.gov/product.php?site=NWS&issuedby=LWX&product=EOL&format=CI&version=1&glossary=1',
  rwr: 'https://forecast.weather.gov/product.php?site=NWS&product=RWR&issuedby=LWX',
  rwrG: 'https://forecast.weather.gov/product.php?site=NWS&issuedby=LWX&product=RWR&format=CI&version=1&glossary=1',
  sps: 'https://forecast.weather.gov/product.php?site=NWS&product=SPS&issuedby=LWX',
  zfp: 'https://forecast.weather.gov/product.php?site=NWS&product=ZFP&issuedby=LWX',
  radar_overlay: 'https://radar.weather.gov/ridge/RadarImg/N0R/LWX_N0R_0.gif',
  forecastJSON: 'https://api.weather.gov/gridpoints/LWX/97,70/forecast',
  forecastHourlyJSON: 'https://api.weather.gov/gridpoints/LWX/97,70/forecast/hourly',
  weatherAPI: 'https://www.weather.gov/documentation/services-web-api',
  productList: 'https://api.weather.gov/products?location=LWX',
  productTypes: 'https://api.weather.gov/products/locations/LWX/types'
}

const weatherProducts = {
  detailedForecast: {
    id: 'detailed-forecast',
    link: 'https://forecast.weather.gov/MapClick.php?lat=38.895&lon=-77.0373&lg=english&&FcstType=text&dd=1#.X9bh_9hKiUm',
    parsed: (cheerioObj) => `${cheerioObj}('detailed-forecast').text()`
  }
}

const regexTests = [
    {
        name: "Sections",
        test: new RegExp(/((\.[A-Z| |\/]+\.\.\.)+((.[^&&]|\n)*))/, 'gm'),
    },
    {
        name: "afdSynopsis",
        test: new RegExp(/^(\.[A-Z]+\.\.\.)/, 'mg'),
    },
    {
        name: "stationTest",
         test: new RegExp(/((\w|\n|\d| |\/)+(Area Forecast Discussion(\w|\.)+)?(\w|\n|\d| |\/)+)[^&&][A-Z]{2}$/, 'mg'),
    },
    {
        name: "locationTest",
        test: new RegExp(/^National Weather Service ([\w|\/| ]+)/, 'gm'),
    }
];

function WeatherTimeline(props) {
  const { data, classes, children, value, index, ...other} = props;
  return (
    <div>
      <Timeline>
        {data.map((element) => (
          <TimelineItem>
          <TimelineOppositeContent>
            <Typography variant="body2" className="text-white">
              {element.title}
            </Typography>
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot>
              <FlashOn />
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <Paper elevation={3} className={classes.paper}>
              <Typography variant="h6" component="h1">
              </Typography>
              <Accordion className={classes.accordion}>
                <AccordionSummary expandIcon={<ExpandMoreIcon color="primary"/>} >
                  <Typography className={classes.text} align="left">{element.sectionName}...</Typography>
                  </AccordionSummary>
                <Bordered disableVerticalPadding disableBorderRadius>
                  <AccordionDetails >
                      <Typography className="text-white" align="left">
                          {element.body}
                      </Typography>
                  </AccordionDetails>
                </Bordered>
              </Accordion>
            </Paper>
          </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
};

WeatherTimeline.propTypes = {
  data: PropTypes.any,
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
  classes: PropTypes.object
};

function WeatherAccordion(props) {
  const { data, classes, children, value, index, ...other} = props;
  return (
    <Box>
    {data.map((element, index) => (
      <Accordion className={"accordion"} key={index}>
          <AccordionSummary expandIcon={<ExpandMoreIcon color="primary"/>}>
              <Typography className="text-white" align="left">
                  {element.title}
              </Typography>
          </AccordionSummary>
          <Bordered disableVerticalPadding disableBorderRadius>
              <AccordionDetails>
                  <Typography className="text-white" align="left">
                      {element.body}
                  </Typography>
              </AccordionDetails>
          </Bordered>
      </Accordion>
    ))}
    </Box>
  );
};

WeatherAccordion.propTypes = {
  data: PropTypes.any,
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
  classes: PropTypes.object
};

function Weather(props) {
    const { classes, displayType, } = props;
    const theme = useTheme();
    const [accordionState, setAccordionState] = useState("Area Forecast Discussion");
    const [accordionBody, setAccordionBody] = useState("Click to view");
    const [dailyForecast, setDailyForecast] = useState({
      daily0: [],
      daily1: [],
      daily2: [],
      daily3: [],
      daily4: [],
      daily5: [],
      daily6: [],
      daily7: [],
      daily8: [],
      daily9: [],
      daily10: [],
      daily11: [],
      daily12: [],
      daily13: [],
    });

    const [appState, setAppState] = useState({
        loading: false,
        data: "",
        product: "Area Forecast Discussion",
        title: "",
        body: "",
        previewSy: "",
        previewN: "",
        previewSh: "",
        previewL: "",
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

    const fetchWeather = useCallback(() => {
        setAppState({loading: true});
        Axios.get(weatherLinks.forecastHourlyJSON)
          .then((data) => {
            console.log(data.data.properties.periods);
            const hourlyData = data.data.properties.periods;
            setAppState({hourly: hourlyData});
          });
          Axios.get(weatherLinks.forecastJSON)
          .then((data) => {
            //console.log(data.data.properties.periods);
            const dailyData = data.data.properties.periods;
            console.log(dailyData)
            var dailyTemp = [];
            dailyData.forEach((element, elementIndex) => {
              console.log(`Found daily element, index ${elementIndex}: ${element}`);
              dailyTemp[elementIndex] = element;
            })
            console.log(dailyTemp[0].startTime);
            setAppState({daily: dailyTemp});
          });

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
            var dateTest = new RegExp(/^\d{3,4} (A|P)M(.)*\d{4}$/, 'gm');
            var sectionsTest = new RegExp(/((\.[A-Z| |\/]+\.\.\.)+((.[^&&]|\n)*))/, 'gm');
            var nearTermTest = new RegExp(/((\.N[A-Z| |\/|\d]+\.\.\.)+((.[^&&]|\n)*))/, 'gm');
            var shortTermTest = new RegExp(/((\.SH[A-Z| |\/|\d]+\.\.\.)+((.[^&&]|\n)*))/, 'gm');
            var longTermTest = new RegExp(/((\.L[A-Z| |\/|\d]+\.\.\.)+((.[^&&]|\n)*))/, 'gm');
            var locationResult = locationTest.exec(afdText);
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

    const transitionDuration = {
      enter: theme.transitions.duration.enteringScreen,
      exit: theme.transitions.duration.leavingScreen,
    };

    const parseWeather = useCallback(() => {
        const titleResult = regexTests[0].test.exec(appState.data);
        if(titleResult)
        {
            setAccordionState(titleResult[2]);
            setAccordionBody([titleResult[3]])
        }
    }, [appState.data, setAccordionState, setAccordionBody]);

    useEffect(() => {
        setAppState({loading: true});

        Axios.get(weatherLinks.forecastJSON)
        .then((data) => {
          //console.log(data);
          const dailyData = data.data.properties.periods;
          //console.log(dailyData)
          var dailyTemp = [];
          dailyData.forEach((element, elementIndex) => {
            //console.log(`Found daily element, group ${elementIndex}: ${element.name}`);
            dailyTemp[elementIndex] = element;
            //setAppState({daily: element})
          })
          const dailyConst = dailyTemp;
          //console.log(dailyConst[0].icon)
          setDailyForecast({
            daily0: dailyConst[0],
            daily1: dailyConst[1],
            daily2: dailyConst[2],
            daily3: dailyConst[3],
            daily4: dailyConst[4],
            daily5: dailyConst[5],
            daily6: dailyConst[6],
            daily7: dailyConst[7],
            daily8: dailyConst[8],
            daily9: dailyConst[9],
            daily10: dailyConst[10],
            daily11: dailyConst[11],
            daily12: dailyConst[12],
            daily13: dailyConst[13],
          });
        });

        // Axios.get(weatherLinks.forecastHourlyJSON)
        // .then((data) => {
        //   //console.log(data);
        //   // const json = JSON.parse(data);
        //   const periods = Object.keys(data.data.properties.periods);
        //   const detailedForecast = [];
        //   const endTime= [];
        //   const icon= [];
        //   const isDaytime= [];
        //   const name= [];
        //   const number= [];
        //   const shortForecast= [];
        //   const startTime= [];
        //   const temperature= [];
        //   const temperatureTrend= [];
        //   const temperatureUnit= [];
        //   const windDirection= [];
        //   const windSpeed= [];
        //   //console.log(periods);
        //   const hourlyData = data.data.properties.periods;
        //   var tempHourly =[];
        //   for(var i=0; i< hourlyData.length; i++){
        //     var period = hourlyData[i];
        //     tempHourly.push(period);
        //     temperature.push(hourlyData[i].temperature);
        //     shortForecast.push(hourlyData[i].shortForecast);
        //     name.push(hourlyData[i].name);
        //     startTime.push(hourlyData[i].startTime);
        //     endTime.push(hourlyData[i].endTime);
        //     icon.push(hourlyData[i].icon);
        //     isDaytime.push(hourlyData[i].isDaytime);
        //     number.push(hourlyData[i].number);
        //     temperatureTrend.push(hourlyData[i].temperatureTrend);
        //     temperatureUnit.push(hourlyData[i].temperatureUnit);
        //     windDirection.push(hourlyData[i].windDirection);
        //     windSpeed.push(hourlyData[i].windSpeed);
        //   }
        //   console.log(tempHourly);
        //   setHourlyForecast({
        //     endTime: endTime, 
        //     icon:icon, 
        //     isDaytime:isDaytime, 
        //     number:number, 
        //     temperatureTrend:temperatureTrend,
        //     temperatureUnit:temperatureUnit,
        //     windDirection:windDirection,
        //     windSpeed:windSpeed, 
        //     name: name, 
        //     shortForecast: shortForecast, 
        //     startTime: startTime, 
        //     temperature: temperature});
        // });

        const afdUrl = 'https://forecast.weather.gov/product.php?site=NWS&issuedby=LWX&product=AFD';
        Axios.get(afdUrl)
          .then((data) => {
            const allData = cheerio.load(data.data);
            const afd = allData('pre.glossaryProduct')
            const afdText = afd.text();
            var afdSynopsis = /^(\.[A-Z]+\.\.\.)/mg;
            var stationTest = /((\w|\n|\d| |\/)+(Area Forecast Discussion(\w|\.)+)?(\w|\n|\d| |\/)+)[^&&][A-Z]{2}$/mg;
            var locationTest = new RegExp(/^National Weather Service ([\w|\/| ]+)/, 'gm'); //regexTests[3].test.exec(afdText);
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
            const synopP = synopB.slice(0,75)
            const nearTT = nearTermResult[2];
            const nearTB = nearTermResult[3];
            const nearP = nearTB.slice(0,75)
            const shortTT = shortTermResult[2];
            const shortTB = shortTermResult[3];
            const shortP = shortTB.slice(0,75)
            const longTT = longTermResult[2];
            const longTB = longTermResult[3];
            const longP = longTB.slice(0,75)
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
              longTermB: longTB,
              previewSy: synopP,
              previewN: nearP,
              previewSh: shortP,
              previewL: longP,
            });
          });
      }, [setDailyForecast, setAppState]);

    const sections = [
        {
          title: appState.date,
          body: appState.location,
          preview: "Date / Location",
          expanded: false,
          sectionName: "Date / Location"
        },
        {
          title: appState.synopsisT,
          body: appState.synopsisB,
          preview: appState.previewSy,
          expanded: false,
          sectionName: "Synopsis"
        },
        {
          title: appState.nearTermT,
          body: appState.nearTermB,
          preview: appState.previewN,
          expanded: false,
          sectionName: "Near Term"
        },
        {
          title: appState.shortTermT,
          body: appState.shortTermB,
          preview: appState.previewSh,
          expanded: false,
          sectionName: "Short Term"
        },
        {
          title: appState.longTermT,
          body: appState.longTermB,
          preview: appState.previewL,
          expanded: false,
          sectionName: "Long Term"
        }
      ];

    const fuckmylife = [
        {
          name: dailyForecast.daily0.name,
          startTime: dailyForecast.daily0.startTime,
          detailedForecast: dailyForecast.daily0.detailedForecast,
          endTime: dailyForecast.daily0.endTime,
          //icon: assignIcon(dailyForecast.daily0.shortForecast, dailyForecast.daily0.isDaytime).ico, dailyForecast.daily0.isDaytimen,
          icon: NwsIcons(dailyForecast.daily0.icon, dailyForecast.daily0.isDaytime),
          condition: assignIcon(dailyForecast.daily0.shortForecast, dailyForecast.daily0.isDaytime).iconName,
          isDaytime: dailyForecast.daily0.isDaytime,
          number: dailyForecast.daily0.number,
          shortForecast: dailyForecast.daily0.shortForecast,
          temperature: dailyForecast.daily0.temperature,
          temperatureTrend: dailyForecast.daily0.temperatureTrend,
          temperatureUnit: dailyForecast.daily0.temperatureUnit,
          windDirection: dailyForecast.daily0.windDirection,
          windSpeed: dailyForecast.daily0.windSpeed,
        },
        {
          name: dailyForecast.daily1.name,
          startTime: dailyForecast.daily1.startTime,
          detailedForecast: dailyForecast.daily1.detailedForecast,
          endTime: dailyForecast.daily1.endTime,
          //icon: assignIcon(dailyForecast.daily1.shortForecast, dailyForecast.daily1.isDaytime).ico, dailyForecast.daily1.isDaytimen,
          icon: NwsIcons(dailyForecast.daily1.icon, dailyForecast.daily1.isDaytime),
          condition: assignIcon(dailyForecast.daily1.shortForecast, dailyForecast.daily1.isDaytime).iconName,
          isDaytime: dailyForecast.daily1.isDaytime,
          number: dailyForecast.daily1.number,
          shortForecast: dailyForecast.daily1.shortForecast,
          temperature: dailyForecast.daily1.temperature,
          temperatureTrend: dailyForecast.daily1.temperatureTrend,
          temperatureUnit: dailyForecast.daily1.temperatureUnit,
          windDirection: dailyForecast.daily1.windDirection,
          windSpeed: dailyForecast.daily1.windSpeed
        },
        {
          name: dailyForecast.daily2.name,
          startTime: dailyForecast.daily2.startTime,
          detailedForecast: dailyForecast.daily2.detailedForecast,
          endTime: dailyForecast.daily2.endTime,
          icon: NwsIcons(dailyForecast.daily2.icon, dailyForecast.daily2.isDaytime),
          //icon: assignIcon(dailyForecast.daily2.shortForecast, dailyForecast.daily2.isDaytime).icon,
          condition: assignIcon(dailyForecast.daily2.shortForecast, dailyForecast.daily2.isDaytime).iconName,
          isDaytime: dailyForecast.daily2.isDaytime,
          number: dailyForecast.daily2.number,
          shortForecast: dailyForecast.daily2.shortForecast,
          temperature: dailyForecast.daily2.temperature,
          temperatureTrend: dailyForecast.daily2.temperatureTrend,
          temperatureUnit: dailyForecast.daily2.temperatureUnit,
          windDirection: dailyForecast.daily2.windDirection,
          windSpeed: dailyForecast.daily2.windSpeed
        },
        {
          name: dailyForecast.daily3.name,
          startTime: dailyForecast.daily3.startTime,
          detailedForecast: dailyForecast.daily3.detailedForecast,
          endTime: dailyForecast.daily3.endTime,
          icon: NwsIcons(dailyForecast.daily3.icon, dailyForecast.daily3.isDaytime),
          //icon: assignIcon(dailyForecast.daily3.shortForecast, dailyForecast.daily3.isDaytime).icon,
          condition: assignIcon(dailyForecast.daily3.shortForecast, dailyForecast.daily3.isDaytime).iconName,
          isDaytime: dailyForecast.daily3.isDaytime,
          number: dailyForecast.daily3.number,
          shortForecast: dailyForecast.daily3.shortForecast,
          temperature: dailyForecast.daily3.temperature,
          temperatureTrend: dailyForecast.daily3.temperatureTrend,
          temperatureUnit: dailyForecast.daily3.temperatureUnit,
          windDirection: dailyForecast.daily3.windDirection,
          windSpeed: dailyForecast.daily3.windSpeed
        },
        {
          name: dailyForecast.daily4.name,
          startTime: dailyForecast.daily4.startTime,
          detailedForecast: dailyForecast.daily4.detailedForecast,
          endTime: dailyForecast.daily4.endTime,
          icon: NwsIcons(dailyForecast.daily4.icon, dailyForecast.daily4.isDaytime),
          //icon: assignIcon(dailyForecast.daily4.shortForecast, dailyForecast.daily4.isDaytime).icon,
          condition: assignIcon(dailyForecast.daily4.shortForecast, dailyForecast.daily4.isDaytime).iconName,
          isDaytime: dailyForecast.daily4.isDaytime,
          number: dailyForecast.daily4.number,
          shortForecast: dailyForecast.daily4.shortForecast,
          temperature: dailyForecast.daily4.temperature,
          temperatureTrend: dailyForecast.daily4.temperatureTrend,
          temperatureUnit: dailyForecast.daily4.temperatureUnit,
          windDirection: dailyForecast.daily4.windDirection,
          windSpeed: dailyForecast.daily4.windSpeed
        },
        {
          name: dailyForecast.daily5.name,
          startTime: dailyForecast.daily5.startTime,
          detailedForecast: dailyForecast.daily5.detailedForecast,
          endTime: dailyForecast.daily5.endTime,
          icon: NwsIcons(dailyForecast.daily5.icon, dailyForecast.daily5.isDaytime),
          //icon: assignIcon(dailyForecast.daily5.shortForecast, dailyForecast.daily5.isDaytime).icon,
          condition: assignIcon(dailyForecast.daily5.shortForecast, dailyForecast.daily5.isDaytime).iconName,
          isDaytime: dailyForecast.daily5.isDaytime,
          number: dailyForecast.daily5.number,
          shortForecast: dailyForecast.daily5.shortForecast,
          temperature: dailyForecast.daily5.temperature,
          temperatureTrend: dailyForecast.daily5.temperatureTrend,
          temperatureUnit: dailyForecast.daily5.temperatureUnit,
          windDirection: dailyForecast.daily5.windDirection,
          windSpeed: dailyForecast.daily5.windSpeed
        },
        {
          name: dailyForecast.daily6.name,
          startTime: dailyForecast.daily6.startTime,
          detailedForecast: dailyForecast.daily6.detailedForecast,
          endTime: dailyForecast.daily6.endTime,
          icon: NwsIcons(dailyForecast.daily6.icon, dailyForecast.daily6.isDaytime),
          //icon: assignIcon(dailyForecast.daily6.shortForecast, dailyForecast.daily6.isDaytime).icon,
          condition: assignIcon(dailyForecast.daily6.shortForecast, dailyForecast.daily6.isDaytime).iconName,
          isDaytime: dailyForecast.daily6.isDaytime,
          number: dailyForecast.daily6.number,
          shortForecast: dailyForecast.daily6.shortForecast,
          temperature: dailyForecast.daily6.temperature,
          temperatureTrend: dailyForecast.daily6.temperatureTrend,
          temperatureUnit: dailyForecast.daily6.temperatureUnit,
          windDirection: dailyForecast.daily6.windDirection,
          windSpeed: dailyForecast.daily6.windSpeed
        },
        {
          name: dailyForecast.daily7.name,
          startTime: dailyForecast.daily7.startTime,
          detailedForecast: dailyForecast.daily7.detailedForecast,
          endTime: dailyForecast.daily7.endTime,
          icon: NwsIcons(dailyForecast.daily7.icon, dailyForecast.daily7.isDaytime),
          //icon: assignIcon(dailyForecast.daily7.shortForecast, dailyForecast.daily7.isDaytime).icon,
          condition: assignIcon(dailyForecast.daily7.shortForecast, dailyForecast.daily7.isDaytime).iconName,
          isDaytime: dailyForecast.daily7.isDaytime,
          number: dailyForecast.daily7.number,
          shortForecast: dailyForecast.daily7.shortForecast,
          temperature: dailyForecast.daily7.temperature,
          temperatureTrend: dailyForecast.daily7.temperatureTrend,
          temperatureUnit: dailyForecast.daily7.temperatureUnit,
          windDirection: dailyForecast.daily7.windDirection,
          windSpeed: dailyForecast.daily7.windSpeed
        },
        {
          name: dailyForecast.daily8.name,
          startTime: dailyForecast.daily8.startTime,
          detailedForecast: dailyForecast.daily8.detailedForecast,
          endTime: dailyForecast.daily8.endTime,
          icon: NwsIcons(dailyForecast.daily8.icon, dailyForecast.daily8.isDaytime),
          //icon: assignIcon(dailyForecast.daily8.shortForecast, dailyForecast.daily8.isDaytime).icon,
          condition: assignIcon(dailyForecast.daily8.shortForecast, dailyForecast.daily8.isDaytime).iconName,
          isDaytime: dailyForecast.daily8.isDaytime,
          number: dailyForecast.daily8.number,
          shortForecast: dailyForecast.daily8.shortForecast,
          temperature: dailyForecast.daily8.temperature,
          temperatureTrend: dailyForecast.daily8.temperatureTrend,
          temperatureUnit: dailyForecast.daily8.temperatureUnit,
          windDirection: dailyForecast.daily8.windDirection,
          windSpeed: dailyForecast.daily8.windSpeed
        },
        {
          name: dailyForecast.daily9.name,
          startTime: dailyForecast.daily9.startTime,
          detailedForecast: dailyForecast.daily9.detailedForecast,
          endTime: dailyForecast.daily9.endTime,
          icon: NwsIcons(dailyForecast.daily9.icon, dailyForecast.daily9.isDaytime),
          //icon: assignIcon(dailyForecast.daily9.shortForecast, dailyForecast.daily9.isDaytime).icon,
          condition: assignIcon(dailyForecast.daily9.shortForecast, dailyForecast.daily9.isDaytime).iconName,
          isDaytime: dailyForecast.daily9.isDaytime,
          number: dailyForecast.daily9.number,
          shortForecast: dailyForecast.daily9.shortForecast,
          temperature: dailyForecast.daily9.temperature,
          temperatureTrend: dailyForecast.daily9.temperatureTrend,
          temperatureUnit: dailyForecast.daily9.temperatureUnit,
          windDirection: dailyForecast.daily9.windDirection,
          windSpeed: dailyForecast.daily9.windSpeed
        },
        {
          name: dailyForecast.daily10.name,
          startTime: dailyForecast.daily10.startTime,
          detailedForecast: dailyForecast.daily10.detailedForecast,
          endTime: dailyForecast.daily10.endTime,
          icon: NwsIcons(dailyForecast.daily10.icon, dailyForecast.daily10.isDaytime),
          //icon: assignIcon(dailyForecast.daily10.shortForecast, dailyForecast.daily10.isDaytime).icon,
          condition: assignIcon(dailyForecast.daily10.shortForecast, dailyForecast.daily10.isDaytime).iconName,
          isDaytime: dailyForecast.daily10.isDaytime,
          number: dailyForecast.daily10.number,
          shortForecast: dailyForecast.daily10.shortForecast,
          temperature: dailyForecast.daily10.temperature,
          temperatureTrend: dailyForecast.daily10.temperatureTrend,
          temperatureUnit: dailyForecast.daily10.temperatureUnit,
          windDirection: dailyForecast.daily10.windDirection,
          windSpeed: dailyForecast.daily10.windSpeed
        },
        {
          name: dailyForecast.daily11.name,
          startTime: dailyForecast.daily11.startTime,
          detailedForecast: dailyForecast.daily11.detailedForecast,
          endTime: dailyForecast.daily11.endTime,
          icon: NwsIcons(dailyForecast.daily11.icon, dailyForecast.daily11.isDaytime),
          //icon: assignIcon(dailyForecast.daily11.shortForecast, dailyForecast.daily11.isDaytime).icon,
          condition: assignIcon(dailyForecast.daily11.shortForecast, dailyForecast.daily11.isDaytime).iconName,
          isDaytime: dailyForecast.daily11.isDaytime,
          number: dailyForecast.daily11.number,
          shortForecast: dailyForecast.daily11.shortForecast,
          temperature: dailyForecast.daily11.temperature,
          temperatureTrend: dailyForecast.daily11.temperatureTrend,
          temperatureUnit: dailyForecast.daily11.temperatureUnit,
          windDirection: dailyForecast.daily11.windDirection,
          windSpeed: dailyForecast.daily11.windSpeed
        },
        {
          name: dailyForecast.daily12.name,
          startTime: dailyForecast.daily12.startTime,
          detailedForecast: dailyForecast.daily12.detailedForecast,
          endTime: dailyForecast.daily12.endTime,
          icon: NwsIcons(dailyForecast.daily12.icon, dailyForecast.daily12.isDaytime),
          //icon: assignIcon(dailyForecast.daily12.shortForecast, dailyForecast.daily12.isDaytime).icon,
          condition: assignIcon(dailyForecast.daily12.shortForecast, dailyForecast.daily12.isDaytime).iconName,
          isDaytime: dailyForecast.daily12.isDaytime,
          number: dailyForecast.daily12.number,
          shortForecast: dailyForecast.daily12.shortForecast,
          temperature: dailyForecast.daily12.temperature,
          temperatureTrend: dailyForecast.daily12.temperatureTrend,
          temperatureUnit: dailyForecast.daily12.temperatureUnit,
          windDirection: dailyForecast.daily12.windDirection,
          windSpeed: dailyForecast.daily12.windSpeed
        },
        {
          name: dailyForecast.daily13.name,
          startTime: dailyForecast.daily13.startTime,
          detailedForecast: dailyForecast.daily13.detailedForecast,
          endTime: dailyForecast.daily13.endTime,
          icon: NwsIcons(dailyForecast.daily13.icon, dailyForecast.daily13.isDaytime),
          //icon: assignIcon(dailyForecast.daily12.shortForecast, dailyForecast.daily12.isDaytime).icon,
          condition: assignIcon(dailyForecast.daily12.shortForecast, dailyForecast.daily12.isDaytime).iconName,
          isDaytime: dailyForecast.daily13.isDaytime,
          number: dailyForecast.daily13.number,
          shortForecast: dailyForecast.daily13.shortForecast,
          temperature: dailyForecast.daily13.temperature,
          temperatureTrend: dailyForecast.daily13.temperatureTrend,
          temperatureUnit: dailyForecast.daily13.temperatureUnit,
          windDirection: dailyForecast.daily13.windDirection,
          windSpeed: dailyForecast.daily13.windSpeed
        },
      ];

    return (
      <section id="Weather">
      
        <div hidden={displayType !== "timeline"}>
          <Grid 
            item
            xs={12}
            sm={6}
            lg={3}
            className={classes.cardWrapper}
          >          
          <Box className={classes.containerFluid}>
            <Typography className="text-white">Area Forecast Discussion</Typography>
          </Box>
          <Timeline>
            {sections.map((element, index) => (
              <TimelineItem key={index}>
                <TimelineOppositeContent >
                  <Typography variant="body2" className="listItemLeftPadding text-white" 
                    data-aos="zoom-in-down" 
                    data-aos-delay={`${index}00`}
                  >
                    {element.title}
                  </Typography>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot>
                    {/* <FlashOn /> */}
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                    <Typography variant="h6" component="h1">
                    </Typography>
                    <Accordion className={classes.accordion}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon color="primary"/>} >
                        <Typography 
                          className={classes.text} 
                          align="left"
                          data-aos="zoom-in-up" 
                          data-aos-delay={index === 4 ? "500" : `${index}00`}
                        >
                            {element.sectionName}...</Typography>
                        </AccordionSummary>

                      {/* <Bordered > */}
                        <AccordionDetails >
                            <Typography className="text-white" align="left">
                                {element.body}
                            </Typography>
                        </AccordionDetails>
                      {/* </Bordered> */}

                    </Accordion>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
          </Grid>
        </div>
        <div hidden={displayType !== "accordion"}>
          <Grid 
            item
            xs={12}
            sm={6}
            lg={3}
            className={classes.cardWrapper}
          >
          {sections.map((element, index) => (
            <Accordion className={classes.accordion} key={index}>
                <AccordionSummary expandIcon={<ExpandMoreIcon color="primary"/>}>
                    <Typography align="left" className="listItemLeftPadding text-white" >
                        {element.title}
                    </Typography>
                </AccordionSummary>
                <Bordered disableVerticalPadding disableBorderRadius>
                    <AccordionDetails>
                        <Typography className="text-white" align="left">
                            {element.body}
                        </Typography>
                    </AccordionDetails>
                </Bordered>
            </Accordion>
          ))}
          </Grid>
        </div>
        <div hidden={displayType !== "button"}>
        <Grid>
          <Box display="flex" justifyContent="center" align="center" marginBottom="20px">
              <Button
              variant="contained"
              color="primary"
              size="large"
              align="center"
              onClick={parseWeather}
              >
                <Grid container direction="column">
                  <Grid item>
                  <Box className="box text-white" flexDirection="row">
                    {accordionState}
                  </Box>
                  </Grid>
                  <Grid item>
                  <Box margin="20px" textAlign="left">
                    <Typography className="text-white">
                      {accordionBody}
                    </Typography>
                  </Box>
                  </Grid>
                </Grid>
              </Button>
          </Box>
        </Grid>
        </div>
          <Grid 
            item
            xs={3}
            sm={2}
            lg={1}
            className={classes.cardWrapper}
          >
          <Box className={classes.containerFluid}>
            <Typography className="text-white">Daily Forecast</Typography>
          </Box>
          <Timeline>
            {fuckmylife.map((element, index) => (
              <TimelineItem key={index} data-aos="zoom-in-up">
                <TimelineOppositeContent>
                  <Typography variant="body2" className="listItemLeftPadding text-white">
                    {element.name} 
                  </Typography>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot className={element.condition === "dayCloudy" ? classes.weatherDotCloudyDay : element.condition === "dayRain" ? classes.weatherDotCloudyDay : element.condition === "daySnow" ? classes.weatherDotCloudyDay : element.isDaytime ? classes.weatherDotClearDay : classes.weatherDotClearNight}>
                  {/* <TimelineDot className={element.condition}> */}
                    {element.icon}
                    <img src={element.icon} alt=""/>
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Paper elevation={1} >
                    <Typography variant="h6" component="h1">
                    </Typography>
                    <Accordion className={classes.accordion}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon color="primary"/>} >
                        <Typography className={classes.text} align="left">{element.shortForecast}...</Typography>
                        </AccordionSummary>
                      {/* <Bordered disableVerticalPadding disableBorderRadius> */}
                        <AccordionDetails >
                            <Typography className="text-white" align="left">
                                {element.detailedForecast}
                            </Typography>
                        </AccordionDetails>
                      {/* </Bordered> */}
                    </Accordion>
                  </Paper>
                </TimelineContent>
              </TimelineItem>
              // </Zoom>
            ))}
          </Timeline>
          </Grid>
          <Box className={classes.AccordionDetails} display="flex" align="center">
            <IconButton
              color="secondary"
              align="center"
              className={classes.IconButton}
              onClick={() => {
                fetchWeather();
              }}
              aria-label="Refresh"
            >
              <RefreshOutlined />
              <i className="wi wi-day-sunny"></i>
            </IconButton>
          </Box>
      </section>
    );
}

Weather.propTypes = {
    classes: PropTypes.object
}


export default withStyles(styles, { withTheme: true })(
    withWidth()(Weather)
);
