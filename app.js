// Game Logic for Hotel Grand Bali Terbengkalai

// Game State
const gameState = {
    isPlaying: false,
    currentScene: "start",
    playerName: "Luna",
    inventory: [],
    questLog: [],
    completedQuests: new Set(),
    currentQuest: null,
    playthroughTime: 0
};

// DOM Elements
const storyText = document.getElementById('story-text');
const choicesArea = document.getElementById('choices-area');
const inventoryList = document.getElementById('inventory-list');
const questLog = document.getElementById('quest-log');
const currentQuestEl = document.getElementById('current-quest');
const startBtn = document.getElementById('start-btn');
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');
const resetBtn = document.getElementById('reset-btn');

// Load Quests from quests.txt
let allQuests = [];

// Initialize Game
async function init() {
    // Load quests
    await loadQuests();
    
    // Check saved game
    if (localStorage.getItem('hotelRPGSave')) {
        loadGame();
    }
    
    // Event Listeners
    startBtn.addEventListener('click', startGame);
    saveBtn.addEventListener('click', saveGame);
    loadBtn.addEventListener('click', loadGame);
    resetBtn.addEventListener('click', resetGame);
    
    updateUI();
}

// Load Quests from File
async function loadQuests() {
    try {
        const response = await fetch('./quests.txt');
        const text = await response.text();
        allQuests = text.split('\n').filter(q => q.trim() !== '');
    } catch (error) {
        console.error('Gagal memuat quest: ", error);
        allQuests = ["Quest: Gagal memuat library quest"];
    }
}

// Start Game
function startGame() {
    gameState.isPlaying = true;
    gameState.currentScene = "lobby";
    gameState.questLog = [];
    gameState.inventory = [];
    gameState.completedQuests = new Set();
    
    // Dapatkan quest acak pertama
    pickRandomQuest();
    
    updateStory("Selamat datang, Luna! Kamu berdiri di depan pintu Hotel Grand Bali Terbengkalai. Udara lembab dan berbau apek memenuhi hidungmu. Pintu hotel bergoyang sedikit angin malam. Apa yang akan kamu lakukan?");
    updateChoices([
        { text: "Masuk ke hotel dan membuka pintu", action: () => enterHotel() },
        { text: "Telepon tim kamu untuk meminta bantuan", action: () => callTeam() },
        { text: "Periksa tas kamu untuk melihat barang bawaan", action: () => checkInventory() }
    ]);
}

// Pick Random Quest
function pickRandomQuest() {
    if (allQuests.length === 0) return;
    const randomQuest = allQuests[Math.floor(Math.random() * allQuests.length)];
    gameState.currentQuest = randomQuest;
    gameState.questLog.push(randomQuest);
    updateUI();
}

// Update Story Text
function updateStory(text) {
    storyText.innerHTML = text;
}

// Update Choice Buttons
function updateChoices(choices) {
    choicesArea.innerHTML = '';
    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choice.text;
        btn.addEventListener('click', () => {
            choice.action();
        });
        choicesArea.appendChild(btn);
    });
}

// Update UI
function updateUI() {
    // Update Current Quest
    currentQuestEl.textContent = `Quest: ${gameState.currentQuest || "Belum ada quest"`;
    
    // Update Inventory List
    inventoryList.innerHTML = '';
    gameState.inventory.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        inventoryList.appendChild(li);
    });
    
    // Update Quest Log
    questLog.innerHTML = '';
    gameState.questLog.forEach(quest => {
        const li = document.createElement('li');
        li.textContent = quest;
        questLog.appendChild(li);
    });
}

// Game Scenes
function enterHotel() {
    updateStory("Kamu mendorong pintu hotel, dan pintu itu terbuka dengan suara creaking yang keras. Di dalam, lampu gantung berdebu bergoyang di aula utama. Kamu melihat meja resepsionis yang tertutup debu, dan buku catatan di atasnya.");
    updateChoices([
        { text: "Periksa meja resepsionis", action: () => checkReceptionDesk() },
        { text: "Periksa kamera lama di dinding", action: () => checkOldCamera() },
        { text: "Naik tangga ke lantai atas", action: () => goUpStairs() }
    ]);
}

function callTeam() {
    updateStory("Kamu mengambil hp kamu, tapi sinyal tidak ada. Semua perangkat di area hotel ini tidak bekerja. Hantu resepsionis muncul di belakang meja resepsionis.");
    updateChoices([
        { text: "Tanya hantu resepsionis", action: () => talkToGhost() },
        { text: "Lanjutkan ke dalam hotel", action: () => enterHotel() }
    ]);
}

function checkInventory() {
    updateStory("Kamu membuka tas kamu: kamu membawa kamera kamu, buku catatan, dan kunci kamar 302, dan sentuhan kecil, dan sebuah obeng kecil.");
    updateChoices([
        { text: "Ambil kamera", action: () => addItem("Kamera") },
        { text: "Ambil buku catatan", action: () => addItem("Buku Catatan Resepsionis") },
        { text: "Ambil kunci kamar 302", action: () => addItem("Kunci Kamar 302") }
    ]);
}

function addItem(item) {
    if (!gameState.inventory.includes(item)) {
        gameState.inventory.push(item);
    }
    updateUI();
}

// Save/Load Game
function saveGame() {
    const saveData = {
        ...gameState,
        completedQuests: Array.from(gameState.completedQuests)
    };
    localStorage.setItem('hotelRPGSave', JSON.stringify(saveData));
    alert('Permainan disimpan! ✅');
}

function loadGame() {
    const saveData = localStorage.getItem('hotelRPGSave');
    if (saveData) {
        const parsedData = JSON.parse(saveData);
        gameState.isPlaying = parsedData.isPlaying;
        gameState.currentScene = parsedData.currentScene;
        gameState.playerName = parsedData.playerName;
        gameState.inventory = parsedData.inventory;
        gameState.questLog = parsedData.questLog;
        gameState.completedQuests = new Set(parsedData.completedQuests);
        updateUI();
        updateStory("Permainan dimuat ulang!");
    }
}

function resetGame() {
    if (confirm('Apakah kamu yakin ingin mereset permainan? Semua progres akan hilang!')) {
        localStorage.removeItem('hotelRPGSave');
        location.reload();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);