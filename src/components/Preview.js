import React, {useContext} from 'react';
import {MainContext} from './Main';

const Preview = ({image}) => {

  const mainContext = useContext(MainContext);

  return(
    <React.Fragment>
      <span className={window.theme ? 'absolute picture-preview-close-button dark-mode flex flex-justify-center flex-align-center'
        : 'absolute picture-preview-close-button flex flex-justify-center flex-align-center'}
        onClick={() => mainContext.profilePicturePreview(false)}>&#x2715;</span>
      <img src={image} className='preview-image'/>
    </React.Fragment>
  );
}

export default Preview;
