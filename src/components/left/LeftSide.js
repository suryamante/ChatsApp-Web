import React, {useContext, useEffect} from 'react';
import Header from './Header';
import Chats from './Chats';
import SearchBar from './SearchBar';
import {MainContext} from '../Main';
import NewChat from './NewChat';

const LeftSide = (props) => {

  const mainContext = useContext(MainContext);

  let peoples = undefined;
  try{
    peoples = window.USER.peoples;
  }catch(error){console.log(error);}

  useEffect(() => {
    try{
      if(window.theme){
        document.getElementById('leftSide').classList.add('dark-mode');
      }else{
        document.getElementById('leftSide').classList.remove('dark-mode');
      }
    }catch(error){console.log(error);}
  });

  return(
    <React.Fragment>
      <Header/>
      <SearchBar/>
      {
        peoples !=undefined ? <Chats/>
      :<div className='no-chats flex flex-justify-center flex-align-center'>
          <span>No chats</span>
        </div>
      }
      <NewChat/>
    </React.Fragment>
  );
}

export default LeftSide;
