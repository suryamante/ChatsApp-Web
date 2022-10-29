import React, {useContext, useState, useEffect} from 'react';
import {MainContext} from '../Main';
import Preview from '../Preview';
import {app} from '../firebase/config';
import {attachToCover, detachCover, decryptTextMessage, showOptionMenu, exportChat} from '../Utilities';
import Message from './Message';

const Header = (props) => {

  const mainContext = useContext(MainContext);
  const focusedUser = mainContext.getFocusedChat();

  const [state, setState] = useState({
    profilePicture: focusedUser && window.USER.peoples[focusedUser] &&
    window.USER.peoples[focusedUser].profile.profilePictureLoaded ?
    window.USER.peoples[focusedUser].profile.profilePicture : '/assets/images/profile.png',
    focusedUser: null,
    onlineStatus: null,
    name: 'No name'
  });

  const showProfile = () => {
    try {
      props.showPeopleProfile(true);
    } catch (e) {
      console.log(e);
    }
  }

  const proceedOperationClearHistory = () => {
    try{
      let uid = mainContext.getFocusedChat();
      app.database().ref('users').child(app.auth().currentUser.uid).child('messages').child(uid)
        .set(null, (error) => {
          if(!error){
            window.USER.peoples[uid].messages=[];
            let child = document.getElementById('clear-history-confirmation-dialogue');
            if(child){
              try{
                child.parentNode.removeChild(child);
              }catch(error){}
            }
            mainContext.userDataChanged();
          }
        });
    }catch(error){}
  }

  const addOnlineStatusListener2 = (uid) => {
    app.database().ref('users').child(uid).child('online-status')
      .get().then((snapshot) => {
        const status = snapshot.val();
        if(status){
          try{
            let t1 = Number(status);
            let t2 = Number(new Date().getTime().toString());
            if(t2 - t1 <= 10000){
              let delay = 0;
              if(window.USER.peoples[uid].onlineStatus && window.USER.peoples[uid].onlineStatus === 'typing...'){
                delay  = 2000;
              }
              setTimeout(() => {
                window.USER.peoples[uid].onlineStatus = 'online';
                if(mainContext.getFocusedChat() === uid){
                  setState({
                    ...state,
                    onlineStatus: 'online',
                    name: window.USER.peoples[uid].profile.name,
                    profilePicture: window.USER.peoples[uid].profile.profilePictureLoaded ?
                    window.USER.peoples[uid].profile.profilePicture : '/assets/images/profile.png'
                  });
                }
              },delay)
            }else{
              let d1 = new Date(t1);
              let d2 = new Date(t2);
              let lastSeen = '';
              if(d1.getDate() == d2.getDate()){
                let hours = d1.getHours() < 9 ? '0' + d1.getHours() : d1.getHours();
                let minutes = d1.getMinutes() < 9 ? '0' + d1.getMinutes() : d1.getMinutes();
                lastSeen = 'last seen today at ' + hours + ':' + minutes;
              }else {
                if((d1.getMonth() == d2.getMonth() && Math.abs(d1.getDate() - d2.getDate()) == 1)
                  || d2.getMonth() == d1.getMonth() + 1 && Math.abs(d1.getDate() - d2.getDate()) == 30 ||
                   Math.abs(d1.getDate() - d2.getDate()) == 29 || Math.abs(d1.getDate() - d2.getDate()) == 28){
                    let hours = d1.getHours() < 9 ? '0' + d1.getHours() : d1.getHours();
                    let minutes = d1.getMinutes() < 9 ? '0' + d1.getMinutes() : d1.getMinutes();
                    lastSeen = 'last seen yesterday at ' + hours + ':' + minutes;
                  }else{
                    let date = d1.getDate() < 10 ? '0' + d1.getDate() : d1.getDate();
                    let month = d1.getMonth() < 9?  ('0' + Number(d1.getMonth()+1)):Number(d1.getMonth()+1);
                    lastSeen = 'last seen at ' + date + '/' + month + '/' + d1.getFullYear();
                  }
              }
              window.USER.peoples[uid].onlineStatus = lastSeen;
              if(mainContext.getFocusedChat() === uid){
                setState({
                  ...state,
                  onlineStatus: window.USER.peoples[uid].onlineStatus,
                  name: window.USER.peoples[uid].profile.name,
                  profilePicture: window.USER.peoples[uid].profile.profilePictureLoaded ?
                  window.USER.peoples[uid].profile.profilePicture : '/assets/images/profile.png'
                });
              }
            }
            window.statusChanged = true;
          }catch(error){}
        }
      }).catch((error) => {console.log(error);});
  }

  const addOnlineStatusListener = (uid) => {
    try {
      window.USER.peoples[uid].onlineStatusListenerInterval = setInterval(() => {
        if(window.USER.peoples[uid].isBlocked){
          window.USER.peoples[uid].onlineStatus = null;
          app.database().ref('users').child(uid).child('online-status').off();
          app.database().ref('users').child(uid).child('typingstatus')
          .child(app.auth().currentUser.uid).child('status').off();
          clearInterval(window.USER.peoples[uid].onlineStatusListenerInterval);
          return;
        }
        addOnlineStatusListener2(uid);
      },5000);
      if(!window.USER.peoples[uid].isBlocked){
        addOnlineStatusListener2(uid);
      }
      app.database().ref('users').child(uid).child('typingstatus').child(app.auth().currentUser.uid).child('status')
        .on('value', (snapshot) => {
          const status = snapshot.val();
          if(status && status === 'typing...'){
            try{
              if(mainContext.getFocusedChat() === uid && window.USER.peoples[uid].onlineStatus === 'online'){
                window.USER.peoples[uid].onlineStatus = status;
                setState({
                  ...state,
                  onlineStatus: 'typing...',
                  name: window.USER.peoples[uid].profile.name ? window.USER.peoples[uid].profile.name : 'No name',
                  profilePicture: window.USER.peoples[uid].profile.profilePictureLoaded ?
                  window.USER.peoples[uid].profile.profilePicture : '/assets/images/profile.png'
                });
              }
            }catch(error){}
          }
        }, (error) => {console.log(error);});
    } catch (e) {
      console.log(e);
    }
  }

  const addClearHistoryConfirmationBox = () => {
    setTimeout(() => {
      try{
        let child = document.createElement('div');
        child.id = 'clear-chat-history-confirmation-dialogue';
        child.classList.add('bg-white');
        if(window.theme){
          child.classList.add('dark-mode');
        }
        child.classList.add('small-modal');
        let div1 = document.createElement('div');
        div1.innerHTML = 'Do you really want to clear the history?';
        child.appendChild(div1);
        let div2 = document.createElement('div');
        div2.classList.add('cancel-clear');
        div2.classList.add('flex');
        div2.classList.add('flex-justify-end');
        div2.classList.add('flex-align-center');
        let button1 = document.createElement('button');
        button1.classList.add('btn-cancel');
        button1.classList.add('border-none');
        button1.innerHTML = 'Cancel';
        button1.onclick = () => detachCover(child);
        div2.appendChild(button1);
        let button2 = document.createElement('button');
        button2.classList.add('btn-proceed');
        button2.classList.add('border-none');
        button2.classList.add('color-white');
        button2.classList.add('bg-green');
        button2.innerHTML = 'Clear';
        button2.onclick = () => {
          proceedOperationClearHistory();
          detachCover(child);
        };
        div2.appendChild(button2);
        child.appendChild(div2);
        attachToCover(child);
      }catch(error){}
    },100);
  }

  const selectAll = () => {
    try {
      window.selectAllChatMessages();
    } catch (e) {
      console.log(e);
    }
  }

  const chatSearch = () => {
    let child = document.createElement('div');
    child.classList.add('chat-search-layout');
    if(window.theme){
      child.classList.add('dark-mode');
    }
    child.id = 'chat-search-layout';
    let inputSearch = document.createElement('input');
    inputSearch.setAttribute('placeHolder','Search');
    inputSearch.classList.add('search');
    inputSearch.style.backgroundImage = 'url(none)';
    inputSearch.classList.add('phone-layout');
    if(window.theme){
      inputSearch.classList.add('dark-mode');
    }
    inputSearch.oninput = (event) => {
      let query = event.target.value.trim();
      if(query.length > 0){
        setTimeout(() => {
          filteredMessagesLayout.innerHTML = '';
          for(let msg of window.USER.peoples[window.focusedChat].messages){
            let text = decryptTextMessage(msg.text, msg.sender+msg.receiver);
            if(msg.type === 'text' && msg.status !== 'deleted' &&
                  text.toLowerCase().includes(query.toLowerCase())){
              let item = document.createElement('div');
              item.classList.add('filtered-messages-layout-item')
              let person = document.createElement('span');
              {
                if(msg.sender === app.auth().currentUser.uid){
                  person.innerHTML = 'You';
                }else{
                  person.innerHTML = window.USER.peoples[window.focusedChat].profile.name ?
                    window.USER.peoples[window.focusedChat].profile.name : 'No name';
                }
              }
              person.classList.add('reply-person');
              item.appendChild(person);
              let content = document.createElement('div');
              content.innerHTML = text;
              content.classList.add('filtered-messages-layout-item-content');
              content.classList.add('one-line-text');
              if(window.theme){
                content.classList.add('color-white');
              }
              item.appendChild(content);
              item.onclick = () => {
                detachCover();
                try{
                  let element = document.getElementById(msg.date);
                  if(element){
                    element.scrollIntoView();
                    element.classList.add('animation-tracked-message');
                    setTimeout(() => {
                      element.classList.remove('animation-tracked-message');
                    },1000);
                  }
                }catch(e){}
              }
              filteredMessagesLayout.appendChild(item);
            }
          }
        },100);
      }else{
        filteredMessagesLayout.innerHTML = '';
      }
    }
    child.appendChild(inputSearch);
    let filteredMessagesLayout = document.createElement('div');
    filteredMessagesLayout.classList.add('filtered-messages-layout');
    child.appendChild(filteredMessagesLayout);
    attachToCover(child);
    inputSearch.focus();
  }

  useEffect(() => {
    try {
      const onClick = (event) => {
        try{
          let addClearHistoryConfirmationBox = document.getElementById('clear-chat-history-confirmation-dialogue');
          if(event.target != addClearHistoryConfirmationBox
            && event.target.parentNode != addClearHistoryConfirmationBox){
            let parent = document.getElementById('rightSide');
            parent.removeChild(addClearHistoryConfirmationBox);
          }
        }catch(error){}
        try{
          let menu = document.getElementById('right-header-option-menu');
          let menuToggler = document.getElementById('right-header-option-menu-toggler');
          if(event.target === menuToggler){
            menu.classList.toggle('show');
          }else{
            menu.classList.remove('show');
          }
        }catch(error){}
      }
      window.addEventListener('click', onClick);
      return () => {
        window.removeEventListener('click', onClick);
      }
    } catch (e) {
      console.log(e);
    }
  });
  useEffect(() => {
    try {
      setState({
        ...state,
        focusedUser: props.focusedUser,
        name: window.USER.peoples[props.focusedUser].profile.name ? window.USER.peoples[props.focusedUser].profile.name : 'No name',
        onlineStatus: window.USER.peoples[props.focusedUser].onlineStatus,
        profilePicture: window.USER.peoples[props.focusedUser].profile.profilePictureLoaded ?
        window.USER.peoples[props.focusedUser].profile.profilePicture : '/assets/images/profile.png'
      });
      if(!window.USER.peoples[props.focusedUser].isBlocked && window.ONLINEMODE){
        addOnlineStatusListener(props.focusedUser);
      }
      return () => {
        try{
          clearInterval(window.USER.peoples[props.focusedUser].onlineStatusListenerInterval);
          app.database().ref('users').child(props.focusedUser).child('online-status').off();
          app.database().ref('users').child(props.focusedUser).child('typingstatus')
          .child(app.auth().currentUser.uid).child('status').off();
        }catch(error){console.log(error);}
      }
    } catch (e) {
      console.log(e);
    }
  },[props.focusedUser]);

  const updateBlockUnblockStatus = (uid, status) => {
    app.database().ref('users').child(window.userUID).child('peoples').child(uid).child('blocked')
    .set(status, (error) => {
      if(!error){
        window.USER.peoples[uid].isBlocked = status;
        mainContext.userDataChanged();
      }
    });
  }

  const addOptionMenu = (event) => {
    const menu = [
      {
        innerHTML:'Search',
        tagName: 'div',
        onClick: () => chatSearch()
      },
      {
        innerHTML:'Select all',
        tagName: 'div',
        onClick: () => selectAll()
      },
      {
        innerHTML:'Clear chat',
        tagName: 'div',
        onClick: () => addClearHistoryConfirmationBox()
      },
      {
        innerHTML:'Export chat',
        tagName: 'div',
        onClick: () => exportChat(focusedUser, mainContext.userDataChanged)
      },
      {
        innerHTML: window.USER.peoples[focusedUser].isBlocked ? 'Unblock' : 'Block',
        tagName: 'div',
        onClick: () => window.USER.peoples[focusedUser].isBlocked ?
        updateBlockUnblockStatus(focusedUser, false) : updateBlockUnblockStatus(focusedUser, true)
      },
      {
        innerHTML:'Close',
        tagName: 'div',
        onClick: () => null
      }
    ];
    showOptionMenu(menu, event.clientX, event.clientY);
  }

  return(
    <React.Fragment>
      <div className={window.theme ? 'header dark-mode' : 'header'} id='header-right'>
        <img className='profile-image'
          src={state.profilePicture} onClick={showProfile} style={{marginLeft:'10px'}}/>
        <div className='flex flex-column flex-column-start'>
          <span className='person-name' onClick={showProfile}>
            {state.name.length > 0 ? state.name : 'No name'}
          </span>
          <span className='person-online-status' onClick={showProfile}> {state.onlineStatus} </span>
        </div>
        <span className={window.theme ? 'fa fa-search chat-search-icon cursor-pointer color-white' :
        'fa fa-search chat-search-icon cursor-pointer color-grey'} onClick={chatSearch}/>
        <span className={window.theme ? 'fa fa-ellipsis-v menu-icon menu-icon-chat'
          : 'fa fa-ellipsis-v menu-icon menu-icon-chat'} id='right-header-option-menu-toggler'
          onClick={addOptionMenu} style={{color: window.theme ? 'white' : 'grey'}}>
        </span>
      </div>
    </React.Fragment>
  );
};

export default Header;
