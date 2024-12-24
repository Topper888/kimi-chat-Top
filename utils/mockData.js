const mockResponses = {
    initial: "您好！我是您的助教。请问您是什么课程的老师呢？",
    responses: [
        `让我为您详细分析一下如何准备这门课程：

1. 课程导入部分：
   - 使用生活化的例子引入主题
   - 设计简短的问答环节激发学生兴趣
   - 通过多媒体材料创造情境

2. 核心内容讲解：
   - 将知识点分层次递进展开
   - 设计互动环节加深理解
   - 适时插入实践案例

3. 课堂活动设计：
   - 小组讨论与展示
   - 实践操作环节
   - 问题解决训练

4. 总结与延伸：
   - 知识点回顾与梳理
   - 布置具有创造性的作业
   - 提供延伸学习资源

您觉得这个思路怎么样？我们可以针对具体内容进一步细化。`,

        `基于您的描述，我建议从以下几个维度来优化教学设计：

1. 教学目标设定
   - 知识目标：明确学生需要掌握的核心概念
   - 能力目标：培养学生的实践和应用能力
   - 情感目标：激发学习兴趣和主动性

2. 教学策略选择
   - 采用探究式学习方法
   - 结合案例教学
   - 运用多媒体技术辅助

3. 教学活动安排
   - 课前预习任务布置
   - 课中互动环节设计
   - 课后延伸作业规划

4. 教学评价方式
   - 过程性评价与终结性评价相结合
   - 建立多元化的评价体系
   - 注重学生的自评与互评

需要我针对某个具体环节详细展开吗？`,

        `这是一个很好的问题！让我们系统地规划一下教学方案：

1. 前期准备
   - 分析学情，了解学生基础
   - 确定教学重难点
   - 准备教学资源

2. 课堂实施
   - 创设问题情境
   - 组织探究活动
   - 及时总结反馈

3. 教学评估
   - 设计评价标准
   - 收集学生反馈
   - 调整教学策略

您想要我详细说明哪个部分？`
    ]
};

// 模拟流式输出，将文本分成小块
function streamResponse(text) {
    // 按段落分割，保持格式
    const paragraphs = text.split('\n');
    return paragraphs.map(p => p.trim()).filter(p => p);
}

function getRandomResponse() {
    const response = mockResponses.responses[Math.floor(Math.random() * mockResponses.responses.length)];
    return streamResponse(response);
}

module.exports = {
    mockResponses,
    getRandomResponse,
    streamResponse
}; 