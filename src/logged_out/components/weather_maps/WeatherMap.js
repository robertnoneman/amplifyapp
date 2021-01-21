/* eslint-disable no-useless-escape */
import React, {useState, useEffect, useRef, useCallback} from "react";
import clsx from 'clsx';
import { 
  withWidth, 
  withStyles,
  Paper,
  Button,
  Drawer,
  Divider,
  ButtonGroup,
  Grid,
  Box,
  IconButton, 
} from "@material-ui/core";
import mapboxgl from 'mapbox-gl/dist/mapbox-gl'
import { ClearAll, CompassCalibration, FiberSmartRecord, NetworkWifi, SettingsInputAntenna, WifiTethering } from "@material-ui/icons";
import { useStyles } from "@material-ui/pickers/views/Calendar/SlideTransition";

const drawerWidth = 50;

const styles = (theme) => ({
  mapContainer: {
    marginTop: theme.spacing(12),
    [theme.breakpoints.down('md')]: {
      width: "100%",
    },
  },
  mapBox: {
    backgroundColor: theme.palette.common.black,
    width: "90%",
    [theme.breakpoints.only('xs')]: {
      maxWidth: "99%",
      height: "600px"
    },
    [theme.breakpoints.only('sm')]: {
      maxWidth: "90%",
      height: "200px"
    },
    [theme.breakpoints.only('md')]: {
      maxWidth: "90%",
      height: "600px"
    },
    [theme.breakpoints.up('lg')]: {
      maxWidth: "90%",
      height: "800px"
    },
    [theme.breakpoints.up('xl')]: {
      maxWidth: "90%",
      height: "1100px"
    },
  },
  mapToolbar: {
    backgroundColor: theme.palette.secondary.dark,
    justifyContent: "center",
    flexDirection: "column",
    width: "auto",
    marginLeft: '-44px',
    zIndex: "1201"
  },
  map: {
    width: "100%",
    height: "100%"
  },
  appBar: {
    zIndex: theme.zIndex.drawer - 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    // marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  paper: {
    minHeight: "0%"
  },
  drawer: {
    // paddingTop: 100,
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    height: "50px",
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    marginTop: "100px",
    width: theme.spacing(4) + 1,
    [theme.breakpoints.up('sm')]: {
      // width: theme.spacing(9) + 1,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    // ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
});

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

function WeatherMap(props) {
  const { classes, theme, width, selectWeather, toggleLayer, layerClicked} = props;
  const [lng, setLng] = useState(-77.044311523435);
  const [lat, setLat] = useState(38.88598268628932);
  const [wMap, setWMap] = useState(null);
  const mapContainerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [toggleLayers, setToggleLayers] = useState(mapLayers);

  const openDrawer = useCallback(() => {
    setIsSideDrawerOpen(true);
  }, [setIsSideDrawerOpen]);

  const closeDrawer = useCallback(() => {
    setIsSideDrawerOpen(false);
  }, [setIsSideDrawerOpen]);

  const handleToggleLayer = (e) => {
    if (!wMap || !loaded || !toggleLayer) return;
    console.log(toggleLayer);
    let toggle = toggleLayer.layers[layerClicked];
    let newSetting = '';
    if (toggle) {
      newSetting = 'visible'
    } else newSetting = 'none';
    console.log(`Layer clicked: ${toggleLayer.layers[layerClicked]}, currently visible? ${toggle}, new setting: ${newSetting}`);
    wMap.setLayoutProperty(layerClicked, 'visibility', newSetting); 
  }

  useEffect(() => {
    setToggleLayers(toggleLayer);
    handleToggleLayer();
  }, [toggleLayer]);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoicm9iZXJ0bm9uZW1hbiIsImEiOiJjamhmZmplaGMxNWNnM2RtZHN1dDV3eWZyIn0.vnK-PtNfnDZeB0J4ohyVJg' // process.env.REACT_APP_MAPBOX_TOKEN;
    const myMap = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [lng, lat],
      zoom: 9
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
      myMap.setLayoutProperty('baseReflectivity', 'visibility', 'visible');
      myMap.setLayoutProperty('baseVelocity', 'visibility', 'none');
      setWMap(myMap);
    })
    setLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  return (
    <>
      <div ref={mapContainerRef} className={classes.map}></div>
    </>
  )
}

function WeatherPage(props) {
  const { classes, theme, width, selectWeather} = props;
  const [toggledLayers, setToggledLayers] = useState({
    layers: {
      'baseReflectivity': true,
      'baseVelocity': false
    }
  });
  const [layerClicked, setLayerClicked] = useState('');

  const toggleLayer = useCallback((id) => {
    console.log(id);
    let tempToggled = toggledLayers; 
    let tempVisible = tempToggled.layers[id];
    console.log(`tempToggled: ${tempToggled.layers[id]}, tempVisible: ${tempVisible}`);
    setToggledLayers({
      layers: {...toggledLayers.layers, [id]: !tempVisible }
    });
    setLayerClicked(id);
    // return id;
  }, [toggledLayers]);

  useEffect(() => {
    selectWeather();
  }, [selectWeather]);

  return (
    <Grid container height="100%" justify="center" className={classes.mapContainer} alignItems="center">
      <Grid container item xs={12} justify="center">
        <Box width="90%" className={classes.mapBox}>
          <WeatherMap classes={classes} theme={theme} toggleLayer={toggledLayers} layerClicked={layerClicked}/>
        </Box>
        <Box height="100%" xs={1} className={classes.mapToolbar}>
          <ButtonGroup color="secondary" variant="contained" orientation="vertical" size="small" style={{ minWidth: "5px", justifyContent: "flex-end", }}>
            <Button variant={toggledLayers.layers['baseReflectivity'] ? "outlined" : "contained"} onClick={() => {toggleLayer('baseReflectivity')}}><CompassCalibration className="text-white"/></Button>
            <Button variant={toggledLayers.layers['baseVelocity'] ? "outlined" : "contained"} onClick={() => {toggleLayer('baseVelocity')}}><SettingsInputAntenna className="text-white"/></Button>
            <Button variant="contained"><WifiTethering className="text-white"/></Button>
          </ButtonGroup>
        </Box>
      </Grid>
    </Grid>
  )
}

export default withStyles(styles, { withTheme: true })(withWidth()(WeatherPage));
