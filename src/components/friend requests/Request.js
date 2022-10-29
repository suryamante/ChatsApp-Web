import React, {useContext} from 'react';
import {MainContext} from '../Main';
import {app} from '../firebase/config';

const Request = ({request}) => {
  const mainContext = useContext(MainContext);
  const acceptRequest = () => {
    try{
      app.database().ref('users').child(app.auth().currentUser.uid)
        .child('friendrequests').child(request.uid).child('status')
        .set('accepted', (error) => {
          console.log(error);
      });
    }catch(error){console.log(error);}
  }
  return (
    <React.Fragment>
      <div className='request-layout flex flex-row flex-justify-start flex-align-center'>
        <div className='request-phone'>{request.phone}</div>
        <button onClick={acceptRequest} className='btn btn-outline-success btn-sm'>
          Accept
        </button>
      </div>
    </React.Fragment>
  );
}

export default Request;
