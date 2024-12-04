我现在刚刚初始化了一个react项目。这个项目名字叫《哄麦达人》，本质上是一个ai聊天页面，用户会以对话的形式与最近很火的《再见爱人》综艺中的麦琳进行聊天，同时进行积分，当分数为0时用户失败，分数为10时用户胜利。

现在我希望使用react创建本项目，我希望这个项目清新美观，你可以自行决定使用什么ui框架，但是一定要美观。项目名称是《哄麦达人》，项目一共只有两个页面，一个是首页，包含一些简单的介绍和”开始哄她“的开始按钮，一旦点击开始，即丝滑地进入一个聊天页面。聊天界面需要一个对话框，和一个计分器，初始时是3分，满分是10分。当用户在聊天框中输入内容后，你需要调用一个post接口：localhost:8000/chat，将入参content：{用户输入的内容}传入。然后将流式输出ai大模型返回的内容，全部返回后格式如下：

{麦琳的回复语}

得分：{+-满意值增减}
满意值：{当前满意值}/10

你需要将ai返回的聊天内容展示在聊天框中，同时在流式接收完成输出后解析得分的增减与当前的满意度，并且根据分数变化和最终分数来变化前端的分数。当分数降低到0时，和增长到10时，要分别展示胜利和失败的界面。
用户的头像在static/li_avatar.png, 麦麦的头像在static/mai_avatar.png
麦麦的回复需要用类似打字机的效果流式展示，而不是一下全部展示完，后端接口返回格式如下：

data: {"content": "你"}
data: {"content": "好"}
data: {"content": "！"}
data: {"content": "很"}
data: {"content": "高"}
data: {"content": "兴"}
data: {"content": "见"}
data: {"content": "到"}
data: {"content": "你"}
data: {"content": "。"}
data: {"content": "\n\n"}
data: {"content": "得"}
data: {"content": "分"}
data: {"content": "："}
data: {"content": "+1"}
data: {"content": "\n"}
data: {"content": "满"}
data: {"content": "意"}
data: {"content": "值"}
data: {"content": "："}
data: {"content": "9/10"}
data: {"content": "", "score_change": 1, "final_score": 4}