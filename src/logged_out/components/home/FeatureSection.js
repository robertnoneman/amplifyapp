import React from "react";
import PropTypes from "prop-types";
import { Grid, Typography, isWidthUp, withStyles, withWidth } from "@material-ui/core";
import CodeIcon from "@material-ui/icons/Code";
import BuildIcon from "@material-ui/icons/Build";
import ComputerIcon from "@material-ui/icons/Computer";
import BarChartIcon from "@material-ui/icons/BarChart";
import HeadsetMicIcon from "@material-ui/icons/HeadsetMic";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import CloudIcon from "@material-ui/icons/Cloud";
import MeassageIcon from "@material-ui/icons/Message";
import CancelIcon from "@material-ui/icons/Cancel";
import calculateSpacing from "./calculateSpacing";
import FeatureCard from "./FeatureCard";
import WaveBorder from "../../../shared/components/WaveBorder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faReact, 
  faAws,
  faNodeJs,
  faConnectdevelop,

} from "@fortawesome/free-brands-svg-icons";
import { faCloudSunRain, faProjectDiagram, faVial } from "@fortawesome/free-solid-svg-icons";
import { AssignmentTurnedIn, VpnKey } from "@material-ui/icons";

const iconSize = 30;

const styles = (theme) => ({
  waveBorder: {
    paddingTop: theme.spacing(4),
  },
  "@keyframes moveForever": {
    from: { transform: "translate3d(-90px, 0, 0)" },
    to: { transform: "translate3d(85px, 0, 0)" }
  },
  parallax: {
    "& > use": {
      animation: "$moveForever 4s cubic-bezier(0.62, 0.5, 0.38, 0.5) infinite",
      animationDelay: props => `-${props.animationNegativeDelay}s`
    }
  }
}); 

const features = [
  {
    color: "#fe9800",
    headline: "AWS Backend",
    text:
      "Commits to master branch are automatically deployed. If this text isn't two lines, these items look misaligned.",
    // icon: <BuildIcon style={{ fontSize: iconSize }} />,
    icon: <FontAwesomeIcon icon={faAws} style={{ fontSize: iconSize }}/>,
    mdDelay: "0",
    smDelay: "0"
  },
  {
    color: "#6200EA",
    headline: "Fun Animations",
    text:
      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et.",
    icon: <CalendarTodayIcon style={{ 
      fontSize: iconSize,
      animation: "App-logo-spin infinite 10s linear",
      keyframes: {
        from: { transform: "rotate(0deg)" },
        to: { transform: "rotate(360deg)"}
      }
      }} 
    />,
    mdDelay: "200",
    smDelay: "200"
  },
  {
    color: "#61dafb",
    headline: "React Frontend",
    text:
      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et.",
    // icon: <MeassageIcon style={{ fontSize: iconSize }} />,
    // icon: <FontAwesomeIcon icon={['fab', 'fa-react']} style={{ fontSize: iconSize }} />,
    icon: <FontAwesomeIcon icon={faReact} style={{ fontSize: iconSize }} />,
    mdDelay: "400",
    smDelay: "0"
  },
  {
    color: "#e96d49",
    headline: "Weather Data",
    text:
      "Weather data obtained from OpenWeatherMap, NWS REST API, and by scrapping NWS HTML.",
    // icon: <ComputerIcon style={{ fontSize: iconSize }} />,
    icon: <FontAwesomeIcon icon={faCloudSunRain} style={{ fontSize: iconSize }} />,
    mdDelay: "0",
    smDelay: "200"
  },
  {
    color: "#DD2C00",
    headline: "Experiments",
    text:
      "The sandbox section has several experiments with interesting frontend packages.",
    // icon: <BarChartIcon style={{ fontSize: iconSize }} />,
    icon: <FontAwesomeIcon icon={faVial} style={{ fontSize: iconSize }} />,
    mdDelay: "200",
    smDelay: "0"
  },
  {
    color: "#8bc500",
    headline: "NODEjs",
    text:
      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et.",
    icon: <FontAwesomeIcon icon={faNodeJs} style={{ fontSize: iconSize }} />,
    mdDelay: "400",
    smDelay: "200"
  },
  {
    color: "#304FFE",
    headline: "Todo/kanban",
    text:
      "Drag and drop functionality. Kanban cards also support github-flavored markup.",
    // icon: <CloudIcon style={{ fontSize: iconSize }} />,
    icon: <AssignmentTurnedIn style={{ fontSize: iconSize }} />,
    mdDelay: "0",
    smDelay: "0"
  },
  {
    color: "#de33a6",
    headline: "graphql API",
    text:
      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et.",
    // icon: <CodeIcon style={{ fontSize: iconSize }} />,
    // icon: <FontAwesomeIcon icon={faProjectDiagram} style={{ fontSize: iconSize }} />,
    icon: <FontAwesomeIcon icon={faConnectdevelop} style={{ fontSize: iconSize }} />,
    mdDelay: "200",
    smDelay: "200"
  },
  {
    color: "#00B8D4",
    headline: "Authentification",
    text:
      "Sort of..",
    // icon: <CancelIcon style={{ fontSize: iconSize }} />,
    icon: <VpnKey style={{ fontSize: iconSize }} />,
    mdDelay: "400",
    smDelay: "0"
  }
];

function FeatureSection(props) {
  const { classes, theme, width } = props;
  return (
    <div style={{ backgroundColor: "#31353eff" }}>
      <div className="container-fluid lg-p-top">
        <Typography variant="h3" align="center" className="lg-mg-bottom text-white">
          Features
        </Typography>
        <div className="container-fluid lg-mg-bottom">
          <Grid container spacing={calculateSpacing(width)} >
            {features.map(element => (
              <Grid
                item
                xs={6}
                md={4}
                data-aos="zoom-in-up"
                data-aos-delay={
                  isWidthUp("md", width) ? element.mdDelay : element.smDelay
                }
                key={element.headline}
              >
                <FeatureCard
                  Icon={element.icon}
                  color={element.color}
                  headline={element.headline}
                  text={element.text}
                  className="text-white"
                />
              </Grid>
            ))}
          </Grid>
        </div>
      </div>
      <WaveBorder
        upperColor="#31353eff"
        lowerColor={theme.palette.secondary.main}
        className={classes.waveBorder}
        animationNegativeDelay={2}
      />
    </div>
  );
}

FeatureSection.propTypes = {
  classes: PropTypes.object,
  width: PropTypes.string.isRequired,
  theme: PropTypes.object,
};

export default withWidth()(
  withStyles(styles, { withTheme: true })(FeatureSection)
);
