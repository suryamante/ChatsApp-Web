import React, {useContext, useEffect, useState} from 'react';
import {MainContext} from '../Main';
import Message from './Message';
import {app} from '../firebase/config';
import ReactLoading from 'react-loading';
import {decryptTextMessage} from '../Utilities';
import {attachToCover, detachCover, getPartialMessages, showOptionMenu, addConfirmationDialogue,
  showAlert} from '../Utilities';

export const ChatContext = React.createContext();

const Chat = (props) => {

  const [state, setState] = useState({
    loading: false,
    selectingMessages:false
  });

  const mainContext = useContext(MainContext);
  const focusedUser = mainContext.getFocusedChat();

  let fetchingMessages = false;
  let messages = undefined;
  messages = getPartialMessages(focusedUser ,messages);


  const fetchMessages = (messageIDs, uid) => {
    try {
      messageIDs = Object.entries(messageIDs);
      if(messageIDs.length <= 1){
        updateLoadingBar(false);
        window.USER.peoples[focusedUser].fetchedNewMessages = false;
      }else{
        for(let i = messageIDs.length - 2; i >= 0; i--){
          let message = messageIDs[i][0];
          app.database().ref('messages').child(message)
            .get().then((snapshot) => {
              if(snapshot.exists()){
                fetchingMessages = false;
                let newMessage = snapshot.val();
                if(newMessage.type === 'photo'){
                  newMessage.isThumbnail = true;
                }
                window.USER.peoples[uid].messages.unshift(newMessage);
                if(i == 0){
                  window.USER.peoples[focusedUser].chatCounter +=
                    (messageIDs.length === 50 ? 20 : messageIDs.length) - 1;
                  updateLoadingBar(false);
                  mainContext.userDataChanged();
                }
              }else{
                updateLoadingBar(false);
              }
          }).catch((error) => {updateLoadingBar(false);});
        }
      }
    } catch (e) {console.log(e);}
  }

  const fetchMessageIDs = (uid) => {
    try {
      if(messages == undefined || messages.length == 0){
        updateLoadingBar(false);
      }else{
        app.database().ref('users').child(window.userUID)
          .child('messages').child(uid).orderByKey().endAt(messages[0].date).limitToLast(50)
          .get().then((snapshot) => {
            if(snapshot.exists()){
              fetchMessages(snapshot.val(), uid);
            }else{
              updateLoadingBar(false);
            }
        }).catch((error) => {updateLoadingBar(false);});
      }
    } catch (e) {console.log(e);}
  }

  const fetchMoreMessagesFromDatabase = () => {
    try{
      let l1 = window.USER.peoples[focusedUser].messages.length;
      let l2 = window.USER.peoples[focusedUser].chatCounter;
      if(l1 > l2){
          let diff = l1 - l2;
          window.USER.peoples[focusedUser].chatCounter += diff >= 20 ? 20 : diff;
          updateLoadingBar(false);
          mainContext.userDataChanged();
      }else{
        fetchMessageIDs(focusedUser);
      }
    }catch(error){updateLoadingBar(false);}
  }

  const fetchMoreMessages = (chatScrollHeight) => {
    try {
      window.USER.peoples[focusedUser].fetchedNewMessages = true;
      fetchingMessages = true;
      updateLoadingBar(true);
      window.USER.peoples[focusedUser].prevScrollHeight = chatScrollHeight;
      fetchMoreMessagesFromDatabase();
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    try {
      const onScroll = () => {
        window.USER.peoples[focusedUser].messageDeleted = undefined;
        const chat = document.getElementById('chat');
        if(chat){
          window.USER.peoples[focusedUser].scrollTop = chat.scrollTop;
          if(chat.scrollTop == 0 && !fetchingMessages){
            fetchMoreMessages(chat.scrollHeight);
          }
        }
      }
      try{
        const chat = document.getElementById('chat');
        if(chat){
          try{
            if(window.USER.peoples[focusedUser].fetchedNewMessages){
                window.USER.peoples[focusedUser].fetchedNewMessages = false;
                chat.scrollTo(0,chat.scrollHeight - window.USER.peoples[focusedUser].prevScrollHeight);
            }else if(window.USER.peoples[focusedUser].messageDeleted ||
              window.USER.peoples[focusedUser].scrollTop != undefined){
              chat.scrollTo(0,window.USER.peoples[focusedUser].scrollTop);
            }
          }catch(error){console.log(error);}
          chat.addEventListener('scroll', onScroll);
        }
      }catch(error){console.log(error);}
      try{
        if(window.USER.peoples[focusedUser].notifications !== undefined &&
          window.USER.peoples[focusedUser].notifications > 0){
          document.title = 'ChatsApp';
          window.USER.peoples[focusedUser].notifications = 0;
          mainContext.userDataChanged();
        }
      }catch(error){console.log(error);}
      return () => {
        const chat = document.getElementById('chat');
        if(chat) chat.removeEventListener('scroll', onScroll);
      }
    } catch (e) {console.log(e);}
  });

  useEffect(() => {
    try {
      const chat = document.getElementById('chat');
      if(chat){
        chat.scrollTo(0,chat.scrollHeight);
      }
    } catch (e) {console.log(e);}
  },[props.focusedUser]);

  useEffect(() => {
    try {
      if(window.USER.peoples[focusedUser].newMessageReceived){
        window.USER.peoples[focusedUser].newMessageReceived = false;
        const chat = document.getElementById('chat');
        if(chat){
          chat.scrollTo(0,chat.scrollHeight);
        }
      }
    } catch (e) {console.log(e);}
  });

  const deleteMessage = (message) => {
    try {
      const params = {
        id: 'delete-message-confirmation-dialogue',
        message: 'Do you really want to delete this message?',
        actionId: message,
        action: proceedOperationDeleteMessage,
        actionText: 'Delete'
      };
      addConfirmationDialogue(params);
    } catch (e) {
      console.log(e);
    }
  }

  const allMessagesAreSelected = () => {
    try {
      if(window.USER.peoples[focusedUser].messages.length ==
        window.USER.peoples[focusedUser].selectedMessages.length){
          return true;
      }
      return false;
    } catch (e) {console.log(e);}
  }

  const selectAll = () => {
    try {
      let bool = true;
      let selectAllCheckBox = document.getElementById('select-all-checkbox');
      if(selectAllCheckBox){
        bool = selectAllCheckBox.checked;
      }
      if(bool){
        window.USER.peoples[focusedUser].selectedMessages = [];
        Object.assign(window.USER.peoples[focusedUser].selectedMessages,
          window.USER.peoples[focusedUser].messages)
        window.USER.peoples[focusedUser].selectingMore = true;
      }else{
        window.USER.peoples[focusedUser].selectedMessages = [];
        window.USER.peoples[focusedUser].selectingMore = false;
      }
      setState({
        ...state,
        selectingMessages:bool
      });
    } catch (e) {
      console.log(e);
    }
  }

  {window.selectAllChatMessages = selectAll;}

  const selectMore = (message) => {
    try {
      window.USER.peoples[focusedUser].selectedMessages = [message];
      window.USER.peoples[focusedUser].selectingMore = true;
      setState({
        ...state,
        selectingMessages:true
      });
    } catch (e) {
      console.log(e);
    }
  }

  const replyMessage = (message) => {
    try{
      let element = document.getElementById('repliedMessageLayout');
      let child = document.getElementById('repliedMessage');
      let repliedPerson = document.getElementById('repliedPerson').innerHTML;
      if(element && element.style.display != 'flex'){
        element.style.display = 'flex';
      }
      if(child){
        if(message.type === 'photo'){
          child.innerHTML = '';
          let img = document.createElement('img');
          img.classList.add('reply-thumbnail');
          img.src = message.text;
          child.appendChild(img);
        }else{
          child.innerHTML = decryptTextMessage(message.text,message.sender+message.receiver);
        }
        child.setAttribute('data-mId',message.date);
        if(message.sender === window.userUID){
          repliedPerson = 'You';
        }else{
          let name = window.USER.peoples[focusedUser].profile.name;
          if(name && name > 0){
            repliedPerson = name;
          }else{
            repliedPerson = 'No name';
          }
        }
        document.getElementById('scrollBottom').classList.add('display-none');
      }
      let textarea = document.getElementById('message-text-input');
      textarea.focus();
    }catch(error){console.log(error);}
  }

  const cancelOperationDeleteMessage = () => {
    try{
      let child = document.getElementById('delete-message-confirmation-dialogue');
      let parent = document.getElementById('rightSide');
      parent.removeChild(child);
    }catch(error){console.log(error);}
  }

  const countOfSelectedMessages = () => {
    try {
      let length = window.USER.peoples[focusedUser].selectedMessages.length;
      return length > 1 ? length + ' messages selected' : ' 1 message selected';
    } catch (e) {console.log(e);}
  }

  const hideSelectionLayout = () => {
    try {
      if(window.USER.peoples[focusedUser].selectingMore){
        window.USER.peoples[focusedUser].selectingMore = false;
        window.USER.peoples[focusedUser].selectedMessages = [];
        setState({
          ...state,
          selectMore:false
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  const proceedOperationDeleteAllMessage = (messages) => {
    try {
      for(let message of messages){
        proceedOperationDeleteMessage(message);
      }
    } catch (e) {console.log(e);}
  }

  const deleteSelectedMessages = () =>{
    try {
      let messages = window.USER.peoples[focusedUser].selectedMessages;
      const params = {
        id: 'delete-message-confirmation-dialogue',
        message: 'Do you really want to delete this messages?',
        actionId: messages,
        action: proceedOperationDeleteAllMessage,
        actionText: 'Delete'
      };
      addConfirmationDialogue(params);
      hideSelectionLayout();
    } catch (e) {
      console.log(e);
    }
  }

  const selectingMore = () => {
    try {
      return window.USER.peoples[focusedUser].selectingMore;
    } catch (e) {console.log(e);}
  }

  const proceedOperationDeleteMessage = (message, deleteForFriend=false) => {
    try {
      if(deleteForFriend){
        app.database().ref('messages').child(message.date)
        .update({status: 'deleted'}, (error) => {
          if(!error){
            let index = undefined;
            let length = window.USER.peoples[focusedUser].messages.length;
            for(let i = 0; i < length; i++){
              let msg = window.USER.peoples[focusedUser].messages[i];
              if(msg.date === message.date){
                index = i;
              }
            }
            if(index){
              window.USER.peoples[focusedUser].messages[index].status = 'deleted';
              window.USER.peoples[focusedUser].messageDeleted = true;
              mainContext.userDataChanged();
            }
          }
        });
      }else{
        app.database().ref('users').child(window.userUID).child('messages')
        .child(focusedUser).child(message.date)
          .set(null, (error) => {
            if(!error){
              window.USER.peoples[focusedUser].messages =
              window.USER.peoples[focusedUser].messages.filter((msg) => {
                if(msg.date != message.date) return msg;
              });
              window.USER.peoples[focusedUser].messageDeleted = true;
              mainContext.userDataChanged();
            }
        });
      }
    } catch (e) {console.log(e);}
  }

  const updateLoadingBar = (bool) => {
    try {
      document.getElementById('chatsLoading').classList.toggle('display-none');
    } catch (e) {console.log(e);}
  }

  const selectMessage = (message, event) =>{
    try {
      const menu = [
        {
          innerHTML:'Select message',
          tagName: 'div',
          onClick: () => selectMore(message)
        },
        {
          innerHTML:'Delete message',
          tagName: 'div',
          onClick: () => deleteMessage(message)
        },
        {
          innerHTML:'Close',
          tagName: 'div',
          onClick: () => null
        }
      ];
      if(message.status !== 'deleted'){
        menu.unshift({
          innerHTML:'Reply',
          tagName: 'div',
          onClick: () => replyMessage(message)
        });
      }
      showOptionMenu(menu, event.clientX, event.clientY);
    } catch (e) {
      console.log(e);
    }
  }

  const scrollBottom = () => {
    try{
      let chat = document.getElementById('chat');
      chat.scroll(0,chat.scrollHeight);
    }catch(error){console.log(error);}
  }

  useEffect(() => {
    try {
      const onKeyDown = (event) => {
        if(event.key == 'Escape'){
          hideSelectionLayout();
        }
      }
      window.addEventListener('keydown', onKeyDown);
      return () => {
        window.removeEventListener('keydown', onKeyDown);
      }
    } catch (e) {console.log(e);}
  });

  useEffect(() => {
    try{
      if(window.theme){
        document.getElementById('chat').classList.add('dark-bg-image-mode');
        document.getElementById('scrollBottom').classList.add('dark-mode');
        document.getElementById('scrollBottom').classList.add('shadow-white');
      }else{
        document.getElementById('chat').classList.remove('dark-bg-image-mode');
        document.getElementById('scrollBottom').classList.remove('dark-mode');
        document.getElementById('scrollBottom').classList.remove('shadow-white');
      }
    }catch(error){console.log(error);}
  });

  return(
    <ChatContext.Provider value={{refresh:() => setState({...state})}}>
      <div className='chat scrollbar-thin flex flex-column
        flex-justify-start flex-align-center relative' id='chat'>
        <div id='chatsLoading' className='display-none'>
          <ReactLoading type='spin' color='dodgerblue' width={'24px'}
            height={'24px'} className='chats-loading flex flex-justify-center flex-align-center fixed'/>
        </div>
        {
          selectingMore() ?
          <div className='flex flex-justify-center flex-align-center fixed selected-messages-layout'>
            <span className='selected-messages-delete-icon'>{countOfSelectedMessages()}</span>
            <span className='fa fa-trash selected-messages-delete-icon' onClick={deleteSelectedMessages}/>
            <span className='fa fa-close selected-messages-delete-icon' onClick={hideSelectionLayout}/>
            {
              !allMessagesAreSelected()?
              <React.Fragment>
                <input type='checkbox' style={{marginTop:'2px'}} id='select-all-checkbox'
                  onClick={selectAll}/>
                <label className='selected-messages-delete-icon' htmlFor='select-all-checkbox'>Select all</label>
              </React.Fragment>
              :null
            }
          </div>
          :null
        }
        <span className='scroll-bottom fa fa-angle-down fixed bg-white color-grey'
          id='scrollBottom' onClick={scrollBottom}/>
        {
          messages !== undefined && messages.length > 0 ?
          messages.map((message,index) =>(
            <Message key={message.date} message={message} index={index}
              prevMessage={messages[index-1]} selectMessage={selectMessage}/>
          ))
          :null
        }
      </div>
    </ChatContext.Provider>
  );
}

export default Chat;
