const fs = require('fs');
const path = require('path');

// 复制必要的服务器端文件到 dist 目录
const filesToCopy = [
    'app.js',
    'package.json',
    'utils',
    'routes'
];

filesToCopy.forEach(file => {
    const sourcePath = path.join(__dirname, '..', file);
    const targetPath = path.join(__dirname, '../dist', file);
    
    if (fs.existsSync(sourcePath)) {
        if (fs.lstatSync(sourcePath).isDirectory()) {
            fs.cpSync(sourcePath, targetPath, { recursive: true });
        } else {
            fs.copyFileSync(sourcePath, targetPath);
        }
    }
});

console.log('Post-build process completed'); 