import React, { useState, useRef, useEffect } from 'react';
import apiClient from '../api/apiClient';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am EcoAssistant, your sustainability chatbot. How can I help you reduce your carbon footprint today?',
      isContextual: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    const query = input.trim();
    if (!query) return;

    // Append user query to list
    const userMsgId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: 'user', text: query },
    ]);
    setInput('');
    setLoading(true);

    try {
      const response = await apiClient.post('/chat', { message: query });
      const data = response.data || {};
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'assistant',
          text: data.response || "I'm sorry, I couldn't process that query.",
          isContextual: data.isContextual ?? false,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'assistant',
          text: 'Failed to communicate with EcoAssistant. Please check your connection and try again.',
          isContextual: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notranslate" translate="no" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
      {/* FLOATING ACTION TRIGGER */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary-color), #34d399)',
          border: 'none',
          color: '#ffffff',
          fontSize: '1.8rem',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08) rotate(5deg)';
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(16, 185, 129, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.4)';
        }}
        title="Chat with EcoAssistant"
      >
        {isOpen ? '❌' : '💬'}
      </button>

      {/* CONVERSATION OVERLAY WINDOW */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '4.5rem',
            right: 0,
            width: 'calc(100vw - 4rem)',
            maxWidth: '360px',
            height: '480px',
            background: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.2rem 1.5rem',
              background: 'linear-gradient(135deg, var(--primary-color), #34d399)',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.3rem' }}>🤖</span>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', letterSpacing: '0.02em' }}>EcoAssistant</h4>
                <span style={{ fontSize: '0.72rem', opacity: 0.9, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}></span>
                  Active AI Agent
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '1.2rem', cursor: 'pointer', opacity: 0.8 }}
            >
              &times;
            </button>
          </div>

          {/* Messages list */}
          <div
            style={{
              flex: 1,
              padding: '1.2rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              background: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    gap: '0.35rem',
                  }}
                >
                  <div
                    style={{
                      padding: '0.75rem 1.1rem',
                      borderRadius: isUser ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                      background: isUser
                        ? 'linear-gradient(135deg, var(--primary-color), #34d399)'
                        : 'var(--surface-color)',
                      color: isUser ? '#ffffff' : 'var(--text-primary)',
                      fontSize: '0.85rem',
                      fontWeight: isUser ? '600' : '500',
                      lineHeight: '1.45',
                      boxShadow: 'var(--shadow-sm)',
                      border: isUser ? 'none' : '1px solid var(--border-color)',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {msg.text}
                  </div>
                  
                  {/* Context Indicator Badge */}
                  {!isUser && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '6px',
                        background: msg.isContextual ? 'rgba(74, 222, 128, 0.15)' : 'rgba(0, 0, 0, 0.05)',
                        color: msg.isContextual ? 'var(--primary-color)' : 'var(--text-light)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                      }}
                    >
                      {msg.isContextual ? '✨ Context Aware' : '🌐 General Info'}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Bouncing dots loading indicator */}
            {loading && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div
                  style={{
                    padding: '0.75rem 1.2rem',
                    borderRadius: '18px 18px 18px 2px',
                    background: 'var(--surface-color)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <div className="dot" style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.32s' }} />
                  <div className="dot" style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.16s' }} />
                  <div className="dot" style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form
            onSubmit={handleSend}
            style={{
              padding: '0.8rem 1rem',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--surface-color)',
              display: 'flex',
              gap: '0.6rem',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              placeholder="Ask EcoAssistant..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.6rem 1rem',
                borderRadius: '14px',
                border: '1.5px solid var(--border-color)',
                outline: 'none',
                fontSize: '0.85rem',
                background: 'rgba(255,255,255,0.7)',
                color: 'var(--text-primary)',
                transition: 'border-color 0.25s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-color), #34d399)',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
                transition: 'all 0.25s ease',
                opacity: input.trim() ? 1 : 0.6,
              }}
            >
              ➔
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
