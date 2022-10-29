import React, {useState, useEffect} from 'react';
import People from './People';

const SearchBar = (props) => {

  const [state, setState] = useState({
    input: '',
    temp: []
  });

  const InputHandler = (event) => {
    try {
      let value = event.target.value;
      let temp = [];
      if(value.trim().length > 0){
        for(let people in window.USER.peoples){
          if(window.USER.peoples[people].profile.name.toLowerCase()
            .includes(value.trim().toLowerCase())){
            temp[temp.length] = [people,window.USER.peoples[people]];
          }
        }
      }
      setState({
        input: value,
        temp: temp
      });
    } catch (e) {
      console.log(e);
    }
  }

  const resetFilter = () => {
    try {
      setState({
        input: '',
        temp: []
      });
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    try {
      const onFocusIn = (event) => {
        InputHandler(event);
      }
      const onFocusOut = (event) => {
        const temp = () => {
          setState({
            ...state,
            temp: []
          });
        }
        setTimeout(temp, 500);
      }
      const input = document.getElementById('search-bar');
      input.addEventListener('focusin', onFocusIn);
      input.addEventListener('focusout', onFocusOut);

      return () => {
        input.removeEventListener('focusin', onFocusIn);
        input.removeEventListener('focusout', onFocusOut);
      }
    } catch (e) {
      console.log(e);
    }
  },[]);

  useEffect(() => {
    try {
      try{
        if(window.theme){
          document.getElementById('search-bar').classList.add('dark-mode');
          document.getElementById('search-bar').classList.add('shadow-white');
          document.getElementById('search-bar').classList.add('search-dark-bg-image');
          document.getElementById('filtered-peoples').classList.add('dark-mode');
        }else{
          document.getElementById('search-bar').classList.remove('dark-mode');
          document.getElementById('search-bar').classList.remove('shadow-white');
          document.getElementById('search-bar').classList.remove('search-dark-bg-image');
          document.getElementById('filtered-peoples').classList.remove('dark-mode');
        }
      }catch(error){}
    } catch (e) {
      console.log(e);
    }
  });

  return(
    <React.Fragment>
      <input placeholder='Search' className='search relative' value={state.input}
        onChange={InputHandler} name='search-bar' id='search-bar'/>
      {
        state.input.trim().length > 0 ?
        <div className='filtered-peoples absolute bg-white color-black' id='filtered-peoples'>
          {
            state.temp.map((people) => (
              <People key={people[0]} people={people[1]} uid={people[0]}
                resetFilter={resetFilter} noClick={true}/>
            ))
          }
        </div>
        :null
      }
    </React.Fragment>
    );
}

export default SearchBar;
