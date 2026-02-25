import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, MessageCircle } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! ?? Welcome to Kshatr. How can I help you regarding Home Services?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // ?? AI BRAIN (Updated for Kshatr)
  const getBotResponse = (text) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('hello') || lowerText.includes('hi')) return "Hello! Need an Electrician, Plumber, or AC Repair?";
    if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('rate')) return "Our visiting charges start from ?199 only. Final price depends on the work.";
    if (lowerText.includes('book') || lowerText.includes('service')) return "You can book easily by clicking the 'Book Now' button on any service card.";
    if (lowerText.includes('contact') || lowerText.includes('call')) return "You can call us directly or click the WhatsApp button below.";
    if (lowerText.includes('job') || lowerText.includes('join')) return "For joining as an Expert, please visit our 'Join as Partner' page.";
    
    return "I am an AI. For detailed help, please chat with us on WhatsApp directly! ??";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // 1. User Message
    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    
    // Capture input for bot logic before clearing
    const userText = input; 
    setInput('');

    // 2. Bot Typing Effect...
    setTimeout(() => {
      const botMsg = { id: Date.now() + 1, text: getBotResponse(userText), sender: 'bot' };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* ?? CHAT WINDOW */}
      {isOpen && (
        <div className="bg-white w-80 sm:w-96 h-[450px] rounded-2xl shadow-2xl border border-gray-200 flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header - Changed bg-primary to bg-slate-900 (Dark Theme) */}
          <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/10 p-1.5 rounded-full border border-white/20">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Kshatr AI ??</h3>
                <p className="text-[10px] text-blue-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition">
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-700 border border-gray-200 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Direct WhatsApp Help Link inside Chat */}
            {messages.length > 2 && (
                 <div className="flex justify-center mt-2">
                    <a 
                        href="https://wa.me/919876543210?text=Hello Kshatr, I need help." 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-200 transition"
                    >
                        <MessageCircle size={12}/> Chat with Human on WhatsApp
                    </a>
                 </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              placeholder="Ask about service..." 
              className="flex-1 bg-gray-100 rounded-xl px-4 py-2 outline-none text-sm focus:ring-2 focus:ring-blue-500/20 text-black"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
            >
              <Send size={18} />
            </button>
          </div>

        </div>
      )}

      {/* ?? FLOATING BUTTON (Trigger) */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-xl shadow-blue-600/40 hover:scale-110 transition-transform flex items-center justify-center group relative"
        >
          <MessageSquare size={28} className="group-hover:rotate-12 transition-transform" />
          {/* Notification Dot */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-bounce"></span>
        </button>
      )}

    </div>
  );
}