const socket = io();

let currentMessageDiv = null;
let currentSessionId = null;

// 生成会话ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 初始化新会话
function initNewSession() {
    currentSessionId = generateSessionId();
    const userId = localStorage.getItem('userId');
    return { sessionId: currentSessionId, userId };
}

// 发送消息生成图片
function generateImage() {
    const messageInput = document.getElementById('message-input');
    if (!messageInput) {
        console.error('Message input element not found');
        return;
    }

    const message = messageInput.value.trim();
    if (message) {
        // 如果是新对话，初始化会话ID
        if (!currentSessionId) {
            initNewSession();
        }
        
        appendMessage(message, true);
        socket.emit('generate image', {
            prompt: message,
            sessionId: currentSessionId,
            userId: localStorage.getItem('userId')
        });
        
        saveToHistory(message);
        messageInput.value = '';
        messageInput.disabled = true;
        currentMessageDiv = null;
    }
}

// 添加消息到聊天界面
function appendMessage(message, isUser = false) {
    const messagesDiv = document.getElementById('messages');
    if (!messagesDiv) {
        console.error('Messages container not found');
        return;
    }
    
    if (isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-user`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.style.backgroundImage = `url('${CONFIG.AVATAR_CONFIG.user}')`;
        messageDiv.appendChild(avatarDiv);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = message;
        
        messageDiv.appendChild(contentDiv);
        messagesDiv.appendChild(messageDiv);
    } else {
        if (!currentMessageDiv) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message message-ai';
            
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'message-avatar';
            avatarDiv.style.backgroundImage = `url('${CONFIG.AVATAR_CONFIG.ai}')`;
            messageDiv.appendChild(avatarDiv);
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            currentMessageDiv = contentDiv;
            
            if (message.type === 'image') {
                const img = document.createElement('img');
                img.src = message.url;
                img.alt = '生成的图片';
                contentDiv.appendChild(img);
            } else {
                contentDiv.textContent = message;
            }
            
            messageDiv.appendChild(contentDiv);
            messagesDiv.appendChild(messageDiv);
        }
    }
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Socket event listeners
socket.on('image generated', (data) => {
    if (data.url) {
        appendMessage({ type: 'image', url: data.url }, false);
    }
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.disabled = false;
    }
    currentMessageDiv = null;
});

socket.on('error', (data) => {
    appendMessage(`Error: ${data.message}`, false);
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.disabled = false;
    }
    currentMessageDiv = null;
});

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                generateImage();
            }
        });
    }
});

// 保存历史记录
function saveToHistory(message) {
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    
    // 检查是否存在当前会话的记录
    const existingChatIndex = history.findIndex(item => item.id === currentSessionId);
    
    if (existingChatIndex !== -1) {
        // 更新现有会话的消息
        history[existingChatIndex].messages.push({
            type: 'user',
            content: message
        });
        history[existingChatIndex].timestamp = new Date().toISOString();
    } else {
        // 创建新会话记录
        const newChat = {
            id: currentSessionId,
            title: message.slice(0, 20) + (message.length > 20 ? '...' : ''),
            timestamp: new Date().toISOString(),
            firstMessage: message,
            messages: [{
                type: 'user',
                content: message
            }]
        };
        history.unshift(newChat);
        
        // 限制历史记录数量
        if (history.length > CONFIG.maxHistoryItems) {
            history.pop();
        }
    }
    
    localStorage.setItem('chatHistory', JSON.stringify(history));
    loadChatHistory();
} 