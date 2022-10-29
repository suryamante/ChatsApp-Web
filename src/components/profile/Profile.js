import React, {useContext, useEffect} from 'react';
import Header from './Header';
import Body from './Body';
import Footer from './Footer';
import {MainContext} from '../Main';

const Profile = () => {

  const mainContext = useContext(MainContext);

  useEffect(() => {
    try {
      if(window.theme){
        document.getElementById('profile-layout').classList.add('dark-mode');
      }else{
        document.getElementById('profile-layout').classList.remove('dark-mode');
      }
    } catch (e) {
      console.log(e);
    }
  });

  return(
    <React.Fragment>
      <Header show={mainContext.showProfile}/>
      <Body/>
      <Footer/>
    </React.Fragment>
  )
}

export default Profile;
