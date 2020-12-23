import React, { useState, useEffect, Fragment } from "react";
import Amplify, { API } from 'aws-amplify';
import { listNotes } from '../../../graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from '../../../graphql/mutations';
import awsconfig from '../../../aws-exports';
import PropTypes from "prop-types";
import { 
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Paper,
  TextField,
  Toolbar,
  Typography,
  withStyles,
} from "@material-ui/core"
import classNames from "classnames";
import { color } from "@material-ui/system";


const styles = (theme) => ({
  card: {
    boxShadow: theme.shadows[2],
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(6),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: theme.shape.borderRadius * 2,
    background: 'linear-gradient(30deg, #2196f325 30%, #21cbf325 90%)',
    //marginTop: theme.spacing(2),
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
  }
});

const initialFormState = { name: '', description: ''};

function Notes(props) {
  const { classes, theme, selectNotes } = props;
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    setNotes(apiData.data.listNotes.items);
  };

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    setNotes([ ...notes, formData ]);
    setFormData(initialFormState);
  };

  async function deleteNote({ id }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(selectNotes, [selectNotes]);

  return (
    <Fragment>
      <Paper>
        <Grid spacing={0} container>
          <Grid
            item
            xs={12}
            sm={12}
            lg={12}
            className="relative"
          >
            <TextField
              fullWidth
              multiline
              variant="outlined"
              rows={1}
              className="text-white"
              onChange={e => setFormData({...formData, 'name': e.target.value})}
              placeholder="Note name"
              value={formData.name}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            lg={12}
            className="relative"
          >
            <TextField
              fullWidth
              multiline
              variant="outlined"
              rows={3}
              className="text-white"
              onChange={e => setFormData({...formData, 'description': e.target.value})}
              placeholder="Note description"
              value={formData.description}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            lg={12}
            className="relative"
          >
            <Button 
              variant="contained"
              color="secondary"
              className="text-white"
              onClick={createNote}>Create Note
            </Button>
          </Grid>
        </Grid>
      </Paper>
      <Paper className="lg-mg-top">
        <Grid container spacing={1}>
          <Toolbar>
            <Typography variant="h4">Your Notes</Typography>
            <Button
              variant="contained"
              color="secondary"
              style={{display: "none"}}
            >
              Non-functional button
            </Button>
          </Toolbar>
          <Divider />
          <Box p={1}>
            <Grid container spacing={1}>
              {
                notes.map(note => (
                  <Grid item xs={6} sm={4} md={3} key={note.id || note.name}>
                    <Card className={classes.card}>
                      <Typography variant="h5">{note.name}</Typography>
                      <Divider className={classes.divider} style={{color: theme.palette.primary.main}, {backgroundColor: theme.palette.primary.main}}/>
                      <Typography align="left" gutterBottom>{note.description}</Typography>
                      <Button 
                        variant="contained"
                        color="secondary"
                        onClick={() => deleteNote(note)}
                      >
                        Delete note
                      </Button>
                    </Card>
                  </Grid>
                ))
              }
            </Grid>
          </Box>
        </Grid>
      </Paper>
    </Fragment>
  )
};

Notes.propTypes = {
  classes: PropTypes.object,
}

export default withStyles(styles, { withTheme: true })(Notes);




