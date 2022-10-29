import {DeletedIcon} from '../Shared/DeletedIcon';

const Deleted = ({mode,person}) => {
  let classes = 'replied-chat-message italic flex flex-row flex-justify-center flex-align-center one-line-text';
  let styles = {minWidth:'145px'};
  if(person){
    styles.padding = '0px';
  }
  return(
    <div className={classes} style={styles}>
      <div className='italic' style={{color: window.theme ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.5)'}}>
        <DeletedIcon mode={mode}/>
      </div>
      <div style={!mode ? {color: window.theme ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.8)'} : null} className={mode ? 'deleted-text italic margin-bottom-2px color-white'
        : 'deleted-text italic margin-bottom-2px'}>
        {'Deleted message'}
      </div>
    </div>
  );
}

export default Deleted;
