import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography } from 'antd';
import { HeartOutlined } from '@ant-design/icons';
import './Home.css';

const { Title, Paragraph } = Typography;

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="home-content">
        <div className="left-content">
          <Title level={1} className="title">
            <HeartOutlined className="heart-icon" />
            哄麦达人
          </Title>
          <div className="description">
            <Paragraph>
              一觉醒来，你变成了李行亮，你的老婆麦琳不知为何已经大发雷霆。
              你需要通过聊天来哄她开心，但你知道的，她可是出了名的难哄。
              但忍辱负重的你，还是决定试一试。
            </Paragraph>
            <Paragraph>
              初始满意度为3分，达到10分即可胜利，降到0分则游戏失败。
            </Paragraph>
            <Paragraph>
              加油，亮子。
            </Paragraph>
          </div>
          <Button 
            type="primary" 
            size="large"
            className="start-button"
            onClick={() => navigate('/chat')}
          >
            开始哄她
            <HeartOutlined />
          </Button>
        </div>
        <div className="right-content">
          <img 
            src="/static/mai_avatar.png" 
            alt="麦麦" 
            className="mai-image"
          />
        </div>
      </div>
    </div>
  );
}

export default Home; 