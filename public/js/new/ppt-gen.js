function generatePPT() {
    const topic = document.getElementById('topic').value.trim();
    const outline = document.getElementById('outline').value.trim();
    const previewDiv = document.getElementById('ppt-preview');
    
    if (topic && outline) {
        // 显示加载状态
        previewDiv.innerHTML = '<div class="loading">生成中...</div>';
        
        // 这里添加PPT生成的逻辑
        // 暂时使用模拟数据
        setTimeout(() => {
            previewDiv.innerHTML = `
                <div class="ppt-preview-slide">
                    <h3>${topic}</h3>
                    <pre>${outline}</pre>
                </div>
            `;
        }, 2000);
    }
} 