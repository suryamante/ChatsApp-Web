import React, {useContext, useEffect, useState} from 'react';
import {MessageContext} from './Message';
import {ChatContext} from './Chat';
import {app} from '../firebase/config';
import {decryptTextMessage} from '../Utilities';
import Deleted from './Deleted';
import {Status} from '../Shared/Status';
import {OptionIcon} from '../Shared/OptionIcon';

const Text = ({message,date,sender}) => {

  const messageContext = useContext(MessageContext);
  const chatContext = useContext(ChatContext);
  const focusedUser = window.focusedChat;
  let selected = false;

  let styles = 'flex flex-column relative';

  try {
    if(sender){
      styles += ' sent-text';
      if(window.theme){
        styles += ' bg-dark-green';
      }
    }else{
      styles += ' received-text';
      if(window.theme){
        styles += ' bg-dark-grey';
      }
    }
    if(messageContext.gap){
      if(sender){
        styles += ' border-top-right-radius-none';
      }else{
        styles += ' border-top-left-radius-none';
      }
    }
    if(window.USER.peoples[focusedUser].selectingMore){
      styles += ' cursor-pointer';
      selected = window.USER.peoples[focusedUser].selectedMessages.includes(message);
      if(selected) {
        if(window.theme){
          styles += ' selected-dark-mode';
        }else{
          styles += ' selected';
        }
      }
    }
  } catch (e) {
    console.log(e);
  }

  const selectMessage = () => {
    try {
      if(window.USER.peoples[focusedUser].selectingMore){
        if(!selected){
          window.USER.peoples[focusedUser].selectedMessages.push(message);
        }else{
          window.USER.peoples[focusedUser].selectedMessages =
          window.USER.peoples[focusedUser].selectedMessages.filter((msg) => {
            if(msg.date != message.date) return msg;
          });
        }
        if(window.USER.peoples[focusedUser].selectedMessages.length == 0){
          window.USER.peoples[focusedUser].selectingMore = false;
        }
        chatContext.refresh();
      }
    } catch (e) {
      console.log(e);
    }
  }
  return(
    <React.Fragment>
      <div className= {styles} style={window.theme ? sender ? {borderColor:'#056162'} : {borderColor:'rgba(80,80,80,1)'} : null}
        onMouseOver={() => messageContext.showOptionButton(message.date)}
        onClick={selectMessage}
        onMouseLeave={() => messageContext.hideOptionButton(message.date)}
        onMouseDown={(event) => messageContext.rightClicked(message,event)}
        onContextMenu={(event) => event.preventDefault()} id={message.date}>
        <div className='flex flex-row flex-start'>
          {
            message.status !== 'deleted'?
            <code className='content' id={message.date+'content'} style={window.theme ? {color:'white'} : null}>
              {decryptTextMessage(message.text, message.sender+message.receiver)}
            </code>
            :<Deleted/>
          }
          <div className='option-icon option-icon-message'
            onClick={(event) => messageContext.selectMessage(message, event)}
            id={message.date+'optionIcon'}>
            <OptionIcon/>
          </div>
        </div>
        <div className='date-status date-status-message flex flex-row flex-justify-end flex-align-center'
          id={message.date+'date-status-message'}>
          <div className='date' style={window.theme ? {color:'white'} : null}>{date}</div>
          {
            sender && message.status !== 'deleted'?
            <span className='status margin-bottom--3px'><Status status={message.status}/></span>
            :null
          }
        </div>
      </div>
    </React.Fragment>
  );
}
export default Text;
