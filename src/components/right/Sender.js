import React from 'react';
import Text from './Text';
import Photo from './Photo';
import ReplyText from './ReplyText.js';

const Sender = ({message,date}) => {
  return(
    <React.Fragment>
      {
        message.type === 'text'?
        message.replyText != undefined?
        <ReplyText message={message} date={date} sender={true}/>
        :<Text message={message} date={date} sender={true}/>
        :message.type === 'photo'?
        <Photo message={message} date={date} sender={true}/>
        :null
      }
    </React.Fragment>
  );
}
export default Sender;
