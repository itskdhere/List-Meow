import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-auth.js";
import firebaseConfig from './firebaseConfig.json' assert {type: 'json'};

const inputText = document.getElementById('input-text');
const addButton = document.getElementById('add-button');
const list = document.getElementById('list');

const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const signinButton = document.getElementById('signin-button');
const signoutButton = document.getElementById('signout-button');
const togglePassword = document.getElementById('togglePassword');

const siggnedInSection = document.getElementById('signed-in');
const siggnedOutSection = document.getElementById('signed-out');

const inputContainerSignedOut = document.getElementById('input-container-signed-out');
const inputContainerSignedIn = document.getElementById('input-container-signed-in');

const resetPasswordButton = document.getElementById('reset-password-button');
const signinErrorBox = document.getElementById('sign-in-error-box');
const displayUserInfo = document.getElementById('display-user-info');


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
let uuid;


onAuthStateChanged(auth, (user) => {
    if (user) {
        siggnedInSection.hidden = false;
        siggnedOutSection.hidden = true;

        console.log(user);
        console.log("Signed-In Successfully ✅");

        uuid = user.uid;

        displayUserInfo.textContent = `${user.uid} | ${user.email}`;

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
    }
});

signinButton.addEventListener('click', () => {
    let email = emailInput.value;
    let password = passwordInput.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // let user = userCredential.user;
            // console.log(user);
            console.log('Sign-In Successful');
            emailInput.value = '';
            passwordInput.value = '';
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

resetPasswordButton.addEventListener('click', () => {
    let email = emailInput.value;

    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert(`Successfully Sent Password Reset Link To ${email}`);
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

addButton.addEventListener('click', () => {
    let item = inputText.value;
    push(ref(database, `${uuid}`), item);
    inputText.value = '';
});

togglePassword.addEventListener('click', function (e) {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePassword.src = "eye-solid.svg";
    } else {
        passwordInput.type = "password";
        togglePassword.src = "eye-slash-solid.svg";
    }
});

inputContainerSignedOut.addEventListener('click', (e) => {
    e.preventDefault();
});

inputContainerSignedIn.addEventListener('click', (e) => {
    e.preventDefault();
});
