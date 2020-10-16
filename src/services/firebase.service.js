import { auth, initializeApp } from 'firebase';
import AuthService from './auth.service';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

initializeApp(firebaseConfig);

function signInWithPopup(provider) {
  return auth()
    .signInWithPopup(provider)
    .then(async function (result) {
      console.log(result);

      const { profile, providerId } = result.additionalUserInfo;

      const response = await AuthService.register({
        firstName: profile.given_name,
        lastName: profile.family_name,
        email: profile.email,
        source: providerId.split('.')[0],
        role: 'artist',
      });

      if (response) {
        window.location.href = '/';
      }
    })
    .catch(function (error) {
      console.error(error);
    });
}

export default {
  signInWithGoogle() {
    const provider = new auth.GoogleAuthProvider();
    return signInWithPopup(provider);
  },
  signInWithFacebook() {
    const provider = new auth.FacebookAuthProvider();
    return signInWithPopup(provider);
  },
  signInWithTwitter() {
    const provider = new auth.TwitterAuthProvider();
    return signInWithPopup(provider);
  },
};
