import React, { Fragment, Suspense, lazy } from 'react';
import logo from './logo.svg';
import './App.css';
import Amplify from 'aws-amplify';
// import { withAuthenticator, AmplifySignOut} from '@aws-amplify/ui-react';
//import { listNotes } from './graphql/queries';
//import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';
import awsconfig from './aws-exports';
// import { ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';
//import { library } from '@fortawesome/fontawesome-svg-core'
//import { faGem, faHeart } from '@fortawesome/free-solid-svg-icons';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { MuiThemeProvider, CssBaseline } from "@material-ui/core";
import theme from "./theme";
import GlobalStyles from "./GlobalStyles";
import * as serviceWorker from "./serviceWorker";
import Pace from "./shared/components/Pace";
//import { DragDropContext } from 'react-dnd';
//import { HTML5Backend } from 'react-dnd-html5-backend';

Amplify.configure(awsconfig);
//library.add(faGem, faHeart);

//const initialFormState = { name: '', description: ''}

const LoggedInComponent = lazy(() => import("./logged_in/components/Main"));

const LoggedOutComponent = lazy(() => import("./logged_out/components/Main"));

function App() {

  return (
    <div className="App">
      <BrowserRouter>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles />
        <Pace color={theme.palette.primary.light} />
        <Suspense fallback={<Fragment />}>
          <Switch>
            <Route path="/c">
              <LoggedInComponent />
            </Route>
            <Route>
              <LoggedOutComponent />
            </Route>
          </Switch>
        </Suspense>
      </MuiThemeProvider>
      </BrowserRouter>

      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Things are coming.</h1>
        <p>
          They may or may not be big. Check back soon.
        </p>
        <p>
          -Robert Noneman
        </p>
      </header>
    </div>
  );
}
// AmplifySignOut /> <--- that goes last before the last </div>
//export default withAuthenticator(App);
serviceWorker.register();
export default App;
