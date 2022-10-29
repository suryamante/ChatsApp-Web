import React, {useContext, useState, useEffect} from 'react';
import {MainContext} from '../Main';
import {ChatsContext} from './Chats';
import {app} from '../firebase/config';
import {decryptTextMessage, getFormattedDate} from '../Utilities';
import Deleted from '../right/Deleted';
import {OptionIcon} from '../Shared/OptionIcon';
import {Status} from '../Shared/Status';
import {DeletedIcon} from '../Shared/DeletedIcon';

const People = ({people, uid, resetFilter, noClick}) => {

  const [state, setState] = useState({
    status: false,
    listenerId: null
  });

  const mainContext = useContext(MainContext);
  const chatsContext = useContext(ChatsContext);
  const messages = people.messages;
  const notifications = window.USER.peoples[uid].notifications;
  const newNotificationClass = notifications !== undefined && notifications > 0 ?
    'new-notification-class' : '';

  let profilePictureLoaded = window.USER.peoples[uid].profile.profilePictureLoaded;
  let profilePicture = window.USER.peoples[uid].profile.profilePicture;
  let focusedChatClass = uid === mainContext.getFocusedChat() ? window.theme ?
  'focused-chat-dark-mode' : 'focused-chat' : null;
  let status = window.USER.peoples[uid].onlineStatus;
  let date = messages && messages[messages.length - 1] ?
  getFormattedDate(messages[messages.length - 1].date) : undefined;
  let id = null;

  const updateFocus = (event) => {
    try{
      let menu = document.getElementById(uid+'optionIcon');
      if(event.target === menu){
        showMenu(event);
      }else{
        mainContext.updateFocusedChat(uid);
      }
    }catch(error){mainContext.updateFocusedChat(uid);}
    if(resetFilter != undefined){
      resetFilter();
    }
  }

  const showOptionButton = (event) => {
    try {
      document.getElementById(uid+'optionIcon').style.visibility='visible';
    } catch (e) {console.log(e);}
  }

  const hideOptionButton = (event) => {
    try {
      document.getElementById(uid+'optionIcon').style.visibility='hidden';
    } catch (e) {console.log(e);}
  }

  const rightClicked = (event) => {
    try {
      if(event.button === 2){
        chatsContext.selectedPeople(uid, event);
      }
    } catch (e) {console.log(e);}
  }

  const updateStatus = (status) => {
    try {
      setState({
        ...state,
        status: status
      });
    } catch (e) {console.log(e);}
  }

  const showMenu = (event) => {
    try {
      chatsContext.selectedPeople(uid, event);
    } catch (e) {console.log(e);}
  }

  const statusListener2 = () => {
    app.database().ref('users').child(uid).child('online-status')
      .get().then((snapshot) => {
        const status = snapshot.val();
        if(status){
          let t1 = Number(status);
          let t2 = Number(new Date().getTime().toString());
          if(t2 - t1 <= 7000){
            setState({
              ...state,
              status: true
            });
          }else{
            setState({
              ...state,
              status: false
            });
          }
        }
      }).catch((error) => {console.log(error);});
  }

  const statusListener = () => {
    try {
      return setInterval(() => {
        statusListener2();
      },5000);
      statusListener2();
    } catch (e) {console.log(e);}
  }

  useEffect(() => {
    try {
      if(window.ONLINEMODE){
        let id = statusListener();
        return () => {
          clearInterval(id);
        }
      }
    } catch (e) {console.log(e);}
  },[]);

  return(
    <div className={'chat-item flex flex-row flex-justify-start flex-align-center relative ' + focusedChatClass}
      onClick={(event) => updateFocus(event)} onMouseOver={showOptionButton} onMouseLeave={hideOptionButton}
      onMouseDown={rightClicked} onContextMenu={(event) => event.preventDefault()} id={uid}>
      <img src={profilePictureLoaded ? profilePicture : '/assets/images/profile.png'}
        className='profile-image profile-image-person profile-large' style={state.status &&
        !window.USER.peoples[uid].isBlocked? {border:'1px dashed #00c853'} : null}/>
      <div className='mid-box flex flex-column'>
        <div className='title'>
          {people.profile.name && people.profile.name.length > 0 ? people.profile.name : 'No name'}
        </div>
        <div className='flex flex-row'>
          {
            state.status === 'typing...'?
            <div className='last-message-text typing one-line-text'>{state.status}</div>
            :<React.Fragment>
              {
                messages !== undefined && messages.length > 0 &&  messages[messages.length-1].receiver === uid &&
                 messages[messages.length-1].status !== 'deleted'?
                 <span className='status status-person-chat'>
                   <Status status={messages[messages.length-1].status}/>
                 </span>
                :null
              }
              {
                messages != undefined && messages.length > 0?
                messages[messages.length - 1].status === 'deleted'? <Deleted mode={window.theme} person={true}/>
                :
                <div className= {'last-message-text one-line-text ' + newNotificationClass}>
                  {
                    messages[messages.length - 1].type === 'photo'?
                    <React.Fragment>
                      <span className={window.theme ? 'fa fa-photo color-grey dark-mode' : 'fa fa-photo color-grey'}
                        style={{marginLeft:'2px'}}/>
                      <span> Photo</span>
                    </React.Fragment>
                    :decryptTextMessage(messages[messages.length-1].text,
                      messages[messages.length-1].sender+messages[messages.length-1].receiver)
                  }
                </div>
                :null
              }
            </React.Fragment>
          }
        </div>
      </div>
      <div className='time-date flex flex-column flex-justify-end flex-align-end'>
        {
          window.USER.peoples[uid].isBlocked ?
          <div className='absolute' style={{color:'grey',top:'15px',right:'10px'}}><DeletedIcon mode={window.theme}/></div>
          :null
        }
        {
          !noClick?
          <React.Fragment>
            <div className='option-icon'
              onClick={(event) => showMenu(event)} id={uid+'optionIcon'}>
              <OptionIcon/>
            </div>
          </React.Fragment>
          :null
        }
        <div className='flex flex-row flex-align-center'>
          <div className='time margin-left-50px'>
            {messages !== undefined && messages.length > 0 ? date : null}
          </div>
          {
            notifications !== undefined && notifications > 0?
            <div className='new-notification-count color-white flex flex-justify-center
              flex-align-center' style={{marginLeft:'5px'}}>
              {notifications}</div>
            : null
          }
        </div>
      </div>

    </div>
  );
}

export default People;
