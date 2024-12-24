let imageHistory = [];

function createLoadingSpinner() {
    return '<div class="loading-spinner"></div>';
}

function addImageToHistory(prompt, imageUrl) {
    imageHistory.unshift({ prompt, imageUrl });
    updateImageDisplay();
}

function updateImageDisplay() {
    const container = document.getElementById('generated-images');
    container.innerHTML = imageHistory.map(item => `
        <div class="image-card">
            <img src="${item.imageUrl}" alt="Generated image">
            <div class="prompt">${item.prompt}</div>
        </div>
    `).join('');
}

function generateImage() {
    const promptInput = document.getElementById('prompt-input');
    const prompt = promptInput.value.trim();
    const container = document.getElementById('generated-images');
    
    if (prompt) {
        // 在顶部添加新的加载状态卡片
        const loadingCard = document.createElement('div');
        loadingCard.className = 'image-card';
        loadingCard.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                ${createLoadingSpinner()}
                <p style="margin-top: 20px;">生成图片中...</p>
            </div>
            <div class="prompt">${prompt}</div>
        `;
        container.insertBefore(loadingCard, container.firstChild);
        
        // 清空输入
        promptInput.value = '';
        
        // 模拟图片生成
        setTimeout(() => {
            // 移除加载状态
            container.removeChild(loadingCard);
            // 添加生成的图片
            addImageToHistory(
                prompt,
                `https://via.placeholder.com/512x512.png?text=${encodeURIComponent(prompt)}`
            );
        }, 2000);
    }
}

// 添加回车发送功能
document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('prompt-input');
    promptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateImage();
        }
    });
}); 