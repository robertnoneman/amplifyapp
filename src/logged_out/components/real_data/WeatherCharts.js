import React, {useState, useEffect } from 'react';
import { Line, } from "@nivo/line";
import { linearGradientDef } from '@nivo/core'
import testHourly from "../../test_data/testHourlyData.json";
// import format from "date-fns/format";

function formatTime(unix, offset) {
  const seconds = unix; // - offset;
  const secs = seconds * 1000;
  // console.log(`unix, offset, secs: ${unix} ${offset} ${secs}`);
  // return format(new Date(secs), "Y-MM-dd hh:mm");
  return (new Date(secs).toISOString());
}

function WeatherCharts(props) {
  const { data } = props;
  const [formattedData, setFormattedData] = useState([{
    "id": "clouds",
    "color": "#ffe747",
    "data": [
      {
        "x": "2021-01-07T21:00:00",
        "y": 1
      },
    ]
  }]);
  const [loaded, setLoaded] = useState(false);
  
  // const keys = ['clouds', "dewPoint", "feelsLike", "pop", "pressure", "temp", "uvi", "visibility", "windDeg", "windSpeed"];

  const [commonProperties, setCommonProperties] = useState({
    width: 900,
    height: 500,
    margin: { top: 50, right: 20, bottom: 60, left: 80 },
    animate: true,
    enableGridX: false,
    enableArea: true,
    theme: {
      "background": "#232222ff",
      "textColor": "#ddd",
      "fontSize": 11,
      tooltip: {
        container: {
            background: '#222',
        },
      },
    "grid": {
      "line": {
          "stroke": "#555",
          "strokeWidth": 0.5
      }
    }
    },
    enableSlices: 'x',
  });

  async function loadData() {
    if (loaded) return;

    const tempClouds = {
        "id": "clouds",
        "color": '#eee', //theme.palette.data.sun,
        "data": []
    };
    const tempDewPoint = {
        "id": "dewPoint",
        "color": "#ef6c2a", //theme.palette.primary.light,
        data: []
    };
    const tempHumidity = {
      "id": "humidity",
      "color": "#9e9", //theme.palette.primary.light,
      data: []
  };
      const tempFeelsLike = {
      "id": "feelsLike",
      "color": '#E12C2C', //theme.palette.primary.main,
      data: []
    };
    const tempPop = {
      "id": "pop",
      "color": '#2aadef', //theme.palette.primary.dark,
      data: [],
    };
    const tempPressure = {
      "id": "pressure",
      "color": '#ffe747', //theme.palette.secondary.light,
      data: []
    };
    const tempTemp = {
      "id": "temp",
      "color": '#cb1a79', //theme.palette.secondary.main,
      data: []
    };
    const tempUvi = {
      "id": "uvi",
      "color": '#31353eff', //theme.palette.background.default,
      data: []
    };
    const tempVisibility = {
      "id": "visibility",
      "color": '#ffa070', //theme.palette.common.darkBlack,
      data: []
    };
    // eslint-disable-next-line no-unused-vars
    const tempWindDeg = {
      "id": "windDeg",
      "color": '#ff5c5c', //theme.palette.common.black,
      data: []
    };
    const tempWindSpeed = {
      "id": "windSpeed",
      "color": '#62c3f3', //theme.palette.warning.main,
      data: []
    };
  
    for (var i = 0; i < testHourly.hourly.length; i++) {
      // const date = testHourly.formatted[0].data[i].x;
      const date = formatTime(data[i].rawTimestamp, data[i].offset);
      // const date = (data[i].rawTimestamp * 1000);
      // console.log(date);
      const sliced = date.slice(0, 19)
      tempClouds.data[i] = {
        x: sliced,
        // y: testHourly.hourly[i].clouds
        y: data[i].clouds
      };
      tempDewPoint.data[i] = {
        x: sliced,
        // y: testHourly.hourly[i].dew_point
        y: data[i].dewPoint
      };
      tempHumidity.data[i] = {
        x: sliced,
        // y: testHourly.hourly[i].dew_point
        y: data[i].humidity
      };
      tempFeelsLike.data[i] = {
        x: sliced,
        // y: testHourly.hourly[i].feels_like
        y: data[i].feelsLike
      };
      tempPop.data[i] = {
        x: sliced,
        // y: testHourly.hourly[i].pop
        y: data[i].pop
      };
      tempPressure.data[i] = {
        x: sliced,
        // y: testHourly.hourly[i].pressure * 0.0295300
        y: data[i].pressure
      };
      tempTemp.data[i] = {
        x: sliced,
        // y: testHourly.hourly[i].temp
        y: data[i].temp
      };
      tempUvi.data[i] = {
        x: sliced,
        // y: testHourly.hourly[i].uvi
        y: data[i].uvi
      };
      tempVisibility.data[i] = {
        x: sliced,
        // y: testHourly.hourly[i].visibility
        y: data[i].visibility
      };
      tempWindSpeed.data[i] = {
        x: sliced,
        // y: testHourly.hourly[i].wind_speed
        y: data[i].windSpeed
      };
      // console.log(tempClouds.data[i]);
    };
    
    setFormattedData([tempClouds, tempDewPoint, tempHumidity, tempFeelsLike, tempPop, tempPressure, tempTemp, tempUvi, tempWindSpeed]);
    // setFormattedData(testHourly.formatted[0]);
    setLoaded(true);
  }

  // const getData = useCallback(() => {
  //   if (loaded) return;

  //   const tempClouds = {
  //       "id": "clouds",
  //       "color": '#E12C2C', //theme.palette.data.sun,
  //       "data": []
  //   };
  //   const tempDewPoint = {
  //       "id": "dewPoint",
  //       "color": "#ef6c2a", //theme.palette.primary.light,
  //       data: []
  //   };
  //     const tempFeelsLike = {
  //     "id": "feelsLike",
  //     "color": '#E12C2C', //theme.palette.primary.main,
  //     data: []
  //   };
  //   const tempPop = {
  //     "id": "pop",
  //     "color": '#2aadef', //theme.palette.primary.dark,
  //     data: [],
  //   };
  //   const tempPressure = {
  //     "id": "pressure",
  //     "color": '#ffe747', //theme.palette.secondary.light,
  //     data: []
  //   };
  //   const tempTemp = {
  //     "id": "temp",
  //     "color": '#43182f', //theme.palette.secondary.main,
  //     data: []
  //   };
  //   const tempUvi = {
  //     "id": "uvi",
  //     "color": '#31353eff', //theme.palette.background.default,
  //     data: []
  //   };
  //   const tempVisibility = {
  //     "id": "visibility",
  //     "color": '#ffa070', //theme.palette.common.darkBlack,
  //     data: []
  //   };
  //   const tempWindDeg = {
  //     "id": "windDeg",
  //     "color": '#ff5c5c', //theme.palette.common.black,
  //     data: []
  //   };
  //   const tempWindSpeed = {
  //     "id": "windSpeed",
  //     "color": '#62c3f3', //theme.palette.warning.main,
  //     data: []
  //   };
  
  //   for (var i = 0; i < testHourly.hourly.length; i++) {
  //     // const date = new Date(testHourly.hourly[i].dt * 1000);
  //     const date = testHourly.formatted[0].data[i].x;
  //     const sliced = date.slice(0, 19)
  //     tempClouds.data[i] = {
  //       // x: formatTime(testHourly.hourly[i].dt, 0),
  //       x: sliced,
  //       y: testHourly.hourly[i].clouds
  //     };
  //     tempDewPoint.data[i] = {
  //       // x: formatTime(testHourly.hourly[i].dt, 0),
  //       x: sliced,
  //       y: testHourly.hourly[i].dew_point
  //     };
  //     // console.log(tempClouds.data[i]);
  //   };
    
  //   setFormattedData([tempClouds, tempDewPoint]);
  //   // setFormattedData(testHourly.formatted[0]);
  //   setLoaded(true);
  // }, [loaded]);

  useEffect(() => {
    // getData();
    loadData();
  }, []);

  return (
    <>
     {<Line
        {...commonProperties}
        data={formattedData}
        enableSlices="x"
        defs={[
          linearGradientDef('gradientA', [
              { offset: 0, color: 'inherit' },
              { offset: 100, color: 'inherit', opacity: 0 },
          ]),
      ]}
      fill={[{ match: '*', id: 'gradientA' }]}
        sliceTooltip={({ slice }) => {
          return (
              <div
                  style={{
                      background: '#222',
                      padding: '9px 12px',
                      border: '1px solid #ccc',
                  }}
              >
                  <div>x: {slice.id}</div>
                  {slice.points.map(point => (
                      <div
                          key={point.id}
                          style={{
                              color: point.serieColor,
                              padding: '3px 0',
                          }}
                      >
                          <strong>{point.serieId}</strong> [{point.data.yFormatted}]
                      </div>
                  ))}
              </div>
          )
      }}
        xScale={{
            type: 'time',
            format: '%Y-%m-%dT%H:%M:%S',
            useUTC: false,
            precision: 'minute',
        }}
        // xFormat="time:%Y-%m-%d"
        xFormat="time:%Y-%m-%dT%H:%M:%S"
        yScale={{
            type: 'linear',
            stacked: (false),
        }}
        // axisLeft={{
        //     legend: 'linear scale',
        //     legendOffset: 12,
        // }}
        axisBottom={{
            format: '%a %I:%M %p',
            tickValues:  0, //"Every 2 hours",
            // legend: 'time scale',
            tickSize: 20,
            // tickPadding: 20,
            tickRotation: -25,
            legendOffset: 6,
            legendPosition: 'middle'
            // legendOffset: -6,
        }}
        curve='monotoneX'
        enablePointLabel={false}
        // pointSymbol={CustomSymbol}
        pointSize={8}
        pointBorderWidth={1}
        pointBorderColor={{
            from: 'color',
            modifiers: [['darker', 0.3]],
        }}
        useMesh={true}
        
        colors={{ datum: 'color' }}
        // colors={{ scheme: 'spectral' }}
        />
      } 
    </> 
  );

} 
export default (WeatherCharts) // withStyles(styles, { withTheme: true })(WeatherCharts)

// const whatintheactualfuckisgoingon = [
//   {
//       id: 'fake corp. A',
//       data: [
//           { x: '2018-01-01', y: 7 },
//           { x: '2018-01-02', y: 5 },
//           { x: '2018-01-03', y: 11 },
//           { x: '2018-01-04', y: 9 },
//           { x: '2018-01-05', y: 12 },
//           { x: '2018-01-06', y: 16 },
//           { x: '2018-01-07', y: 13 },
//           { x: '2018-01-08', y: 13 },
//       ],
//   },
//   {
//       id: 'fake corp. B',
//       data: [
//           { x: '2018-01-04', y: 14 },
//           { x: '2018-01-05', y: 14 },
//           { x: '2018-01-06', y: 15 },
//           { x: '2018-01-07', y: 11 },
//           { x: '2018-01-08', y: 10 },
//           { x: '2018-01-09', y: 12 },
//           { x: '2018-01-10', y: 9 },
//           { x: '2018-01-11', y: 7 },
//       ],
//   },
// ]


/*
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
*/