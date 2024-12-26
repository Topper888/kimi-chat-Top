
const socket = io();

// // 在 script 中使用 custom 字段
// const custom = <%- JSON.stringify(custom) %>;
// const custom = window.custom;
// console.log('custom:', custom);

// 创建 MarkdownIt 实例
const md = window.markdownit({
    highlight: true,
    linkify: true,
    typographer: true
});


// 在文件顶部添加配置
const CONFIG = {
    maxHistoryItems: 20,  // 最大历史记录数量
    AVATAR_CONFIG: {
        ai: 'https://api.dicebear.com/7.x/bottts/svg?seed=ai-assistant',
        user: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
    }
};

let currentMessageDiv = null;
let currentSessionId = null;  // 当前会话ID


const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-message');
// const chatMessages = document.getElementById('messages');

// 生成会话ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 初始化新会话
function initNewSession() {
    currentSessionId = generateSessionId();
    const userId = localStorage.getItem('userId');
    console.log('New session started:', { sessionId: currentSessionId, userId });
    return { sessionId: currentSessionId, userId };
}

// 添加 socket.id 存储逻辑
socket.on('session_init', (data) => {
    const { sessionId, userId } = data;
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('sessionId', data.sessionId);
    console.log('Received userId:', data);
});

function formatMessage(text) {
    // 首先将文本按段落分割，保留空行
    const sections = text.split(/\n\n+/);
    
    return sections.map(section => {
        // 处理标题
        if (section.startsWith('#')) {
            const level = section.match(/^#+/)[0].length;
            const title = section.replace(/^#+\s*/, '').trim();
            return `<h${level}>${title}</h${level}>`;
        }
        
        // 检查是否是列表
        if (section.match(/^[\d*-]\s+/m)) {
            const listItems = section.split(/\n/).filter(line => line.trim());
            const isNumbered = listItems[0].match(/^\d+\./);
            
            const formattedItems = listItems.map(item => {
                const indent = item.match(/^\s*/)[0].length;
                const cleanItem = item.replace(/^[\s\d*-]+/, '').trim();
                return `<li style="margin-left: ${indent}px">${cleanItem}</li>`;
            }).join('');
            
            return isNumbered ? `<ol>${formattedItems}</ol>` : `<ul>${formattedItems}</ul>`;
        }
        
        // 处理普通段落
        if (section.trim()) {
            let content = section;
            
            // 处理粗体
            content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            // 处理斜体
            content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
            
            // 处理代码块
            content = content.replace(/```([\s\S]*?)```/g, '<pre class="code-block">$1</pre>');
            
            return `<p>${content}</p>`;
        }
        
        return ''; // 返回空字符串处理空行
    }).join('\n');
}

function appendMessage(message, isUser = false, isLoading = false) {
    const messagesDiv = document.getElementById('messages');
    
    if (isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-user`;
        
        // 添加用户头像
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
            // if (isLoading) {
            //     currentMessageDiv.innerHTML = '<div class="spinner"></div>';
            // }
            messageDiv.appendChild(contentDiv);
            messagesDiv.appendChild(messageDiv);
        }

         if (message) {
            let currentText = currentMessageDiv.dataset.fullText || '';
            currentText += message;
            currentMessageDiv.dataset.fullText = currentText;
            
            // currentMessageDiv.textContent = currentText;

            if (md) {
                currentMessageDiv.innerHTML = md.render(currentText);
            } else {
                currentMessageDiv.innerHTML = formatMessage(currentText);
            }

        }
    }
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendMessage() {
    const message = messageInput.value.trim();
    
    if (message) {
        
        appendMessage(message, true);
        socket.emit('chat message', {
            message,
            sessionId: currentSessionId,
            userId: localStorage.getItem('userId')
        });

        
        // saveToHistory(message);
        messageInput.value = '';
        messageInput.disabled = true;
        currentMessageDiv = null;
    }
}


// Socket event listeners
socket.on('chat response', (data) => {
    if (data.message) {
        // 隐藏loading动画
        appendMessage(data.message, false);
    }
    if (data.done) {
        document.getElementById('message-input').disabled = false;
        currentMessageDiv = null;
    }
});

socket.on('error', (data) => {
    appendMessage(`Error: ${data.message}`, false);
    document.getElementById('message-input').disabled = false;
    currentMessageDiv = null;
});

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    loadChatHistory();
});

// 历史对话管
function toggleHistory() {
    const header = document.querySelector('.history-header');
    const list = document.getElementById('historyList');
    header.classList.toggle('collapsed');
    list.classList.toggle('collapsed');
}

// 加载历史对话
function loadChatHistory() {
    const historyList = document.getElementById('historyList');
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    
    historyList.innerHTML = history.map((item, index) => `
        <div class="history-item">
            <div class="history-item-content" onclick="loadChat('${item.id}')">
                <i class="fas fa-comment"></i>
                <span class="history-title" id="title_${item.id}">${item.title || `对话 ${index + 1}`}</span>
            </div>
            <div class="history-actions">
                <i class="fas fa-edit" onclick="editChatTitle('${item.id}')"></i>
                <i class="fas fa-trash" onclick="deleteChat('${item.id}')"></i>
            </div>
        </div>
    `).join('');
}

// 保存新对话到历史
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
        // 可选：更新最后一条消息的时间戳
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

// 编辑对话标题
function editChatTitle(chatId) {
    const titleElement = document.getElementById(`title_${chatId}`);
    const currentTitle = titleElement.textContent;
    const newTitle = prompt('请输入新的标题:', currentTitle);
    
    if (newTitle && newTitle.trim()) {
        const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        const chatIndex = history.findIndex(item => item.id === chatId);
        
        if (chatIndex !== -1) {
            history[chatIndex].title = newTitle.trim();
            localStorage.setItem('chatHistory', JSON.stringify(history));
            loadChatHistory();
        }
    }
}

// 删除对话
function deleteChat(chatId) {
    if (confirm('确定要删除这个对话吗？')) {
        const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        const newHistory = history.filter(item => item.id !== chatId);
        localStorage.setItem('chatHistory', JSON.stringify(newHistory));
        loadChatHistory();
    }
}

// 加载特定对话
function loadChat(chatId) {
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    const chat = history.find(item => item.id === chatId);
    
    if (chat) {
        // 清空当前对话
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML = '';
        currentMessageDiv = null;
        
        // 设置当前会话ID
        currentSessionId = chat.id;
        
        // 加载历史消息
        chat.messages.forEach(msg => {
            appendMessage(msg.content, msg.type === 'user');
        });
        
        // 高亮当前对话
        document.querySelectorAll('.history-item').forEach(item => {
            item.classList.remove('active');
            if (item.querySelector(`#title_${chatId}`)) {
                item.classList.add('active');
            }
        });
    }
}

// 将需要在HTML中调用的函数暴露给全局作用域
window.loadChat = loadChat;
window.editChatTitle = editChatTitle;
window.deleteChat = deleteChat;
