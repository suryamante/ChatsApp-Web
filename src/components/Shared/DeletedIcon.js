export const DeletedIcon = (props) => {
  return(
    <svg width="20" height="20" viewBox="0 0 24 24"><path fillRule="evenodd"
        clipRule="evenodd" d="M7.759 6.43a7 7 0 0 1 9.81 9.81l-9.81-9.81zM6.357 7.858a7
        7 0 0 0 9.786 9.786L6.357 7.857zM12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"
        fill={props.mode ? '#ffffff' : 'currentColor'}>
      </path>
    </svg>
  );

}
