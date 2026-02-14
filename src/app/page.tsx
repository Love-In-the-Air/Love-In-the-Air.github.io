"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import Image from "next/image";

type Screen =
  | "overlay"
  | "wizard"
  | "greeting"
  | "build1"
  | "build2"
  | "chat"
  | "question"
  | "yes";

interface UserData {
  to: string;
  from: string;
  gender: string;
  msg: string;
}

function ValentineApp() {
  const searchParams = useSearchParams();
  const [screen, setScreen] = useState<Screen>("overlay");
  const [wizardStep, setWizardStep] = useState(1);
  const [senderName, setSenderName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [gender, setGender] = useState("female");
  const [customMessage, setCustomMessage] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showClickHint, setShowClickHint] = useState(false);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [noClickCount, setNoClickCount] = useState(0);
  const [noBtnStyle, setNoBtnStyle] = useState<React.CSSProperties>({});
  const [yesBtnScale, setYesBtnScale] = useState(1);
  const [pleaseGifScale, setPleaseGifScale] = useState(1);
  const [showPleaseGif, setShowPleaseGif] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; text: string; x: number; y: number }[]>([]);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [overlayText, setOverlayText] = useState("Ready to ask your Valentine? 💖");
  const [tapText, setTapText] = useState("Tap to create a custom surprise");
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [noHidden, setNoHidden] = useState(false);
  const [dancingGifs, setDancingGifs] = useState<{ id: number; side: "left" | "right"; visible: boolean }[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const floatingTextId = useRef(0);
  const dancerInterval = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProposalMode = useRef(false);
  const navigationEnabled = useRef(false);

  // Check if in proposal mode (URL has to & from params)
  useEffect(() => {
    const to = searchParams.get("to");
    const from = searchParams.get("from");
    if (to && from) {
      isProposalMode.current = true;
      const g = searchParams.get("gender") || "female";
      setUserData({
        to,
        from,
        gender: g,
        msg: searchParams.get("msg") || "",
      });
      if (g === "male") {
        setOverlayText("Hey Sir, There is a mail for you... 📩");
      } else {
        setOverlayText("Hey Ma'am, There is a mail for you... 📩");
      }
      setTapText("Tap to open 💌");
    }
  }, [searchParams]);

  const handleOverlayClick = useCallback(() => {
    if (screen !== "overlay") return;
    // Try to play music
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().then(() => {
        setIsMusicPlaying(true);
      }).catch(() => {});
    }
    setScreen("overlay"); // triggers fade
    setTimeout(() => {
      if (isProposalMode.current) {
        setScreen("greeting");
      } else {
        setScreen("wizard");
      }
    }, 500);
  }, [screen]);

  const toggleMusic = useCallback(() => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play();
      setIsMusicPlaying(true);
    }
  }, [isMusicPlaying]);

  // Greeting screen - show hint after delay
  useEffect(() => {
    if (screen === "greeting") {
      navigationEnabled.current = false;
      setShowClickHint(false);
      const timer = setTimeout(() => {
        setShowClickHint(true);
        navigationEnabled.current = true;
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // Build screens - show hint after delay
  useEffect(() => {
    if (screen === "build1" || screen === "build2") {
      navigationEnabled.current = false;
      setShowClickHint(false);
      const timer = setTimeout(() => {
        setShowClickHint(true);
        navigationEnabled.current = true;
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // Chat screen - populate messages
  useEffect(() => {
    if (screen === "chat" && userData) {
      navigationEnabled.current = false;
      setShowClickHint(false);
      setChatMessages([]);
      const messages = [
        "Hewwo... 🥺",
        "Can I ask something?",
        "It's impawtant...",
        userData.msg || "You mean the world to me.",
        "So...",
      ];
      let delay = 300;
      messages.forEach((msg, i) => {
        setTimeout(() => {
          setChatMessages((prev) => [...prev, msg]);
          if (i === messages.length - 1) {
            setTimeout(() => {
              setShowClickHint(true);
              navigationEnabled.current = true;
            }, 800);
          }
        }, delay);
        delay += 1500;
      });
    }
  }, [screen, userData]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Navigation handler for story screens
  const handleScreenClick = useCallback(() => {
    if (!navigationEnabled.current) return;
    navigationEnabled.current = false;
    if (screen === "greeting") setScreen("build1");
    else if (screen === "build1") setScreen("build2");
    else if (screen === "build2") setScreen("chat");
    else if (screen === "chat") setScreen("question");
  }, [screen]);

  // Key handler for Enter
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (screen === "overlay") {
          handleOverlayClick();
        } else if (["greeting", "build1", "build2", "chat"].includes(screen)) {
          handleScreenClick();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [screen, handleOverlayClick, handleScreenClick]);

  // Dancing gifs on yes screen
  useEffect(() => {
    if (screen === "yes") {
      let side: "left" | "right" = "left";
      let idCounter = 0;

      const showDancer = () => {
        const id = idCounter++;
        const currentSide = side;
        side = side === "left" ? "right" : "left";

        setDancingGifs((prev) => [...prev, { id, side: currentSide, visible: false }]);
        setTimeout(() => {
          setDancingGifs((prev) =>
            prev.map((g) => (g.id === id ? { ...g, visible: true } : g))
          );
        }, 100);
        setTimeout(() => {
          setDancingGifs((prev) =>
            prev.map((g) => (g.id === id ? { ...g, visible: false } : g))
          );
          setTimeout(() => {
            setDancingGifs((prev) => prev.filter((g) => g.id !== id));
            if (screen === "yes") {
              dancerInterval.current = setTimeout(showDancer, 100);
            }
          }, 500);
        }, 2000);
      };

      showDancer();
      return () => {
        if (dancerInterval.current) clearTimeout(dancerInterval.current);
      };
    }
  }, [screen]);

  // Confetti on yes screen
  useEffect(() => {
    if (screen === "yes") {
      const duration = 15000;
      const end = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const frame = () => {
        if (Date.now() > end) return;
        confetti({
          ...defaults,
          particleCount: 50,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
        });
        requestAnimationFrame(frame);
      };
      frame();
    }
  }, [screen]);

  // Wizard handlers
  const handleWizardNext = () => {
    if (wizardStep === 1 && !senderName.trim()) {
      alert("Enter your name 🐶");
      return;
    }
    if (wizardStep === 2 && !recipientName.trim()) {
      alert("Who is the lucky one? 🥺");
      return;
    }
    if (wizardStep < 4) {
      setWizardStep(wizardStep + 1);
    }
  };

  const handleWizardBack = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1);
    }
  };

  const handleGenerate = () => {
    if (!senderName.trim() || !recipientName.trim()) {
      alert("Fill everything pls!");
      return;
    }
    const url = new URL(window.location.href.split("?")[0]);
    url.searchParams.set("from", senderName.trim());
    url.searchParams.set("to", recipientName.trim());
    url.searchParams.set("gender", gender);
    if (customMessage.trim()) {
      url.searchParams.set("msg", customMessage.trim());
    }
    setShareUrl(url.toString());
    setWizardStep(5);
  };

  const shareWhatsApp = (text: string) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareTelegram = (url: string, text: string) => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const copyLink = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Link copied to clipboard! 📋✨");
    });
  };

  // No button handler
  const handleNoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const totalTexts = 9;
    if (noClickCount >= totalTexts) {
      setNoHidden(true);
      return;
    }

    const newCount = noClickCount + 1;
    setNoClickCount(newCount);

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const x = (Math.random() - 0.5) * (windowWidth * 0.8);
    const y = (Math.random() - 0.5) * (windowHeight * 0.8);

    const noScale = newCount > 3 ? Math.max(0.2, 1 - newCount * 0.1) : 1;
    setNoBtnStyle({
      transform: `translate(${x}px, ${y}px) scale(${noScale})`,
      position: "absolute",
      zIndex: 1500,
      transition: "all 0.2s ease",
    });

    setShowPleaseGif(true);
    setPleaseGifScale(1 + newCount * 0.2);
    setYesBtnScale(Math.min(1 + newCount * 0.4, 5));

    // Floating text
    const texts = [
      "Please 🥺",
      "Are you sure? 💔",
      "Think carefully… 🤔",
      "This is a limited-time offer. ⏳",
      "Non-refundable emotional investment. 📉",
      "I already practiced telling my mom 😭",
      "But we'd look so cute together! 🧸",
      "Don't break my heart! 💔",
      "Don't make me cry now... 🌊",
    ];
    const text = texts[Math.min(newCount - 1, texts.length - 1)];
    const id = floatingTextId.current++;

    // Calculate safe position
    const centerX = windowWidth / 2;
    const centerY = windowHeight / 2;
    const excludeW = Math.min(600, windowWidth * 0.8);
    const excludeH = Math.min(500, windowHeight * 0.6);
    let px: number, py: number, safe = false, attempts = 0;
    px = 20;
    py = 20;
    while (!safe && attempts < 50) {
      px = Math.random() * (windowWidth - 250) + 20;
      py = Math.random() * (windowHeight - 60) + 20;
      if (
        px + 200 > centerX - excludeW / 2 - 20 &&
        px < centerX + excludeW / 2 + 20 &&
        py + 40 > centerY - excludeH / 2 - 20 &&
        py < centerY + excludeH / 2 + 20
      ) {
        safe = false;
      } else {
        safe = true;
      }
      attempts++;
    }

    setFloatingTexts((prev) => [...prev, { id, text, x: px, y: py }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Yes button handler
  const handleYesClick = () => {
    setScreen("yes");
    setFloatingTexts([]);
  };

  const siteUrl = typeof window !== "undefined" ? window.location.origin + window.location.pathname.replace(/\/$/, "") : "";

  // Render screens
  return (
    <>
      {/* Background */}
      <div className="bg-gradient-valentine" />
      <div className="floating-hearts" />

      {/* Audio */}
      <audio ref={audioRef} loop preload="none">
        <source
          src="https://raw.githubusercontent.com/muhammederdem/mini-player/master/mp3/7.mp3"
          type="audio/mpeg"
        />
      </audio>

      {/* Overlay */}
      {screen === "overlay" && (
        <div className="overlay" onClick={handleOverlayClick}>
          <div className="text-center text-white p-8">
            <div className="text-7xl mb-6">💌</div>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "var(--font-nunito)" }}
              dangerouslySetInnerHTML={{ __html: overlayText }}
            />
            <p className="text-lg opacity-90">{tapText}</p>
          </div>
        </div>
      )}

      {/* Main App */}
      {screen !== "overlay" && (
        <div className="min-h-screen flex justify-center items-center relative overflow-hidden">
          {/* Wizard */}
          {screen === "wizard" && (
            <section className="container mx-auto px-4" style={{ maxWidth: 600, zIndex: 10 }}>
              <div className="glass-card text-center p-6 md:p-10">
                {/* Step 1: Sender Name */}
                {wizardStep === 1 && (
                  <div className="pt-5">
                    <h2 className="text-2xl font-bold mb-8" style={{ color: "var(--color-text-main)" }}>
                      First, what&apos;s your name? 🖊️
                    </h2>
                    <div className="mb-8">
                      <label className="block text-sm text-gray-500 mb-2 text-left">Your Name</label>
                      <input
                        type="text"
                        className="valentine-input"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleWizardNext()}
                        placeholder="Enter your name..."
                        autoFocus
                      />
                    </div>
                    <button className="btn-accent" onClick={handleWizardNext}>
                      Next →
                    </button>
                  </div>
                )}

                {/* Step 2: Recipient Name */}
                {wizardStep === 2 && (
                  <div className="pt-5">
                    <h2 className="text-2xl font-bold mb-8" style={{ color: "var(--color-text-main)" }}>
                      Who is this special person? 💖
                    </h2>
                    <div className="mb-8">
                      <label className="block text-sm text-gray-500 mb-2 text-left">Their Name</label>
                      <input
                        type="text"
                        className="valentine-input"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleWizardNext()}
                        placeholder="Enter their name..."
                        autoFocus
                      />
                    </div>
                    <div className="flex justify-center gap-3">
                      <button className="btn-outline" onClick={handleWizardBack}>Back</button>
                      <button className="btn-accent" onClick={handleWizardNext}>Next →</button>
                    </div>
                  </div>
                )}

                {/* Step 3: Gender */}
                {wizardStep === 3 && (
                  <div className="pt-5">
                    <h2 className="text-2xl font-bold mb-8" style={{ color: "var(--color-text-main)" }}>
                      Their pronouns/gender? ⚧
                    </h2>
                    <div className="flex justify-center gap-4 mb-8">
                      <div
                        className={`gender-card text-center w-36 ${gender === "male" ? "selected" : ""}`}
                        onClick={() => setGender("male")}
                      >
                        <div className="text-5xl mb-2">👨</div>
                        <div className="font-bold text-gray-500">He/Him</div>
                      </div>
                      <div
                        className={`gender-card text-center w-36 ${gender === "female" ? "selected" : ""}`}
                        onClick={() => setGender("female")}
                      >
                        <div className="text-5xl mb-2">👩</div>
                        <div className="font-bold text-gray-500">She/Her</div>
                      </div>
                    </div>
                    <div className="flex justify-center gap-3">
                      <button className="btn-outline" onClick={handleWizardBack}>Back</button>
                      <button className="btn-accent" onClick={handleWizardNext}>Next →</button>
                    </div>
                  </div>
                )}

                {/* Step 4: Message */}
                {wizardStep === 4 && (
                  <div className="pt-5">
                    <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-main)" }}>
                      Add a secret message? 💌
                    </h2>
                    <p className="text-gray-400 text-sm mb-6">(Optional) Appears during the chat sequence.</p>
                    <div className="mb-8">
                      <label className="block text-sm text-gray-500 mb-2 text-left">Your Message...</label>
                      <textarea
                        className="valentine-textarea"
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleGenerate();
                          }
                        }}
                        rows={4}
                        placeholder="Write something sweet..."
                      />
                    </div>
                    <div className="flex justify-center gap-3">
                      <button className="btn-outline" onClick={handleWizardBack}>Back</button>
                      <button className="btn-accent" onClick={handleGenerate}>Create Proposal 💖</button>
                    </div>
                  </div>
                )}

                {/* Step 5: Share */}
                {wizardStep === 5 && (
                  <div className="pt-5">
                    <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--color-text-main)" }}>
                      Your Love Letter is Ready! 💌
                    </h2>
                    <div className="flex justify-center mb-6">
                      <Image
                        src="/assets/pics/willYouBeMyValentine.jpg"
                        alt="Valentine"
                        width={120}
                        height={120}
                        className="rounded-full shadow-lg"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm text-gray-500 mb-2 text-left">Your Unique Link</label>
                      <input
                        type="text"
                        className="valentine-input text-sm"
                        value={shareUrl}
                        readOnly
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <button
                        className="btn-success-valentine"
                        onClick={() =>
                          shareWhatsApp(
                            `Hey ${recipientName}! I have a secret message for you... 🤫💌\nCheck it out here: ${shareUrl}`
                          )
                        }
                      >
                        📱 Send via WhatsApp
                      </button>
                      <button
                        className="btn-telegram"
                        onClick={() =>
                          shareTelegram(
                            shareUrl,
                            `Hey ${recipientName}! I have a secret message for you... 🤫💌`
                          )
                        }
                      >
                        ✈️ Send via Telegram
                      </button>
                      <button className="btn-secondary-valentine" onClick={() => copyLink(shareUrl)}>
                        📋 Copy Link
                      </button>
                      <button
                        className="btn-outline-accent"
                        onClick={() => {
                          if (shareUrl) window.location.href = shareUrl;
                        }}
                      >
                        🔗 Preview Proposal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Greeting Screen */}
          {screen === "greeting" && userData && (
            <section
              className="container mx-auto px-4 text-center cursor-pointer"
              style={{ maxWidth: 600, zIndex: 10 }}
              onClick={handleScreenClick}
            >
              <div className="mb-6">
                <Image
                  src="/assets/pics/hi.webp"
                  alt="Greeting"
                  width={300}
                  height={300}
                  className="rounded-full shadow-lg mx-auto"
                  style={{ objectFit: "fill" }}
                />
              </div>
              <h1
                className="text-5xl md:text-6xl font-bold fade-in-scale"
                style={{ color: "var(--color-text-main)" }}
              >
                Hi {userData.to} 💕
              </h1>
              {showClickHint && (
                <p className="mt-6 text-gray-400 text-sm bounce">
                  👇 Click anywhere to continue
                </p>
              )}
            </section>
          )}

          {/* Build Screen 1 */}
          {screen === "build1" && (
            <section
              className="container mx-auto px-4 text-center cursor-pointer"
              style={{ maxWidth: 600, zIndex: 10 }}
              onClick={handleScreenClick}
            >
              <div className="glass-card p-8 md:p-12">
                <div className="mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/gifs/shy.gif"
                    alt="Shy"
                    style={{ maxWidth: 300, borderRadius: 10 }}
                    className="mx-auto"
                  />
                </div>
                <p className="text-2xl font-bold" style={{ color: "var(--color-text-main)" }}>
                  I&apos;ve been wanting to tell you something…
                </p>
              </div>
              {showClickHint && (
                <p className="mt-6 text-gray-400 text-sm bounce">
                  👇 Click anywhere to continue
                </p>
              )}
            </section>
          )}

          {/* Build Screen 2 */}
          {screen === "build2" && (
            <section
              className="container mx-auto px-4 text-center cursor-pointer"
              style={{ maxWidth: 600, zIndex: 10 }}
              onClick={handleScreenClick}
            >
              <div className="glass-card p-8 md:p-12">
                <div className="mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/gifs/nervous.gif"
                    alt="Nervous"
                    style={{ maxWidth: 300, borderRadius: 10 }}
                    className="mx-auto"
                  />
                </div>
                <p className="text-xl text-gray-500">
                  But I needed a little courage first 😅
                </p>
              </div>
              {showClickHint && (
                <p className="mt-6 text-gray-400 text-sm bounce">
                  👇 Click anywhere to continue
                </p>
              )}
            </section>
          )}

          {/* Chat Screen */}
          {screen === "chat" && userData && (
            <section
              className="container mx-auto px-4 cursor-pointer"
              style={{ maxWidth: 500, zIndex: 10 }}
              onClick={handleScreenClick}
            >
              <div className="glass-card overflow-hidden">
                {/* Chat Header */}
                <div className="chat-header">
                  <div
                    className="rounded-full mr-3 border-2 border-white flex justify-center items-center bg-gray-100"
                    style={{ width: 45, height: 45, fontSize: 24 }}
                  >
                    {userData.gender === "male" ? "👩" : "👨"}
                  </div>
                  <div className="flex flex-col">
                    <h5
                      className="font-bold text-lg"
                      style={{ color: "var(--color-text-main)" }}
                    >
                      {userData.from}
                    </h5>
                    <span className="text-green-500 text-xs">
                      ● Online
                    </span>
                  </div>
                </div>
                {/* Chat Messages */}
                <div className="chat-container" ref={chatContainerRef}>
                  {chatMessages.map((msg, i) => (
                    <div key={i} className="chat-bubble bubble-right">
                      {msg}
                    </div>
                  ))}
                </div>
              </div>
              {showClickHint && (
                <p className="mt-4 text-center text-gray-400 text-sm bounce">
                  👇 Click anywhere to continue
                </p>
              )}
            </section>
          )}

          {/* Question Screen */}
          {screen === "question" && (
            <section
              className="container mx-auto px-4 text-center"
              style={{ maxWidth: 800, zIndex: 10 }}
            >
              <h1
                className="text-4xl md:text-6xl font-bold pulse-text text-shadow-pink mb-8"
                style={{ color: "var(--color-accent)" }}
              >
                Will you be my Valentine? 💖
              </h1>

              <div
                className="flex justify-center items-center gap-6 flex-wrap relative"
                style={{ minHeight: 200 }}
              >
                <button
                  className="yes-btn"
                  style={{
                    transform: `scale(${yesBtnScale})`,
                    zIndex: 1500,
                    transition: "transform 0.3s ease",
                  }}
                  onClick={handleYesClick}
                >
                  Yes 💘
                </button>
                <div className="relative">
                  {!noHidden && (
                    <button
                      className="no-btn"
                      style={noBtnStyle}
                      onClick={handleNoClick}
                    >
                      No 😢
                    </button>
                  )}
                </div>
              </div>

              {showPleaseGif && (
                <div className="flex flex-col items-center mt-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/gifs/please.gif"
                    alt="Please"
                    className="rounded shadow-lg"
                    style={{
                      width: 200,
                      height: 200,
                      objectFit: "cover",
                      transform: `scale(${pleaseGifScale})`,
                      transition: "transform 0.5s ease",
                    }}
                  />
                </div>
              )}

              {/* Floating texts */}
              {floatingTexts.map((ft) => (
                <div
                  key={ft.id}
                  className="pop-text"
                  style={{ left: ft.x, top: ft.y }}
                >
                  {ft.text}
                </div>
              ))}
            </section>
          )}

          {/* Yes Screen */}
          {screen === "yes" && userData && (
            <section
              className="container mx-auto px-4 text-center"
              style={{ maxWidth: 600, zIndex: 10 }}
            >
              <div className="glass-card border-accent p-8 md:p-12">
                <div className="mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/gifs/finish.gif"
                    alt="Celebration"
                    className="rounded shadow-lg mx-auto"
                    style={{ maxWidth: "100%", maxHeight: 200 }}
                  />
                </div>
                <h1
                  className="text-4xl md:text-5xl font-bold mb-4"
                  style={{ color: "var(--color-accent)" }}
                >
                  {userData.gender === "female" ? "She" : "He"} said YES 💍💖
                </h1>
                <p className="text-xl text-gray-500 mb-8">
                  - {userData.to} ❤️
                </p>

                {/* Share Answer */}
                <h5 className="font-bold mb-3">📢 Share Your Answer</h5>
                <div className="flex flex-col gap-2 max-w-md mx-auto mb-6">
                  <button
                    className="btn-success-valentine"
                    onClick={() =>
                      shareWhatsApp(
                        `I said YES to ${userData.from}! 💖\nSee for yourself: ${window.location.href}`
                      )
                    }
                  >
                    📱 Share via WhatsApp
                  </button>
                  <button
                    className="btn-telegram"
                    onClick={() =>
                      shareTelegram(
                        window.location.href,
                        `I said YES to ${userData.from}! 💖`
                      )
                    }
                  >
                    ✈️ Share via Telegram
                  </button>
                  <button
                    className="btn-secondary-valentine"
                    onClick={() => copyLink(window.location.href)}
                  >
                    📋 Copy Link
                  </button>
                </div>

                <hr className="my-6 border-gray-200" />

                {/* Share Site */}
                <h5 className="font-bold mb-3">
                  🎉 Let your friends have the fun! Share the site with them
                </h5>
                <div className="flex flex-col gap-2 max-w-md mx-auto">
                  <button
                    className="btn-success-valentine"
                    onClick={() =>
                      shareWhatsApp(
                        `Try this fun Valentine's Day page! Ask your special someone 💖\nCheck it out: ${siteUrl}`
                      )
                    }
                  >
                    📱 Share via WhatsApp
                  </button>
                  <button
                    className="btn-telegram"
                    onClick={() =>
                      shareTelegram(
                        siteUrl,
                        "Try this fun Valentine's Day page! Ask your special someone 💖"
                      )
                    }
                  >
                    ✈️ Share via Telegram
                  </button>
                  <button
                    className="btn-secondary-valentine"
                    onClick={() => copyLink(siteUrl)}
                  >
                    📋 Copy Link
                  </button>
                </div>
              </div>
              <a
                href={siteUrl}
                className="block mt-6 text-gray-400 text-sm hover:text-gray-600"
              >
                🔧 Customize Your Own
              </a>
            </section>
          )}

          {/* Footer */}
          <footer
            className="fixed bottom-0 left-1/2 -translate-x-1/2 mb-3 text-center"
            style={{ zIndex: 20 }}
          >
            <button
              className="bg-white rounded-full w-10 h-10 shadow-md mb-2 text-lg cursor-pointer hover:scale-110 transition-transform border-none"
              onClick={toggleMusic}
            >
              {isMusicPlaying ? "🔊" : "🎵"}
            </button>
            <div className="text-xs text-gray-400">
              <button
                className="bg-transparent border-none cursor-pointer text-gray-400 hover:text-gray-600"
                onClick={() => setShowPrivacy(true)}
              >
                Privacy
              </button>
              {" • "}
              <a
                href="https://github.com/Love-In-the-Air/Love-In-the-Air.github.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 no-underline"
              >
                GitHub
              </a>
            </div>
          </footer>

          {/* Dancing GIFs */}
          {dancingGifs.map((g) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={g.id}
              src="/assets/gifs/dance.gif"
              alt="Dancing"
              className="dancing-gif"
              style={{
                [g.side]: 20,
                opacity: g.visible ? 1 : 0,
              }}
            />
          ))}

          {/* Privacy Modal */}
          {showPrivacy && (
            <div className="modal-overlay" onClick={() => setShowPrivacy(false)}>
              <div
                className="glass-card p-8 text-center"
                style={{ maxWidth: 400 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold mb-4" style={{ color: "var(--color-text-main)" }}>
                  Privacy Policy 🛡️
                </h3>
                <p className="text-gray-500 mb-6">
                  We do not store any personal data. All customization is encoded in the URL itself.
                </p>
                <button className="btn-accent" onClick={() => setShowPrivacy(false)}>
                  Got it!
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex justify-center items-center">
          <div className="bg-gradient-valentine" />
          <div className="text-2xl">Loading... 💖</div>
        </div>
      }
    >
      <ValentineApp />
    </Suspense>
  );
}
