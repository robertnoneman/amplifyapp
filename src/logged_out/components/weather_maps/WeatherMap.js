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
import stations from '../../test_data/stations.json'

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

const conusLayerDefaultStatus = { 
  layers: {
    "_bref_qcd": true,
    "_bref_raw": false,
    "_cref_qcd": false,
    "_cref_raw": false,
    "_neet_v18": false,
    "_pcpn_typ": false,
  }
};
const tdwrLayerDefaultStatus = { 
  layers: {
    "_bref1": true,
    "_bvel": false,
    "_bnet": false,
    "_bvil": false,
    "_cref": false,
    "_pcpn_typ": false,
  }
};
const nexradLayerDefaultStatus = {
  layers: {
    '_bdhc': true,
    '_bdsa': false,
    '_bdzd': false,
    '_beet': false,
    '_bohp': false,
    '_bref_raw': false,
    '_bsrm': false,
    '_bstp': false,
    '_bvel': false,
    '_bvel_raw': false,
    '_cref': false,
    '_hvil': false,
  }
};

const noaaMapsUrl = {
  getCapabilities: (stationId) => `https://opengeo.ncep.noaa.gov/geoserver/${stationId}/ows?service=wms&version=1.3.0&request=GetCapabilities`,
  radarStation: (stationId, layerId) => `https://opengeo.ncep.noaa.gov/geoserver/${stationId}/ows?service=wms&version=1.3.0&request=GetMap&format=image%2Fpng&TRANSPARENT=true&TILED=true&&SRS=EPSG:3857&BBOX={bbox-epsg-3857}&width=256&height=256&layers=${layerId}&style=radar_time`,
  conus: (layerId) => `https://opengeo.ncep.noaa.gov/geoserver/conus/ows?service=wms&version=1.3.0&request=GetMap&format=image%2Fpng&TRANSPARENT=true&TILED=true&&SRS=EPSG:3857&BBOX={bbox-epsg-3857}&width=256&height=256&layers=conus_${layerId}&style=radar_time`,
  stationList: 'https://api.weather.gov/radar/stations'
}

var parser = new xml2js.Parser();

function WeatherMap(props) {
  const { classes, theme, width, selectWeather, toggleLayer, layerClicked, station, changeStation, changeLayers, updateToggleLayers, sameLayer } = props;
  const [lng, setLng] = useState(-77.044311523435);
  const [lat, setLat] = useState(38.88598268628932);
  const [wMap, setWMap] = useState(null);
  const [wLayers, setWLayers] = useState([]);
  const [wLayerNames, setWLayerNames] = useState([]);
  const mapContainerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [toggleLayers, setToggleLayers] = useState(mapLayers);
  const [currentStation, setCurrentStation] = useState('conus');
  const [toggledLayers, setToggledLayers] = useState({ layers: {      
  "_bref_qcd": false,
  "_bref_raw": false,
  "_cref_qcd": false,
  "_cref_raw": false,
  "_neet_v18": false,
  "_pcpn_typ": false,} });

  const openDrawer = useCallback(() => {
    setIsSideDrawerOpen(true);
  }, [setIsSideDrawerOpen]);

  const closeDrawer = useCallback(() => {
    setIsSideDrawerOpen(false);
  }, [setIsSideDrawerOpen]);

  const handleToggleLayer = (e) => {
    if (layerClicked === '') return;
    if (!wMap || !loaded || !toggleLayer) return;
    console.log(toggleLayer);
    console.log(toggledLayers);
    let toggle = toggledLayers.layers[`${layerClicked}`];
    let newSetting = '';
    if (!toggle) {
      newSetting = 'visible'
    } else newSetting = 'none';
    const stationLayer = `${currentStation}${layerClicked}`;
    console.log(`Layer clicked: ${stationLayer} - ${toggledLayers.layers[layerClicked]}, currently visible? ${toggle}, new setting: ${newSetting}`);
    wMap.setLayoutProperty(stationLayer, 'visibility', newSetting); 
  }

  const updateToggledLayers = (o) => {
    // const { layer } = o;
    console.log(`map layer clicked: ${layerClicked}`)
    var toggle = toggledLayers.layers[layerClicked];
    setToggledLayers({
      layers: { ...toggledLayers.layers, [layerClicked]: !toggle }
    })
  };

  useEffect(() => {
    setToggleLayers(toggleLayer);
    updateToggledLayers();
    handleToggleLayer();
  }, [toggleLayer]);

  useEffect(() => {
    updateToggledLayers()
    // setToggledLayers(layerClicked)
    handleToggleLayer();
  }, [layerClicked, sameLayer])

  useEffect(() => {
    setCurrentStation(station);
  }, [station]);

  useEffect(() => {
    const tempLayers = [];
    const tempNames =[];

    async function fetchLayerData(stationId) {
      let caps = [];
      const capLayers = [];
      let tempToggleLayers = {};
    
      if(stationId === 'conus') {
        tempToggleLayers = conusLayerDefaultStatus;
      }
      if(stationId[0] === 'k') {
        tempToggleLayers = nexradLayerDefaultStatus;
      }
      if(stationId[0] === 't') {
        tempToggleLayers = tdwrLayerDefaultStatus;
      }
      await Axios.get(noaaMapsUrl.getCapabilities(stationId))
      .then((res) => {
        parser.parseString(res.data, 
          function(err, result) { 
            console.log(result);
            caps = result;
          });
          const layers = caps.WMS_Capabilities.Capability[0].Layer[0].Layer;
          layers.forEach((layer) => {
            
            if(stationId === 'conus') {
              // tempToggledLayers = ({layers: {...tempToggledLayers.layers, layer.Name[0].slice(5,): false} })
              console.log(layer.Name[0].slice(5,))
              tempNames.push(layer.Name[0].slice(5,))
            }
            else { 
              console.log(layer.Name[0].slice(4,))
              tempNames.push(layer.Name[0].slice(4,)) 
            }
            capLayers.push(layer)
            tempLayers.push(layer)
          });
        setWLayers(capLayers);
        setWLayerNames(tempNames);
        changeLayers(tempNames);
        setToggledLayers(tempToggleLayers);
      })
    }

    async function loadMap() {
      let tempStation = currentStation.toLowerCase();
      if (tempStation === '' || tempStation === null || !tempStation) tempStation = 'conus';
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
              const stationLayer = `${currentStation}${tempLayers[i].Name.slice(4,)}`
              console.log(`stationLayer: ${stationLayer}`)
              myMap.addSource(`${tempLayers[i].Name}${i}`, {
                type: 'raster',
                tiles: [
                  noaaMapsUrl.radarStation(tempStation, `${tempLayers[i].Name}`)
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
          }
          myMap.addSource('radarStations', {
            type: 'geojson',
            data: stations
            // data: 'https://api.weather.gov/radar/stations'
          })
          myMap.addLayer({
            'id': 'stations',
            'type': 'symbol',
            'source': 'radarStations',
            'layout': {
              // get the title name from the source's "title" property
              'text-field': ['get', 'id'],
              'text-font': [
                'Roboto Regular',
                'Open Sans Semibold',
                'Arial Unicode MS Bold'
              ],
              'text-offset': [0, 1.25],
              'text-anchor': 'top'
            },
            'paint': {
              'icon-color': [
                'match',
                ['get', 'rda'],
                'Operate', '#D92F36',
                '#195f86'
              ],
              'text-color': "#195f86",
            }
          });
          myMap.addLayer({
            id: 'stationCircles',
            type: 'circle',
            source: 'radarStations',
            paint: {
            'circle-blur': 0.5,
            'circle-color': '#11b4da',
            'circle-opacity': 0.5,
            'circle-radius': 12,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ef6c2a'
            }
          });
          myMap.on('click', 'stationCircles', function (e) {
            new mapboxgl.Popup()
            .setLngLat(e.features[0].geometry.coordinates)
            // .setHTML(e.features[0].properties.id)
            .addTo(myMap);
            setLng(e.features[0].geometry.coordinates[0])
            setLat(e.features[0].geometry.coordinates[1])
            setCurrentStation(e.features[0].properties.id.toLowerCase())
          });
          myMap.on('mouseenter', 'stationCircles', function () {
            myMap.getCanvas().style.cursor = 'pointer';
          });
              // Change it back to a pointer when it leaves.
          myMap.on('mouseleave', 'stationCircles', function () {
            myMap.getCanvas().style.cursor = '';
          });
          myMap.resize();
          setWMap(myMap);
        })
      })
    }
    loadMap();
    setLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [station, currentStation]);
  
  useEffect(() => {
    changeStation(currentStation);
  }, [currentStation, changeStation]);

  useEffect(() => {
    updateToggleLayers(toggledLayers);
  }, [toggledLayers, updateToggleLayers])

  return (
    <>
      <div ref={mapContainerRef} className={classes.map}></div>
    </>
  )
}

function WeatherPage(props) {
  const { classes, theme, width, selectWeather} = props;
  // setSelectedStation would be used to set station when controlled from UI, 
  // so like when changing from individual stations to conus composite
  const [selectedStation, setSelectedStation] = useState('conus');
  const [station, setStation] = useState('kdox');
  const [currentLayers, setCurrentLayers] = useState([]);
  const [mapLayersStatus, setMapLayersStatus] = useState([]);
  const [layerClicked, setLayerClicked] = useState('_bref_qcd');
  const [sameLayerClicked, setSameLayerClicked] = useState(false);
  const [toggledLayers, setToggledLayers] = useState({
    layers: {
      '_bdhc': true,
      '_bdsa': false,
      '_bdzd': false,
      '_beet': false,
      '_bohp': false,
      '_bref_raw': false,
      '_bsrm': false,
      '_bstp': false,
      '_bvel': false,
      '_bvel_raw': false,
      '_cref': false,
      '_hvil': false,
    }
  });
  
  const [conusToggledLayers, setConusToggledLayers] = useState({
    layers: {
      "_bref_qcd": true,
      "_bref_raw": false,
      "_cref_qcd": false,
      "_cref_raw": false,
      "_neet_v18": false,
      "_pcpn_typ": false,
    }
  });
  const conusLayerArray = ["_bref_qcd","_bref_raw","_cref_qcd","_cref_raw","_neet_v18","_pcpn_typ"];
  
  const changeStation = useCallback((stationId) => {
    console.log(`Current station set to: ${stationId}`);
    setStation(stationId);
    // setSelectedStation(stationId)
  }, [])

  const changeLayers = useCallback((layers) => {
    console.log(layers);
    setCurrentLayers(layers);
  }, [])

  const updateToggledLayers = useCallback((layers) => {
    console.log(layers);
    // setToggledLayers(layers);
    setMapLayersStatus(layers);
  }, [])

  const toggleLayer = useCallback((id) => {
    console.log(id);
    let tempToggled = toggledLayers; 
    let tempVisible = tempToggled.layers[id];
    console.log(`tempToggled: ${tempToggled.layers[id]}, tempVisible: ${tempVisible}`);
    setToggledLayers({
      layers: {...toggledLayers.layers, [id]: !tempVisible }
    });
    // setLayerClicked(`${id}`);
  }, [toggledLayers]);

  const updateLayerClicked = useCallback((layer) => {
    console.log(`Layer clicked: ${layer}`);
    let prevLayerClicked = layerClicked;
    console.log(prevLayerClicked);
    let toggy = !sameLayerClicked;
    // if (prevLayerClicked === layer) setSameLayerClicked(true);
    setSameLayerClicked(toggy);
    setLayerClicked(layer);
    toggleLayer(layer);
  }, [toggleLayer, setLayerClicked, setSameLayerClicked])

  function hackyLayerClick(layer) {
    setLayerClicked(layer);
  }

  const toggleConusLayer = useCallback((id) => {
    console.log(id);
    let tempToggled = conusToggledLayers; 
    let tempVisible = tempToggled.layers[id];
    console.log(`tempToggled: ${tempToggled.layers[id]}, tempVisible: ${tempVisible}`);
    setConusToggledLayers({
      layers: {...conusToggledLayers.layers, [id]: !tempVisible }
    });
    setLayerClicked(`${id}`);
  }, [conusToggledLayers]);

  useEffect(() => {
    selectWeather();
  }, [selectWeather]);

  return (
    <Grid container height="100%" justify="center" className={classes.mapContainer} alignItems="center">
      <Grid container item xs={12} justify="center" className={classes.mapContainerFixed}>
        <Box width="90%" className={classes.mapBox}>
          <WeatherMap changeLayers={(layers) => changeLayers(layers)} 
            changeStation={(id) => changeStation(id)} 
            updateToggleLayers={(toggledLayers) => updateToggledLayers(toggledLayers)} 
            station={selectedStation} classes={classes} theme={theme} 
            toggleLayer={selectedStation === 'conus' ? conusToggledLayers : toggledLayers} 
            layerClicked={layerClicked}
            sameLayer={sameLayerClicked}
          />
        </Box>
        <Box height="100%" xs={1} className={classes.mapToolbar}>
          <ButtonGroup color="secondary" variant="contained" orientation="vertical" size="small" style={{ minWidth: "5px", justifyContent: "flex-end", }}>
            {(station !== 'conus' && currentLayers.map((layer, index) => (
              <Button key={layer} variant={mapLayersStatus.layers[layer] ? "outlined" : "contained"} onClick={() => {updateLayerClicked(layer)}}>{layerIcons[index]}</Button>
            )))}
            {(station === 'conus' && conusLayerArray.map((layer, index) => (
              <Button key={layer} variant={conusToggledLayers.layers[layer] ? "outlined" : "contained"} onClick={() => {toggleConusLayer(layer)}}>{layerIcons[index]}</Button>
            )))}
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

          // myMap.loadImage('https://cors-anywhere.herokuapp.com/https://cdn.onlinewebfonts.com/svg/img_486487.png', function(error, image) {
          // if (error) throw error;
          // // add image to the active style and make it SDF-enabled
          // myMap.addImage('radar-icon', image, { sdf: true });
          // });
          // // myMap.loadImage('https://cors-anywhere.herokuapp.com/https://simpleicon.com/wp-content/uploads/radar-31.png', function(error, image) {
          //   myMap.loadImage('https://cors-anywhere.herokuapp.com/https://cdn.onlinewebfonts.com/svg/img_486487.png', function(error, image) {
          // if (error) throw error;
          // // add image to the active style and make it SDF-enabled
          // myMap.addImage('radar-icon-simple', image, { sdf: true });
          // });