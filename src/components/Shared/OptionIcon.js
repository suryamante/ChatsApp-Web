const OptionIcon = () => {
  return(
    <svg viewBox="0 0 18 18" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
      <path fill={window.theme?'white':'grey'}
        d="M3.3 4.6L9 10.3l5.7-5.7 1.6 1.6L9 13.4 1.7 6.2l1.6-1.6z">
      </path>
    </svg>
  );
}

export {OptionIcon};
