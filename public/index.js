import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-database.js";
import {
    getAuth, updateProfile, signOut, createUserWithEmailAndPassword,
    signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, sendEmailVerification
}
    from "https://www.gstatic.com/firebasejs/9.20.0/firebase-auth.js";

const firebaseConfig = {
    "apiKey": "AIzaSyBGpOR0GEeFHcm606TaVTcC2HDrNoaybu4",
    "authDomain": "listmeow.firebaseapp.com",
    "databaseURL": "https://listmeow-default-rtdb.firebaseio.com",
    "projectId": "listmeow",
    "storageBucket": "listmeow.appspot.com",
    "messagingSenderId": "39993979426",
    "appId": "1:39993979426:web:d617bc170a68c455e3507b"
};

const inputText = document.getElementById('input-text');
const addButton = document.getElementById('add-button');
const list = document.getElementById('list');

const nameInput = document.getElementById('name-input');
const emailInputSignin = document.getElementById('email-input-signin');
const emailInputSignup = document.getElementById('email-input-signup');
const passwordInputSignin = document.getElementById('password-input-signin');
const passwordInputSignup = document.getElementById('password-input-signup');
const signupButton = document.getElementById('signup-button');
const signinButton = document.getElementById('signin-button');
const signoutButton = document.getElementById('signout-button');
const emailSignoutButton = document.getElementById('email-signout-button');

const togglePasswordSignup = document.getElementById('toggle-password-eye-signup');
const togglePasswordSignin = document.getElementById('toggle-password-eye-signin');

const siggnedInSection = document.getElementById('signed-in');
const siggnedOutSection = document.getElementById('signed-out');
const verifyEmailSection = document.getElementById('verify-email-section');

const inputContainerSignUp = document.getElementById('input-container-sign-up');
const inputContainerSignIn = document.getElementById('input-container-sign-in');

const inputContainerSignedIn = document.getElementById('input-container-signed-in');

const resetPasswordButton = document.getElementById('reset-password-button');
const signinErrorBox = document.getElementById('sign-in-error-box');
const signUpErrorBox = document.getElementById('sign-up-error-box');
const displayUserInfo = document.getElementById('display-user-info');

const verifyEmailAddress = document.getElementById('verify-email-address');
const resendVerificationEmailButton = document.getElementById('resend-verification-email-button');


const signUpRefer = document.getElementById('sign-up-refer');
const signInRefer = document.getElementById('sign-in-refer');


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
let uuid;

const actionCodeSettingsVerifyEmail = {
    url: `${window.location.href}?reSignIn=true`
};

const actionCodeSettingsPasswordReset = {
    url: `${window.location.href}`
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        siggnedOutSection.hidden = true;

        if (user.emailVerified) {
            verifyEmailSection.style.display = "none";
            siggnedInSection.hidden = false;
        } else {
            verifyEmailSection.style.display = "flex";
            siggnedInSection.hidden = true;
        }

        resendVerificationEmailButton.addEventListener('click', () => {
            sendEmailVerification(auth.currentUser, actionCodeSettingsVerifyEmail)
                .then(() => {
                    console.log(`✔ Successfully Sent Verification Email To ${user.email}`);
                    alert(`✔ Successfully Sent Verification Email To ${user.email}`);
                })
                .catch((error) => {
                    console.log(error);
                });
        });

        console.log(user);
        console.log("Signed-In Successfully ✅");

        uuid = user.uid;

        displayUserInfo.textContent = `${user.uid} | ${user.email}`;
        verifyEmailAddress.textContent = `${user.email}`;

        let dbRef = ref(database, `${uuid}`);

        onValue(dbRef, (snapshot) => {
            console.log("Firebase Real-Time Database: 🟢");
            while (list.hasChildNodes()) {
                list.removeChild(list.firstChild);
            }

            if (snapshot.val() == null) {
                let empty = document.createElement('li')
                empty.textContent = 'List Empty !!';
                empty.style.color = '#ee0000';
                empty.style.backgroundColor = '#d8eb85';
                list.appendChild(empty)
                return;
            }

            let listRaw = Object.entries(snapshot.val());

            for (let i = 0; i < listRaw.length; i++) {
                let itemId = listRaw[i][0];
                let itemVal = listRaw[i][1];

                let newLi = document.createElement('li');
                newLi.textContent = itemVal;
                newLi.addEventListener('dblclick', () => {
                    remove(ref(database, `${uuid}/${itemId}`));
                });
                list.appendChild(newLi);
            }
        });
    } else {
        siggnedInSection.hidden = true;
        siggnedOutSection.hidden = false;
        verifyEmailSection.style.display = "none";
    }
});

window.addEventListener('load', () => {
    const queryParam = new URLSearchParams(window.location.search);
    const reSignIn = queryParam.get('reSignIn');
    if (reSignIn === 'true') {
        signOut(auth).then(() => {
            console.log('Sign-Out Successful');
            inputContainerSignIn.style.display = "block";
            inputContainerSignUp.style.display = "none";
        }).catch((error) => {
            console.log(error);
        });
    } else {
        inputContainerSignIn.style.display = "none";
        inputContainerSignUp.style.display = "block";
    }
});

signInRefer.addEventListener('click', () => {
    inputContainerSignUp.style.display = "none";
    inputContainerSignIn.style.display = "block";
});

signUpRefer.addEventListener('click', () => {
    inputContainerSignUp.style.display = "block";
    inputContainerSignIn.style.display = "none";
});

signupButton.addEventListener('click', (e) => {
    e.target.disabled = true;
    signupButton.textContent = 'Processing...';
    signupButton.style.cursor = 'not-allowed';
    signupButton.style.backgroundColor = '#81be0e';

    let name = nameInput.value;
    let email = emailInputSignup.value;
    let password = passwordInputSignup.value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            let user = userCredential.user;
            console.log(user);
            console.log('Sign-Up Successful');
            emailInputSignup.value = '';
            passwordInputSignup.value = '';
            signupButton.textContent = 'Redirecting...';
            signupButton.style.backgroundColor = '#14d34d';

            sendEmailVerification(auth.currentUser, actionCodeSettingsVerifyEmail)
                .then(() => {
                    console.log(`✔ Successfully Sent Verification Email To ${user.email}`);
                })
                .catch((error) => {
                    console.log(error);
                });

            setTimeout(() => {
                updateProfile(auth.currentUser, {
                    displayName: `${name}`
                }).catch((error) => {
                    console.log(error);
                });

                nameInput.value = '';
                e.target.disabled = false;
                signupButton.textContent = 'Sign-Up';
                signupButton.style.cursor = 'pointer';
            }, 2000);
        })
        .catch((error) => {
            console.log(error);
            signUpErrorBox.hidden = false;
            signUpErrorBox.textContent = error.message;
            setTimeout(() => {
                signUpErrorBox.hidden = true;
                signUpErrorBox.textContent = "";
                e.target.disabled = false;
                signupButton.textContent = 'Sign-Up';
                signupButton.style.cursor = 'pointer';
                signupButton.style.backgroundColor = '#14d34d';
            }, 3000);
        });
});

signinButton.addEventListener('click', (e) => {
    e.target.disabled = true;
    signinButton.textContent = 'Authenticating...';
    signinButton.style.cursor = 'not-allowed';
    signinButton.style.backgroundColor = '#81be0e';

    let email = emailInputSignin.value;
    let password = passwordInputSignin.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // let user = userCredential.user;
            // console.log(user);
            console.log('Sign-In Successful');
            emailInputSignin.value = '';
            passwordInputSignin.value = '';
            setTimeout(() => {
                e.target.disabled = false;
                signinButton.textContent = 'Sign-In';
                signinButton.style.cursor = 'pointer';
                signinButton.style.backgroundColor = '#14d34d';
            }, 2000);
        })
        .catch((error) => {
            console.log(error);
            signinErrorBox.hidden = false;
            signinErrorBox.textContent = error.message;
            setTimeout(() => {
                signinErrorBox.hidden = true;
                signinErrorBox.textContent = "";
                e.target.disabled = false;
                signinButton.textContent = 'Sign-In';
                signinButton.style.cursor = 'pointer';
                signinButton.style.backgroundColor = '#14d34d';
            }, 3000);
        });
});

resetPasswordButton.addEventListener('click', (e) => {
    e.target.disabled = true;
    resetPasswordButton.textContent = 'Procssing...';
    resetPasswordButton.style.cursor = 'not-allowed';
    resetPasswordButton.style.backgroundColor = '#81be0e';

    let email = emailInputSignin.value;

    sendPasswordResetEmail(auth, email, actionCodeSettingsPasswordReset)
        .then(() => {
            setTimeout(() => {
                e.target.disabled = false;
                resetPasswordButton.textContent = 'Reset Password';
                resetPasswordButton.style.cursor = 'pointer';
                resetPasswordButton.style.backgroundColor = '#10bfd6';
                alert(`✔ Successfully Sent Password Reset Link To ${email}`);
            }, 2000);
        })
        .catch((error) => {
            console.log(error);
            signinErrorBox.hidden = false;
            signinErrorBox.textContent = error.message;
            setTimeout(() => {
                signinErrorBox.hidden = true;
                signinErrorBox.textContent = "";
            }, 3000);
        });
});

signoutButton.addEventListener('click', () => {
    signOut(auth).then(() => {
        console.log('Sign-Out Successful');
    }).catch((error) => {
        console.log(error);
    });
});

emailSignoutButton.addEventListener('click', () => {
    signOut(auth).then(() => {
        console.log('Sign-Out Successful');
    }).catch((error) => {
        console.log(error);
    });
});


addButton.addEventListener('click', () => {
    let item = inputText.value;
    push(ref(database, `${uuid}`), item);
    inputText.value = '';
});

togglePasswordSignin.addEventListener('click', function (e) {
    if (passwordInputSignin.type === "password") {
        passwordInputSignin.type = "text";
        togglePasswordSignin.src = "svg/eye-solid.svg";
    } else {
        passwordInputSignin.type = "password";
        togglePasswordSignin.src = "svg/eye-slash-solid.svg";
    }
});

togglePasswordSignup.addEventListener('click', function (e) {
    if (passwordInputSignup.type === "password") {
        passwordInputSignup.type = "text";
        togglePasswordSignup.src = "svg/eye-solid.svg";
    } else {
        passwordInputSignup.type = "password";
        togglePasswordSignup.src = "svg/eye-slash-solid.svg";
    }
});

inputContainerSignIn.addEventListener('click', (e) => {
    e.preventDefault();
});

inputContainerSignedIn.addEventListener('click', (e) => {
    e.preventDefault();
});


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then((reg) => console.log('service worker registered', reg))
        .catch((err) => console.log('service worker not registered', err));
}