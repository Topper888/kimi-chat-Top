const socket = io();

const CONFIG = {
    AVATAR_CONFIG: {
        ai: 'https://api.dicebear.com/7.x/bottts/svg?seed=ai-assistant',
        user: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
    }
};

const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatMessages = document.getElementById('messages');
let messageHistory = [];

// Clear any existing messages when connecting
chatMessages.innerHTML = '';

function addMessage(sender, content, isImage = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${sender === 'user' ? 'user' : 'ai'}`;
    
    // 添加头像
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.style.backgroundImage = `url('${CONFIG.AVATAR_CONFIG[sender === 'user' ? 'user' : 'ai']}')`;
    messageDiv.appendChild(avatarDiv);
    
    // 添加消息内容容器
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    if (isImage) {
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';

        const img = document.createElement('img');
        img.src = content;
        img.className = 'image-message';

        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'download-btn';
        downloadBtn.innerHTML = `
            <svg class="download-icon" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            Download
        `;

        downloadBtn.onclick = async () => {
            try {
                const response = await fetch('/image-chat/api/download-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ imageUrl: content })
                });

                if (!response.ok) {
                    throw new Error('Failed to download image');
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `generated-image-${Date.now()}.png`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } catch (error) {
                console.error('Error downloading image:', error);
                alert('Failed to download image');
            }
        };

        imageContainer.appendChild(img);
        imageContainer.appendChild(downloadBtn);
        contentDiv.appendChild(imageContainer);
    } else {
        contentDiv.textContent = content;
    }

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Store in history
    messageHistory.push({ sender, content, isImage });
}

(async () => {
    try {
        const prompt = ""
        const response = await fetch('/image-chat/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });
        const data = await response.json();
        

        if (data.message) {
            addMessage('ai', data.message, false);
        } else {
            addMessage('ai', data.imageUrl, true);
        }

    } catch (error) {
        console.error('Error:', error);
        addMessage('ai', 'Sorry, there was an error generating the image.');
    }
})()

async function handleSendMessage() {
    const prompt = messageInput.value.trim();
    if (!prompt) return;

    // Add user message
    addMessage('user', prompt);
    messageInput.value = '';
    messageInput.dispatchEvent(new Event('input'));
    // Show loading state
    addMessage('ai', '图片生成中...');

    try {
        const response = await fetch('/image-chat/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });
        const data = await response.json();
        
        // Remove loading message
        chatMessages.removeChild(chatMessages.lastChild);

        if (data.imageUrl) {
            addMessage('ai', data.imageUrl, true);
        } else {
            addMessage('ai', 'Sorry, there was an error generating the image.', false);
        }

    } catch (error) {
        console.error('Error:', error);
        addMessage('ai', 'Sorry, there was an error generating the image.');
    }
}



sendButton.addEventListener('click', handleSendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});

messageInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});
