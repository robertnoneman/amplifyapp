import React, {  
  useState, 
  useEffect, 
  useCallback 
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
  Legend
} from "recharts";
import { Box, Button, Container, Grid, SvgIcon, withStyles } from "@material-ui/core";
import Axios from "axios";
import format from "date-fns/format";
import WeatherCharts from "./WeatherCharts";
import lineData from "../../test_data/nivoLineData.json"
import testHourly from "../../test_data/testHourlyData.json"

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
  top: "dataMax+1",
  bottom: "dataMin-1",
  top2: "dataMax",
  bottom2: "dataMin",
  animation: true
};

const CustomizedDot = (props) => {
  const {
    cx, cy, stroke, payload, value, 
  } = props;

  return (
      <svg 
        fill={stroke} 
        viewBox="0 0 1024 1024"  
        x={cx + 1} y={cy + 1} 
        width={800} height={800} 
        // transform={`rotate(${payload.windDeg})`}
        // style={{transform: `rotate(${payload.windDeg})`}} 
        >
      <g transform={`rotate(${payload.windDeg})`}>
        <path 
        vectorEffect="fixed-position" 
        // transform={`rotate(${payload.windDeg})`} 
        d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path>
      </g>
      </svg>
  );
}

function HourlyForecast(props) {
  const { title, classes, theme } = props;
  const [state, setState] = useState(initialStateData);
  const [loaded, setLoaded] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const getAxisYDomain = (data, from, to, ref, offset) => {
    const refData = Array.from(data);
    refData.slice(from - 1, to);
    let [bottom, top] = [refData[0][ref], refData[0][ref]];
    refData.forEach((d) => {
      if (d[ref] > top) top = d[ref];
      if (d[ref] < bottom) bottom = d[ref];
    });
  
    return [(bottom | 0) - offset, (top | 0) + offset];
  };

  const formatter = useCallback(
    (value, name) => {
      return [value, name, title];
    },
    [title]
  );



  const zoom = useCallback(() => {
    // const refAreaLeft = state.refAreaLeft;
    let refAreaLeft = state.refAreaLeft;
    // const refAreaRight = state.refAreaRight;
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
    // if (state.data === null || !state.data) console.log(`WTF WHERE IS THE DATA ${state.data}`);
    // console.log(`WTF WHERE IS THE DATA ${state.data[0].temp}`);
    const [bottom, top] = getAxisYDomain(
      state.data,
      refAreaLeft,
      refAreaRight,
      "temp",
      0
    );
    const [bottom2, top2] = getAxisYDomain(
      data,
      refAreaLeft,
      refAreaRight,
      "humidity",
      0
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
      left: "dataMin-5",
      right: "dataMax",
      top: "dataMax+1",
      bottom: "dataMin",
      top2: "dataMax+5",
      bottom2: "dataMin+5"
    })
  }, [state, setState]);

  const fetchWeatherData = useCallback(() => {
    if (loaded) return;

    // const apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${myLocation.lat}&lon=${myLocation.lon}&units=imperial&appid=39216f4b9137de2e4d5f35aa5bdbde04`;
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
      hourly.forEach((element, index) => {
        const timestamp = formatTime(element.dt, tOffset);
        const rawTimestamp = (element.dt) / 1000;
        merged[index] = {
          // time: timestamp,
          time: rawTimestamp,
          temp: element.temp,
          humidity: element.humidity,
          pop: element.pop,
          feelsLike: element.feels_like,
          pressure: element.pressure * 0.0295300,
          dewPoint: element.dew_point,
          uvi: element.uvi,
          clouds: element.clouds,
          visibility: element.visibility,
          windSpeed: element.wind_speed,
          windDeg: element.wind_deg,
          weather: element.weather
          };
      });
      // setFetchedData(merged);
      setState({
        ...state, 
        data: merged.slice(), 
        dailyData: dailyMerged.slice(), 
        minutelyData: minutelyMerged.slice(), 
        allData: [minutelyMerged.slice(), merged.slice(), dailyMerged.slice()]
      });
    });
      setLoaded(true);
  }, [loaded, setLoaded]);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  return (
     
    <Box className={classes.card} style={{ userSelect: "none", }} m={theme.spacing(1)}>
      <Button
        className="btn update"
        onClick={zoomOut}
      >
        Zoom Out
      </Button>
    {/* <ResponsiveContainer width="100%" height="100%"> */}
      <LineChart
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
                <stop offset="1%" stopColor="#ae1313" stopOpacity={0.9}/>
                <stop offset="25%" stopColor="#36db24" stopOpacity={0.95}/>
                <stop offset="50%" stopColor="#137bae" stopOpacity={0.7}/>
                <stop offset="85%" stopColor="#b857ef" stopOpacity={0.5}/>
              </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          allowDataOverflow
          // dataKey="name"
          // style={{margin: "50px"}}
          dataKey="time"
          domain={[state.left, state.right]}
          type="number"
          tick={<CustomizedAxisTick/>}
          tickFormatter={labelFormatter}
          interval="preserveStartEnd"
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
          contentStyle={{
            border: "none",
            padding: theme.spacing(1),
            borderRadius: theme.shape.borderRadius,
            boxShadow: theme.shadows[1],
            backgroundColor: theme.palette.secondary.dark
          }}
          labelStyle={theme.typography.body1}
          itemStyle={{
            fontSize: theme.typography.body1.fontSize,
            letterSpacing: theme.typography.body1.letterSpacing,
            fontFamily: theme.typography.body1.fontFamily,
            lineHeight: theme.typography.body1.lineHeight,
            fontWeight: theme.typography.body1.fontWeight,
            color: "white"
          }}
        />
        <Legend />
        <Line
          yAxisId="1"
          type="natural"
          dataKey="temp"
          stroke={theme.palette.secondary.light} //"#"
          dot={{ fill: `${theme.palette.secondary.main}`, strokeWidth: 0, r: 4}}
          animationDuration={300}
        />
        <Line
          yAxisId="2"
          type="natural"
          dataKey="feelsLike"
          stroke={theme.palette.secondary.main} //"#"
          dot={{ fill: `${theme.palette.secondary.main}`, stroke: `${theme.palette.secondary.main}`, r: 2}}
          animationDuration={300}
        />
        <Line
          yAxisId="2"
          type="natural"
          dataKey="humidity"
          stroke={theme.palette.primary.light} //"#"
          dot={{ fill: `${theme.palette.primary.main}`, stroke: `${theme.palette.primary.main}`, r: 2}}
          animationDuration={300}
        />
        <Line
          yAxisId="2"
          type="natural"
          dataKey="dewPoint"
          stroke={theme.palette.primary.main} //"#"
          dot={{ fill: `${theme.palette.warning.dark}`, stroke: `${theme.palette.warning.dark}`, r: 2}}
          animationDuration={300}
        />
        <Line
          yAxisId="2"
          type="natural"
          dataKey="pop"
          stroke={theme.palette.primary.main} //"#"
          dot={{ fill: `${theme.palette.primary.main}`, stroke: `${theme.palette.primary.main}`, r: 2}}
          animationDuration={300}
        />
        <Line
          yAxisId="2"
          type="natural"
          dataKey="windSpeed"
          stroke={theme.palette.warning.light} //"#"
          strokeWidth={0}
          // dot={{ fill: `${theme.palette.warning.light}`, stroke: `${theme.palette.warning.light}`, r: 2}}
          dot={<CustomizedDot stroke={theme.palette.warning.light} r={0}/>}
          // animationDuration={300}
        />
        <Line
          yAxisId="2"
          type="natural"
          dataKey="pressure"
          stroke={theme.palette.warning.main} //"#"
          dot={{ fill: `${theme.palette.warning.main}`, stroke: `${theme.palette.warning.main}`, r: 2}}
          animationDuration={300}
        />
        {state.refAreaLeft && state.refAreaRight ? (
          <ReferenceArea
            yAxisId="1"
            x1={state.refAreaLeft}
            x2={state.refAreaRight}
            strokeOpacity={0.3}
          />
        ) : null}
      </LineChart>
      {/* </ResponsiveContainer> */}
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