import React, {useContext, useEffect} from 'react';
import {MessageContext} from './Message';
import {MainContext} from '../Main';
import {ChatContext} from './Chat';
import ReactLoading from 'react-loading';
import {app} from '../firebase/config';
import Deleted from './Deleted';
import {CircularProgressbar} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {Status} from '../Shared/Status';
import {OptionIcon} from '../Shared/OptionIcon';

const Photo = ({message,date,sender}) => {

  const messageContext = useContext(MessageContext);
  const mainContext = useContext(MainContext);

  const chatContext = useContext(ChatContext);
  const focusedUser = window.focusedChat;
  let selected = false;

  let styles = 'flex flex-column relative';

  try {
    if(sender){
      styles += ' sent-photo';
      if(window.theme){
        styles += ' bg-dark-green';
      }
    }else{
      styles += ' received-photo';
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
          styles += ' selected-dark-mode opacity-half';
        }else{
          styles += ' selected opacity-half';
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

  const displayPhoto = (event) => {
    try {
      if(window.USER.peoples[focusedUser].selectingMore) return;
      window.imagePreview = event.target.src;
      mainContext.profilePicturePreview(true);
    } catch (e) {
      console.log(e);
    }
  }

  const downloadURL = (prms = null) => {
    try {
      if(message.url == undefined){
        app.storage().ref().child('images').child(message.date)
          .getDownloadURL()
          .then((url) => {
            message.url = url;
            if(prms)prms();
        }).catch((error) => {console.log(error);});
      }
    } catch (e) {
      console.log(e);
    }
  }

  const downloadPhotoFromURL = () => {
    try{
      if(message.isDownloading) return;
      message.isDownloading = true;
      var xhr = new XMLHttpRequest();
      let photoDownloadProgresbar = document.getElementById(message.date+'photo-download-loading-progresbar');
      xhr.addEventListener('progress', (progress) => {
        photoDownloadProgresbar.value = Number.parseInt((progress.loaded / message.photoSize) * 100);
      });
      xhr.responseType = 'blob';
      xhr.onload = (event) => {
        const fileReader = new FileReader();
        fileReader.onload = function(evt) {
          message.isThumbnail = false;
          message.text = evt.target.result;
          mainContext.userDataChanged();
        };
        fileReader.readAsDataURL(xhr.response);
      };
      console.log('downloading');
      xhr.open('GET', message.url);
      xhr.send();
    }catch(error){}
  }

  const downloadOriginalPhoto = () => {
    try{
      if(window.USER.peoples[focusedUser].selectingMore) return;
      let downloadIcon = document.getElementById(message.date+'photo-download-icon-layout');
      downloadIcon.classList.add('display-none');
      let loadingIcon = document.getElementById(message.date+'photo-download-loading');
      loadingIcon.classList.remove('display-none');
      if(message.url == undefined){
        downloadURL(downloadPhotoFromURL);
      }else{
        downloadPhotoFromURL();
      }
    }catch(error){}
  }

  useEffect(() => {
    downloadURL();
    message.isDownloading = false;
  },[]);

  return(
    <React.Fragment>
      <div className= {styles} style={window.theme ? sender ? {borderColor:'#056162', borderWidth:'0px'} : {borderColor:'rgba(80,80,80,1)',borderWidth:'0px'} : null}
        onMouseOver={() => messageContext.showOptionButton(message.date)}
        onMouseLeave={() => messageContext.hideOptionButton(message.date)}
        onMouseDown={(event) => messageContext.rightClicked(message,event)}
        onContextMenu={(event) => event.preventDefault()} id={message.date}
        onClick={selectMessage}>
        {
          message.status !== 'deleted' ?
          <div className='flex flex-row flex-start'>
            <div>
              <img src={message.text} className={message.isThumbnail || message.isUploading ? 'content-photo opacity-half' : 'content-photo'}
                width={message.width ? message.width : null} height={message.height ? message.height : null}
                id={message.date+'content-photo'} onClick={displayPhoto}/>
            </div>
            <div className='date-status date-status-message absolute date-status-message-photo shadow-white
               flex flex-row flex-justify-end flex-align-end'
               id={message.date+'date-status-message'} style={{backgroundColor: window.theme ?
                  'rgba(80,80,80,1)' : null}}>
              <div className='date' style={{color: window.theme ? 'white' : null}}>{date}</div>
              {
                sender?
                <span className='status margin-bottom--3px'><Status status={message.status}/></span>
                :null
              }
            </div>
          </div>
          :<div style={{padding:'4px 5px'}}>
            <Deleted/>
              <div className='date-status date-status-message flex flex-row flex-justify-end flex-align-end'
                id={message.date+'date-status-message'}>
                <div className='date'>{date}</div>
              </div>
          </div>
        }
        {
          message.status !== 'deleted'?
          message.isThumbnail?
          <div className='photo-download-layout absolute flex flex-justify-center flex-align-center'
            onClick={downloadOriginalPhoto}>
            <div className='photo-download-icon-layout color-white' id={message.date+'photo-download-icon-layout'}>
              <span className='fa fa-arrow-circle-down fa-lg'/>
              <span> {message.photoSize ? Number.parseInt(message.photoSize/1000) + 'KB' : null}</span>
            </div>
            <div id={message.date+'photo-download-loading'} className='display-none'>
              <progress id={message.date+'photo-download-loading-progresbar'} value='0' max='100'
                style={{width:'50px'}}/>
            </div>
          </div>
          :message.isUploading?
          <div className='photo-download-layout absolute flex flex-justify-center flex-align-center'>
            <progress id={message.date+'photo-upload-loading-progresbar'} value='0' max='100'
              style={{width:'50px'}}/>
          </div>
          :null
          :null
        }
        <div className='option-icon option-icon-message option-icon-photo flex flex-justify-center flex-align-center'
          onClick={(event) => messageContext.selectMessage(message, event)}
          id={message.date+'optionIcon'} style={window.theme ? {backgroundColor:'rgba(100,100,100,1)'} : null}>
          <OptionIcon/>
        </div>
      </div>
    </React.Fragment>
  );
}
export default Photo;
