import React, {useState, useEffect} from 'react';
import {app} from '../firebase/config';
import {attachToCover, detachCover} from '../Utilities';

const NewChat = () => {

	const addNewUser = (event) => {
		try {
			let addNewFriendLayout = document.createElement('div');
			addNewFriendLayout.classList.add('color-black');
			addNewFriendLayout.classList.add('small-modal');
			addNewFriendLayout.classList.add('bg-white');
			addNewFriendLayout.classList.add('absolute');
			addNewFriendLayout.classList.add('flex');
			addNewFriendLayout.classList.add('flex-column');
			addNewFriendLayout.classList.add('flex-justify-center');
			addNewFriendLayout.classList.add('flex-align-center');
			if(window.theme){
				addNewFriendLayout.classList.add('dark-mode');
				addNewFriendLayout.classList.add('shadow-white');
			}
			addNewFriendLayout.id = 'add-new-friend-layout';
			let phoneNumber = document.createElement('input');
			phoneNumber.type = 'phone';
			phoneNumber.placeholder = 'Phone';
			phoneNumber.maxLength = '10';
			phoneNumber.classList.add('add-new-friend-phone');
			phoneNumber.minLength = '10';
			if(window.theme){
				phoneNumber.classList.add('dark-mode');
			}
			addNewFriendLayout.appendChild(phoneNumber);
			let search  = document.createElement('button');
			search.innerHTML = 'Search';
			search.classList.add('add-new-friend-search');
			search.classList.add('color-white');
			search.classList.add('cursor-pointer');
			const Search = () => {
				const showUser = (uid) => {
					let childs = addNewFriendLayout.childNodes;
					for(let node of childs){
						if(node.id === 'add-new-friend-request'){
							return;
						}
					}
					let nouserfound = document.getElementById('add-new-friend-no-user-found');
					if(nouserfound){
						addNewFriendLayout.removeChild(nouserfound);
					}
					let request  = document.createElement('button');
					request.innerHTML = 'Request';
					request.id = 'add-new-friend-request';
					request.classList.add('add-new-friend-request');
					request.classList.add('color-white');
					request.classList.add('cursor-pointer');
					request.addEventListener('click', () => {
						app.database().ref('users').child(uid).child('friendrequests')
							.child(app.auth().currentUser.uid)
							.set({ status: 'pending' , sender: app.auth().currentUser.uid}, (error) => {
										if(!error){
											try{
												noUserFound('Request sent successfully');
												let request = document.getElementById('add-new-friend-request');
												if(request){
													addNewFriendLayout.removeChild(request);
												}
											}catch(error){}
										}
							});
							app.database().ref('users').child(app.auth().currentUser.uid).child('friendrequests').child(uid)
								.set({ status: 'pending' , sender: app.auth().currentUser.uid}, (error) => {});
					});
					addNewFriendLayout.appendChild(request);
				}
				const noUserFound = (text) => {
					try{
						let nouserfound = document.getElementById('add-new-friend-no-user-found');
						if(nouserfound){
							nouserfound.innerHTML = text;
							return;
						}
					}catch(error){}
					let childs = addNewFriendLayout.childNodes;
					for(let node of childs){
						if(node.id === 'add-new-friend-no-user-found'){
							return;
						}
					}
					let request = document.getElementById('add-new-friend-request');
					if(request){
						addNewFriendLayout.removeChild(request);
					}
					let nouserfound  = document.createElement('span');
					nouserfound.innerHTML = text;
					nouserfound.classList.add('add-new-friend-no-user-found');
					nouserfound.id = 'add-new-friend-no-user-found';
					addNewFriendLayout.appendChild(nouserfound);
				}
				app.database().ref('users').child('UIDs').orderByValue().equalTo(phoneNumber.value)
					.get().then((snapshot) => {
						if(snapshot.val()){
							for(let obj in snapshot.val()){
								if(obj !== app.auth().currentUser.uid){
									for(let people in window.USER.peoples){
										if(people == obj){
											noUserFound('Already friend');
											return;
										}
									}
									showUser(obj);
								}
							}
						}else{
							noUserFound('No user found');
						}
					}).catch((error) => {});
			}
			search.addEventListener('click', Search);
			addNewFriendLayout.appendChild(search);
			attachToCover(addNewFriendLayout, event);
			phoneNumber.focus();
		} catch (e) {console.log(e);}
	}

	return(
		<React.Fragment>
		<div className='new-chat absolute cursor-pointer'>
			<button className='add-new-chat-button color-white cursor-pointer bg-green'
				onClick={addNewUser}>
				<span className='fa fa-user-plus'/>
			</button>
		</div>
		</React.Fragment>
	);
}

export default NewChat;
