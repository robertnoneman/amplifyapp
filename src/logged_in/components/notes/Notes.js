import React, { useState, useEffect, Fragment } from "react";
import Amplify, { API } from 'aws-amplify';
import { listNotes } from '../../../graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from '../../../graphql/mutations';
import awsconfig from '../../../aws-exports';
import PropTypes from "prop-types";
import { 
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  TextField,
  Toolbar,
  Typography,
  withStyles,
} from "@material-ui/core"
import classNames from "classnames";


const styles = (theme) => ({
  card: {
    boxShadow: theme.shadows[2],
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

  // useEffect(() => {
  //   selectNotes();
  // }, [selectNotes]);

  useEffect(selectNotes, [selectNotes]);

  return (
    <Fragment>
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

        <Paper>
          <Toolbar>
            <Typography variant="h6">Your Notes</Typography>
            <Button
              variant="contained"
              color="secondary"
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
                    <Typography variant="h3">{note.name}</Typography>
                    <Typography>{note.description}</Typography>
                    <Button 
                      variant="contained"
                      color="secondary"
                      onClick={() => deleteNote(note)}
                    >
                      Delete note
                    </Button>
                  </Grid>
                ))
              }
            </Grid>
          </Box>
        </Paper>
      </Grid>
    </Fragment>
  )
};

Notes.propTypes = {
  classes: PropTypes.object,
}

export default withStyles(styles, { withTheme: true })(Notes);




