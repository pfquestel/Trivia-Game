import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence, signInAnonymously, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import CryptoJS from "crypto-js";

// Get the encrypted config from environment variables
const encryptedConfig = import.meta.env.VITE_FIREBASE_ENCRYPTED;
const encryptionKey = import.meta.env.VITE_FIREBASE_KEY;

// **Synchronous Decryption Function**
function decryptAES(cipherText: string, key: string): string {
    const keyBytes = CryptoJS.enc.Hex.parse(key);
    const cipherParts = cipherText.split(":");
    const iv = CryptoJS.enc.Hex.parse(cipherParts[0]);
    const encryptedData = CryptoJS.enc.Hex.parse(cipherParts[1]);

    const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: encryptedData },
        keyBytes,
        { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
}

// **Decrypt Firebase Config Synchronously**
const firebaseConfig: FirebaseOptions = JSON.parse(decryptAES(encryptedConfig, encryptionKey));

// **Initialize Firebase Immediately**
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

signInAnonymously(auth).then((user) => {
  console.log("User signed in anonymously", user);
});

// Temporary for testing
// Ensure no existing user session
// signOut(auth)
//   .then(() => {
//     console.log("Signed out from previous session.");

//     // Set session-based persistence
//     return setPersistence(auth, browserSessionPersistence);
//   })
//   .then(() => {
//     // Sign in anonymously with new session-based persistence
//     return signInAnonymously(auth);
//   })
//   .then((userCredential) => {
//     console.log("New anonymous user:", userCredential.user.uid);
//   })
//   .catch((error) => {
//     console.error("Error signing in with session persistence:", error);
//   });

// Questions to seed
const questions = [
  // Would You Rather
  { mode: 'would_you_rather', question: 'Would you rather have the ability to talk to animals or speak every language in the world?', answers: ['Talk to animals', 'Speak every language'] },
  { mode: 'would_you_rather', question: 'Would you rather travel to the past to meet your ancestors or travel to the future to meet your descendants?', answers: ['Travel to the past', 'Travel to the future'] },
  { mode: 'would_you_rather', question: 'Would you rather always have to sing instead of speaking or dance everywhere instead of walking?', answers: ['Sing instead of speaking', 'Dance instead of walking'] },
  { mode: 'would_you_rather', question: 'Would you rather explore the deepest parts of the ocean or travel to outer space?', answers: ['Deepest parts of the ocean', 'Travel to outer space'] },
  { mode: 'would_you_rather', question: 'Would you rather have unlimited free plane tickets or never pay for food at restaurants?', answers: ['Unlimited free plane tickets', 'Never pay for food'] },
  { mode: 'would_you_rather', question: 'Would you rather have super strength or super speed?', answers: ['Super strength', 'Super speed'] },
  { mode: 'would_you_rather', question: 'Would you rather always feel like it’s your birthday or always feel like it’s the first day of vacation?', answers: ['Birthday', 'Vacation'] },
  { mode: 'would_you_rather', question: 'Would you rather have a pet dragon or a pet unicorn?', answers: ['Dragon', 'Unicorn'] },
  { mode: 'would_you_rather', question: 'Would you rather be able to teleport anywhere or be invisible for 10 seconds at a time?', answers: ['Teleport', 'Be invisible'] },
  { mode: 'would_you_rather', question: 'Would you rather only eat sweet food or only eat savory food forever?', answers: ['Sweet', 'Savory'] },
  { mode: 'would_you_rather', question: 'Would you rather be able to fly or breathe underwater?', answers: ['Fly', 'Breathe underwater'] },
  { mode: 'would_you_rather', question: 'Would you rather always have perfect hair or perfect teeth?', answers: ['Perfect hair', 'Perfect teeth'] },
  { mode: 'would_you_rather', question: 'Would you rather have to live without music or without movies?', answers: ['Without music', 'Without movies'] },
  { mode: 'would_you_rather', question: 'Would you rather visit every country in the world or go to space?', answers: ['Every country', 'Space'] },
  { mode: 'would_you_rather', question: 'Would you rather always win board games or video games?', answers: ['Board games', 'Video games'] },
  { mode: 'would_you_rather', question: 'Would you rather have a rewind button or a pause button in your life?', answers: ['Rewind', 'Pause'] },
  { mode: 'would_you_rather', question: 'Would you rather have a personal robot assistant or a personal flying car?', answers: ['Robot assistant', 'Flying car'] },
  { mode: 'would_you_rather', question: 'Would you rather live in a world without chocolate or a world without pizza?', answers: ['Without chocolate', 'Without pizza'] },
  { mode: 'would_you_rather', question: 'Would you rather always know the time or always know the weather?', answers: ['Time', 'Weather'] },
  { mode: 'would_you_rather', question: 'Would you rather have an unlimited supply of coffee or ice cream?', answers: ['Coffee', 'Ice cream'] },
  { mode: 'would_you_rather', question: 'Would you rather be a famous inventor or a famous explorer?', answers: ['Inventor', 'Explorer'] },
  { mode: 'would_you_rather', question: 'Would you rather live in the city or the countryside?', answers: ['City', 'Countryside'] },
  { mode: 'would_you_rather', question: 'Would you rather always speak in rhymes or only be able to whisper?', answers: ['Rhymes', 'Whisper'] },
  { mode: 'would_you_rather', question: 'Would you rather always have to wear formal clothes or pajamas?', answers: ['Formal clothes', 'Pajamas'] },
  { mode: 'would_you_rather', question: 'Would you rather find $100 on the ground or have your best friend find $1,000?', answers: ['$100', 'Friend finds $1,000'] },
  { mode: 'would_you_rather', question: 'Would you rather have the ability to fly or turn invisible?', answers: ['Fly', 'Turn invisible'] },
  { mode: 'would_you_rather', question: 'Would you rather live in a treehouse or a houseboat?', answers: ['Treehouse', 'Houseboat'] },
  { mode: 'would_you_rather', question: 'Would you rather always be 10 minutes late or 20 minutes early?', answers: ['10 minutes late', '20 minutes early'] },
  { mode: 'would_you_rather', question: 'Would you rather have unlimited free coffee or unlimited free pizza?', answers: ['Coffee', 'Pizza'] },
  { mode: 'would_you_rather', question: 'Would you rather have a rewind button or a pause button for your life?', answers: ['Rewind', 'Pause'] },
  { mode: 'would_you_rather', question: 'Would you rather have the ability to talk to animals or the ability to control the weather?', answers: ['Talk to animals', 'Control the weather'] },
  { mode: 'would_you_rather', question: 'Would you rather explore space or explore the deep ocean?', answers: ['Space', 'Ocean'] },
  { mode: 'would_you_rather', question: 'Would you rather be a famous actor or a famous musician?', answers: ['Actor', 'Musician'] },
  { mode: 'would_you_rather', question: 'Would you rather be able to breathe underwater or run super fast?', answers: ['Breathe underwater', 'Run super fast'] },
  { mode: 'would_you_rather', question: 'Would you rather have the ability to teleport or the ability to read minds?', answers: ['Teleport', 'Read minds'] },
  { mode: 'would_you_rather', question: 'Would you rather never have to sleep or never have to eat?', answers: ['Never sleep', 'Never eat'] },
  { mode: 'would_you_rather', question: 'Would you rather always know what time it is or always know what the weather will be?', answers: ['Know the time', 'Know the weather'] },
  { mode: 'would_you_rather', question: 'Would you rather live in the mountains or on the beach?', answers: ['Mountains', 'Beach'] },
  { mode: 'would_you_rather', question: 'Would you rather always have to wear formal clothes or pajamas?', answers: ['Formal clothes', 'Pajamas'] },
  { mode: 'would_you_rather', question: 'Would you rather only be able to whisper or only be able to shout?', answers: ['Whisper', 'Shout'] },
  { mode: 'would_you_rather', question: 'Would you rather always be slightly too hot or slightly too cold?', answers: ['Too hot', 'Too cold'] },
  { mode: 'would_you_rather', question: 'Would you rather live without music or without movies?', answers: ['Without music', 'Without movies'] },
  { mode: 'would_you_rather', question: 'Would you rather have a personal chef or a personal chauffeur?', answers: ['Chef', 'Chauffeur'] },
  { mode: 'would_you_rather', question: 'Would you rather always get stuck in traffic or always have a slow internet connection?', answers: ['Traffic', 'Slow internet'] },
  { mode: 'would_you_rather', question: 'Would you rather have unlimited money or unlimited free time?', answers: ['Money', 'Free time'] },
  { mode: 'would_you_rather', question: 'Would you rather always smell like vanilla or always smell like lavender?', answers: ['Vanilla', 'Lavender'] },
  { mode: 'would_you_rather', question: 'Would you rather live in a city or in the countryside?', answers: ['City', 'Countryside'] },
  { mode: 'would_you_rather', question: 'Would you rather have the power to be invisible or the power to fly?', answers: ['Invisible', 'Fly'] },
  { mode: 'would_you_rather', question: 'Would you rather eat only sweet food or only salty food for the rest of your life?', answers: ['Sweet', 'Salty'] },
  { mode: 'would_you_rather', question: 'Would you rather have a pet dragon or a pet unicorn?', answers: ['Dragon', 'Unicorn'] },
  { mode: 'would_you_rather', question: 'Would you rather live 100 years in the past or 100 years in the future?', answers: ['Past', 'Future'] },
  { mode: 'would_you_rather', question: 'Would you rather have a job you love with low pay or a job you dislike with high pay?', answers: ['Job I love', 'Job with high pay'] },
  { mode: 'would_you_rather', question: 'Would you rather have the ability to control fire or control water?', answers: ['Control fire', 'Control water'] },
  { mode: 'would_you_rather', question: 'Would you rather always win at board games or always win at video games?', answers: ['Board games', 'Video games'] },
  { mode: 'would_you_rather', question: 'Would you rather have a photographic memory or be able to forget anything you want?', answers: ['Photographic memory', 'Forget anything'] },
  { mode: 'would_you_rather', question: 'Would you rather be able to instantly learn a new skill or instantly master a skill you already know?', answers: ['Learn a new skill', 'Master an existing skill'] },
  { mode: 'would_you_rather', question: 'Would you rather live in a world without chocolate or a world without coffee?', answers: ['Without chocolate', 'Without coffee'] },
  { mode: 'would_you_rather', question: 'Would you rather live in a world where it is always summer or always winter?', answers: ['Summer', 'Winter'] },
  { mode: 'would_you_rather', question: 'Would you rather have the ability to speak every language or the ability to play every musical instrument?', answers: ['Speak every language', 'Play every instrument'] },
  { mode: 'would_you_rather', question: 'Would you rather be an amazing dancer or an amazing singer?', answers: ['Dancer', 'Singer'] },
  { mode: 'would_you_rather', question: 'Would you rather only eat breakfast food or only eat dinner food?', answers: ['Breakfast', 'Dinner'] },
  { mode: 'would_you_rather', question: 'Would you rather have a time machine or a teleportation device?', answers: ['Time machine', 'Teleportation device'] },
  { mode: 'would_you_rather', question: 'Would you rather be able to pause time or travel into the future?', answers: ['Pause time', 'Travel to the future'] },
  { mode: 'would_you_rather', question: 'Would you rather always know what people are thinking or always know the future?', answers: ['Know what people are thinking', 'Know the future'] },
  { mode: 'would_you_rather', question: 'Would you rather live without air conditioning or live without heating?', answers: ['Without air conditioning', 'Without heating'] },
  { mode: 'would_you_rather', question: 'Would you rather have the ability to change your past or see your future?', answers: ['Change the past', 'See the future'] },
  { mode: 'would_you_rather', question: 'Would you rather have a personal assistant or a personal trainer?', answers: ['Personal assistant', 'Personal trainer'] },
  { mode: 'would_you_rather', question: 'Would you rather always have to skip breakfast or always have to skip dinner?', answers: ['Skip breakfast', 'Skip dinner'] },
  { mode: 'would_you_rather', question: 'Would you rather have a never-ending supply of books or a never-ending supply of movies?', answers: ['Books', 'Movies'] },
  { mode: 'would_you_rather', question: 'Would you rather always have to take cold showers or never eat your favorite food again?', answers: ['Cold showers', 'No favorite food'] },

  // World Trivia
  { mode: 'world_trivia', question: 'What is the capital city of Japan?', answers: ['Tokyo', 'Nagoya', 'Kyoto', 'Osaka'] },
  { mode: 'world_trivia', question: 'Which planet is known as the Blue Planet?', answers: ['Earth', 'Neptune', 'Mars', 'Venus'] },
  { mode: 'world_trivia', question: 'What is the largest continent by area?', answers: ['Asia', 'Europe', 'North America', 'Africa'] },
  { mode: 'world_trivia', question: 'Which ocean is the smallest in the world?', answers: ['Arctic Ocean', 'Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean'] },
  { mode: 'world_trivia', question: 'What is the longest river in the world?', answers: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'] },
  { mode: 'world_trivia', question: 'Which country is famous for the Eiffel Tower?', answers: ['France', 'Spain', 'Italy', 'Germany'] },
  { mode: 'world_trivia', question: 'What is the world’s largest island?', answers: ['Greenland', 'New Guinea', 'Australia', 'Iceland'] },
  { mode: 'world_trivia', question: 'What is the smallest country in the world?', answers: ['Vatican City', 'Liechtenstein', 'San Marino', 'Monaco'] },
  { mode: 'world_trivia', question: 'Which U.S. state is known as the Sunshine State?', answers: ['Florida', 'Texas', 'Arizona', 'California'] },
  { mode: 'world_trivia', question: 'Which country is known as the Land of the Rising Sun?', answers: ['Japan', 'Thailand', 'Vietnam', 'China'] },
  { mode: 'world_trivia', question: 'What is the capital of Canada?', answers: ['Ottawa', 'Toronto', 'Montreal', 'Vancouver'] },
  { mode: 'world_trivia', question: 'Which desert is the largest in the world?', answers: ['Antarctica', 'Gobi', 'Sahara', 'Kalahari'] },
  { mode: 'world_trivia', question: 'Which city is known as the City of Love?', answers: ['Paris', 'Vienna', 'Venice', 'Rome'] },
  { mode: 'world_trivia', question: 'What is the tallest mountain in the world?', answers: ['Mount Everest', 'Denali', 'K2', 'Kangchenjunga'] },
  { mode: 'world_trivia', question: 'Which U.S. state has the nickname “The Lone Star State”?', answers: ['Texas', 'Nevada', 'Arizona', 'New Mexico'] },
  { mode: 'world_trivia', question: 'What is the name of the longest wall in the world?', answers: ['The Great Wall of China', 'Hadrian’s Wall', 'Wall of Babylon', 'Berlin Wall'] },
  { mode: 'world_trivia', question: 'What is the deepest ocean in the world?', answers: ['Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean'] },
  { mode: 'world_trivia', question: 'Which U.S. state is the Grand Canyon located in?', answers: ['Arizona', 'Nevada', 'California', 'Utah'] },
  { mode: 'world_trivia', question: 'Which country is known for inventing pizza?', answers: ['Italy', 'Spain', 'France', 'Greece'] },
  { mode: 'world_trivia', question: 'Which African country is the largest by area?', answers: ['Algeria', 'Sudan', 'Egypt', 'South Africa'] },
  { mode: 'world_trivia', question: 'What is the capital city of Australia?', answers: ['Canberra', 'Sydney', 'Perth', 'Melbourne'] },
  { mode: 'world_trivia', question: 'Which European city is known for the Colosseum?', answers: ['Rome', 'Madrid', 'Athens', 'Paris'] },
  { mode: 'world_trivia', question: 'What is the national flower of Japan?', answers: ['Cherry Blossom', 'Orchid', 'Lotus', 'Rose'] },
  { mode: 'world_trivia', question: 'What is the largest mammal in the world?', answers: ['Blue Whale', 'Elephant', 'Giraffe', 'Hippopotamus'] },
  { mode: 'world_trivia', question: 'Which country is known as the Land of a Thousand Lakes?', answers: ['Finland', 'Canada', 'Sweden', 'Norway'] },
  { mode: 'world_trivia', question: 'Which U.S. state is famous for Hollywood?', answers: ['California', 'New York', 'Florida', 'Nevada'] },
  { mode: 'world_trivia', question: 'Which country is known for its tulips and windmills?', answers: ['Netherlands', 'Sweden', 'Germany', 'Belgium'] },
  { mode: 'world_trivia', question: 'Which planet is the hottest in our solar system?', answers: ['Venus', 'Jupiter', 'Mars', 'Mercury'] },
  { mode: 'world_trivia', question: 'Which country is known for its maple syrup?', answers: ['Canada', 'Sweden', 'USA', 'Norway'] },
  { mode: 'world_trivia', question: 'Which river is the longest in Africa?', answers: ['Nile', 'Congo', 'Zambezi', 'Niger'] },
  { mode: 'world_trivia', question: 'What is the largest rainforest in the world?', answers: ['Amazon', 'Congo', 'Sundarbans', 'Daintree'] },
  { mode: 'world_trivia', question: 'What is the national sport of Canada?', answers: ['Lacrosse', 'Basketball', 'Ice Hockey', 'Soccer'] },
  { mode: 'world_trivia', question: 'Which country is home to the kangaroo?', answers: ['Australia', 'New Zealand', 'South Africa', 'India'] },
  { mode: 'world_trivia', question: 'What is the capital city of Germany?', answers: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg'] }
];

// Seed Questions Function
async function seedQuestions() {
  try {
    console.log('Seeding questions...');
    const collectionRef = collection(db, 'questions');
    let questionIndex = 0; // Initialize question index

    for (const question of questions) {
      const questionToAdd = {
        ...question,
        questionIndex: questionIndex++, // Increment the question index
      };

      await addDoc(collectionRef, questionToAdd);
    }

    console.log('Questions seeded successfully!');
  } catch (error) {
    console.error('Error seeding questions:', error);
  }
}

// Run the seed function
//seedQuestions();

export { auth, db };