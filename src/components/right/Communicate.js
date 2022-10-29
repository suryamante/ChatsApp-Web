import React, {useState, useContext, useEffect} from 'react';
import {MainContext} from '../Main';
import {app} from '../firebase/config';
import Picker from 'emoji-picker-react';
import {encryptTextMessage, scrollToBottom, showAttachmentOptions} from '../Utilities';
import Attachment from './Attachment';
import Emoji from './Emoji';
import imageCompression from 'browser-image-compression';
import {FirbaseStorageBaseURL} from '../firebase/config';

const Communicate = (props) => {

  const mainContext = useContext(MainContext);

  const updateOnlineStatus = props.updateOnlineStatus;

  const [state, setState] = useState({
    text: '',
    showEmojis: false
  });

  const textInputHandler2 = (event) => {
    try {
      if(event.key === "Enter" && state.text.trim().length > 0){
        if(!event.shiftKey){
          sendMessage();
          setTimeout(() => {
            setState({
              ...state,
              text: ''
            });
          }, 100);
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  const showEmojis = (bool) => {
    try{
      let ele = document.getElementsByClassName('emoji-picker-react')[0];
      if(!bool){
        if(ele.style.height == '0px'){
          return;
        }
      }
      if(ele){
        if(ele.style.height == '0px'){
          ele.style.height = '500px';
          document.getElementById('emojiPickerDismiss').style.display='block';
          ele.classList.add('emoji-layout-opener');
          setTimeout(() => {
            ele.classList.remove('emoji-layout-opener');
          },100);
        }else{
          ele.style.height = '0px';
          document.getElementById('emojiPickerDismiss').style.display='none';
          ele.classList.add('emoji-layout-closer');
          setTimeout(() => {
            ele.classList.remove('emoji-layout-closer');
          },100);
        }
      }
      focusInput();
    }catch(error){console.log(error);}
  }

  const photoPreviewLayout = () => {
    try {
      let previewLayout = document.createElement('div');
      let parent = document.getElementById('rightSide');
      previewLayout.classList.add('picture-preview');
      previewLayout.classList.add('flex');
      previewLayout.classList.add('flex-row');
      previewLayout.classList.add('flex-justify-center');
      previewLayout.classList.add('flex-align-center');
      previewLayout.classList.add('absolute');
      previewLayout.classList.add('bg-white');
      if(window.theme){
        previewLayout.classList.add('dark-mode');
        previewLayout.classList.add('picture-preview-dark-mode');
      }
      previewLayout.id = 'photo-preview-layout';

      let loading = document.createElement('progress');
      loading.id = 'previewLayoutDummyLoading';
      previewLayout.appendChild(loading);

      let closeButton = document.createElement('span');
      closeButton.innerHTML = '&#x2715;';
      closeButton.classList.add('absolute');
      closeButton.classList.add('picture-preview-close-button');
      closeButton.classList.add('flex');
      closeButton.classList.add('flex-align-center');
      closeButton.classList.add('flex-justify-center');
      if(window.theme){
        closeButton.classList.add('dark-mode');
      }
      closeButton.onclick = () => {
        parent.removeChild(previewLayout);
      }
      previewLayout.appendChild(closeButton);

      parent.appendChild(previewLayout);
    } catch (e) {
      console.log(e);
    }
  }

  const photoPreview = (original, compressedFile, thumbnail) => {
    try {
      let previewLayout = document.getElementById('photo-preview-layout');
      let parent = document.getElementById('rightSide');

      let img = document.createElement('img');
      img.src = original;
      img.alt = 'photo';
      img.classList.add('preview-image');
      previewLayout.appendChild(img);

      let sendButton = document.createElement('button');
      sendButton.classList.add('fa');
      sendButton.classList.add('fa-send');
      sendButton.classList.add('cursor-pointer');
      sendButton.classList.add('picture-preview-send-button');
      sendButton.classList.add('color-white');
      sendButton.onclick = () => {
        parent.removeChild(previewLayout);
        sendPhoto(compressedFile, thumbnail, original, img.naturalWidth, img.naturalHeight);
      }
      previewLayout.appendChild(sendButton);
    } catch (e) {
      console.log(e);
    }
  }

  const fileReader = (compressedFile, thumbnail) => {
    try {
      const fileReader = new FileReader();
      fileReader.onload = function(evt) {
        let original = evt.target.result;
        const fileReader2 = new FileReader();
        fileReader2.onload = function(evt2) {
          let thumbnail = evt2.target.result;
          {
            let node = document.getElementById('previewLayoutDummyLoading');
            node.parentNode.removeChild(node);
          }
          photoPreview(original, compressedFile, thumbnail);
        }
        fileReader2.readAsDataURL(thumbnail);
      };
      fileReader.readAsDataURL(compressedFile);
    } catch (e) {
      console.log(e);
    }
  }

  async function compressImage(imageFile) {
    try {
      const compressedFile = await imageCompression(imageFile, {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1280,
        maxIteration: 2,
        useWebWorker: true
      });
      const thumbnail = await imageCompression(compressedFile, {
        maxSizeMB: 0.000000000001,
        maxWidthOrHeight: 50,
        maxIteration: 2,
        useWebWorker: true
      });
      await fileReader(compressedFile,thumbnail);
    } catch (error) {console.log(error);}
  }

  const onPhotoChanged = (event) => {
    try {
      photoPreviewLayout();
      let file = event.target.files[0];
      if(file !== undefined){
        compressImage(file);
      }
    } catch (e) {
      console.log(e);
    }
  }

  const appendEmoji = (event, emoji) => {
    try {
      setState({
        ...state,
        text : state.text + emoji.emoji
      });
      focusInput();
    } catch (e) {
      console.log(e);
    }
  }

  const textInputHandler = (event) => {
    try {
      updateOnlineStatus('typing...');
      setState({
        ...state,
        text: event.target.value
      });
      window.USER.peoples[props.focusedUser].draftMessage = event.target.value;
    } catch (e) {
      console.log(e);
    }
  }

  const uploadPhoto = (message, compressedFile) => {
    try {
      let upload = app.storage().ref().child('images').child(message.date).put(compressedFile);
      upload.on('state_changed', (snapshot) => {
        try{
          let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          document.getElementById(message.date + 'photo-upload-loading-progresbar').value = progress;
        }catch(error){}
      }, (error) => {
        console.log(error);
      }, () => {
        const ref = app.database().ref('users').child(message.sender).child('messages')
        .child(message.receiver).child(message.date);
        ref.set(message.date, (error) => {
          if(!error){
            message.status = 'sent';
            message.photoSize = compressedFile.size;
            app.database().ref('messages').child(message.date).set(message, (error) => {
              if(!error){
                app.database().ref('users').child(message.receiver).child('notifications')
                  .child(message.date).set(message.date, (error) => {
                    if(!error){
                      statusChangedListener(message.date, message.receiver);
                    }
                  });
                }
            });
          }
        });
      });
    } catch (e) {
      console.log(e);
    }
  }

  const sendPhoto = (compressedFile, thumbnail, original, width, height) => {
    try {
      window.USER.peoples[mainContext.getFocusedChat()].scrollTop = undefined;
      const receiver = mainContext.getFocusedChat();
      const sender = app.auth().currentUser.uid;
      if(window.USER.peoples[receiver].messages === undefined){
        window.USER.peoples[receiver].messages = [];
      }
      const length = window.USER.peoples[receiver].messages.length;
      const key = new Date().getTime().toString();

      const message = {
        sender: sender,
        receiver: receiver,
        type: 'photo',
        date: key,
        text: original,
        isThumbnail: false,
        isUploading: true,
        status: 'sending'
      }

      const message2 = {
        sender: sender,
        receiver: receiver,
        type: 'photo',
        date: key,
        text: thumbnail,
        status: 'sending',
        width: width,
        height: height
      };


      window.USER.peoples[receiver].messages[length] = message;
      let temp = {};
      Object.assign(temp, window.USER.peoples[receiver]);
      delete window.USER.peoples[receiver];
      window.USER.peoples[receiver] = temp;

      mainContext.userDataChanged();
      scrollToBottom();

      uploadPhoto(message2, compressedFile);
    } catch (e) {
      console.log(e);
    }
  }

  const sendMessage = () => {
    try {
      let text = state.text.trim();
      setState({
        ...state,
        text: ''
      });
      window.USER.peoples[props.focusedUser].draftMessage = '';
      showEmojis();
      window.USER.peoples[mainContext.getFocusedChat()].scrollTop = undefined;
      const receiver = mainContext.getFocusedChat();
      const sender = app.auth().currentUser.uid;
      if(window.USER.peoples[receiver].messages === undefined){
        window.USER.peoples[receiver].messages = [];
      }
      const length = window.USER.peoples[receiver].messages.length;
      const key = new Date().getTime().toString();

      let encryptedText = encryptTextMessage(text,sender+receiver);

      const message = {
        sender: sender,
        receiver: receiver,
        type: 'text',
        date: key,
        text: encryptedText,
        status: 'sending'
      }
      {
        try{
          let element = document.getElementById('repliedMessageLayout');
          let child = document.getElementById('repliedMessage');
          if(element.style.display == 'flex'){
            message.replyText = child.getAttribute('data-mId');
          }
          element.style.display = 'none';
          document.getElementById('scrollBottom').classList.remove('display-none');
        }catch(error){}
      }

      window.USER.peoples[receiver].messages[length] = message;
      let temp = {};
      Object.assign(temp, window.USER.peoples[receiver]);
      delete window.USER.peoples[receiver];
      window.USER.peoples[receiver] = temp;

      mainContext.userDataChanged();

      scrollToBottom();

      const ref = app.database().ref('users').child(sender).child('messages').child(receiver).child(key);
      ref.set(key, (error) => {
        if(!error){
          message.status = 'sent';
          app.database().ref('messages').child(key).set(message, (error) => {
            if(!error){
              app.database().ref('users').child(receiver).child('notifications')
                .child(key).set(key, (error) => {
                  if(!error){
                    statusChangedListener(key, receiver);
                  }
                });
              }
          });
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  const statusChangedListener = (mId, receiver) => {
    try {
      app.database().ref('messages').child(mId).child('status')
        .on('value', (snapshot) => {
          if(snapshot.val() != null){
            try{
              const messages = window.USER.peoples[receiver].messages;
              let filteredMessage = undefined;
              messages.filter((message, index) => {
                if(message.date === mId){
                  filteredMessage = index;
                  return index;
                }
              });
              if(snapshot.val() == 'sent' && window.USER.peoples[receiver].messages[filteredMessage].type == 'photo'){
                window.USER.peoples[receiver].messages[filteredMessage].isUploading = false;
              }
              window.USER.peoples[receiver].messages[filteredMessage]['status'] = snapshot.val();
              mainContext.userDataChanged();
            }catch(error){console.log(error);}
          }
      }, (error) => {console.log(error);});
    } catch (e) {console.log(e);}
  }

  const closeReplyMessageLayout = () => {
    try {
      document.getElementById('repliedMessageLayout').style.display = 'none';
      document.getElementById('scrollBottom').classList.remove('display-none');
    } catch (e) {console.log(e);}
  }

  const focusInput = () => {
    try {
      document.getElementById('message-text-input').focus();
    } catch (e) {console.log(e);}
  }

  useEffect(() => {
    focusInput();
  },[props.focusedUser]);

  useEffect(() => {
    try {
      let ele = document.getElementsByClassName('emoji-picker-react')[0];
      if(ele){
        ele.style.height = '0px';
      }
    } catch (e) {
      console.log(e);
    }
  },[])

  useEffect(() => {
    try {
      const onKeyDown = (event) => {
        if(event.key == 'Escape'){
          try{
            let ele = document.getElementsByClassName('emoji-picker-react')[0];
            if(ele.style.height != '0px'){
              ele.style.height = '0px';
              document.getElementById('emojiPickerDismiss').style.display='none';
              ele.classList.add('emoji-layout-closer');
              setTimeout(() => {
                ele.classList.remove('emoji-layout-closer');
              },100);
              return;
            }
          }catch(error){}
          try{
            let repliedMessageLayout = document.getElementById('repliedMessageLayout');
            if(repliedMessageLayout.style.display != 'none'){
              repliedMessageLayout.style.display = 'none';
              document.getElementById('scrollBottom').classList.remove('display-none');
              return;
            }
          }catch(error){}
          try{
            let photoPreviewLayout = document.getElementById('photo-preview-layout');
            if(photoPreviewLayout){
              photoPreviewLayout.parentNode.removeChild(photoPreviewLayout);
              return;
            }
          }catch(error){}
        }
      }
      window.addEventListener('keydown', onKeyDown);
      return () => {
        window.removeEventListener('keydown', onKeyDown);
      }
    } catch (e) {
      console.log(e);
    }
  },[]);

  useEffect(() => {
    try{
      if(window.theme){
        document.getElementById('communicate-layout').classList.add('dark-mode');
        document.getElementById('repliedMessageLayout').classList.add('dark-mode');
        document.getElementsByClassName('replied-message-layout-mid-box')[0].classList.add('dark-mode');
        document.getElementById('message-text-input').classList.add('dark-mode');
        document.getElementsByClassName('emoji-picker-react')[0].classList.add('dark-mode');
      }else{
        document.getElementById('communicate-layout').classList.remove('dark-mode');
        document.getElementById('repliedMessageLayout').classList.remove('dark-mode');
        document.getElementsByClassName('replied-message-layout-mid-box')[0].classList.remove('dark-mode');
        document.getElementById('message-text-input').classList.remove('dark-mode');
        document.getElementsByClassName('emoji-picker-react')[0].classList.remove('dark-mode');
      }
    }catch(error){console.log(error);}
  });

  useEffect(() => {
    try{
      if(window.USER.peoples[props.focusedUser].draftMessage){
        setState({
          ...state,
          text: window.USER.peoples[props.focusedUser].draftMessage.trim()
        });
      }else{
        setState({
          ...state,
          text: ''
        });
      }
    }catch(error){}
  },[props.focusedUser]);

  useEffect(() => {
    setTimeout(() => {
      setState({
        ...state,
        showEmojis:true
      });
    },100);
  },[]);

  return(
    <React.Fragment>
      {
        window.USER.peoples[props.focusedUser].isBlocked ?
        <div className='communicate-layout flex flex-justify-center' style={{padding:'20px',
          backgroundColor: window.theme ? 'rgb(80,80,80)' : null}}>
          You have blocked {window.USER.peoples[props.focusedUser].profile.name ?
            window.USER.peoples[props.focusedUser].profile.name : 'No name'}
        </div>
        :<React.Fragment>
          <div className='replied-message-layout display-none flex flex-row flex-justify-start
            flex-align-center' id='repliedMessageLayout'>
            <div className='flex-column one-line-text replied-message-layout-mid-box'>
              <div className='reply-person one-line-text' id='repliedPerson'>You</div>
              <div className='replied-message one-line-text' id='repliedMessage'></div>
            </div>
            <div className='replied-message-close' onClick={closeReplyMessageLayout}>&#x2715;</div>
          </div>
          {
            window.showEmojiPicker?
            <Picker onEmojiClick={appendEmoji} disableSearchBar={true}
                pickerStyle={{ width: '100%' , height: '0px'}}/>
            :null
          }
          <div className='communicate-layout flex flex-column' id='communicate-layout'>
            <div className='flex flex-row'>
              <span className={window.theme ? 'emoji-toggler close display-none dark-mode'
                : 'emoji-toggler close display-none'}
                id='emojiPickerDismiss' onClick={showEmojis}>&#x2715;</span>
              <span className='emoji-toggler' id='showEmojis' onClick={showEmojis}> <Emoji/> </span>
              <input id='showAttachmentOptions' type='file' className='display-none'
                accept='.jpg, .jpeg, .png' onChange={onPhotoChanged}/>
              <span className={window.theme ? 'emoji-toggler margin-left-5px dark-mode' : 'emoji-toggler margin-left-5px'}
                onClick={showAttachmentOptions} id='attachment'> <Attachment/> </span>
              <textarea type='text' className='message-text' rows='1' id='message-text-input'
                value={state.text} spellCheck={false} onInput={textInputHandler}
                onKeyDown={textInputHandler2} placeholder='Type a message' style={{color:'rgb(20,20,20)'}}/>
              <button className='fa fa-send send-button bg-green'
                disabled={state.text.trim().length > 0 ? false : true} onClick={sendMessage}/>
            </div>
          </div>
        </React.Fragment>
      }
    </React.Fragment>
  );
}

export default Communicate;
