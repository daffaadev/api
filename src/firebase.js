const { initializeApp } = require("firebase/app")

const {
getFirestore
} = require("firebase/firestore")

const firebaseConfig = {

apiKey: "AIzaSyDTPcysGRTyWO4hTpLDEDpTWwKP77G35M0",

authDomain: "payment-api-c0aa9.firebaseapp.com",

projectId: "payment-api-c0aa9",

storageBucket: "payment-api-c0aa9.firebasestorage.app",

messagingSenderId: "715962591383",

appId: "1:715962591383:web:5f10b39b3c9c84d2ac21d2",

measurementId: "G-S3PGYSGBBM"

}

const app = initializeApp(firebaseConfig)

const db = getFirestore(app)

module.exports = db
