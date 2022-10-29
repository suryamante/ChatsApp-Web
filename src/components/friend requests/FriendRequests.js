import React, {useContext} from 'react';
import Header from '../profile/Header';
import Request from './Request.js';
import {MainContext} from '../Main';

const FriendRequests = () => {
  const mainContext = useContext(MainContext);
  let newFriendRequests = window.USER.newFriendRequests;
  return (
    <React.Fragment>
      <Header show={mainContext.showFriendRequests}/>
      <div className={window.theme ? 'dark-mode ' : null} style={{height:'100%'}}>
        {newFriendRequests.map(request => <Request key={request.uid} request={request}/>)}
      </div>
    </React.Fragment>
  );
}

export default FriendRequests;
