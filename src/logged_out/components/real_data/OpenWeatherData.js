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
  ReferenceArea
} from "recharts";
import { withStyles } from "@material-ui/core";
import Axios from "axios";
import format from "date-fns/format";

const styles = (theme) => ({
  card: {
    backgroundColor: theme.palette.common.black,
  }
});
// Returns hello.
// unix => "hello";

function formatTime(unix, offset) {
  const secs = unix * 1000;
  const seconds = secs - offset;
  return format(new Date(seconds), "MMM d hh:mm:ss");
}

function labelFormatter(label) {
  // const secs = label * 1000;
  // const seconds = secs - 18000;
  if (label === null || label < 0 || label === -Infinity || label === Infinity) return;
  const tempLabel = label * 1000 * 1000;
  // console.log(`Time label: ${label}`);
  return format(new Date(tempLabel), "MMM d, p");
}

function CustomizedAxisTick(props) {
  const {x, y, payload} = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={0} textAnchor="end" fill="#666" fontSize={10} transform="rotate(-15)">{labelFormatter(payload.value)}</text>
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
  left: "dataMin",
  right: "dataMax",
  refAreaLeft: "",
  refAreaRight: "",
  top: "dataMax+1",
  bottom: "dataMin-1",
  top2: "dataMax+20",
  bottom2: "dataMin-20",
  animation: true
};

function HourlyForecast(props) {
  const { title, classes, theme } = props;
  const [state, setState] = useState(initialStateData);
  const [loaded, setLoaded] = useState(false);
  const getAxisYDomain = (data, from, to, ref, offset) => {
    // console.log(data[0][ref]);
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
      // switch(title){
      //   case (poop):
      // }
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
    if (state.data === null || !state.data) console.log(`WTF WHERE IS THE DATA ${state.data}`);
    console.log(`WTF WHERE IS THE DATA ${state.data[0].temp}`);
    const [bottom, top] = getAxisYDomain(
      state.data,
      refAreaLeft,
      refAreaRight,
      "temp",
      1
    );
    const [bottom2, top2] = getAxisYDomain(
      data,
      refAreaLeft,
      refAreaRight,
      "humidity",
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
      top2: "dataMax+50",
      bottom2: "dataMin+50"
    })
  }, [state, setState]);

  const fetchWeatherData = useCallback(() => {
    if (loaded) return;
    const apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${myLocation.lat}&lon=${myLocation.lon}&units=imperial&appid=39216f4b9137de2e4d5f35aa5bdbde04`;
    Axios.get(apiUrl).then((data) => {
      const tOffset = data.data.timezone_offset;
      const hourly = data.data.hourly;
      const merged = [];
      hourly.forEach((element, index) => {
        const timestamp = formatTime(element.dt, tOffset);
        const rawTimestamp = (element.dt - tOffset) / 1000;
        merged[index] = {
          // time: timestamp,
          time: rawTimestamp,
          temp: element.temp,
          humidity: element.humidity,
        };
      });
      // setFetchedData(merged);
      setState({...state, data: merged.slice()})
      setLoaded(true);
    });
  }, [loaded, setLoaded]);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  return (
    <div className="highlight-bar-charts" style={{ userSelect: "none", margin: "100px" }}>
      <button 
        className="btn update"
        onClick={zoomOut}
      >
        Zoom Out
      </button>

      <LineChart
        width={800}
        height={400}
        data={state.data}
        onMouseDown={(e) =>
          setState({
            ...state,
            refAreaLeft: e.activeLabel,
          })
        }
        onMouseMove={(e) =>
          state.refAreaLeft &&
          setState({
            ...state,
            refAreaRight: e.activeLabel,
          })
        }
        onMouseUp={zoom}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          allowDataOverflow
          // dataKey="name"
          style={{margin: "50px"}}
          dataKey="time"
          domain={[state.left, state.right]}
          type="number"
          tick={<CustomizedAxisTick/>}
          tickFormatter={labelFormatter}
        />
        <YAxis
          allowDataOverflow
          domain={[state.bottom, state.top]}
          type="number"
          yAxisId="1"
        />
        <YAxis
          orientation="right"
          allowDataOverflow
          domain={[state.bottom2, state.top2]}
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
            backgroundColor: theme.palette.primary.main
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
        <Line
          yAxisId="1"
          type="natural"
          dataKey="temp"
          stroke="#8884d8"
          animationDuration={300}
        />
        <Line
          yAxisId="2"
          type="natural"
          dataKey="humidity"
          stroke="#82ca9d"
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
    </div>
  );
}

export default withStyles(styles, { withTheme: true })(HourlyForecast);