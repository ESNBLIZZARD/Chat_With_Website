import { useState, useRef, useEffect } from "react";

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Check for saved theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  // Save theme preference when it changes
  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  async function uploadWebsite() {
    if (!url.trim()) return alert("Please enter a valid website URL");

    setScraping(true);
    setUploadSuccess(false);

    try {
      const res = await fetch("http://localhost:3000/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to scrape website");
      }

      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error("SCRAPE ERROR", err);
      alert("❌ Error: " + err.message);
    }

    setScraping(false);
  }

  async function sendMessage(e) {
    e?.preventDefault();
    const q = input.trim();
    if (!q) return;

    const userMsg = { sender: "You", text: q };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      const botMsg = {
        sender: "Assistant",
        text: data.answer,
        sources: data.sources,
      };

      setMessages((m) => [...m, botMsg]);
    } catch (err) {
      console.error("ASK ERROR", err);
      setMessages((m) => [
        ...m,
        { sender: "Assistant", text: "Sorry — something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      darkMode 
        ? 'bg-linear-to-br from-gray-900 via-purple-900 to-gray-900' 
        : 'bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50'
    }`}>
      <div className={`w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-300 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`} style={{ height: '90vh', maxHeight: '900px' }}>
        
        {/* Header */}
        <div className={`p-6 transition-colors duration-300 ${
          darkMode 
            ? 'bg-linear-to-r from-purple-900 to-indigo-900' 
            : 'bg-linear-to-r from-indigo-600 to-purple-600'
        } text-white`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Website Q&A Assistant</h1>
                <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-indigo-100'}`}>
                  Upload a website and ask questions about its content
                </p>
              </div>
            </div>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all backdrop-blur-sm"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Upload Section */}
        <div className={`p-6 border-b transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-900 border-gray-700' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className={`w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={scraping}
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all disabled:cursor-not-allowed ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 disabled:bg-gray-700' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 disabled:bg-gray-100'
                }`}
              />
            </div>
            <button
              onClick={uploadWebsite}
              disabled={scraping || !url.trim()}
              className={`px-6 py-3 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                darkMode 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white`}
            >
              {scraping ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Indexing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload
                </>
              )}
            </button>
          </div>
          
          {uploadSuccess && (
            <div className={`mt-3 p-3 border rounded-lg flex items-center gap-2 animate-[slideDown_0.3s_ease-out] ${
              darkMode 
                ? 'bg-green-900/30 border-green-700 text-green-300' 
                : 'bg-green-50 border-green-200 text-green-800'
            }`}>
              <svg className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Website indexed successfully!</span>
            </div>
          )}
        </div>

        {/* Messages */}
        <div ref={messagesRef} className={`flex-1 overflow-y-auto p-6 space-y-4 transition-colors duration-300 ${
          darkMode 
            ? 'bg-linear-to-b from-gray-800 to-gray-900' 
            : 'bg-linear-to-b from-white to-gray-50'
        }`}>
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                darkMode 
                  ? 'bg-linear-to-br from-purple-900 to-indigo-900' 
                  : 'bg-linear-to-br from-indigo-100 to-purple-100'
              }`}>
                <svg className={`w-10 h-10 ${darkMode ? 'text-purple-300' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Start a conversation
              </h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                Upload a website above and ask questions about its content
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === "You" ? "justify-end" : "justify-start"} animate-[fadeIn_0.3s_ease-out]`}>
              <div className={`max-w-[75%] ${m.sender === "You" ? "order-2" : "order-1"}`}>
                <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                  m.sender === "You"
                    ? darkMode 
                      ? "bg-linear-to-br from-purple-600 to-indigo-600 text-white rounded-br-sm"
                      : "bg-linear-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm"
                    : darkMode
                      ? "bg-gray-700 border border-gray-600 text-gray-100 rounded-bl-sm"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                }`}>
                  <div className={`text-xs font-semibold mb-1 uppercase tracking-wide ${
                    m.sender === "You" 
                      ? darkMode ? "text-purple-200" : "text-indigo-200"
                      : darkMode ? "text-purple-400" : "text-indigo-600"
                  }`}>
                    {m.sender}
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</div>
                  
                  {m.sources?.length > 0 && (
                    <div className={`mt-3 pt-3 border-t flex flex-wrap items-center gap-2 text-xs ${
                      darkMode ? 'border-purple-500/30' : 'border-indigo-400/20'
                    }`}>
                      <svg className={`w-4 h-4 ${darkMode ? 'text-purple-300' : 'text-indigo-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span className={`font-semibold ${darkMode ? 'text-purple-200' : 'text-indigo-200'}`}>Sources:</span>
                      {m.sources.map((s, j) => (
                        <a
                          key={j}
                          href={s}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded-md transition-colors backdrop-blur-sm"
                        >
                          {new URL(s).hostname}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Composer */}
        <div className={`p-4 border-t transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !loading && input.trim()) {
                  sendMessage(e);
                }
              }}
              placeholder={loading ? "Thinking..." : "Ask a question..."}
              disabled={loading}
              className={`flex-1 px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all disabled:cursor-not-allowed ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 disabled:bg-gray-600' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 disabled:bg-gray-100'
              }`}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className={`w-12 h-12 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                darkMode 
                  ? 'bg-linear-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700' 
                  : 'bg-linear-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
              } text-white`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}