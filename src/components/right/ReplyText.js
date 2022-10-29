import React, {useContext} from 'react';
import {MessageContext} from './Message';
import {MainContext} from '../Main';
import {ChatContext} from './Chat';
import Deleted from './Deleted';
import {app} from '../firebase/config';
import {decryptTextMessage} from '../Utilities';
import {Status} from '../Shared/Status';
import {OptionIcon} from '../Shared/OptionIcon';

const ReplyText = ({message,date,sender}) => {

  const messageContext = useContext(MessageContext);
  const mainContext = useContext(MainContext);

  let replyMessage = undefined;
  let temp = window.USER.peoples[window.focusedChat].messages.filter((message2) => {
    if(message2.date == message.replyText) return message2;
  });
  if(temp && temp.length > 0){
    replyMessage = temp[0];
  }

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
      if(selected){
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

  const trackRepliedMessage = () => {
    try {
      if(window.USER.peoples[focusedUser].selectingMore) return;
      if(replyMessage){
        // {
        //   let position = -1;
        //   console.log(position,messageContext.index);
        //   for(let i = messageContext.index - 1; i >= 0; i--){
        //     let msg = window.USER.peoples[focusedUser].messages[i];
        //     console.log(msg.date,replyMessage.date);
        //     if(msg.date === replyMessage.date){
        //       position = i;
        //       break;
        //     }
        //   }
        //   if(position !== -1){
        //     console.log(position);
        //   }
        // }
        let element = document.getElementById(replyMessage.date);
        if(element){
          let clsName = 'animation-tracked-message';
          if(window.theme){
            clsName = 'animation-tracked-message-dark-mode';
          }
          element.classList.add(clsName);
          element.scrollIntoView({behavior: 'smooth', block:'nearest', inline: 'nearest'});
          setTimeout(() => {
            element.classList.remove(clsName);
          },1000);
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  return(
    <React.Fragment>
      <div className= {styles} style={{padding:'5px', borderColor: window.theme ?
        sender ? '#056162' : 'rgba(80,80,80,1)' : null}}
        onMouseOver={() => messageContext.showOptionButton(message.date)}
        onMouseLeave={() => messageContext.hideOptionButton(message.date)}
        onMouseDown={(event) => messageContext.rightClicked(message,event)}
        onContextMenu={(event) => event.preventDefault()} id={message.date}
        onClick={selectMessage}>
        {
          message.status !== 'deleted' ?
          <div className='flex flex-row flex-start'>
            <div className='replied-chat-message-layout flex flex-column flex-justify-start one-line-text'
              onClick={trackRepliedMessage} style={sender ? {backgroundColor: window.theme ? '#055758' : 'rgba(60,179,113,.1)' ,
                border:window.theme ? '1px solid #055758' : null} :
                 {backgroundColor:window.theme ? 'rgba(70,70,70,1)' : null , border: window.theme ?
                   '1px solid rgba(100,100,100,.1)' : null}}>
              {
                replyMessage != undefined ?
                replyMessage.sender == app.auth().currentUser.uid ?
                <div className='reply-person one-line-text'>You</div>
                :window.USER.peoples[window.focusedChat].profile.name
                && window.USER.peoples[window.focusedChat].profile.name.length > 0 ?
                <div className='reply-person one-line-text'>{window.USER.peoples[window.focusedChat].profile.name}</div>
                :<div className='reply-person one-line-text'>No name</div>
                :null
              }
              {
                replyMessage != undefined && replyMessage.status !== 'deleted'?
                <div className='replied-chat-message one-line-text' style={window.theme ? {color:'white'} : null}>
                  {
                    replyMessage.type === 'photo' ?
                    <img src={replyMessage.text} className='reply-thumbnail'/>
                    :decryptTextMessage(replyMessage.text, replyMessage.sender+replyMessage.receiver)
                  }
                </div>
                :<Deleted/>
              }
            </div>
          </div>
          :null
        }
        {
          message.status !== 'deleted' ?
          <code className='content' style={{marginTop:'2px', marginLeft:'2px', color: window.theme ? 'white' : 'inherit'}}>
            { decryptTextMessage(message.text, message.sender+message.receiver) }
          </code>
          :<Deleted/>
        }
        <div className='date-status date-status-message flex flex-row flex-justify-end flex-align-end'>
          <div className='date' style={window.theme ? {color:'white'} : null}> {date} </div>
          {
            sender && message.status !== 'deleted'?
            <span className='status margin-bottom--2px'><Status status={message.status}/></span>
            :null
          }
        </div>
        <div className='option-icon option-icon-message reply-absolute margin-right-5px'
          onClick={(event) => messageContext.selectMessage(message, event)}
          id={message.date+'optionIcon'}>
          <OptionIcon/>
        </div>
      </div>
    </React.Fragment>
  );
}
export default ReplyText;
