import React, {  
  useState, 
  useEffect, 
  useCallback, 
} from "react";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  Brush,
} from "recharts";
import { Box, Button, 
  withStyles, 
  Card, IconButton, Menu, MenuItem, Grid, withWidth, isWidthDown, } from "@material-ui/core";
import Axios from "axios";
import cheerio from "cheerio";
import format from "date-fns/format";
import NwsIcons from "../../../shared/components/NwsIcons"
//import WeatherCharts from "./WeatherCharts";
import MoreVert from "@material-ui/icons/MoreVert";
// import lineData from "../../test_data/nivoLineData.json"
// import testHourly from "../../test_data/testHourlyData.json"

const styles = (theme) => ({
  card: {
    backgroundColor: theme.palette.common.darkBlack,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    padding: theme.spacing(1),
    // marginTop: 10,
  },
  chartCard: {
    backgroundColor: theme.palette.common.black,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    padding: theme.spacing(1),
    resize: "both",
    minHeight: "150px",
    [theme.breakpoints.down('sm')]: {
      // backgroundColor: theme.palette.secondary.main,
      maxWidth: "100%",
      // height: "100px"
    },
    [theme.breakpoints.up('md')]: {
      backgroundColor:  theme.palette.common.darkBlack,
      maxWidth: "100%"
    },
    [theme.breakpoints.up('lg')]: {
      // backgroundColor: theme.palette.warning.main,
      maxWidth: "100%"
    },
    [theme.breakpoints.up('xl')]: {
      // backgroundColor: theme.palette.warning.main,
      maxWidth: "100%"
    },
  },
  windArrow: {
    transform: 'rotate(0deg)',
  },
  nivoContainer: {
    marginTop: "auto",
    width: "100%",
    height: "600px",
    background: theme.palette.common.darkBlack
  },
  scrollOnMobile: {
    overflow: "hidden",
    justifyContent: "center",
    flexDirection: "column",
    [theme.breakpoints.down('md')]: {
      // backgroundColor: theme.palette.secondary.main,
      maxWidth: "100%",
      overflow: "auto"
    },
  },
  chartContainer: {
    width: "auto"
  }
});

function getRgb(minimum, maximum, value) {
  if (value > minimum) {
    var ratio = 2 * (value-minimum) / (maximum - minimum);
    var b = Math.max(0, 255*(1 - ratio));
    var r = Math.max(0, 255*(ratio - 1));
    var g = 255 - b - r
    return `rgb(${r}, ${g}, ${b})`;
  }
  var newMin = value;
  var ratio2 = 2 * (value-newMin) / (maximum - newMin);
  var dif = (minimum - value) * 4;
  var b2 = Math.max(0, 255*(1 - ratio2));
  var r2 = (Math.max(0, 255*(ratio2 - 1)) + dif);
  var g2 = 255 - b2 - r2;
  return `rgb(${r2}, ${g2}, ${b2})`; 
}

// Returns hello.
// unix => "hello";

function formatTime(unix, offset) {
  const seconds = unix - offset;
  const secs = seconds * 1000;
  
  return format(new Date(secs), "MMM d hh:mm:ss");
}

function labelFormatter(label, timeScale) {
  if (label === null || label < 0 || label === -Infinity || label === Infinity) return;
  const tempLabel = label * 1000 * 1000;
  if (timeScale === "hours") return format(new Date(tempLabel), "h a");
  if (timeScale === "days") return format(new Date(tempLabel), "ccc");
  return format(new Date(tempLabel), "ccc p");
}

function CustomizedAxisTick(props) {
  const {x, y, payload, timeScale} = props;
  if (timeScale && Array.isArray(timeScale)) {
    return (
      timeScale.map((row, index) => (
        <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={8 + (index * 10)} textAnchor="middle" fill="#888" fontSize={10} transform="rotate(0)">{labelFormatter(payload.value, row)}</text>
        </g>
      ))
    );
  };
  if (timeScale) {
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={8} textAnchor="middle" fill="#888" fontSize={10} transform="rotate(0)">{labelFormatter(payload.value, timeScale)}</text>
      </g>
    );
  }
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={8} textAnchor="middle" fill="#888" fontSize={10} transform="rotate(0)">{labelFormatter(payload.value, "days")}</text>
      <text x={0} y={0} dy={18} textAnchor="middle" fill="#888" fontSize={10} transform="rotate(0)">{labelFormatter(payload.value, "hours")}</text> 
    </g>
  );
}

// function toCelsius(f) {
//   return (5 / 9) * (f - 32);
// }

// function setLocation(lat, lon) {
//   return { lat, lon };
// }

const myLocation = { lat: 38.889708, lon: -76.995119 };

const initialStateData = {
  data: [],
  dailyData: [],
  minutelyData: [],
  left: "dataMin",
  right: "dataMax",
  refAreaLeft: "",
  refAreaRight: "",
  top: "dataMax+5",
  bottom: "dataMin",
  top2: "dataMax+1",
  bottom2: "dataMin-1",
  animation: true,
  activeArea: "",
  activeColor: "#000",
  min: "",
  max: ""
};

const CustomizedDot = (props) => {
  const {
    cx, cy, stroke, payload, type, strokeColor, theme, 
  } = props;
  // if (!loaded) return;
  if (type) {
      return (
        <svg overflow="auto" stroke={strokeColor} x={cx} y={cy} width={100} height={100} viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
          <circle r="200" stroke={strokeColor} strokeWidth={20}/>
          <text fontSize="100px" fill="#dddddddd" textAnchor="middle" dy={40} dx={5}
            fontFamily={theme.typography.body1.fontFamily} fontWeight="fontWeightLight"
          >
            {payload[type]}"
          </text>
        </svg>
      );
  }

  return (
    <svg 
      fill={stroke} 
      viewBox="0 0 1024 1024"  
      x={ cx + 5 } 
      y={ cy - 0 } 
      width={600} height={600}
      overflow="visible"
    >
      <g>
        <path 
          overflow="visible" transform={`rotate(${payload.windDeg + 180})`} d="m12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z">
        </path>
      </g>
    </svg>
  );
}

const HeatmapDot = (props) => {
  const {
    cx, cy, payload, source, theme 
  } = props;
  // const value = useRef(null);
  const color = (source === "feelsLike" ? getRgb(20, 100, payload["feelsLike"]) : getRgb(20, 100, payload["temp"]) );
  return (
    <svg overflow="auto" stroke={color} x={cx} y={cy} width={100} height={100} viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <circle r="100" stroke={color} strokeWidth={20}/>
      <text fontSize="100px" fill="#dddddddd" textAnchor="middle" dy={40} dx={5}
        fontFamily={theme.typography.body1.fontFamily} fontWeight="fontWeightLight">
          {source === "feelsLike" ? payload["feelsLike"] : payload["temp"]}°
      </text>
    </svg>
  );
}

const itemHeight = 200;
const options = ["Dense", "Compact"];

function HourlyForecast(props) {
  const { title, classes, theme, height, width } = props;
  const [state, setState] = useState(initialStateData);
  const [loaded, setLoaded] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [hideArea, setHideArea] = useState({
    hidden: {
      temp: false,
      feelsLike: false,
      pressure: false,
      windSpeed: false,
      dewPoint: false
    }
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOption, setSelectedOption] = useState("Compact");
  const [isDragging, setIsDragging] = useState(false);

  const handleHiddenChange = (event) => {
    setHidden(event.target.checked);
  };

  const handleMenuClick = useCallback(
    (event) => {
      setAnchorEl(event.currentTarget);
    },
    [setAnchorEl]
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, [setAnchorEl]);

  const selectOption = useCallback(
    (selectedOption) => {
      setSelectedOption(selectedOption);
      handleClose();
    },
    [setSelectedOption, handleClose]
  );

  const handleBrushChange = useCallback(() => {
    setIsDragging(!isDragging);
  }, [isDragging, setIsDragging]);

  const getAxisYDomain = (data, from, to, ref, ref2, offset) => {
    const refData = Array.from(data);
    refData.slice(from - 1, to);
    let [bottom, top] = [refData[0][ref], refData[0][ref]];
    refData.forEach((d) => {
      if (d[ref] > top) top = d[ref];
      if (d[ref] < bottom) bottom = d[ref];
    });
    let [bottomRef2, topRef2] = [refData[0][ref2], refData[0][ref2]];
    refData.forEach((d2) => {
      if (d2[ref2] > topRef2) topRef2 = d2[ref2];
      if (d2[ref2] < bottomRef2) bottomRef2 = d2[ref2];
    });
  
    return [(bottom < bottomRef2 ? bottom : bottomRef2 | 0) - offset, (top > topRef2 ? top : topRef2 | 0) + offset];
  };

  const formatter = useCallback(
    (value, name) => {
      return [value, name, title];
    },
    [title]
  );

  const zoom = useCallback(() => {
    setIsDragging(false);
    let refAreaLeft = state.refAreaLeft;
    let refAreaRight = state.refAreaRight;
    let data = state.data;
    let activeArea = state.activeArea;
    let activeColor = state.activeColor;
    let min = state.min;
    let max = state.max;
    if (refAreaLeft === refAreaRight || refAreaRight === "") {
      setState({
        ...state,
        refAreaLeft: "",
        refAreaRight: "",
      })
      return;
    }
    // xAxis domain
    if (refAreaLeft > refAreaRight) [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];

    // yAxis domain
    const [bottom, top] = getAxisYDomain(
      state.data,
      refAreaLeft,
      refAreaRight,
      "windSpeed",
      "temp",
      0
    );
    const [bottom2, top2] = getAxisYDomain(
      data,
      refAreaLeft,
      refAreaRight,
      "pressure",
      "pressure",
      1
    );
    setState({
      ...state,
      refAreaLeft: "",
      refAreaRight: "",
      data: data.slice(),
      left: refAreaLeft,
      right: refAreaRight,
      bottom,
      top,
      bottom2,
      top2,
      activeArea,
      activeColor,
      min,
      max,
    })
  }, [setIsDragging, state, setState]);

  const zoomOut = useCallback(() => {
    const data = state.data;
    setState({
      ...state,
      data: data.slice(),
      refAreaLeft: "",
      refAreaRight: "",
      left: "dataMin",
      right: "dataMax",
      top: "dataMax+5",
      bottom: "dataMin",
      top2: "dataMax+1",
      bottom2: "dataMin-1",
    })
  }, [state, setState]);

  async function fetchAverageTemps() {
    if (loaded) return;
    const nwsDcanmeUrl = "https://www.weather.gov/lwx/dcanme";
    //const nmeResponse = cheerio.load(data.data)
    // #pagebody > div:nth-child(3) > div
    // const nmeSection = nmeResponse('#pagebody > div:nth-child(3) > div > pre:nth-child(9)');
    const weatherSparkUrl = `https://cors-anywhere.herokuapp.com/https://weatherspark.com/td/20957/Average-Weather-in-Washington-D.C.;-United-States-Today#Sections-Temperature`;
    await Axios.get(weatherSparkUrl).then((data) => {
      const response = cheerio.load(data.data);
      const tempSection = response('#Report-Content > div:nth-child(2) > p:nth-child(5)').text();
      const parseTemp = new RegExp(/(from (\d{1,2})...to.(\d{1,2})..*below.(\d*).*above (\d*))/, 'gm').exec(tempSection);
      // console.log(parseTemp);
      const averageLow = parseTemp[2];
      const averageHigh = parseTemp[3];
      const maxLow = parseTemp[4];
      const maxHigh = parseTemp[5];

      setState({
        ...state,
        averageLow: averageLow,
        averageHigh: averageHigh,
        maxLow: maxLow,
        maxHigh: maxHigh,
        // ...state,
      })
    })
  };

  async function fetchNwsData() {
    const nwsHourly = [];
    await Axios.get('https://api.weather.gov/gridpoints/LWX/97,70/forecast/hourly')
    .then((data) => {
      const hourlyData = data.data.properties.periods;
      //const hourlyDataText = Object.keys(hourlyData[0]);
      const hourDataTemp = [];
      const hourNum = [];
      const hourName = [];
      const hourstartTime = [];
      const hourendTime = [];
      const hourisDaytime = [];
      const hourtemperature = [];
      const hourtemperatureUnit = [];
      const hourtemperatureTrend = [];
      const hourwindSpeed = [];
      const hourwindDirection = [];
      const houricon = [];
      const hourshortForecast = [];
      const hourdetailedForecast = [];
      const hourtempChartData = [];
      for(let i=0; i< hourlyData.length; i++){
        hourNum.push(hourlyData[i].number)
        hourDataTemp.push(hourlyData[i].shortForecast);
        hourName.push(hourlyData[i].name)
        hourstartTime.push(hourlyData[i].startTime)
        //String DATE_FORMAT_PATTERN = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        hourendTime.push(hourlyData[i].endTime)
        hourisDaytime.push(hourlyData[i].isDaytime)
        hourtemperature.push(hourlyData[i].temperature)
        hourtemperatureUnit.push(hourlyData[i].temperatureUnit)
        hourtemperatureTrend.push(hourlyData[i].temperatureTrend)
        hourwindSpeed.push(hourlyData[i].windSpeed)
        hourwindDirection.push(hourlyData[i].windDirection)
        var tempIcon = NwsIcons(hourlyData[i].icon, hourlyData[i].isDaytime);
        houricon.push(tempIcon)
        hourshortForecast.push(hourlyData[i].shortForecast)
        hourdetailedForecast.push(hourlyData[i].detailedForecast)
        let seconds = Date.parse(hourlyData[i].startTime)
        //console.log(seconds)
        hourtempChartData.push({
          timestamp: seconds / 1000,
          time: seconds / 1000,
          offset: "",
          temp: hourlyData[i].temperature,
          humidity: "",
          pop: "",
          feelsLike: "",
          pressure: "",
          dewPoint: "",
          uvi: "",
          clouds: "",
          visibility: "",
          windSpeed: hourlyData[i].windSpeed,
          windDeg: hourlyData[i].windDirection,
          weather: {
            main: hourlyData[i].shortForecast,
            description: hourlyData[i].detailedForecast,
            icon: tempIcon
          },
        });
        nwsHourly.push(hourtempChartData[i]);
      }
    })
  }

  const fetchWeatherData = useCallback(() => {
    if (loaded) return;
    fetchAverageTemps();
    // const nwsHourly = [];
    // setLoaded(true);
    const API_KEY = process.env.REACT_APP_OPEN_WEATHER_MAP_API;
    const apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${myLocation.lat}&lon=${myLocation.lon}&units=imperial&appid=${API_KEY}`;
    Axios.get(apiUrl).then((data) => {
      const tOffset = data.data.timezone_offset;
      // console.log(tOffset);
      const minutely = data.data.minutely;
      const minutelyMerged = [];
      minutely && minutely.forEach((element, index) => {
        const timestamp = formatTime(element.dt, tOffset);
        const rawTimestamp = (element.dt) / 1000;
        minutelyMerged[index] = {
          // time: timestamp,
          time: rawTimestamp,
          precipitation: element.precipitation
        }
      });
      const daily = data.data.daily;
      const dailyMerged = []
      daily.forEach((element, index) => {
        const timestamp = formatTime(element.dt, tOffset);
        const rawTimestamp = (element.dt) / 1000;
        dailyMerged[index] = {
          // time: timestamp,
          time: rawTimestamp,
          element
        }
      });
      const hourly = data.data.hourly;
      const merged = [];
      const tempMinMax = [];
      hourly.forEach((element, index) => {
        const rawTimestamp = element.dt - tOffset;
        const timestamp = (element.dt) / 1000;
        tempMinMax.push(element.temp);
        merged[index] = {
          // time: timestamp,
          rawTimestamp: rawTimestamp,
          time: timestamp,
          offset: tOffset,
          temp: element.temp.toFixed(0),
          humidity: element.humidity,
          pop: (element.pop * 100),
          feelsLike: element.feels_like.toFixed(0),
          pressure: (element.pressure * 0.0295300).toFixed(2),
          dewPoint: element.dew_point.toFixed(0),
          uvi: element.uvi,
          clouds: element.clouds,
          visibility: element.visibility,
          windSpeed: element.wind_speed,
          windDeg: element.wind_deg,
          weather: element.weather,
          };
      });
      let refData = Array.from(merged);
      let ref = "temp";
      let [bottom, top] = [refData[0][ref], refData[0][ref]];
      refData.forEach((d) => {
        if (d[ref] > top) top = d[ref];
        if (d[ref] < bottom) bottom = d[ref];
      });
      let bottomColor = getRgb(20, 100, bottom);
      let topColor = getRgb(20, 100, top);
      let ref2 = "feelsLike";
      let [bottom2, top2] = [refData[0][ref2], refData[0][ref2]];
      refData.forEach((d) => {
        if (d[ref2] > top2) top2 = d[ref2];
        if (d[ref2] < bottom2) bottom2 = d[ref2];
      });
      let bottomColor2 = getRgb(20, 100, bottom2);
      let topColor2 = getRgb(20, 100, top2);
      setState({
        ...state, 
        data: merged.slice(), 
        dailyData: dailyMerged.slice(), 
        minutelyData: minutelyMerged.slice(), 
        allData: [minutelyMerged.slice(), merged.slice(), dailyMerged.slice()],
        min: bottomColor,
        max: topColor,
        feelsLikeMin: bottomColor2,
        feelsLikeMax: topColor2
      });
      setLoaded(true);
    });

  }, [fetchAverageTemps, loaded, setLoaded]);

  const handleMouseEnter = (o) => {
    setState( {
      ...state,
      activeArea: o.dataKey,
      activeColor: o.color
    })
  }
  
  const handleMouseLeave = (o) => {
    setState( {
      ...state,
      activeArea: "",
      activeColor: "#00000033"
    })
  }
  
  const handleClick = (o) => {
    const { dataKey } = o;
    var toggle = hideArea.hidden[dataKey];
    setHideArea( {
      hidden: {...hideArea.hidden, [dataKey]: !toggle}
    })
  };

  useEffect(() => {
    // fetchNwsData();
    fetchWeatherData();
  }, [fetchWeatherData]);

  const isOpen = Boolean(anchorEl);

  return (
    <>
    <Grid>
      <Grid item xs={12} xl={12} style={selectedOption === "Compact" ? { margin: "10px" } : {margin: "auto", }}>
        <Card className={classes.card}>
          <Box display="flex" justifyContent="space-between">
            <Button className="btn update" onClick={zoomOut}>
              Zoom Out
            </Button>
            <div>
              <IconButton
                aria-label="More"
                aria-owns={isOpen ? "long-menu" : undefined}
                aria-haspopup="true"
                onClick={handleMenuClick}
              >
                <MoreVert className="text-white"/>
              </IconButton>
              <Menu
                id="long-menu"
                anchorEl={anchorEl}
                open={isOpen}
                onClose={handleClose}
                PaperProps={{
                  style: {
                    maxHeight: itemHeight,
                    width: 200,
                    backgroundColor: theme.palette.secondary.dark
                  },
                }}
                disableScrollLock
              >
                {options.map((option) => (
                  <MenuItem
                    key={option}
                    selected={option === selectedOption}
                    className="text-white"
                    onClick={() => {
                      selectOption(option);
                    }}
                    name={option}
                  >
                    {option}
                  </MenuItem>
                ))}
              </Menu>
            </div>
          </Box>
          <Box height={isWidthDown('md', width) ? 200 : selectedOption === "Compact" ? 400 : height} 
            width="100%" display="flex" style={{userSelect: "none"}} onDoubleClick={zoomOut}
            overflow="hidden"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                margin={selectedOption === "Compact" ? {bottom: 10, top: 20, right: 0, left: -20 } : {bottom: 10, top: 20, right: 0, left: -30 }}
                data={state.data}
                onMouseDown={(e) =>
                  e && e.activeLabel && setState({
                    ...state,
                    refAreaLeft: e.activeLabel,
                    })
                }
                onMouseMove={(e) =>
                  state.refAreaLeft && e.activeLabel &&
                  setState({
                    ...state,
                    refAreaRight: e.activeLabel,
                  })
                }
                onMouseUp={zoom}
                syncId="captain"
              >
                <defs>
                  <linearGradient id="heatmapUv" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgb(255, 0, 0)" stopOpacity={0.95}/>
                    <stop offset="100%" stopColor="#ff00ff" stopOpacity={0.5}/>
                  </linearGradient>
                  <linearGradient id="inactiveHeatmapUv" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={state.max} stopOpacity={0.3}/>
                    <stop offset="100%" stopColor={state.min} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="activeHeatmapUv" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={state.max} stopOpacity={0.95}/>
                    <stop offset="100%" stopColor={state.min} stopOpacity={0.5}/>
                  </linearGradient>
                  <linearGradient id="feelsLikeUv" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={state.feelsLikeMax} stopOpacity={0.95}/>
                    <stop offset="100%" stopColor={state.feelsLikeMin} stopOpacity={0.5}/>
                  </linearGradient>
                  <linearGradient id="inactiveFeelsLikeUv" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={state.feelsLikeMax} stopOpacity={0.3}/>
                    <stop offset="100%" stopColor={state.feelsLikeMin} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="monoActiveUv" x1="0" y1="-0.1" x2="0" y2="1">
                    <stop offset="0%" stopColor={state.activeColor} stopOpacity={0.95}/>
                    <stop offset="100%" stopColor={state.activeColor} stopOpacity={0.5}/>
                  </linearGradient>
                  <linearGradient id="monoUv" x1="0" y1="-0.1" x2="0" y2="1">
                    <stop offset="0%" stopColor="#000" stopOpacity={0.25}/>
                    <stop offset="100%" stopColor="#000" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="averageTempsUv" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={getRgb(20, 100, state.averageHigh)} stopOpacity={0.3}/>
                    <stop offset="100%" stopColor={getRgb(20, 100, state.averageLow)} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} horizontal={false} />
                <ReferenceArea y1={state.averageLow} y2={state.averageHigh} yAxisId="1" 
                  fill="url(#averageTempsUv)" stroke="url(#averageTempsUv)" strokeWidth={2}
                  // label={state.averageHigh}
                />
                <XAxis
                  allowDataOverflow
                  dataKey="time"
                  domain={[state.left, state.right]}
                  type="number"
                  tick={<CustomizedAxisTick/>}
                  tickFormatter={labelFormatter}
                  isCategorial={false}
                  minTickGap={0}
                  tickCount={10}
                  interval={3}
                  scale="time"
                  hide={selectedOption === "Compact" ? true : false}
                />
                <YAxis
                  allowDataOverflow
                  domain={[state.bottom, state.top]}
                  type="number"
                  yAxisId="1"
                  scale="linear"
                  unit="°"
                  allowDecimals={false}
                  tick={selectedOption === "Compact" ? false : { fontSize: 10 }}
                  hide={selectedOption === "Compact" ? true : false}
                />
                <Tooltip
                  labelFormatter={labelFormatter}
                  formatter={formatter}
                  allowEscapeViewBox={{ x: false, y: false }}
                  cursor={true}
                  offset={15}
                  contentStyle={{
                    border: "1px",
                    padding: theme.spacing(1),
                    borderRadius: theme.shape.borderRadius,
                    boxShadow: theme.shadows[1],
                    backgroundColor: "#000000000" //theme.palette.secondary.dark
                  }}
                  labelStyle={{ 
                    fontSize: 12,
                    fontWeight: "fontWeightLight",
                    color: "white"
                     }}
                  itemStyle={{
                    fontSize: 12,
                    letterSpacing: theme.typography.body1.letterSpacing,
                    fontFamily: theme.typography.body1.fontFamily,
                    lineHeight: theme.typography.body1.lineHeight,
                    fontWeight: "fontWeightLight", //theme.typography.body1.fontWeight,
                    textAlign: "left",
                    color: "white",
                    display: "none"
                  }}
                />
                <Legend 
                  align="center"
                  verticalAlign="top"
                  wrapperStyle={ {top: 5,  right: 0, fontSize: 12 }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={handleClick}
                />
                <Area
                  yAxisId="1"
                  type="natural"
                  dataKey="temp"
                  unit="°"
                  activeDot={ <HeatmapDot theme={theme} source="temp" /> }
                  animationDuration={1200}
                  onMouseEnter={() =>
                    setState({
                      ...state,
                      activeArea: "temp",
                    })
                  }
                  onMouseOut={() =>
                    setState({
                      ...state,
                      activeArea: "",
                      activeColor: "#0000000"
                    })
                  }
                  strokeWidth={state.activeArea === "temp" ? 2 : 1 }
                  stroke="url(#activeHeatmapUv)"
                  fill={state.activeArea === "temp" ? "url(#activeHeatmapUv)" : "url(#inactiveHeatmapUv)"}
                  hide={hideArea.hidden.temp}
                />
                <Area
                  yAxisId="1"
                  type="natural"
                  dataKey="feelsLike"
                  unit="°"
                  activeDot={ <HeatmapDot theme={theme} source="feelsLike" />} 
                  animationDuration={1200}
                  onMouseEnter={() =>
                    setState({
                      ...state,
                      activeArea: "feelsLike",
                    })
                  }
                  onMouseOut={() =>
                    setState({
                      ...state,
                      activeArea: "",
                      activeColor: "#0000000"
                    })
                  }
                  strokeWidth={state.activeArea === "feelsLike" ? 2 : 1 }
                  stroke="url(#feelsLikeUv)"
                  fill={state.activeArea === "feelsLike" ? "url(#feelsLikeUv)" : "url(#inactiveFeelsLikeUv)"}
                  hide={hideArea.hidden.feelsLike}
                />
                {state.refAreaLeft && state.refAreaRight ? (
                  <ReferenceArea
                    yAxisId="1"
                    x1={state.refAreaLeft}
                    x2={state.refAreaRight}
                    strokeOpacity={0.3}
                  />
                ) : null}
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </Grid>
    </Grid>

    <Grid >
      <Grid item xs={12} style={selectedOption === "Compact" ? { margin: "10px", } : {margin: "auto", }}>
        <Card className={classes.chartCard} style={{  }} >
          <Box height={isWidthDown('md', width) ? 200 : selectedOption === "Compact" ? 400 : height} 
            width="100%"  style={{userSelect: "none",}} onDoubleClick={zoomOut}
            overflow="hidden" //{selectedOption === "Compact" ? "hidden": "auto"}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                margin={selectedOption === "Compact" ? {bottom: 10, top: -20, right: 0, left: 0 } : {bottom: 0, top: 0, right: -25, left: -30 }}
                data={state.data}
                onMouseDown={(e) =>
                  e && e.activeLabel && setState({
                    ...state,
                    refAreaLeft: e.activeLabel,
                    })
                }
                onMouseMove={(e) =>
                  state.refAreaLeft && e.activeLabel &&
                  setState({
                    ...state,
                    refAreaRight: e.activeLabel,
                  })
                }
                onMouseUp={zoom}
                syncId="pressure"
              >
                <defs>
                      <linearGradient id="colorUv" x1="0" y1="-0.1" x2="0" y2="1">
                        <stop offset="1%" stopColor="rgb(255, 0, 0)" stopOpacity={0.25}/>
                        <stop offset="25%" stopColor="#00ff00" stopOpacity={0.2}/>
                        <stop offset="50%" stopColor="#0000ff" stopOpacity={0.1}/>
                        <stop offset="85%" stopColor="#ff00ff" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="activeColorUv" x1="0" y1="-0.1" x2="0" y2="1">
                        <stop offset="1%" stopColor="rgb(255, 0, 0)" stopOpacity={0.9}/>
                        <stop offset="25%" stopColor="#00ff00" stopOpacity={0.95}/>
                        <stop offset="50%" stopColor="#0000ff" stopOpacity={0.7}/>
                        <stop offset="85%" stopColor="#ff00ff" stopOpacity={0.5}/>
                      </linearGradient>
                      <linearGradient id="heatmapUv" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="rgb(255, 0, 0)" stopOpacity={0.95}/>
                        <stop offset="100%" stopColor="#ff00ff" stopOpacity={0.5}/>
                      </linearGradient>
                      <linearGradient id="inactiveHeatmapUv" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={state.max} stopOpacity={0.025}/>
                        <stop offset="100%" stopColor={state.min} stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="activeHeatmapUv" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={state.max} stopOpacity={0.95}/>
                        <stop offset="100%" stopColor={state.min} stopOpacity={0.5}/>
                      </linearGradient>
                      <linearGradient id="monoActiveUv" x1="0" y1="-0.1" x2="0" y2="1">
                        <stop offset="0%" stopColor={state.activeColor} stopOpacity={0.95}/>
                        <stop offset="100%" stopColor={state.activeColor} stopOpacity={0.5}/>
                      </linearGradient>
                      <linearGradient id="monoUv" x1="0" y1="-0.1" x2="0" y2="1">
                        <stop offset="0%" stopColor="#000" stopOpacity={0.25}/>
                        <stop offset="100%" stopColor="#000" stopOpacity={0.1}/>
                      </linearGradient>
                      
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} horizontal={false}/>
                <XAxis
                  allowDataOverflow
                  dataKey="time"
                  domain={[state.left, state.right]}
                  type="number"
                  tick={<CustomizedAxisTick timeScale="hours"/>}
                  tickFormatter={labelFormatter}
                  isCategorial={false}
                  minTickGap={0}
                  tickCount={10}
                  interval={selectedOption === "Compact" ? 0 : 6}
                  scale="time"
                  hide={selectedOption === "Compact" ? true : false}
                />
                <YAxis
                  allowDataOverflow
                  domain={[state.bottom, state.top]}
                  type="number"
                  yAxisId="1"
                  scale="linear"
                  allowDecimals={false}
                  tick={selectedOption === "Compact" ? false : { fontSize: 10 }}
                  hide={selectedOption === "Compact" ? true : false}
                />
                <YAxis
                  orientation="right"
                  allowDataOverflow
                  domain={[state.bottom2, state.top2]}
                  type="number"
                  yAxisId="2"
                  scale="linear"
                  unit='"'
                  allowDecimals={false}
                  tick={selectedOption === "Compact" ? false : { fontSize: 10 }}
                  hide={selectedOption === "Compact" ? true: hideArea.hidden.pressure ? true : false}
                />
                
                {/* <Tooltip /> */}
                <Tooltip
                  labelFormatter={labelFormatter}
                  formatter={formatter}
                  allowEscapeViewBox={{ x: false, y: false }}
                  cursor={true}
                  offset={15}
                  contentStyle={{
                    border: "1px",
                    padding: theme.spacing(1),
                    borderRadius: theme.shape.borderRadius,
                    boxShadow: theme.shadows[1],
                    backgroundColor: "#000000000", //theme.palette.secondary.dark
                    
                  }}
                  labelStyle={{ 
                    fontSize: 12,
                    fontWeight: "fontWeightLight",
                    color: "white"
                     }}
                  itemStyle={{
                    fontSize: theme.typography.body1.fontSize,
                    letterSpacing: theme.typography.body1.letterSpacing,
                    fontFamily: theme.typography.body1.fontFamily,
                    lineHeight: theme.typography.body1.lineHeight,
                    fontWeight: "fontWeightLight", //theme.typography.body1.fontWeight,
                    textAlign: "left",
                    color: "white",
                    display: "none"
                  }}
                  wrapperStyle={{
                    alignItems: "flex-end",
                    resize: "both",

                  }}
                />
                <Legend 
                  // layout="vertical"
                  align="center"
                  // verticalAlign="middle"
                  verticalAlign="top"
                  wrapperStyle={ {top: 15,  right: 0, fontSize: 12 }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={handleClick}
                />
                <Area
                  yAxisId="2"
                  type="natural"
                  dataKey="pressure"
                  unit="inHg"
                  color="#ecc79d"
                  activeDot={<CustomizedDot type="pressure" strokeColor="#ecc79d" theme={theme}/>} //{{ fill: `#ecc79d`, r: 2}}
                  animationDuration={1200}
                  onMouseEnter={() =>
                    setState({
                      ...state,
                      activeArea: "pressure",
                      activeColor: "#ecc79d"
                    })
                  }
                  onMouseOut={() =>
                    setState({
                      ...state,
                      activeArea: "",
                      activeColor: "#dddddd333"
                    })
                  }
                  stroke={state.activeArea === "pressure" ? "url(#monoActiveUv)" : "#ecc79d"}
                  fill={state.activeArea === "pressure" ? "url(#monoActiveUv)" : "url(#monoUv)"}
                  hide={hideArea.hidden.pressure}
                />
                <Area
                  yAxisId="1"
                  type="natural"
                  dataKey="windSpeed"
                  unit="mph"
                  strokeWidth={1}
                  dot={<CustomizedDot stroke="#48a4ea" r={0} loaded={loaded}/>}
                  onMouseEnter={() =>
                    setState({
                      ...state,
                      activeArea: "windSpeed",
                      activeColor: "#e0e0e1"
                    })
                  }
                  onMouseOut={() =>
                    setState({
                      ...state,
                      activeArea: "",
                      activeColor: "#0000000",
                    })
                  }
                  stroke={state.activeArea === "windSpeed" ? "url(#monoActiveUv)" : "#e0e0e178"}
                  fill={state.activeArea === "windSpeed" ? "url(#monoActiveUv)" : "url(#monoUv)"}
                  animationDuration={1200}
                  hide={hideArea.hidden.windSpeed}
                />
                  {state.refAreaLeft && state.refAreaRight ? (
                    <ReferenceArea
                      yAxisId="1"
                      x1={state.refAreaLeft}
                      x2={state.refAreaRight}
                      strokeOpacity={0.3}
                    />
                  ) : null}
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </Grid>
    </Grid>
    <Box height={height} width="100%" display="flex"
      style={{ backgroundColor: theme.palette.common.black, 
      userSelect: "none"
      }}
      onDoubleClick={zoomOut}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          margin={{ bottom: 20, top: 20, left: -20, right: -55 }}
          data={state.data}
          onMouseDown={(e) =>
            e && e.activeLabel && setState({
              ...state,
              refAreaLeft: e.activeLabel,
            })
          }
          onMouseMove={(e) =>
            state.refAreaLeft && e.activeLabel &&
            (
              // setIsDragging(true),
              setState({
              ...state,
              refAreaRight: e.activeLabel,
              })
            )   
          }
          // onMouseUp={zoom}
          syncId="brush"
        >
        <defs>
            <linearGradient id="colorUv" x1="0" y1="-0.1" x2="0" y2="1">
              <stop offset="1%" stopColor="rgb(255, 0, 0)" stopOpacity={0.25}/>
              <stop offset="25%" stopColor="#00ff00" stopOpacity={0.2}/>
              <stop offset="50%" stopColor="#0000ff" stopOpacity={0.1}/>
              <stop offset="85%" stopColor="#ff00ff" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="activeColorUv" x1="0" y1="-0.1" x2="0" y2="1">
              <stop offset="1%" stopColor="rgb(255, 0, 0)" stopOpacity={0.9}/>
              <stop offset="25%" stopColor="#00ff00" stopOpacity={0.95}/>
              <stop offset="50%" stopColor="#0000ff" stopOpacity={0.7}/>
              <stop offset="85%" stopColor="#ff00ff" stopOpacity={0.5}/>
            </linearGradient>
            <linearGradient id="monoActiveUv" x1="0" y1="-0.1" x2="0" y2="1">
              <stop offset="0%" stopColor={state.activeColor} stopOpacity={0.95}/>
              <stop offset="100%" stopColor={state.activeColor} stopOpacity={0.5}/>
            </linearGradient>
            <linearGradient id="monoUv" x1="0" y1="-0.1" x2="0" y2="1">
              <stop offset="0%" stopColor="#000" stopOpacity={0.25}/>
              <stop offset="100%" stopColor="#000" stopOpacity={0.1}/>
            </linearGradient>
        </defs>
      <CartesianGrid strokeDasharray="5 5" vertical={false} horizontal={false}/>
      <XAxis
        allowDataOverflow
        dataKey="time"
        domain={[state.left, state.right]}
        type="number"
        tick={<CustomizedAxisTick/>}
        tickFormatter={labelFormatter}
        isCategorial={false}
        minTickGap={0}
        tickCount={10}
        interval={3}
        scale="time"
      />
      <YAxis
        allowDataOverflow
        domain={[(state.bottom | 0), (state.top | 100)]}
        type="number"
        yAxisId="1"
        tick={{ fontSize: 10, }}
        unit="%"
      />
      <YAxis
        orientation="right"
        yAxisId="2"
      />
      <Tooltip
        labelFormatter={labelFormatter}
        formatter={formatter}
        allowEscapeViewBox={{ x: false, y: false }}
        cursor={true}
        offset={15}
        contentStyle={{
          border: "1px",
          padding: theme.spacing(1),
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[1],
          backgroundColor: "#000000000" //theme.palette.secondary.dark
        }}
        labelStyle={{ 
          fontSize: 12,
          fontWeight: "fontWeightLight",
          color: "white"
           }}
        itemStyle={{
          fontSize: theme.typography.body1.fontSize,
          letterSpacing: theme.typography.body1.letterSpacing,
          fontFamily: theme.typography.body1.fontFamily,
          lineHeight: theme.typography.body1.lineHeight,
          fontWeight: "fontWeightLight", //theme.typography.body1.fontWeight,
          textAlign: "left",
          color: "white",
          display: "none"
        }}
      />
      <Legend 
        align="center"
        verticalAlign="top"
        wrapperStyle={{ top: 10, fontSize: 12  }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />
      <Brush 
        dataKey="time"
        height={20} stroke={theme.palette.secondary.main} fill={theme.palette.common.darkBlack}
        endIndex={8}
        tickFormatter={labelFormatter}
        padding={{top: 20}}
        // onChange={handleBrushChange}
      />
      <Area
        yAxisId="1"
        type="natural"
        dataKey="clouds"
        unit="%"
        dot={{ fill: "#000000000", stroke: `#fff`, r: 2}}
        animationDuration={300}
        onMouseEnter={() =>
          setState({
            ...state,
            activeArea: "clouds",
            activeColor: "#fff"
          })
        }
        onMouseOut={() =>
          setState({
            ...state,
            activeArea: "",
            activeColor: "#0000000"
          })
        }
        stroke={state.activeArea === "clouds" ? "url(#monoActiveUv)" : "#fff"}
        fill={state.activeArea === "clouds" ? "url(#monoActiveUv)" : "url(#monoUv)"} //"#"
        hide={hideArea.hidden.clouds}
      />
      <Area
        yAxisId="1"
        type="natural"
        dataKey="pop"
        unit="%"
        activeDot={{ fill: `#38a9ff`, r: 2}}
        animationDuration={300}
        onMouseEnter={() =>
          setState({
            ...state,
            activeArea: "pop",
            activeColor: "#38a9ff"
          })
        }
        onMouseOut={() =>
          setState({
            ...state,
            activeArea: "",
            activeColor: "#0000000",
          })
        }
        stroke={state.activeArea === "pop" ? "url(#monoActiveUv)" : "#38a9ff"}
        fill={state.activeArea === "pop" ? "url(#monoActiveUv)" : "url(#monoUv)"}
        hide={hideArea.hidden.pop}
      />
      {state.refAreaLeft && state.refAreaRight ? (
        <ReferenceArea
          yAxisId="1"
          x1={state.refAreaLeft}
          x2={state.refAreaRight}
          strokeOpacity={0.3}
        />
      ) : null}
    </AreaChart>
    </ResponsiveContainer>
    </Box>
    
    <Box height={height} display="flex"
        style={{ backgroundColor: theme.palette.common.black, userSelect: "none" }}
        onDoubleClick={zoomOut}
        className={classes.scrollOnMobile}
        component="div"
    >
      <AreaChart
        width={1200}
        height={200}
        margin={{bottom: 20, top: 5, right: -40, left: -20 }}
        data={state.data}
        onMouseDown={(e) =>
          e && e.activeLabel && setState({
            ...state,
            refAreaLeft: e.activeLabel,
          })
        }
        onMouseMove={(e) =>
          state.refAreaLeft && e.activeLabel &&
          setState({
            ...state,
            refAreaRight: e.activeLabel,
          })
        }
        onMouseUp={zoom}
        syncId="ship"
      >
        <defs>
              <linearGradient id="colorUv" x1="0" y1="-0.1" x2="0" y2="1">
                <stop offset="1%" stopColor="rgb(255, 0, 0)" stopOpacity={0.25}/>
                <stop offset="25%" stopColor="#00ff00" stopOpacity={0.2}/>
                <stop offset="50%" stopColor="#0000ff" stopOpacity={0.1}/>
                <stop offset="85%" stopColor="#ff00ff" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="activeColorUv" x1="0" y1="-0.1" x2="0" y2="1">
                <stop offset="1%" stopColor="rgb(255, 0, 0)" stopOpacity={0.9}/>
                <stop offset="25%" stopColor="#00ff00" stopOpacity={0.95}/>
                <stop offset="50%" stopColor="#0000ff" stopOpacity={0.7}/>
                <stop offset="85%" stopColor="#ff00ff" stopOpacity={0.5}/>
              </linearGradient>
              <linearGradient id="monoActiveUv" x1="0" y1="-0.1" x2="0" y2="1">
                <stop offset="0%" stopColor={state.activeColor} stopOpacity={0.95}/>
                <stop offset="100%" stopColor={state.activeColor} stopOpacity={0.5}/>
              </linearGradient>
              <linearGradient id="monoUv" x1="0" y1="-0.1" x2="0" y2="1">
                <stop offset="0%" stopColor="#000" stopOpacity={0.25}/>
                <stop offset="100%" stopColor="#000" stopOpacity={0.1}/>
              </linearGradient>
              
        </defs>
        <CartesianGrid strokeDasharray="5 5" vertical={false} horizontal={false}/>
        <XAxis
          allowDataOverflow
          // style={{marginBottom: "50px"}}
          dataKey="time"
          domain={[state.left, state.right]}
          type="number"
          tick={<CustomizedAxisTick/>}
          tickFormatter={labelFormatter}
          isCategorial={false}
          minTickGap={0}
          tickCount={10}
          interval={3}
          scale="time"
        />
        <YAxis
          allowDataOverflow
          domain={[(state.bottom | 0), (state.top | 100)]}
          type="number"
          yAxisId="1"
          unit="°"
          tick={{ fontSize: 10 }}
        />
        <YAxis
          orientation="right"
          allowDataOverflow
          domain={[(state.bottom2 | 0), state.top2]}
          type="number"
          yAxisId="2"
          tick={{ fontSize: 10 }}
        />
        {/* <Tooltip /> */}
        <Tooltip
          labelFormatter={labelFormatter}
          formatter={formatter}
          allowEscapeViewBox={{ x: true, y: true }}
          cursor={true}
          offset={15}
          contentStyle={{
            border: "1px",
            padding: theme.spacing(1),
            borderRadius: theme.shape.borderRadius,
            boxShadow: theme.shadows[1],
            backgroundColor: "#000000000" //theme.palette.secondary.dark
          }}
          labelStyle={{ 
            fontSize: 12,
            fontWeight: "fontWeightLight",
            color: "white"
             }}
          itemStyle={{
            fontSize: theme.typography.body1.fontSize,
            letterSpacing: theme.typography.body1.letterSpacing,
            fontFamily: theme.typography.body1.fontFamily,
            lineHeight: theme.typography.body1.lineHeight,
            fontWeight: "fontWeightLight", //theme.typography.body1.fontWeight,
            textAlign: "left",
            color: "white",
            display: "none"
          }}
        />
        <Legend 
          align="left"
          verticalAlign="bottom"
          wrapperStyle={{ fontSize: 12, left: 80 }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        />
        <Area
          yAxisId="2"
          type="natural"
          dataKey="humidity"
          unit="%"
          // fill="url(#alphaUv)"
          activeDot={{ fill: `#9ddcec`, r: 2}}
          animationDuration={300}
          onMouseEnter={() =>
            setState({
              ...state,
              activeArea: "humidity",
              activeColor: "#9ddcec"
            })
          }
          onMouseOut={() =>
            setState({
              ...state,
              activeArea: "",
              activeColor: "#0000000",
            })
          }
          stroke={state.activeArea === "humidity" ? "url(#monoActiveUv)" : "#9ddcec"}
          fill={state.activeArea === "humidity" ? "url(#monoActiveUv)" : "url(#monoUv)"}
          hide={hideArea.hidden.humidity}
        />
        <Area
          yAxisId="1"
          type="natural"
          dataKey="dewPoint"
          unit="°"
          activeDot={{ fill: `#a8e6c9`, stroke: `${theme.palette.warning.dark}`, r: 2}}
          animationDuration={300}
          onMouseEnter={() =>
            setState({
              ...state,
              activeArea: "dewPoint",
              activeColor: "#a8e6c9"
            })
          }
          onMouseOut={() =>
            setState({
              ...state,
              activeArea: "",
              activeColor: "#0000000",
            })
          }
          stroke={state.activeArea === "dewPoint" ? "url(#monoActiveUv)" : "#a8e6c9"}
          fill={state.activeArea === "dewPoint" ? "url(#monoActiveUv)" : "url(#monoUv)"}
          hide={hideArea.hidden.dewPoint}
        />
        {state.refAreaLeft && state.refAreaRight ? (
          <ReferenceArea
            yAxisId="1"
            x1={state.refAreaLeft}
            x2={state.refAreaRight}
            strokeOpacity={0.3}
          />
        ) : null}
        </AreaChart>

      </Box>
    </>
  
  );
}

export default withStyles(styles, { withTheme: true })(
  withWidth()(HourlyForecast)
);
