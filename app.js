// 暂时注释掉 dotenv 配置
// require('dotenv').config();
const express = require('express');
const { create } = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const kimiAPI = require('./utils/new/kimiAPI');
const imageChatRouter = require('./routes/image-chat');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const hbs = create({
  defaultLayout: 'main',
  extname: '.handlebars'
});

// Middleware
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('view engine', 'ejs');

// 在生产环境中使用打包后的视图
const viewsPath = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, 'dist/views')
  : path.join(__dirname, 'views');

app.set('views', viewsPath);

// Routes
app.use('/', require('./routes/index'));
app.use('/text-chat', require('./routes/text-chat'));
app.use('/image-chat', imageChatRouter);
app.use('/ppt-gen', require('./routes/ppt-gen'));

// 新版本路由
app.use('/new/text-chat', (req, res) => {
    res.render('new/text-chat', {
        title: 'AI Teaching Assistant - Text Chat',
        layout: 'new/layouts/main',
        path: '/new/text-chat',
        script: '<script src="/socket.io/socket.io.js"></script><script src="/js/new/chat.js"></script>'
    });
});

app.use('/new/image-chat', (req, res) => {
    res.render('new/image-chat', {
        title: 'AI Teaching Assistant - Image Generation',
        layout: 'new/layouts/main',
        path: '/new/image-chat',
        script: '<script src="/socket.io/socket.io.js"></script><script src="/js/new/image-chat.js"></script>'
    });
});

app.use('/new/ppt-gen', (req, res) => {
    res.render('new/ppt-gen', {
        title: 'AI Teaching Assistant - PPT Generation',
        layout: 'new/layouts/main',
        path: '/new/ppt-gen',
        script: '<script src="/js/new/ppt-gen.js"></script>'
    });
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('User connected');
    const userId = socket.id;
    console.log('userId :', userId);

    // 发送 socket.id 给客户端
    socket.emit('session_init', { userId: socket.id });

    // Immediately initialize chat when user connects
    (async () => {
        try {
            const initialMessage = await kimiAPI.initializeTeacherChat(userId);
            socket.emit('chat response', {
                message: initialMessage,
                done: true
            });
        } catch (error) {
            console.error('Error initializing chat:', error);
            socket.emit('error', { 
                message: 'Failed to initialize chat'
            });
        }
    })();
    
    socket.on('chat message', async (message) => {
        try {
            // 使用流式输出
            const stream = kimiAPI.chatCompletionStream(message, userId);
            let fullResponse = '';
            
            for await (const chunk of stream) {
                fullResponse += chunk;
                socket.emit('chat response', {
                    message: chunk,
                    done: false
                });
            }
            
            // 发送完成标志
            socket.emit('chat response', {
                message: '',
                done: true
            });
            
        } catch (error) {
            console.error('Error:', error);
            socket.emit('error', { 
                message: 'Failed to get response from AI'
            });
        }
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 