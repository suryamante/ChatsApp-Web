import React from 'react';
import Text from './Text';
import Photo from './Photo';
import ReplyText from './ReplyText';

const Receiver = ({message,date}) => {
  return(
    <React.Fragment>
      {
        message.type === 'text'?
        message.replyText != undefined?
        <ReplyText message={message} date={date} sender={false}/>
        :<Text message={message} date={date} sender={false}/>
        :message.type === 'photo'?
        <Photo message={message} date={date} sender={false}/>
        :null
      }
    </React.Fragment>
  );
}

export default Receiver;
