import React, {useContext, useEffect} from 'react';

const PeopleHeader = ({show}) => {

  useEffect(() => {
    try {
      if(window.theme){
        document.getElementById('header-profile-people').classList.add('dark-mode');
        document.getElementById('header-profile-people-backMenuIcon').style.color='white';
      }else{
        document.getElementById('header-profile-people').classList.remove('dark-mode');
        document.getElementById('header-profile-people-backMenuIcon').style.color='grey';
      }
    } catch (e) {
      console.log(e);
    }
  });

  return(
    <React.Fragment>
      <div className='header' id='header-profile-people'>
        <div className='fa fa-arrow-left back-icon'
          id='header-profile-people-backMenuIcon' onClick={() => show(false)}/>
      </div>
    </React.Fragment>
  );
}

export default PeopleHeader;
