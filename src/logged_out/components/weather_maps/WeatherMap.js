/* eslint-disable no-useless-escape */
import React, {useState, useEffect, Fragment, useRef, useCallback} from "react";
import clsx from 'clsx';
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
  Toolbar,
  IconButton,
  MenuItem,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ButtonGroup, 
} from "@material-ui/core";
import classNames from "classnames";
import mapboxgl from 'mapbox-gl/dist/mapbox-gl'
import SideDrawer from '../../../logged_in/components/navigation/SideDrawer'
import MenuIcon from '@material-ui/icons/Menu';
import { ChevronLeft, ChevronRight, ClearAll, CompassCalibration } from "@material-ui/icons";
import { faPen, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { WiRain, WiWindy } from "weather-icons-react";
import { useStyles } from "@material-ui/pickers/views/Calendar/SlideTransition";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const drawerWidth = 50;

const styles = (theme) => ({
  mapContainer: {
    // marginTop: theme.spacing(12),
    display: 'inline-flex',
    width: "90%",
    alignItems: "center",
    height:"600px",
    flexBasis: 0.5,
    // maxHeight: "100%",
    marginBottom: "5px",
    flexDirection: "column",
    padding: theme.spacing(3),
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

function WeatherMap(props) {
  const { classes, theme, width, selectWeather, } = props;
  const [lng, setLng] = useState(-77.044311523435);
  const [lat, setLat] = useState(38.88598268628932);
  const [wMap, setWMap] = useState(null);
  const mapContainerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => {
    setIsSideDrawerOpen(true);
  }, [setIsSideDrawerOpen]);

  const closeDrawer = useCallback(() => {
    setIsSideDrawerOpen(false);
  }, [setIsSideDrawerOpen]);

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
      icon: <CompassCalibration className="text-white"/>
    },
    {
      name: 'baseVelocity',
      visibility: 'hidden',
      icon: <ClearAll className="text-white" />
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
    <>
    <Drawer
      anchor="right"
      variant="permanent"
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: open,
        [classes.drawerClose]: !open,
      })}
      classes={{
        paper: clsx({
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        }),
      }}
      style={{
        height: "10%"
      }}
      height='10%'
    >
      {/* <div className={classes.toolbar}>
        <IconButton onClick={closeDrawer}>
          {theme.direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </div> */}
      <Divider />
      <ButtonGroup orientation="vertical" style={{ minWidth: "5px" }}>
        {wMap && mapLayers.map((item, index) => {
          return (
            <Button
              key={item.name} 
              onClick={() => handleToggleLayer(item.name)}
              startIcon={item.icon}
              >
            </Button>
          )
        })}
      </ButtonGroup>
    </Drawer>
    <Paper xs={6} className={classes.mapContainer}>
      
      <div ref={mapContainerRef} className={classes.map} >
      <ButtonGroup orientation="vertical" style={{ minWidth: "5px" }}>
        {wMap && mapLayers.map((item, index) => {
          return (
            <Button
              key={item.name} 
              onClick={() => handleToggleLayer(item.name)}
              startIcon={item.icon}
              >
            </Button>
          )
        })}
      </ButtonGroup>
      </div>
    </Paper>
    </>
  )
}

export default withStyles(styles, { withTheme: true })(withWidth()(WeatherMap));
