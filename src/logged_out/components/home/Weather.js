/* eslint-disable no-useless-escape */
import React, {useState, useEffect, useCallback} from "react";
import PropTypes from "prop-types";
import { 
  Box,
  Grid, 
  Typography, 
  withWidth, 
  withStyles, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  MenuItem, 
  List, 
  ListItem, 
  ListItemText, 
  FormControl,
  ListItemSecondaryAction,
  Select,
  OutlinedInput,
  IconButton,
  Button} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Bordered from "../../../shared/components/Bordered";
// import calculateSpacing from "./calculateSpacing"
import classNames from "classnames";
//import theme from "../../../theme";
import Axios from "axios";
import { RefreshOutlined } from "@material-ui/icons";

const cheerio = require('cheerio')

const styles = theme => ({
    accordion: {
        backgroundColor: theme.palette.primary.dark,
      },
      numberInput: {
        width: 510,
      },
      numberInputInput: {
        padding: "9px 34px 9px 14.5px",
      },
      dBlock: { display: "block" },
      listItemLeftPadding: {
        paddingRight: theme.spacing(1),
      },
      AccordionDetails: {
        paddintTop: theme.spacing(0),
        justifyContent: "flex-start",
        backgroundColor: theme.palette.primary.dark
      },
});

const regexTests = [
    {
        name: "Sections",
        test: new RegExp(/((\.[A-Z| |\/]+\.\.\.)+((.[^&&]|\n)*))/, 'gm'),
    },
    {
        name: "afdSynopsis",
        test: new RegExp(/^(\.[A-Z]+\.\.\.)/, 'mg'),
    },
    {
        name: "stationTest",
         test: new RegExp(/((\w|\n|\d| |\/)+(Area Forecast Discussion(\w|\.)+)?(\w|\n|\d| |\/)+)[^&&][A-Z]{2}$/, 'mg'),
    },
    {
        name: "locationTest",
        test: new RegExp(/^National Weather Service ([\w|\/| ]+)/, 'gm'),
    }
];

function Weather(props) {
    const { classes } = props;
    const [accordionState, setAccordionState] = useState("Area Forecast Discussion");
    const [accordionBody, setAccordionBody] = useState("Body goes here");
    const [appState, setAppState] = useState({
        loading: false,
        data: "",
        product: "Area Forecast Discussion",
        title: "",
        body: "",
        station: "",
        date: "",
        location: "",
        synopsisT: "",
        synopsisB: "",
        nearTermT:"",
        nearTermB: "",
        shortTermT: "",
        shortTermB: "",
        longTermT: "",
        longTermB: "",
      });

    const handleChange = useCallback(
        (event) => {
          const {name, value} = event.target;
          // setSectionT(sectionT);
          if (name) {
            setAccordionState(value);
            setAccordionBody(name);
          }
        },
        [setAccordionState, setAccordionBody]
      );

    const fetchWeather = useCallback(() => {
        setAppState({loading: true});

        const afdUrl = 'https://forecast.weather.gov/product.php?site=NWS&issuedby=LWX&product=AFD';
        Axios.get(afdUrl)
          .then((data) => {
            const allData = cheerio.load(data.data);
            const afd = allData('pre.glossaryProduct')
            const afdText = afd.text();
            // console.log(afdText);
            var afdSynopsis = /^(\.[A-Z]+\.\.\.)/mg;
            var stationTest = /((\w|\n|\d| |\/)+(Area Forecast Discussion(\w|\.)+)?(\w|\n|\d| |\/)+)[^&&][A-Z]{2}$/mg;
            var locationTest = new RegExp(/^National Weather Service ([\w|\/| ]+)/, 'gm');
            var dateTest = new RegExp(/^\d{3,4} (A|P)M(.)*\d{4}$/, 'gm');
            var sectionsTest = new RegExp(/((\.[A-Z| |\/]+\.\.\.)+((.[^&&]|\n)*))/, 'gm');
            var nearTermTest = new RegExp(/((\.N[A-Z| |\/|\d]+\.\.\.)+((.[^&&]|\n)*))/, 'gm');
            var shortTermTest = new RegExp(/((\.SH[A-Z| |\/|\d]+\.\.\.)+((.[^&&]|\n)*))/, 'gm');
            var longTermTest = new RegExp(/((\.L[A-Z| |\/|\d]+\.\.\.)+((.[^&&]|\n)*))/, 'gm');
            var locationResult = locationTest.exec(afdText);
            var stationResult = stationTest.exec(afdText);
            var dateResult = dateTest.exec(afdText);
            var synopsisResult = afdSynopsis.exec(afdText);
            var sectionsResult = sectionsTest.exec(afdText);
            var nearTermResult = nearTermTest.exec(afdText);
            var shortTermResult = shortTermTest.exec(afdText);
            var longTermResult = longTermTest.exec(afdText);
            const stat = stationResult[0];
            const location = locationResult[1];
            const product = stationResult[3];
            const date = dateResult[0];
            const synopT = synopsisResult[0];
            const synopB = sectionsResult[3];
            const nearTT = nearTermResult[2];
            const nearTB = nearTermResult[3];
            const shortTT = shortTermResult[2];
            const shortTB = shortTermResult[3];
            const longTT = longTermResult[2];
            const longTB = longTermResult[3];
            sectionsResult.forEach((match, groupIndex) => {
              console.log(`Found match, group ${groupIndex}: ${match}`);
            });
            setAppState({
              loading: false, 
              data: afdText,
              title: "",
              body: "", 
              station: stat,
              date: date,
              product: product,
              location: location, 
              synopsisT: synopT, 
              synopsisB: synopB, 
              nearTermT: nearTT,
              nearTermB: nearTB,
              shortTermT: shortTT,
              shortTermB: shortTB,
              longTermT: longTT,
              longTermB: longTB
            });
          });
      }, [setAppState]);

    const parseWeather = useCallback(() => {
        const titleResult = regexTests[0].test.exec(appState.data);
        if(titleResult)
        {
            setAccordionState(titleResult[0]);
        }
    }, [appState.data, setAccordionState]);

    useEffect(() => {
        setAppState({loading: true});
        const afdUrl = 'https://forecast.weather.gov/product.php?site=NWS&issuedby=LWX&product=AFD';
        Axios.get(afdUrl)
          .then((data) => {
            const allData = cheerio.load(data.data);
            const afd = allData('pre.glossaryProduct')
            const afdText = afd.text();
            // console.log(afdText);
            var afdSynopsis = /^(\.[A-Z]+\.\.\.)/mg;
            var stationTest = /((\w|\n|\d| |\/)+(Area Forecast Discussion(\w|\.)+)?(\w|\n|\d| |\/)+)[^&&][A-Z]{2}$/mg;

            var locationResult = regexTests[3].test.exec(afdText);
            console.log(locationResult);
            
            var dateTest = new RegExp(/^\d{3,4} (A|P)M(.)*\d{4}$/, 'gm');
            var sectionsTest = new RegExp(/((\.[A-Z| |\/]+\.\.\.)+((.[^&&]|\n)*))/, 'gm');
            var nearTermTest = new RegExp(/((\.N[A-Z| |\/|\d]+\.\.\.)+((.[^&&]|\n)*))/, 'gm');
            var shortTermTest = new RegExp(/((\.SH[A-Z| |\/|\d]+\.\.\.)+((.[^&&]|\n)*))/, 'gm');
            var longTermTest = new RegExp(/((\.L[A-Z| |\/|\d]+\.\.\.)+((.[^&&]|\n)*))/, 'gm');
            var stationResult = stationTest.exec(afdText);
            var dateResult = dateTest.exec(afdText);
            var synopsisResult = afdSynopsis.exec(afdText);
            var sectionsResult = sectionsTest.exec(afdText);
            var nearTermResult = nearTermTest.exec(afdText);
            console.log(nearTermResult);
            var shortTermResult = shortTermTest.exec(afdText);
            var longTermResult = longTermTest.exec(afdText);
            console.log(stationResult);
            const stat = stationResult[0];
            const location = locationResult[1];
            const product = stationResult[3];
            const date = dateResult[0];
            const synopT = synopsisResult[0];
            const synopB = sectionsResult[3];
            const nearTT = nearTermResult[2];
            const nearTB = nearTermResult[3];
            const shortTT = shortTermResult[2];
            const shortTB = shortTermResult[3];
            const longTT = longTermResult[2];
            const longTB = longTermResult[3];
            console.log(stat);
            console.log(synopsisResult);
            sectionsResult.forEach((match, groupIndex) => {
              console.log(`Found match, group ${groupIndex}: ${match}`);
            });
            setAppState({
              loading: false, 
              data: afdText, 
              station: stat,
              date: date,
              product: product,
              location: location, 
              synopsisT: synopT, 
              synopsisB: synopB, 
              nearTermT: nearTT,
              nearTermB: nearTB,
              shortTermT: shortTT,
              shortTermB: shortTB,
              longTermT: longTT,
              longTermB: longTB
            });
          });
      }, [setAppState]);

    // useEffect(() => {
    //     setAppState({loading: true});
    //     const afdUrl = 'https://forecast.weather.gov/product.php?site=NWS&issuedby=LWX&product=AFD';
    //     Axios.get(afdUrl)
    //       .then((data) => {
    //         const allData = cheerio.load(data.data);
    //         const afd = allData('pre.glossaryProduct')
    //         const afdText = afd.text();
    //         setAppState({
    //           loading: false, 
    //           data: afdText, 
    //         });
    //       });
    //   }, [setAppState]);

    const sections = [
        {
          title: appState.date,
          body: appState.location,
          sectionName: "Header"
        },
        {
          title: appState.synopsisT,
          body: appState.synopsisB,
          sectionName: "Synopsis"
        },
        {
          title: appState.nearTermT,
          body: appState.nearTermB,
          sectionName: "Near Term"
        },
        {
          title: appState.shortTermT,
          body: appState.shortTermB,
          sectionName: "Short Term"
        },
        {
          title: appState.longTermT,
          body: appState.longTermB,
          sectionName: "Long Term"
        }
      ];

    return (
        <div>
            {sections.map((element, index) => (
                <Accordion className={classes.accordion} key={index}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon color="primary"/>}>
                        <Typography className="text-white">
                            {element.title}
                        </Typography>
                    </AccordionSummary>
                    <Bordered disableVerticalPadding disableBorderRadius>
                        <AccordionDetails>
                            <Typography className="text-white">
                                {element.body}
                            </Typography>
                        </AccordionDetails>
                    </Bordered>
                </Accordion>
            ))}
            <Box display="flex" justifyContent="flex-end">
                <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={parseWeather}
                >
                    {accordionState}
                </Button>
            </Box>
        </div>
    );
}

Weather.propTypes = {
    classes: PropTypes.object
}

export default withStyles(styles, { withTheme: true })(
    withWidth()(Weather)
);