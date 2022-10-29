import React, {useContext, useState,useEffect} from 'react';
import People from './People';
import {MainContext} from '../Main';
import {app} from '../firebase/config';
import {attachToCover, detachCover, showOptionMenu,addConfirmationDialogue} from '../Utilities';

export const ChatsContext = React.createContext();

const Chats = (props) => {

  const [state, setState] = useState('');

  const mainContext = useContext(MainContext);

  const peoples = window.USER.peoples;

  const clearHistory = (uid, event) => {
    try{
      const params = {
        id: 'clear-history-confirmation-dialogue',
        message: 'Do you really want to clear this chat?',
        actionId: uid,
        action: proceedOperationClearHistory,
        actionText: 'Clear'
      };
      addConfirmationDialogue(params, event);
    }catch(error){console.log(error);}
  }

  const proceedOperationClearHistory = (uid) =>{
    try{
      app.database().ref('users').child(app.auth().currentUser.uid).child('messages').child(uid)
        .set(null, (error) => {
          if(!error){
            window.USER.peoples[uid].messages=[];
            mainContext.userDataChanged();
          }
        });
    }catch(error){console.log(error);}
  }

  const deleteChat = (uid, event) => {
    try{
      const params = {
        id: 'delete-chat-confirmation-dialogue',
        message: 'Do you really want to delete this chat?',
        actionId: uid,
        action: proceedOperationDeleteChat,
        actionText: 'Delete'
      };
      addConfirmationDialogue(params, event);
    }catch(error){console.log(error);}
  }

  const proceedOperationDeleteChat = (uid) => {
    try {
      app.database().ref('users').child(app.auth().currentUser.uid)
      .child('peoples').child(uid).set(null, (error) => {
          if(!error){
            app.database().ref('users').child(app.auth().currentUser.uid)
            .child('messages').child(uid).set(null, (error) => {
                if(!error){
                  delete window.USER.peoples[uid];
                  mainContext.userDataChanged();
                  mainContext.updateFocusedChat(null);
                }
            });
            app.database().ref('users').child(app.auth().currentUser.uid)
            .child('typingstatus').child(uid).set(null, (error) => {});
          }else{console.log(error);}
        });
    } catch (e) {console.log(e);}
  }

  const updateBlockUnblockStatus = (uid, status) => {
    app.database().ref('users').child(window.userUID).child('peoples').child(uid).child('blocked')
    .set(status, (error) => {
      if(!error){
        window.USER.peoples[uid].isBlocked = status;
        mainContext.userDataChanged();
      }
    });
  }

  const selectedPeople = (uid, event) => {
    try {
      const menu = [
        {
          innerHTML:'Delete chat',
          tagName: 'div',
          onClick: () => deleteChat(uid, event)
        },
        {
          innerHTML:'Clear history',
          tagName: 'div',
          onClick: () => clearHistory(uid, event)
        },
        {
          innerHTML: window.USER.peoples[uid].isBlocked ? 'Unblock' : 'Block',
          tagName: 'div',
          onClick: () => window.USER.peoples[uid].isBlocked ? updateBlockUnblockStatus(uid, false) :
           updateBlockUnblockStatus(uid, true)
        },
        {
          innerHTML:'Close',
          tagName: 'div',
          onClick: () => null
        }
      ];
      showOptionMenu(menu, event.clientX, event.clientY);
    } catch (e) {console.log(e);}
  }

  return(
    <ChatsContext.Provider value={{selectedPeople:selectedPeople}}>
      <div className={window.theme ? 'chats-list scrollbar-thin scrollbar-smooth scrollbar-dark-mode'
      : 'chats-list scrollbar-thin scrollbar-smooth'}>
        {
          Object.keys(peoples).reverse().map((uid) => (
            <People key={uid} people={peoples[uid]} uid={uid} />
          ))
        }
      </div>
    </ChatsContext.Provider>
  );
}

export default Chats;
