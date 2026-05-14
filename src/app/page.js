"use client";

import { useEffect, useState, useRef } from "react";
import { db, auth } from "../lib/firebase";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

const profiles = {
  "dad@medinaconnect.com": {
    name: "Dad",
    avatar: "/photos/dad-baby.jpeg",
  },

  "isaak@medinaconnect.com": {
    name: "Isaak",
    avatar: "/photos/kids-diner.jpeg",
  },

  "rachel@medinaconnect.com": {
    name: "Rachel",
    avatar: "/photos/dad-daughter-baby.jpeg",
  },
};

const spanishWords = [
  {
    word: "Familia",
    meaning: "Family",
    example: "Mi familia es mi corazón.",
  },

  {
    word: "Amor",
    meaning: "Love",
    example: "El amor nos mantiene unidos.",
  },

  {
    word: "Siempre",
    meaning: "Always",
    example: "Siempre estoy contigo.",
  },
];

const weeklyChallenges = [
  {
    title: "Try Something New",
    task: "Try a new food, song, show, or activity this week.",
    followUp: "Tell the family what you thought.",
  },

  {
    title: "Kindness Mission",
    task: "Do one kind thing this week.",
    followUp: "Share what happened.",
  },
];

function getDailySpanishWord() {
  const today = new Date();

  return spanishWords[
    today.getDate() % spanishWords.length
  ];
}

function getWeeklyChallenge() {
  const today = new Date();

  return weeklyChallenges[
    today.getDay() % weeklyChallenges.length
  ];
}

export default function Home() {
  const [user, setUser] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [chismeText, setChismeText] = useState("");
  const [chismePosts, setChismePosts] = useState([]);

  const [topic, setTopic] = useState(
    "What made you smile today?"
  );

  const messagesEndRef = useRef(null);

  const dailyWord = getDailySpanishWord();
  const weeklyChallenge = getWeeklyChallenge();

  const topics = [
    "What made you smile today?",
    "What was your favorite part of this week?",
    "What’s something you appreciate today?",
  ];

  const photos = [
    "/photos/dad-baby.jpeg",
    "/photos/kids-diner.jpeg",
    "/photos/dad-kids-night.jpeg",
    "/photos/dad-daughter-baby.jpeg",
  ];

  const currentProfile = user
    ? profiles[user.email]
    : null;

  const isDad =
    user?.email === "dad@medinaconnect.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "messages"),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
      );
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "chismePosts"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChismePosts(
        snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
      );
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  function formatTimestamp(timestamp) {
    if (!timestamp?.seconds) return "";

    const date = new Date(timestamp.seconds * 1000);

    return date.toLocaleString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      month: "numeric",
      day: "numeric",
    });
  }

  async function login(e) {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
    } catch {
      alert("Login failed");
    }
  }

  async function logout() {
    await signOut(auth);
  }

  async function sendMessage(e) {
    e.preventDefault();

    if (!message.trim()) return;

    await addDoc(collection(db, "messages"), {
      name: currentProfile?.name,
      avatar: currentProfile?.avatar,
      text: message,
      createdAt: serverTimestamp(),
    });

    setMessage("");
  }

  async function createChismePost(e) {
    e.preventDefault();

    if (!chismeText.trim()) return;

    await addDoc(collection(db, "chismePosts"), {
      name: currentProfile?.name,
      avatar: currentProfile?.avatar,
      text: chismeText,
      createdAt: serverTimestamp(),
    });

    setChismeText("");
  }

  async function clearChat() {
    if (!isDad) return;

    const snapshot = await getDocs(
      collection(db, "messages")
    );

    const deletePromises = snapshot.docs.map(
      (messageDoc) =>
        deleteDoc(doc(db, "messages", messageDoc.id))
    );

    await Promise.all(deletePromises);
  }

  function randomTopic() {
    const random =
      topics[Math.floor(Math.random() * topics.length)];

    setTopic(random);
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-[#0c1020] border-4 border-purple-700 rounded-3xl p-6 w-full max-w-md text-white">
          <h1 className="text-5xl font-black italic text-center">
            MEDINA
          </h1>

          <h2 className="text-4xl font-black italic text-center text-red-500 mb-6">
            CONNECT ❤️
          </h2>

          <form onSubmit={login} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full p-3 rounded-xl bg-black border-2 border-white/20"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full p-3 rounded-xl bg-black border-2 border-white/20"
            />

            <button className="w-full bg-red-600 text-white font-black py-3 rounded-xl">
              LOGIN
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black flex justify-center overflow-x-hidden">
      <div className="w-full max-w-[1024px] text-white p-4">

        <div className="flex justify-between items-center mb-3">

          <div className="flex items-center gap-2 bg-black/70 border border-white/20 px-3 py-2 rounded-lg">
            <img
              src={currentProfile?.avatar}
              alt=""
              className="w-8 h-8 rounded-full object-cover border-2 border-white"
            />

            <span className="font-black">
              {currentProfile?.name}
            </span>
          </div>

          <button
            onClick={logout}
            className="bg-black/70 border border-white/20 px-4 py-2 rounded-lg"
          >
            Logout
          </button>

        </div>

        <div className="text-center mb-6">

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black italic">
            MEDINA
          </h1>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black italic text-red-500">
            CONNECT ❤️
          </h2>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-4">

          <div className="space-y-4">

            <ComicPhoto
              src={photos[0]}
              label="FAMILY IS MY SUPERPOWER!"
            />

            <ComicPhoto
              src={photos[2]}
              label="TOGETHER WE CAN DO ANYTHING!"
            />

          </div>

          <div className="space-y-4">

            <Panel title="💬 DAILY TOPIC">

              <div className="bg-white text-black rounded-xl p-4 text-center font-black text-xl">
                {topic}
              </div>

              <button
                onClick={randomTopic}
                className="mt-4 w-full bg-purple-700 text-white py-3 rounded-xl font-black"
              >
                ⚡ NEW TOPIC
              </button>

            </Panel>

            <Panel title="⚡ WEEKLY CHALLENGE">

              <div className="bg-yellow-300 text-black rounded-xl p-4">

                <h3 className="font-black text-2xl">
                  {weeklyChallenge.title}
                </h3>

                <p>{weeklyChallenge.task}</p>

                <p className="italic mt-2">
                  {weeklyChallenge.followUp}
                </p>

              </div>

            </Panel>

            <Panel title="📣 FAMILY CHISME">

              <form
                onSubmit={createChismePost}
                className="space-y-3 mb-4"
              >

                <textarea
                  value={chismeText}
                  onChange={(e) =>
                    setChismeText(e.target.value)
                  }
                  placeholder="Share family chisme..."
                  className="w-full min-h-[100px] bg-black border-2 border-white/20 rounded-xl p-3 text-white"
                />

                <button className="w-full bg-yellow-300 text-black py-3 rounded-xl font-black">
                  POST CHISME
                </button>

              </form>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">

                {chismePosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-black/70 border border-white/20 rounded-xl p-3"
                  >

                    <div className="flex items-center gap-2 mb-2">

                      <img
                        src={post.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />

                      <p className="font-black text-yellow-300">
                        {post.name}
                      </p>

                    </div>

                    <p>{post.text}</p>

                    <p className="text-xs text-gray-400 mt-2">
                      {formatTimestamp(post.createdAt)}
                    </p>

                  </div>
                ))}

              </div>

            </Panel>

            <Panel title="💬 FAMILY CHAT">

              {isDad && (
                <button
                  onClick={clearChat}
                  className="mb-3 w-full bg-red-700 py-2 rounded-xl font-black"
                >
                  CLEAR CHAT
                </button>
              )}

              <div className="h-72 overflow-y-auto bg-black/70 rounded-xl p-3 mb-3 space-y-3">

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex gap-3"
                  >

                    <img
                      src={msg.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />

                    <div>

                      <p className="font-black text-cyan-300">
                        {msg.name}
                      </p>

                      <p>{msg.text}</p>

                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimestamp(msg.createdAt)}
                      </p>

                    </div>

                  </div>
                ))}

                <div ref={messagesEndRef} />

              </div>

              <form
                onSubmit={sendMessage}
                className="grid grid-cols-1 sm:grid-cols-[1fr_90px] gap-2"
              >

                <input
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  placeholder="Type a message..."
                  className="bg-black border-2 border-white/20 rounded-lg px-3 py-3 text-white"
                />

                <button className="bg-red-600 rounded-lg font-black py-3">
                  SEND
                </button>

              </form>

            </Panel>

            <Panel title="📚 PALABRA DEL DÍA">

              <div className="bg-black/70 rounded-xl p-4">

                <h3 className="text-4xl font-black text-yellow-300">
                  {dailyWord.word}
                </h3>

                <p>{dailyWord.meaning}</p>

                <p className="italic mt-2">
                  "{dailyWord.example}"
                </p>

              </div>

            </Panel>

          </div>

          <div className="space-y-4">

            <ComicPhoto
              src={photos[1]}
              label="BEST BUDDIES!"
            />

            <ComicPhoto
              src={photos[3]}
              label="LITTLE MEMORIES, BIG LOVE!"
            />

          </div>

        </div>

      </div>
    </main>
  );
}

function Panel({ title, children }) {
  return (
    <div className="bg-[#060814] border-4 border-purple-700 rounded-2xl p-4">

      <h2 className="text-3xl font-black italic mb-4">
        {title}
      </h2>

      {children}

    </div>
  );
}

function ComicPhoto({ src, label }) {
  return (
    <div className="bg-white border-4 border-black p-2">

      <img
        src={src}
        alt=""
        className="w-full h-[340px] object-cover"
      />

      <div className="bg-white text-black border-4 border-black font-black text-center px-3 py-2 text-xl italic mt-2">
        {label} ❤️
      </div>

    </div>
  );
}