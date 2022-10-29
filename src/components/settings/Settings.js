import React, {useContext, useState, useEffect} from 'react';
import Header from '../profile/Header';
import {MainContext} from '../Main';

const Settings = () => {
  const mainContext = useContext(MainContext);
  const [state, setState] = useState({
    theme: window.theme ? window.theme : 0
  });

  const setDarkMode = () => {
    try{
      document.getElementById('main-layout').classList.add('dark-mode');
    }catch(error){}
    try{
      document.getElementById('leftSide').classList.add('dark-mode');
    }catch(error){}
    try{
      document.getElementById('profile-footer-title').style.color='white';
    }catch(error){}
    try{
      let elms = document.getElementsByClassName('dropdown-content');
      for(let el of elms){
        el.classList.add('dark-mode');
        el.classList.add('shadow-white');
      }
    }catch(error){}
    try{
      document.getElementById('right-header-option-menu-toggler').style.color='white';
    }catch(error){}
    try{
      document.getElementById('left-header-option-menu-toggler').style.color='white';
    }catch(error){}
    try{
      document.getElementById('header-left').classList.add('dark-mode');
    }catch(error){}
    try{
      document.getElementById('backMenuIcon').style.color='white';
    }catch(error){}
    try{
      document.getElementById('header-profile').classList.add('dark-mode');
    }catch(error){}
    try{
      document.getElementById('header-profile-people').classList.add('dark-mode');
    }catch(error){}
    try{
      document.getElementById('settings').classList.add('dark-mode');
    }catch(error){}
    try{
      document.getElementById('header-right').classList.add('dark-mode');
    }catch(error){}
    try{
      document.getElementById('profile-footer').classList.add('dark-mode');
    }catch(error){}
    try{
      document.getElementById('profile-layout').classList.add('dark-mode');
    }catch(error){}
    try{
      document.getElementById('profile-body-right').classList.add('dark-mode');
    }catch(error){}
    try{
      document.getElementById('communicate-layout').classList.add('dark-mode');
    }catch(error){}
    try{
      document.getElementById('chat').classList.add('dark-bg-image-mode');
    }catch(error){}
    try{
      document.getElementsByClassName('emoji-picker-react')[0].classList.add('dark-mode');
      document.getElementById('repliedMessageLayout').classList.add('dark-mode');
      document.getElementsByClassName('replied-message-layout-mid-box')[0].classList.add('dark-mode');
      document.getElementById('message-text-input').classList.add('dark-mode');
    }catch(error){}
  }

  const setLightMode = () => {
    try{
      document.getElementById('main-layout').classList.remove('dark-mode');
    }catch(error){}
    try{
      document.getElementById('leftSide').classList.remove('dark-mode');
    }catch(error){}
    try{
      document.getElementById('profile-footer-title').style.color='black';
    }catch(error){}
    try{
      let elms = document.getElementsByClassName('dropdown-content');
      for(let el of elms){
        el.classList.remove('dark-mode');
        el.classList.remove('shadow-white');
      }
    }catch(error){}
    try{
      document.getElementById('right-header-option-menu-toggler').style.color='grey';
    }catch(error){}
    try{
      document.getElementById('left-header-option-menu-toggler').style.color='grey';
    }catch(error){}
    try{
      document.getElementById('header-left').classList.remove('dark-mode');
    }catch(error){}
    try{
      document.getElementById('backMenuIcon').style.color='grey';
    }catch(error){}
    try{
      document.getElementById('header-profile').classList.remove('dark-mode');
    }catch(error){}
    try{
      document.getElementById('header-profile-people').classList.remove('dark-mode');
    }catch(error){}
    try{
      document.getElementById('settings').classList.remove('dark-mode');
    }catch(error){}
    try{
      document.getElementById('header-right').classList.remove('dark-mode');
    }catch(error){}
    try{
      document.getElementById('profile-footer').classList.remove('dark-mode');
    }catch(error){}
    try{
      document.getElementById('profile-layout').classList.remove('dark-mode');
    }catch(error){}
    try{
      document.getElementById('profile-body-right').classList.remove('dark-mode');
    }catch(error){}
    try{
      document.getElementById('communicate-layout').classList.remove('dark-mode');
    }catch(error){}
    try{
      document.getElementById('chat').classList.remove('dark-bg-image-mode');
    }catch(error){}
    try{
      document.getElementsByClassName('emoji-picker-react')[0].classList.remove('dark-mode');
      document.getElementById('repliedMessageLayout').classList.remove('dark-mode');
      document.getElementsByClassName('replied-message-layout-mid-box')[0].classList.remove('dark-mode');
      document.getElementById('message-text-input').classList.remove('dark-mode');
    }catch(error){}
  }

  const lightMode = () => {
    try {
      if(state.theme !== 0){
        window.theme = 0;
        setState({
          ...state,
          theme: 0
        });
        try{
          setLightMode();
          mainContext.userDataChanged();
        }catch(error){}
      }
    } catch (e) {
      console.log(e);
    }
  }
  const darkMode = () => {
    try {
      if(state.theme !== 1){
        window.theme = 1;
        setState({
          ...state,
          theme: 1
        });
        try{
          setDarkMode();
          mainContext.userDataChanged();
        }catch(error){}
      }
    } catch (e) {
      console.log(e);
    }
  }
  useEffect(() => {
    try {
      if(state.theme){
        document.getElementById('darkModeTrigger').classList.add('active-mode');
        document.getElementById('lightModeTrigger').classList.remove('active-mode');
        try{
          setDarkMode();
        }catch(error){}
      }else{
        document.getElementById('darkModeTrigger').classList.remove('active-mode');
        document.getElementById('lightModeTrigger').classList.add('active-mode');
        try{
          setLightMode();
        }catch(error){}
      }
    } catch (e) {
      console.log(e);
    }
  });
  return(
    <React.Fragment>
      <Header show={mainContext.showSettings}/>
      <div className='flex flex-row flex-start settings'
        id='settings'>
        <h5>App mode</h5>
        <div className='margin-left-auto row'>
          <button className='light-mode-trigger btn btn-light'
            id='lightModeTrigger'
            onClick={lightMode}>
            Light</button>
          <button className='dark-mode-trigger btn btn-dark'
            id='darkModeTrigger'
            onClick={darkMode}>
            Dark</button>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Settings;
