import React, { memo, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Hidden,
  IconButton,
  ListItemIcon,
  withStyles,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import HomeIcon from "@material-ui/icons/Home";
import HowToRegIcon from "@material-ui/icons/HowToReg";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import BookIcon from "@material-ui/icons/Book";
import NavigationDrawer from "../../../shared/components/NavigationDrawer";
import AnchorLink from "react-anchor-link-smooth-scroll"
import { BeachAccess, } from "@material-ui/icons";

const styles = theme => ({
  appBar: {
    boxShadow: theme.shadows[6],
    backgroundColor: theme.palette.common.black
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between"
  },
  menuButtonText: {
    //fontSize: theme.typography.body2.fontSize,
    fontSize: 12,
    fontWeight: theme.typography.h6.fontWeight,
    "&:hover": {
      //fontSize: theme.typography.body1.fontSize,
      fontWeight: theme.typography.h6.fontWeight,
      dataAos: "zoom-in" ,
      color: "primary"
      //dataAos: "zoom-in-up", 
      //dataAosDelay: "50"
    },
  },
  brandText: {
    fontFamily: "'Heebo', cursive",
    fontWeight: 900
  },
  noDecoration: {
    textDecoration: "none !important",
    display: "contents"
  }
});

function NavBar(props) {
  const {
    classes,
    openRegisterDialog,
    openLoginDialog,
    handleMobileDrawerOpen,
    handleMobileDrawerClose,
    mobileDrawerOpen,
    selectedTab,
  } = props;

  const [anchorEl, setAnchorEl] = useState(null);
  //const [hover, setHover] = useState(false);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const menuItems = [
    {
      link: "/",
      name: "Home",
      icon: <HomeIcon className="text-white" />
    },
    {
      link: "/sandboxpage",
      name: "SandboxPage",
      icon: <BeachAccess className="text-white" />
    },
    {
      link: "/blog",
      name: "Blog",
      icon: <BookIcon className="menuButtonText text-white"/>
    },
    {
      name: "Register",
      onClick: openRegisterDialog,
      icon: <HowToRegIcon className="text-white" style={{'&:hover': {dataAos: "zoom-in", color: "#6e3a48"}}}/>
    },
    {
      name: "Login",
      onClick: openLoginDialog,
      icon: <LockOpenIcon className="text-white" />
    }
  ];
  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <div>
            <Typography
              variant="h4"
              className={classes.brandText}
              display="inline"
              color="primary"
            >
              R
            </Typography>
            <Typography
              variant="h4"
              className={classes.brandText}
              display="inline"
              color="secondary"
            >
              N
            </Typography>
          </div>
          <Button 
            color="secondary" 
            size="large"
            classes={{ text: classes.menuButtonText }}
            textDecoration="none !important"
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
            open={open}
            data-aos={ open ? "zoom-in" : null}
            //style={{'&:hover': {dataAos: "zoom-out"}}}
          >
            <AnchorLink offset='100' href='#sandbox-top' className={classes.noDecoration}>
            <Typography
                variant="h4"
                className={classes.menuButtonText}
                display="inline"
                color="secondary"
                textDecoration="none !important"
                
              >
                SANDBOX
              </Typography>
            </AnchorLink>
          </Button>
          <div>
            <Hidden mdUp>
              <IconButton
                className={classes.menuButton}
                style={{'&:hover': {dataAos: "zoom-out"}}}
                onClick={handleMobileDrawerOpen}
                aria-label="Open Navigation"
              >
                <MenuIcon color="primary" />
              </IconButton>
            </Hidden>
            <Hidden smDown>
              {menuItems.map(element => {
                if (element.link) {
                  return (
                    <Link
                      key={element.name}
                      to={element.link}
                      className={classes.noDecoration}
                      onClick={handleMobileDrawerClose}
                    >
                      
                      <Button
                        color="secondary"
                        style={{'&:hover': {dataAos: "zoom-in", color: "#6e3a48"}}}
                        //onMouseEnter={{dataAos: "zoom-in", color: "#6e3a48"}}
                        size="large"
                        classes={{ text: classes.menuButtonText }}
                      >
                        <ListItemIcon display="contents" color="primary">{element.icon}</ListItemIcon>
                        {element.name}
                      </Button>
                    </Link>
                  );
                }
                return (
                  <Button
                    color="secondary"
                    size="large"
                    onClick={element.onClick}
                    classes={{ text: classes.menuButtonText }}
                    key={element.name}
                    //style={{ data-aos: "zoom-in"}}
                    data-aos="zoom-in-up" 
                    data-aos-delay="100"
                  >
                    <ListItemIcon >{element.icon}</ListItemIcon>
                    {element.name}
                  </Button>
                );
              })}
            </Hidden>
          </div>
        </Toolbar>
      </AppBar>
      <NavigationDrawer
        menuItems={menuItems}
        anchor="right"
        open={mobileDrawerOpen}
        selectedItem={selectedTab}
        onClose={handleMobileDrawerClose}
      />
    </div>
  );
}

NavBar.propTypes = {
  classes: PropTypes.object.isRequired,
  handleMobileDrawerOpen: PropTypes.func,
  handleMobileDrawerClose: PropTypes.func,
  mobileDrawerOpen: PropTypes.bool,
  selectedTab: PropTypes.string,
  openRegisterDialog: PropTypes.func.isRequired,
  openLoginDialog: PropTypes.func.isRequired
};

export default withStyles(styles, { withTheme: true })(memo(NavBar));
