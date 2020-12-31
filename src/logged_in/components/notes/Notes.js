import React, { useState, useEffect, Fragment, useRef, useCallback, } from "react";
import { API } from 'aws-amplify';
import { listNotes } from '../../../graphql/queries';
import { createNote as createNoteMutation, updateNote as updateNoteMutation, deleteNote as deleteNoteMutation, 
  // updateNote, 
} from '../../../graphql/mutations';
// import awsconfig from '../../../aws-exports';
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
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TaskCard from "./TaskCard";
import { DeleteOutline, Edit, EditOutlined } from "@material-ui/icons";
import format from "date-fns/format";
import EditTaskForm from "./EditTaskForm";


const styles = (theme) => ({
  newNote: {
    paddingBottom: theme.spacing(2),
  },
  notePaper: {
    paddingTop: theme.spacing(2),
  },
  taskColumn: {
    background: theme.palette.common.black,
    border: `1px solid ${theme.palette.common.darkBlack}`,
    borderRadius: theme.shape.borderRadius * 2,
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
    // background: 'linear-gradient(30deg, #2196f3aa 30%, #21cbf3bb 90%)',
    marginBottom: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
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

// const initialFormState = { name: '', description: ''};
const initialFormState = { 
  name: '', 
  description: '',
  index: 0,
  colIndex: 0,
  colName: "Todo",
};

const colNames = ["Todo", "In Progress", "Done"];

function labelFormatter(label) {
  return format(new Date(label * 1000), "MMM d, p");
}

const getItems = (count, offset = 0) =>
  Array.from({ length: count }, (v, k) => k).map((k) => ({
    id: `item-${k + offset}-${new Date().getTime()}`,
    content: `item ${k + offset}`
  }));

const reorder = (list, startIndex, endIndex) => {
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
  const { classes, theme, selectNotes, } = props;
  const [notes, setNotes] = useState([]);
  const [noteCards, setNoteCards] = useState([getItems(10), getItems(5, 10)]);
  const [state, setState] = useState([getItems(10), getItems(5, 10)]);
  const [formData, setFormData] = useState(initialFormState);
  const [loaded, hasLoaded] = useState(false);
  const [colName, setColNames] = useState(colNames);
  const [currentTask, setCurrentTask] = useState(initialFormState);
  const [isNew, setIsNew] = useState(false);

  const anchorEl = useRef();
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = useCallback((noteData) => {
    setIsOpen(!isOpen);
    setCurrentTask(noteData);
  }, [isOpen, setIsOpen]);

  const handleClickAway = useCallback(() => {
    setIsOpen(false);
    setFormData(initialFormState);
    setCurrentTask(initialFormState);
    fetchNotes();
  }, [setIsOpen]);
  
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
        if (element.colIndex === null) {
          element.colIndex = 0;
        }
        if (i === element.colIndex) {
          noteCols[i].push(element);
        }
      }
    });
    setNoteCards([noteCols[0], noteCols[1], noteCols[2]]);
  };

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    // Copy the 'Todo' column so that we can append it.
    const items = state[0];
    // Add the new note to the todo column
    formData.id = `newLocalNote ${new Date().getTime()}`;
    items.push(formData);
    // Copy the current state.
    const newState = [...state];
    // Insert the updated Todo column
    newState[0] = items;
    // Set the state variable (tracks locally)
    setState(newState);
    setNotes([ ...notes, formData ]);
    // setState([ ...state, formData ]);
    fetchNotes();
    setFormData(initialFormState);
  };
  async function createNewNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    // Copy the 'Todo' column so that we can append it.
    const items = state[0];
    // Add the new note to the todo column
    formData.id = `newLocalNote ${new Date().getTime()}`;
    items.push(formData);
    // Copy the current state.
    const newState = [...state];
    // Insert the updated Todo column
    newState[0] = items;
    // Set the state variable (tracks locally)
    setState(newState);
    setNotes([ ...notes, formData ]);
    // setState([ ...state, formData ]);
    fetchNotes();
    setFormData(initialFormState);
  };

  // TODO: Create new form component similar to "create note" area, 
  //       Render it on the note itself or open a modal edit form
  async function editNote(noteData) {

    await API.graphql({ query: updateNoteMutation, variables: { input: noteData }});
  }

  async function saveNotes() {
    const noteCardsClone = Array.from(noteCards);
    var changed;
    for (var i=0; i< state.length; i++) {
      for (var k=0; k < state[i].length; k++) {
        if (!noteCards[i][k] || 
            noteCards[i][k].colIndex !== i || 
            noteCards[i][k].index !== k ||
            noteCards[i][k].id !== state[i][k].id
            // || noteCards[i][k].colIndex !== state[i][k].index 
            // || noteCards[i][k].index !== state[i][k].index
            ) {
          changed = true;
          await API.graphql({ query: updateNoteMutation, variables: { input: { id: state[i][k].id, index: k, colIndex: i } }});
          
          noteCardsClone[i][k].index = k;
          noteCardsClone[i][k].colIndex = i;
        }
      }
    }
    if (changed) fetchNotes();
    // const timeout = setTimeout(() => {
    //   setNoteCards(state, ...state);
    // }, 750);
    // return () => {
    //   clearTimeout(timeout);
    // }
  }

  async function deleteNote({ id }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    const newNotesClone = Array.from(state);
    const newTasksArray = newNotesClone.filter(note => note.id !== id);
    setNotes(newNotesArray);
    // NOTE: This might break things!!
    setNoteCards(newTasksArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  };

  async function printNote() {
    fetchNotes();
    const sortedCols = [...noteCards];
    for (var j = 0; j < noteCards.length; j++)
    {
      const sorted = sortedCols[j];
      if(sortedCols[j] !== null && sortedCols[j].length > 0)
      {
        sortedCols[j] = sorted.sort(function(a, b){return a.index - b.index});
      }
    }
    // setState(noteCards, ...noteCards);
    setState(sortedCols);
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
      setState(newState);
      saveNotes();
    } else {
      const result = move(state[sInd], state[dInd], source, destination);
      const newState = [...state];
      newState[sInd] = result[sInd];
      newState[dInd] = result[dInd];
      // setState(newState.filter(group => group.length));
      setState(newState);
      saveNotes();
    }
  }

  async function delayedSave() {
    const timeout = setTimeout(() => {
      saveNotes();
    }, 100);
    return () => {
      clearTimeout(timeout);
    }
  }

  useEffect(() => {
    fetchNotes();
    // setNoteCards([]);
  }, []);

  useEffect(selectNotes, [selectNotes]);

  useEffect(() => {
    // fetchNotes();
    const timeoutID = setTimeout(() => {
      // printNote();
      const sortedCols = [...noteCards];
      for (var j = 0; j < sortedCols.length; j++)
      {
        const sorted = sortedCols[j];
        if(sortedCols[j] !== null && sortedCols[j].length > 0)
        {
          sortedCols[j] = sorted.sort(function(a, b){return a.index - b.index});
        }
      }
      // setState(noteCards, ...noteCards);
      setState(sortedCols);
      hasLoaded(true);
    }, 750);
    return () => {
      clearTimeout(timeoutID);
    }
  }, [noteCards]);

  return (
    <Fragment>
      <EditTaskForm
        open={isOpen}
        onClose={handleClickAway}
        taskData={currentTask}
        createNote={createNewNote}
        editNote={editNote}
      />
        {/* <Paper className={classes.notePaper}> */}
          {/* <Grid container spacing={3} direction="row" alignItems="stretch" >
            <Grid item xs={12}>
              <Typography variant="h4">Your Tasks</Typography>
            </Grid>
            <Grid item xs>
            <Button
              variant="contained"
              color="secondary"
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
              onClick={(saveNotes)}
            >
              Save notes to server
            </Button>
            </Grid>
          </Grid>
          <Divider /> */}
          {/* <Grid container spacing={1}> */}
            <DragDropContext onDragEnd={(onDragEnd)}>
            <Box p={1}>
              <Grid container spacing={1} justify="flex-start">
                {state.map((el, ind) => (
                <Grid container direction="column" justify="flex-start" item xs key={ind}>
                  <Box display="flex" alignItems="center" justifyContent="center" className={classes.taskColumn}>
                  <Droppable key={ind} droppableId={`${ind}`}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        style={{ minHeight: "1000px", }}
                        // style={getListStyle(snapshot.isDraggingOver)}
                        {...provided.droppableProps}
                      >
                        {/* <Grid container spacing={1} direction="column"> */}
                        <Grid item><Box className={classes.cardTitle}><Typography variant="h6" align="left">{colName[ind]}</Typography></Box></Grid>
                        <Grid item container spacing={1} direction="column" xs justify="center">
                          {el.length > 0 && el.map((note, index) => (
                            <Grid item key={index}>
                              <Draggable key={note.id} draggableId={note.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                      <TaskCard
                                        index={note.index}
                                        colIndex={note.colIndex}
                                        name={note.name}
                                        description={note.description}
                                        createdAt={note.createdAt}
                                        openEditForm={() => handleClick(note)}
                                        deleteNote={() => deleteNote(note)} 
                                      />
                                  </div>
                                )}
                              </Draggable>
                            </Grid>
                          ))}
                        </Grid>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                  </Box>
                </Grid>
                ))}
              </Grid>
            </Box>
            </DragDropContext>
          {/* </Grid> */}
        {/* </Paper> */}

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
    </Fragment>
  )
};

Notes.propTypes = {
  classes: PropTypes.object,
}

export default withStyles(styles, { withTheme: true })(Notes);


// {/* <Card className={classes.card}>
// <Typography variant="subtitle2" align="right">
//   {/* {note.colIndex} | {note.index}  */}
//   {note.createdAt}
// </Typography>
// <Typography variant="h6" align="left">{note.name}</Typography>
// <Divider className={classes.divider} style={{backgroundColor: theme.palette.primary.main}}/>
// <Typography align="left" variant="subtitle2" style={{paddingBottom: theme.spacing(2)}} gutterBottom>{note.description}</Typography>
// <div className={classes.cardFooter}>
//   <IconButton
//     // onClick={() => editNote(note)}
//   >
//     <EditOutlined color="primary"/>
//   </IconButton> 
//   <IconButton
//     onClick={() => deleteNote(note)}
//     align="right"
//     justify="right"
//   >
//     <DeleteOutline color="primary"/>
//   </IconButton>
// </div>
// </Card> */}