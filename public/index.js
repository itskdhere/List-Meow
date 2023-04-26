import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-auth.js";
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
        uuid = user.uid;

        displayUserInfo.textContent = `${user.uid} | ${user.email}`;

        let dbRef = ref(database, `${uuid}`);

        onValue(dbRef, (snapshot) => {
            // list.innerHTML = '';
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
                    remove(ref(database, `${uuid}/${itemId}`)); // here
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
            // Signed in
            let user = userCredential.user;
            console.log(user);

            emailInput.value = '';
            passwordInput.value = '';
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);
        });
});

signoutButton.addEventListener('click', () => {
    signOut(auth).then(() => {
        // Sign-out successful.
        console.log('Sign-out successful');
    }).catch((error) => {
        // An error happened.
        console.log(error);
    });
});

addButton.addEventListener('click', () => {
    let item = inputText.value;
    //dbRef = ref(database, `${uuid}`);
    push(ref(database, `${uuid}`), item);
    inputText.value = '';
});

togglePassword.addEventListener('click', function (e) {
    // const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    // passwordInput.setAttribute('type', type);
    // this.classList.toggle('fa-solid fa-eye-slash');
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