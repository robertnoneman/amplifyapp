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

});
const initialFormState = { 
  name: '', 
  description: '',
  index: 0,
  colIndex: 0,
  colName: "Todo",
};

function EditTaskForm(props) {
  const { open, theme, onClose, onSuccess, taskData, createNote, editNote, isNew, } = props;
  const [formData, setFormData] = useState(initialFormState);
  const title = useRef();

  return (
    <FormDialog
      open={open}
      loading={false}
      onClose={onClose}
      headline={initialFormState.name}
      hideBackdrop={false}
      onFormSubmit={(e) => {
        e.preventDefault(); 
        isNew ? createNote(formData) : editNote(formData);
      }}
      content={
        <>
          <TextField
          variant="standard"
          label="Title"
          fullWidth
          multiline
          required
          rows={1}
          className="text-white"
          onChange={e => setFormData({...taskData, 'name': e.target.value})}
          placeholder={taskData.name}
          defaultValue={taskData.name}
          inputRef={title}
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
