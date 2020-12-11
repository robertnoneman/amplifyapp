import { withStyles } from "@material-ui/core";

const styles = theme => ({
  "@global": {
    /**
     * Disable the focus outline, which is default on some browsers like
     * chrome when focusing elements
     */
    "*:focus": {
      outline: 0
    },
    ".text-white": {
      color: theme.palette.common.white
    },
    ".listItemLeftPadding": {
      paddingTop: `${theme.spacing(1.75)}px !important`,
      paddingBottom: `${theme.spacing(1.75)}px !important`,
      paddingLeft: `${theme.spacing(4)}px !important`,
      [theme.breakpoints.down("sm")]: {
        paddingLeft: `${theme.spacing(4)}px !important`
      },
      "@media (max-width:  420px)": {
        paddingLeft: `${theme.spacing(1)}px !important`
      }
    },
    ".container": {
      width: "100%",
      paddingRight: theme.spacing(4),
      paddingLeft: theme.spacing(4),
      marginRight: "auto",
      marginLeft: "auto",
      [theme.breakpoints.up("sm")]: {
        maxWidth: 540
      },
      [theme.breakpoints.up("md")]: {
        maxWidth: 720
      },
      [theme.breakpoints.up("lg")]: {
        maxWidth: 1170
      },
      background: "secondary",
      backgroundColor: "primary"
    },
    ".row": {
      display: "flex",
      flexWrap: "wrap",
      marginRight: -theme.spacing(2),
      marginLeft: -theme.spacing(2)
    },
    ".container-fluid": {
      width: "100%",
      paddingRight: theme.spacing(2),
      paddingLeft: theme.spacing(2),
      marginRight: "auto",
      marginLeft: "auto",
      maxWidth: 1370,
      background: "secondary",
      backgroundColor: "primary"
    },
    ".lg-mg-top": {
      marginTop: `${theme.spacing(20)}px !important`,
      [theme.breakpoints.down("md")]: {
        marginTop: `${theme.spacing(18)}px !important`
      },
      [theme.breakpoints.down("sm")]: {
        marginTop: `${theme.spacing(16)}px !important`
      },
      [theme.breakpoints.down("xs")]: {
        marginTop: `${theme.spacing(14)}px !important`
      }
    },
    ".lg-mg-bottom": {
      marginBottom: `${theme.spacing(20)}px !important`,
      [theme.breakpoints.down("md")]: {
        marginBottom: `${theme.spacing(18)}px !important`
      },
      [theme.breakpoints.down("sm")]: {
        marginBottom: `${theme.spacing(16)}px !important`
      },
      [theme.breakpoints.down("xs")]: {
        marginBottom: `${theme.spacing(14)}px !important`
      }
    },
    ".lg-p-top": {
      paddingTop: `${theme.spacing(20)}px !important`,
      [theme.breakpoints.down("md")]: {
        paddingTop: `${theme.spacing(18)}px !important`
      },
      [theme.breakpoints.down("sm")]: {
        paddingTop: `${theme.spacing(16)}px !important`
      },
      [theme.breakpoints.down("xs")]: {
        paddingTop: `${theme.spacing(14)}px !important`
      }
    },
    ".layoutRoot": {
      display: "flex",
      background: "secondary",
      backgroundColor: "primary",
      marginBottom: "20px",
      flexWrap: "wrap"
    },
    ".absoluteLayout": {
      height: "600px",
      position: "relative",
      justifyContent: "center",
      alignItems: "center"
    },
    ".scaledLayout": {
      width: "125%",
      left: "-12.5%",
      transform: "scale(0.75)",
      marginTop: "-7.5%"
    },
    ".box": {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      background: theme.palette.common.black,
      border: "1px solid black",
      borderRadius: theme.shape.borderRadius * 2,
      textAlign: "center",
      padding: "10px",
      boxSizing: "border-box",
      marginBottom: "10px",
      overflow: "hidden",
      position: "relative",
      margin: "20px",
      ".text": {
        textAlign: "center"
      }
    },
    ".hover-handles": {
      ".react-resizable-handle": {
        display: "none"
      },
      "&:hover": {
        ".react-resizable-handle": {
          display: "block"
        } 
      }
    },
    ".absolutely-positioned": {
      position: 'absolute !important',
    },
    ".left-aligned": {
      left: 0
    },
    ".right-aligned": {
      right: 0
    },
    ".top-aligned": {
      top: 0
    },
    ".bottom-aligned": {
      bottom: 0
    },
    ".custom-box": {
      overflow: "hidden",
    },
    ".custom-handle": {
      position: "absolute",
      width: "8px",
      height: "8px",
      backgroundColor: "#6e3a48",
      opacity: 0.75,
      borderRadius: "4px"
    },
    ".custom-handle-sw": {
      bottom: "-4px",
      left: "-4px",
      cursor: "sw-resize"
    },
    ".custom-handle-se": {
      bottom: "-4px",
      right: "-4px",
      cursor: "se-resize"
    },
    ".custom-handle-nw": {
      top: "-4px",
      left: "-4px",
      cursor: "nw-resize",
    },
    ".custom-handle-ne": {
      top: "-4px",
      right: "-4px",
      cursor: "ne-resize"
    },
    ".custom-handle-e": {
      top: "50%",
      marginTop: "-4px",
      cursor: "ew-resize",
      right: "-4px"
    },
    ".custom-handle-w": {
      left: "-4px"
    },
    ".custom-handle-s": {
      left: "50%",
      bottom: "-4px",
      marginLeft: "-4px",
      cursor: "ns-resize"
    },
    ".custom-handle-n": {
      top: "-4px"
    }
  },
});

function globalStyles() {
  return null;
}

export default withStyles(styles, { withTheme: true })(globalStyles);
