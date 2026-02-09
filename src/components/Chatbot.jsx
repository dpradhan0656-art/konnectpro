import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! 👋 I am Apna Bot. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // 🧠 AI BRAIN (Simple Logic)
  const getBotResponse = (text) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('hello') || lowerText.includes('hi')) return "Hello there! Need any service?";
    if (lowerText.includes('price') || lowerText.includes('cost')) return "Prices depend on the service. Please check the 'Services' page for Rate Cards.";
    if (lowerText.includes('book') || lowerText.includes('appointment')) return "You can book a service by clicking on any Category icon on the Home page.";
    if (lowerText.includes('contact') || lowerText.includes('number')) return "You can call our support at +91-98765-43210.";
    if (lowerText.includes('location') || lowerText.includes('city')) return "We are currently live in Jabalpur, MP!";
    if (lowerText.includes('thank')) return "You are welcome! Have a great day! 🌟";
    
    return "I am still learning! Please contact our support team for complex queries.";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // 1. User Message
    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // 2. Bot Typing Effect...
    setTimeout(() => {
      const botMsg = { id: Date.now() + 1, text: getBotResponse(input), sender: 'bot' };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* 🟢 CHAT WINDOW */}
      {isOpen && (
        <div className="bg-white width-80 sm:w-96 h-[450px] rounded-2xl shadow-2xl border border-gray-100 flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-primary p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Apna Assistant 🤖</h3>
                <p className="text-[10px] text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition">
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              placeholder="Ask something..." 
              className="flex-1 bg-gray-50 rounded-xl px-4 py-2 outline-none text-sm focus:ring-2 focus:ring-primary/20"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              className="bg-primary text-white p-2.5 rounded-xl hover:bg-blue-700 transition"
            >
              <Send size={18} />
            </button>
          </div>

        </div>
      )}

      {/* 🔴 FLOATING BUTTON (Trigger) */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-primary text-white p-4 rounded-full shadow-lg shadow-primary/40 hover:scale-110 transition-transform flex items-center justify-center group"
        >
          <MessageSquare size={28} className="group-hover:rotate-12 transition-transform" />
          {/* Notification Dot */}
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      )}

    </div>
  );
}
