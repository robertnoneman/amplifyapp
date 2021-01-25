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
  Tooltip,
  CircularProgress, 
} from "@material-ui/core";
import mapboxgl from 'mapbox-gl/dist/mapbox-gl'
import { ClearAll, CloudCircle, CompassCalibration, FiberSmartRecord, Grain, GraphicEq, InvertColors, LeakAdd, NetworkWifi, SettingsInputAntenna, TrackChanges, Waves, WifiTethering } from "@material-ui/icons";
import { useStyles } from "@material-ui/pickers/views/Calendar/SlideTransition";
import Axios from "axios";
import xml2js from "xml2js"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSatellite, faSatelliteDish, faSnowflake, faTachometerAlt, faTemperatureHigh, faWind } from "@fortawesome/free-solid-svg-icons";
import stations from '../../test_data/stations.json'
import { ThemeContext } from "styled-components";

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
  fabProgress: {
    color: theme.palette.primary.main,
    position: 'absolute',
    top: "40%",
    left: "45%",
    zIndex: 1,
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
  getCapabilities: (stationId) => `https://gentle-fortress-30918.herokuapp.com/https://opengeo.ncep.noaa.gov/geoserver/${stationId}/ows?service=wms&version=1.3.0&request=GetCapabilities`,
  goesGetCapabilities: 'https://gentle-fortress-30918.herokuapp.com/https://nowcoast.noaa.gov/arcgis/services/nowcoast/sat_meteo_imagery_time/MapServer/WMSServer?request=GetCapabilities&service=WMS',
  goesGetMap: (layerId) => `https://gentle-fortress-30918.herokuapp.com/https://nowcoast.noaa.gov/arcgis/services/nowcoast/sat_meteo_imagery_time/MapServer/WmsServer?service=WMS&request=GetMap&version=1.3.0&layers=${layerId}&styles=&format=image/png&transparent=true&height=256&width=256&crs=EPSG:3857&bbox={bbox-epsg-3857}`,
  radarStation: (stationId, layerId) => `https://gentle-fortress-30918.herokuapp.com/https://opengeo.ncep.noaa.gov/geoserver/${stationId}/ows?service=wms&version=1.3.0&request=GetMap&format=image%2Fpng&TRANSPARENT=true&TILED=true&&SRS=EPSG:3857&BBOX={bbox-epsg-3857}&width=256&height=256&layers=${layerId}&style=radar_time`,
  conus: (layerId) => `https://gentle-fortress-30918.herokuapp.com/https://opengeo.ncep.noaa.gov/geoserver/conus/ows?service=wms&version=1.3.0&request=GetMap&format=image%2Fpng&TRANSPARENT=true&TILED=true&&SRS=EPSG:3857&BBOX={bbox-epsg-3857}&width=256&height=256&layers=conus_${layerId}&style=radar_time`,
  stationList: 'https://api.weather.gov/radar/stations',
  goes: 'https://wms1.nsstc.nasa.gov:443/geoserver/GOES/wms?service=WMS&request=getmap&layers=LAYERNAME&bbox=SWLON,SWLAT,NELON,NELAT&width=IMAGEWIDTH&height=IMAGEHEIGHT&format=image/png',
  nasaWeatherList: 'https://weather.msfc.nasa.gov/goes/gislist.html',
  goesAlt: 'https://gist.github.com/ix4/56b767b1e9251638cc27a7aad443805c',
  ecmwf: 'https://apps.ecmwf.int/wms/?token=public',
  hrrr: 'https://mesonet.agron.iastate.edu/cgi-bin/wms/hrrr/refd.cgi'
}

var parser = new xml2js.Parser();

const RadarStationIcon = (props) => {
  const { classes, theme, color } = props;
  return ( 
    <div>
      <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="radar" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-radar fa-w-16 fa-9x">
        <path fill="currentColor" d="M504,256c0,136.9668-111.0332,248-248,248S8,392.9668,8,256,119.0332,8,256,8A246.36335,246.36335,0,0,1,395.14648,50.916L425.377,20.68555a16.00006,16.00006,0,0,1,22.627,0l11.31054,11.31054a16.00006,16.00006,0,0,1,0,22.627l-201.373,201.373L257.93555,256H320a64.00026,64.00026,0,1,1-66.15625-63.78125L281.97852,164.084A92.08681,92.08681,0,0,0,256,160a96,96,0,1,0,96,96h64c0,79.53906-58.498,145.17578-134.63281,157.43555C275.54492,405.49414,266.60156,400,256,400s-19.54492,5.49414-25.36719,13.43555A159.59519,159.59519,0,0,1,98.56445,281.36719C106.50586,275.54492,112,266.60156,112,256s-5.49414-19.54492-13.43555-25.36719C110.82422,154.49805,176.46094,96,256,96c27.11328,0,52.21484,7.48438,74.53125,19.53125L354.51953,91.543A190.21144,190.21144,0,0,0,256,64C159.74023,64,80.26172,134.91211,66.375,227.30078a31.59809,31.59809,0,0,0,0,57.39649A191.79963,191.79963,0,0,0,227.30273,445.625a31.59657,31.59657,0,0,0,57.39454,0C377.08594,431.74023,448,352.25977,448,256Z" 
          class="">
        </path>
      </svg>
    </div>
  )
}

function WeatherMap(props) {
  const { classes, theme, width, selectWeather, updateLoading, toggleLayer, layerClicked, 
    station, changeStation, changeLayers, changeLayerObjs, changeSatLayerObjs, addGoesData,
    updateToggleLayers, sameLayer } = props;
  const [lng, setLng] = useState(-77.044311523435);
  const [lat, setLat] = useState(38.88598268628932);
  const [wMap, setWMap] = useState(null);
  const [wLayers, setWLayers] = useState([]);
  const [satLayers, setSatLayers] = useState([]);
  const [wLayerNames, setWLayerNames] = useState([]);
  const mapContainerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [currentStation, setCurrentStation] = useState('conus');
  const [toggledLayers, setToggledLayers] = useState({ layers: {      
  "_bref_qcd": true,
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
    if (layerClicked.substring(0,3) === "sat" ) wMap.setLayoutProperty(layerClicked, 'visibility', newSetting);
    else wMap.setLayoutProperty(stationLayer, 'visibility', newSetting); 
  }

  const updateToggledLayers = (o) => {
    // const { layer } = o;
    console.log(`map layer clicked: ${layerClicked}`)
    var toggle = toggledLayers.layers[layerClicked];
    setToggledLayers({
      layers: { ...toggledLayers.layers, [layerClicked]: !toggle }
    })
  };

  const addGoesLayers = () => {
    console.log('adding goes layers!')
    const tempSatLayers = [];
    for (let i = 0; i < satLayers.length; i++) {
      wMap.addSource(`${satLayers[i].Name}${i}`, {
        type: 'raster',
        tiles: [
          noaaMapsUrl.goesGetMap(`${satLayers[i].Name}`)
        ],
        tileSize: 256
      })
      wMap.addLayer(
        {
          id: `${satLayers[i].Abstract[0]}_${satLayers[i].Name}`,
          type: 'raster',
          source: `${satLayers[i].Name}${i}`,
          'paint': {}
        },
        'aeroway-line'
      );
      wMap.setLayoutProperty(`${satLayers[i].Abstract[0]}_${satLayers[i].Name}`, 'visibility', 'none');
      tempSatLayers.push({
        name: `${satLayers[i].Abstract[0]}_${satLayers[i].Name[0]}`,
        description: satLayers[i].Abstract[0]
      })
    }
    changeSatLayerObjs(tempSatLayers);
  };

  useEffect(() => {
    addGoesLayers();
  }, [addGoesData])

  useEffect(() => {
    updateToggledLayers()
    // setToggledLayers(layerClicked)
    handleToggleLayer();
  }, [layerClicked, sameLayer])

  useEffect(() => {
    setCurrentStation(station);
  }, [station]);

  async function fetchGoesData() {
    let goesCaps = [];
    let caps = [ ];
    let tempNames = [];
    let layerObjs = [];
    // Axios.get('https://mesonet.agron.iastate.edu/cgi-bin/wms/goes_east.cgi?VERSION=1.1.1&REQUEST=GetCapabilities&SERVICE=WMS&')
    await Axios.get(noaaMapsUrl.goesGetCapabilities)
    .then((res) => {
      parser.parseString(res.data, 
        function(err, result) { 
          console.log(result);
          caps = result;
        });
      const layers = caps.WMS_Capabilities.Capability[0].Layer[0].Layer;
      layers.forEach((layer) => {
        console.log(layer);
        console.log(
          {name: layer.Title[0],
          description:  layer.Abstract[0]} )
        tempNames.push(layer.Title[0])
        layerObjs.push({
          name: layer.Title[0],
          description: layer.Abstract[0]
        })
      goesCaps.push(layer.Layer[0]);
    })
    setSatLayers(goesCaps);
    })
  }

  useEffect(() => {
    fetchGoesData();
  }, [])

  useEffect(() => {
    setLoaded(false);
    const tempLayers = [];
    const tempNames =[];
    const layerObjs = [];

    async function fetchLayerData(stationId) {
      if (stationId === 'goes') return;
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
              console.log(
                {name: layer.Name[0].slice(5,),
                description:  layer.Abstract[0]} )
              tempNames.push(layer.Name[0].slice(5,))
              layerObjs.push({
                name: layer.Name[0].slice(5,),
                description: layer.Abstract[0]
              })
            }
            else { 
              console.log( 
                {
                  name: layer.Name[0].slice(4,),
                  description: layer.Abstract[0]
                } )
                layerObjs.push({
                  name: layer.Name[0].slice(4,),
                  description: layer.Abstract[0]
                })
              tempNames.push(layer.Name[0].slice(4,)) 
            }
            capLayers.push(layer)
            tempLayers.push(layer)
          });
        setWLayers(capLayers);
        setWLayerNames(tempNames);
        changeLayers(tempNames);
        changeLayerObjs(layerObjs);
        setToggledLayers(tempToggleLayers);
      })
    }

    async function loadMap() {
      setLoaded(false);
      let tempStation = currentStation.toLowerCase();
      if (tempStation === '' || tempStation === null || !tempStation) tempStation = 'conus';
      await fetchLayerData(tempStation)
      .then(() => {
        mapboxgl.accessToken = 'pk.eyJ1Ijoicm9iZXJ0bm9uZW1hbiIsImEiOiJjamhmZmplaGMxNWNnM2RtZHN1dDV3eWZyIn0.vnK-PtNfnDZeB0J4ohyVJg' // process.env.REACT_APP_MAPBOX_TOKEN;
        const myMap = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/dark-v10',
          center: [lng, lat],
          zoom: 7
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
              if (i > 0) myMap.setLayoutProperty(tempLayers[i].Name, 'visibility', 'none');
            }
          }
          myMap.addSource('radarStations', {
              type: 'geojson',
              data: stations,
              // data: 'https://api.weather.gov/radar/stations',
              cluster: true,
              clusterMaxZoom: 14,
            });
            
          myMap.addLayer({
            id: 'stationClusterCircles',
            type: 'circle',
            source: 'radarStations',
            filter: ['has', 'point_count'],
            paint: {
            // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            100,
            '#f1f075',
            750,
            '#f28cb1'
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20,
              1,
              20,
              2,
              30
              ]
              }
              });
          myMap.addLayer({
            id: 'stationClusterLabels',
            type: 'symbol',
            source: 'radarStations',
            filter: ['!', ['has', 'point_count']],
            layout: {
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
            paint: {
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
            filter: ['!', ['has', 'point_count']],
            paint: {
            'circle-blur': 0.5,
            'circle-color': '#11b4da',
            'circle-opacity': 0.75,
            'circle-radius': 12,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ef6c2a'
            }
          });
          // inspect a cluster on click
          myMap.on('click', 'stationClusterCircles', function (e) {
            var features = myMap.queryRenderedFeatures(e.point, {
              layers: ['stationClusterCircles']
            });
            var clusterId = features[0].properties.cluster_id;
            myMap.getSource('radarStations').getClusterExpansionZoom(
              clusterId,
              function (err, zoom) {
                if (err) return;
                myMap.easeTo({
                  center: features[0].geometry.coordinates,
                  zoom: zoom
                });
               }
            );
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
          myMap.on('sourcedata', function(e) {
            if (e.isSourceLoaded) {
            // Do something when the source has finished loading
              if (e.source === 'radarStations') {
                console.log('Radar stations loaded successfully!')
                console.log(`Source data type: ${e.sourceDataType.metadata}`);
              }
              
            }
            });
          myMap.resize();
          setWMap(myMap);
          setLoaded(true);
        })
      })
    }
    loadMap();
    // setLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStation]);
  
  useEffect(() => {
    changeStation(currentStation);
  }, [currentStation]);

  useEffect(() => {
    updateToggleLayers(toggledLayers);
  }, [toggledLayers])

  useEffect(() => {
    updateLoading(!loaded);
  }, [loaded]);

  return (
    <>
      <div ref={mapContainerRef} className={classes.map}></div>
    </>
  )
}

function WeatherPage(props) {
  const { classes, theme, width, selectWeather} = props;
  const [loading, setLoading] = useState(true);
  // setSelectedStation would be used to set station when controlled from UI, 
  // so like when changing from individual stations to conus composite
  const [selectedStation, setSelectedStation] = useState('conus');
  const [station, setStation] = useState('kdox');
  const [currentLayers, setCurrentLayers] = useState([]);
  const [currentLayerObjs, setCurrentLayerObjs] = useState([]);
  const [currentSatLayerObjs, setCurrentSatLayerObjs] = useState([]);
  const [mapLayersStatus, setMapLayersStatus] = useState([]);
  const [layerClicked, setLayerClicked] = useState('_bref_qcd');
  const [sameLayerClicked, setSameLayerClicked] = useState(false);
  const [goesClicked, setGoesClicked] = useState(false);
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
      "sat_gmgsi_sir_1": false,
      "sat_gmgsi_lir_5": false,
      "sat_gmgsi_vis_9": false,
      "sat_goes_sir_13": false,
      "sat_goes_lir_17": false,
      "sat_goes_wv_21": false, 
      "sat_goes_vis_25": false
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
  
  const handleGoesClicked = () => {
    setGoesClicked(!goesClicked);
    // setSelectedStation('goes')
  }

  const changeStation = useCallback((stationId) => {
    console.log(`Current station set to: ${stationId}`);
    setStation(stationId);
    // setGoesClicked(false);
  }, [])

  const changeLayers = useCallback((layers) => {
    console.log(layers);
    setCurrentLayers(layers);
  }, [])

  const changeLayerObjs = useCallback((layers) => {
    console.log(layers);
    setCurrentLayerObjs(layers);
  }, [])

  const changeSatLayerObjs = useCallback((layers) => {
    console.log(layers);
    setCurrentSatLayerObjs(layers);
  }, [])

  const updateToggledLayers = useCallback((layers) => {
    console.log(layers);
    setMapLayersStatus(layers);
  }, [])

  const updateLoading = useCallback((status) => {
    console.log(`Loading: ${status}`);
    setLoading(status);
  }, [])

  const toggleLayer = useCallback((id) => {
    console.log(id);
    // id = 'id';
    let tempToggled = toggledLayers;
    console.log(toggledLayers)
    let tempVisible = tempToggled.layers[id];
    console.log(tempToggled);
    console.log(`tempToggled: ${tempToggled.layers[id]}, tempVisible: ${tempVisible}`);
    setToggledLayers({
      layers: {...tempToggled.layers, [id]: !tempVisible }
    });
    // setLayerClicked(`${id}`);
  }, [toggledLayers]);

  const updateLayerClicked = useCallback((layer) => {
    console.log(`Layer clicked: ${layer}`);
    let prevLayerClicked = layerClicked;
    console.log(prevLayerClicked);
    let toggy = !sameLayerClicked;
    setSameLayerClicked(toggy);
    setLayerClicked(layer);
    toggleLayer(layer);
    // toggleConusLayer(layer);
  // }, [toggleLayer, setLayerClicked, setSameLayerClicked])
  }, [sameLayerClicked, setLayerClicked])

  const toggleConusLayer = useCallback((id) => {
    // console.log(id);
    let tempToggled = conusToggledLayers; 
    let tempVisible = tempToggled.layers[id];
    console.log(`tempToggled: ${tempToggled.layers[id]}, tempVisible: ${tempVisible}`);
    let toggy = !sameLayerClicked;
    setSameLayerClicked(toggy);
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
            changeLayerObjs={(layers) => changeLayerObjs(layers)}
            changeSatLayerObjs={(layers) => changeSatLayerObjs(layers)}
            changeStation={(id) => changeStation(id)} 
            updateToggleLayers={(toggledLayers) => updateToggledLayers(toggledLayers)} 
            station={selectedStation} classes={classes} theme={theme} 
            toggleLayer={selectedStation === 'conus' ? conusToggledLayers : toggledLayers} 
            layerClicked={layerClicked}
            sameLayer={sameLayerClicked}
            updateLoading={(status) => updateLoading(status)}
            addGoesData={goesClicked}
          />
          {loading && <CircularProgress size={68} className={classes.fabProgress} />}
        </Box>
        <Box height="100%" xs={1} className={classes.mapToolbar}>
          <ButtonGroup color="secondary" variant="contained" orientation="vertical" size="small" style={{ minWidth: "5px", justifyContent: "flex-end", }}>
            {(station !== 'conus' && currentLayerObjs.map((layer, index) => (
              <Button key={layer.name} variant={mapLayersStatus.layers[layer.name] ? "outlined" : "contained"} onClick={() => {updateLayerClicked(layer.name)}}>
                <Tooltip title={layer.description} placement="right" key={layer.name} >
                  {layerIcons[index]}
                </Tooltip>
              </Button>
            )))}
            {(station === 'conus' && currentLayerObjs.map((layer, index) => (
              <Button key={layer.name} variant={conusToggledLayers.layers[layer.name] ? "outlined" : "contained"} onClick={() => {toggleConusLayer(layer.name)}}>
                <Tooltip title={layer.description} placement="right" key={layer.name} >
                  {layerIcons[index]}
                </Tooltip>
              </Button>
            )))}
          </ButtonGroup>
          <ButtonGroup color="secondary" variant="contained" orientation="vertical" size="small" style={{ minWidth: "5px", justifyContent: "flex-end", }}>
            {(Array.isArray(currentSatLayerObjs) && currentSatLayerObjs.map((layer, index) => (
              <Button key={layer.name} variant={mapLayersStatus.layers[layer.name] ? "outlined" : "contained"} 
                onClick={station === 'conus' ? () => {toggleConusLayer(layer.name)} : () => {updateLayerClicked(layer.name)}}
                >
                <Tooltip title={layer.description} placement="right" key={layer.name} >
                  {layerIcons[index]}
                </Tooltip>
              </Button>
            )))}
            <Button onClick={handleGoesClicked}>Add GOES data</Button>
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