import { createMuiTheme, responsiveFontSizes } from "@material-ui/core";

// colors
//const primary = "#6e3a48";
//const primary = "#E12C2C";
const primary = "#ef6c2a"
// const secondary = "#a3b18a";
//const secondary = "#689ad8";
// const secondary = "#2aadef";
const secondary = '#195f86';
const black = "#31353eff";
const darkBlack = "#232222ff";
//const background = "#43182f";
const background = "#1e272c";
const warningLight = "#689ad8";
const warningMain = "#D92F36";
//const warningDark = "#43182f";
const warningDark = "#1e272c";
const sunnyYellow = "#ffe747";
//const rainyBlue = "#2aadef";
const textPrimary = "#eee";
//const textSecondary = "#73A397"
const textDisabled = "#777";


// border
const borderWidth = 2;
const borderColor = "rgba(0, 0, 0, 0.13)";

// breakpoints
const xl = 1920;
const lg = 1280;
const md = 750;
const sm = 600;
const xs = 0;

// spacing
const spacing = 8;

const theme = createMuiTheme({
  palette: {
    primary: { 
      main: primary,
      // dark: darkBlack,
      // light: warningMain,
      text: textPrimary 
    },
    secondary: { 
      main: secondary,
      contrastText: textPrimary 
    },
    common: {
      black: black,
      darkBlack: darkBlack,
      background: background,
    },
    warning: {
      // light: warningLight,
      main: warningMain,
      dark: warningDark
    },
    text: {
      primary: textPrimary,
      secondary: secondary,
      disabled: textDisabled
    },
    data: {
      sun: sunnyYellow,
    },
    // Used to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: 0.2,
    background: {
      default: background,
      paper: darkBlack
    },
    action: {
      disabled: "rgba(255, 255, 255, 0.26)"
    },
    spacing
  },
  breakpoints: {
    // Define custom breakpoint values.
    // These will apply to Material-UI components that use responsive
    // breakpoints, such as `Grid` and `Hidden`. You can also use the
    // theme breakpoint functions `up`, `down`, and `between` to create
    // media queries for these breakpoints
    values: {
      xl,
      lg,
      md,
      sm,
      xs
    }
  },
  border: {
    borderColor: borderColor,
    borderWidth: borderWidth
  },
  overrides: {
    MuiExpansionPanel: {
      root: {
        position: "static"
      }
    },
    MuiTableCell: {
      root: {
        paddingLeft: spacing * 2,
        paddingRight: spacing * 2,
        borderBottom: `${borderWidth}px solid ${borderColor}`,
        [`@media (max-width:  ${sm}px)`]: {
          paddingLeft: spacing,
          paddingRight: spacing
        }
      }
    },
    MuiDivider: {
      root: {
        backgroundColor: borderColor,
        height: borderWidth
      }
    },
    MuiPrivateNotchedOutline: {
      root: {
        borderWidth: borderWidth
      }
    },
    MuiListItem: {
      divider: {
        borderBottom: `${borderWidth}px solid ${borderColor}`
      }
    },
    MuiListItemIcon: {
      root: {
        display: "contents"
      }
    },
    MuiDialog: {
      paper: {
        width: "100%",
        maxWidth: 1080,
        marginLeft: spacing,
        marginRight: spacing
      }
    },
    MuiTooltip: {
      tooltip: {
        backgroundColor: darkBlack
      }
    },
    MuiExpansionPanelDetails: {
      root: {
        [`@media (max-width:  ${sm}px)`]: {
          paddingLeft: spacing,
          paddingRight: spacing
        }
      }
    },
    MuiAccordionSummary: {
      expandIcon: {
        color: secondary,
        expandMoreIcon: {
          htmlColor: primary,
        }
      }
    },
    MuiSelect: {
      // colorPrimary: secondary,
      // color: secondary,
      icon: {
        // colorPrimary: primary,
        color: secondary,
      }
    },
  },
  typography: {
    useNextVariants: true
  }
});

export default responsiveFontSizes(theme);
