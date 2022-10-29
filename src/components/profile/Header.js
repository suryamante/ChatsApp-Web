import React, {useContext, useEffect} from 'react';

const Header = ({show}) => {

  useEffect(() => {
    try {
      if(window.theme){
        document.getElementById('header-profile').classList.add('dark-mode');
        document.getElementById('backMenuIcon').style.color='white';
      }else{
        document.getElementById('header-profile').classList.remove('dark-mode');
        document.getElementById('backMenuIcon').style.color='grey';
      }
    } catch (e) {
      console.log(e);
    }
  });

  return(
    <React.Fragment>
      <div className='header' id='header-profile'>
        <div className='fa fa-arrow-left back-icon' id='backMenuIcon' onClick={() => show(false)}/>
      </div>
    </React.Fragment>
  );
}

export default Header;
