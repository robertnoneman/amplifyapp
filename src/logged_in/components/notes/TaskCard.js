import React, { useState } from "react";
import { 
  Card,
  IconButton,
  Typography,
  withStyles,
} from "@material-ui/core";
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import { DeleteOutline, EditOutlined } from "@material-ui/icons";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import format from "date-fns/format";

const styles = theme => ({
  newNote: {
    paddingBottom: theme.spacing(2),
  },
  card: {
    boxShadow: theme.shadows[2],
    paddingTop: theme.spacing(2),
    // paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    // border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: theme.shape.borderRadius * 1,
    background: 'linear-gradient(30deg, #2196f325 30%, #21cbf325 90%)',
    // display: "flex"
    // maxWidth: '430px',
    // justifyContent: "flex-end"
    //marginTop: theme.spacing(2),
  },
  cardTitle: {
    background: 'linear-gradient(30deg, #2196f3aa 30%, #21cbf3bb 90%)',
    marginBottom: theme.spacing(2),
  },
  title: {
    transition: theme.transitions.create(["background-color"], {
      duration: theme.transitions.duration.complex,
      easing: theme.transitions.easing.easeInOut,
    }),
    cursor: "pointer",
    color: theme.palette.secondary.main,
    "&:hover": {
      color: theme.palette.secondary.dark,
    },
    "&:active": {
      color: theme.palette.primary.dark,
    },
  },
  divider: {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.main,
    margin: theme.spacing(1),
  },
  toolbar: {
    marginRight: theme.spacing(2),
    // display: grid
  },
  timeStamp: {
    fontSize: "10.5px",
    alignItems: "flex-start",
    marginTop: "-10px",
    // alignSelf: "flex-start" // NOTE: Doesn't seem to do anything
  },
  cardFooter: {
    display: "flex",
    justifyContent: "flex-end",
  }
});

const Accordion = withStyles({
  root: {
    border: '1px solid rgba(0, 0, 0, .125)',
    backgroundColor: 'rgba(0, 0, 0, .125)',
    borderRadius: "4px",
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 1,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles({
  root: {
    backgroundColor: 'rgba(0, 0, 0, .001)',
    borderBottom: '1px solid #ef6c2a',
    marginBottom: -1,
    minHeight: 56,
    '&$expanded': {
      minHeight: 56,
    },
  },
  content: {
    '&$expanded': {
      margin: '6px 0',
    },
  },
  expanded: {},
})(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(1),
    textAlign: 'left',
    flexDirection: 'column',
  },
}))(MuiAccordionDetails);

function labelFormatter(label) {
  if (!label) return;
  var labelString = label.toString();
  var clipped = labelString.slice(0, labelString.length - 5)
  // console.log(`Clipped: ${clipped}`)
  let seconds = Date.parse(clipped);
  return format(new Date(seconds), "MMM d, p");
}

function TaskCard(props) {
  const { classes, name, description, createdAt, deleteNote, openEditForm, noteData, colIndex, index} = props;
  const [expanded, setExpanded] = useState('false');

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  return (
    <Card className={classes.card}>
      <Typography className={classes.timeStamp} align="right">
        {/* {createdAt} */}
        {labelFormatter(createdAt)}
        {/* {format(new Date(Date.parse(createdAt) * 1000), "PPP", {
          awareOfUnicodeTokens: true,
          })} */}
      </Typography>
      {/* <Typography className={classes.timeStamp} align="left">stored column index: {noteData.colIndex}, Stored pos index: {noteData.index} </Typography> */}
      {/* <Typography className={classes.timeStamp} align="left">Local column index: {colIndex}, Local pos index: {index} </Typography> */}
      <Accordion square expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
        <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
          <Typography variant="subtitle1" align="left">{name}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {/* <Divider className={classes.divider} style={{backgroundColor: theme.palette.primary.main}}/> */}
          <ReactMarkdown align='left' plugins={[[gfm, {singleTilde: true}]]} children={description} />
            {/* <Typography align="left" variant="body2" style={{paddingBottom: theme.spacing(2)}} gutterBottom>{description}</Typography> */}
          {/* </ReactMarkdown> */}
        </AccordionDetails>
      </Accordion>
      <div className={classes.cardFooter}>
        <IconButton
          size="small"
          onClick={openEditForm}
        >
          <EditOutlined fontSize="small" color="primary"/>
        </IconButton> 
        <IconButton
          onClick={deleteNote}
          size="small"
          align="right"
          justify="right"
        >
          <DeleteOutline fontSize="inherit" color="primary"/>
        </IconButton>
      </div>
    </Card>
  );
}

export default withStyles(styles, { withTheme: true })(TaskCard);