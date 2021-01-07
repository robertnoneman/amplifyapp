import React, {useState, useEffect, useCallback } from 'react';
import { Line, ResponsiveLine } from "@nivo/line";
import { Button, withStyles } from "@material-ui/core";
import testHourly from "../../test_data/testHourlyData.json";
import format from "date-fns/format";
import PropTypes from "prop-types";

const commonProperties = {
  width: 900,
  height: 400,
  margin: { top: 20, right: 20, bottom: 60, left: 80 },
  animate: true,
  enableSlices: 'x',
}

const styles = (theme) => ({
  clouds: {
    backgroundColor: theme.palette.common.black,
  }
});

function formatTime(unix, offset) {
  const seconds = unix - offset;
  const secs = seconds * 1000;
  // console.log(`unix, offset, secs: ${unix} ${offset} ${secs}`);
  return format(new Date(secs), "Y-MM-dd hh:mm");
}

function WeatherCharts(props) {
  const { data, theme } = props;
  const [formattedData, setFormattedData] = useState([testHourly.formatted[0]]);
  const [loaded, setLoaded] = useState(false);

  const dataStructure = [
    {
      "id": "clouds",
      "color": theme.palette.data.sun,
      data: [{x: 0, y: 0 }]
    },
    {
      "id": "dewPoint",
      "color": theme.palette.primary.light,
      data: [{x: 0, y: 0 }]
    },
    {
      "id": "feelsLike",
      "color": theme.palette.primary.main,
      data: [{x: 0, y: 0 }]
    },
    {
      "id": "humidity",
      "color": theme.palette.primary.dark,
      data: [{x: 0, y: 0 }]
    },
    {
      "id": "pop",
      "color": theme.palette.secondary.light,
      data: [{x: 0, y: 0 }]
    },
    {
      "id": "pressure",
      "color": theme.palette.secondary.main,
      data: [{x: 0, y: 0 }]
    },
    {
      "id": "temp",
      "color": theme.palette.secondary.dark,
      data: [{x: 0, y: 0 }]
    },
    {
      "id": "uvi",
      "color": theme.palette.background.default,
      data: [{x: 0, y: 0 }]
    },
    {
      "id": "visibility",
      "color": theme.palette.common.darkBlack,
      data: [{x: 0, y: 0 }]
    },
    {
      "id": "windDeg",
      "color": theme.palette.common.black,
      data: [{x: 0, y: 0 }]
    },
    {
      "id": "windSpeed",
      "color": theme.palette.warning.main,
      data: [{x: 0, y: 0 }]
    }
  ];

  const whatintheactualfuckisgoingon = [
    {
        id: 'fake corp. A',
        data: [
            { x: '2018-01-01', y: 7 },
            { x: '2018-01-02', y: 5 },
            { x: '2018-01-03', y: 11 },
            { x: '2018-01-04', y: 9 },
            { x: '2018-01-05', y: 12 },
            { x: '2018-01-06', y: 16 },
            { x: '2018-01-07', y: 13 },
            { x: '2018-01-08', y: 13 },
        ],
    },
    {
        id: 'fake corp. B',
        data: [
            { x: '2018-01-04', y: 14 },
            { x: '2018-01-05', y: 14 },
            { x: '2018-01-06', y: 15 },
            { x: '2018-01-07', y: 11 },
            { x: '2018-01-08', y: 10 },
            { x: '2018-01-09', y: 12 },
            { x: '2018-01-10', y: 9 },
            { x: '2018-01-11', y: 7 },
        ],
    },
]

  const getData = useCallback(() => {
    if (loaded) return;
    // const temporaryData = Array.from(dataStructure);
    // const tempData = Array.from(testHourly);
    // console.log(temporaryData[0].id);
    // console.log(data[i])
    const tempClouds = {
        "id": "clouds",
        "color": theme.palette.data.sun,
        "data": []
    };
    const tempDewPoint = {
        "id": "dewPoint",
        "color": theme.palette.primary.light,
        data: [{x: 0, y: 0 }]
    };
      const tempFeelsLike = {
      "id": "feelsLike",
      "color": theme.palette.primary.main,
      data: [{x: 0, y: 0 }]
    };
    const tempPop = {
      "id": "pop",
      "color": theme.palette.primary.dark,
      data: [{x: 0, y: 0 }]
    };
    const tempPressure = {
      "id": "pressure",
      "color": theme.palette.secondary.light,
      data: [{x: 0, y: 0 }]
    };
    const tempTemp = {
      "id": "temp",
      "color": theme.palette.secondary.main,
      data: [{x: 0, y: 0 }]
    };
    const tempUvi = {
      "id": "uvi",
      "color": theme.palette.background.default,
      data: [{x: 0, y: 0 }]
    };
    const tempVisibility = {
      "id": "visibility",
      "color": theme.palette.common.darkBlack,
      data: [{x: 0, y: 0 }]
    };
    const tempWindDeg = {
      "id": "windDeg",
      "color": theme.palette.common.black,
      data: [{x: 0, y: 0 }]
    };
    const tempWindSpeed = {
      "id": "windSpeed",
      "color": theme.palette.warning.main,
      data: [{x: 0, y: 0 }]
    };
    const tempTime = [];
        /*
      Needs to be an OBJECT for each data series,
      so... 
      for (let i = 0; i < data.length, i++) {
        temporaryData[0].data.x = data.time[i];
        temport
      }
    */
   console.log(`tempData clouds: ${testHourly.hourly[0].clouds}`);
   const noMilliTest = new RegExp(/^.{0,20}/, 'mg');
    for (var i = 0; i < testHourly.hourly.length; i++) {
      // const date = new Date(testHourly.hourly[i].dt * 1000);
      const date = testHourly.formatted[0].data[i].x;
      const noMilli = noMilliTest.exec(date);
      const sliced = date.slice(0, 19)
      tempClouds.data[i] = {
        // x: formatTime(testHourly.hourly[i].dt, 0),
        x: sliced,
        y: testHourly.hourly[i].clouds
      };
      console.log(tempClouds.data[i]);
    };
    const whatintheactualfuckisgoingon = [
      {
          id: 'fake corp. A',
          data: [
              { x: '2018-01-01', y: 7 },
              { x: '2018-01-02', y: 5 },
              { x: '2018-01-03', y: 11 },
              { x: '2018-01-04', y: 9 },
              { x: '2018-01-05', y: 12 },
              { x: '2018-01-06', y: 16 },
              { x: '2018-01-07', y: 13 },
              { x: '2018-01-08', y: 13 },
          ],
      },
      {
          id: 'fake corp. B',
          data: [
              { x: '2018-01-04', y: 14 },
              { x: '2018-01-05', y: 14 },
              { x: '2018-01-06', y: 15 },
              { x: '2018-01-07', y: 11 },
              { x: '2018-01-08', y: 10 },
              { x: '2018-01-09', y: 12 },
              { x: '2018-01-10', y: 9 },
              { x: '2018-01-11', y: 7 },
          ],
      },
  ]
    
    setFormattedData([tempClouds]);
    // setFormattedData(testHourly.formatted[0]);
    setLoaded(true);
  }, [data, dataStructure, loaded, setLoaded, setFormattedData]);

  const handleRefresh = useCallback(
    () => {
      getData();
  }, [getData]);

  useEffect(() => {
    
    getData();
  }, [getData]);

  return (
    <>
     {loaded && <Line
        {...commonProperties}
        // data={[
        //     {
        //         id: 'fake corp. A',
        //         data: [
        //             { x: '2018-01-01', y: 7 },
        //             { x: '2018-01-02', y: 5 },
        //             { x: '2018-01-03', y: 11 },
        //             { x: '2018-01-04', y: 9 },
        //             { x: '2018-01-05', y: 12 },
        //             { x: '2018-01-06', y: 16 },
        //             { x: '2018-01-07', y: 13 },
        //             { x: '2018-01-08', y: 13 },
        //         ],
        //     },
        //     {
        //         id: 'fake corp. B',
        //         data: [
        //             { x: '2018-01-04', y: 14 },
        //             { x: '2018-01-05', y: 14 },
        //             { x: '2018-01-06', y: 15 },
        //             { x: '2018-01-07', y: 11 },
        //             { x: '2018-01-08', y: 10 },
        //             { x: '2018-01-09', y: 12 },
        //             { x: '2018-01-10', y: 9 },
        //             { x: '2018-01-11', y: 7 },
        //         ],
        //     },
        // ]}
        data={formattedData}
        xScale={{
            type: 'time',
            // format: '%Y-%m-%d',
            format: '%Y-%m-%dT%H:%M:%S',
            // format: 'native',
            useUTC: false,
            precision: 'minute',
        }}
        // xFormat="time:%Y-%m-%d"
        xFormat="time:%Y-%m-%dT%H:%M:%S"
        yScale={{
            type: 'linear',
            stacked: (false),
        }}
        axisLeft={{
            legend: 'linear scale',
            legendOffset: 12,
        }}
        axisBottom={{
            format: '%b %d',
            tickValues: 'every 2 days',
            legend: 'time scale',
            legendOffset: -12,
        }}
        // curve={select('curve', curveOptions, 'monotoneX')}
        enablePointLabel={true}
        // pointSymbol={CustomSymbol}
        pointSize={16}
        pointBorderWidth={1}
        pointBorderColor={{
            from: 'color',
            modifiers: [['darker', 0.3]],
        }}
        useMesh={true}
        enableSlices={false}
        />
      } 
    </> 
  );

} 
export default withStyles(styles, { withTheme: true })(WeatherCharts)
// export default NivoLine;

    {/* <Button onClick={handleRefresh}>
      Refresh
    </Button>
     <Line
      {...commonProperties}
      //  
      // data={formattedData}
      data={[
        {
            id: 'fake corp. A',
            data: [
                { x: '2018-01-01', y: 7 },
                { x: '2018-01-02', y: 5 },
                { x: '2018-01-03', y: 11 },
                { x: '2018-01-04', y: 9 },
                { x: '2018-01-05', y: 12 },
                { x: '2018-01-06', y: 16 },
                { x: '2018-01-07', y: 13 },
                { x: '2018-01-08', y: 13 },
            ],
        },
        {
            id: 'fake corp. B',
            data: [
                { x: '2018-01-04', y: 14 },
                { x: '2018-01-05', y: 14 },
                { x: '2018-01-06', y: 15 },
                { x: '2018-01-07', y: 11 },
                { x: '2018-01-08', y: 10 },
                { x: '2018-01-09', y: 12 },
                { x: '2018-01-10', y: 9 },
                { x: '2018-01-11', y: 7 },
            ],
        },
      ]}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{
        type: 'time',
        format: '%Y-%m-%d',
        useUTC: false,
        precision: 'day',
      }}
      xFormat="time:%Y-%m-%d"
      yScale={{
        type: "linear",
        // min: "auto",
        // max: "auto",
        stacked: false,
        // reverse: false
      }}
      axisLeft={{
        legend: 'linear scale',
        // legendOffset: 12,
      }}
      axisBottom={{
        // format: '%d',
        // tickValues: 3,
        // legend: 'time scale',
        // legendOffset: -12,
      }}
        curve='monotoneX'
        // animate={false}
        colors={{ scheme: "nivo" }}
        useMesh={true}
        enableSlices={false}
    />
    </> */}