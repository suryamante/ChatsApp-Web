import React, {useContext, useEffect, useState} from 'react';
import {app} from '../firebase/config';
import {MainContext} from '../Main';
import Sender from './Sender';
import Receiver from './Receiver';

export const MessageContext = React.createContext();

const Message = ({message,index,prevMessage,selectMessage}) => {

  const mainContext = useContext(MainContext);
  const focusedUser = mainContext.getFocusedChat();

  const [state, setState] = useState('');

  const statusChangedListener = () => {
    try {
      let user = message.sender === app.auth().currentUser.uid ? message.receiver : message.sender;
      app.database().ref('messages').child(message.date).child('status')
        .on('value', (snapshot) => {
          let status = snapshot.val();
          if(status !== message.status){
            window.USER.peoples[user].messages[index]['status'] = status;
            setState('');
          }
      }, (error) => {console.log(error);});
    } catch (e) {
      console.log(e);
    }
  }

  let date = undefined;
  let extraMessage = undefined;
  let gap = undefined;
  try{
    if(prevMessage){
      if(prevMessage.sender != message.sender){
        gap = true;
      }
    }else{
      gap = true;
    }
  }catch(error){}
  try{
    const d1 = new Date(Number(message.date));
    let month = d1.getMonth() < 9?  ('0' + Number(d1.getMonth()+1)):Number(d1.getMonth()+1);
    date = d1.getDate() + '/' + month + '/' + d1.getFullYear();
    if(index > 0){
      let t = new Date(Number(prevMessage.date));
      if(t.getDate() != d1.getDate()){
        if(new Date().getDate() == d1.getDate()){
          extraMessage = 'Today';
        }else if((t.getMonth() == d1.getMonth() && Math.abs(t.getDate() - d1.getDate()) == 1)
          || d1.getMonth() == t.getMonth() + 1 && Math.abs(d1.getDate() - t.getDate()) == 30 || Math.abs(d1.getDate() - t.getDate()) == 29 || Math.abs(d1.getDate() - t.getDate()) == 28){
            extraMessage = 'Yesterday';
        }else{
            extraMessage = date;
        }
      }
    }else{
      let t = new Date();
      if(t.getDate() == d1.getDate()){
        extraMessage = 'Today';
      }else if((t.getMonth() == d1.getMonth() && Math.abs(t.getDate() - d1.getDate()) == 1)
        || d1.getMonth() == t.getMonth() + 1 && Math.abs(d1.getDate() - t.getDate()) == 30 || Math.abs(d1.getDate() - t.getDate()) == 29 || Math.abs(d1.getDate() - t.getDate()) == 28){
          extraMessage = 'Yesterday';
      }else{
        extraMessage = date;
      }
    }
    date = d1.toString().substr(16,5);
  }catch(error){}

  const showOptionButton = (mId) => {
    try {
      if(!window.USER.peoples[focusedUser].selectingMore)
        document.getElementById(mId+'optionIcon').style.visibility='visible';
    } catch (e) {
      console.log(e);
    }
  }

  const hideOptionButton = (mId) => {
    try {
      document.getElementById(mId+'optionIcon').style.visibility='hidden';
    } catch (e) {
      console.log(e);
    }
  }

  const rightClicked = (message,event) => {
    try {
      if(event.button === 2){
        if(!window.USER.peoples[focusedUser].selectingMore)
          selectMessage(message, event);
      }
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    try {
      if(message.sender === app.auth().currentUser.uid && message.status !== 'seen'){
        statusChangedListener();
      }
    } catch (e) {
      console.log(e);
    }
  });

  useEffect(() => {
    try {
      if(message.receiver === app.auth().currentUser.uid && message.status !== 'seen'){
        window.USER.peoples[message.sender].messages[index]['status'] = 'seen';
        app.database().ref('messages').child(message.date).child('status')
          .set('seen', (error) => {
            if(!error){
              setState('');
            }
        }).catch((error) => {console.log(error);});
      }
    } catch (e) {
      console.log(e);
    }
  });

  return(
    <MessageContext.Provider value={{ showOptionButton:showOptionButton,
        hideOptionButton:hideOptionButton, rightClicked:rightClicked,
        selectMessage:selectMessage}}>
      <React.Fragment>
        {
          extraMessage ?
          <div className='extra-message-layout flex flex-justify-center'>
            <span className='extra-message'>{extraMessage}</span>
          </div>
          :null
        }
        {gap?<div className='gap-5px'></div>:null}
        {
          message.sender === app.auth().currentUser.uid ?
          <Sender message={message} date={date}/>
          :<Receiver message={message} date={date}/>
        }
      </React.Fragment>
    </MessageContext.Provider>
  )
}

export default Message;
