/* eslint-disable no-useless-escape */
import React, {useState, useEffect, Fragment, useRef} from "react";
import PropTypes from "prop-types";
import { 
  AppBar,
  Box,
  Grid, 
  Typography, 
  withWidth, 
  withStyles,
  useTheme,
  Tab,
  Tabs,
  isWidthDown,
  Paper,
  Button, 
} from "@material-ui/core";
import classNames from "classnames";
import mapboxgl from 'mapbox-gl/dist/mapbox-gl'

const styles = (theme) => ({
  mapContainer: {
    marginTop: theme.spacing(12),
    display: 'inline-flex',
    width: "90%",
    alignItems: "center",
    height:"600px",
    flexBasis: 0.5,
    maxHeight: "100%",
    marginBottom: "5px",
    flexDirection: "column",
    padding: theme.spacing(3),
  },
  map: {
    width: "100%",
    height: "100%"
  }
});

function WeatherMap(props) {
  const { classes, theme, width, selectWeather } = props;
  const [lng, setLng] = useState(-77.044311523435);
  const [lat, setLat] = useState(38.88598268628932);
  const [wMap, setWMap] = useState(null);
  const mapContainerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  const handleToggleLayer = (e) => {
    const { id } = e;
    if (!wMap || !loaded) return;
    let setting = wMap.getLayoutProperty(e, 'visibility'); //'baseVelocity', 'visibility'); 
    let toggle = setting === 'visible';
    let newSetting = '';
    if (toggle) {
      newSetting = 'none'
    } else newSetting = 'visible';
    wMap.setLayoutProperty(e, 'visibility', newSetting); //'baseVelocity', 'visibility', newSetting);
  }

  const mapLayers = [
    {
      name: 'baseReflectivity',
      visibility: 'visible',
    },
    {
      name: 'baseVelocity',
      visibility: 'hidden',
    },
  ]

  useEffect(() => {
    selectWeather();
  }, [selectWeather]);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoicm9iZXJ0bm9uZW1hbiIsImEiOiJjamhmZmplaGMxNWNnM2RtZHN1dDV3eWZyIn0.vnK-PtNfnDZeB0J4ohyVJg' // process.env.REACT_APP_MAPBOX_TOKEN;
    const myMap = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [lng, lat],
      zoom: 10.5
    })
    myMap.on('load', () => {
      myMap.addSource('bvel_raw', {
        type: 'raster',
        tiles: [
          'https://opengeo.ncep.noaa.gov/geoserver/klwx/ows?service=wms&version=1.3.0&request=GetMap&format=image%2Fpng&TRANSPARENT=true&TILED=true&&SRS=EPSG:3857&BBOX={bbox-epsg-3857}&width=256&height=256&layers=klwx_bvel&style=radar_time'
        ],
        tileSize: 256
      })
      myMap.addSource('bref_raw', {
        type: 'raster',
        tiles: [
          'https://opengeo.ncep.noaa.gov/geoserver/klwx/ows?service=wms&version=1.3.0&request=GetMap&format=image%2Fpng&TRANSPARENT=true&TILED=true&&SRS=EPSG:3857&BBOX={bbox-epsg-3857}&width=256&height=256&layers=klwx_bref_raw&style=radar_time', //&time=${time}
        ],
        tileSize: 256
      })
      myMap.addLayer(
        {
          id: 'baseVelocity',
          type: 'raster',
          source: 'bvel_raw',
          'paint': {}
        },
        'aeroway-line'
      );
      myMap.addLayer(
        {
          id: 'baseReflectivity',
          type: 'raster',
          source: 'bref_raw',
          'paint': {}
        },
        'aeroway-line'
      );
      myMap.resize();
      myMap.setLayoutProperty('baseVelocity', 'visibility', 'none');
      setWMap(myMap);
    })
    setLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  return (
    <Paper xs={6} className={classes.mapContainer}>
      {wMap && mapLayers.map(item => {
        return (
          <Button
            key={item.name} 
            onClick={() => handleToggleLayer(item.name)}
            >
            Toggle {item.name}
          </Button>
        )
      })}

      <div ref={mapContainerRef} className={classes.map} >

      </div>
    </Paper>
  )
}

export default withStyles(styles, { withTheme: true })(withWidth()(WeatherMap));
