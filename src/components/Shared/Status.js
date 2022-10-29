import {StatusSending} from './StatusSending';
import {StatusSent} from './StatusSent';
import {StatusReceived} from './StatusReceived';
import {StatusSeen} from './StatusSeen';
export const Status = ({status}) => {
  return(
    status === 'sending' ?
    <StatusSending/>
    :status === 'sent' ?
    <StatusSent/>
    :status === 'received' ?
    <StatusReceived/>
    :status === 'seen' ?
    <StatusSeen/>
    :null
  );
}
