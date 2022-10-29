import React, {useContext, useEffect} from 'react';
import {app} from '../firebase/config';
import {MainContext} from '../Main';
import {showOptionMenu} from '../Utilities';

const Header = (props) => {

  const mainContext = useContext(MainContext);
  let newFriendRequests = window.USER.newFriendRequests;
  let profilePictureLoaded = window.USER.profile.profilePictureLoaded;
  let profilePicture = window.USER.profile.profilePicture;

  const logOut = () => {
    try{
      app.auth().signOut();
      window.USER = null;
      window.location.reload();
    }catch (e) {console.log(e);}
  }

  const showProfile = () => {
    mainContext.showProfile(true);
  }

  const showSettings = () => {
    mainContext.showSettings(true);
  }

  const showFriendRequests = () => {
    mainContext.showFriendRequests(true);
  }

  const addOptionMenu = (event) => {
    const menu = [
      {
        innerHTML:'Profile',
        tagName: 'div',
        onClick: () => showProfile()
      },
      {
        innerHTML:'Settings',
        tagName: 'div',
        onClick: () => showSettings()
      }
    ];
    if(newFriendRequests !== undefined &&
      newFriendRequests.length > 0){
      menu.push({
        innerHTML:'Friend requests',
        tagName: 'div',
        onClick: () => showFriendRequests()
      });
    }
    menu.push({
      innerHTML:'Logout',
      tagName: 'div',
      onClick: () => logOut()
    });
    menu.push({
      innerHTML:'Close',
      tagName: 'div',
      onClick: () => null
    });
    showOptionMenu(menu, event.clientX, event.clientY);
  }

  useEffect(() => {
    try{
      if(window.theme){
        document.getElementById('header-left').classList.add('dark-mode');
        document.getElementById('left-header-option-menu-toggler').style.color='white';
      }else{
        document.getElementById('header-left').classList.remove('dark-mode');
        document.getElementById('left-header-option-menu-toggler').style.color='grey';
      }
    }catch(error){console.log(error);}
  });

  return(
    <React.Fragment>
      <div className='header' id='header-left'>
        <img className='profile-image' onClick={() => mainContext.showProfile(true)}
          src={profilePictureLoaded ? profilePicture :'assets/images/profile.png'}
          style={{marginLeft:'10px'}}/>
        <div className='menu-layout'>
          <span className='fa fa-ellipsis-v menu-icon' id='left-header-option-menu-toggler'
            onClick={addOptionMenu}/>
        </div>
        {
          newFriendRequests !== undefined && newFriendRequests.length > 0 ?
          <span className='fa fa-user-plus color-grey' style={{color:window.theme ? 'white' : null}}>
          </span>
          :null
        }
      </div>
    </React.Fragment>
  );
}

export default Header;
