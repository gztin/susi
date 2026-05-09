    // State management
    state: {
        currentUser: null,
        friends: [],
        // --- JSONBin Configuration ---
        // 請填入您的資訊，資料才能跨手機同步
        binId: '69fee526250b1311c3255ade', 
        masterKey: '$2b$10$hcZFDzetXXNrMlQaILsXOO5XIazCw6fNtyu3M6uw1fx8nodcCGDKi' 
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

    // --- Cloud Sync (JSONBin) ---
    async syncToCloud(newUser) {
        if (this.state.binId.includes('YOUR_')) return;

        try {
            const res = await fetch(`https://api.jsonbin.io/v3/b/${this.state.binId}/latest`, {
                headers: { 'X-Master-Key': this.state.masterKey }
            });
            const result = await res.json();
            // Handle both array root or {members: []} structure
            let allMembers = Array.isArray(result.record) ? result.record : (result.record.members || []);

            if (!allMembers.some(m => m.id === newUser.id)) {
                allMembers.push(newUser);
                await fetch(`https://api.jsonbin.io/v3/b/${this.state.binId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Master-Key': this.state.masterKey
                    },
                    body: JSON.stringify({ members: allMembers })
                });
            }
        } catch (e) {
            console.error('Cloud Sync Error', e);
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
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
            friends: [] // Track individual friends
        };
        this.state.currentUser = newUser;
        this.saveState();

        // Simulate saving to a global registry
        this.addToGlobalRegistry(newUser);
        
        // Sync to cloud
        this.syncToCloud(newUser);

        window.location.href = 'profile.html';
    },

    addToGlobalRegistry(user) {
        let all = JSON.parse(localStorage.getItem('all_members') || '[]');
        if (!all.some(m => m.id === user.id)) {
            all.push(user);
            localStorage.setItem('all_members', JSON.stringify(all));
        }
    },

    // Login with existing ID
    login(id) {
        if (id === 'admin1234') {
            window.location.href = 'admin.html';
            return true;
        }

        if (id && id.length === 4) {
            // In a real system, fetch from DB. 
            // For now, we simulate finding the user.
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
