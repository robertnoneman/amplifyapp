import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { 
  Typography, 
  Box, 
  withStyles, 
  // Card, 
  // Paper, 
  Grid} from "@material-ui/core";
import { ResizableBox } from 'react-resizable';
import ResizableContent from '../../../shared/components/ResizableContent'
import useResizeAware from 'react-resize-aware'
// import { Draggable } from 'react-draggable';


const styles = theme => ({
  sandbox: {
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(6),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    marginTop: theme.spacing(2),
    border: `1px solid ${theme.palette.primary.dark}`,
    borderRadius: theme.shape.borderRadius * 2,
    background: theme.palette.primary.dark
  },
  sandboxActive: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    border: `3px solid ${theme.palette.primary.dark}`,
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: theme.palette.warning.dark,
    [theme.breakpoints.down("xs")]: {
      marginTop: theme.spacing(2)
    }
  },
  sandboxResizable: {
    background: theme.palette.primary.dark,
    border: '1px solid black',
    borderRadius: theme.shape.borderRadius * 2,
    padding: '10px',
    //boxSizing: "border-box",
    marginBottom: '10px',
    margin: '20px',
  },
  title: {
    color: theme.palette.common.white
  },
  content: {
    color: theme.palette.common.white
  }
});

function Sandbox(props) {
  const { classes, title, content, highlighted } = props;
  const [isVisibile, setIsVisible] = useState(false);
  const [resizeListener, sizes] = useResizeAware();
  const [showBox, setShowBox] = useState(true)

  // function showHandle(e) {
  //   e.target.className="box hover-handles";
  // }

  useEffect(() => {
    const timeoutID = setTimeout(() => {
      setShowBox(false);
    }, 500);
    return () => {
      clearTimeout(timeoutID);
    };
  }, [setShowBox]);

  return (
    <div className={highlighted ? classes.sandboxActive : classes.sandbox}>
      <Box mb={2} align="center">
        <Typography align="center" variant="h4" className={classes.title}>
          {"How about the weather?"}
        </Typography>
          { showBox?
            <Box className="hidden-box box" display="none">
            <span className="text-white">{title}<p>{content}</p></span>
            {resizeListener}
            </Box> : null
          }
          <ResizableBox
            onMouseOver={() => {setIsVisible(true); }}
            onMouseLeave={() => {setIsVisible(false); }}
            className="custom-box box"
            width={sizes.width}
            height={sizes.height}
            // handle={<span className="custom-handle custom-handle-se" />}
            // onMouseOver={showHandle}
            handle={(h) => <span className={isVisibile ? `custom-handle custom-handle-${h}` : "hover-handles hover-handles"} />}
            handleSize={[8, 8]}
            resizeHandles={['sw', 'se', 'nw', 'ne', 'w', 'e', 'n', 's']}
            >
            <span className="custom-box text-white">
                <Grid item xs zeroMinWidth>
                  <Typography>
                    {title}
                  </Typography>
                </Grid>
                <Grid item xs zeroMinWidth>
                  <Typography>
                    {content}
                  </Typography>
                </Grid>
            </span>
          </ResizableBox>
      </Box>
      <Box display="none">
          <ResizableContent
          top={700}
          left={700}
          width={500}
          height={500}
          rotateAngle={0}
          // style={classes.sandboxResizable}
          >
            <div className="box text-white">
              {title}
            </div>
            <div className="box text-white">
              {content}
            </div>
          </ResizableContent>
      </Box>
    </div>
  );
}
  Sandbox.propTypes = {
    classes: PropTypes.object.isRequired,
    title: PropTypes.string,
    highlighted: PropTypes.bool
  };

  export default withStyles(styles, { withTheme: true})(Sandbox);