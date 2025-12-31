// ===== 앱 상태 (모든 데이터를 한 곳에서 관리) =====
const state = {
    logs: [],           // 기록 목록
    game: {             // 게임 데이터
        exp: 0,
        level: 1,
        coins: 0,
        streak: 0,
        lastLogDate: null,
        questsCompleted: 0,  // 완료한 퀘스트 수
        usedMoods: []        // 사용한 감정 목록
    },
    quest: {            // 오늘의 퀘스트
        id: null,
        text: '',
        type: '',
        completed: false,
        date: null
    },
    achievements: {     // 업적 데이터
        unlocked: []    // 해금된 업적 ID 목록
    },
    pet: {              // 펫 데이터
        name: '냥이',
        species: 'cat',
        level: 1,
        xp: 0,
        hunger: 50,     // 0=배부름, 100=배고픔
        lastFeedTime: null
    },
    collection: {       // 수집 데이터
        ownedSkins: ['cat'],  // 기본 스킨
        equippedSkin: 'cat',
        badges: []
    },
    ui: {
        selectedMood: null,
        editingLogId: null,
        editMood: null,
        searchQuery: ''
    }
};

// ===== 퀘스트 목록 (type: 퀘스트 판정용 키) =====
const QUESTS = [
    { id: 1, text: '오늘 기분을 담아 기록 1개 남기기', type: 'mood_log', expReward: 30, coinReward: 10 },
    { id: 2, text: '3줄 이상 기록 작성하기', type: 'long_log', expReward: 40, coinReward: 15 },
    { id: 3, text: '오늘 감사한 일 기록하기', type: 'any_log', expReward: 25, coinReward: 10 },
    { id: 4, text: '오늘 있었던 일 2개 이상 기록하기', type: 'two_logs', expReward: 50, coinReward: 20 },
    { id: 5, text: '😊 기분으로 기록 남기기', type: 'happy_log', expReward: 35, coinReward: 12 }
];

// ===== 감정 이모지 매핑 =====
const MOODS = {
    happy: '😊',
    neutral: '😐',
    sad: '😞',
    angry: '😡',
    tired: '😴'
};

// ===== 업적 목록 =====
const ACHIEVEMENTS = [
    { id: 'first_log', name: '첫 발자국', desc: '첫 기록 작성', icon: '📝', rewardType: 'coin', reward: 50 },
    { id: 'logs_10', name: '열 번째 기록', desc: '총 10개 기록 작성', icon: '📚', rewardType: 'exp', reward: 50, target: 10 },
    { id: 'logs_50', name: '기록의 달인', desc: '총 50개 기록 작성', icon: '📖', rewardType: 'coin', reward: 150, target: 50 },
    { id: 'streak_3', name: '3일 연속', desc: '스트릭 3일 달성', icon: '🔥', rewardType: 'exp', reward: 30, target: 3 },
    { id: 'streak_7', name: '일주일의 습관', desc: '스트릭 7일 달성', icon: '💪', rewardType: 'coin', reward: 100, target: 7 },
    { id: 'streak_14', name: '2주의 기적', desc: '스트릭 14일 달성', icon: '⭐', rewardType: 'coin', reward: 200, target: 14 },
    { id: 'level_5', name: '성장 중', desc: '레벨 5 달성', icon: '🌱', rewardType: 'coin', reward: 100, target: 5 },
    { id: 'level_10', name: '숙련자', desc: '레벨 10 달성', icon: '🏅', rewardType: 'coin', reward: 300, target: 10 },
    { id: 'mood_master', name: '감정 표현가', desc: '5가지 감정 모두 사용', icon: '🎭', rewardType: 'exp', reward: 50 },
    { id: 'quest_7', name: '퀘스트 헌터', desc: '퀘스트 7회 완료', icon: '🎯', rewardType: 'coin', reward: 100, target: 7 }
];

// ===== 펫 스킨 목록 =====
const SKINS = [
    { id: 'cat', name: '고양이', emoji: '🐱', price: 0 },
    { id: 'dog', name: '강아지', emoji: '🐶', price: 100 },
    { id: 'rabbit', name: '토끼', emoji: '🐰', price: 150 },
    { id: 'fox', name: '여우', emoji: '🦊', price: 200 },
    { id: 'panda', name: '판다', emoji: '🐼', price: 250 },
    { id: 'unicorn', name: '유니콘', emoji: '🦄', price: 500 }
];

// ===== 배지 목록 =====
const BADGES = [
    { id: 'newbie', name: '뉴비', icon: '🌟', condition: 'level_3', desc: '레벨 3 달성' },
    { id: 'writer', name: '작가', icon: '✍️', condition: 'logs_20', desc: '기록 20개 작성' },
    { id: 'dedicated', name: '성실왕', icon: '👑', condition: 'streak_10', desc: '10일 연속 기록' },
    { id: 'pet_lover', name: '펫 러버', icon: '💕', condition: 'pet_level_5', desc: '펫 레벨 5 달성' },
    { id: 'collector', name: '수집가', icon: '🎪', condition: 'skins_3', desc: '스킨 3개 보유' },
    { id: 'rich', name: '부자', icon: '💰', condition: 'coins_500', desc: '코인 500개 보유' }
];

// ===== DOM 요소 캐싱 =====
const dom = {
    level: document.getElementById('level'),
    expBar: document.getElementById('exp-bar'),
    expText: document.getElementById('exp-text'),
    streak: document.getElementById('streak'),
    coins: document.getElementById('coins'),
    questCard: document.getElementById('quest-card'),
    questText: document.getElementById('quest-text'),
    questReward: document.getElementById('quest-reward'),
    questBtn: document.getElementById('quest-btn'),
    searchInput: document.getElementById('search-input'),
    logForm: document.getElementById('log-form'),
    logInput: document.getElementById('log-input'),
    moodOptions: document.getElementById('mood-options'),
    logList: document.getElementById('log-list'),
    logCount: document.getElementById('log-count'),
    emptyMessage: document.getElementById('empty-message'),
    editModal: document.getElementById('edit-modal'),
    editInput: document.getElementById('edit-input'),
    editMoodOptions: document.getElementById('edit-mood-options'),
    editCancel: document.getElementById('edit-cancel'),
    editSave: document.getElementById('edit-save'),
    levelupOverlay: document.getElementById('levelup-overlay'),
    levelupNumber: document.getElementById('levelup-number'),
    particles: document.getElementById('particles'),
    // 업적 관련
    achievementBtn: document.getElementById('achievement-btn'),
    achievementCount: document.getElementById('achievement-count'),
    achievementModal: document.getElementById('achievement-modal'),
    achievementProgress: document.getElementById('achievement-progress'),
    achievementList: document.getElementById('achievement-list'),
    achievementClose: document.getElementById('achievement-close'),
    achievementToast: document.getElementById('achievement-toast'),
    achievementToastName: document.getElementById('achievement-toast-name'),
    // 펫 관련
    petCard: document.getElementById('pet-card'),
    petAvatar: document.getElementById('pet-avatar'),
    petName: document.getElementById('pet-name'),
    petLevel: document.getElementById('pet-level'),
    petXpBar: document.getElementById('pet-xp-bar'),
    petXpText: document.getElementById('pet-xp-text'),
    hungerBar: document.getElementById('hunger-bar'),
    petMood: document.getElementById('pet-mood'),
    // 수집 관련
    collectionBtn: document.getElementById('collection-btn'),
    collectionModal: document.getElementById('collection-modal'),
    collectionClose: document.getElementById('collection-close'),
    skinGrid: document.getElementById('skin-grid'),
    badgeGrid: document.getElementById('badge-grid')
};

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    checkDailyReset();
    render();
    setupEventListeners();
});

// ===== 로컬 스토리지 로드 =====
function loadFromStorage() {
    const logs = localStorage.getItem('ansel_logs');
    const game = localStorage.getItem('ansel_game');
    const quest = localStorage.getItem('ansel_quest');
    const achievements = localStorage.getItem('ansel_achievements');
    const pet = localStorage.getItem('ansel_pet');
    const collection = localStorage.getItem('ansel_collection');

    if (logs) state.logs = JSON.parse(logs);
    if (game) state.game = { ...state.game, ...JSON.parse(game) };
    if (quest) state.quest = JSON.parse(quest);
    if (achievements) state.achievements = JSON.parse(achievements);
    if (pet) state.pet = { ...state.pet, ...JSON.parse(pet) };
    if (collection) state.collection = { ...state.collection, ...JSON.parse(collection) };
}

// ===== 로컬 스토리지 저장 =====
function saveToStorage() {
    localStorage.setItem('ansel_logs', JSON.stringify(state.logs));
    localStorage.setItem('ansel_game', JSON.stringify(state.game));
    localStorage.setItem('ansel_quest', JSON.stringify(state.quest));
    localStorage.setItem('ansel_achievements', JSON.stringify(state.achievements));
    localStorage.setItem('ansel_pet', JSON.stringify(state.pet));
    localStorage.setItem('ansel_collection', JSON.stringify(state.collection));
}

// ===== 날짜 유틸리티 =====
function getToday() {
    return new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
}

function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
}

// ===== 하루가 바뀌면 스트릭/퀘스트 리셋 =====
function checkDailyReset() {
    const today = getToday();

    // 스트릭 체크: 어제 기록했는지 확인
    if (state.game.lastLogDate) {
        const lastDate = new Date(state.game.lastLogDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays > 1) {
            // 하루 이상 건너뛰면 스트릭 리셋
            state.game.streak = 0;
        }
    }

    // 퀘스트 체크: 날짜가 바뀌면 새 퀘스트
    if (state.quest.date !== today) {
        generateDailyQuest();
    }

    // 펫 배고픔 업데이트
    updatePetHunger();

    saveToStorage();
}

// ===== 오늘의 퀘스트 생성 =====
function generateDailyQuest() {
    const randomIndex = Math.floor(Math.random() * QUESTS.length);
    const quest = QUESTS[randomIndex];

    state.quest = {
        id: quest.id,
        text: quest.text,
        type: quest.type,
        expReward: quest.expReward,
        coinReward: quest.coinReward,
        completed: false,
        date: getToday()
    };
}

// ===== 퀘스트 완료 조건 체크 =====
function checkQuestCondition() {
    const today = getToday();
    const todayLogs = state.logs.filter(log => log.date === today);

    switch (state.quest.type) {
        case 'mood_log':
            // 감정이 포함된 기록 1개
            return todayLogs.some(log => log.mood);
        case 'long_log':
            // 3줄(2개 이상의 줄바꿈) 기록
            return todayLogs.some(log => (log.content.match(/\n/g) || []).length >= 2);
        case 'any_log':
            // 아무 기록 1개
            return todayLogs.length >= 1;
        case 'two_logs':
            // 기록 2개 이상
            return todayLogs.length >= 2;
        case 'happy_log':
            // 😊 기분 기록
            return todayLogs.some(log => log.mood === 'happy');
        default:
            return false;
    }
}

// ===== 퀘스트 완료 처리 =====
function completeQuest() {
    if (state.quest.completed) return;

    state.quest.completed = true;
    state.game.questsCompleted = (state.game.questsCompleted || 0) + 1;
    addExp(state.quest.expReward);
    state.game.coins += state.quest.coinReward;

    saveToStorage();
    render();
    checkAchievements();  // 업적 체크
}

// ===== EXP 추가 및 레벨업 =====
function addExp(amount) {
    state.game.exp += amount;

    // 레벨업 체크 (100 EXP마다 레벨업)
    while (state.game.exp >= 100) {
        state.game.exp -= 100;
        state.game.level++;
        state.game.coins += 20; // 레벨업 보너스 코인
        showLevelUp(state.game.level);
    }
}

// ===== 레벨업 연출 =====
function showLevelUp(newLevel) {
    // 레벨 숫자 업데이트
    dom.levelupNumber.textContent = newLevel;

    // 파티클 생성
    createParticles();

    // 오버레이 표시
    dom.levelupOverlay.classList.add('show');

    // 화면 터치/클릭으로 닫기
    const closeHandler = () => {
        dom.levelupOverlay.classList.remove('show');
        dom.particles.innerHTML = '';
        dom.levelupOverlay.removeEventListener('click', closeHandler);
    };

    // 3초 후 자동 닫기 또는 클릭으로 닫기
    dom.levelupOverlay.addEventListener('click', closeHandler);
    setTimeout(closeHandler, 3000);
}

// ===== 파티클 생성 =====
function createParticles() {
    const emojis = ['⭐', '✨', '🎉', '🏆', '💫', '🌟'];
    dom.particles.innerHTML = '';

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('span');
        particle.className = 'particle';
        particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = '-50px';
        particle.style.animationDelay = Math.random() * 0.5 + 's';
        particle.style.animationDuration = (1.5 + Math.random()) + 's';
        dom.particles.appendChild(particle);
    }
}

// ===== 스트릭 보너스 =====
function getStreakBonus(streak) {
    if (streak >= 14) return 30;
    if (streak >= 7) return 20;
    if (streak >= 3) return 10;
    return 0;
}

// ===== 기록 추가 =====
function addLog(content, mood) {
    const today = getToday();
    const isFirstLogToday = !state.logs.some(log => log.date === today);

    const log = {
        id: Date.now(),
        content: content,
        mood: mood,
        date: today,
        timestamp: Date.now()
    };

    state.logs.unshift(log); // 최신순으로 추가

    // 기본 보상
    addExp(10);
    state.game.coins += 5;

    // 스트릭 처리 (오늘 첫 기록일 때만)
    if (isFirstLogToday) {
        if (state.game.lastLogDate) {
            const lastDate = new Date(state.game.lastLogDate);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // 연속 기록
                state.game.streak++;
            } else if (diffDays > 1) {
                // 하루 이상 건너뜀
                state.game.streak = 1;
            }
        } else {
            state.game.streak = 1;
        }

        // 스트릭 보너스
        const bonus = getStreakBonus(state.game.streak);
        if (bonus > 0) {
            addExp(bonus);
        }

        state.game.lastLogDate = today;
    }

    // 감정 사용 추적 (업적용)
    if (mood && !state.game.usedMoods.includes(mood)) {
        state.game.usedMoods.push(mood);
    }

    // 펫에게 밥 주기
    feedPet();

    saveToStorage();
    render();
    checkAchievements();  // 업적 체크
    checkBadges();        // 배지 체크
}

// ===== 기록 수정 =====
function updateLog(id, content, mood) {
    const log = state.logs.find(l => l.id === id);
    if (log) {
        log.content = content;
        log.mood = mood;
        saveToStorage();
        render();
    }
}

// ===== 기록 삭제 =====
function deleteLog(id) {
    state.logs = state.logs.filter(log => log.id !== id);
    saveToStorage();
    render();
}

// ===== XSS 방지 =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== 전체 렌더링 =====
function render() {
    renderGameStats();
    renderQuest();
    renderLogs();
    renderAchievementCount();
    renderPet();
}

// ===== 게임 스탯 렌더링 =====
function renderGameStats() {
    dom.level.textContent = state.game.level;
    dom.expBar.style.width = `${state.game.exp}%`;
    dom.expText.textContent = `${state.game.exp} / 100 EXP`;
    dom.streak.textContent = state.game.streak;
    dom.coins.textContent = state.game.coins;
}

// ===== 퀘스트 렌더링 =====
function renderQuest() {
    dom.questText.textContent = state.quest.text;
    dom.questReward.textContent = `+${state.quest.expReward} EXP, +${state.quest.coinReward} 🪙`;

    const canComplete = checkQuestCondition();

    if (state.quest.completed) {
        dom.questCard.classList.add('completed');
        dom.questBtn.textContent = '완료됨 ✓';
        dom.questBtn.classList.add('done');
        dom.questBtn.disabled = true;
    } else if (canComplete) {
        dom.questCard.classList.remove('completed');
        dom.questBtn.textContent = '보상 받기!';
        dom.questBtn.classList.remove('done');
        dom.questBtn.disabled = false;
    } else {
        dom.questCard.classList.remove('completed');
        dom.questBtn.textContent = '조건 미달성';
        dom.questBtn.classList.remove('done');
        dom.questBtn.disabled = true;
    }
}

// ===== 기록 목록 렌더링 =====
function renderLogs() {
    const query = state.ui.searchQuery.toLowerCase();
    let filteredLogs = state.logs;

    // 검색 필터
    if (query) {
        filteredLogs = state.logs.filter(log =>
            log.content.toLowerCase().includes(query)
        );
    }

    dom.logCount.textContent = `(${filteredLogs.length})`;

    if (filteredLogs.length === 0) {
        dom.logList.innerHTML = '';
        dom.emptyMessage.classList.remove('hidden');
        dom.emptyMessage.textContent = query
            ? '검색 결과가 없습니다.'
            : '아직 기록이 없습니다. 첫 기록을 남겨보세요!';
        return;
    }

    dom.emptyMessage.classList.add('hidden');

    dom.logList.innerHTML = filteredLogs.map(log => `
        <li class="log-item" data-id="${log.id}">
            <div class="log-header">
                <div class="log-meta">
                    ${log.mood ? `<span class="log-mood">${MOODS[log.mood]}</span>` : ''}
                    <span>${formatDateTime(log.timestamp)}</span>
                </div>
                <div class="log-actions">
                    <button onclick="openEditModal(${log.id})">✏️</button>
                    <button onclick="confirmDelete(${log.id})">🗑️</button>
                </div>
            </div>
            <div class="log-content">${escapeHtml(log.content)}</div>
        </li>
    `).join('');
}

// ===== 수정 모달 열기 =====
function openEditModal(id) {
    const log = state.logs.find(l => l.id === id);
    if (!log) return;

    state.ui.editingLogId = id;
    state.ui.editMood = log.mood;

    dom.editInput.value = log.content;
    updateMoodSelection(dom.editMoodOptions, log.mood);
    dom.editModal.classList.add('show');
}

// ===== 수정 모달 닫기 =====
function closeEditModal() {
    state.ui.editingLogId = null;
    state.ui.editMood = null;
    dom.editModal.classList.remove('show');
}

// ===== 삭제 확인 =====
function confirmDelete(id) {
    if (confirm('정말 삭제하시겠습니까?')) {
        deleteLog(id);
    }
}

// ===== 감정 선택 UI 업데이트 =====
function updateMoodSelection(container, selectedMood) {
    container.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.mood === selectedMood);
    });
}

// ===== 이벤트 리스너 설정 =====
function setupEventListeners() {
    // 기록 폼 제출
    dom.logForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const content = dom.logInput.value.trim();
        if (!content) return;

        addLog(content, state.ui.selectedMood);
        dom.logInput.value = '';
        state.ui.selectedMood = null;
        updateMoodSelection(dom.moodOptions, null);
    });

    // 감정 선택 (폼)
    dom.moodOptions.addEventListener('click', (e) => {
        if (e.target.classList.contains('mood-btn')) {
            state.ui.selectedMood = e.target.dataset.mood;
            updateMoodSelection(dom.moodOptions, state.ui.selectedMood);
        }
    });

    // 감정 선택 (수정 모달)
    dom.editMoodOptions.addEventListener('click', (e) => {
        if (e.target.classList.contains('mood-btn')) {
            state.ui.editMood = e.target.dataset.mood;
            updateMoodSelection(dom.editMoodOptions, state.ui.editMood);
        }
    });

    // 검색
    dom.searchInput.addEventListener('input', (e) => {
        state.ui.searchQuery = e.target.value;
        renderLogs();
    });

    // 퀘스트 완료 버튼
    dom.questBtn.addEventListener('click', completeQuest);

    // 수정 모달 취소
    dom.editCancel.addEventListener('click', closeEditModal);

    // 수정 모달 저장
    dom.editSave.addEventListener('click', () => {
        const content = dom.editInput.value.trim();
        if (!content || !state.ui.editingLogId) return;

        updateLog(state.ui.editingLogId, content, state.ui.editMood);
        closeEditModal();
    });

    // 모달 바깥 클릭시 닫기
    dom.editModal.addEventListener('click', (e) => {
        if (e.target === dom.editModal) {
            closeEditModal();
        }
    });

    // 업적 버튼 클릭
    dom.achievementBtn.addEventListener('click', openAchievementModal);

    // 업적 모달 닫기
    dom.achievementClose.addEventListener('click', closeAchievementModal);
    dom.achievementModal.addEventListener('click', (e) => {
        if (e.target === dom.achievementModal) {
            closeAchievementModal();
        }
    });

    // 수집 버튼 클릭
    dom.collectionBtn.addEventListener('click', openCollectionModal);

    // 수집 모달 닫기
    dom.collectionClose.addEventListener('click', closeCollectionModal);
    dom.collectionModal.addEventListener('click', (e) => {
        if (e.target === dom.collectionModal) {
            closeCollectionModal();
        }
    });

    // 펫 카드 클릭 (바운스 애니메이션)
    dom.petCard.addEventListener('click', () => {
        dom.petCard.classList.add('bounce');
        setTimeout(() => dom.petCard.classList.remove('bounce'), 500);
    });
}

// ===== 업적 체크 (기록 추가, 퀘스트 완료, 레벨업 시 호출) =====
function checkAchievements() {
    ACHIEVEMENTS.forEach(ach => {
        if (isAchievementUnlocked(ach.id)) return;

        if (checkAchievementCondition(ach)) {
            unlockAchievement(ach);
        }
    });
}

// ===== 업적 해금 여부 확인 =====
function isAchievementUnlocked(id) {
    return state.achievements.unlocked.includes(id);
}

// ===== 업적 조건 체크 =====
function checkAchievementCondition(ach) {
    switch (ach.id) {
        case 'first_log':
            return state.logs.length >= 1;
        case 'logs_10':
            return state.logs.length >= 10;
        case 'logs_50':
            return state.logs.length >= 50;
        case 'streak_3':
            return state.game.streak >= 3;
        case 'streak_7':
            return state.game.streak >= 7;
        case 'streak_14':
            return state.game.streak >= 14;
        case 'level_5':
            return state.game.level >= 5;
        case 'level_10':
            return state.game.level >= 10;
        case 'mood_master':
            return state.game.usedMoods && state.game.usedMoods.length >= 5;
        case 'quest_7':
            return state.game.questsCompleted >= 7;
        default:
            return false;
    }
}

// ===== 업적 진행도 가져오기 =====
function getAchievementProgress(ach) {
    switch (ach.id) {
        case 'first_log':
            return { current: Math.min(state.logs.length, 1), target: 1 };
        case 'logs_10':
            return { current: Math.min(state.logs.length, 10), target: 10 };
        case 'logs_50':
            return { current: Math.min(state.logs.length, 50), target: 50 };
        case 'streak_3':
            return { current: Math.min(state.game.streak, 3), target: 3 };
        case 'streak_7':
            return { current: Math.min(state.game.streak, 7), target: 7 };
        case 'streak_14':
            return { current: Math.min(state.game.streak, 14), target: 14 };
        case 'level_5':
            return { current: Math.min(state.game.level, 5), target: 5 };
        case 'level_10':
            return { current: Math.min(state.game.level, 10), target: 10 };
        case 'mood_master':
            return { current: state.game.usedMoods ? state.game.usedMoods.length : 0, target: 5 };
        case 'quest_7':
            return { current: Math.min(state.game.questsCompleted || 0, 7), target: 7 };
        default:
            return { current: 0, target: 1 };
    }
}

// ===== 업적 해금 =====
function unlockAchievement(ach) {
    state.achievements.unlocked.push(ach.id);

    // 보상 지급
    if (ach.rewardType === 'coin') {
        state.game.coins += ach.reward;
    } else if (ach.rewardType === 'exp') {
        addExp(ach.reward);
    }

    // 토스트 표시
    showAchievementToast(ach.name);

    saveToStorage();
    renderAchievementCount();
}

// ===== 업적 토스트 표시 =====
function showAchievementToast(name) {
    dom.achievementToastName.textContent = name;
    dom.achievementToast.classList.add('show');

    setTimeout(() => {
        dom.achievementToast.classList.remove('show');
    }, 3000);
}

// ===== 업적 모달 열기 =====
function openAchievementModal() {
    renderAchievementList();
    dom.achievementModal.classList.add('show');
}

// ===== 업적 모달 닫기 =====
function closeAchievementModal() {
    dom.achievementModal.classList.remove('show');
}

// ===== 업적 개수 렌더링 =====
function renderAchievementCount() {
    dom.achievementCount.textContent = state.achievements.unlocked.length;
}

// ===== 업적 목록 렌더링 =====
function renderAchievementList() {
    const unlockedCount = state.achievements.unlocked.length;
    dom.achievementProgress.textContent = `${unlockedCount} / ${ACHIEVEMENTS.length}`;

    dom.achievementList.innerHTML = ACHIEVEMENTS.map(ach => {
        const isUnlocked = isAchievementUnlocked(ach.id);
        const progress = getAchievementProgress(ach);
        const progressPercent = (progress.current / progress.target) * 100;

        return `
            <li class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}">
                <span class="achievement-icon">${isUnlocked ? ach.icon : '🔒'}</span>
                <div class="achievement-info">
                    <div class="achievement-name">${ach.name}</div>
                    <div class="achievement-desc">${ach.desc}</div>
                    <div class="achievement-reward">
                        ${ach.rewardType === 'coin' ? '🪙' : '⚡'} +${ach.reward}
                    </div>
                </div>
                ${isUnlocked ?
                    '<span class="achievement-status">완료!</span>' :
                    `<div class="achievement-progress-bar">
                        <div class="achievement-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>`
                }
            </li>
        `;
    }).join('');
}

// ===== 펫 배고픔 업데이트 =====
function updatePetHunger() {
    if (!state.pet.lastFeedTime) return;

    const now = Date.now();
    const hoursSinceLastFeed = (now - state.pet.lastFeedTime) / (1000 * 60 * 60);

    // 6시간마다 배고픔 +10
    const hungerIncrease = Math.floor(hoursSinceLastFeed / 6) * 10;

    if (hungerIncrease > 0) {
        state.pet.hunger = Math.min(100, state.pet.hunger + hungerIncrease);
        // 마지막 피딩 시간을 현재 시점으로 리셋 (이미 계산된 배고픔 반영)
        state.pet.lastFeedTime = now - ((hoursSinceLastFeed % 6) * 60 * 60 * 1000);
    }
}

// ===== 펫에게 밥 주기 =====
function feedPet() {
    // 배고픔 감소
    state.pet.hunger = Math.max(0, state.pet.hunger - 15);
    state.pet.lastFeedTime = Date.now();

    // 펫 경험치 추가
    addPetXp(10);
}

// ===== 펫 경험치 추가 =====
function addPetXp(amount) {
    state.pet.xp += amount;

    // 펫 레벨업 체크 (50 XP마다 레벨업)
    while (state.pet.xp >= 50) {
        state.pet.xp -= 50;
        state.pet.level++;
    }
}

// ===== 펫 기분 계산 =====
function getPetMood() {
    const hunger = state.pet.hunger;

    if (hunger <= 30) {
        return { emoji: '😊', text: '행복해요!' };
    } else if (hunger <= 60) {
        return { emoji: '😐', text: '괜찮아요' };
    } else if (hunger <= 80) {
        return { emoji: '😟', text: '배고파요...' };
    } else {
        return { emoji: '😢', text: '많이 배고파요!' };
    }
}

// ===== 현재 장착된 스킨 이모지 가져오기 =====
function getEquippedSkinEmoji() {
    const skin = SKINS.find(s => s.id === state.collection.equippedSkin);
    return skin ? skin.emoji : '🐱';
}

// ===== 펫 렌더링 =====
function renderPet() {
    // 아바타 (장착된 스킨)
    dom.petAvatar.textContent = getEquippedSkinEmoji();

    // 이름과 레벨
    dom.petName.textContent = state.pet.name;
    dom.petLevel.textContent = state.pet.level;

    // XP 바
    const xpPercent = (state.pet.xp / 50) * 100;
    dom.petXpBar.style.width = `${xpPercent}%`;
    dom.petXpText.textContent = `${state.pet.xp} / 50 XP`;

    // 배고픔 바
    const hungerPercent = 100 - state.pet.hunger; // 반전 (배부름 표시)
    dom.hungerBar.style.width = `${hungerPercent}%`;

    // 배고픔에 따른 색상 변경
    if (state.pet.hunger > 80) {
        dom.hungerBar.classList.add('danger');
        dom.hungerBar.classList.remove('warning');
    } else if (state.pet.hunger > 60) {
        dom.hungerBar.classList.add('warning');
        dom.hungerBar.classList.remove('danger');
    } else {
        dom.hungerBar.classList.remove('warning', 'danger');
    }

    // 기분
    const mood = getPetMood();
    dom.petMood.textContent = `${mood.emoji} ${mood.text}`;
}

// ===== 수집 모달 열기 =====
function openCollectionModal() {
    renderCollection();
    dom.collectionModal.classList.add('show');
}

// ===== 수집 모달 닫기 =====
function closeCollectionModal() {
    dom.collectionModal.classList.remove('show');
}

// ===== 수집 렌더링 =====
function renderCollection() {
    renderSkinGrid();
    renderBadgeGrid();
}

// ===== 스킨 그리드 렌더링 =====
function renderSkinGrid() {
    dom.skinGrid.innerHTML = SKINS.map(skin => {
        const owned = state.collection.ownedSkins.includes(skin.id);
        const equipped = state.collection.equippedSkin === skin.id;

        return `
            <div class="skin-item ${owned ? 'owned' : 'locked'} ${equipped ? 'equipped' : ''}"
                 data-skin-id="${skin.id}">
                <span class="skin-emoji">${owned ? skin.emoji : '🔒'}</span>
                <span class="skin-name">${skin.name}</span>
                ${!owned ? `<span class="skin-price">🪙 ${skin.price}</span>` : ''}
                ${owned && !equipped ? '<button class="equip-btn" onclick="equipSkin(\'' + skin.id + '\')">장착</button>' : ''}
                ${equipped ? '<span class="equipped-label">장착중</span>' : ''}
            </div>
        `;
    }).join('');

    // 미소유 스킨 클릭 시 구매
    dom.skinGrid.querySelectorAll('.skin-item.locked').forEach(item => {
        item.addEventListener('click', () => {
            const skinId = item.dataset.skinId;
            buySkin(skinId);
        });
    });
}

// ===== 스킨 구매 =====
function buySkin(skinId) {
    const skin = SKINS.find(s => s.id === skinId);
    if (!skin) return;

    if (state.collection.ownedSkins.includes(skinId)) {
        return; // 이미 소유
    }

    if (state.game.coins < skin.price) {
        alert('코인이 부족합니다!');
        return;
    }

    // 구매 진행
    state.game.coins -= skin.price;
    state.collection.ownedSkins.push(skinId);

    saveToStorage();
    render();
    renderCollection();
    checkBadges();
}

// ===== 스킨 장착 =====
function equipSkin(skinId) {
    if (!state.collection.ownedSkins.includes(skinId)) return;

    state.collection.equippedSkin = skinId;
    saveToStorage();
    render();
    renderCollection();
}

// ===== 배지 그리드 렌더링 =====
function renderBadgeGrid() {
    dom.badgeGrid.innerHTML = BADGES.map(badge => {
        const owned = state.collection.badges.includes(badge.id);

        return `
            <div class="badge-item ${owned ? 'owned' : 'locked'}">
                <span class="badge-icon">${owned ? badge.icon : '🔒'}</span>
                <span class="badge-name">${badge.name}</span>
                <span class="badge-desc">${badge.desc}</span>
            </div>
        `;
    }).join('');
}

// ===== 배지 조건 체크 =====
function checkBadgeCondition(badge) {
    switch (badge.condition) {
        case 'level_3':
            return state.game.level >= 3;
        case 'logs_20':
            return state.logs.length >= 20;
        case 'streak_10':
            return state.game.streak >= 10;
        case 'pet_level_5':
            return state.pet.level >= 5;
        case 'skins_3':
            return state.collection.ownedSkins.length >= 3;
        case 'coins_500':
            return state.game.coins >= 500;
        default:
            return false;
    }
}

// ===== 배지 체크 및 부여 =====
function checkBadges() {
    BADGES.forEach(badge => {
        if (state.collection.badges.includes(badge.id)) return;

        if (checkBadgeCondition(badge)) {
            state.collection.badges.push(badge.id);
            showAchievementToast(`배지 획득: ${badge.name}`);
            saveToStorage();
        }
    });
}
