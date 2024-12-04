import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, message, Modal } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import './Chat.css';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [score, setScore] = useState(3);
  const [isTyping, setIsTyping] = useState(false);
  const [shouldStopDisplay, setShouldStopDisplay] = useState(false);
  const chatEndRef = useRef(null);
  const [scoreChange, setScoreChange] = useState(null);
  
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = {
      content: inputValue,
      type: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: inputValue }),
      });

      const reader = response.body.getReader();
      let aiResponse = '';
      setShouldStopDisplay(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = new TextDecoder().decode(value);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(5));
            if (data.content !== undefined && !shouldStopDisplay) {
              if (data.content.includes('|')) {
                const [content] = data.content.split('|');
                aiResponse += content;
                setShouldStopDisplay(true);
              } else {
                aiResponse += data.content;
              }
              
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.type === 'ai') {
                  lastMessage.content = aiResponse;
                } else {
                  newMessages.push({ type: 'ai', content: aiResponse });
                }
                return newMessages;
              });
            }
            if (data.score_change !== undefined) {
              setScoreChange(data.score_change);
              setScore(prev => prev + data.score_change);
              setTimeout(() => setScoreChange(null), 1000);
            }
          }
        }
      }
    } catch (error) {
      message.error('发送消息失败，请重试');
    } finally {
      setIsTyping(false);
      setShouldStopDisplay(false);
    }
  };

  useEffect(() => {
    if (score <= 0) {
      Modal.confirm({
        icon: null,
        footer: null,
        closable: false,
        maskClosable: false,
        width: 460,
        centered: true,
        className: 'result-modal fail-modal',
        content: (
          <div style={{ 
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease-in-out'
          }}>
            <div style={{
              padding: '32px 24px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #fff0f0 0%, #fff5f5 100%)',
            }}>
              <img 
                src="/static/fail.png" 
                alt="失败" 
                style={{ 
                  width: '100%', 
                  maxWidth: '280px', 
                  marginBottom: '24px',
                  filter: 'drop-shadow(0 8px 24px rgba(255, 77, 79, 0.2))'
                }} 
              />
              <h2 style={{
                fontSize: '28px',
                color: '#ff4d4f',
                margin: '0 0 16px',
                fontWeight: 'bold'
              }}>游戏失败</h2>
              <p style={{
                fontSize: '16px',
                color: '#666',
                marginBottom: '32px',
                lineHeight: '1.6'
              }}>游戏失败。。</p>
              <button 
                onClick={() => window.location.href = '/'} 
                style={{
                  background: 'linear-gradient(45deg, #ff4d4f, #ff7875)',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '12px 36px',
                  fontSize: '16px',
                  color: 'white',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(255, 77, 79, 0.3)',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.target.style.transform = 'translateY(0)'}
              >
                重新开始
              </button>
            </div>
          </div>
        )
      });
    } else if (score >= 10) {
      Modal.confirm({
        icon: null,
        footer: null,
        closable: false,
        maskClosable: false,
        width: 460,
        centered: true,
        className: 'result-modal success-modal',
        content: (
          <div style={{ 
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease-in-out'
          }}>
            <div style={{
              padding: '32px 24px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #f6ffed 0%, #f0fce8 100%)',
            }}>
              <img 
                src="/static/success.png" 
                alt="成功" 
                style={{ 
                  width: '100%', 
                  maxWidth: '280px', 
                  marginBottom: '24px',
                  filter: 'drop-shadow(0 8px 24px rgba(82, 196, 26, 0.2))'
                }} 
              />
              <h2 style={{
                fontSize: '28px',
                color: '#52c41a',
                margin: '0 0 16px',
                fontWeight: 'bold'
              }}>恭喜通关！</h2>
              <p style={{
                fontSize: '16px',
                color: '#666',
                marginBottom: '32px',
                lineHeight: '1.6'
              }}>恭喜你通关了，麦麦原谅了你！<br/>世界上再也没有你哄不好的人了！</p>
              <button 
                onClick={() => window.location.href = '/'} 
                style={{
                  background: 'linear-gradient(45deg, #52c41a, #73d13d)',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '12px 36px',
                  fontSize: '16px',
                  color: 'white',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(82, 196, 26, 0.3)',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.target.style.transform = 'translateY(0)'}
              >
                返回首页
              </button>
            </div>
          </div>
        )
      });
    }
  }, [score]);

  return (
    <div className="chat-container">
      <div className="chat-window">
        <div className="score-display">
          当前满意度：
          <span className="score-number">{score}</span>/10
          {scoreChange !== null && (
            <span className={`score-change ${scoreChange > 0 ? 'positive' : 'negative'}`}>
              {scoreChange > 0 ? `+${scoreChange}` : scoreChange}
            </span>
          )}
        </div>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              <img 
                src={msg.type === 'user' ? '/static/li_avatar.png' : '/static/mai_avatar.png'} 
                alt={msg.type === 'user' ? '李行亮' : '麦麦'} 
                className="avatar"
              />
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))}
          {/* {isTyping && <div className="typing-indicator">麦麦正在输入...</div>} */}
          <div ref={chatEndRef} />
        </div>
        <div className="chat-input">
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onPressEnter={handleSend}
            placeholder="输入你想说的话..."
            disabled={isTyping}
          />
          <Button 
            type="primary" 
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={isTyping}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Chat; 