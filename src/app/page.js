"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

export default function Home() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [topic, setTopic] = useState("What made you smile today?");

  const topics = [
    "What made you smile today?",
    "What was your favorite moment this week?",
    "What’s something you appreciate today?",
    "What’s a funny memory we share?",
    "If we could travel anywhere together where would we go?",
    "What’s something that inspires you lately?",
  ];

  const photos = [
    "/photos/dad-baby.jpeg",
    "/photos/kids-diner.jpeg",
    "/photos/dad-kids-night.jpeg",
    "/photos/dad-daughter-baby.jpeg",
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "messages"), orderBy("createdAt"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsubscribe();
  }, [user]);

  async function login(e) {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
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
      name: user.email,
      text: message,
      createdAt: serverTimestamp(),
    });

    setMessage("");
  }

  function randomTopic() {
    const random = topics[Math.floor(Math.random() * topics.length)];
    setTopic(random);
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-[#0c1020] border-4 border-purple-700 rounded-3xl p-6 w-full max-w-md text-white shadow-[8px_8px_0px_#000]">
          <h1 className="text-5xl font-black italic text-center mb-1">
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
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-black border-2 border-white/20"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-black border-2 border-white/20"
            />

            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl border-2 border-black">
              LOGIN
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black flex justify-center overflow-x-hidden">
      <div
        className="w-full max-w-[1024px] min-h-screen relative text-white"
        style={{
          background:
            "linear-gradient(180deg,#b40018 0%,#29003d 45%,#060606 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />

        <div className="relative z-10 px-3 py-4">
          <div className="flex justify-end mb-2">
            <button
              onClick={logout}
              className="bg-black/70 border border-white/20 px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>

          <div className="text-center mb-4">
            <h1
              className="text-5xl sm:text-6xl md:text-8xl font-black italic leading-none tracking-tight"
              style={{
                textShadow: "6px 6px 0px #000",
              }}
            >
              MEDINA
            </h1>

            <h2
              className="text-4xl sm:text-5xl md:text-7xl font-black italic text-red-500 -mt-1 md:-mt-2"
              style={{
                textShadow: "6px 6px 0px #000",
              }}
            >
              CONNECT ❤️
            </h2>

            <div className="inline-block mt-3 bg-yellow-300 text-black font-black px-4 py-2 border-4 border-black rotate-[-2deg] text-xs sm:text-sm md:text-base">
              NO MATTER WHERE LIFE TAKES US,
              <br />
              WE’RE ALWAYS CONNECTED BY LOVE. ❤️
            </div>
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
                tall
              />
            </div>

            <div className="space-y-4 pt-0 lg:pt-10">
              <Panel title="💬 DAILY TOPIC">
                <div className="bg-white text-black rounded-2xl border-4 border-black p-4 text-center text-lg sm:text-xl md:text-2xl font-black">
                  {topic}
                </div>

                <button
                  onClick={randomTopic}
                  className="mt-4 w-full bg-purple-700 hover:bg-purple-800 text-white text-lg sm:text-xl md:text-2xl font-black py-3 rounded-xl border-4 border-black"
                >
                  ⚡ NEW TOPIC
                </button>
              </Panel>

              <Panel title="💬 FAMILY CHAT">
                <div className="h-72 overflow-y-auto bg-black/80 border border-white/20 rounded-xl p-3 mb-3">
                  {messages.length === 0 && (
                    <p className="text-gray-400">No messages yet ❤️</p>
                  )}

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="border-b border-white/10 py-2"
                    >
                      <p className="font-black text-cyan-300">{msg.name}</p>
                      <p>{msg.text}</p>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={sendMessage}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_90px] gap-2"
                >
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="bg-black border-2 border-white/20 rounded-lg px-3 py-3 text-white"
                  />

                  <button className="bg-red-600 hover:bg-red-700 rounded-lg border-2 border-black font-black py-3">
                    SEND
                  </button>
                </form>
              </Panel>

              <Panel title="📚 PALABRA DEL DÍA">
                <div className="bg-black/70 border-2 border-purple-500 rounded-xl p-4">
                  <h3 className="text-4xl font-black text-yellow-300">
                    Familia
                  </h3>

                  <p className="text-white text-lg">Family</p>

                  <p className="italic text-gray-300 mt-2">
                    “Mi familia es mi corazón.”
                  </p>
                </div>
              </Panel>
            </div>

            <div className="space-y-4">
              <ComicPhoto src={photos[1]} label="BEST BUDDIES!" />

              <ComicPhoto
                src={photos[3]}
                label="LITTLE MEMORIES, BIG LOVE!"
                tall
              />
            </div>
          </div>

          <div className="mt-6 bg-white text-black font-black text-center py-3 border-4 border-black rotate-[-1deg] text-sm sm:text-base">
            ONE FAMILY. ONE HEART. ALWAYS CONNECTED. 💜
          </div>
        </div>
      </div>
    </main>
  );
}

function Panel({ title, children }) {
  return (
    <div className="bg-[#060814] border-4 border-purple-700 rounded-2xl p-4 shadow-[6px_6px_0px_#000]">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black italic mb-4">
        {title}
      </h2>

      {children}
    </div>
  );
}

function ComicPhoto({ src, label, tall }) {
  return (
    <div className="relative bg-white border-4 border-black p-2 rotate-[-2deg] shadow-[7px_7px_0px_#000]">
      <div
        className={`overflow-hidden ${
          tall ? "h-[360px] sm:h-[420px]" : "h-[300px] sm:h-[330px]"
        }`}
      >
        <img src={src} alt="" className="w-full h-full object-cover" />
      </div>

      <div className="absolute bottom-4 left-3 right-3 bg-white text-black border-4 border-black font-black text-center px-3 py-2 text-lg sm:text-2xl italic">
        {label} ❤️
      </div>
    </div>
  );
}