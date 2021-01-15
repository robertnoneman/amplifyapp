import React, {useState, useEffect, useCallback} from "react";
import PropTypes from "prop-types";
import {Box, Typography, withTheme} from "@material-ui/core";
import Axios from "axios";
//import { Fragment } from "react";
import NwsIcons from "../components/NwsIcons"
import Timeline from "@material-ui/lab/Timeline";
import TimelineItem from '@material-ui/lab/TimelineItem';
import TimelineSeparator from '@material-ui/lab/TimelineSeparator';
import TimelineConnector from '@material-ui/lab/TimelineConnector';
import TimelineContent from '@material-ui/lab/TimelineContent';
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent';
import TimelineDot from '@material-ui/lab/TimelineDot';
import CardChart from "../components/CardChart"

function WeatherComponent(props) {
  const { theme } = props;
  const [hourlyData, setHourlyData] = useState({
    number: [],
    name: [],
    startTime: [],
    endTime: [],
    isDaytime: [],
    temperature: [],
    temperatureUnit: [],
    temperatureTrend: [],
    windSpeed: [],
    windDirection: [],
    icon: [],
    shortForecast: [],
    detailedForecast: [],
    tempChartData: []
  });

  const fetchWeatherData = useCallback(() => {
    Axios.get('https://api.weather.gov/gridpoints/LWX/97,70/forecast/hourly')
      .then((data) => {
        const hourlyData = data.data.properties.periods;
        //const hourlyDataText = Object.keys(hourlyData[0]);
        const hourDataTemp = [];
        const hourNum = [];
        const hourName = [];
        const hourstartTime = [];
        const hourStartTimeSec =[];
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
          hourName.push(hourlyData[i].name);
          hourstartTime.push(hourlyData[i].startTime);
          hourStartTimeSec.push(new Date(hourlyData[i].startTime).valueOf()/1000);
          //String DATE_FORMAT_PATTERN = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
          hourendTime.push(hourlyData[i].endTime);
          hourisDaytime.push(hourlyData[i].isDaytime);
          hourtemperature.push(hourlyData[i].temperature);
          hourtemperatureUnit.push(hourlyData[i].temperatureUnit);
          hourtemperatureTrend.push(hourlyData[i].temperatureTrend);
          hourwindSpeed.push(hourlyData[i].windSpeed);
          hourwindDirection.push(hourlyData[i].windDirection);
          var tempIcon = NwsIcons(hourlyData[i].icon, hourlyData[i].isDaytime);
          houricon.push(tempIcon);
          hourshortForecast.push(hourlyData[i].shortForecast);
          hourdetailedForecast.push(hourlyData[i].detailedForecast);
          let seconds = Date.parse(hourlyData[i].startTime);
          //console.log(seconds)
          hourtempChartData.push({
            value: hourlyData[i].temperature,
            timestamp: seconds / 1000 //hourlyData[i].startTime
          })
          // console.log(`Fetched hourly forecast number: ${hourlyData[i].number}`)
          // console.log(`Pushing hourly data ${i} shortForecast: ${hourlyData[i].shortForecast}`)
        }
        // console.log(`Hour data state: ${hourData[1].shortForecast}`)
        setHourlyData({
          number: hourNum,
          name: hourName,
          startTime: hourstartTime,
          timestamp: hourStartTimeSec,
          endTime: hourendTime,
          isDaytime: hourisDaytime,
          temperature: hourtemperature,
          temperatureUnit: hourtemperatureUnit,
          temperatureTrend: hourtemperatureTrend,
          windSpeed: hourwindSpeed,
          windDirection: hourwindDirection,
          icon: houricon,
          shortForecast: hourshortForecast,
          detailedForecast: hourdetailedForecast,
          tempChartData: hourtempChartData
        });
      });
  }, [setHourlyData]);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  return (
    <div>
              {/* HOURLY FORECAST */}
      <Box>
        {hourlyData.tempChartData.length >= 2 && (
          <CardChart 
          data={hourlyData.tempChartData}
          color={theme.palette.common.black}
          height="370px"
          title="Hourly Temperature"
          />
        )}

        <Timeline >
          {hourlyData.shortForecast.map((element, index) => (
            <TimelineItem key={index} data-aos="zoom-in-up">
              <TimelineOppositeContent>
                <Typography variant="body2" className="text-white">
                  {hourlyData.startTime[index]}
                </Typography>
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot>
                  {hourlyData.icon[index]}
                </TimelineDot>
              <TimelineConnector/>
              </TimelineSeparator>
              <TimelineContent className="left-aligned">
                <Typography className="text-white" align="left">
                  {element}
                </Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Box>
      {/* <WeatherData data={getWeather()}/> */}
    </div>
  );
}

WeatherComponent.propTypes = {
  data: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
}

export default withTheme(WeatherComponent);