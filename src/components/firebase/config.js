import app from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

export const FirbaseStorageBaseURL = '';

const firebaseConfig = {
  
};

app.initializeApp(firebaseConfig);
const storage = app.storage();

export {app,storage}
