import React, {useState, useEffect, useContext} from 'react';
import {app} from '../firebase/config';
import ReactLoading from 'react-loading';
import {showAlert} from '../Utilities';

const Login = () => {

  const [state, setState] = useState({
    phone: '',
    otpsent: false,
    otp: '',
    disableSendOtp: true,
    disableLogin: true,
    loading: false,
    captchaVerified: false
  });

  const phoneInputHandler = (event) =>{
    try{
      let phone = event.target.value;
      if(phone.length == 0){
        setState({
          ...state,
          disableSendOtp: true,
          phone: phone
        });
      }else{
        let num = phone.charAt(phone.length-1);
        if(!isNaN(num) && num !== " "){
          if(phone.length == 10){
            setState({
              ...state,
              disableSendOtp: false,
              phone: phone
            });
          }else{
            setState({
              ...state,
              disableSendOtp: true,
              phone: phone
            });
          }
        }
      }
    }catch(error){console.log(error);}
  }

  const otpInputHandler = (event) =>{
    try{
      let otp = event.target.value;
      if(otp.length == 0){
        setState({
          ...state,
          disableLogin: true,
          otp: otp
        });
      }else{
        let num = otp.charAt(otp.length-1);
        if(!isNaN(num) && num !== " "){
          if(otp.length == 6){
            setState({
              ...state,
              disableLogin: false,
              otp: otp
            });
          }else{
            setState({
              ...state,
              disableLogin: true,
              otp: otp
            });
          }
        }
      }
    }catch(error){console.log(error);}
  }

  const otpOnKeyDown = (event) => {
    try {
      if(event.key === 'Enter' && !state.disableLogin){
        login();
      }
    } catch (e) {console.log(e);}
  }

  const renderCaptcha = () => {
    try{
      window.recaptchaVerifier = new app.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'normal',
        'callback': (response) => {
          window.captchaVerified = true;
        },
        'expired-callback': () => {
          window.captchaVerified = false;
        }
      });
      window.recaptchaVerifier.render().then((widgetId) => {
        window.recaptchaWidgetId = widgetId;
      });
    }catch(error){console.log(error);}
  }

  useEffect(() => {
    try{
      if(!state.otpsent){
        renderCaptcha();
      }
    }catch(error){console.log(error);}
  },[state.otpsent]);

  const sendOtp = () => {
    try{
      if(!window.captchaVerified){
        showAlert('Verify CAPTCHA first and then continue');
        return;
      }
      let ph = "+91" + state.phone;
      app.auth().signInWithPhoneNumber(ph, window.recaptchaVerifier)
        .then((confirmationResult) => {
          window.confirmationResult = confirmationResult;
          setState({
            ...state,
            otpsent: true,
            disableSendOtp: true,
            loading: false
          });
        }).catch((error) => {
          alert(error);
          setState({
            ...state,
            loading: false
          });
          window.recaptchaVerifier.reset(window.recaptchaWidgetId);
        });
    }catch(error){console.log(error);}
  }

  const login = () => {
    try{
      setState({
        ...state,
        loading: true
      });
      window.confirmationResult.confirm(state.otp).then((result) => {
        addNewUser(result.user.uid);
      }).catch((error) => {
        showAlert('Please enter valid OTP');
        setState({
          ...state,
          loading: false
        });
      });
    }catch(error){console.log(error);}
  }

  const addNewUser = (uid) => {
    try{
      var ref = app.database().ref('users').child(uid).child('profile');
      ref.update({
        phone: state.phone
      }, (error) => {
        if(error){
        }else{
          app.database().ref('users').child('UIDs').child(uid)
          .set(state.phone, (error) => {
            if(!error){
              setState({
                ...state,
                loading: false
              });
            }
          });
        }
      });
    }catch(error){console.log(error);}
  }

  return(
    <div className='container'>
      <div className='flex-box flex flex-column flex-justify-center flex-align-center'>
        <img src='logo.svg' className='logo'/>
        <h4 className='header-title'>Log in to ChatsApp</h4>
        {
          state.loading?
          <ReactLoading type={'bubbles'} color={'#000000'}/>
          :<div className='login-container'>
            {
              !state.otpsent?
              <React.Fragment>
                <div className='form-group phone-layout flex flex-justify-center flex-align-center'>
                  <label><span className='fa fa-phone phone-layout-fa-phone'></span>{' '}+91</label>
                  <input type='phone' className='phone' maxLength='10'
                    autoFocus={true} placeholder='Phone' value={state.phone}
                    onChange={phoneInputHandler} name='phone' id='phone'>
                  </input>
                </div>
                <div>
                  <button className='btn btn-success btn-sm' id='sendOtp'
                    onClick={sendOtp} disabled={state.disableSendOtp}>
                    Send Otp
                  </button>
                </div>
              </React.Fragment>
              :null
            }
            <br/>
            {
              state.otpsent?
              <React.Fragment>
                <div className='form-group phone-layout otp-layout'>
                  <input type='otp' className='phone otp' maxLength='6'
                    placeholder='Otp' autoFocus={true} value={state.otp} onChange={otpInputHandler}
                    onKeyDown={otpOnKeyDown} name='otp' id='otp'>
                  </input>
                </div>
                <div>
                  <button className='btn btn-success btn-sm' onClick={login}
                    id='continue' disabled={state.disableLogin}>
                    Continue
                  </button>
                </div>
                <br/>
              </React.Fragment>
              :null
              }
            {!state.otpsent?<div id='recaptcha-container'></div>:null}
          </div>
        }
      </div>
    </div>
  );
}

export default Login;
