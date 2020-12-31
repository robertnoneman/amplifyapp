import React from "react";
import PropTypes from "prop-types";
import { 
  Box,
  Button,
  Card,
  Divider,
  Grid,
  IconButton,
  Paper,
  TextField,
  //Toolbar,
  Typography,
  withStyles,
} from "@material-ui/core"
import { DeleteOutline, EditOutlined } from "@material-ui/icons";

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
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: theme.shape.borderRadius * 1,
    background: 'linear-gradient(30deg, #2196f325 30%, #21cbf325 90%)',
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
  cardFooter: {
    display: "flex",
    justifyContent: "flex-end",
  }
});

function TaskCard(props) {
  const { classes, index, colIndex, name, description, createdAt, theme, deleteNote, openEditForm, } = props;
  return (
    <Card className={classes.card}>
      <Typography variant="subtitle2" align="right">{createdAt}</Typography>
      <Typography variant="h6" align="left">{name}</Typography>
      <Divider className={classes.divider} style={{backgroundColor: theme.palette.primary.main}}/>
      <Typography align="left" variant="subtitle2" style={{paddingBottom: theme.spacing(2)}} gutterBottom>{description}</Typography>
      <div className={classes.cardFooter}>
        <IconButton
          onClick={openEditForm}
        >
          <EditOutlined color="primary"/>
        </IconButton> 
        <IconButton
          onClick={deleteNote}
          align="right"
          justify="right"
        >
          <DeleteOutline color="primary"/>
        </IconButton>
      </div>
    </Card>
  );
}

export default withStyles(styles, { withTheme: true })(TaskCard);