import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'font-awesome/css/font-awesome.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './components/App.js';
import {app} from './components/firebase/config';
import Login from './components/authentication/Login';

app.auth().onAuthStateChanged((user) => {
  if (user) {
    window.userUID = user.uid;
    ReactDOM.render(
      <App />,
      document.getElementById("root")
    );
  } else {
    window.userUID = null;
    ReactDOM.render(<Login />, document.getElementById("root"));
  }
});
