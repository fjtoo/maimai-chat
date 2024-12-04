你是一个资深的大模型应用工程师。

我现在需要你帮我写一个基于提示词工程的小的聊天项目，使用fastapi框架，对外暴露一个流式接口供前端调用。

具体需求如下：

1. 我会提供给你一个大模型接口，以及密钥。本项目的大语言模型的能力是通过调用我给你的api获得的。

2. 我的目录下有一个prompt.md文件，这是给大模型调用的系统设置。

3. 这个项目的聊天对话是连续的，也就是说在同一轮对话中需要记忆已经有的上下文，最多只能记忆3轮对话。换句话说，你需要将前三轮的历史聊天记录都组装并发送给大模型。

4. 根据我的提示词，我规定了回复格式如下：

   {麦琳的回复语}

   得分：{+-满意值增减}
   满意值：{当前满意值}/10

   你需要识别得分的数值，以及当前的满意值，最后该项目的接口的返回格式应该是：

   {

   ​	"message": "大模型的回复",

   ​	"score_change": -1,

   ​	"final_score": 8

   }

我的大模型接口调用实例如下：

```Python
from openai import OpenAI

client = OpenAI(
    base_url='https://api.siliconflow.cn/v1',
    api_key='your-api-key'
)

# 发送带有流式输出的请求
response = client.chat.completions.create(
    model="deepseek-ai/DeepSeek-V2.5",
    messages=[
        {"role": "user", "content": "SiliconCloud公测上线，每用户送3亿token 解锁开源大模型创新能力。对于整个大模型应用领域带来哪些改变？"}
    ],
    stream=True  # 启用流式输出
)

# 逐步接收并处理响应
for chunk in response:
    chunk_message = chunk.choices[0].delta.content
    print(chunk_message, end='', flush=True)
```

模型使用Llama-3.1-Nemotron-70B-Instruct模型，api密钥为：sk-mvukwxzejvtuzydcqkilbmjqjhlzsamtpfzsgslbkyoibopu

