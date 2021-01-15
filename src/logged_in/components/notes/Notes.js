import React, { useState, useEffect, Fragment, useCallback, } from "react";
import { API } from 'aws-amplify';
import { listNotes } from '../../../graphql/queries';
import { createNote as createNoteMutation, updateNote as updateNoteMutation, deleteNote as deleteNoteMutation, 
  // updateNote, 
} from '../../../graphql/mutations';
// import awsconfig from '../../../aws-exports';
import PropTypes from "prop-types";
import { 
  Box,
  Grid,
  IconButton,
  Typography,
  withStyles,
} from "@material-ui/core"
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TaskCard from "./TaskCard";
import { AddCircleOutline,  } from "@material-ui/icons";
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
    width: "100%"
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
    width: "100%"
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
  const { classes, selectNotes, } = props;
  const [notes, setNotes] = useState([]);
  const [noteCards, setNoteCards] = useState([getItems(10), getItems(5, 10)]);
  const [state, setState] = useState([getItems(10), getItems(5, 10)]);
  const [formData, setFormData] = useState(initialFormState);
  const [loaded, hasLoaded] = useState(false);
  // const [loading, isLoading] = useState(false);
  const [colName, setColNames] = useState([0,1,2]);
  const [currentTask, setCurrentTask] = useState(initialFormState);
  const [isNew, setIsNew] = useState(false);

  // const anchorEl = useRef();
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = useCallback((noteData, isNewNote) => {
    setIsNew(isNewNote);
    setIsOpen(!isOpen);
    if (!noteData || noteData.name === null || isNewNote){
      setCurrentTask(initialFormState)
    }
    else setCurrentTask(noteData);
  }, [setIsNew, setCurrentTask, isOpen, setIsOpen]);

  const handleClickAway = useCallback(() => {
    setIsOpen(false);
    setFormData(initialFormState);
    setCurrentTask(initialFormState);
    setIsNew(false);
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

  async function createNewNote(noteData) {
    if (!noteData.name || !noteData.description) return;
    noteData.index = state[0].length;
    noteData.colIndex = 0;
    noteData.id = `newLocalNote ${new Date().getTime()}`;
    await API.graphql({ query: createNoteMutation, variables: { input: noteData } });
    // Copy the 'Todo' column so that we can append it.
    const items = state[0];
    // Set a temporary id for tracking locally
    noteData.id = `newLocalNote ${new Date().getTime()}`;
    // Add the new note to the todo column
    items.push(noteData);
    // Copy the current state.
    const newState = [...state];
    // Insert the updated Todo column
    newState[0] = items;
    // Set the state variable (tracks locally)
    setState(newState);
    setNotes([ ...notes, noteData ]);
    // setState([ ...state, formData ]);
    // fetchNotes();
    // setFormData(initialFormState);
    handleClickAway();
  };

  async function editNote(noteData) {
    await API.graphql({ query: updateNoteMutation, variables: { input: noteData }});
    handleClickAway();
  };

  async function deleteNote({ id }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    const newNotesClone = Array.from(state);
    const newTasksArray = newNotesClone.filter(note => note.id !== id);
    setNotes(newNotesArray);
    // NOTE: This might break things!!
    setNoteCards(newTasksArray);
    setState(newTasksArray)
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
    fetchNotes();
  };

  async function onDragEnd(result) {
    const { source, destination } = result;

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
      var startingIndex = 0;
      if( source.index > destination.index)
      {
        startingIndex = destination.index
      }
      else startingIndex = source.index;

      for (var i = startingIndex; i < items.length; i++) {
        await API.graphql({ query: updateNoteMutation, variables: { input: { id: newState[sInd][i].id, index: i, colIndex: sInd } }});  
      }
      
    } else {
      const result = move(state[sInd], state[dInd], source, destination);
      const newState = [...state];
      newState[sInd] = result[sInd];
      newState[dInd] = result[dInd];
      // setState(newState.filter(group => group.length));
      setState(newState);
      await API.graphql({ query: updateNoteMutation, variables: { input: { id: newState[dInd][destination.index].id, index: destination.index, colIndex: dInd } }});
    }
    fetchNotes();
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
      const sortedCols = [noteCards[0], noteCards[1], noteCards[2]];
      for (var j = 0; j < sortedCols.length; j++)
      {
        const sorted = sortedCols[j];
        if(sortedCols[j] !== null && Array.isArray(sorted) ) //sortedCols[j].length > 0)
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
        isNew={isNew}
        onClose={handleClickAway}
        taskData={currentTask}
        createNote={createNewNote}
        editNote={editNote}
      />
      <DragDropContext onDragEnd={(onDragEnd)}>
        <Box p={0}>
          <Grid container spacing={4} justify="flex-start" style={{}}>
            {state.map((el, ind) => (
            <Grid container direction="column" justify="flex-start" item xs={4} key={ind} style={{}}>
              <Box alignItems="center" justifyContent="center" className={classes.taskColumn} p={1}>
                <Droppable key={colName[ind]} droppableId={`${colName[ind]}`}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      style={{ minHeight: "1000px", }}
                      // style={getListStyle(snapshot.isDraggingOver)}
                      {...provided.droppableProps}
                    >
                      <Grid item><Box className={classes.cardTitle}><Typography variant="h6" align="left">{colNames[ind]}</Typography></Box></Grid>
                      <Grid item container spacing={1} direction="column" justify="center">
                        {el.length > 0 && el.map((note, index) => (
                          <Grid item xs key={index}>
                            <Draggable key={note.id} draggableId={note.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                    <TaskCard
                                      index={index}
                                      colIndex={ind}
                                      name={note.name}
                                      description={note.description}
                                      createdAt={note.createdAt}
                                      noteData={note}
                                      openEditForm={() => handleClick(note, false)}
                                      deleteNote={() => deleteNote(note)} 
                                    />
                                </div>
                              )}
                            </Draggable>
                          </Grid>
                        ))}
                        <IconButton
                          onClick={() => handleClick(initialFormState, true)}
                          size="small"
                          align="right"
                          justify="right"
                        >
                          <AddCircleOutline fontSize="inherit" color="primary"/>
                        </IconButton>
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

/*
        <Paper className={classes.notePaper}>
          <Grid container spacing={3} direction="row" alignItems="stretch" >
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
          <Divider />
           <Grid container spacing={1}>
*/

/*
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
*/