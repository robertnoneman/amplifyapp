import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  YAxis,
  ReferenceLine,
} from "recharts";
import format from "date-fns/format";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  withStyles,
  Box,
} from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";

const styles = (theme) => ({
  cardContentInner: {
    marginTop: theme.spacing(-4),
  },
  card: {
    // backgroundColor: theme.palette.common.black,
  }
});

function labelFormatter(label) {
  return format(new Date(label * 1000), "MMM d, p");
}

function calculateMin(data, yKey, factor) {
  let max = Number.POSITIVE_INFINITY;
  data.forEach((element) => {
    if (max > element[yKey]) {
      max = element[yKey];
    }
  });
  return Math.round(max - max * factor);
}
function calculateMax(data, yKey, factor) {
  let min = Number.NEGATIVE_INFINITY;
  data.forEach((element) => {
    if (min < element[yKey]) {
      min = element[yKey];
    }
  });
  return Math.round((min - min * factor) + 15);
}

function CustomizedAxisTick(props) {
  const {x, y, payload} = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" fill="#666" fontSize={10} transform="rotate(-35)">{labelFormatter(payload.value)}</text>
    </g>
  );
}

const itemHeight = 216;
const options = ["1 Week", "1 Day", "12 Hours"];

function CardChart(props) {
  const { data, title, classes, theme, height } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOption, setSelectedOption] = useState("1 Week");

  const handleClick = useCallback(
    (event) => {
      setAnchorEl(event.currentTarget);
    },
    [setAnchorEl]
  );

  const formatter = useCallback(
    (value) => {
      return [value, title];
    },
    [title]
  );

  const getSubtitle = useCallback(() => {
    switch (selectedOption) {
      case "1 Week":
        return "Next week";
      case "1 Day":
        return "Next Day";
      case "12 Hours":
        return "Next 12 Hours";
      default:
        throw new Error("No branch selected in switch-statement");
    }
  }, [selectedOption]);

  const processData = useCallback(() => {
    let seconds;
    switch (selectedOption) {
      case "1 Week":
        seconds = 60 * 60 * 24 * 7;
        break;
      case "1 Day":
        seconds = 60 * 60 * 24;
        break;
      case "12 Hours":
        seconds = 60 * 60 * 12;
        break;
      default:
        throw new Error("No branch selected in switch-statement");
    }
    const minSeconds = new Date() / 1000 - seconds;
    const arr = [];
    for (let i = 0; i < data.length; i += 1) {
      if (minSeconds < data[i].timestamp) {
        arr.unshift(data[i]);
      }
    }
    return arr;
  }, [data, selectedOption]);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, [setAnchorEl]);

  const selectOption = useCallback(
    (selectedOption) => {
      setSelectedOption(selectedOption);
      handleClose();
    },
    [setSelectedOption, handleClose]
  );
  const isOpen = Boolean(anchorEl);
  return (
    <Card className={classes.card}>
      <Box pt={2} px={2} pb={4}>
        <Box display="flex" justifyContent="space-between">
          <div>
            <Typography variant="subtitle1" className="text-white">{title}</Typography>
            <Typography variant="body2" color="secondary">
              {getSubtitle()}
            </Typography>
          </div>
          <div>
            <IconButton
              aria-label="More"
              aria-owns={isOpen ? "long-menu" : undefined}
              aria-haspopup="true"
              onClick={handleClick}
            >
              <MoreVertIcon className="text-white"/>
            </IconButton>
            <Menu
              id="long-menu"
              anchorEl={anchorEl}
              open={isOpen}
              onClose={handleClose}
              PaperProps={{
                style: {
                  maxHeight: itemHeight,
                  width: 200,
                  backgroundColor: theme.palette.secondary.dark
                },
              }}
              disableScrollLock
            >
              {options.map((option) => (
                <MenuItem
                  key={option}
                  selected={option === selectedOption}
                  className="text-white"
                  onClick={() => {
                    selectOption(option);
                  }}
                  name={option}
                >
                  {option}
                </MenuItem>
              ))}
            </Menu>
          </div>
        </Box>
      </Box>
      <CardContent>
        <Box className={classes.cardContentInner} height={height}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={processData()} type="number" baseValue={0}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="-0.1" x2="0" y2="1">
                <stop offset="1%" stopColor="#ae1313" stopOpacity={0.9}/>
                <stop offset="25%" stopColor="#36db24" stopOpacity={0.95}/>
                <stop offset="50%" stopColor="#137bae" stopOpacity={0.7}/>
                <stop offset="85%" stopColor="#b857ef" stopOpacity={0.5}/>
              </linearGradient>
            </defs>
              <ReferenceLine y="32" stroke="#137bae"/>
              <XAxis
                dataKey="timestamp"
                //type="number"
                tick={<CustomizedAxisTick/>}
                tickFormatter={labelFormatter}
                reversed
                domain={["dataMin", "dataMax"]}
                height={100}
              />
              <YAxis
                // domain={[calculateMin(data, "value", 0.1), "dataMax"]}
                domain={[calculateMin(data, "value", 0.01), calculateMax(data, "value", 0.05)]}
                interval={0}
                //label="Temperature"
                //hide
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="url(#colorUv)"
                fill="url(#colorUv)"
                unit="°"
              />
              <Tooltip
                labelFormatter={labelFormatter}
                formatter={formatter}
                cursor={false}
                contentStyle={{
                  border: "none",
                  padding: theme.spacing(1),
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: theme.shadows[1],
                  backgroundColor: theme.palette.secondary.dark
                }}
                labelStyle={theme.typography.body1}
                itemStyle={{
                  fontSize: theme.typography.body1.fontSize,
                  letterSpacing: theme.typography.body1.letterSpacing,
                  fontFamily: theme.typography.body1.fontFamily,
                  lineHeight: theme.typography.body1.lineHeight,
                  fontWeight: theme.typography.body1.fontWeight,
                  color: "white"
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

CardChart.propTypes = {
  color: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  height: PropTypes.string.isRequired,
};

export default withStyles(styles, { withTheme: true })(CardChart);
