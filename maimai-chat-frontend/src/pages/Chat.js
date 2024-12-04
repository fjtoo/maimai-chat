import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, message, Modal } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import './Chat.css';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [score, setScore] = useState(3);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  
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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = new TextDecoder().decode(value);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(5));
            if (data.content !== undefined) {
              aiResponse += data.content;
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
              setScore(prev => prev + data.score_change);
            }
          }
        }
      }
    } catch (error) {
      message.error('发送消息失败，请重试');
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (score <= 0) {
      Modal.error({
        title: '游戏失败',
        content: '很遗憾，麦麦对你完全失去了好感...',
        okText: '重新开始',
        onOk: () => window.location.href = '/'
      });
    } else if (score >= 10) {
      Modal.success({
        title: '恭喜胜利！',
        content: '你成功获得了麦麦的芳心！',
        okText: '返回首页',
        onOk: () => window.location.href = '/'
      });
    }
  }, [score]);

  return (
    <div className="chat-container">
      <div className="chat-window">
        <div className="score-display">
          当前好感度：{score}/10
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
          {isTyping && <div className="typing-indicator">麦麦正在输入...</div>}
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