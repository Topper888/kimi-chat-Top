
const socket = io();

// // 在 script 中使用 custom 字段

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
const chatPrompType = document.getElementById('chat-promp-type');
const editCursorPointer = document.getElementById('edit-cursor-pointer');
// const chatMessages = document.getElementById('messages');

// 生成会话ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 初始化新会话
function initNewSession() {
    // currentSessionId = generateSessionId();
    const userId = localStorage.getItem('userId');
    const sessionId = localStorage.getItem('sessionId');
    const queryPromptsShow = localStorage.getItem('queryPromptsShow');
    console.log('New session started:', { sessionId: currentSessionId, userId });
    return { sessionId: sessionId, userId, queryPromptsShow };
}

// 添加 socket.id 存储逻辑
socket.on('session_init', (data) => {
    const { sessionId, userId, queryPromptsShow } = data;
    localStorage.setItem('userId', userId);
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('queryPromptsShow', queryPromptsShow);
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

function appendMessage(message, isUser = false, isFirst = false) {
    const messagesDiv = document.getElementById('messages');
    if (isFirst) return;
    if (isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-user`;

        // 添加用户头像
        // const avatarDiv = document.createElement('div');
        // avatarDiv.className = 'message-avatar';
        // avatarDiv.style.backgroundImage = `url('${CONFIG.AVATAR_CONFIG.user}')`;
        // messageDiv.appendChild(avatarDiv);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = message;

        messageDiv.appendChild(contentDiv);
        messagesDiv.appendChild(messageDiv);
    } else {
        if (!currentMessageDiv) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message message-ai';

            // const avatarDiv = document.createElement('div');
            // avatarDiv.className = 'message-avatar';
            // avatarDiv.style.backgroundImage = `url('${CONFIG.AVATAR_CONFIG.ai}')`;
            // messageDiv.appendChild(avatarDiv);

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
            // 滚动到底部
            scrollToBottom();
        }
    }
    scrollToBottom();
}

// 添加一个新的辅助函数来处理滚动
function scrollToBottom() {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendMessage(isFirst = false) {
    let message = messageInput.value.trim();
    const { sessionId } = initNewSession();
    if (message || isFirst) {

        appendMessage(message, true, isFirst);
        socket.emit('chat message', {
            message,
            sessionId: sessionId,
            userId: localStorage.getItem('userId')
        });


        // saveToHistory(message);
        messageInput.value = '';
        messageInput.disabled = true;
        currentMessageDiv = null;

        // 隐藏 chat-promp-type 元素
        chatPrompType.style.display = 'none';
        //  showFloatingButton();
        messageInput.dispatchEvent(new Event('input'));
    }
}

function showQueryPromptsModal(data) {
    const modalContainer = document.getElementById('chat-promp-list');
    const tabsList = data.categoryList || [];
    const presetPromptList = data.presetPromptList || [];
    modalContainer.innerHTML = '';

    // 创建 Tabs
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs-container';
    // const tabs = ['全部', '教学', '行政', '宣发'];

    // 检查是否需要添加"全部"选项
    const hasAllCategory = tabsList.some(tab => tab.categoryType === 0 && tab.categoryName === '全部');
    
    if (!hasAllCategory) {
        tabsList.unshift({ categoryType: 0, categoryName: '全部' });
    }

    tabsList.forEach((tab) => {
        const tabElement = document.createElement('div');
        tabElement.className = 'tab';
        tabElement.textContent = tab.categoryName;
        tabElement.dataset.category = tab.categoryType;
        tabElement.addEventListener('click', () => switchTab(tab.categoryType));
        tabsContainer.appendChild(tabElement);
    });

    modalContainer.appendChild(tabsContainer);

    // 创建内容容器
    const contentContainer = document.createElement('div');
    contentContainer.className = 'content-container';
    modalContainer.appendChild(contentContainer);

    // 切换 Tab 的函数
    function switchTab(category) {
        tabsContainer.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        tabsContainer.querySelector(`[data-category="${category}"]`).classList.add('active');

        let filteredPrompts;
        if (category === 0) {
            // 显示所有提示
            filteredPrompts = presetPromptList;
        } else {
            // 根据类别筛选提示
            filteredPrompts = presetPromptList.filter(prompt => prompt.promptCategory === category);
        }

        renderContent(filteredPrompts, category);
    }

    // 渲染内容的函数
    function renderContent(prompts = [], category) {
        contentContainer.innerHTML = '';

        if (prompts.length === 0) {
            const devMessage = document.createElement('div');
            devMessage.className = 'dev-message';
            devMessage.textContent = '正在开发中···';
            contentContainer.appendChild(devMessage);

            // 清空输入框的内容
            messageInput.value = '';
            messageInput.dispatchEvent(new Event('input'));
            return;
        }

        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid mb-20 gap-10';
        gridContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';

        prompts.forEach((prompt, index) => {
            const container = document.createElement('div');
            container.className = 'container-prompt';

            if (index === 0) {
                container.classList.add('selected');
                messageInput.value = prompt.prompt.prompt;
                messageInput.dispatchEvent(new Event('input'));
            }

            const img = document.createElement('img');
            img.src = prompt.iconUrl;
            img.draggable = false;
            img.className = 'img-prompt';

            const title = document.createElement('div');
            title.className = 'title-prompt';
            title.textContent = prompt.mainTitle;

            const description = document.createElement('div');
            description.className = 'desc-prompt';
            description.textContent = prompt.note;

            container.appendChild(img);
            container.appendChild(title);
            container.appendChild(description);
            gridContainer.appendChild(container);

            container.addEventListener('click', () => {
                document.querySelectorAll('.container-prompt').forEach(el => el.classList.remove('selected'));
                container.classList.add('selected');
                messageInput.value = prompt.prompt.prompt;
                messageInput.dispatchEvent(new Event('input'));
            });
        });

        contentContainer.appendChild(gridContainer);
    }

    // 初始化显示全部
    switchTab(0);
}

// Socket event listeners
socket.on('chat response', (data) => {
    if (data.message) {
        // 隐藏loading动画
        appendMessage(data.message, false);
        scrollToBottom();
    }
    if (data.done) {
        document.getElementById('message-input').disabled = false;
        currentMessageDiv = null;
    }
});

//弹窗信息
socket.on('modal response', (data) => {
    if (data.done) {
        showQueryPromptsModal(data.message);
    }
    // if (data.done) {
    //     document.getElementById('message-input').disabled = false;
    //     currentMessageDiv = null;
    // }
});

socket.on('error', (data) => {
    appendMessage(`Error: ${data.message}`, false);
    document.getElementById('message-input').disabled = false;
    currentMessageDiv = null;
});

sendButton.addEventListener('click', () => {
    sendMessage()
});
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});


messageInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
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

// 显示浮窗按钮
function showFloatingButton() {
    const floatingButton = document.createElement('button');
    floatingButton.className = 'floating-button';
    floatingButton.innerHTML = 'Show Prompts';
    floatingButton.addEventListener('click', () => {
        chatPrompType.style.display = 'block';
        floatingButton.style.display = 'none';
    });
    document.body.appendChild(floatingButton);
}

// 隐藏 chat-promp-type 元素并显示浮窗按钮
editCursorPointer.addEventListener('click', () => {
    chatPrompType.style.display = 'none';
    // showFloatingButton();
    messageInput.value = "";
    messageInput.dispatchEvent(new Event('input'));
    console.log('触发click');
    sendMessage(true);
});

// 将需要在HTML中调用的函数暴露给全局作用域
window.loadChat = loadChat;
window.editChatTitle = editChatTitle;
window.deleteChat = deleteChat;
