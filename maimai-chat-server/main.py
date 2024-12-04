from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import re
from openai import OpenAI
import json

app = FastAPI()

# 添加 CORS 中间件配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源，生产环境建议设置具体的域名
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有请求头
)

# OpenAI客户端配置
client = OpenAI(
    base_url='https://api.siliconflow.cn/v1',
    api_key='sk-mvukwxzejvtuzydcqkilbmjqjhlzsamtpfzsgslbkyoibopu'
)

class ChatMessage(BaseModel):
    content: str
    chat_history: Optional[List[dict]] = []

class ChatHistory:
    def __init__(self):
        self.history = []
        self.current_score = 3  # 初始满意值为3
    
    def add_message(self, role: str, content: str):
        self.history.append({"role": role, "content": content})
        if len(self.history) > 6:  # 保持最近3轮对话（6条消息）
            self.history = self.history[-6:]

chat_history = ChatHistory()

def parse_response(response: str) -> tuple:
    """解析模型响应，提取消息内容和分数变化"""
    score_pattern = r"得分：([+-]\d+)"
    score_match = re.search(score_pattern, response)
    
    message = response.split("\n得分：")[0] if "\n得分：" in response else response
    
    score_change = int(score_match.group(1)) if score_match else 0
    return message.strip(), score_change

async def generate_response(content: str, history: List[dict]):
    # 读取系统提示词
    with open("prompt.md", "r", encoding="utf-8") as f:
        system_prompt = f.read()
    
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": content})
    
    response = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-V2.5",
        messages=messages,
        stream=True
    )
    
    full_response = ""
    for chunk in response:
        if chunk.choices[0].delta.content:
            content = chunk.choices[0].delta.content
            full_response += content
            yield f"data: {json.dumps({'content': content})}\n\n"
    
    # 解析完整响应
    message, score_change = parse_response(full_response)
    chat_history.current_score = max(0, min(10, chat_history.current_score + score_change))
    
    # 添加到历史记录
    chat_history.add_message("user", content)
    chat_history.add_message("assistant", full_response)
    
    # 发送最终的评分信息
    yield f"data: {json.dumps({'content': '', 'score_change': score_change, 'final_score': chat_history.current_score})}\n\n"

@app.post("/chat")
async def chat_endpoint(message: ChatMessage):
    return StreamingResponse(
        generate_response(message.content, chat_history.history),
        media_type="text/event-stream"
    ) 