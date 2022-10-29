import React, {useEffect} from 'react';

const Footer = () => {
  useEffect(() => {
    try {
      if(window.theme){
        document.getElementById('profile-footer-title').style.color='white';
        document.getElementById('profile-footer').classList.add('dark-mode');
      }else{
        document.getElementById('profile-footer-title').style.color='black';
        document.getElementById('profile-footer').classList.remove('dark-mode');
      }
    } catch (e) {
      console.log(e);
    }
  });

  return(
    <React.Fragment>
      <div className='profile-footer flex flex-column flex-justify-center flex-align-center'
        id='profile-footer'>
        <img src='logo.svg' className='logo logo-small'/>
        <h5 className='header-title' id='profile-footer-title'>ChatsApp</h5>
      </div>
    </React.Fragment>
  );
}

export default Footer;
