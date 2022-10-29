import React, {useContext, useEffect, useState} from 'react';
import Header from './Header';
import Chat from './Chat';
import Communicate from './Communicate';
import {MainContext} from '../Main';
import {app} from '../firebase/config';
import PeopleProfile from './PeopleProfile';

const RightSide = (props) => {

  const [state, setState] = useState({
    peopleProfile: false
  });

  const mainContext = useContext(MainContext);

  const focusedUser = mainContext.getFocusedChat();
  let messages = undefined;
  try{
    if(mainContext.user.peoples[focusedUser].messages !== undefined){
      messages = mainContext.user.peoples[focusedUser].messages;
    }
  }catch(error){}

  const showPeopleProfile = (bool) => {
    const updatelayout = (bool, val) => {
      window.peopleProfile = bool;
      try{
        let rightHeader = document.getElementById('header-right');
        rightHeader.style.width = val;
      }catch(error){}
      try{
        let rightChat = document.getElementById('chat');
        rightChat.style.width = val;
      }catch(error){}
      try{
        let rightCommunication = document.getElementById('communicate-layout');
        rightCommunication.style.width = val;
      }catch(error){}
      try{
        let replyMessageLayout = document.getElementById('repliedMessageLayout');
        replyMessageLayout.style.width = val;
      }catch(error){}
      try{
        let emojiPicker = document.getElementsByClassName('emoji-picker-react')[0];
        emojiPicker.style.width = val;
      }catch(error){}
      try{
        if(val === '60%'){
          document.getElementById('scrollBottom').classList.add('display-none');
        }else{
          document.getElementById('scrollBottom').classList.remove('display-none');
        }
      }catch(error){}
    }

    try{
      setState({
        ...state,
        peopleProfile: bool
      });
    }catch(error){}
  }

  const updateOnlineStatus = (status) => {
    try{
      if(window.USER.onlineStatus !== 'typing...' && window.ONLINEMODE){
        window.USER.onlineStatus = 'typing...';
        app.database().ref('users').child(app.auth().currentUser.uid).child('typingstatus').child(mainContext.getFocusedChat())
          .child('status').set('typing...', (error) => {
            if(!error){
              setTimeout(() => {
                window.USER.onlineStatus = 'online';
                app.database().ref('users').child(app.auth().currentUser.uid).child('typingstatus').child(mainContext.getFocusedChat())
                  .child('status')
                  .set('null', (error) => {console.log(error);});
              } ,3000);
            }
          }).catch((error) => {console.log(error);});
      }
    }catch(error){}
  }

  useEffect(() => {
    try {
      window.USER.onlineStatus = 'online';
    } catch (e) {
      console.log(e);
    }
  });

  useEffect(() => {
    try {
      const onKeyDown = (event) => {
        if(event.key == 'Escape'){
          if(state.peopleProfile){
            showPeopleProfile(false);
          }
        }
      }
      window.addEventListener('keydown', onKeyDown);
      return () => {
        window.removeEventListener('keydown', onKeyDown);
      }
    } catch (e) {
      console.log(e);
    }
  },[state.peopleProfile]);

  useEffect(() => {
    try{
      if(window.theme){
        document.getElementById('rightSide').classList.add('dark-mode');
      }else{
        document.getElementById('rightSide').classList.remove('dark-mode');
      }
    }catch(error){}
  });

  return(
    <React.Fragment>
      {
        focusedUser == null?
        <div className={window.theme ? 'no-chat-selected flex flex-column flex-justify-center flex-align-center bg-white dark-mode'
              : 'no-chat-selected flex flex-column flex-justify-center flex-align-center bg-white'}>
          <img src={'logo.svg'} className='logo logo-large'/>
          <h5>Welcome to ChatsApp</h5>
        </div>
        :<React.Fragment>
          <Header focusedUser={focusedUser} showPeopleProfile={showPeopleProfile}/>
          <Chat focusedUser={focusedUser}/>
          <Communicate updateOnlineStatus={updateOnlineStatus} focusedUser={focusedUser}/>
          {
            state.peopleProfile?
            <div className={window.innerWidth < 950 ? 'peopleProfile full-screen' : 'peopleProfile'} id='peopleProfile'>
              <PeopleProfile uid={focusedUser} showPeopleProfile={showPeopleProfile}/>
            </div>
            :null
          }
        </React.Fragment>
      }
    </React.Fragment>
  );
}

export default RightSide;
