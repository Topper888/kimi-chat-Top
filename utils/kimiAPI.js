// 暂时注释掉 OpenAI
// const OpenAI = require("openai");
const { mockResponses, getRandomResponse } = require('./mockData');
const axios = require('axios');

class KimiAPI {
    constructor() {
        // 暂时注释掉 OpenAI 客户端配置
        // this.client = new OpenAI({
        //     apiKey: process.env.MOONSHOT_API_KEY,
        //     baseURL: "https://api.moonshot.cn/v1",
        // });

        this.conversations = new Map();
        // 强制使用 mock 模式
        this.useMock = true;
    }

    async initializeTeacherChat(userId) {
        // 由于使用 mock 模式，可以注释掉原来的代码
        // if (this.useMock) {
            return mockResponses.initial;
        // }

        // const initialMessages = [
        //     {
        //         "role": "system",
        //         "content": "我是一个老师，现在你是助教老师，帮我一起备课。你需要先询问我是什么课程的老师，然后再问我是教什么内容的，再问我是什么学科有什么需求，然后来给到我备课思路。"
        //     },
        //     {
        //         "role": "assistant",
        //         "content": "您好！我是您的助教。请问您是什么课程的老师呢？"
        //     }
        // ];

        // this.conversations.set(userId, initialMessages);
        // return initialMessages[1].content;
    }

    // async chatCompletion(message, userId) {
    //     // 由于使用 mock 模式，可以注释掉原来的代码
    //     // if (this.useMock) {
    //         await new Promise(resolve => setTimeout(resolve, 1000));
    //         return getRandomResponse();
    //     // }

    //     // try {
    //     //     let messages = this.conversations.get(userId) || [
    //     //         {
    //     //             "role": "system",
    //     //             "content": "我是一个老师，现在你是助教老师，帮我一起备课。你需要先询问我是什么课程的老师，然后再问我是教什么内容的，再问我是什么学科有什么需求，然后来给到我���课思路。现在，请问我第一个问题。"
    //     //         }
    //     //     ];

    //     //     messages.push({ "role": "user", "content": message });

    //     //     const completion = await this.client.chat.completions.create({
    //     //         model: "moonshot-v1-8k",
    //     //         messages: messages,
    //     //         temperature: 0.3,
    //     //     });

    //     //     const assistantMessage = completion.choices[0].message;
    //     //     messages.push(assistantMessage);

    //     //     this.conversations.set(userId, messages);

    //     //     return assistantMessage.content;
    //     // } catch (error) {
    //     //     console.error('Kimi API Error:', error);
    //     //     throw error;
    //     // }
    // }

    async *chatCompletionStream(message, userId) {
        try {
            const response = await axios({
                method: 'get',
                url: `http://43.156.109.32:8080/ai/generateStream?sessionId=${message.sessionId}&message=${message.message}`,
                responseType: 'stream'
            });
           
            // 使用 response.data 作为可读流
            for await (const chunk of response.data) {
                // 将 Buffer 转换为字符串
                
                const text = chunk.toString('utf-8');
                console.log('response.data:', text);
                // 如果响应包含多行，按行分割
                const lines = text.split('\n').filter(line => line.trim());
                for (const line of lines) {
                    yield line;
                }
            }
        } catch (error) {
            console.error('Error fetching stream:', error);
            throw error;
        }
    }
}

module.exports = new KimiAPI(); 