import React, {  
  useState, 
  useEffect, 
  useCallback, 
  // createRef,
  // useRef
} from "react";
import {
  // Label,
  // LineChart,
  // Line,
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
  // Dot
} from "recharts";
import { Box, Button, FormControlLabel, withStyles, Switch, Card, IconButton, Menu, MenuItem, Grid, } from "@material-ui/core";
import Axios from "axios";
import format from "date-fns/format";
import WeatherCharts from "./WeatherCharts";
import MoreVert from "@material-ui/icons/MoreVert";
import { fontSize } from "@material-ui/system";
// import lineData from "../../test_data/nivoLineData.json"
// import testHourly from "../../test_data/testHourlyData.json"

const styles = (theme) => ({
  card: {
    backgroundColor: theme.palette.common.darkBlack,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    // marginTop: 10,
  },
  chartCard: {
    backgroundColor: theme.palette.common.black,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  windArrow: {
    transform: 'rotate(0deg)',
  },
  nivoContainer: {
    marginTop: "auto",
    width: "100%",
    height: "600px",
    background: theme.palette.common.darkBlack
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
    cx, cy, stroke, payload,  
  } = props;
  return (
      <svg 
        fill={stroke} 
        viewBox="0 0 1024 1024"  
        x={ cx - 0 } 
        y={ cy - 0 } 
        width={600} height={600}
        overflow="visible" 
        >
      <g>
        <path overflow="visible" transform={`rotate(${payload.windDeg + 180})`} d="m12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"></path>
      </g>
      </svg>
  );
}

const HeatmapDot = (props) => {
  const {
    cx, cy, payload, source 
  } = props;
  // const value = useRef(null);
  const color = (source === "feelsLike" ? getRgb(20, 100, payload["feelsLike"]) : getRgb(20, 100, payload["temp"]) );
  return (
    <svg overflow="auto" stroke={color} fill={color} x={cx} y={cy} width={50} height={50} viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <circle r="100" stroke={color} fill={color}/> 
    </svg>
  );
}

const itemHeight = 200;
const options = ["Dense", "Compact"];

function HourlyForecast(props) {
  const { title, classes, theme, height } = props;
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
  const [selectedOption, setSelectedOption] = useState("Dense");
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

  const fetchWeatherData = useCallback(() => {
    if (loaded) return;
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
          element
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
      setState({
        ...state, 
        data: merged.slice(), 
        dailyData: dailyMerged.slice(), 
        minutelyData: minutelyMerged.slice(), 
        allData: [minutelyMerged.slice(), merged.slice(), dailyMerged.slice()],
        min: bottomColor,
        max: topColor
      });
      setLoaded(true);
    });
  }, [loaded, setLoaded]);

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
    // console.log(`Clicked ${dataKey}! Current state is ${toggle}, new state is ${!toggle}`);
    setHideArea( {
      hidden: {...hideArea.hidden, [dataKey]: !toggle}
    })
  };

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  const isOpen = Boolean(anchorEl);

  return (
    <>
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
      <Box height={selectedOption === "Compact" ? 200 : height} 
        width="100%" display="flex" style={{userSelect: "none"}} onDoubleClick={zoomOut}
        overflow="auto"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            margin={selectedOption === "Compact" ? {bottom: 10, top: 20, right: 0, left: -20 } : {bottom: 10, top: 20, right: -5, left: -20 }}
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
              cursor={false}
              offset={5}
              allowEscapeViewBox={{ x: false, y: false }}
              contentStyle={{
                border: "1px",
                padding: theme.spacing(1),
                borderRadius: theme.shape.borderRadius,
                boxShadow: theme.shadows[1],
                backgroundColor: theme.palette.secondary.dark
              }}
              labelStyle={theme.typography.h6}
              itemStyle={{
                fontSize: theme.typography.body1.fontSize,
                letterSpacing: theme.typography.body1.letterSpacing,
                fontFamily: theme.typography.body1.fontFamily,
                lineHeight: theme.typography.body1.lineHeight,
                fontWeight: "fontWeightLight", //theme.typography.body1.fontWeight,
                textAlign: "left",
                color: "white"
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
              activeDot={ <HeatmapDot source="temp" /> }
              animationDuration={300}
              onMouseEnter={() =>
                setState({
                  ...state,
                  activeArea: "temp",
                })
              }
              onMouseExit={() =>
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
              // stroke={theme.palette.secondary.main} //"#"
              activeDot={ <HeatmapDot source="feelsLike" />} 
              // stroke: `${state.activeArea === "feelsLike" ? "url(#colorUv)" : "url(#monoUv)"}`, 
              animationDuration={300}
              onMouseEnter={() =>
                setState({
                  ...state,
                  activeArea: "feelsLike",
                })
              }
              onMouseExit={() =>
                setState({
                  ...state,
                  activeArea: "",
                  activeColor: "#0000000"
                })
              }
              strokeWidth={state.activeArea === "temp" ? 2 : 1 }
              stroke="url(#activeHeatmapUv)"
              fill={state.activeArea === "feelsLike" ? "url(#activeHeatmapUv)" : "url(#inactiveHeatmapUv)"}
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

    <Grid container spacing={3}>
      <Grid item xs={12} md={6} lg={12} xl={12} style={selectedOption === "Compact" ? { maxWidth: "90%", margin: "20px" } : {margin: "auto", }}>
        <Card className={classes.chartCard}>
          <Box display="flex" justifyContent="flex-end"
            pt={-2} px={2} pb={-6}
          >
            {/* <Button className="btn update" onClick={zoomOut}></Button> */}
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
          <Box height={selectedOption === "Compact" ? 200 : height} 
            width="100%" display="flex" style={{userSelect: "none"}} onDoubleClick={zoomOut}
            overflow={selectedOption === "Compact" ? "hidden": "auto"}
          >
            <ResponsiveContainer width="100%" height="100%">
              {/* {hidden &&  */}
              <AreaChart
                margin={selectedOption === "Compact" ? {bottom: 10, top: 20, right: 0, left: 0 } : {bottom: 10, top: 20, right: -30, left: -20 }}
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
                syncId="pirate"
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
                  interval={selectedOption === "Compact" ? 3 : 6}
                  scale="time"
                  hide={selectedOption === "Compact" ? true : false}
                />
                <YAxis
                  allowDataOverflow
                  domain={[state.bottom, state.top]}
                  type="number"
                  yAxisId="1"
                  scale="linear"
                  // unit="mph"
                  allowDecimals={false}
                  tick={selectedOption === "Compact" ? false : { fontSize: 10 }}
                  hide={selectedOption === "Compact" ? true : false}
                />
                <YAxis
                  orientation="right"
                  allowDataOverflow
                  domain={[(state.bottom2), state.top2]}
                  type="number"
                  yAxisId="2"
                  scale="linear"
                  unit='"'
                  allowDecimals={false}
                  tick={selectedOption === "Compact" ? false : { fontSize: 10 }}
                  hide={selectedOption === "Compact" ? true : false}
                />
                
                {/* <Tooltip /> */}
                <Tooltip
                  labelFormatter={labelFormatter}
                  formatter={formatter}
                  cursor={false}
                  offset={5}
                  allowEscapeViewBox={{ x: false, y: false }}
                  contentStyle={{
                    border: "1px",
                    padding: theme.spacing(1),
                    borderRadius: theme.shape.borderRadius,
                    boxShadow: theme.shadows[1],
                    backgroundColor: theme.palette.secondary.dark
                  }}
                  labelStyle={theme.typography.h6}
                  itemStyle={{
                    fontSize: theme.typography.body1.fontSize,
                    letterSpacing: theme.typography.body1.letterSpacing,
                    fontFamily: theme.typography.body1.fontFamily,
                    lineHeight: theme.typography.body1.lineHeight,
                    fontWeight: "fontWeightLight", //theme.typography.body1.fontWeight,
                    textAlign: "left",
                    color: "white"
                  }}
                />
                <Legend 
                  // layout="vertical"
                  align="center"
                  // verticalAlign="middle"
                  verticalAlign="top"
                  wrapperStyle={ {top: 5,  right: 0, fontSize: 12 }}
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
                  dot={{ fill: `#ecc79d`, r: 2}}
                  animationDuration={300}
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
                      activeColor: "#0000000"
                    })
                  }
                  stroke={state.activeArea === "pressure" ? "url(#monoActiveUv)" : "#ecc79d"}
                  fill={state.activeArea === "pressure" ? "url(#monoActiveUv)" : selectedOption === "Compact" ? "url(#monoActiveUv)" : "url(#monoUv)"}
                  hide={hideArea.hidden.pressure}
                />
                <Area
                  yAxisId="1"
                  type="natural"
                  dataKey="windSpeed"
                  unit="mph"
                  strokeWidth={1}
                  // dot={{ fill: `${theme.palette.warning.light}`, stroke: `${theme.palette.warning.light}`, r: 2}}
                  dot={<CustomizedDot stroke="#48a4ea" r={0}/>}
                  onMouseEnter={() =>
                    setState({
                      ...state,
                      activeArea: "windSpeed",
                      activeColor: "#e0e0e1"
                    })
                  }
                  onMouseExit={() =>
                    setState({
                      ...state,
                      activeArea: "",
                      activeColor: "#0000000",
                    })
                  }
                  stroke={state.activeArea === "windSpeed" ? "url(#monoActiveUv)" : "#e0e0e178"}
                  fill={state.activeArea === "windSpeed" ? "url(#monoActiveUv)" : "url(#monoUv)"}
                  animationDuration={300}
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
          {/* } */}
        </ResponsiveContainer>
          </Box>
        </Card>
      </Grid>
    </Grid>
    <Box height={height} width="100%" display="flex"
      // overflow={isDragging? "hidden" : "auto"}
      // component="div"
      style={{ backgroundColor: theme.palette.common.black, 
      // userSelect: "none"
      }}
      onDoubleClick={zoomOut}
    >
      <ResponsiveContainer width="100%" height="100%">
          {/* { hidden &&  */}
        <AreaChart
          // width={1200}
          // height={250}
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
        // padding={ { top: 20, } }
        tick={{ fontSize: 10, }}
        unit="%"
      />
      <YAxis
        orientation="right"
        yAxisId="2"
        // allowDataOverflow
        // domain={[(state.bottom2 | 0), state.top2 | 101]}
        // type="number"
        // tick={{ fontSize: 10 }}
      />
      <Tooltip
        labelFormatter={labelFormatter}
        formatter={formatter}
        cursor={false}
        offset={20}
        allowEscapeViewBox={{ x: false, y: false }}
        contentStyle={{
          border: "1px",
          padding: theme.spacing(1),
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[1],
          backgroundColor: theme.palette.secondary.dark,
        }}
        labelStyle={theme.typography.h6}
        itemStyle={{
          fontSize: theme.typography.body1.fontSize,
          letterSpacing: theme.typography.body1.letterSpacing,
          fontFamily: theme.typography.body1.fontFamily,
          lineHeight: theme.typography.body1.lineHeight,
          fontWeight: "fontWeightLight", //theme.typography.body1.fontWeight,
          textAlign: "left",
          color: "white"
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
        // endIndex={8}
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
        dot={{ fill: `#38a9ff`, r: 2}}
        animationDuration={300}
        onMouseEnter={() =>
          setState({
            ...state,
            activeArea: "pop",
            activeColor: "#38a9ff"
          })
        }
        onMouseExit={() =>
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
    {/* } */}
    {/* </Box> */}
      </ResponsiveContainer>
        {/* <FormControlLabel control={<Switch checked={hidden} onChange={handleHiddenChange} color="primary" />}
          label="Hidden"
        />
        {!hidden && state.data.length > 2 && <WeatherCharts data={state.data} />} */}
    </Box>
    
    <Box height={height} minWidth={800} display="flex"
        style={{ backgroundColor: theme.palette.common.black, userSelect: "none" }}
        onDoubleClick={zoomOut}
        overflow="auto"
        component="div"
    >
      <AreaChart
        width={1200}
        height={200}
        margin={{bottom: 20, top: 5, left: -20}}
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
          padding={ { top: 10} }
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
          cursor={false}
          offset={20}
          allowEscapeViewBox={{ x: true, y: true }}
          contentStyle={{
            border: "1px",
            padding: theme.spacing(1),
            borderRadius: theme.shape.borderRadius,
            boxShadow: theme.shadows[1],
            backgroundColor: theme.palette.secondary.dark
          }}
          labelStyle={theme.typography.h6}
          itemStyle={{
            fontSize: theme.typography.body1.fontSize,
            letterSpacing: theme.typography.body1.letterSpacing,
            fontFamily: theme.typography.body1.fontFamily,
            lineHeight: theme.typography.body1.lineHeight,
            fontWeight: "fontWeightLight", //theme.typography.body1.fontWeight,
            textAlign: "left",
            color: "white"
          }}
        />
        <Legend 
          align="left"
          verticalAlign="bottom"
          wrapperStyle={{ right: -80, fontSize: 12  }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        />
        <Area
          yAxisId="1"
          type="natural"
          dataKey="dewPoint"
          unit="°"
          dot={{ fill: `#a8e6c9`, stroke: `${theme.palette.warning.dark}`, r: 2}}
          animationDuration={300}
          onMouseEnter={() =>
            setState({
              ...state,
              activeArea: "dewPoint",
              activeColor: "#a8e6c9"
            })
          }
          onMouseExit={() =>
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
        <Area
          yAxisId="2"
          type="natural"
          dataKey="humidity"
          unit="%"
          // fill="url(#alphaUv)"
          dot={{ fill: `#9ddcec`, r: 2}}
          animationDuration={300}
          onMouseEnter={() =>
            setState({
              ...state,
              activeArea: "humidity",
              activeColor: "#9ddcec"
            })
          }
          onMouseExit={() =>
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
        {state.refAreaLeft && state.refAreaRight ? (
          <ReferenceArea
            yAxisId="1"
            x1={state.refAreaLeft}
            x2={state.refAreaRight}
            strokeOpacity={0.3}
          />
        ) : null}
        </AreaChart>
        <FormControlLabel control={<Switch checked={hidden} onChange={handleHiddenChange} color="primary" />}
          label="Hidden"/>
      </Box>
    </>
  );
}

export default withStyles(styles, { withTheme: true })(HourlyForecast);
