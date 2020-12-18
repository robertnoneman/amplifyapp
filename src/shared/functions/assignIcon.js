import React from "react";
//import PropTypes from "prop-types";

import { AcUnit, NightsStayTwoTone, Brightness3, Brightness5, Brightness7, CloudCircle, CloudQueue, FilterDrama, Flare, Grain, Warning, WbCloudy, WbSunny, FilterDramaTwoTone, CloudTwoTone, Cloud } from "@material-ui/icons";
//import weatherIcons from "weather-icons"

export default function assignIcon(iconKey, isDaytime) {
    var icon = null;
    var iconName = "";
    var isRainyTest = new RegExp(/Rain/, 'gm');
    var isSnowyTest = new RegExp(/Snow/, 'gm')
    if (isDaytime)
    {
        iconName.concat('day')
    }
    else iconName.concat('night')

    if (isRainyTest.exec(iconKey))
    {
        iconKey = "Rain";
        iconName = iconName.concat('Rain');
    }
    if (isSnowyTest.exec(iconKey))
    {
        iconKey = "Snow";
        iconName = iconName.concat('Snow');
    }
    if (isDaytime) iconName = "day";
    switch (iconKey) {
        case "Sunny": {
            icon = <WbSunny htmlColor="#ffe747"/>;
            // if (isDaytime) iconName = 'day'; 
            // iconName = iconName.concat('Sunny');
            //else iconName = '';;
            break;
        }
        case "Mostly Sunny": {
            icon = <Flare htmlColor="#ffe747"/>;
            // if (isDaytime) iconName = 'day'; 
            iconName = iconName.concat('Sunny');
            break;
        }
        case "Partly Sunny": {
            icon = <Brightness7 htmlColor="#ffe747"/>;
            // if (isDaytime) iconName = 'day'; 
            iconName = iconName.concat('Sunny');
            break;
        }
        case "Cloudy": {
            icon = <Cloud htmlColor="#c5d2d8"/>;
            // if (isDaytime) iconName = 'day'; 
            iconName = iconName.concat('Cloudy');
            break;
        }
        case "Partly Cloudy": {
            icon = <FilterDramaTwoTone htmlColor="#c2ced0"/>;
            // if (isDaytime) iconName = 'day'; 
            iconName = iconName.concat('Cloudy');
            break;
        }
        case "Mostly Cloudy": {
            icon = <Cloud htmlColor="##7d7d7d"/>;
            // if (isDaytime) iconName = 'day'; 
            iconName = iconName.concat('Cloudy');
            break;
        }
        case "Mostly Clear": {
            icon = <NightsStayTwoTone htmlColor="#ffffff"/>;
            // if (isDaytime) iconName = 'day'; 
            iconName = iconName.concat('Sunny');
            break;
        }
        case "Rain": {
            icon = <Grain htmlColor="#00ccf0"/>
            // if (isDaytime) iconName = 'day'; 
            iconName = iconName.concat('Rain');
            break;
        }
        case "Snow": {
            icon = <AcUnit htmlColor="#fff"/>
            // if (isDaytime) iconName = 'day'; 
            iconName = iconName.concat('Snow');
            break;
        }
        default:
            icon = <Warning color="error"/>;
            iconName = "ERROR"
    }
    return {icon, iconName};
}

