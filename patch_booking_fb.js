const fs = require('fs');
let booking = fs.readFileSync('booking.html', 'utf8');

const OLD_CONFIG = `    const firebaseConfig = {
      apiKey: "AIzaSyCU5HsBfkdN1J68GZU1Y_GDRK3l1G3-XcE",
      authDomain: "topguild-eeb40.firebaseapp.com",
      projectId: "topguild-eeb40",
      storageBucket: "topguild-eeb40.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:topguild-eeb40:web:abcdef"
    };`;

const NEW_CONFIG = `    const firebaseConfig = {
      apiKey: "AIzaSyBXPfxhSLBt9dQqf5glFrXvx6KLxqPmEE8",
      authDomain: "topguild-eeb40.firebaseapp.com",
      projectId: "topguild-eeb40",
      storageBucket: "topguild-eeb40.firebasestorage.app",
      messagingSenderId: "879954426796",
      appId: "1:879954426796:web:48e305dc9f78bda6a51809"
    };`;

booking = booking.replace(OLD_CONFIG, NEW_CONFIG);
fs.writeFileSync('booking.html', booking);
console.log('Updated Firebase config in booking.html');
