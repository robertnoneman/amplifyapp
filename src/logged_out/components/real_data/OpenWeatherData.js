import React, {  
  useState, 
  useEffect, 
  useCallback, 
  createRef,
  useRef
} from "react";
import {
  // Label,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  Dot
} from "recharts";
import { Box, Button, Container, FormControlLabel, Grid, SvgIcon, withStyles, Switch } from "@material-ui/core";
import Axios from "axios";
import format from "date-fns/format";
import WeatherCharts from "./WeatherCharts";
import lineData from "../../test_data/nivoLineData.json"
import testHourly from "../../test_data/testHourlyData.json"
import { min } from "date-fns";

const styles = (theme) => ({
  card: {
    backgroundColor: theme.palette.common.darkBlack,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center"
  },
  chartBox: {

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

function getMin(data) {
  var min = Math.min(data);
  var max = Math.max(data);
  return min;
}
function getMax(data) {
  var min = Math.min(data);
  var max = Math.max(data);
  return max;
}

// Returns hello.
// unix => "hello";

function formatTime(unix, offset) {
  const seconds = unix - offset;
  const secs = seconds * 1000;
  
  return format(new Date(secs), "MMM d hh:mm:ss");
}

function labelFormatter(label) {
  if (label === null || label < 0 || label === -Infinity || label === Infinity) return;
  const tempLabel = label * 1000 * 1000;
  return format(new Date(tempLabel), "MMM d, p");
}

function CustomizedAxisTick(props) {
  const {x, y, payload} = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={10} textAnchor="end" fill="#666" fontSize={10} transform="rotate(-25)">{labelFormatter(payload.value)}</text>
    </g>
  );
}

function toCelsius(f) {
  return (5 / 9) * (f - 32);
}

function setLocation(lat, lon) {
  return { lat, lon };
}

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
    cx, cy, stroke, payload, value, 
  } = props;

  return (
      <svg 
        fill={stroke} 
        viewBox="0 0 1024 1024"  
        x={ cx - 0 } 
        y={ cy - 0 } 
        width={600} height={600} 
        overflow="auto"
        // transform={`rotate(${payload.windDeg})`}
        >
      <g 
      // transform={`rotate(${payload.windDeg})`}
      >
        <path transform={`rotate(${payload.windDeg})`} d="m12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"></path>
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
    <svg overflow="auto" stroke={color} fill={color} x={cx} y={cy} width={25} height={25} viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <circle r="100" stroke={color} fill={color}/> 
    </svg>
  );
}

function HourlyForecast(props) {
  const { title, classes, theme } = props;
  const [state, setState] = useState(initialStateData);
  const [loaded, setLoaded] = useState(false);
  const [hidden, setHidden] = useState(true);

  const handleHiddenChange = (event) => {
    setHidden(event.target.checked);
  };

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
    let refAreaLeft = state.refAreaLeft;
    let refAreaRight = state.refAreaRight;
    let data = state.data;
    if (refAreaLeft === refAreaRight || refAreaRight === "") {
      setState({
        refAreaLeft: "",
        refAreaRight: "",
        ...state,
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
      top2
    })
  }, [state, setState]);

  const zoomOut = useCallback(() => {
    const data = state.data;
    setState({
      data: data.slice(),
      refAreaLeft: "",
      refAreaRight: "",
      left: "dataMin",
      right: "dataMax",
      top: "dataMax+1",
      bottom: "dataMin",
      top2: "dataMax+5",
      bottom2: "dataMin+5"
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
      minutely.forEach((element, index) => {
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

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  return (
     
    <Box className={classes.card} style={{ userSelect: "none", }} m={theme.spacing(1)}>
      <FormControlLabel control={<Switch checked={hidden} onChange={handleHiddenChange} color="primary" />}
        label="Hidden"/>
      {!hidden && state.data.length > 2 && <WeatherCharts data={state.data} />}
      <Button
        className="btn update"
        onClick={zoomOut}
      >
        Zoom Out
      </Button>
    {/* <ResponsiveContainer width="100%" height="100%"> */}
      {/* </Temp, feels like, dew point, wind> */}
      {hidden && <AreaChart
        width={800}
        height={400}
        margin={{bottom: 10, top: 20, }}
        data={state.data}
        onMouseDown={(e) =>
          setState({
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
          // style={{margin: "50px"}}
          dataKey="time"
          domain={[state.left, state.right]}
          type="number"
          tick={<CustomizedAxisTick/>}
          tickFormatter={labelFormatter}
          // interval={1}
        />
        <YAxis
          allowDataOverflow
          domain={[(state.bottom), (state.top)]}
          type="number"
          yAxisId="1"
        />
        <YAxis
          orientation="right"
          allowDataOverflow
          domain={[(state.bottom2), state.top2]}
          type="number"
          yAxisId="2"
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
          // margin={ { top: 20, bottom: 20 } }
          layout="vertical"
          align="center"
          verticalAlign="middle"
          wrapperStyle={ { right: -100 }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
        <Area
          yAxisId="2"
          type="natural"
          dataKey="pressure"
          unit="inHg"
          // stroke={theme.palette.warning.main} //"#"
          color="#ecc79d"
          dot={{ fill: `#ecc79d`, stroke: `${theme.palette.warning.main}`, r: 2}}
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
              activeColor: "#000"
            })
          }
          stroke={state.activeArea === "pressure" ? "url(#monoActiveUv)" : "#ecc79d"}
          fill={state.activeArea === "pressure" ? "url(#monoActiveUv)" : "url(#monoUv)"}
        />
        <Area
          yAxisId="1"
          type="natural"
          dataKey="temp"
          // stroke="url(#colorUv)" 
          // fill="url(#colorUv)" //"#"
          unit="°"
          dot={<HeatmapDot source="temp"/>}
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
            })
          }
          strokeWidth={2}
          stroke={state.activeArea === "temp" ? "url(#activeHeatmapUv)" : "url(#inactiveHeatmapUv)"}
          fill={state.activeArea === "temp" ? "url(#activeHeatmapUv)" : "url(#inactiveHeatmapUv)"}
        />
        <Area
          yAxisId="1"
          type="natural"
          dataKey="feelsLike"
          unit="°"
          // stroke={theme.palette.secondary.main} //"#"
          dot={<HeatmapDot  source="feelsLike"/>} 
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
            })
          }
          stroke={state.activeArea === "feelsLike" ? "url(#activeHeatmapUv)" : "url(#inactiveHeatmapUv)"}
          fill={state.activeArea === "feelsLike" ? "url(#activeHeatmapUv)" : "url(#inactiveHeatmapUv)"}
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
              activeColor: "#000",
            })
          }
          stroke={state.activeArea === "dewPoint" ? "url(#monoActiveUv)" : "#a8e6c9"}
          fill={state.activeArea === "dewPoint" ? "url(#monoActiveUv)" : "url(#monoUv)"}
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
              activeColor: "#000",
            })
          }
          stroke={state.activeArea === "windSpeed" ? "url(#monoActiveUv)" : "#e0e0e178"}
          fill={state.activeArea === "windSpeed" ? "url(#monoActiveUv)" : "url(#monoUv)"}
          // animationDuration={300}
        />
        {state.refAreaLeft && state.refAreaRight ? (
          <ReferenceArea
            yAxisId="1"
            x1={state.refAreaLeft}
            x2={state.refAreaRight}
            strokeOpacity={0.3}
          />
        ) : null}
      </AreaChart>}
      {/* {Clouds, pop, humidity} */}
      {hidden && <AreaChart
        width={800}
        height={400}
        margin={{bottom: 10}}
        data={state.data}
        onMouseDown={(e) =>
          setState({
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
          // style={{margin: "50px"}}
          dataKey="time"
          domain={[state.left, state.right]}
          type="number"
          tick={<CustomizedAxisTick/>}
          tickFormatter={labelFormatter}
          // interval={1}
        />
        <YAxis
          allowDataOverflow
          domain={[(state.bottom | 0), (state.top | 100)]}
          type="number"
          yAxisId="1"
        />
        <YAxis
          orientation="right"
          allowDataOverflow
          domain={[(state.bottom2 | 0), state.top2 | 100]}
          type="number"
          yAxisId="2"
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
        <Legend />
        <Area
          yAxisId="2"
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
              activeColor: "#000"
            })
          }
          stroke={state.activeArea === "clouds" ? "url(#monoActiveUv)" : "#fff"}
          fill={state.activeArea === "clouds" ? "url(#monoActiveUv)" : "url(#monoUv)"} //"#"
        />
        <Area
          yAxisId="1"
          type="natural"
          dataKey="humidity"
          unit="%"
          // fill="url(#alphaUv)"
          dot={{ fill: `#9ddcec`, stroke: `${theme.palette.primary.main}`, r: 2}}
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
              activeColor: "#000",
            })
          }
          stroke={state.activeArea === "humidity" ? "url(#monoActiveUv)" : "#9ddcec"}
          fill={state.activeArea === "humidity" ? "url(#monoActiveUv)" : "url(#monoUv)"}
        />
        <Area
          yAxisId="1"
          type="natural"
          dataKey="pop"
          unit="%"
          dot={{ fill: `#38a9ff`, stroke: `${theme.palette.primary.main}`, r: 2}}
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
              activeColor: "#000",
            })
          }
          stroke={state.activeArea === "pop" ? "url(#monoActiveUv)" : "#38a9ff"}
          fill={state.activeArea === "pop" ? "url(#monoActiveUv)" : "url(#monoUv)"}
        />
        {state.refAreaLeft && state.refAreaRight ? (
          <ReferenceArea
            yAxisId="1"
            x1={state.refAreaLeft}
            x2={state.refAreaRight}
            strokeOpacity={0.3}
          />
        ) : null}
      </AreaChart>}
    </Box>
  );
}

export default withStyles(styles, { withTheme: true })(HourlyForecast);

    // </ArrowDropDownCircle>
    // <SvgIcon style={{ 
    //   transform: `rotate(${payload.windDeg}deg)`, 
    //   pourIcon: {
    //     animation: "pour 5s linear"
    //   },
    //   "@keyframes pour": {
    //     "0%": {
    //       transform: "scale(1) rotate(-45deg)"
    //     },
    //     "25%": {
    //       transform: "rotate(-45deg) scale(0.6)",
    //       bottom: "-100px"
    //     },
    //     "50%": {
    //       transform: "scale(0.1) rotate(-45deg)",
    //       bottom: "200px",
    //       opacity: "0.01"
    //     }
    //   },
    //   animation: "pour 5s linear infinite",
    //   animationTimingFunction: "cubic-bezier(0.47, 0.5, 0.745, 0.715)"
    //   }} x={cx - 10} y={cy - 10} width={40} height={40} fill={stroke} viewBox="0 0 1024 1024">
    // {/* <svg x={cx - 10} y={cy - 10} width={20} height={20} fill={stroke} viewBox="0 0 1024 1024"> */}
    //   {/* <path fill={stroke} d="M240.971 130.524l194.343 194.343c9.373 9.373 9.373 24.569 0 33.941l-22.667 22.667c-9.357 9.357-24.522 9.375-33.901.04l224 227.495 69.255 381.516c-9.379 9.335-24.544 9.317-33.901-.04l-22.667-22.667c-9.373-9.373-9.373-24.569 0-33.941l207.03 130.525c9.372-9.373 24.568-9.373 33.941-.001z"/> */}
    //   <path fill={stroke} d="M8 256c0 137 111 248 248 248s248-111 248-248S393 8 256 8 8 119 8 256zm448 0c0 110.5-89.5 200-200 200S56 366.5 56 256 145.5 56 256 56s200 89.5 200 200zM266.9 126.1l121.4 121.4c4.7 4.7 4.7 12.3 0 17L266.9 385.9c-4.7 4.7-12.3 4.7-17 0l-19.6-19.6c-4.8-4.8-4.7-12.5.2-17.2l70.3-67.1H140c-6.6 0-12-5.4-12-12v-28c0-6.6 5.4-12 12-12h160.8l-70.3-67.1c-4.9-4.7-5-12.4-.2-17.2l19.6-19.6c4.7-4.7 12.3-4.7 17 0z"></path>
    // {/* </svg> */}
    // </SvgIcon>