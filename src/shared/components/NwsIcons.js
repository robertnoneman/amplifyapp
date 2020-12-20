import { faCloudSun, faSun, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { 
    WiDaySunnyOvercast, 
    WiDayCloudyHigh,
    WiDust, 
    WiCloudy, 
    WiDayWindy, 
    WiDayCloudyWindy, 
    WiDayCloudyGusts,
    WiCloudyWindy,
    WiSnow,
    WiRain,
    WiRainMix,
    WiDaySleet,
    WiSleet,
    WiShowers,
    WiThunderstorm,
    WiTornado,
    WiHurricane,
    WiStormWarning,
    WiSmoke,
    WiDayHaze,
    WiHot,
    WiSnowflakeCold,
    WiSnowWind,
    WiFog,
    WiNightClear,
    WiNightAltCloudy, WiNightPartlyCloudy, WiNightAltPartlyCloudy,
 } from "weather-icons-react";

export default function NwsIcons(iconURL, isDay) {
    if(!iconURL) return;

    //console.log(iconURL);
    const iconCodeTest = new RegExp(/((day|night)(\/)([a-z]*))/, 'gm');
    const iconCodeResult = iconCodeTest.exec(iconURL);

    // iconCodeResult.forEach((match, groupIndex) => {
    //     console.log(`Found match in icon code, group ${groupIndex}: ${match}`);
    // });

    const iconCode = iconCodeResult[4];
    // console.log(`Icon code result is ${iconCodeResult} and icon code is ${iconCode}`);

    switch (iconCode) {
        case "skc": {
            if (!isDay) {
                return <WiNightClear size={24}/>;
            } 
            return <FontAwesomeIcon icon={faSun} size="lg"/>;
        }
        case "few": {
            return (isDay? <WiDaySunnyOvercast size={24}/> : <WiNightAltPartlyCloudy size={24}/>)
            //altIcon: <FontAwesomeIcon icon={faCloudSun}/>
        }
        case "sct": {
            //"description": "Partly cloudy",
            if (!isDay) { return <WiNightPartlyCloudy size={24}/>;}
            return <FontAwesomeIcon icon={faCloudSun} size="lg"/>
        }
        case "bkn": {
            //"description": "Mostly cloudy",
            if (!isDay) {return <WiNightAltCloudy size={24}/>;}
            else return <WiDayCloudyHigh size={24}/>
        }
        case "ovc": {
            //"description": "Overcast",
            return <WiCloudy size={24}/>
        }
        case "wind_skc": {
            //"description": "Fair/clear and windy",
            return <WiDayWindy size={24}/>
        }
        case "wind_few": {
            //"description": "A few clouds and windy",
            return <WiDayCloudyWindy size={24}/>
        }
        case "wind_sct": {
            //"description": "Partly cloudy and windy",
            return <WiDayCloudyGusts size={24}/>
        }
        case "wind_bkn": {
            //"description": "Mostly cloudy and windy",
            return <WiDayCloudyGusts size={24}/>
        }
        case "wind_ovc": {
            //"description": "Overcast and windy",
            return <WiCloudyWindy size={24}/>
        }
        case "snow": {
            //"description": "Snow",
            return <WiSnow size={24}/>
        }
        case "rain_snow": {
            //"description": "Rain/snow",
            return <WiRainMix size={24}/>
        }
        case "rain_sleet": {
            //"description": "Rain/sleet",
            return <WiDaySleet size={24}/>
        }
        case "snow_sleet": {
            //"description": "Snow/sleet",
            return <WiSleet size={24}/>
        }
        case "fzra": {
            //"description": "Freezing rain",
            return <WiRainMix size={24}/>
        }
        case "rain_fzra": {
            //"description": "Rain/freezing rain",
            return <WiRainMix size={24}/>
        }
        case "snow_fzra": {
            //"description": "Freezing rain/snow",
            return <WiRainMix size={24}/>
        }
        case "sleet": {
            //"description": "Sleet",
            return <WiSleet size={24}/>
        }
        case "rain": {
            //"description": "Rain",
            return <WiRain size={24}/>
        }
        case "rain_showers": {
            //"description": "Rain showers (high cloud cover)",
            return <WiShowers size={24}/>
        }
        case "rain_showers_hi": {
            //"description": "Rain showers (low cloud cover)",
            return <WiShowers size={24}/>
        }
        case "tsra": {
            //"description": "Thunderstorm (high cloud cover)",
            return <WiThunderstorm size={24}/>
        }
        case "tsra_sct": {
            //"description": "Thunderstorm (medium cloud cover)",
            return <WiThunderstorm size={24}/>
        }
        case "tsra_hi": {
            //"description": "Thunderstorm (low cloud cover)",
            return <WiThunderstorm size={24}/>
        }
        case "tornado": {
            //"description": "Tornado",
            return <WiTornado size={24}/>
        }
        case "hurricane": {
            //"description": "Hurricane conditions",
            return <WiHurricane size={24}/>
        }
        case "tropical_storm": {
            //"description": "Tropical storm conditions",
            return <WiStormWarning size={24}/>
        }
        case "dust": {
            //"description": "Dust",
            return <WiDust size={24}/>
        }
        case "smoke": {
            //"description": "Smoke",
            return <WiSmoke size={24}/>
        }
        case "haze": {
            //"description": "Haze",
            return <WiDayHaze size={24}/>
        }
        case "hot": {
            //"description": "Hot",
            return <WiHot size={24}/>
        }
        case "cold": {
            //"description": "Cold",
            return <WiSnowflakeCold size={24}/>
        }
        case "blizzard": {
            //"description": "Blizzard",
            return <WiSnowWind size={24}/>
        }
        case "fog": {
            //"description": "Fog/mist",
            return <WiFog size={24}/>
        }
        default: return <FontAwesomeIcon icon={faExclamationCircle} />
    }
}