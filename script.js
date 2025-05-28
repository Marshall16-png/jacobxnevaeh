// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBEr5eYI-YsrZJSxH2prLgwrOKY0i6ppM8",
  authDomain: "jacobxnevaehnewclient.firebaseapp.com",
  databaseURL: "https://jacobxnevaehnewclient-default-rtdb.firebaseio.com",
  projectId: "jacobxnevaehnewclient",
  storageBucket: "jacobxnevaehnewclient.appspot.com",
  messagingSenderId: "364940218084",
  appId: "1:364940218084:web:84fc9c3aeb0447911ae6f1"
};

// Init Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let username = localStorage.getItem("chat_username");
if (!username) {
  username = prompt("Enter your name:");
  localStorage.setItem("chat_username", username);
}

const messageInput = document.getElementById("messageInput");
const messagesDiv = document.getElementById("messages");
const emojiPicker = document.getElementById("emojiPicker");

const emojis = ["😀", "😂", "😍", "😢", "👍", "🔥", "😎", "😮"];
emojis.forEach(emoji => {
  const btn = document.createElement("button");
  btn.textContent = emoji;
  btn.onclick = () => insertEmoji(emoji);
  emojiPicker.appendChild(btn);
});

function toggleEmojiPicker() {
  emojiPicker.style.display = emojiPicker.style.display === "none" ? "block" : "none";
}

function insertEmoji(emoji) {
  messageInput.value += emoji;
  messageInput.focus();
}

function sendMessage() {
  const text = messageInput.value.trim();
  if (text !== "") {
    const message = {
      text,
      timestamp: Date.now(),
      user: username,
      reactions: {}
    };
    db.ref("messages").push(message);
    messageInput.value = "";
  }
}

function displayMessage(key, data) {
  const div = document.createElement("div");
  div.className = "message";
  const time = new Date(data.timestamp).toLocaleTimeString();
  div.innerHTML = `<strong>[${time}] ${data.user}:</strong> ${data.text}`;

  const reactionBar = document.createElement("span");
  reactionBar.className = "reaction-bar";
  ["👍", "😂", "😮"].forEach(emoji => {
    const reactionBtn = document.createElement("span");
    reactionBtn.textContent = emoji;
    reactionBtn.className = "reaction";
    reactionBtn.onclick = () => reactToMessage(key, emoji);
    reactionBar.appendChild(reactionBtn);

    // Live count display
    if (data.reactions && data.reactions[emoji]) {
      const count = document.createElement("small");
      count.textContent = ` (${data.reactions[emoji]})`;
      reactionBtn.appendChild(count);
    }
  });

  div.appendChild(reactionBar);
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function reactToMessage(key, emoji) {
  const reactionRef = db.ref(`messages/${key}/reactions/${emoji}`);
  reactionRef.transaction(current => (current || 0) + 1);
}

db.ref("messages").on("child_added", (snapshot) => {
  displayMessage(snapshot.key, snapshot.val());
});

db.ref("messages").on("child_changed", (snapshot) => {
  messagesDiv.innerHTML = "";
  db.ref("messages").once("value", (snapshot) => {
    snapshot.forEach(child => {
      displayMessage(child.key, child.val());
    });
  });
});

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});
