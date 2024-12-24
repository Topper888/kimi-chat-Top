// 菜单折叠功能
function toggleSidebar() {
    document.body.classList.toggle('collapsed');
    localStorage.setItem('sidebarCollapsed', document.body.classList.contains('collapsed'));
}

// 用户登录相关
function showLoginModal() {
    // 实现登录模态框
    console.log('Show login modal');
}

function toggleUserMenu() {
    // 实现用户菜单切换
    console.log('Toggle user menu');
}

function logout() {
    localStorage.removeItem('user');
    document.getElementById('loginBtn').classList.remove('hidden');
    document.getElementById('userAvatar').classList.add('hidden');
}

// 初始化布局
document.addEventListener('DOMContentLoaded', () => {
    // 恢复菜单折叠状态
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        document.body.classList.add('collapsed');
    }

    // 检查用户登录状态
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('loginBtn').classList.add('hidden');
        const userAvatar = document.getElementById('userAvatar');
        userAvatar.classList.remove('hidden');
        userAvatar.querySelector('img').src = user.avatar;
    }
}); 