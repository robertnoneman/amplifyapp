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
  ReferenceLine,
} from "recharts";
import { Box, Button, 
  withStyles, 
  Card, IconButton, Menu, MenuItem, Grid, withWidth, isWidthDown, isWidthUp, } from "@material-ui/core";
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
    resize: "both",
    [theme.breakpoints.up('xl')]: {
      // backgroundColor: theme.palette.warning.main,
      maxWidth: "100%"
    },
    // marginTop: 10,
  },
  chartCard: {
    backgroundColor: theme.palette.common.black,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    // padding: theme.spacing(1),
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
      maxWidth: "100%",
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

function formatTime(unix, offset) {
  const seconds = unix + offset;
  const secs = seconds * 1000;
  
  return format(new Date(secs), "MMM d hh:mm:ss");
}

function labelFormatter(label, timeScale) {
  if (label === null || label < 0 || label === -Infinity || label === Infinity) return;
  // const tempLabel = label * 1000 * 1000;
  const tempLabel = label * 1000;
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
  max: "",
  averageLow: "",
  averageHigh: "",
  dailyAverageTemp: ""
};

const CustomizedDot = (props) => {
  const {
    cx, cy, stroke, payload, type, strokeColor, theme, 
  } = props;
  // if (!loaded) return;
  let windDeg = payload.windDeg;
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
  if (!windDeg || windDeg === null) {
    windDeg = 0;
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
          overflow="visible" transform={`rotate(${windDeg + 180})`} d="m12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z">
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
  const color = (source === "feelsLike" ? getRgb(20, 100, payload["feelsLike"]) : source === "tempAvg" ? getRgb(20, 100, payload["tempAvg"]) : source === "avgLow" ? getRgb(20, 100, payload["avgLow"]) : source === "avgHigh" ? getRgb(20, 100, payload["avgHigh"]) : getRgb(20, 100, payload["temp"]) );
  return (
    <svg overflow="auto" stroke={color} x={cx} y={cy} width={100} height={100} viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <circle r="100" stroke={color} strokeWidth={20}/>
      <text fontSize="100px" fill="#dddddddd" textAnchor="middle" dy={40} dx={5}
        fontFamily={theme.typography.body1.fontFamily} fontWeight="fontWeightLight">
          {source === "feelsLike" ? payload["feelsLike"] : source === "tempAvg" ? payload["tempAvg"] : source === "avgLow" ? payload["avgLow"] : source === "avgHigh" ? payload["avgHigh"] : payload["temp"]}°
      </text>
    </svg>
  );
}

const itemHeight = 200;
const options = ["Dense", "Compact"];
const dataSets = ["Minutely", "Hourly", "Daily"];

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
  const [dataset, selectDataset] = useState(false);
  // const [dataset, selectDataset] = useState("Hourly");

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

  const changeData = (o) => {
    // const { dataChoice } = o;
    selectDataset(!dataset);
  }

  useEffect(() => {
    const averages = [];
    const hrlyAverages = [];

    async function curlTest(station, startDate, endDate, dataSet, dataTypes) {
      let dataTypeString = dataTypes.join('&datatypeid=');
      const testUrl= `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=${dataSet}&datatypeid=DLY-TAVG-NORMAL&datatypeid=DLY-TMIN-NORMAL&datatypeid=DLY-TMAX-NORMAL&stationid=${station}&startdate=${startDate}&enddate=${endDate}&limit=200`;
      
      // const access_token = process.env.REACT_APP_NCDC_API_TOKEN;
      await Axios.get(testUrl, {
        headers: {
          token:'lpaFBWqsqoJMWftpmRCmdSvecTcjbUuZ'
        }
      })
      .then((res) => {
        console.log(res.data);
        let newD = new Date();
        let year = newD.getUTCFullYear();
        
        for (let i = 0; i < res.data.results.length; i++) {
          let dlyTimestamp2 = new Date(res.data.results[i].date); //.setFullYear(year)
          let dlyTimestamp = dlyTimestamp2.setFullYear(year);
          averages[i] = {
            // time: res.data.results[i].date.setFullYear(year),
            time: dlyTimestamp/1000,
            // timestampSeconds: res.data.results[i].date.setFullYear(year),
            timestampSeconds: dlyTimestamp/1000,
            timestamp: new Date(dlyTimestamp).toISOString(),
            type: res.data.results[i].datatype,
            tempAvg: (res.data.results[i].value/10).toFixed(0),
            windDeg: 0
          };
        };
        console.log(`averages: ${averages.tempAvg}`);
      })
      .catch((error) => {
        console.error(error)
      });
    }

    async function fetchHrly(station, startDate, endDate, dataSet, dataTypes) {
      let dataTypeString = dataTypes.join('&datatypeid=');
      const cdoUrl= `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=${dataSet}&datatypeid=${dataTypeString}&stationid=${station}&startdate=${startDate}&enddate=${endDate}&limit=401`;
      await Axios.get(cdoUrl, {
        headers: {
          token:'lpaFBWqsqoJMWftpmRCmdSvecTcjbUuZ'
        }
      })
      .then((res2) => {
        // hrlyAverages = res2.data;
        console.log(res2.data);
        let newD = new Date();
        let year = newD.getUTCFullYear();
        // let hlyTimestamp =
        for (let j = 0; j < res2.data.results.length; j++) {
          let hlyTimestamp2 = new Date(res2.data.results[j].date); //.setFullYear(year);
          let hlyTimestamp = hlyTimestamp2.setFullYear(year);
          hrlyAverages.push({
            timestamp: new Date(hlyTimestamp).toISOString(),
            time: hlyTimestamp/1000,
            type: res2.data.results[j].datatype,
            tempAvg: (res2.data.results[j].value/10).toFixed(0),
            windDeg: 0
          })
        };
        console.log(`Hourly Averages: ${hrlyAverages.tempAvg}`);
      })
      .catch((error) => {
        console.error(error)
      });
    }

    async function fetchData() {
      let times = {
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: ""
      }
      let tempState = {};
      const API_KEY = process.env.REACT_APP_OPEN_WEATHER_MAP_API;
      const apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${myLocation.lat}&lon=${myLocation.lon}&units=imperial&appid=${API_KEY}`;
      await Axios.get(apiUrl).then((data) => {
        const tOffset = data.data.timezone_offset;
        // console.log(tOffset);
        const minutely = data.data.minutely;
        const minutelyMerged = [];
        minutely && minutely.forEach((element, index) => {
          const dateTime = formatTime(element.dt, tOffset);
          const rawTimestamp = (element.dt + tOffset);
          minutelyMerged[index] = {
            dateTime: dateTime,
            time: rawTimestamp,
            precipitation: element.precipitation
          }
        });
        const daily = data.data.daily;
        const dailyMerged = [];
        const dailyData = [];
        daily.forEach((element, index) => {
          const rawTimestamp = (element.dt + tOffset);
          dailyMerged[index] = {
            tempMin: element.temp.min.toFixed(0),
            tempMax: element.temp.max.toFixed(0),
            pressure: (element.pressure * 0.0295300).toFixed(2),
            humidity: element.humidity,
            dewPoint: element.dew_point.toFixed(0),
            uvi: element.uvi,
            clouds: element.clouds,
            visibility: 0,
            windSpeed: element.wind_speed,
            windDeg: element.wind_deg,
            weather: element.weather,
            pop: (element.pop * 100),
            rain: element.rain,
            tempMorn:  element.temp.morn.toFixed(0),
            feelsLikeMorn: element.feels_like.morn.toFixed(0),
            timeMorn: rawTimestamp - 21600,
            temp:  element.temp.day.toFixed(0),
            feelsLike:  element.feels_like.day.toFixed(0),
            time: rawTimestamp,
            tempEve:  element.temp.eve.toFixed(0),
            feelsLikeEve: element.feels_like.eve.toFixed(0),
            timeEve: rawTimestamp + 21600,
            tempNight:  element.temp.night.toFixed(0),
            feelsLikeNight: element.feels_like.night.toFixed(0),
            timeNight: rawTimestamp + 43200,
            tempAvg: "",
            rawTimestamp: (rawTimestamp) * 1000,
            dateTime: formatTime(element.dt, 0)
          };
        });
        let dailyTempMorn = dailyMerged.map((a) => ({ 
            temp: a.tempMorn,
            feelsLike: a.feelsLikeMorn,
            time: a.timeMorn,
            rawTimestamp: a.timeMorn * 1000,
            tempMin: a.tempMin,
            tempMax: a.tempMax,
            pressure: a.pressure,
            humidity: a.humidity,
            dewPoint: a.dewPoint,
            uvi: a.uvi,
            clouds: a.clouds,
            visibility: a.visibility,
            windSpeed: a.windSpeed,
            windDeg: a.windDeg,
            weather: a.weather,
            pop: a.pop,
            rain: a.rain,
            })
          );
          let dailyTempDay = dailyMerged.map((a) => ({ 
            temp: a.temp,
            feelsLike: a.feelsLike,
            time: a.time,
            rawTimestamp: a.time * 1000,
            tempMin: a.tempMin,
            tempMax: a.tempMax,
            pressure: a.pressure,
            humidity: a.humidity,
            dewPoint: a.dewPoint,
            uvi: a.uvi,
            clouds: a.clouds,
            visibility: a.visibility,
            windSpeed: a.windSpeed,
            windDeg: a.windDeg,
            weather: a.weather,
            pop: a.pop,
            rain: a.rain,
            })
          );
          let dailyTempEve = dailyMerged.map((a) => ({ 
            temp: a.tempEve,
            feelsLike: a.feelsLikeEve,
            time: a.timeEve,
            rawTimestamp: a.timeEve * 1000,
            tempMin: a.tempMin,
            tempMax: a.tempMax,
            pressure: a.pressure,
            humidity: a.humidity,
            dewPoint: a.dewPoint,
            uvi: a.uvi,
            clouds: a.clouds,
            visibility: a.visibility,
            windSpeed: a.windSpeed,
            windDeg: a.windDeg,
            weather: a.weather,
            pop: a.pop,
            rain: a.rain,
            })
          );
          let dailyTempNight = dailyMerged.map((a) => ({ 
            temp: a.tempNight,
            feelsLike: a.feelsLikeNight,
            time: a.timeNight,
            rawTimestamp: a.timeNight * 1000,
            tempMin: a.tempMin,
            tempMax: a.tempMax,
            pressure: a.pressure,
            humidity: a.humidity,
            dewPoint: a.dewPoint,
            uvi: a.uvi,
            clouds: a.clouds,
            visibility: a.visibility,
            windSpeed: a.windSpeed,
            windDeg: a.windDeg,
            weather: a.weather,
            pop: a.pop,
            rain: a.rain,
            })
          );
          dailyTempMorn.forEach((d) => {
           dailyData.push(d) 
          });
          dailyTempDay.forEach((d) => {
            dailyData.push(d) 
          });
          dailyTempEve.forEach((d) => {
            dailyData.push(d) 
          });
          dailyTempNight.forEach((d) => {
            dailyData.push(d) 
          });          
          dailyData.sort(function(a, b){return a.time - b.time});

        const hourly = data.data.hourly;
        const merged = [];
        const tempMinMax = [];
        hourly.forEach((element, index) => {
          const rawTimestamp = element.dt + tOffset;
          const dateTime = formatTime(element.dt, tOffset);
          const timestamp = (element.dt);
          tempMinMax.push(element.temp);
          merged[index] = {
            dateTIme: dateTime,
            rawTimestamp: rawTimestamp * 1000,
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
            tempAvg: ""
            };
        });
        let refData = Array.from(merged);
        let longRefData = Array.from(dailyData);
        let ref = "temp";
        let timeRef = "rawTimestamp";
        let startTimeTemp = new Date(refData[0][timeRef]);
        // let endTimeTemp = new Date(refData[refData.length-1][timeRef]);
        let endTimeTemp = new Date(longRefData[longRefData.length-1][timeRef]);
        startTimeTemp.setFullYear(2010);
        endTimeTemp.setFullYear(2010);
        var startTimeIso = startTimeTemp.toISOString();
        var endTimeIso = endTimeTemp.toISOString();
        var finalStartTime = startTimeIso.slice(0,19);
        var finalEndTime = endTimeIso.slice(0,19);
        // console.log(`Start times and end times: ${startTimeIso}, ${endTimeIso}, ${finalStartTime}, ${finalEndTime}`)
        times = {
          startDate: format(new Date(refData[0][timeRef]), "MM-dd"),
          endDate: format(new Date(refData[refData.length-1][timeRef]), "MM-dd"),
          startTime: finalStartTime,
          endTime: finalEndTime,
        }
        // console.log(`Times object: ${times['startDate']}, ${times['endDate']}`);
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
        const dailyTempMinMax = dailyData.map(a => a.temp);
        const dailyFeelsMinMax = dailyData.map(a => a.feelsLike);
        const dailyTempMin = Math.min(...dailyTempMinMax);
        const dailyTempMax = Math.max(...dailyTempMinMax);
        const dailyFeelsMin = Math.min(...dailyFeelsMinMax);
        const dailyFeelsMax = Math.max(...dailyFeelsMinMax);
        console.log(`Daily temp min: ${dailyTempMin}; Daily temp max: ${dailyTempMax}; Daily feelsLike min: ${dailyFeelsMin}; Daily feelsLikeMax: ${dailyFeelsMax}`);
        tempState = {
          ...tempState,
          data: merged.slice(), 
          dailyData: dailyData.slice(), 
          minutelyData: minutelyMerged.slice(), 
          // allData: [minutelyMerged.slice(), merged.slice(), dailyMerged.slice()],
          min: bottomColor,
          max: topColor,
          feelsLikeMin: bottomColor2,
          feelsLikeMax: topColor2,
          dailyTempMin: getRgb(20, 100, dailyTempMin),
          dailyTempMax: getRgb(20, 100, dailyTempMax),
          dailyFeelsMin: getRgb(20, 100, dailyFeelsMin),
          dailyFeelsMax: getRgb(20, 100, dailyFeelsMax),
        }
      });
      await curlTest('GHCND:USC00186350', times['startTime'], times['endTime'], 'NORMAL_DLY', ['DLY-TAVG-NORMAL', 'DLY-TMIN-NORMAL', 'DLY-TMAX-NORMAL'])
      .then(() => {
        function filterdAvg(value, index, array) {
          return value['type'] === 'DLY-TAVG-NORMAL';
        }
        function filterdLows(value, index, array) {
          return value['type'] === 'DLY-TMIN-NORMAL';
        }
        function filterdHighs(value, index, array) {
          return value['type'] === 'DLY-TMAX-NORMAL';
        }
        let temptempdAvg = averages.filter(filterdAvg);
        let temptempdLow = averages.filter(filterdLows);
        let temptempdHigh = averages.filter(filterdHighs);
        const dAvg = temptempdAvg.map(a => a.tempAvg);
        const dLow = temptempdLow.map(a => a.tempAvg);
        const dHigh = temptempdHigh.map(a => a.tempAvg);
        
        for (let j = 0; j < tempState.dailyData.length; j++) {
          let tempDay = tempState.dailyData[j];
          if (j < 4) {
            tempDay = {
              ...tempDay,
             tempAvg: temptempdAvg[0].tempAvg,
             avgLow: temptempdLow[0].tempAvg,
             avgHigh: temptempdHigh[0].tempAvg
            //  time: hrlyAverages[i].time
            }}
            else if (j < 8) {
              tempDay = {
                ...tempDay,
               tempAvg: temptempdAvg[1].tempAvg,
               avgLow: temptempdLow[1].tempAvg,
               avgHigh: temptempdHigh[1].tempAvg
              //  time: hrlyAverages[i].time
              }}
            else if (j < 12) {
                  tempDay = {
                    ...tempDay,
                   tempAvg: temptempdAvg[2].tempAvg,
                   avgLow: temptempdLow[2].tempAvg,
                   avgHigh: temptempdHigh[2].tempAvg
                  //  time: hrlyAverages[i].time
              }}
              else if (j < 16) {
                tempDay = {
                  ...tempDay,
                 tempAvg: temptempdAvg[3].tempAvg,
                 avgLow: temptempdLow[3].tempAvg,
                 avgHigh: temptempdHigh[3].tempAvg
                //  time: hrlyAverages[i].time
                }}
              else if (j < 20) {
                    tempDay = {
                      ...tempDay,
                     tempAvg: temptempdAvg[4].tempAvg,
                     avgLow: temptempdLow[4].tempAvg,
                     avgHigh: temptempdHigh[4].tempAvg
                    //  time: hrlyAverages[i].time
                }}
                else if (j < 24) {
                    tempDay = {
                      ...tempDay,
                     tempAvg: temptempdAvg[5].tempAvg,
                     avgLow: temptempdLow[5].tempAvg,
                     avgHigh: temptempdHigh[5].tempAvg
                    //  time: hrlyAverages[i].time
                }}
                else if (j < 28) {
                tempDay = {
                  ...tempDay,
                 tempAvg: temptempdAvg[6].tempAvg,
                 avgLow: temptempdLow[6].tempAvg,
                 avgHigh: temptempdHigh[6].tempAvg
                //  time: hrlyAverages[i].time
                }}
              else if (j < 32) {
                    tempDay = {
                      ...tempDay,
                     tempAvg: temptempdAvg[7].tempAvg,
                     avgLow: temptempdLow[7].tempAvg,
                     avgHigh: temptempdHigh[7].tempAvg
                    //  time: hrlyAverages[i].time
                }}
          else tempDay = {...tempDay, tempAvg: temptempdAvg[6].tempAvg};
          tempState.dailyData[j] = tempDay;
        }
        tempState.dailyData.sort(function(a, b){return a.time - b.time});
        tempState = {
          ...tempState,
          lowestAvgDay: Math.min(...dAvg),
          highestAvgDay: Math.max(...dAvg),
          lowestLowDay: Math.min(...dLow),
          highestLowDay: Math.max(...dLow),
          lowestHighDay: Math.min(...dHigh),
          highestHighDay: Math.max(...dHigh),
        }
      })

      await fetchHrly('GHCND:USW00013743', times['startTime'], times['endTime'], 'NORMAL_HLY', ['HLY-TEMP-NORMAL', 'HLY-TEMP-10PCTL','HLY-TEMP-90PCTL'])
      .then(() => {
        function filterAvg(value, index, array) {
          return value['type'] === 'HLY-TEMP-NORMAL';
        }
        function filterLows(value, index, array) {
          return value['type'] === 'HLY-TEMP-10PCTL';
        }
        function filterHighs(value, index, array) {
          return value['type'] === 'HLY-TEMP-90PCTL';
        }

        let temptempAvg = hrlyAverages.filter(filterAvg);
        let temptempLow = hrlyAverages.filter(filterLows);
        let temptempHigh = hrlyAverages.filter(filterHighs);
        
        const lowestAvg = temptempAvg.map(a => a.tempAvg);
        const highestAvg = temptempAvg.map(a => a.tempAvg);
        const lowestLow = temptempLow.map(a => a.tempAvg);
        const highestLow = temptempLow.map(a => a.tempAvg);
        const lowestHigh = temptempHigh.map(a => a.tempAvg);
        const highestHigh = temptempHigh.map(a => a.tempAvg);
        
        for (let i = 0; i < tempState.data.length; i++) {
          let tempHr = tempState.data[i];
          tempHr = {
            ...tempHr,
           tempAvg: temptempAvg[i].tempAvg,
           avgLow: temptempLow[i].tempAvg,
           avgHigh: temptempHigh[i].tempAvg,
          //  tempAvgDay: temptempdAvg[i].tempAvg,
          //  avgLowDay: temptempdLow[i].tempAvg,
          //  avgHighDay: temptempHigh[i].tempAvg
          //  time: hrlyAverages[i].time
          }
          tempState.data[i] = tempHr;
        }
        var increment = 0;
        for (let i = 0; i < tempState.data.length; i++) {
          let tempHr = tempState.dailyData[i];
          if (increment > 20) increment = 0;
          tempHr = {
            ...tempHr,
           tempAvg: temptempAvg[i+increment].tempAvg,
           avgLow: temptempLow[i+increment].tempAvg,
           avgHigh: temptempHigh[i+increment].tempAvg,
          //  tempAvgDay: temptempdAvg[i].tempAvg,
          //  avgLowDay: temptempdLow[i].tempAvg,
          //  avgHighDay: temptempHigh[i].tempAvg
          //  time: hrlyAverages[i].time
          }
          tempState.dailyData[i] = tempHr;
          increment += 5;
        }
        
        tempState.data.sort(function(a, b){return a.time - b.time});
        tempState.dailyData.sort(function(a, b){return a.time - b.time});
        
        // console.log(hrlyAverages);
        setState({
          ...state,
          ...tempState,
          hlyAverages: hrlyAverages,
          dlyAverages: averages,
          dailyAverageTemp: averages[0]['temp'],
          averageLow: averages[2]['temp'],
          averageHigh: averages[1]['temp'],
          lowestAvg: Math.min(...lowestAvg),
          highestAvg: Math.max(...highestAvg),
          lowestLow: Math.min(...lowestLow),
          highestLow: Math.max(...highestLow),
          lowestHigh: Math.min(...lowestHigh),
          highestHigh: Math.max(...highestHigh),
        })
      })
      setLoaded(true);
    }
    fetchData();
  },
    [setState]
  )

  const isOpen = Boolean(anchorEl);

  return (
    <>
    <Grid container direction="row" justify="space-between" spacing={3} style={{ marginBottom: 5, }} >
    {/* <Grid container item> */}
      <Grid item xs={12} lg={12} xl={6} style={{ marginTop: "10px", }}>
        <Card className={classes.chartCard}>
          <Box display="flex" justifyContent="space-between">
            <Button className="btn update" onClick={zoomOut}>
              Zoom Out
            </Button>
            <Button className="btn update" onClick={changeData}>
              {dataset ? "Switch to hourly" : "Switch to daily"}
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
                // data={dataset === "Daily" ? state.dailyData : dataset === "Hourly" ? state.data : state.minutelyData}
                data={dataset ? state.dailyData : state.data }
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
                  <linearGradient id="heatmapUvDaily" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={state.dailyTempMax} stopOpacity={state.activeArea === "temp" ? 0.95 : 0.3}/>
                    <stop offset="100%" stopColor={state.dailyTempMin} stopOpacity={state.activeArea === "temp" ? 0.5 : 0.1}/>
                  </linearGradient>
                  <linearGradient id="feelsLikeUvDaily" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={state.dailyFeelsMax} stopOpacity={state.activeArea === "feelsLike" ? 0.95 : 0.3}/>
                    <stop offset="100%" stopColor={state.dailyFeelsMin} stopOpacity={state.activeArea === "feelsLike" ? 0.5 : 0.1}/>
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
                  <linearGradient id="averageTempsUv" x1="1" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={getRgb(20, 100, state.highestAvg)} stopOpacity={0.2}/>
                    <stop offset="100%" stopColor={getRgb(20, 100, state.lowestAvg)} stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="avgLowTempsUv" x1="1" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={getRgb(20, 100, state.highestLow)} stopOpacity={0.2}/>
                    <stop offset="100%" stopColor={getRgb(20, 100, state.lowestLow)} stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="avgHighTempsUv" x1="1" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={getRgb(20, 100, state.highestHigh)} stopOpacity={0.2}/>
                    <stop offset="100%" stopColor={getRgb(20, 100, state.lowestHigh)} stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="averageTempsUvActive" x1="1" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={getRgb(20, 100, state.highestAvg)} stopOpacity={0.5}/>
                    <stop offset="100%" stopColor={getRgb(20, 100, state.lowestAvg)} stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="avgLowTempsUvActive" x1="1" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={getRgb(20, 100, state.highestLow)} stopOpacity={0.5}/>
                    <stop offset="100%" stopColor={getRgb(20, 100, state.lowestLow)} stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="avgHighTempsUvActive" x1="1" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={getRgb(20, 100, state.highestHigh)} stopOpacity={0.5}/>
                    <stop offset="100%" stopColor={getRgb(20, 100, state.lowestHigh)} stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="averageTemps" x1="1" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={getRgb(20, 100, state.averageHigh)} stopOpacity={0.5}/>
                    <stop offset="50%" stopColor={getRgb(20, 100, state.dailyAverageTemp)} stopOpacity={0.25}/>
                    <stop offset="100%" stopColor={getRgb(20, 100, state.averageLow)} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} horizontal={false} />
                {/* <ReferenceArea y1={state.averageLow} y2={state.averageHigh} yAxisId="1" 
                  fill="url(#averageTempsUv)" stroke="url(#averageTempsUv)" strokeWidth={1}
                  // alwaysShow={true}
                  ifOverflow="extendDomain"
                  // label={state.averageHigh}
                /> */}
                
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
                  dataKey="avgHigh"
                  unit="°"
                  activeDot={ <HeatmapDot theme={theme} source="avgHigh" />} 
                  animationDuration={1200}
                  onMouseEnter={() =>
                    setState({
                      ...state,
                      activeArea: "avgHigh",
                    })
                  }
                  onMouseOut={() =>
                    setState({
                      ...state,
                      activeArea: "",
                      activeColor: "#0000000"
                    })
                  }
                  strokeWidth={state.activeArea === "avgHigh" ? 2 : 1 }
                  stroke={state.activeArea === "avgHigh" ? "url(#avgHighTempsUvActive)" : "url(#avgHighTempsUv)"}
                  fill={state.activeArea === "avgHigh" ? "url(#avgHighTempsUvActive)" : "url(#avgHighTempsUv)"}
                  hide={hideArea.hidden.avgHigh}
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
                  stroke={dataset ? "url(#heatmapUvDaily)" : "url(#activeHeatmapUv)"}
                  fill={state.activeArea === "temp" && !dataset ? "url(#activeHeatmapUv)" : dataset ? "url(#heatmapUvDaily)" : "url(#inactiveHeatmapUv)"}
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
                  stroke={dataset ? "url(#feelsLikeUvDaily)" : "url(#feelsLikeUv)"}
                  fill={state.activeArea === "feelsLike" && !dataset ? "url(#feelsLikeUv)" :  dataset ? "url(#feelsLikeUvDaily)" : "url(#inactiveFeelsLikeUv)"}
                  hide={hideArea.hidden.feelsLike}
                />
                <Area
                  yAxisId="1"
                  type="natural"
                  dataKey="tempAvg"
                  unit="°"
                  activeDot={ <HeatmapDot theme={theme} source="tempAvg" />} 
                  animationDuration={1200}
                  onMouseEnter={() =>
                    setState({
                      ...state,
                      activeArea: "tempAvg",
                    })
                  }
                  onMouseOut={() =>
                    setState({
                      ...state,
                      activeArea: "",
                      activeColor: "#0000000"
                    })
                  }
                  strokeWidth={state.activeArea === "tempAvg" ? 2 : 1 }
                  stroke={state.activeArea === "tempAvg" ? "url(#averageTempsUvActive)" : "url(#averageTempsUv)"}
                  fill={state.activeArea === "tempAvg" ? "url(#averageTempsUvActive)" : "url(#averageTempsUv)"}
                  hide={hideArea.hidden.tempAvg}
                />
                <Area
                  yAxisId="1"
                  type="natural"
                  dataKey="avgLow"
                  unit="°"
                  activeDot={ <HeatmapDot theme={theme} source="avgLow" />} 
                  animationDuration={1200}
                  onMouseEnter={() =>
                    setState({
                      ...state,
                      activeArea: "avgLow",
                    })
                  }
                  onMouseOut={() =>
                    setState({
                      ...state,
                      activeArea: "",
                      activeColor: "#0000000"
                    })
                  }
                  strokeWidth={state.activeArea === "avgLow" ? 2 : 1 }
                  stroke={state.activeArea === "avgLow" ? "url(#avgLowTempsUvActive)" : "url(#avgLowTempsUv)"}
                  fill={state.activeArea === "avgLow" ? "url(#avgLowTempsUvActive)" : "url(#avgLowTempsUv)"}
                  hide={hideArea.hidden.avgLow}
                />
                
                {/* {state.dailyAverageTemp > 0 && <ReferenceLine yAxisId="1" y={state.dailyAverageTemp} strokeWidth={2} stroke="#d91dd020" strokeDasharray="3 3" ifOverflow="extendDomain"/>} */}
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
    {/* </Grid> */}

    {/* <Grid container item> */}
      <Grid item xs={12} lg={12} xl={6} style={isWidthUp('xl', width, true) ? { marginTop: "10px" } : { } }>
        <Card className={classes.chartCard} style={{  }} >
        {isWidthUp('xl', width, true) && 
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
          </Box> }
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
    {/* </Grid > */}
    </Grid>

    <Box height={height} width="100%" display="flex"
      style={{ backgroundColor: theme.palette.common.black, 
      userSelect: "none",
      marginBottom: 10
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
        xs={12}
        justifyContent="center"
        alignItems={isWidthUp('lg', width, true) ? "center" : "flex-start" }
    >
      <AreaChart
        width={isWidthUp('xl', width, true) ? 1800 : 1200} //{1200}
        height={isWidthUp('xl', width, true) ? height : 200} //{200}
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
          align={isWidthUp("md", width) ? "center" : "left"}
          verticalAlign={isWidthUp("md", width) ? "top" : "bottom" }
          wrapperStyle={isWidthUp("md", width) ? { fontSize: 12 } : { fontSize: 12, left: 80 }}
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

export default withStyles(styles, { withTheme: true })(withWidth()(HourlyForecast));

/*

... From setting the daily data ... ~Line 558
          // dailyMerged[index] = {
          //   time: rawTimestamp,
          //   rawTimestamp: rawTimestamp * 1000,
          //   dateTime: dateTime,
          //   tempMorn: element.temp.morn.toFixed(0),
          //   temp: element.temp.day.toFixed(0),
          //   tempEve: element.temp.eve.toFixed(0),
          //   tempNight: element.temp.night.toFixed(0),
          //   tempMin: element.temp.min.toFixed(0),
          //   tempMax: element.temp.max.toFixed(0),
          //   feelsLike: element.feels_like.day.toFixed(0),
          //   pressure: (element.pressure * 0.0295300).toFixed(2),
          //   humidity: element.humidity,
          //   dewPoint: element.dew_point.toFixed(0),
          //   uvi: element.uvi,
          //   clouds: element.clouds,
          //   visibility: element.visibility,
          //   windSpeed: element.wind_speed,
          //   windDeg: element.wind_deg,
          //   weather: element.weather,
          //   pop: (element.pop * 100),
          //   // element
          // }

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
*/
