// 暂时注释掉 OpenAI
// const OpenAI = require("openai");
const { mockResponses, getRandomResponse } = require('../mockData');
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


    }

    async *chatCompletionStream(message) {
        console.log('message', message);
        try {
            const response = await fetch(`http://43.156.109.32:8080/ai/generateStream?sessionId=${message.sessionId}&message=${message.message}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let partialChunk = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                yield chunk;
            }

            // if (partialChunk) {
            //     yield partialChunk;
            // }
        } catch (error) {
            console.error('Error fetching stream:', error);
            throw error;
        }
    }

    async getPresetPrompts() {
        // http://43.156.109.32:8080/ai/queryPresetPrompts
        try {
            const response = await axios.get('http://43.156.109.32:8080/ai/queryPresetPrompts');
            return response.data;
        } catch (error) {
            console.error('Error fetching preset prompts:', error);
            throw error;
        }
    }




    // async *chatCompletionStream(message, userId) {
    //     try {
    //         const response = await axios({
    //             method: 'get',
    //             url: `http://43.156.109.32:8080/ai/generateStream?sessionId=${message.sessionId}&message=${message.message}`,
    //             responseType: 'stream'
    //         });

    //         // 使用 response.data 作为可读流
    //         for await (const chunk of response.data) {
    //             // 将 Buffer 转换为字符串

    //             const text = chunk.toString('utf-8');
    //             // 如果响应包含多行，按行分割
    //             const lines = text.split('\n').filter(line => line.trim());
    //             for (const line of lines) {
    //                 yield line;
    //             }
    //         }
    //     } catch (error) {
    //         console.error('Error fetching stream:', error);
    //         throw error;
    //     }
    // }
}

module.exports = new KimiAPI(); 