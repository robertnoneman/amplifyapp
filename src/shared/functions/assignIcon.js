import React from "react";
//import PropTypes from "prop-types";

import { AcUnit, NightsStayTwoTone, Brightness7, Flare, Warning, WbSunny, Cloud } from "@material-ui/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudShowersHeavy, faCloudSun } from "@fortawesome/free-solid-svg-icons";
//import weatherIcons from "weather-icons"

export default function assignIcon(iconKey, isDaytime) {
    //console.log(iconKey);
    var icon = null;
    var iconName = "";
    var isRainyTest = new RegExp(/Rain/, 'gm');
    var isSnowyTest = new RegExp(/Snow/, 'gm');
    var isChance = new RegExp(/Chance/, 'gm');
    if (isDaytime)
    {
        iconName.concat('day')
    }
    else iconName.concat('night')
    if (isChance.exec(iconKey))
    {
        iconKey.concat("Chance");
        //iconName = iconName.concat('Rain');
    }
    if (isRainyTest.exec(iconKey))
    {
        iconKey = "Rain";
        iconName = iconName.concat('Rain');
    }
    if (isSnowyTest.exec(iconKey))
    {
        iconKey.concat("Snow");
        iconName = iconName.concat('Snow');
    }
    if (isDaytime) iconName = "day";
    switch (iconKey) {
        case "Sunny": {
            icon = <WbSunny htmlColor="#ffe747"/>;
            iconName = iconName.concat('Sunny');
            break;
        }
        case "Mostly Sunny": {
            icon = <Flare htmlColor="#ffe747"/>;
            iconName = iconName.concat('Sunny');
            break;
        }
        case "Partly Sunny": {
            icon = <Brightness7 htmlColor="#ffe747"/>;
            iconName = iconName.concat('Sunny');
            break;
        }
        case "Cloudy": {
            icon = <Cloud htmlColor="#c5d2d8"/>;
            iconName = iconName.concat('Cloudy');
            break;
        }
        case "Partly Cloudy": {
            //icon = <FilterDramaTwoTone htmlColor="#c2ced0"/>;
            icon = <FontAwesomeIcon icon={faCloudSun}/>;
            iconName = iconName.concat('Cloudy');
            break;
        }
        case "Mostly Cloudy": {
            icon = <Cloud htmlColor="##7d7d7d"/>;
            iconName = iconName.concat('Cloudy');
            break;
        }
        case "Mostly Clear": {
            icon = <NightsStayTwoTone htmlColor="#ffffff"/>;
            iconName = iconName.concat('Sunny');
            break;
        }
        case "Rain": {
            //icon = <Grain htmlColor="#00ccf0"/>
            icon = <FontAwesomeIcon size="lg" color="#00ccf0" icon={faCloudShowersHeavy}/>;
            iconName = iconName.concat('Rain');
            break;
        }
        case "Snow": {
            icon = <AcUnit htmlColor="#fff"/>
            iconName = iconName.concat('Snow');
            break;
        }
        case "RainSnow": {
            icon = <AcUnit htmlColor="#fff"/>
            iconName = iconName.concat('RainSnow');
            break;
        }
        default:
            icon = <Warning color="error"/>;
            iconName = "ERROR"
    }
    return {icon, iconName};
}

