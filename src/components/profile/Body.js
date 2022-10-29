import React, {useState, useEffect, useContext} from 'react';
import Edit from './Edit';
import {app,FirbaseStorageBaseURL} from '../firebase/config';
import {MainContext} from '../Main';
import ReactLoading from 'react-loading';
import imageCompression from 'browser-image-compression';

const Body = (props) => {

  const mainContext = useContext(MainContext);

  let name = window.USER.profile.name;
  name = name ? name : '';
  let profilePictureLoaded = window.USER.profile.profilePictureLoaded;
  let profilePicture = window.USER.profile.profilePicture;

  const [state, setState] = useState({
    editMode: false,
    name: name,
    loading: false,
    compressedFile: undefined
  });

  const editProfile = () => {
    try {
      setState({
        ...state,
        editMode: true
      });
    } catch (e) {
      console.log(e);
    }
  }

  const chooseProfilePicture = () => {
    try {
      document.getElementById('profile-chooser').click();
    } catch (e) {console.log(e);}
  }

  const profileNameHandler = (event) => {
    try {
      setState({
        ...state,
        name: event.target.value
      });
    } catch (e) {
      console.log(e);
    }
  }

  const fileReader = (file, target) => {
    try {
      const fileReader = new FileReader();
      fileReader.onload = function(evt) {
        target.src = evt.target.result;
        setState({
          ...state,
          loading: false,
          compressedFile: file
        });
      };
      fileReader.readAsDataURL(file);
    } catch (e) {
      console.log(e);
    }
  }

  async function compressImage(imageFile, target) {
    try {
      setState({
        ...state,
        loading:true
      });
      const options = {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1280,
        useWebWorker: true
      }
      try {
        const compressedFile = await imageCompression(imageFile, options);
        await fileReader(compressedFile, target);
      } catch (error) {}
    } catch (e) {
      console.log(e);
    }
  }

  const updateProfile = () => {
    try {
      setState({
        ...state,
        loading: true
      });
      if(state.compressedFile !== undefined){
        var storageRef = app.storage().ref('users').child(app.auth().currentUser.uid)
        .child('profile_' + app.auth().currentUser.uid);
        storageRef.put(state.compressedFile).then((snapshot) => {
          updateProfileData(true, new Date().getTime().toString());
        }).catch((error) => {
          setState({
            ...state,
            loading: false
          });
        });
      }else{
        updateProfileData(false, '');
      }
    } catch (e) {
      console.log(e);
    }
  }

  const fileChangeListener = (event) => {
    try {
      var file = event.target.files[0];
      if(file !== undefined){
          compressImage(file, document.getElementsByClassName('profile-image-body')[0]);
      }
    } catch (e) {
      console.log(e);
    }
  }

  const profilePicturePreview = (event) => {
    try {
      window.imagePreview = event.target.src;
      mainContext.profilePicturePreview(true);
    } catch (e) {
      console.log(e);
    }
  }

  const updateProfileData = (prof, fileName) => {
    try {
      var ref = app.database().ref('users').child(app.auth().currentUser.uid).child('profile');
      var obj = {};
      obj.name = state.name;
      if(prof){
        obj.profilePicture = fileName;
      }
      if(state.name === name && !prof){
        setState({
          ...state,
          editMode: false,
          loading: false
        });
        return;
      }
      ref.update(obj, (error) => {
        if(error){
          setState({
            ...state,
            loading: false
          });
        }else{
          try {
            window.USER.profile.name = state.name;
            if(prof){
              let elem = document.getElementsByClassName('profile-image-body')[0];
              window.USER.profile.profilePictureLoaded = true;
              window.USER.profile.profilePicture = elem.src;
            }
            mainContext.profileChanged();
            setState({
              ...state,
              editMode: false,
              loading: false
            });
          } catch (e) {console.log(e);}
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    try{
      if(window.theme){
        document.getElementById('profile-username').style.color='white';
        document.getElementById('profile-userphone').style.color='white';
        document.getElementById('edit-profile-icon').style.color='white';
        document.getElementById('profile-phone-icon').style.color='white';
        document.getElementById('profile-body').classList.add('dark-mode');
        document.getElementById('update-profile').classList.add('dark-mode');
      }else{
        document.getElementById('profile-username').style.color='black';
        document.getElementById('profile-body').classList.remove('dark-mode');
        document.getElementById('profile-userphone').style.color='black';
        document.getElementById('profile-phone-icon').style.color='grey';
        document.getElementById('update-profile').classList.remove('dark-mode');
      }
    }catch(error){console.log(error);}
  });

  return(
    <React.Fragment>
      {
        !state.editMode ?
        <div className='profile-body flex flex-column flex-justify-center flex-align-center' id='profile-body'>
          <div className='edit-profile-icon' id='edit-profile-icon' onClick={editProfile}>
            <Edit/>
          </div>
          <img className='profile-image profile-image-body'
            src={profilePictureLoaded ? profilePicture :'assets/images/profile.png' }
            onClick={profilePicturePreview}/>
          <div className='username' id='profile-username'>
            { mainContext.user.profile.name?mainContext.user.profile.name
              :'No name' }
          </div>
          <div className='userphone' id='profile-userphone'>
            <span className='fa fa-phone' id='profile-phone-icon'></span> {' '}
            { mainContext.user.profile.phone?mainContext.user.profile.phone
              :'9307096517' }
          </div>
        </div>
        :<div className='profile-body flex flex-column flex-justify-center flex-align-center'>
          <button className='update-profile cursor-pointer' id='update-profile' onClick={updateProfile}>
            Save
          </button>
          <div className='profile-picture-edit-layout flex flex-row flex-justify-end flex-align-end'>
            <img className='profile-image profile-image-body'
              src={profilePictureLoaded ? profilePicture :'assets/images/profile.png' }
              onClick={profilePicturePreview}/>
            <div className='edit-profile-icon' onClick={chooseProfilePicture}>
              <input type='file' id='profile-chooser' accept='.jpg, .jpeg, .png' onChange={fileChangeListener}/>
              <Edit/>
            </div>
          </div>
          <div>
            <input className='username-edit' value={state.name} placeholder='Your name'
              onChange={profileNameHandler}/>
          </div>
          { state.loading?<ReactLoading type='bubbles' color={window.theme ? '#ffffff' : '#000000'}/>:null }
        </div>
      }
    </React.Fragment>
  );
}

export default Body;
