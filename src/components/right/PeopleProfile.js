import React, {useContext, useEffect} from 'react';
import {MainContext} from '../Main';
import PeopleHeader from './PeopleHeader';

const PeopleProfile = ({uid,showPeopleProfile}) => {

  const mainContext = useContext(MainContext);

  let profilePictureLoaded = window.USER.peoples[uid].profile.profilePictureLoaded;
  let profilePicture = window.USER.peoples[uid].profile.profilePicture;

  const profilePicturePreview  = (event) => {
    try {
      window.imagePreview = event.target.src;
      mainContext.profilePicturePreview(true);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    try {
      if(window.theme){
        document.getElementById('profile-body-right').classList.add('dark-mode');
      }else{
        document.getElementById('profile-body-right').classList.remove('dark-mode');
      }
    } catch (e) {
      console.log(e);
    }
  });

  return(
    <React.Fragment>
      <PeopleHeader show={showPeopleProfile}/>
      <div className='profile-body profile-body-right flex flex-column flex-justify-center
        flex-align-center relative' id='profile-body-right' style={{zIndex:'3'}}>
        <img className='profile-image profile-image-body'
          src={profilePictureLoaded ? profilePicture :'assets/images/profile.png'}
          onClick={profilePicturePreview}/>
        <div className='username' id='people-username'>
          { window.USER.peoples[uid].profile.name?window.USER.peoples[uid].profile.name
            :'No name' }
        </div>
        <div className='userphone' id='people-userphone'>
          <span className='fa fa-phone' id='people-phone-icon'></span> {' '}
          { window.USER.peoples[uid].profile.phone?window.USER.peoples[uid].profile.phone
            :'0000000000' }
        </div>
      </div>
    </React.Fragment>
  );
}

export default PeopleProfile;
