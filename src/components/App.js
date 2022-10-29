import React, {Component} from 'react';
import {BrowserRouter, Switch, Redirect} from 'react-router-dom';
import Login from './authentication/Login';
import {app} from './firebase/config';
import Main from './Main';

class App extends Component{

	constructor(props){
		super(props);
		this.state = {
			user: app.auth().currentUser
		}
	}

	render(){
		try{
			return(
				<React.Fragment>
					{this.state.user?<Main/>:<Login/>}
					<BrowserRouter>
						<Switch>
							<Redirect to='.'/>
						</Switch>
					</BrowserRouter>
				</React.Fragment>
			);
		}catch(error){}
	}

}
export default App;
