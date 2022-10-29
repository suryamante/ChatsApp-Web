import {app} from './firebase/config';

export const decryptTextMessage = (msg, key) => {
  let result = '';
  try {
    let m = 0;
    let k = 0;
    while(m < msg.length){
      if(msg.charCodeAt(m) <= 256){
        result += String.fromCharCode(msg.charCodeAt(m)-key.charCodeAt(k));
      }else{
        result += msg[m];
      }
      m++;
      k++;
      if(k >= key.length){
        k = 0;
      }
    }
  } catch (e) {
    console.log(e);
  }
  return result;
}

export const encryptTextMessage = (msg,key) => {
  let result = '';
  try {
    let m = 0;
    let k = 0;
    while(m < msg.length){
      if(msg.charCodeAt(m) <= 256){
        result += String.fromCharCode(msg.charCodeAt(m)+key.charCodeAt(k));
      }else{
        result += msg[m];
      }
      m++;
      k++;
      if(k >= key.length){
        k = 0;
      }
    }
  } catch (e) {
    console.log(e);
  }
  return result;
}

export const attachToCover = (child, event) => {
  try {
    let root = document.getElementById('main-layout');

    let cover = document.createElement('div');
    cover.classList.add('cover-layout');
    cover.classList.add('flex');
    cover.classList.add('flex-column');
    cover.classList.add('flex-justify-center');
    cover.classList.add('flex-align-center');
    cover.classList.add('cover-layout-opener');
    setTimeout(() => {
      cover.classList.remove('cover-layout-opener');
    },200);
    if(window.theme){
      cover.classList.add('dark-mode-cover');
    }
    cover.id = 'coverLayout';

    if(!window.exportingChat){
      let dismissCover = document.createElement('span');
      dismissCover.classList.add('dismiss-cover');
      dismissCover.classList.add('absolute');
      dismissCover.classList.add('flex');
      dismissCover.classList.add('flex-justify-center');
      dismissCover.classList.add('flex-align-center');
      dismissCover.innerHTML = '&#x2715;';
      dismissCover.id = 'dismiss-cover';
      dismissCover.onclick = () => {
        detachCover(child);
      }
      cover.appendChild(dismissCover);
    }

    cover.appendChild(child);
    root.appendChild(cover);
    // cover.style.transformOrigin = event.clientX + 'px ' + event.clientY + 'px';
  } catch (e) {
    console.log(e);
  }
}

window.onkeydown = (event) => {
  try{
    if(event.key == 'Escape' && !window.exportingChat){
      detachCover();
    }
  }catch(error){}
}

export const detachCover = () => {
  try {
    let root = document.getElementById('main-layout');
    let cover = document.getElementById('coverLayout');
    cover.classList.add('cover-layout-closer');
    setTimeout(() => {
      try {
        root.removeChild(cover);
      } catch (e) {console.log(e);}
    },200);
  } catch (e) {
    console.log(e);
  }
}

export const showAlert = (message) => {
  try {
    let root = document.getElementById('root');
    let child = document.createElement('div');
    child.id = 'toast-layout';
    child.classList.add('toast-layout');
    if(window.theme){
      child.style.backgroundColor = 'white';
      child.style.color = 'rgb(80,80,80)';
    }
    child.classList.add('toast-anim-1');
    let title = document.createElement('div');
    title.innerHTML = message;
    child.appendChild(title);
    root.appendChild(child);
    setTimeout(() => {
      child.classList.remove('toast-anim-1');
    },100);
    setTimeout(() => {
      child.classList.add('toast-anim-2');
      setTimeout(() => {
        try {
          root.removeChild(child);
        } catch (e) {console.log(e);}
      },50);
    },3000);
  } catch (e) {console.log(e);}
}

export const dismissOptionMenu = () => {
  try {
    let root = document.getElementById('main-layout');
    let optionsMenu = document.getElementById('options-menu');
    if(optionsMenu){
      root.removeChild(optionsMenu);
    }
  } catch (e) {console.log(e);}
}

export const showOptionMenu = (menu, x, y) => {
  setTimeout(() => {
    try {
      let root = document.getElementById('main-layout');
      let optionsMenu = document.getElementById('options-menu');
      if(optionsMenu){
        root.removeChild(optionsMenu);
      }
      optionsMenu = document.createElement('div');
      optionsMenu.id = 'options-menu';
      optionsMenu.classList.add('options-menu');
      optionsMenu.classList.add('color-black');
      optionsMenu.classList.add('absolute');
      optionsMenu.classList.add('bg-white');
      if(window.theme){
        optionsMenu.classList.add('dark-mode');
        optionsMenu.classList.add('shadow-white');
      }
      for(let item of menu){
        const element = document.createElement(item.tagName);
        element.innerHTML = item.innerHTML;
        element.addEventListener('click', item.onClick);
        optionsMenu.appendChild(element);
      }
      root.appendChild(optionsMenu);
      if(window.innerWidth-optionsMenu.offsetWidth > x && window.innerHeight-optionsMenu.offsetHeight > y){
        optionsMenu.style.left=x+'px';
        optionsMenu.style.top=y+'px';
      }else if(window.innerWidth-optionsMenu.offsetWidth <= x && window.innerHeight-optionsMenu.offsetHeight > y){
        optionsMenu.style.transformOrigin = 'top right';
        optionsMenu.style.left=(x-optionsMenu.offsetWidth)+'px';
        optionsMenu.style.top=y+'px';
      }else if(window.innerWidth-optionsMenu.offsetWidth > x && window.innerHeight-optionsMenu.offsetHeight <= y){
        optionsMenu.style.transformOrigin = 'bottom left';
        optionsMenu.style.left=x+'px';
        optionsMenu.style.top=(y-optionsMenu.offsetHeight)+'px';
      }else{
        optionsMenu.style.transformOrigin = 'bottom right';
        optionsMenu.style.left=(x-optionsMenu.offsetWidth)+'px';
        optionsMenu.style.top=(y-optionsMenu.offsetHeight)+'px';
      }
    } catch (e) {console.log(e);}
  },100);
}

window.onclick = (event) => {
  try {
    let root = document.getElementById('main-layout');
    let optionsMenu = document.getElementById('options-menu');
    if(optionsMenu){
      root.removeChild(optionsMenu);
    }
  } catch (e) {console.log(e);}
}

export const addConfirmationDialogue = (params, event) => {
  try{
      let child = document.createElement('div');
      child.id = params.id;
      child.classList.add('small-modal');
      child.classList.add('bg-white');
      if(window.theme){
        child.classList.add('dark-mode');
      }
      let div1 = document.createElement('div');
      div1.innerHTML = params.message;
      child.appendChild(div1);
      let div2 = document.createElement('div');
      div2.classList.add('cancel-clear');
      div2.classList.add('flex');
      div2.classList.add('flex-row');
      div2.classList.add('flex-justify-end');
      let button1 = document.createElement('button');
      button1.classList.add('btn-cancel');
      button1.classList.add('border-none');
      button1.innerHTML = 'Cancel';
      button1.onclick = () => detachCover();
      div2.appendChild(button1);
      let button2 = document.createElement('button');
      button2.classList.add('btn-proceed');
      button2.classList.add('border-none');
      button2.classList.add('color-white');
      button2.classList.add('bg-green');
      button2.innerHTML = params.actionText;
      button2.onclick = () => {
        params.action(params.actionId);
        detachCover();
      }
      div2.appendChild(button2);
      child.appendChild(div2);
      attachToCover(child, event);
    }catch(error){console.log(error);}
}

export const getFormattedDate = (messageId) => {
  try{
    let date = undefined;
    const d1 = new Date(Number(messageId));
    let month = d1.getMonth() < 9 ? '0' + (d1.getMonth()+1) : d1.getMonth() + 1;
    date = d1.getDate() + '/' + month + '/' + d1.getFullYear();
    const d2 = new Date();
    month = d2.getMonth() < 9 ? '0' + (d2.getMonth()+1) : d2.getMonth() + 1;
    const today = d2.getDate() + '/' + month + '/' + d2.getFullYear();
    if(date === today){
      date = d1.toString().substr(16,5);
    }
    return date;
  }catch(error){console.log(error);}
}

export const getPartialMessages = (focusedUser, messages) => {
  try{
    let msgs = window.USER.peoples[focusedUser].messages;
    let chatCounter = window.USER.peoples[focusedUser].chatCounter;
    if(msgs !== undefined){
      messages = [];
      let j = 0;
      try{
        if(chatCounter == undefined){
          window.USER.peoples[focusedUser].chatCounter = 20;
        }
      }catch(error){console.log(error);}
      for(let i = msgs.length - 1; i >= 0 && j < chatCounter; i--){
        j++;
        messages.unshift(msgs[i]);
      }
    }
    return messages;
  }catch(error){console.log(error); return messages;}
}

export const downloadProfilePicture = (user, uid, userDataChanged) => {
  let path = user.profile.profilePicture;
  if(path){
    app.storage().ref().child('users').child(uid).child('profile_' + uid)
      .getDownloadURL().then((url) => {
        let request = new XMLHttpRequest();
        request.responseType = 'blob';
        request.onload = (event) => {
          const fileReader = new FileReader();
          fileReader.onload = function(evt) {
            user.profile.profilePictureLoaded = true;
            user.profile.profilePicture = evt.target.result;
            userDataChanged();
          };
          fileReader.readAsDataURL(request.response);
        }
        request.open('GET', url);
        request.send();
    }).catch((error) => {console.log(error);});
  }
}
export const scrollToBottom = () => {
  setTimeout(() => {
    const chat = document.getElementById('chat');
    if(chat){
      try{
        chat.scrollTo(0,chat.scrollHeight);
      }catch(error){console.log(error);}
    }
  },100);
}

const createFile = async (userName) => {
  try {
    let cover = document.getElementById('coverLayout');
    cover.parentNode.removeChild(cover);
  } catch (e) {console.log(e);}
  try {
    let alert = document.getElementById('toast-layout');
    alert.parentNode.removeChild(alert);
  } catch (e) {console.log(e);}
  try {
    let data = document.all['0'].innerHTML;
    data = new Blob([data], {type: 'html/plain'});
    data = window.URL.createObjectURL(data);
    let dElem = document.createElement('a');
    dElem.href = data;
    dElem.download = userName ? userName : 'No name';
    dElem.click();
  } catch (e) {console.log(e);}
}

const fetchMessage = (uid, index, messageIDs, userDataChanged, messages) => {
  let mId = messageIDs[index][0];
  app.database().ref('messages').child(mId)
    .get().then((snapshot) => {
      if(snapshot.exists()){
        let newMessage = snapshot.val();
        if(newMessage.type === 'photo'){
          newMessage.isThumbnail = true;
        }
        messages.push(newMessage);
        if(index == messageIDs.length - 1){
          window.exportingChat = false;
          detachCover();
          showAlert('Please wait for few seconds...');
          window.USER.peoples[uid].chatCounter = messages.length;
          Object.assign(window.USER.peoples[uid].messages, messages);
          userDataChanged();
          createFile(window.USER.peoples[uid].profile.name);
        }else{
          document.getElementById('export-chat-progress').value = messages.length/messageIDs.length;
          document.getElementById('export-chat-title').innerHTML =
            'Exporting chat (' + messages.length + '/' + messageIDs.length + ')';
          fetchMessage(uid, index + 1, messageIDs, userDataChanged, messages);
        }
      }
    }).catch((error) => {console.log(error);});
}

const fetchMessages = (messageIDs, uid, userDataChanged) => {
  try {
    messageIDs = Object.entries(messageIDs);
    let messages = [];
    fetchMessage(uid, 0, messageIDs, userDataChanged, messages);
  } catch (e) {
    console.log(e);
  }
}

export const exportChat = (uid, userDataChanged) => {
  try {
    try {
      let child = document.createElement('div');
      let title = document.createElement('div');
      title.id = 'export-chat-title';
      title.innerHTML = 'Exporting chat...';
      let progress = document.createElement('progress');
      progress.id = 'export-chat-progress';
      progress.value = 0;
      child.appendChild(title);
      child.appendChild(progress);
      window.exportingChat = true;
      attachToCover(child);
    } catch (e) {console.log(e);}
    app.database().ref('users').child(app.auth().currentUser.uid)
      .child('messages').child(uid).get().then((snapshot) => {
        if(snapshot.exists()){
          fetchMessages(snapshot.val(), uid, userDataChanged);
        }
      }).catch((error) => {console.log(error);});
  } catch (e) {
    console.log(e);
  }
}

const takePhotoFromCamera = () => {
  let width = 600;
  let height = 0;
  let streaming = false;
  let cameraLayout = document.createElement('div');
  cameraLayout.classList.add('flex');
  cameraLayout.classList.add('flex-column');
  cameraLayout.classList.add('flex-justify-center');
  cameraLayout.classList.add('flex-align-center');
  cameraLayout.classList.add('camera-layout');
  let video = document.createElement('video');
  let canvas = document.createElement('canvas');
  canvas.style.display = 'none';
  let photo = document.createElement('img');
  photo.style.display = 'none';
  let startbutton = document.createElement('div');
  startbutton.style.backgroundImage = 'url("/assets/images/camera.svg")'
  startbutton.classList.add('camera-capture');
  cameraLayout.appendChild(canvas);
  cameraLayout.appendChild(video);
  cameraLayout.appendChild(startbutton);
  cameraLayout.appendChild(photo);
  attachToCover(cameraLayout);

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    }).then((stream) => {
      video.srcObject = stream;
      video.play();
    }).catch((err) => {
      console.log("An error occurred: " + err);
    });

    video.addEventListener('canplay', function(ev){
      if (!streaming) {
        height = video.videoHeight / (video.videoWidth/width);
        if (isNaN(height)) {
          height = width / (4/3);
        }
        video.setAttribute('width', width);
        video.setAttribute('height', height);
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        streaming = true;
      }
    });

    startbutton.addEventListener('click', function(ev){
      takepicture();
      video.style.display = 'none';
      startbutton.style.display = 'none';
      photo.style.display = 'block';
      ev.preventDefault();
    });
  }

  function takepicture() {
    let context = canvas.getContext('2d');
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);
      let data = canvas.toDataURL('image/png');
      photo.setAttribute('src', data);
    }
  }
  startCamera();
}

const takePhotoFromGallary = () => {
  try{
    document.getElementById('showAttachmentOptions').click();
  }catch(error){}
}

export const showAttachmentOptions  = (event) => {
  try {
    let attachmentOptions = document.getElementById('attachmentOptions');
    attachmentOptions.parentNode.removeChild(attachmentOptions);
  } catch (e) {console.log(e);}
  try {
    let attachmentOptions = document.createElement('div');
    attachmentOptions.id = 'attachmentOptions';
    attachmentOptions.classList.add('attachment-options');
    attachmentOptions.classList.add('flex');
    attachmentOptions.classList.add('flex-row');
    attachmentOptions.classList.add('flex-justify-center');
    attachmentOptions.classList.add('flex-align-center');

    let menu = [
      {
        background: '/assets/images/gallary.svg',
        onclick: takePhotoFromGallary,
        title: 'Gallary'
      },
      {
        background: '/assets/images/camera.svg',
        onclick: takePhotoFromGallary,
        title: 'Camera'
      }
    ];
    for(let item of menu){
      let child = document.createElement('div');
      child.style.backgroundImage = 'url(' + item.background + ')';
      child.classList.add('attachment-item');
      child.onclick = () => {
        detachCover();
        item.onclick();
      }
      child.title = item.title;
      attachmentOptions.appendChild(child);
    }

    attachToCover(attachmentOptions, event);

  } catch (e) {console.log(e);}
}

const createCircularProgressBar = (styles) => {

  let outerCircle = document.createElement('div');
  outerCircle.style.width = '50px';
  outerCircle.style.height = '50px';
  outerCircle.style.borderRadius = '50%';
  outerCircle.style.backgroundColor = 'dodgerblue';
  outerCircle.animate(
    [
      {transform: 'rotate(0)'},
      {transform: 'rotate(360deg)'}
    ],
    {
      duration: 1500,
      iterations: Infinity
    });

  let innerCircle = document.createElement('div');
  innerCircle.style.borderRadius = '50%';
  innerCircle.style.width = '97%';
  innerCircle.style.height = '98%';
  innerCircle.style.backgroundColor = 'white';

  if(styles){
    if(styles.color){
      outerCircle.style.backgroundColor = styles.color;
    }
    if(styles.size){
      outerCircle.style.width = styles.size;
      outerCircle.style.height = styles.size;
    }
  }

  outerCircle.appendChild(innerCircle);

  return outerCircle;

}
