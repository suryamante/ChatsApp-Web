import React, {useState, useEffect} from 'react';
import {app} from './firebase/config';
import './style.css';
import LeftSide from './left/LeftSide';
import RightSide from './right/RightSide';
import Profile from './profile/Profile';
import Preview from './Preview';
import Settings from './settings/Settings';
import ReactLoading from 'react-loading';
import FriendRequests from './friend requests/FriendRequests';
import {dismissOptionMenu, downloadProfilePicture} from './Utilities';

export const MainContext = React.createContext();

const Main = () => {

  window.ONLINEMODE = false;
  window.showEmojiPicker = false;

  const [state, setState] = useState({
    showProfile: false,
    showSettings: false,
    showFriendRequests: false,
    loading: true,
    profilePicturePreview: false,
    user: window.USER ? window.USER : null,
    focusedChat: null
  });

  const updateFocusedChat = (uid) => {
    try{
      if(uid !== window.focusedChat){
        try{
          window.USER.peoples[uid].chatCounter = 20;
        }catch(error){}
        window.focusedChat = uid;
        setState({
          ...state,
          user: window.USER,
          focusedChat: uid
        });
      }
    }catch(error){}
  }

  const showFriendRequests = (bool) => {
    try {
      window.showFriendRequests = bool;
      setState({
        ...state,
        user: window.USER,
        showFriendRequests: bool
      });
    } catch (e) {}
  }

  const getFocusedChat = () => {
    return window.focusedChat;
  }

  const showProfile = (bool) => {
    try {
      window.showProfile = bool;
      setState({
        ...state,
        user: window.USER,
        showProfile: bool
      });
    } catch (e) {
      console.log(e);
    }
  }

  const showSettings = (bool) => {
    try {
      window.showSettings = bool;
      setState({
        ...state,
        user: window.USER,
        showSettings: bool
      });
    } catch (e) {
      console.log(e);
    }
  }

  const profileChanged = () => {
    try {
      setState({
        ...state,
        user: window.USER
      })
    } catch (e) {
      console.log(e);
    }
  }

  const userDataChanged = () =>{
    profileChanged();
  }

  const profileChangeListener = (uid) => {
    try {
      app.database().ref('users').child(uid).child('profile').on('child_changed', (snapshot) => {
        window.USER.peoples[uid].profile[snapshot.key] = snapshot.val();
        window.USER.peoples[uid].profile.profilePictureLoaded = false;
        downloadProfilePicture(window.USER.peoples[uid], uid, userDataChanged);
        userDataChanged();
      }, (error) => {console.log(error);});
    } catch (e) {
      console.log(e);
    }
  }

  const fetchPeopleInfo = (uid, people) => {
    try {
      profileChangeListener(uid);
      app.database().ref('users').child(uid).child('profile')
        .get().then((snapshot) => {
          if(snapshot.val() !== null){
            if(window.USER.peoples != undefined){
              window.USER.peoples[uid] = {
                profile: snapshot.val()
              }
              downloadProfilePicture(window.USER.peoples[uid], uid, userDataChanged);
            }else{
              window.USER.peoples = {};
              window.USER.peoples[uid] = {
                profile: snapshot.val()
              }
            }
            if(people.blocked){
              window.USER.peoples[uid].isBlocked = true;
            }else{
              window.USER.peoples[uid].isBlocked = false;
            }
            fetchMessageIDs(uid);
          }
          setState({
            ...state,
            loading:false,
            user: window.USER
          });
        }).catch((error) => {console.log(error);});
    } catch (e) {
      console.log(e);
    }
  }

  const fetchPeoplesInfo = (peoples) => {
    try {
      for(let uid in peoples){
        fetchPeopleInfo(uid, peoples[uid]);
      }
    } catch (e) {
      console.log(e);
    }
  }

  const fetchMessages = (messageIDs, uid) => {
    try {
      messageIDs = Object.entries(messageIDs);
      for(let obj in messageIDs){
        let mId = messageIDs[obj][0];
        app.database().ref('messages').child(mId)
          .get().then((snapshot) => {
            if(snapshot.exists()){
              let newMessage = snapshot.val();
              if(newMessage.status !== 'seen' && newMessage.status !== 'deleted' && newMessage.sender !== app.auth().currentUser.uid){
                if(window.USER.peoples[uid].notifications !== undefined){
                  window.USER.peoples[uid].notifications = window.USER.peoples[uid].notifications + 1;
                }else{
                  window.USER.peoples[uid].notifications = 1;
                }
              }
              if(newMessage.type === 'photo'){
                newMessage.isThumbnail = true;
              }
              window.USER.peoples[uid].messages[window.USER.peoples[uid].messages.length] = newMessage;
              if(obj == messageIDs.length - 1){
                setState({
                  ...state,
                  loading:false,
                  user: window.USER
                });
              }
            }
          }).catch((error) => {console.log(error);});
      }
    } catch (e) {
      console.log(e);
    }
  }

  const fetchMessageIDs = (uid) => {
    try {
      app.database().ref('users').child(app.auth().currentUser.uid)
        .child('messages').child(uid).limitToLast(20)
        .get().then((snapshot) => {
          if(snapshot.exists()){
            window.USER.peoples[uid].messages = [];
            fetchMessages(snapshot.val(), uid);
          }
        }).catch((error) => {console.log(error);});
    } catch (e) {
      console.log(e);
    }
  }

  const fetchData = () => {
    try {
      app.database().ref('users').child(app.auth().currentUser.uid).get().then((snapshot) => {
          if(snapshot.val() != null){
            window.USER = snapshot.val();
            console.log(window.USER.profile.profilePicture);
            downloadProfilePicture(window.USER, window.userUID, userDataChanged);
            var peoples = window.USER.peoples;
            if(peoples !== undefined){
              window.USER.peopleUIDS = peoples;
              window.USER.peoples = {};
              fetchPeoplesInfo(peoples);
            }else{
              setState({
                ...state,
                loading:false,
                user: window.USER
              })
            }
          }else{
            app.auth().signOut();
          }
        }).catch((error) => {
          if(window.USER == undefined){
            fetchData();
          }
        });
    } catch (e) {
      console.log(e);
    }
  }

  const profilePicturePreview = (bool) => {
    try {
      window.profilePicturePreview = bool;
      setState({
        ...state,
        user: window.USER,
        profilePicturePreview: bool
      });
    } catch (e) {
      console.log(e);
    }
  }

  const updateNotifications = () => {
    try {
      let temp = window.USER.peoples[window.newMessage.sender].notifications;
      if(temp !== undefined){
        window.USER.peoples[window.newMessage.sender].notifications = temp + 1;
        console.log(document.title);
        document.title = 'ChatsApp (' + (temp + 1) + ') new notifications';
      }else{
        window.USER.peoples[window.newMessage.sender].notifications = 1;
        document.title = 'ChatsApp (1) new notification';
      }
    } catch (e) {console.log(e);}
  }

  const loadMessage = (key) => {
    try {
      app.database().ref('messages').child(key).get().then((snapshot) => {
          if(snapshot.exists()){
            window.newMessage = snapshot.val();
            if(window.USER.peoples[window.newMessage.sender].isBlocked){
              app.database().ref('users').child(app.auth().currentUser.uid).child('notifications')
              .child(key).remove();
            }else{
              console.log(window.newMessage);
              if(window.USER.peoples[window.newMessage.sender].messages !== undefined){
                let length = window.USER.peoples[window.newMessage.sender].messages.length;
                if(window.newMessage.type === 'photo'){
                  window.newMessage.isThumbnail = true;
                }
                if(window.USER.peoples[window.newMessage.sender].messages[length - 1].date !== window.newMessage.date){
                  window.USER.peoples[window.newMessage.sender].messages[length] = window.newMessage;
                  updateNotifications();
                }
              }else{
                if(window.newMessage.type === 'photo'){
                  window.newMessage.isThumbnail = true;
                }
                window.USER.peoples[window.newMessage.sender].messages = [window.newMessage];
                updateNotifications();
              }

              let temp2 = {};
              Object.assign(temp2, window.USER.peoples[window.newMessage.sender]);
              delete window.USER.peoples[window.newMessage.sender];
              window.USER.peoples[window.newMessage.sender] = temp2;

              window.USER.peoples[window.newMessage.sender].newMessageReceived = true;
              setState({
                ...state,
                user: window.USER,
                focusedChat: window.focusedChat
              });
              app.database().ref('messages').child(key).update({
                status: 'received'
              },(error) => {
                if(!error){
                  app.database().ref('users').child(app.auth().currentUser.uid).child('notifications').child(key).remove();
                  app.database().ref('users').child(app.auth().currentUser.uid)
                    .child('messages').child(window.newMessage.sender).child(key).set(key, (error) => {console.log(error);});
                }
              });
            }
          }
        }).catch((error) => {console.log(error);});
    } catch (e) {
      console.log(e);
    }
  }

  const addMessagesListener = () => {
    try{
      if(window.USER.peoples !== undefined){
        clearInterval(window.messagesListenerIntervalId);
        app.database().ref('users').child(app.auth().currentUser.uid)
          .child('notifications').on('child_added' ,(snapshot) => {
            let key = snapshot.key;
            loadMessage(key);
        }, (error) => {console.log(error);});
      }
    }catch(error){console.log(error);}
  }

  const addfriendRequestListener = () => {
    try {
      if(window.USER != undefined){
        clearInterval(window.friendRequestListenerIntervalId);
        app.database().ref('users').child(app.auth().currentUser.uid)
          .child('friendrequests').on('child_added' ,(snapshot) => {
            if(snapshot.val()){
              let friendUID = snapshot.key;
              let friendRequestStatus = snapshot.val().status;
              if(friendRequestStatus === 'pending'){
                if(snapshot.val().sender && snapshot.val().sender == app.auth().currentUser.uid){
                  app.database().ref('users').child(friendUID)
                    .child('friendrequests').child(app.auth().currentUser.uid).child('status')
                    .on('value', (status) => {
                      if(status.val() && status.val() === 'accepted'){
                        app.database().ref('users').child(app.auth().currentUser.uid)
                          .child('friendrequests').child(friendUID).set(null, (error) => {console.log(error);});
                        app.database().ref('users').child(app.auth().currentUser.uid).child('peoples')
                          .child(friendUID).set(friendUID, (error) => {
                            if(!error){
                              fetchPeopleInfo(friendUID, friendUID);
                            }
                          });
                      }
                    }, (error) => {console.log(error);});
                }else{
                  app.database().ref('users').child('UIDs').child(friendUID)
                  .get().then((snap) => {
                    if(snap.val()){
                      if(window.USER.newFriendRequests !== undefined){
                         window.USER.newFriendRequests.push({
                           uid: friendUID,
                           phone: snap.val()
                         });
                      }else{
                        window.USER.newFriendRequests = [{
                          uid: friendUID,
                          phone: snap.val()
                        }];
                      }
                      setState({
                        ...state,
                        user:window.USER
                      });
                      app.database().ref('users').child(app.auth().currentUser.uid)
                        .child('friendrequests').child(friendUID).child('status')
                        .on('value', (status) => {
                          if(status.val() && status.val() === 'accepted'){
                            app.database().ref('users').child(app.auth().currentUser.uid)
                              .child('friendrequests').child(friendUID).set(null, (error) => {
                                if(!error){
                                  let temp = window.USER.newFriendRequests.filter((request) => request.uid !== friendUID);
                                  window.USER.newFriendRequests = temp;
                                  setState({
                                    ...state,
                                    user:window.USER
                                  });
                                  app.database().ref('users').child(app.auth().currentUser.uid).child('peoples')
                                    .child(friendUID).set(friendUID, (error) => {
                                      if(!error){
                                        fetchPeopleInfo(friendUID, friendUID);
                                      }
                                    });
                                }
                              });
                          }
                        }, (error) => {console.log(error);});
                    }
                  }).catch((error) => {console.log(error);});
                }
              }
            }
          }, (error) => {console.log(error);});
      }
    } catch (e) {
      console.log(e);
    }
  }

  const updateAsOnline = () => {
    app.database().ref('users').child(app.auth().currentUser.uid).child('online-status')
      .set(new Date().getTime().toString(), (error) => {console.log(error);});
  }

  const updateOnlineStatus = () => {
    try {
      if(window.ONLINEMODE){
        updateAsOnline();
        window.onlineSetterInterval = setInterval(() => {
          updateAsOnline();
        },5000);
      }
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    try {
      if(state.loading && window.USER == null){
        updateOnlineStatus();
        fetchData();
      }
    } catch (e) {
      console.log(e);
    }
  },[state.loading]);

  useEffect(() => {
    try {
      const onKeyDown = (event) => {
        if(event.key == 'Escape'){
          try{
            if(window.profilePicturePreview){
              profilePicturePreview(false);
            }else if(window.showProfile){
              showProfile(false);
            }else if(window.showSettings){
              showSettings(false);
            }else if(window.showFriendRequests){
              showFriendRequests(false);
            }
          }catch(error){console.log(error);}
        }
      }
      window.addEventListener('keydown', onKeyDown);
      return () => {
        window.removeEventListener('keydown', onKeyDown);
      }
    } catch (e) {}
  },[]);

  useEffect(() => {
    try {
      window.messagesListenerIntervalId = setInterval(addMessagesListener,5000);
      window.friendRequestListenerIntervalId = setInterval(addfriendRequestListener,5000);
    } catch (e) {
      console.log(e);
    }
  },[]);

  useEffect(() => {
    try {
      const checkWidth = () => {
        userDataChanged();
      }
      const onResize = () => {
        dismissOptionMenu();
        checkWidth();
      }
      try{
        window.addEventListener('resize', onResize);
      }catch(error){}
      try{
        return () => {
          window.removeEventListener('resize', onResize);
        }
      }catch(error){}
    } catch (e) {
      console.log(e);
    }
  },[]);

  return(
    <React.Fragment>
      {
        false ?
        <div className='not-supported flex flex-justify-center flex-align-center'>
          ChatsApp is supported only on large screens (Desktop/Laptop).
        </div>
        :<div className='main-layout flex flex-row flex-justify-center flex-align-center scrollbar-thin' id='main-layout' onContextMenu={(event) => event.preventDefault()}>
          {
            state.loading && window.USER == null ?
            <ReactLoading type='bubbles' color='#000000'/>
            :<MainContext.Provider value={{
                showProfile:showProfile, showSettings: showSettings,
                user: state.user, profileChanged: profileChanged,
                profilePicturePreview: profilePicturePreview, updateFocusedChat: updateFocusedChat,
                getFocusedChat: getFocusedChat, userDataChanged: userDataChanged,
                showFriendRequests:showFriendRequests }}>
              <div className='container-fluid scrollbar-thin' id='main-container'>
                <div className='row'>
                  <div className='col-4 leftSide' id='leftSide'>
                    <LeftSide/>
                    {
                      window.showProfile ?
                      <div className='profile-layout flex flex-column absolute bg-white' id='profile-layout'>
                        <Profile/>
                      </div>
                      :window.showSettings ?
                      <div className='profile-layout flex flex-column absolute bg-white' id='settings-layout'>
                        <Settings/>
                      </div>
                      :window.showFriendRequests ?
                      <div className='profile-layout flex flex-column absolute bg-white' id='friend-requests-layout'>
                        <FriendRequests/>
                      </div>
                      :null
                    }
                  </div>
                  <div className='col-8 rightSide flex flex-column relative' id='rightSide'>
                    <RightSide/>
                  </div>
                </div>
              </div>
              {
                window.profilePicturePreview?
                <div className={window.theme ? 'picture-preview dark-mode flex flex-row flex-justify-center flex-align-center absolute bg-white picture-preview-dark-mode'
                   : 'picture-preview flex flex-row flex-justify-center flex-align-center absolute bg-white'}>
                  <Preview image={window.imagePreview}/>
                </div>
                :null
              }
            </MainContext.Provider>
          }
        </div>
      }
    </React.Fragment>
  );
}

export default Main;
