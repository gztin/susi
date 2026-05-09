const App = {
    // State management
    state: {
        currentUser: null,
        friends: []
    },

    // Initialization
    init() {
        this.loadState();
        this.checkAuth();
        this.handleParams();
    },

    // Handle URL parameters (e.g., ?reg=1)
    handleParams() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('reg') === '1') {
            if (!this.state.currentUser) {
                this.register();
            } else {
                window.location.href = 'profile.html';
            }
        }
    },

    // Load from localStorage
    loadState() {
        const savedUser = localStorage.getItem('qr_user');
        const savedFriends = localStorage.getItem('qr_friends');
        
        if (savedUser) this.state.currentUser = JSON.parse(savedUser);
        if (savedFriends) this.state.friends = JSON.parse(savedFriends);
    },

    // Save to localStorage
    saveState() {
        localStorage.setItem('qr_user', JSON.stringify(this.state.currentUser));
        localStorage.setItem('qr_friends', JSON.stringify(this.state.friends));
    },

    // Check if user is logged in
    checkAuth() {
        const path = window.location.pathname;
        const isAuthPage = path.endsWith('/') || path.includes('index.html') || path.includes('login.html');
        
        // If logged in and on index/login, go to profile
        if (this.state.currentUser && isAuthPage) {
            window.location.href = 'profile.html';
            return;
        }

        // If NOT logged in and NOT on an auth page, go to index
        if (!this.state.currentUser && !isAuthPage) {
            window.location.href = 'index.html';
        }
    },

    // Generate random 4-char ID
    generateId() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous chars
        let result = '';
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    // Register a new user
    register() {
        const newUser = {
            id: this.generateId(),
            name: '新用戶',
            title: '尚未設定職稱',
            bio: '掃描我的 QR Code 加我好友！',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`
        };
        this.state.currentUser = newUser;
        this.saveState();
        window.location.href = 'profile.html';
    },

    // Login with existing ID
    login(id) {
        // In this prototype, we simulate finding the user. 
        // Real systems would fetch from DB.
        if (id && id.length === 4) {
            this.state.currentUser = {
                id: id.toUpperCase(),
                name: '回歸用戶',
                title: '專業人士',
                bio: '歡迎回來！',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`
            };
            this.saveState();
            window.location.href = 'profile.html';
            return true;
        }
        return false;
    },

    // Add a friend by ID
    addFriend(friendId) {
        if (friendId === this.state.currentUser.id) {
            alert('這是您自己的 QR Code！');
            return;
        }
        
        if (this.state.friends.some(f => f.id === friendId)) {
            alert('已經是好友了！');
            return;
        }

        const newFriend = {
            id: friendId,
            name: `好友 ${friendId}`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${friendId}`
        };

        this.state.friends.push(newFriend);
        this.saveState();
        alert('成功加入好友！');
        window.location.href = 'profile.html';
    },

    // Update profile
    updateProfile(data) {
        this.state.currentUser = { ...this.state.currentUser, ...data };
        this.saveState();
    },

    logout() {
        localStorage.removeItem('qr_user');
        localStorage.removeItem('qr_friends');
        window.location.href = 'index.html';
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => App.init());
