import React from "react";
import PropTypes from "prop-types";
import {Typography} from "@material-ui/core";

const cheerio = require('cheerio')
const axios = require('axios')
const dummyData = 'IM A FAKE FORECAST LOOK AT ME'



const WeatherData = (props) => {
  const {data} = props;
  if (!data) return <p>No data, sorry</p>
  return <Typography>{data}</Typography>
}

function getWeather() {
  // const { data } = props;
  axios.get('https://forecast.weather.gov/product.php?site=NWS&issuedby=LWX&product=AFD').then((response) => {
    const $ = cheerio.load(response.data)
    const afd = $('pre.glossaryProduct')
    if (afd) {
      const afdText = afd.text();
      const text = afdText;
      //console.log(text);
      //data = afdText;
      // console.log(afdText);
      // return afdText;
      return text;
    }
    else 
    {
      return $('pre.glossaryProduct').text();
    }
    // console.log(response.data);
  })
}

function WeatherComponent(props) {
  const { data } = props;

  return (
    <div>
      <Typography>
        {props.data}
        {getWeather(data)}
        {data}
        THE FORECAST SHOULD GO HERE
        {dummyData}
      </Typography>
      <WeatherData data={getWeather()}/>
    </div>
  );
}

WeatherComponent.propTypes = {
  data: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
}

export default WeatherComponent;