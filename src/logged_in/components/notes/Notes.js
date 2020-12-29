import React, { useState, useEffect, Fragment, } from "react";
import { API } from 'aws-amplify';
import { listNotes } from '../../../graphql/queries';
import { createNote as createNoteMutation, updateNote as updateNoteMutation, deleteNote as deleteNoteMutation, updateNote } from '../../../graphql/mutations';
// import awsconfig from '../../../aws-exports';
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
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

const styles = (theme) => ({
  newNote: {
    paddingBottom: theme.spacing(2),
  },
  card: {
    boxShadow: theme.shadows[2],
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: theme.shape.borderRadius * 2,
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
  }
});

const initialFormState = { name: '', description: ''};

const initialDescription = [
  {
    id: "placeholder0",
    name: "todo",
    description: ["Read chapters for next class"]
  },
  {
    id: "placeholder1",
    name: "doing",
    description: ["Complete in-class activity", "Brainsotrm project ideas"]
  },
  {
    id: "placeholder2",
    name: "done",
    description: []
  }
];

const colNames = ["Todo", "In Progress", "Done"];

const getItems = (count, offset = 0) =>
  Array.from({ length: count }, (v, k) => k).map((k) => ({
    id: `item-${k + offset}-${new Date().getTime()}`,
    content: `item ${k + offset}`
  }));

const reorder = (list, startIndex, endIndex) => {
  //updateNote();
  //if (!list) return;
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

function Notes(props) {
  const { classes, theme, selectNotes } = props;
  const [notes, setNotes] = useState([]);
  const [noteCards, setNoteCards] = useState([getItems(10), getItems(5, 10)]);
  const [state, setState] = useState([getItems(10), getItems(5, 10)]);
  const [formData, setFormData] = useState(initialFormState);
  const [loaded, hasLoaded] = useState(false);
  const [colName, setColNames] = useState(colNames);
  
  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    setNotes(apiData.data.listNotes.items);
    const tempNotes = apiData.data.listNotes.items;
    const noteCols = [[], [], []];
    tempNotes.forEach(element => {
      // console.log(`Note index: ${element.index}`)
      // console.log(`Col index: ${element.colIndex}`)
      var nameExists = noteCols.includes(element.colName);
      if (!nameExists) {
        noteCols.push(element.colName);
      }

      for (var i=0; i< noteCols.length; i++)
      {
        if(element.colIndex === null){
          element.colIndex = 0;
        }
        // var inColumn = noteCols[i].includes(element);
        if(i === element.colIndex){
          noteCols[i].push(element);
        }
      }
    });
    // for (var j = 0; j < noteCols.length; j++)
    // {
    //   setNoteCards([...noteCards, noteCols[j]])
    // }
    setNoteCards([noteCols[0], noteCols[1], noteCols[2]]);
  };
    // setState([tempNotes]);
    // tempNotes.map((note, index) => (
      //   nameDescriptions[index] = {
      //     name: note.name,
      //     description: note.description
      //   }
      // ))

      //console.log(`nameDescpriptions: ${nameDescriptions}`);
    // setState([tempNotes])
    // for (var i=0; i< noteCols.length; i++) {
    //   setState([noteCols]);
    // }
    // if(!loaded)
    // {
    //   setState([noteCols[0], noteCols[1], noteCols[2]]);
    //   hasLoaded(true);
    // }
    
    // isLoading(false);
    // setNotes([noteCols[0], noteCols[1], noteCols[2]]);
    // setNoteCards([...noteCols]);
  // };

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    setNotes([ ...notes, formData ]);
    setFormData(initialFormState);
  };

  async function updateNote(result) {
    const { source, destination } = result;
    const id = +source.droppableId;
    if (!destination) return;
    const index = destination.index;
    
    await API.graphql({ query: updateNoteMutation, variables: { input: { id: result.draggableId, index: index, colIndex: id } }});
  }

  async function saveNotes() {
    const noteCardsClone = Array.from(state);
    for (var i=0; i< state.length; i++) {
      for (var k=0; k < state[i].length; k++) {
        if (!noteCards[i][k] || noteCards[i][k].colIndex !== i || noteCards[i][k].index !== k) {
          await API.graphql({ query: updateNoteMutation, variables: { input: { id: state[i][k].id, index: k, colIndex: i } }});
          noteCardsClone[i][k].index = k;
          noteCardsClone[i][k].colIndex = i;
        }
      }
    }
    setNoteCards(noteCardsClone, ...noteCardsClone);
  }

  async function deleteNote({ id }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  };

  async function printNote() {
    setState(noteCards, ...noteCards);
    hasLoaded(true);
  };

  function onDragEnd(result) {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }
    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    if (sInd === dInd) {
      const items = reorder(state[sInd], source.index, destination.index);
      const newState = [...state];
      newState[sInd] = items;
      // setState(newState);
      setState(newState);
    } else {
      const result = move(state[sInd], state[dInd], source, destination);
      const newState = [...state];
      newState[sInd] = result[sInd];
      newState[dInd] = result[dInd];

      // setState(newState.filter(group => group.length));
      setState(newState);
    }

  }

  useEffect(() => {
    fetchNotes();
    // setNoteCards([]);
  }, []);

  useEffect(selectNotes, [selectNotes]);

  return (
    <Fragment>
      <Paper className={classes.newNote}>
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
          <Grid container direction="row" alignItems="stretch">
            <Grid item xs={12}>
              <Typography variant="h4">Your Tasks</Typography>
            </Grid>
            <Grid item xs>
            <Button
              variant="contained"
              color="secondary"
              // style={{display: "flex-end"}}
              onClick={(fetchNotes, printNote)}
            >
              Load tasks from server
            </Button>
            </Grid>
            <Grid item xs>
            <Button
              variant="contained"
              color="secondary"
              disabled={loaded? false : true}
              // style={{display: "flex-end"}}
              onClick={(saveNotes)}
            >
              Save notes to server
            </Button>
            </Grid>
          </Grid>
          <Divider />
          {/* <Grid container spacing={1}> */}

            <DragDropContext onDragEnd={(onDragEnd)}>
            <Box p={1}>
              <Grid container spacing={1} justify="flex-start">
                {state.map((el, ind) => (
                <Grid container direction="column" justify="flex-start" item xs key={ind}>
                  <Grid item><Box className={classes.cardTitle}><Typography align="center">{colName[ind]}</Typography></Box></Grid>
                  <Droppable key={ind} droppableId={`${ind}`}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        // style={getListStyle(snapshot.isDraggingOver)}
                        {...provided.droppableProps}
                      >
                        {/* <Grid container spacing={1} direction="column"> */}
                        {el.length > 0 && el.map((note, index) => (
                          <Grid item key={index}>
                            <Draggable key={note.id} draggableId={note.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                    <Card className={classes.card}>
                                      <Typography variant="h6">{note.colIndex} | {note.index} </Typography>
                                      <Typography variant="h5">{note.name}</Typography>
                                      <Divider className={classes.divider} style={{backgroundColor: theme.palette.primary.main}}/>
                                      <Typography align="left" style={{paddingBottom: theme.spacing(2)}} gutterBottom>{note.description}</Typography>
                                      <Button 
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => deleteNote(note)}
                                      >
                                        Delete note
                                      </Button>
                                    </Card>
                                  {/*  */}
                                  </div>
                            )}
                            </Draggable>
                          </Grid>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Grid>
                ))}
                  
              </Grid>
            </Box>
            </DragDropContext>
          {/* </Grid> */}
        </Paper>

    </Fragment>
  )
};

Notes.propTypes = {
  classes: PropTypes.object,
}

export default withStyles(styles, { withTheme: true })(Notes);
