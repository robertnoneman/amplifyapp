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
  Hidden, 
} from "@material-ui/core";
import mapboxgl from 'mapbox-gl/dist/mapbox-gl'
import { ClearAll, CloudCircle, CompassCalibration, FiberSmartRecord, Grain, GraphicEq, InvertColors, LeakAdd, NetworkWifi, SettingsInputAntenna, TrackChanges, Waves, WifiTethering } from "@material-ui/icons";
import { useStyles } from "@material-ui/pickers/views/Calendar/SlideTransition";
import Axios from "axios";
import xml2js from "xml2js"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSatellite, faSatelliteDish, faSnowflake, faTachometerAlt, faTemperatureHigh, faWind } from "@fortawesome/free-solid-svg-icons";

const drawerWidth = 50;
const layerIcons = [
  <ClearAll className="text-white" />, 
  <CompassCalibration className="text-white" />, 
  <FiberSmartRecord className="text-white" />, 
  <NetworkWifi className="text-white" />, 
  <SettingsInputAntenna className="text-white" />, 
  <WifiTethering className="text-white" />,
  <Waves className="text-white" />,
  <TrackChanges className="text-white" />,
  <LeakAdd className="text-white" />,
  <InvertColors className="text-white" />,
  <GraphicEq className="text-white" />,
  <Grain className="text-white" />,
  <CloudCircle className="text-white" />,
  <FontAwesomeIcon className="text-white" icon={faTemperatureHigh} />,
  <FontAwesomeIcon className="text-white" icon={faSnowflake} />,
  <FontAwesomeIcon className="text-white" icon={faWind} />,
  <FontAwesomeIcon className="text-white" icon={faSatelliteDish} />,
  <FontAwesomeIcon className="text-white" icon={faSatellite} />,
  <FontAwesomeIcon className="text-white" icon={faTachometerAlt} />,
]

const styles = (theme) => ({
  mapContainer: {
    marginTop: theme.spacing(12),
    [theme.breakpoints.down('md')]: {
      width: "100%",
      position: "fixed",
      backgroundColor: theme.palette.common.darkBlack,
      zIndex: 1201,
      marginTop: "56px",
      overflow: "hidden",
    },
  },
  mapContainerFixed: {
    [theme.breakpoints.down('md')]: {
      alignItems:"flex-end",
    },
  },
  mapBox: {
    backgroundColor: theme.palette.common.black,
    width: "90%",
    [theme.breakpoints.only('xs')]: {
      width: "99%",
      height: "730px",
    },
    [theme.breakpoints.only('sm')]: {
      width: "99%",
      height: "335px"
    },
    [theme.breakpoints.only('md')]: {
      width: "99%",
      height: "600px"
    },
    [theme.breakpoints.up('lg')]: {
      maxWidth: "90%",
      height: "800px"
    },
    [theme.breakpoints.up('xl')]: {
      maxWidth: "90%",
      height: "1000px"
    },
  },
  mapToolbar: {
    backgroundColor: theme.palette.secondary.dark,
    justifyContent: "center",
    flexDirection: "column",
    width: "auto",
    marginLeft: '-44px',
    zIndex: "1201",
    [theme.breakpoints.down('md')]: {
      marginTop: "0px",
      marginBottom: "10px",
    },
    [theme.breakpoints.down('sm')]: {
      marginTop: "0px",
      marginBottom: "25px",
    },
  },
  map: {
    width: "100%",
    height: "100%"
  },
  hackBox: {
    height: "600px",
    width: '100%'
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
    times: [],
  },
  {
    name: 'baseVelocity',
    visibility: 'hidden',
    times: [],
  },
]

const noaaMapsUrl = {
  getCapabilities: (stationId) => `https://opengeo.ncep.noaa.gov/geoserver/${stationId}/ows?service=wms&version=1.3.0&request=GetCapabilities`,
  radarStation: (stationId, layerId) => `https://opengeo.ncep.noaa.gov/geoserver/${stationId}/ows?service=wms&version=1.3.0&request=GetMap&format=image%2Fpng&TRANSPARENT=true&TILED=true&&SRS=EPSG:3857&BBOX={bbox-epsg-3857}&width=256&height=256&layers=${layerId}&style=radar_time`,
  conus: (layerId) => `https://opengeo.ncep.noaa.gov/geoserver/conus/ows?service=wms&version=1.3.0&request=GetMap&format=image%2Fpng&TRANSPARENT=true&TILED=true&&SRS=EPSG:3857&BBOX={bbox-epsg-3857}&width=256&height=256&layers=conus_${layerId}&style=radar_time`
}

var parser = new xml2js.Parser();

function WeatherMap(props) {
  const { classes, theme, width, selectWeather, toggleLayer, layerClicked, station } = props;
  const [lng, setLng] = useState(-77.044311523435);
  const [lat, setLat] = useState(38.88598268628932);
  const [wMap, setWMap] = useState(null);
  const [wLayers, setWLayers] = useState([]);
  const mapContainerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [toggleLayers, setToggleLayers] = useState(mapLayers);
  const [currentStation, setCurrentStation] = useState('klwx');

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
    setCurrentStation(station);
  }, [station]);

  useEffect(() => {
    const tempLayers = [];
    async function fetchLayerData(stationId) {
      let caps = [];
      const capLayers = [];
      await Axios.get(noaaMapsUrl.getCapabilities(stationId))
      .then((res) => {
        parser.parseString(res.data, 
          function(err, result) { 
            console.log(result);
            caps = result;
          });
          const layers = caps.WMS_Capabilities.Capability[0].Layer[0].Layer;
          layers.forEach((layer) => {
            console.log(layer.Name[0])
            capLayers.push(layer)
            tempLayers.push(layer)
          });
        setWLayers(capLayers);
      })
    }

    async function loadMap() {
      let tempStation = currentStation;
      if (tempStation === '' || tempStation === null || !tempStation) tempStation = 'klwx';
      await fetchLayerData(tempStation)
      .then(() => {
        mapboxgl.accessToken = 'pk.eyJ1Ijoicm9iZXJ0bm9uZW1hbiIsImEiOiJjamhmZmplaGMxNWNnM2RtZHN1dDV3eWZyIn0.vnK-PtNfnDZeB0J4ohyVJg' // process.env.REACT_APP_MAPBOX_TOKEN;
        const myMap = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/dark-v10',
          center: [lng, lat],
          zoom: 9
        })
        myMap.on('load', () => {
          if (Array.isArray(tempLayers)) {
            for (let i = 0; i < tempLayers.length; i++) {
              console.log(`temp layer ${i}: ${tempLayers[i].Name}`);
              myMap.addSource(`${tempLayers[i].Name}${i}`, {
                type: 'raster',
                tiles: [
                  noaaMapsUrl.radarStation(tempStation, tempLayers[i].Name)
                ],
                tileSize: 256
              })
              myMap.addLayer(
                {
                  id: `${tempLayers[i].Name}`,
                  type: 'raster',
                  source: `${tempLayers[i].Name}${i}`,
                  'paint': {}
                },
                'aeroway-line'
              );
              myMap.setLayoutProperty(tempLayers[i].Name, 'visibility', 'none');
            }
            // myMap.setLayoutProperty(wLayers[0].Name, 'visibility', 'visible');
          }
          myMap.resize();
          setWMap(myMap);
        })
      })
    }
    loadMap();
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
      'klwx_bdhc': true,
      'klwx_bdsa': false,
      'klwx_bdzd': false,
      'klwx_beet': false,
      'klwx_bohp': false,
      'klwx_bref_raw': false,
      'klwx_bsrm': false,
      'klwx_bstp': false,
      'klwx_bvel': false,
      'klwx_bvel_raw': false,
      'klwx_cref': false,
      'klwx_hvil': false,
    }
  });
  const [layerClicked, setLayerClicked] = useState('');
  const layerArray = [
    'klwx_bdhc',
    'klwx_bdsa',
    'klwx_bdzd',
    'klwx_beet',
    'klwx_bohp',
    'klwx_bref_raw',
    'klwx_bsrm',
    'klwx_bstp',
    'klwx_bvel',
    'klwx_bvel_raw',
    'klwx_cref',
    'klwx_hvil',
  ]

  const toggleLayer = useCallback((id) => {
    console.log(id);
    let tempToggled = toggledLayers; 
    let tempVisible = tempToggled.layers[id];
    console.log(`tempToggled: ${tempToggled.layers[id]}, tempVisible: ${tempVisible}`);
    setToggledLayers({
      layers: {...toggledLayers.layers, [id]: !tempVisible }
    });
    setLayerClicked(id);
  }, [toggledLayers]);

  useEffect(() => {
    selectWeather();
  }, [selectWeather]);

  return (
    <Grid container height="100%" justify="center" className={classes.mapContainer} alignItems="center">
      <Grid container item xs={12} justify="center" className={classes.mapContainerFixed}>
        <Box width="90%" className={classes.mapBox}>
          <WeatherMap classes={classes} theme={theme} toggleLayer={toggledLayers} layerClicked={layerClicked}/>
        </Box>
        <Box height="100%" xs={1} className={classes.mapToolbar}>
          <ButtonGroup color="secondary" variant="contained" orientation="vertical" size="small" style={{ minWidth: "5px", justifyContent: "flex-end", }}>
            {layerArray.map((layer, index) => (
              <Button key={layer} variant={toggledLayers.layers[layer] ? "outlined" : "contained"} onClick={() => {toggleLayer(layer)}}>{layerIcons[index]}</Button>
            ))}
          </ButtonGroup>
        </Box>
      </Grid>
      <Grid item>
      <Hidden smUp>
        <Box className={classes.hackBox}>
        </Box>
      </Hidden>
      </Grid>
    </Grid>
  )
}

export default withStyles(styles, { withTheme: true })(withWidth()(WeatherPage));

