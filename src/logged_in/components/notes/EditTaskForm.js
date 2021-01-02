import React, { useState, Fragment, useRef } from 'react';
import PropTypes from 'prop-types';
import FormDialog from "../../../shared/components/FormDialog";
import { 
  TextField, 
  withTheme,
  withStyles,
  Button,
} from '@material-ui/core';

const styles = (theme) => ({
  editTaskPaper: {
    display: "flex",
    // flexDirection: "column",
    alignItems: "center",
    paddingBottom: theme.spacing(1),
    maxWidth: 1080
  }
});
const initialFormState = { 
  name: '', 
  description: '',
  index: 0,
  colIndex: 0,
  colName: "Todo",
};

function EditTaskForm(props) {
  const { open, theme, onClose, onSuccess, taskData, createNote, editNote, isNew, classes } = props;
  const [formData, setFormData] = useState(initialFormState);
  const title = useRef();
  const description = useRef();

  return (
    <FormDialog
      open={open}
      loading={false}
      onClose={onClose}
      headline={taskData.name}
      hideBackdrop={false}
      // disablePadding
      onFormSubmit={(e) => {
        e.preventDefault(); 
        isNew ? createNote(formData) : editNote(formData);
        setFormData(initialFormState);
      }}
      style={{paddingBottom: 0}}
      className={classes.editTaskPaper}
      content={
        <>
          <TextField
            variant="standard"
            label="Title"
            fullWidth
            multiline
            required
            // rows={1}
            className="text-white"
            onChange={isNew? e => setFormData({...formData, 'name': e.target.value}) : e => setFormData({...taskData, 'name': e.target.value})}
            placeholder={taskData.name}
            defaultValue={taskData.name}
            inputRef={title}
          />
          <TextField
            variant="standard"
            label="Description"
            fullWidth
            multiline
            required
            // rows={1}
            className="text-white"
            onChange={isNew? e => setFormData({...formData, 'description': e.target.value}) : e => setFormData({...taskData, 'description': e.target.value})}
            placeholder={taskData.description}
            defaultValue={taskData.description}
            // value={formData.description}
            inputRef={description}
          />
        </>
      }
      actions={
        <>
        <Button
          type="submit"
        >
          Save
        </Button>
        </>
      }
    >
    </FormDialog>
  );
}

export default withStyles(styles, { withTheme: true })(EditTaskForm);
