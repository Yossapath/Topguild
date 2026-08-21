
window.isUserAdmin = function() {
  const r = window.currentUser ? (window.currentUser.role || window.currentUser.Role || '').toLowerCase() : '';
  return r === 'admin' || r === 'owner' || r === 'หัวหน้ากิลด์';
};
// Firebase Web SDK v10 Modular Imports from CDN
import { initializeApp, getApps, deleteApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  getDoc,
  setDoc, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/* Default Initial Data */
const INITIAL_ROSTER = {
  "Lord Knight": [{"name": "Heinzer", "power": 35282}, {"name": "NpR_n", "power": 34336}, {"name": "Zerion", "power": 33957}, {"name": "บักตุ่น", "power": 32161}, {"name": "Yami", "power": 31274}, {"name": "Satanic", "power": 30844}, {"name": "HyPerTo", "power": 29994}, {"name": "InseptiOn", "power": 28953}, {"name": "Over_Topup", "power": 27579}, {"name": "หนูอ้ดนะพี่ไหวหรอ", "power": 25158}, {"name": "หญิงแท้", "power": 23494}, {"name": "หยองแยง", "power": 22336}],
  "Paladin": [{"name": "XxerrosS", "power": 43684}, {"name": "Jaime", "power": 32665}, {"name": "Cal2nivaLxD", "power": 31697}, {"name": "Avalon", "power": 28038}, {"name": "DOMONCUS", "power": 23443}, {"name": "ดิมิโกะ", "power": 21651}, {"name": "SoLoPlayer", "power": 17806}],
  "High Wizard": [{"name": "DMTz", "power": 41193}, {"name": "P1CaszO", "power": 34545}, {"name": "uwannadrink?", "power": 33369}, {"name": "SodaPure", "power": 33305}, {"name": "เอมิจังงง", "power": 32239}, {"name": "zzzTOzzz", "power": 31746}, {"name": "Lorying", "power": 31502}, {"name": "OTANI", "power": 31497}, {"name": "NaTzo", "power": 30848}, {"name": "Vaduka-Tampan", "power": 30527}, {"name": "P9D", "power": 29627}, {"name": "FishStop", "power": 28484}, {"name": "mochi3", "power": 27833}, {"name": "MANJI", "power": 25256}, {"name": "Lynlin", "power": 23647}, {"name": "Duckza", "power": 22059}, {"name": "Justice", "power": 19678}],
  "Sniper": [{"name": "JossGoose", "power": 39091}, {"name": "spkn", "power": 34996}, {"name": "Pepzii2", "power": 34000}, {"name": "KiMuJi", "power": 33068}, {"name": "หวานเจี๊ยฟ", "power": 31969}, {"name": "Orasa", "power": 30376}, {"name": "Pairot_1995", "power": 29494}, {"name": "I'm18", "power": 29434}, {"name": "Maboom", "power": 29251}, {"name": "Atomic", "power": 28920}, {"name": "3ararentz", "power": 28530}, {"name": "Paxx", "power": 27752}, {"name": "BoyKub", "power": 27392}, {"name": "Ms,08", "power": 27104}, {"name": "aut", "power": 26455}, {"name": "banana1fruit", "power": 25873}, {"name": "TAETIS007", "power": 25670}, {"name": "Mahnow", "power": 25526}, {"name": "Joesoizero", "power": 24801}, {"name": "ZEON", "power": 23968}, {"name": "iRokz", "power": 23193}, {"name": "ONI", "power": 22880}, {"name": "TheNinez", "power": 22724}, {"name": "กระต่ายบิน", "power": 22556}, {"name": "BASFISHING", "power": 22285}, {"name": "Weedsp", "power": 21665}, {"name": "MUF4IN", "power": 21203}, {"name": "MrSilverz", "power": 20702}],
  "Priest": [{"name": "กระดุมเม็ดบน", "power": 34277}, {"name": "McRai", "power": 32266}, {"name": "HarryPotter", "power": 32176}, {"name": "ironboy69", "power": 32142}, {"name": "Demons", "power": 32118}, {"name": "imQwQm", "power": 31749}, {"name": "คุคุ", "power": 31142}, {"name": "Baki_Hanma", "power": 30793}, {"name": "Dumpling", "power": 30456}, {"name": "หวังสี้เจ้า", "power": 29973}, {"name": "SappeXo", "power": 29690}, {"name": "ป่ายแก่ๆ", "power": 29247}, {"name": "GOLF", "power": 28745}, {"name": "พระปลาย", "power": 27745}, {"name": "Mahlakor", "power": 27552}, {"name": "อามะ-กันเต", "power": 26953}, {"name": "น้องxoe", "power": 26219}, {"name": "fluffi_cia", "power": 25712}, {"name": "monza", "power": 23440}, {"name": "เอรักดีดีคืนมา", "power": 21632}, {"name": "lll", "power": 21564}],
  "Champion": [{"name": "TopGameTH", "power": 34786}, {"name": "SAFEZONE", "power": 32328}, {"name": "ROidiotgame", "power": 30736}, {"name": "MasterClover", "power": 29153}, {"name": "Almonso", "power": 25672}, {"name": "KiMuChi", "power": 22155}],
  "Assassin Cross": [{"name": "YuGi", "power": 43663}, {"name": "พ่องมีไต", "power": 41098}, {"name": "Aramid", "power": 38700}, {"name": "ZelarS", "power": 36780}, {"name": "navanavin", "power": 36712}, {"name": "[H2H]Ian", "power": 36153}, {"name": "TonyX", "power": 33712}, {"name": "โอ๊ยร้อนน", "power": 33141}, {"name": "ChomPoo", "power": 32554}, {"name": "RMS", "power": 31560}, {"name": "Fujiro", "power": 30251}, {"name": "Flexx", "power": 27909}, {"name": "DARKCAFE", "power": 26693}, {"name": "cHk", "power": 25855}, {"name": "Akiri", "power": 23100}, {"name": "0xlantern", "power": 22247}, {"name": "อิหล่ามืดบิน", "power": 22048}],
  "Merchant": [{"name": "Zendo", "power": 34677}, {"name": "12ED!TUS", "power": 33267}, {"name": "凡依", "power": 29313}, {"name": "Pew", "power": 26127}, {"name": "Homey", "power": 23832}, {"name": "โยชิแมวดื้อ", "power": 22287}],
  "Gunslinger": [{"name": "RottoR", "power": 34494}, {"name": "KiTzAoo3", "power": 32452}, {"name": "นายไข่ดาว", "power": 30429}, {"name": "KJสารวัตรแจ๊ะ", "power": 30184}, {"name": "Katoonz", "power": 29936}, {"name": "ขุนทวนสวนทวาร", "power": 29093}, {"name": "CGame", "power": 28828}, {"name": "เวลดอล่า", "power": 28663}, {"name": "ยาซป", "power": 28297}, {"name": "Jade", "power": 27434}, {"name": "พระอาทิตย์", "power": 27347}, {"name": "Valkyriㅌ", "power": 26732}, {"name": "บักหรรม้อยเอง", "power": 26030}, {"name": "ชาวประมง", "power": 25714}, {"name": "Non79", "power": 25193}, {"name": "BixDix", "power": 24080}, {"name": "TARZANXIII", "power": 23201}, {"name": "GdGunSlinger", "power": 17527}, {"name": "zenkie", "power": 17397}],
  "Druid": [{"name": "iwannatell", "power": 36377}, {"name": "Momju", "power": 35429}, {"name": "ตะขบ", "power": 33749}, {"name": "LinPing", "power": 32386}, {"name": "Yots10", "power": 31613}, {"name": "หรรม้อยแซงเลย", "power": 26292}, {"name": "McLai", "power": 23227}, {"name": "Leaf", "power": 19461}]
};

const INITIAL_TEAMS = [
  {
    "title": "สนามหลัก (มี Priest อย่างน้อย 1 คน/ทีม)  (60 คน / 12 ทีม)",
    "teams": {
      "ทีม 1": [{"name": "XxerrosS", "job": "Paladin", "power": 43684}, {"name": "YuGi", "job": "Assassin Cross", "power": 43663}, {"name": "DMTz", "job": "High Wizard", "power": 41193}, {"name": "พ่องมีไต", "job": "Assassin Cross", "power": 41098}, {"name": "กระดุมเม็ดบน", "job": "Priest", "power": 34277}],
      "ทีม 2": [{"name": "JossGoose", "job": "Sniper", "power": 39091}, {"name": "Aramid", "job": "Assassin Cross", "power": 38700}, {"name": "ZelarS", "job": "Assassin Cross", "power": 36780}, {"name": "navanavin", "job": "Assassin Cross", "power": 36712}, {"name": "McRai", "job": "Priest", "power": 32266}],
      "ทีม 3": [{"name": "iwannatell", "job": "Druid", "power": 36377}, {"name": "[H2H]Ian", "job": "Assassin Cross", "power": 36153}, {"name": "Momju", "job": "Druid", "power": 35429}, {"name": "Heinzer", "job": "Lord Knight", "power": 35282}, {"name": "HarryPotter", "job": "Priest", "power": 32176}],
      "ทีม 4": [{"name": "spkn", "job": "Sniper", "power": 34996}, {"name": "TopGameTH", "job": "Champion", "power": 34786}, {"name": "Zendo", "job": "Merchant", "power": 34677}, {"name": "P1CaszO", "job": "High Wizard", "power": 34545}, {"name": "ironboy69", "job": "Priest", "power": 32142}],
      "ทีม 5": [{"name": "RottoR", "job": "Gunslinger", "power": 34494}, {"name": "NpR_n", "job": "Lord Knight", "power": 34336}, {"name": "Pepzii2", "job": "Sniper", "power": 34000}, {"name": "Zerion", "job": "Lord Knight", "power": 33957}, {"name": "Demons", "job": "Priest", "power": 32118}],
      "ทีม 6": [{"name": "ตะขบ", "job": "Druid", "power": 33749}, {"name": "TonyX", "job": "Assassin Cross", "power": 33712}, {"name": "uwannadrink?", "job": "High Wizard", "power": 33369}, {"name": "SodaPure", "job": "High Wizard", "power": 33305}, {"name": "imQwQm", "job": "Priest", "power": 31749}],
      "ทีม 7": [{"name": "12ED!TUS", "job": "Merchant", "power": 33267}, {"name": "โอ๊ยร้อนน", "job": "Assassin Cross", "power": 33141}, {"name": "KiMuJi", "job": "Sniper", "power": 33068}, {"name": "Jaime", "job": "Paladin", "power": 32665}, {"name": "คุคุ", "job": "Priest", "power": 31142}],
      "ทีม 8": [{"name": "ChomPoo", "job": "Assassin Cross", "power": 32554}, {"name": "KiTzAoo3", "job": "Gunslinger", "power": 32452}, {"name": "LinPing", "job": "Druid", "power": 32386}, {"name": "SAFEZONE", "job": "Champion", "power": 32328}, {"name": "Baki_Hanma", "job": "Priest", "power": 30793}],
      "ทีม 9": [{"name": "เอมิจังงง", "job": "High Wizard", "power": 32239}, {"name": "บักตุ่น", "job": "Lord Knight", "power": 32161}, {"name": "หวานเจี๊ยฟ", "job": "Sniper", "power": 31969}, {"name": "zzzTOzzz", "job": "High Wizard", "power": 31746}, {"name": "Dumpling", "job": "Priest", "power": 30456}],
      "ทีม 10": [{"name": "Cal2nivaLxD", "job": "Paladin", "power": 31697}, {"name": "Yots10", "job": "Druid", "power": 31613}, {"name": "RMS", "job": "Assassin Cross", "power": 31560}, {"name": "Lorying", "job": "High Wizard", "power": 31502}, {"name": "หวังสี้เจ้า", "job": "Priest", "power": 29973}],
      "ทีม 11": [{"name": "OTANI", "job": "High Wizard", "power": 31497}, {"name": "Yami", "job": "Lord Knight", "power": 31274}, {"name": "NaTzo", "job": "High Wizard", "power": 30848}, {"name": "Satanic", "job": "Lord Knight", "power": 30844}, {"name": "SappeXo", "job": "Priest", "power": 29690}],
      "ทีม 12": [{"name": "ROidiotgame", "job": "Champion", "power": 30736}, {"name": "Vaduka-Tampan", "job": "High Wizard", "power": 30527}, {"name": "นายไข่ดาว", "job": "Gunslinger", "power": 30429}, {"name": "Orasa", "job": "Sniper", "power": 30376}, {"name": "ป่ายแก่ๆ", "job": "Priest", "power": 29247}]
    }
  },
  {
    "title": "สนามรอง  (81 คน / 17 ทีม)",
    "teams": {
      "ทีม 1": [{"name": "Fujiro", "job": "Assassin Cross", "power": 30251}, {"name": "KJสารวัตรแจ๊ะ", "job": "Gunslinger", "power": 30184}, {"name": "HyPerTo", "job": "Lord Knight", "power": 29994}, {"name": "Katoonz", "job": "Gunslinger", "power": 29936}, {"name": "P9D", "job": "High Wizard", "power": 29627}],
      "ทีม 2": [{"name": "Pairot_1995", "job": "Sniper", "power": 29494}, {"name": "I'm18", "job": "Sniper", "power": 29434}, {"name": "凡依", "job": "Merchant", "power": 29313}, {"name": "Maboom", "job": "Sniper", "power": 29251}, {"name": "MasterClover", "job": "Champion", "power": 29153}],
      "ทีม 3": [{"name": "ขุนทวนสวนทวาร", "job": "Gunslinger", "power": 29093}, {"name": "InseptiOn", "job": "Lord Knight", "power": 28953}, {"name": "Atomic", "job": "Sniper", "power": 28920}, {"name": "CGame", "job": "Gunslinger", "power": 28828}, {"name": "GOLF", "job": "Priest", "power": 28745}],
      "ทีม 4": [{"name": "เวลดอล่า", "job": "Gunslinger", "power": 28663}, {"name": "3ararentz", "job": "Sniper", "power": 28530}, {"name": "FishStop", "job": "High Wizard", "power": 28484}, {"name": "ยาซป", "job": "Gunslinger", "power": 28297}, {"name": "Avalon", "job": "Paladin", "power": 28038}],
      "ทีม 5": [{"name": "Flexx", "job": "Assassin Cross", "power": 27909}, {"name": "mochi3", "job": "High Wizard", "power": 27833}, {"name": "Paxx", "job": "Sniper", "power": 27752}, {"name": "พระปลาย", "job": "Priest", "power": 27745}, {"name": "Over_Topup", "job": "Lord Knight", "power": 27579}],
      "ทีม 6": [{"name": "Mahlakor", "job": "Priest", "power": 27552}, {"name": "Jade", "job": "Gunslinger", "power": 27434}, {"name": "BoyKub", "job": "Sniper", "power": 27392}, {"name": "พระอาทิตย์", "job": "Gunslinger", "power": 27347}, {"name": "Ms,08", "job": "Sniper", "power": 27104}],
      "ทีม 7": [{"name": "อามะ-กันเต", "job": "Priest", "power": 26953}, {"name": "Valkyriㅌ", "job": "Gunslinger", "power": 26732}, {"name": "DARKCAFE", "job": "Assassin Cross", "power": 26693}, {"name": "aut", "job": "Sniper", "power": 26455}, {"name": "หรรม้อยแซงเลย", "job": "Druid", "power": 26292}],
      "ทีม 8": [{"name": "น้องxoe", "job": "Priest", "power": 26219}, {"name": "Pew", "job": "Merchant", "power": 26127}, {"name": "บักหรรม้อยเอง", "job": "Gunslinger", "power": 26030}, {"name": "banana1fruit", "job": "Sniper", "power": 25873}, {"name": "cHk", "job": "Assassin Cross", "power": 25855}],
      "ทีม 9": [{"name": "ชาวประมง", "job": "Gunslinger", "power": 25714}, {"name": "fluffi_cia", "job": "Priest", "power": 25712}, {"name": "Almonso", "job": "Champion", "power": 25672}, {"name": "TAETIS007", "job": "Sniper", "power": 25670}, {"name": "Mahnow", "job": "Sniper", "power": 25526}],
      "ทีม 10": [{"name": "MANJI", "job": "High Wizard", "power": 25256}, {"name": "Non79", "job": "Gunslinger", "power": 25193}, {"name": "หนูอ้ดนะพี่ไหวหรอ", "job": "Lord Knight", "power": 25158}, {"name": "Joesoizero", "job": "Sniper", "power": 24801}, {"name": "BixDix", "job": "Gunslinger", "power": 24080}],
      "ทีม 11": [{"name": "ZEON", "job": "Sniper", "power": 23968}, {"name": "Homey", "job": "Merchant", "power": 23832}, {"name": "Lynlin", "job": "High Wizard", "power": 23647}, {"name": "หญิงแท้", "job": "Lord Knight", "power": 23494}, {"name": "DOMONCUS", "job": "Paladin", "power": 23443}],
      "ทีม 12": [{"name": "monza", "job": "Priest", "power": 23440}, {"name": "McLai", "job": "Druid", "power": 23227}, {"name": "TARZANXIII", "job": "Gunslinger", "power": 23201}, {"name": "iRokz", "job": "Sniper", "power": 23193}, {"name": "Akiri", "job": "Assassin Cross", "power": 23100}],
      "ทีม 13": [{"name": "ONI", "job": "Sniper", "power": 22880}, {"name": "TheNinez", "job": "Sniper", "power": 22724}, {"name": "กระต่ายบิน", "job": "Sniper", "power": 22556}, {"name": "หยองแยง", "job": "Lord Knight", "power": 22336}, {"name": "โยชิแมวดื้อ", "job": "Merchant", "power": 22287}],
      "ทีม 14": [{"name": "BASFISHING", "job": "Sniper", "power": 22285}, {"name": "0xlantern", "job": "Assassin Cross", "power": 22247}, {"name": "KiMuChi", "job": "Champion", "power": 22155}, {"name": "Duckza", "job": "High Wizard", "power": 22059}, {"name": "อิหล่ามืดบิน", "job": "Assassin Cross", "power": 22048}],
      "ทีม 15": [{"name": "Weedsp", "job": "Sniper", "power": 21665}, {"name": "ดิมิโกะ", "job": "Paladin", "power": 21651}, {"name": "เอรักดีดีคืนมา", "job": "Priest", "power": 21632}, {"name": "lll", "job": "Priest", "power": 21564}, {"name": "MUF4IN", "job": "Sniper", "power": 21203}],
      "ทีม 16": [{"name": "MrSilverz", "job": "Sniper", "power": 20702}, {"name": "Justice", "job": "High Wizard", "power": 19678}, {"name": "Leaf", "job": "Druid", "power": 19461}, {"name": "SoLoPlayer", "job": "Paladin", "power": 17806}, {"name": "GdGunSlinger", "job": "Gunslinger", "power": 17527}],
      "ทีม 17": [{"name": "zenkie", "job": "Gunslinger", "power": 17397}]
    }
  }
];

/* Default Firebase Cloud Database Config */
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBXPfxhSLBt9dQqf5glFrXvx6KLxqPmEE8",
  authDomain: "topguild-eeb40.firebaseapp.com",
  projectId: "topguild-eeb40",
  storageBucket: "topguild-eeb40.firebasestorage.app",
  messagingSenderId: "879954426796",
  appId: "1:879954426796:web:48e305dc9f78bda6a51809"
};

const JOB_COLORS = {
  "Lord Knight": "#c13829",
  "Paladin": "#e18028",
  "High Wizard": "#2c7eb9",
  "Sniper": "#d4a015",
  "Priest": "#25ae62",
  "Champion": "#15a083",
  "Assassin Cross": "#8b46af",
  "Merchant": "#c2185d",
  "Gunslinger": "#894517",
  "Druid": "#41b388"
};
window.JOB_COLORS = JOB_COLORS;

const JOB_LIST = [
  "Lord Knight", "Paladin", "High Wizard", "Sniper", 
  "Priest", "Champion", "Assassin Cross", "Merchant", 
  "Gunslinger", "Druid"
];

/* App State - Firebase Only (no LocalStorage) */
let guildRoster = {};
  let lockedTeams = {}; // { "0_TeamA": true }
let teamsAssignments = {}; // slotKey -> {name, job, power} | null
let occupiedMap = new Map(); // lowerName -> slotKey
let rowJobFilter = {};
let fieldMeta = [];

let currentFieldIdx = 0;
let activeJobFilter = null;
let rosterSearchQuery = "";

let db = null;
let isFirebaseActive = false;
let unsubRosterListener = null;
let unsubTeamsListener = null;

let currentUser = null; // { username, role, class }

/* Helper Utilities */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

function colorOf(job) {
  return JOB_COLORS[job] || '#8fa8bd';
}

function slotKey(fieldIdx, teamName, i) {
  return `${fieldIdx}|${teamName}|${i}`;
}

function sortTeamNames(names) {
  return names.slice().sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = escapeHtml(message);
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* Master Member Lookups */
function getMasterMemberList() {
  const list = [];
  Object.keys(guildRoster).forEach(job => {
    (guildRoster[job] || []).forEach(m => {
      list.push({ name: m.name, job, power: m.power });
    });
  });
  return list;
}

function getMasterMap() {
  const map = new Map();
  getMasterMemberList().forEach(m => map.set(m.name.trim().toLowerCase(), m));
  return map;
}

/* Initialize Field Meta & Initial Assignments */
function initTeamStructure(rawTeamsData) {
  let teamsData = [];
  if (Array.isArray(rawTeamsData)) {
    teamsData = rawTeamsData;
  } else if (rawTeamsData && typeof rawTeamsData === 'object') {
    if (rawTeamsData.main) teamsData.push(rawTeamsData.main);
    if (rawTeamsData.sub) teamsData.push(rawTeamsData.sub);
  }

  let safeTeamsData = teamsData;
  if (!safeTeamsData || safeTeamsData.length === 0) {
     safeTeamsData = [];
  }
  if (safeTeamsData.length === 1) {
    safeTeamsData.push({
      "title": "สนามรอง",
      "teams": { "ทีม 1": [{},{},{},{},{}] }
    });
  }

  fieldMeta = safeTeamsData.map((group, idx) => {
    const rawNames = Object.keys(group.teams || {});
    const sortedNames = sortTeamNames(rawNames);
    const isMainField = group.title ? group.title.indexOf('Priest') !== -1 : (idx === 0);
    return {
      title: group.title || (isMainField ? 'สนามหลัก' : 'สนามรอง'),
      isMain: isMainField,
      teamNames: sortedNames.length > 0 ? sortedNames : ['ทีม 1'],
      capacity: sortedNames.length > 0 ? Object.fromEntries(sortedNames.map(t => [t, group.teams[t].length])) : {'ทีม 1': 5}
    };
  });
  
  if (fieldMeta.length < 2) {
    fieldMeta[0] = fieldMeta[0] || { title: 'สนามหลัก', isMain: true, teamNames: ['ทีม 1'], capacity: {'ทีม 1': 5} };
    fieldMeta[1] = { title: 'สนามรอง', isMain: false, teamNames: ['ทีม 1'], capacity: {'ทีม 1': 5} };
  }

  teamsAssignments = {};
  occupiedMap.clear();

  teamsData.forEach((group, fieldIdx) => {
    const sortedNames = sortTeamNames(Object.keys(group.teams));
    sortedNames.forEach(teamName => {
      group.teams[teamName].forEach((m, i) => {
        const key = slotKey(fieldIdx, teamName, i);
        if (m && m.name) {
          teamsAssignments[key] = { name: m.name, job: m.job, power: m.power };
          occupiedMap.set(m.name.trim().toLowerCase(), key);
          rowJobFilter[key] = m.job;
        } else {
          teamsAssignments[key] = null;
        }
      });
    });
  });
}

function serializeTeamsState() {
  const arr = fieldMeta.map((fm, fieldIdx) => {
    const teamsObj = {};
    const sortedNames = sortTeamNames(fm.teamNames);
    sortedNames.forEach(teamName => {
      const cap = fm.capacity[teamName];
      const slotList = [];
      for (let i = 0; i < cap; i++) {
        const key = slotKey(fieldIdx, teamName, i);
        const a = teamsAssignments[key];
        if (a && a.name) {
          slotList.push({ name: a.name, job: a.job, power: a.power });
        } else {
          slotList.push({ name: "", job: "", power: null });
        }
      }
      teamsObj[teamName] = slotList;
    });

    return {
      title: fm.title,
      isMain: fm.isMain,
      teams: teamsObj
    };
  });
  
  return {
    main: arr[0] || { title: 'สนามหลัก', isMain: true, teams: { "ทีม 1": [{},{},{},{},{}] } },
    sub: arr[1] || { title: 'สนามรอง', isMain: false, teams: { "ทีม 1": [{},{},{},{},{}] } }
  };
}

/* Save to Firebase only - no LocalStorage */
function saveState() {
  renderAll();

  if (isFirebaseActive && db) {
    const rosterDoc = doc(db, 'guild_system', 'roster');
    const teamsDoc = doc(db, 'guild_system', 'teams');
    Promise.all([
      setDoc(rosterDoc, { data: guildRoster }),
      setDoc(teamsDoc, { data: serializeTeamsState() })
    ]).then(() => {
      showToast("บันทึกข้อมูลไปยัง Firebase สำเร็จ", "success");
    }).catch(err => {
      console.error("Firestore Save Error:", err);
      showToast("เกิดข้อผิดพลาดในการบันทึก: " + err.message, "error");
    });
  }
}

/* Firebase Connection Setup & Listeners - Firebase Only Mode */
async function setupFirebase(configObj) {
  updateStatusUI('connecting', 'กำลังเชื่อมต่อ Firebase Cloud Database (' + configObj.projectId + ')...');

  try {
    // Tear down old listeners & app
    if (unsubRosterListener) { try { unsubRosterListener(); } catch(e){} }
    if (unsubTeamsListener)  { try { unsubTeamsListener();  } catch(e){} }
    const existingApps = getApps();
    if (existingApps.length > 0) { try { await deleteApp(existingApps[0]); } catch(e){} }

    const firebaseApp = initializeApp(configObj);
    db = getFirestore(firebaseApp);
    window.db = db;
    isFirebaseActive = true;

    const rosterDocRef = doc(db, 'guild_system', 'roster');
    const teamsDocRef  = doc(db, 'guild_system', 'teams');

    // Helper: convert docSnap → roster object
    const toRoster = (snap) => {
      if (!snap.exists()) return null;
      const d = snap.data();
      // stored as { data: { "Lord Knight": [...], ... } }
      if (d && d.data && typeof d.data === 'object' && !Array.isArray(d.data)) return d.data;
      return null;
    };

    // Helper: convert docSnap → teams array
    const toTeams = (snap) => {
      if (!snap.exists()) return null;
      const d = snap.data();
      if (!d || !d.data) return null;
      if (Array.isArray(d.data) && d.data.length > 0) return d.data;
      if (typeof d.data === 'object') {
        const arr = [];
        if (d.data.main) arr.push(d.data.main);
        if (d.data.sub) arr.push(d.data.sub);
        if (arr.length > 0) return arr;
      }
      return null;
    };

    // Step 1: Fetch once immediately (getDoc is HTTP, fast & reliable)
    updateStatusUI('connecting', 'กำลังดึงข้อมูลจาก Firebase...');
    const [rSnap, tSnap] = await Promise.all([
      getDoc(rosterDocRef),
      getDoc(teamsDocRef)
    ]);

    updateStatusUI('online', 'เชื่อมต่อ Firebase Cloud Database (' + configObj.projectId + ') Active 🟢');

    if (window.ensureDefaultAdmin) window.ensureDefaultAdmin();
    if (window.checkAuth) window.checkAuth();
    if (window.setupDungeonFirebase) window.setupDungeonFirebase();
    if (window.setupAttendanceFirebase) window.setupAttendanceFirebase();
    if (window.setupLeaveFirebase) window.setupLeaveFirebase();

    const rosterData = toRoster(rSnap);
    const teamsData  = toTeams(tSnap);

    guildRoster = rosterData || {};
    if (teamsData) {
      initTeamStructure(teamsData);
    } else {
      initTeamStructure([]);
    }

    renderAll();

    // Step 2: Real-time listener for live updates
    unsubRosterListener = onSnapshot(rosterDocRef, (snap) => {
      const r = toRoster(snap);
      if (r) {
        guildRoster = r;
        renderAll();
      }
    }, (err) => {
      console.error("Roster listener error:", err);
    });

    unsubTeamsListener = onSnapshot(teamsDocRef, (snap) => {
      const t = toTeams(snap);
      if (t) {
        initTeamStructure(t);
        renderAll();
      }
    }, (err) => {
      console.error("Teams listener error:", err);
    });

  } catch (err) {
    console.error("Firebase init failed:", err);
    isFirebaseActive = false;
    updateStatusUI('local', 'การเชื่อมต่อ Firebase ล้มเหลว: ' + err.message);
    showToast("Firebase เชื่อมต่อไม่สำเร็จ: " + err.message, "error");
    renderAll();
  }
}

function updateStatusUI(mode, text) {
  const dot = document.getElementById('dbStatusDot');
  const txt = document.getElementById('dbStatusText');
  if (!dot || !txt) return;

  dot.className = 'status-indicator ' + mode;
  txt.innerHTML = `สถานะฐานข้อมูล: <b>${escapeHtml(text)}</b>`;
}

function getRosterTotalCount(rosterObj) {
  if (!rosterObj) return 0;
  let count = 0;
  Object.keys(rosterObj).forEach(j => {
    if (Array.isArray(rosterObj[j])) count += rosterObj[j].length;
  });
  return count;
}

/* RENDERERS */

function renderRoster() {
  const masterList = getMasterMemberList();
  const datalist = document.getElementById('rosterDatalist');
  if (datalist) {
    datalist.innerHTML = masterList.map(m => `<option value="${escapeHtml(m.name)}">${escapeHtml(m.job)} (Power: ${m.power || 0})</option>`).join('');
  }
  const summaryStrip = document.getElementById('summaryStrip');
  const jobGrid = document.getElementById('jobGrid');
  if (!summaryStrip || !jobGrid) return;

  let totalMembers = 0;
  const filteredRoster = {};

  Object.keys(guildRoster).forEach(job => {
    const rawList = Array.isArray(guildRoster[job]) ? guildRoster[job] : [];
    const seen = new Set();

    const list = rawList.filter(m => {
      if (!m || !m.name) return false;
      const mName = String(m.name).trim();
      if (!mName) return false;
      if (rosterSearchQuery && !mName.toLowerCase().includes(rosterSearchQuery.toLowerCase())) {
        return false;
      }
      const k = mName.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).sort((a, b) => (Number(b.power) || 0) - (Number(a.power) || 0));

    filteredRoster[job] = list;
    totalMembers += list.length;
  });

  const jobsSorted = Object.keys(filteredRoster).sort((a, b) => filteredRoster[b].length - filteredRoster[a].length);

  summaryStrip.innerHTML = `
    <div class="summary-total-card">
      <div class="summary-total-info">
        <span class="summary-total-icon">🛡️</span>
        <div>
          <div class="summary-total-title">สมาชิกทั้งหมดในกิลด์</div>
          <div class="summary-total-subtitle">จำแนกตาม 10 สายอาชีพ</div>
        </div>
      </div>
      <div class="summary-total-count">${totalMembers} <span>คน</span></div>
    </div>

    <div class="summary-jobs-grid">
      ${jobsSorted.map(job => {
        const count = filteredRoster[job].length;
        const color = colorOf(job);
        return `
          <div class="summary-job-card" style="--job-color:${color}">
            <div class="summary-job-title">
              <span class="dot" style="background:${color}"></span>
              <span>${escapeHtml(job)}</span>
            </div>
            <div class="summary-job-count">${count}</div>
          </div>`;
      }).join('')}
    </div>`;

  jobGrid.innerHTML = jobsSorted.map(job => {
    const list = filteredRoster[job];
    const color = colorOf(job);
    const rows = list.map((m, i) => `
      <tr>
        <td class="rank">${i + 1}</td>
        <td><b>${escapeHtml(m.name)}</b></td>
        <td class="power num-col">${m.power != null ? m.power.toLocaleString('en-US') : '-'}</td>
        <td class="actions" style="text-align:center;">
          <button class="btn-secondary edit-btn" style="padding:3px 10px;font-size:12px;border-radius:6px;" data-job="${escapeHtml(job)}" data-name="${escapeHtml(m.name)}" data-power="${m.power || ''}" data-fieldpref="${m.fieldPref || 'any'}">แก้ไข</button>
        </td>
      </tr>`).join('');

    return `
      <div class="job-card" style="--job-color:${color}">
        <div class="job-card-head">
          <span class="job-name"><span class="dot"></span>${escapeHtml(job)}</span>
          <span class="job-count">${list.length} คน</span>
        </div>
        <table>
          <thead><tr><th style="width:30px;">#</th><th>ชื่อ</th><th class="num-col">ค่าพลัง</th><th style="width:65px;text-align:center;">การจัดการ</th></tr></thead>
          <tbody>${rows.length > 0 ? rows : '<tr><td colspan="4" style="text-align:center;color:var(--text-lo);padding:14px;">ไม่มีข้อมูล</td></tr>'}</tbody>
        </table>
      </div>`;
  }).join('');

  // Attach Edit Listeners
  jobGrid.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const d = e.currentTarget.dataset;
      openMemberModal(d.name, d.job, d.power, d.fieldpref);
    });
  });
}

/* Page 2: Teams Renderer */
function buildFieldTabs() {
  const fieldTabsEl = document.getElementById('fieldTabs');
  if (!fieldTabsEl) return;
  fieldTabsEl.innerHTML = '';

  fieldMeta.forEach((fm, idx) => {
    const label = fm.title.split('(')[0].trim();
    const btn = document.createElement('button');
    btn.className = 'field-tab-btn' + (idx === currentFieldIdx ? ' active' : '');
    btn.textContent = label;
    btn.addEventListener('click', () => {
        currentFieldIdx = idx;
        document.querySelectorAll('#fieldTabs .field-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTeams();
      });
    fieldTabsEl.appendChild(btn);
  });
}

function getActiveFieldStats() {
  const fm = fieldMeta[currentFieldIdx];
  let totalAssigned = 0;
  let totalCapacity = 0;
  const jobCounts = {};
  JOB_LIST.forEach(j => jobCounts[j] = 0);

  if (fm) {
    if (currentFieldIdx === 1) {
      // Sub Field total capacity = Total Guild Members - 60
      const totalMembers = getMasterMemberList().length;
      totalCapacity = Math.max(0, totalMembers - 60);
    } else {
      fm.teamNames.forEach(teamName => {
        totalCapacity += (fm.capacity[teamName] || 5);
      });
    }

    fm.teamNames.forEach(teamName => {
      const cap = fm.capacity[teamName] || 5;
      for (let i = 0; i < cap; i++) {
        const key = slotKey(currentFieldIdx, teamName, i);
        const a = teamsAssignments[key];
        if (a && a.name) {
          totalAssigned++;
          if (a.job && jobCounts[a.job] !== undefined) {
            jobCounts[a.job]++;
          }
        }
      }
    });
  }

  return { totalAssigned, totalCapacity, jobCounts };
}

function buildJobChips() {
  const jobChipsEl = document.getElementById('jobChips');
  if (!jobChipsEl) return;

  const fieldStats = getActiveFieldStats();
  const fieldTitleText = currentFieldIdx === 0 ? "สนามหลัก (Main Field)" : "สนามรอง (Sub Field)";

  let html = `
    <div class="summary-total-card">
      <div class="summary-total-info">
        <span class="summary-total-icon">⚔️</span>
        <div>
          <div class="summary-total-title">การจัดทีม${escapeHtml(fieldTitleText)}</div>
          <div class="summary-total-subtitle">สมาชิกที่จัดลงทีมในสังกัดสนามนี้</div>
        </div>
      </div>
      <div class="summary-total-count">${fieldStats.totalAssigned}/${fieldStats.totalCapacity} <span>คน</span></div>
    </div>

    <div class="job-filter-grid">
      <div class="summary-job-card filter-card ${activeJobFilter === null ? 'active' : ''}" data-job="">
        <div class="summary-job-title">
          <span class="dot" style="background:var(--blue-700)"></span>
          <span>ทั้งหมดในสนามนี้</span>
        </div>
        <div class="summary-job-count" style="color:var(--blue-700);background:var(--blue-100);">${fieldStats.totalAssigned}/${fieldStats.totalCapacity}</div>
      </div>
      ${JOB_LIST.map(job => {
        const color = colorOf(job);
        const countInField = fieldStats.jobCounts[job] || 0;
        const isActive = activeJobFilter === job;
        return `
          <div class="summary-job-card filter-card ${isActive ? 'active' : ''}" data-job="${escapeHtml(job)}" style="--job-color:${color}">
            <div class="summary-job-title">
              <span class="dot" style="background:${color}"></span>
              <span>${escapeHtml(job)}</span>
            </div>
            <div class="summary-job-count">${countInField}</div>
          </div>`;
      }).join('')}
    </div>`;

  jobChipsEl.innerHTML = html;

  jobChipsEl.querySelectorAll('.filter-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const selectedJob = e.currentTarget.dataset.job;
      if (!selectedJob) {
        activeJobFilter = null;
      } else {
        activeJobFilter = (activeJobFilter === selectedJob) ? null : selectedJob;
      }
      renderTeams();
    });
  });
}

function getUnassignedJobCounts() {
  const counts = {};
  JOB_LIST.forEach(j => counts[j] = 0);
  const masterMap = getMasterMap();

  masterMap.forEach((m, lowerName) => {
    if (!occupiedMap.has(lowerName)) {
      if (counts[m.job] !== undefined) {
        counts[m.job]++;
      }
    }
  });

  return counts;
}

function jobSelectHtml(key, selectedJob) {
  const unassignedCounts = getUnassignedJobCounts();
  const cleanSelected = (selectedJob || '').trim();

  let out = `<option value="" ${!cleanSelected ? 'selected' : ''}>— เลือกอาชีพ —</option>`;
  JOB_LIST.forEach(j => {
    const remain = unassignedCounts[j] || 0;
    const isSelected = cleanSelected !== '' && cleanSelected.toLowerCase() === j.toLowerCase();
    // Show only jobs that have remaining players or if currently selected in this row
    if (remain > 0 || isSelected) {
      // Clean label: selected option ONLY displays pure job name (e.g. "High Wizard"), unselected shows (เหลือ N คน)
      const labelText = isSelected ? escapeHtml(j) : `${escapeHtml(j)} (เหลือ ${remain} คน)`;
      out += `<option value="${escapeHtml(j)}" ${isSelected ? 'selected' : ''}>${labelText}</option>`;
    }
  });
  return out;
}

function availableNamesForJob(job, key) {
  const current = teamsAssignments[key];
  const currentNameKey = current && current.name ? current.name.trim().toLowerCase() : null;

  let candidates = [];
  if (job && guildRoster[job]) {
    candidates = guildRoster[job];
  } else {
    // If no job filter selected, offer ALL remaining unassigned members in the guild
    candidates = getMasterMemberList();
  }

  return candidates.filter(m => {
    const nk = m.name.trim().toLowerCase();
    const ownerKey = occupiedMap.get(nk);
    return !ownerKey || ownerKey === key || nk === currentNameKey;
  }).sort((a, b) => (b.power || 0) - (a.power || 0));
}

function nameSelectHtml(key, job) {
  const current = teamsAssignments[key];
  const currentName = current ? current.name : '';
  const list = availableNamesForJob(job, key);

  let out = `<option value="" ${!currentName ? 'selected' : ''}>— เลือกชื่อ —</option>`;

  if (currentName && !list.some(m => m.name.trim().toLowerCase() === currentName.trim().toLowerCase())) {
    out += `<option value="${escapeHtml(currentName)}" selected>${escapeHtml(currentName)} ⚠</option>`;
  }

  list.forEach(m => {
    const isSelected = currentName && m.name.trim().toLowerCase() === currentName.trim().toLowerCase();
    // Show pure name if selected, or show name + [Job] + Power if unselected in dropdown list
    const jobBadge = isSelected ? '' : ` [${m.job}]`;
    const extraInfo = isSelected ? '' : (m.power != null ? ` (${m.power.toLocaleString('en-US')})` : '');
    out += `<option value="${escapeHtml(m.name)}" ${isSelected ? 'selected' : ''}>${escapeHtml(m.name)}${jobBadge}${extraInfo}</option>`;
  });
  return out;
}


window.toggleLockTeam = function(fieldIdx, teamName) {
  const key = fieldIdx + '_' + teamName;
  lockedTeams[key] = !lockedTeams[key];
  // Save to localStorage
  try { localStorage.setItem('guild_locked_teams', JSON.stringify(lockedTeams)); } catch(e) {}
  renderTeams();
};

function isTeamLocked(fieldIdx, teamName) {
  return !!lockedTeams[fieldIdx + '_' + teamName];
}

// Load locked teams from localStorage
(function() {
  try {
    const saved = localStorage.getItem('guild_locked_teams');
    if (saved) lockedTeams = JSON.parse(saved);
  } catch(e) {}
})();

  function renderTeams() {
  const userRole = window.currentUser ? (window.currentUser.role || window.currentUser.Role || '').toLowerCase() : ''; const isAdmin = window.isUserAdmin();
  const fm = fieldMeta[currentFieldIdx];
  const teamsGrid = document.getElementById('teamsGrid');
  if (!fm || !teamsGrid) return;

  let fieldFilled = 0, fieldTotal = 0, teamsIncomplete = 0;
  const missingPriestTeams = [];
  const sortedTeamNames = sortTeamNames(fm.teamNames);

  teamsGrid.innerHTML = sortedTeamNames.map(teamName => {
    const capacity = fm.capacity[teamName];
    let filled = 0, hasPriest = false, matchInTeam = false, teamPowerSum = 0;
    const rows = [];

    for (let i = 0; i < capacity; i++) {
      const key = slotKey(currentFieldIdx, teamName, i);
      const a = teamsAssignments[key];
      const job = rowJobFilter[key] || (a ? a.job : '') || '';

      if (a && a.name) { 
        filled++;
        if (a.power) teamPowerSum += Number(a.power);
      }
      if (a && a.job === 'Priest') hasPriest = true;
      const isMatch = activeJobFilter && a && a.job === activeJobFilter;
      if (isMatch) matchInTeam = true;

      const rowClass = [
        (!a || !a.name) ? 'empty-row' : '',
        activeJobFilter ? (isMatch ? 'match' : 'faded') : ''
      ].filter(Boolean).join(' ');

      rows.push(`
        <tr class="${rowClass}">
          <td class="cell-rank">${i + 1}</td>
          <td>
            <input type="text" class="cell-input name-input autocomplete-member" data-slot="${key}" data-action="mainField" value="${a && a.name ? window.escapeHtml(a.name) : ''}" placeholder="พิมพ์/คลิก..." autocomplete="off" ${isAdmin ? '' : 'disabled'}>
          </td>
          <td>
            <select class="cell-input job-input ${job ? '' : 'empty'}" data-slot="${key}" style="--job-color:${job ? colorOf(job) : ''}" ${isAdmin ? '' : 'disabled'}>
              ${jobSelectHtml(key, job)}
            </select>
          </td>
          <td><input class="cell-input power-input" type="number" data-slot="${key}" value="${a && a.power != null ? a.power : ''}" placeholder="-"></td>
          <td class="cell-action">${isAdmin ? `<button class="clear-btn" data-slot="${key}" title="ล้างช่องนี้">✕</button>` : ''}</td>
        </tr>`);
    }

    fieldFilled += filled;
    fieldTotal += capacity;
    if (filled < capacity) teamsIncomplete++;
    if (!hasPriest) missingPriestTeams.push(teamName);

    const badgeClass = filled === capacity ? (!hasPriest ? 'warn' : 'ok') : '';
    const badgeText = filled === capacity ? (!hasPriest ? '⚠ ไม่มี Priest' : `ครบ ${filled}/${capacity}`) : `ขาด ${capacity - filled} คน`;

    const cardDim = activeJobFilter && !matchInTeam ? 'dim' : '';
      const locked = isTeamLocked(currentFieldIdx, teamName);
    return `
        <div class="team-card ${cardDim}${locked?' locked-team':''}">
        <div class="team-card-head">
          <div class="team-title-group">
            <span>${escapeHtml(teamName)}</span>
            ${locked ? '<span style="font-size:11px;background:#f59e0b;color:white;border-radius:8px;padding:2px 6px;margin-left:4px;">ล็อก</span>' : ''}
              <span class="team-power-sum">${teamPowerSum.toLocaleString('en-US')}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="status-badge ${badgeClass}">${badgeText}</span>
            ${isAdmin ? `<button type="button" onclick="window.toggleLockTeam(${currentFieldIdx}, '${escapeHtml(teamName)}')" style="background:${locked?'#ffffff':'#facc15'};border:none;color:${locked?'#2563eb':'#000000'};border-radius:20px;padding:4px 12px;cursor:pointer;font-size:12px;font-weight:700;box-shadow:0 2px 4px rgba(0,0,0,0.1);">${locked?'ปลดล็อก (Unlock)':'ล็อก (Lock)'}</button>` : ''}
              <button type="button" class="btn-delete-team-card"  data-team="${escapeHtml(teamName)}" title="ลบ${escapeHtml(teamName)}">✕</button>
          </div>
        </div>
        <table class="team-table">
          <thead><tr><th style="width:18px;"></th><th>ชื่อ</th><th>อาชีพ</th><th>ค่าพลัง</th><th style="width:26px;"></th></tr></thead>
          <tbody>${rows.join('')}</tbody>
        </table>
      </div>`;
  }).join('');

  // Status Bar
  
  // Count jobs in current field assignments
  const jobCountInField = {};
  Object.keys(teamsAssignments).forEach(k => {
    if (k.startsWith(currentFieldIdx + '_')) {
      const a = teamsAssignments[k];
      if (a && a.job) jobCountInField[a.job] = (jobCountInField[a.job] || 0) + 1;
    }
  });
  
  const statusBar = document.getElementById('fieldStatusBar');
  if (statusBar) {
    const displayTotal = currentFieldIdx === 1 ? Math.max(0, getMasterMemberList().length - 60) : fieldTotal;
    let bar = `<span class="pill">กรอกแล้ว <b>${fieldFilled}</b> / ${displayTotal} คน</span>`;
    bar += `<span class="pill">ทีมยังไม่ครบ <b>${teamsIncomplete}</b> ทีม</span>`;
      if (Object.keys(jobCountInField).length > 0) {
        bar += '<span class="pill" style="background:var(--bg-soft);">อาชีพ: ' + Object.entries(jobCountInField).sort((a,b)=>b[1]-a[1]).map(([j,c])=>'<b>'+escapeHtml(j)+'</b> '+c+'คน').join(' | ') + '</span>';
      }
    if (missingPriestTeams.length > 0) {
      const listStr = missingPriestTeams.join(', ');
      bar += `<span class="pill warn">⚠ ทีมขาด Priest <b>${missingPriestTeams.length}</b> ทีม (${escapeHtml(listStr)})</span>`;
    } else {
      bar += `<span class="pill" style="border-color:var(--ok);color:var(--ok);">✓ ทุกทีมมี Priest ครบแล้ว</span>`;
    }
    statusBar.innerHTML = bar;
  }

  // Toggle Action Buttons depending on field index and admin role
  const btnMain = document.getElementById('btnAutoOptimizeMain');
  const btnSub = document.getElementById('btnAutoOptimizeSub');
  
  if (btnMain) btnMain.style.display = (isAdmin && currentFieldIdx === 0) ? 'block' : 'none';
  if (btnSub) btnSub.style.display = (isAdmin && currentFieldIdx === 1) ? 'block' : 'none';

  attachRowListeners();
  renderSidebar();
}

function renderSidebar() {
  const sidebarBody = document.getElementById('sidebarBody');
  if (!sidebarBody) return;

  const allMembers = getMasterMemberList();
  let missing = allMembers.filter(m => !occupiedMap.has(m.name.trim().toLowerCase()));

  if (activeJobFilter) {
    missing = missing.filter(m => m.job === activeJobFilter);
  }

  missing.sort((a, b) => (b.power || 0) - (a.power || 0));

  if (missing.length === 0) {
    sidebarBody.innerHTML = `<div class="sidebar-empty"><span>ครบทุกคนแล้ว</span>ไม่มีสมาชิกที่ตกหล่นจากตาราง</div>`;
    return;
  }

  sidebarBody.innerHTML = missing.map(m => `
    <div class="missing-row">
      <span class="dot" style="background:${colorOf(m.job)}"></span>
      <span class="mm-name">${escapeHtml(m.name)}</span>
      <span class="mm-job">${escapeHtml(m.job)}</span>
      <span class="mm-power">${m.power != null ? m.power.toLocaleString('en-US') : '-'}</span>
    </div>`).join('');
}

/* Editing Handlers */
function handleJobFilterChange(key, newJob) {
  rowJobFilter[key] = newJob;
  const current = teamsAssignments[key];

  if (current && current.name && current.job !== newJob) {
    occupiedMap.delete(current.name.trim().toLowerCase());
    teamsAssignments[key] = null;
  }

  saveState();
}

function handleNameChange(key, rawValue) {
  const newName = (rawValue || '').trim();
  const current = teamsAssignments[key];
  const oldName = current ? current.name : '';
  if (newName === oldName) return;

  if (oldName) {
    occupiedMap.delete(oldName.trim().toLowerCase());
  }

  if (newName === '') {
    teamsAssignments[key] = null;
  } else {
    const nk = newName.toLowerCase();
    if (occupiedMap.has(nk)) {
      const otherKey = occupiedMap.get(nk);
      if (otherKey !== key) {
        teamsAssignments[otherKey] = null;
      }
    }

    const masterMap = getMasterMap();
    const matched = masterMap.get(nk);

    teamsAssignments[key] = {
      name: newName,
      job: matched ? matched.job : (rowJobFilter[key] || ''),
      power: matched ? matched.power : null
    };

    occupiedMap.set(nk, key);
    if (matched) rowJobFilter[key] = matched.job;
  }

  saveState();
}

function handlePowerChange(key, rawValue) {
  const val = rawValue === '' ? null : Number(rawValue);
  const current = teamsAssignments[key];

  if (current) {
    current.power = val;
    // Also update in guild master roster
    const masterMap = getMasterMap();
    const matched = masterMap.get(current.name.toLowerCase());
    if (matched) matched.power = val;
  } else {
    teamsAssignments[key] = { name: '', job: rowJobFilter[key] || '', power: val };
  }

  saveState();
}

function handleClearSlot(key) {
  const current = teamsAssignments[key];
  if (current && current.name) {
    occupiedMap.delete(current.name.trim().toLowerCase());
  }
  teamsAssignments[key] = null;
  rowJobFilter[key] = '';
  saveState();
}

function attachRowListeners() {
  document.querySelectorAll('#teamsGrid .job-input').forEach(sel => {
    sel.addEventListener('change', e => handleJobFilterChange(e.target.dataset.slot, e.target.value));
  });
  document.querySelectorAll('#teamsGrid .name-input').forEach(sel => {
    sel.addEventListener('change', e => handleNameChange(e.target.dataset.slot, e.target.value));
  });
  document.querySelectorAll('#teamsGrid .power-input').forEach(inp => {
    inp.addEventListener('change', e => handlePowerChange(e.target.dataset.slot, e.target.value));
  });
  document.querySelectorAll('#teamsGrid .clear-btn').forEach(btn => {
    btn.addEventListener('click', e => handleClearSlot(e.currentTarget.dataset.slot));
  });
  document.querySelectorAll('#teamsGrid .btn-delete-team-card').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      removeSpecificTeam(e.currentTarget.dataset.team);
    });
  });
}

/* Member CRUD Logic */
function openMemberModal(name = '', job = '', power = '', fieldPref = 'any') {
  document.getElementById('editOriginalName').value = name;
  document.getElementById('modalMemberName').value = name;
  document.getElementById('modalMemberJob').value = job;
  document.getElementById('modalMemberPower').value = power;
  
  const fPrefEl = document.getElementById('modalMemberFieldPref');
  if (fPrefEl) fPrefEl.value = fieldPref;
  
  document.getElementById('modalTitle').textContent = name ? 'แก้ไขข้อมูลสมาชิก' : 'เพิ่มสมาชิกใหม่';
  
  const deleteBtn = document.getElementById('btnDeleteMemberModal');
  if (deleteBtn) {
    if (currentUser && currentUser.role !== 'admin') {
      deleteBtn.style.display = 'none';
    } else {
      deleteBtn.style.display = name ? 'block' : 'none';
    }
  }
  
  document.getElementById('memberModal').classList.add('show');
}

function closeMemberModal() {
  document.getElementById('memberModal').classList.remove('show');
}

function saveMemberFromModal(origName, name, job, power, fieldPref = 'any') {
  const newNameLower = name.trim().toLowerCase();
  const origNameLower = origName ? origName.trim().toLowerCase() : null;
  
  // 1. ตรวจสอบป้องกันชื่อซ้ำกับคนอื่น
  let foundOther = false;
  let existingJob = null;
  Object.keys(guildRoster).forEach(j => {
    const found = (guildRoster[j] || []).find(m => m.name.trim().toLowerCase() === newNameLower);
    if (found) {
      if (!origNameLower || origNameLower !== newNameLower) {
        foundOther = true;
        existingJob = j;
      }
    }
  });

  if (foundOther) {
    showToast(`ชื่อ "${name}" มีอยู่แล้วในระบบ (อาชีพ ${existingJob}) ไม่สามารถใช้ชื่อซ้ำได้!`, "error");
    return;
  }

  // 2. จัดการอัปเดตทีม (กรณีแก้ไขชื่อ/อาชีพ/พลัง)
  if (origNameLower && occupiedMap.has(origNameLower)) {
    const slot = occupiedMap.get(origNameLower);
    const existingTeamData = teamsAssignments[slot];
    if (existingTeamData) {
      if (existingTeamData.job !== job) {
        teamsAssignments[slot] = null;
        occupiedMap.delete(origNameLower);
        showToast(`ระบบนำ ${origName} ออกจากทีมชั่วคราว เนื่องจากการเปลี่ยนอาชีพ`, "warning");
      } else {
        teamsAssignments[slot].name = name;
        teamsAssignments[slot].power = power;
        // Don't update fieldPref in teamsAssignment since it's transient
        if (origNameLower !== newNameLower) {
          occupiedMap.delete(origNameLower);
          occupiedMap.set(newNameLower, slot);
        }
      }
    }
  }

  // 3. ล้างรายชื่อเดิม (และที่อาจซ้ำ) ออกจากทุกอาชีพ
  Object.keys(guildRoster).forEach(j => {
    guildRoster[j] = (guildRoster[j] || []).filter(m => {
      const mLower = m.name.trim().toLowerCase();
      return mLower !== origNameLower && mLower !== newNameLower;
    });
  });

  // 4. เพิ่มข้อมูลลงอาชีพที่ถูกต้อง
  if (!guildRoster[job]) guildRoster[job] = [];
  guildRoster[job].push({ name, power, fieldPref });

  closeMemberModal();
  saveState(); 
  if (window.updateUserClass) {
    window.updateUserClass(newNameLower, job);
  }
  showToast(`บันทึกสมาชิก "${name}" สำเร็จ`, "success");
  console.log(`[Member DB Log] Update Name: ${name}, fieldPref: ${fieldPref}`);
}

function deleteMember(job, name, triggerSave = true) {
  Object.keys(guildRoster).forEach(j => {
    guildRoster[j] = (guildRoster[j] || []).filter(m => m.name.toLowerCase() !== name.toLowerCase());
  });

  // Remove from teams if assigned
  const nk = name.trim().toLowerCase();
  if (occupiedMap.has(nk)) {
    const slot = occupiedMap.get(nk);
    teamsAssignments[slot] = null;
    occupiedMap.delete(nk);
  }

  if (triggerSave) {
    saveState();
    showToast(`ลบสมาชิก "${name}" เรียบร้อยแล้ว`, "info");
  }
}

function openBulkAddModal() {
  const modal = document.getElementById('bulkAddModal');
  if (modal) {
    document.getElementById('bulkAddText').value = '';
    modal.classList.add('show');
  }
}
window.openBulkAddModal = openBulkAddModal;

function closeBulkAddModal() {
  const modal = document.getElementById('bulkAddModal');
  if (modal) {
    modal.classList.remove('show');
  }
}
window.closeBulkAddModal = closeBulkAddModal;

window.processBulkAdd = function() {
  const text = document.getElementById('bulkAddText').value.trim();
  if (!text) {
    showToast("กรุณาวางข้อมูลรายชื่อก่อน", "warning");
    return;
  }

  const lines = text.split('\n');
  let addedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  const jobMap = {};
  JOB_LIST.forEach(j => {
    jobMap[j.toLowerCase()] = j;
    jobMap[j.replace(/\s+/g, '').toLowerCase()] = j;
  });

  lines.forEach(line => {
    if (!line.trim()) return;

    // Split by tab, comma, or multiple spaces
    let parts = line.split(/\t|,| {2,}/).map(p => p.trim()).filter(Boolean);
    if (parts.length < 3) {
      parts = line.split(/\s+/).map(p => p.trim()).filter(Boolean);
    }
    if (parts.length < 3) { errorCount++; return; }

    const name = parts[0];

    // Detect power: last numeric part
    let powerIndex = -1;
    for (let i = parts.length - 1; i >= 1; i--) {
      const n = parseInt(parts[i].replace(/,/g, ''), 10);
      if (!isNaN(n) && n > 0) { powerIndex = i; break; }
    }
    if (powerIndex === -1) { errorCount++; return; }

    // Job = everything between name and power
    const jobRaw = parts.slice(1, powerIndex).join(' ').trim();
    const normalizedJob = jobRaw.toLowerCase().replace(/\s+/g, '');
    const job = jobMap[normalizedJob] || jobMap[jobRaw.toLowerCase()];
    const power = parseInt(parts[powerIndex].replace(/,/g, ''), 10);

    if (!name || !job || isNaN(power)) { errorCount++; return; }

    const nameLower = name.toLowerCase();

    // Find if member exists anywhere in roster
    let existingJob = null;
    let existingIdx = -1;
    Object.keys(guildRoster).forEach(j => {
      const arr = guildRoster[j] || [];
      const i = arr.findIndex(m => m.name.trim().toLowerCase() === nameLower);
      if (i !== -1) { existingJob = j; existingIdx = i; }
    });

    if (existingJob !== null) {
      // UPDATE existing member
      if (existingJob === job) {
        // Same job — update power and name casing
        guildRoster[existingJob][existingIdx].power = power;
        guildRoster[existingJob][existingIdx].name = name;
      } else {
        // Changed job — move to new job group
        const old = guildRoster[existingJob].splice(existingIdx, 1)[0];
        if (!guildRoster[job]) guildRoster[job] = [];
        guildRoster[job].push({ name, power, requirement: old.requirement || 'all' });
      }
      updatedCount++;
    } else {
      // ADD new member
      if (!guildRoster[job]) guildRoster[job] = [];
      guildRoster[job].push({ name, power, requirement: 'all' });
      addedCount++;
    }
  });

  saveState();
  renderJobGrid();
  updateSummaryStrip();
  closeBulkAddModal();

  const parts2 = [];
  if (addedCount > 0) parts2.push(`เพิ่มใหม่ ${addedCount} คน`);
  if (updatedCount > 0) parts2.push(`อัปเดต ${updatedCount} คน`);
  if (errorCount > 0) parts2.push(`(ข้ามข้อมูลผิดพลาด ${errorCount} รายการ)`);
  showToast(parts2.join(' | ') || 'ไม่มีการเปลี่ยนแปลง', (addedCount + updatedCount > 0) ? 'success' : 'warning');
};

window.openAutoMatchModal = function() {
  const modal = document.getElementById('autoMatchModal');
  if (modal) {
    modal.classList.add('show');
    const customMainListText = document.getElementById('customMainListText');
    const customListCountBadge = document.getElementById('customListCountBadge');
    if (customMainListText && !customMainListText.value.trim()) {
      const rec60 = getRecommendedMain60Candidates();
      customMainListText.value = rec60.map(m => m.name).join('\n');
      if (customListCountBadge) customListCountBadge.textContent = `ตรวจพบรายชื่อ: ${rec60.length} / 60 คน`;
    }
  }
};

window.closeAutoMatchModal = function() {
  const modal = document.getElementById('autoMatchModal');
  if (modal) {
    modal.classList.remove('show');
  }
};

/* Custom Guild Team Optimization Algorithm */
function autoOptimizeTeams(customMainNames = null, mode = 'both') {
  const masterList = getMasterMemberList();

  if (mode === 'both') {
    teamsAssignments = {};
    occupiedMap.clear();
  } else if (mode === 'main') {
    const mainFm = fieldMeta[0];
    if (mainFm) {
      mainFm.teamNames.forEach(teamName => {
          if (isTeamLocked(0, teamName)) return; // Skip clearing locked team
        const cap = mainFm.capacity[teamName] || 5;
        for (let i = 0; i < cap; i++) {
          const key = slotKey(0, teamName, i);
          if (teamsAssignments[key]) {
            occupiedMap.delete(teamsAssignments[key].name.trim().toLowerCase());
            delete teamsAssignments[key];
            delete rowJobFilter[key];
          }
        }
      });
    }
  } else if (mode === 'sub') {
    const subFm = fieldMeta[1];
    if (subFm) {
      subFm.teamNames.forEach(teamName => {
          if (isTeamLocked(1, teamName)) return; // Skip clearing locked team
        const cap = subFm.capacity[teamName] || 5;
        for (let i = 0; i < cap; i++) {
          const key = slotKey(1, teamName, i);
          if (teamsAssignments[key]) {
            occupiedMap.delete(teamsAssignments[key].name.trim().toLowerCase());
            delete teamsAssignments[key];
            delete rowJobFilter[key];
          }
        }
      });
    }
  }

  const assignedSet = new Set(occupiedMap.keys());
    
    // Also ensure all locked members are in assignedSet (just to be absolutely safe)
    Object.keys(teamsAssignments).forEach(key => {
      const parts = key.split('_');
      if (parts.length >= 2) {
        const fieldIdx = parseInt(parts[0]);
        const teamName = parts[1];
        if (isTeamLocked(fieldIdx, teamName)) {
           if (teamsAssignments[key].name) {
             assignedSet.add(teamsAssignments[key].name.trim().toLowerCase());
             occupiedMap.set(teamsAssignments[key].name.trim().toLowerCase(), key);
           }
        }
      }
    });

  let mainCandidates = [];

  if (customMainNames && Array.isArray(customMainNames) && customMainNames.length > 0) {
    const customSet = new Set(customMainNames.map(n => n.trim().toLowerCase()));
    
    // Split masterList into main candidates
    masterList.forEach(m => {
      const lower = m.name.trim().toLowerCase();
      if (customSet.has(lower)) {
        mainCandidates.push(m);
      }
    });

    mainCandidates.sort((a, b) => (b.power || 0) - (a.power || 0));
  } else {
    // Main Field Selection Rule: Pick 60 candidates guaranteed to include at least 12 top Priests!
    const allPriests = masterList.filter(m => m.job === 'Priest').sort((a, b) => (b.power || 0) - (a.power || 0));
    const top12Priests = allPriests.slice(0, 12);
    const top12PriestNames = new Set(top12Priests.map(p => p.name.trim().toLowerCase()));

    const remainingMembers = masterList.filter(m => !top12PriestNames.has(m.name.trim().toLowerCase())).sort((a, b) => (b.power || 0) - (a.power || 0));
    
    const neededOthers = Math.max(0, 60 - top12Priests.length);
    const topOthers = remainingMembers.slice(0, neededOthers);

    mainCandidates = [...top12Priests, ...topOthers];
    mainCandidates.sort((a, b) => (b.power || 0) - (a.power || 0));
  }

  /* --- 1. MAIN FIELD OPTIMIZATION (Field 0) --- */
  if (mode === 'both' || mode === 'main') {
  const mainFm = fieldMeta[0];
  if (mainFm) {
    const mainTeamNames = sortTeamNames(mainFm.teamNames);
    const neededPriests = mainTeamNames.length;
    const mainPriests = mainCandidates.filter(m => m.job === 'Priest').sort((a, b) => (b.power || 0) - (a.power || 0));

    // Validation: Check if Priests in Main Field names are sufficient
    if (mainPriests.length < neededPriests) {
      const confirmProceed = confirm(`⚠️ Priest มีรายชื่อในสนามหลักไม่เพียงพอ\n(ต้องการอย่างน้อย ${neededPriests} คนสำหรับสนามหลัก แต่พบในรายชื่อเพียง ${mainPriests.length} คน)\n\nคุณต้องการยืนยันจัดทีมต่อไปหรือไม่?`);
      if (!confirmProceed) {
        return false; // Abort operation
      }
    }

    // Assign 1 top Priest to each of the main teams
    mainTeamNames.forEach((teamName, tIdx) => {
      if (mainPriests[tIdx]) {
        const p = mainPriests[tIdx];
        const key = slotKey(0, teamName, 4); // slot 5
        teamsAssignments[key] = { name: p.name, job: p.job, power: p.power };
        occupiedMap.set(p.name.trim().toLowerCase(), key);
        rowJobFilter[key] = p.job;
        assignedSet.add(p.name.trim().toLowerCase());
      }
    });

    // Fill remaining 4 slots of each main team
    mainTeamNames.forEach((teamName) => {
      const teamJobsCount = {};
      for (let i = 0; i < 5; i++) {
        const key = slotKey(0, teamName, i);
        const a = teamsAssignments[key];
        if (a && a.job) {
          teamJobsCount[a.job] = (teamJobsCount[a.job] || 0) + 1;
        }
      }

      for (let i = 0; i < 5; i++) {
        const key = slotKey(0, teamName, i);
        if (!teamsAssignments[key]) {
          const candidate = mainCandidates.find(m => {
            const lower = m.name.trim().toLowerCase();
            if (assignedSet.has(lower)) return false;

            const jCount = teamJobsCount[m.job] || 0;
            if (m.job === 'High Wizard') {
              return jCount < 2;
            } else if (m.job === 'Priest') {
              return false;
            } else {
              return jCount < 1;
            }
          });

          if (candidate) {
            const lower = candidate.name.trim().toLowerCase();
            teamsAssignments[key] = { name: candidate.name, job: candidate.job, power: candidate.power };
            occupiedMap.set(lower, key);
            rowJobFilter[key] = candidate.job;
            assignedSet.add(lower);
            teamJobsCount[candidate.job] = (teamJobsCount[candidate.job] || 0) + 1;
          }
        }
      }
    });
  }

  } // End of Main Field
  
  /* --- 2. SUB FIELD OPTIMIZATION (Field 1) --- */
  if (mode === 'both' || mode === 'sub') {
  const subFm = fieldMeta[1];
  if (subFm) {
    // Find all remaining candidates who are not assigned AND not locked to 'main'
    const allRemaining = masterList.filter(m => {
      const lower = m.name.trim().toLowerCase();
      if (assignedSet.has(lower)) return false;
      if (m.fieldPref === 'main') return false; // respect strict main preference
      return true;
    }).sort((a, b) => (b.power || 0) - (a.power || 0));

    // Calculate how many teams we need to fit ALL remaining members
    const neededTeams = Math.ceil(allRemaining.length / 5);
    
    // Dynamically expand teams if there aren't enough
    let subTeamNames = sortTeamNames(subFm.teamNames);
    let maxNum = 0;
    subTeamNames.forEach(tName => {
      const num = parseInt(tName.replace(/\D/g, ''), 10) || 0;
      if (num > maxNum) maxNum = num;
    });

    while (subTeamNames.length < neededTeams) {
      maxNum++;
      const newTeamName = `ทีม ${maxNum}`;
      subFm.teamNames.push(newTeamName);
      subFm.capacity[newTeamName] = 5;
      subTeamNames.push(newTeamName);
    }
    
    const subPriests = allRemaining.filter(m => m.job === 'Priest').sort((a, b) => (b.power || 0) - (a.power || 0));

    // Assign 1 Priest to each sub team if available
    subTeamNames.forEach((teamName, tIdx) => {
      if (tIdx < subPriests.length) {
        const p = subPriests[tIdx];
        const key = slotKey(1, teamName, 4); // slot 5
        teamsAssignments[key] = { name: p.name, job: p.job, power: p.power };
        occupiedMap.set(p.name.trim().toLowerCase(), key);
        rowJobFilter[key] = p.job;
        assignedSet.add(p.name.trim().toLowerCase());
      }
    });

    // Fill remaining slots for each sub team
    subTeamNames.forEach((teamName) => {
      const cap = subFm.capacity[teamName];
      let hasPriest = false;

      for (let i = 0; i < cap; i++) {
        const key = slotKey(1, teamName, i);
        const a = teamsAssignments[key];
        if (a && a.job === 'Priest') hasPriest = true;
      }

      for (let i = 0; i < cap; i++) {
        const key = slotKey(1, teamName, i);
        if (!teamsAssignments[key]) {
          const candidate = allRemaining.find(m => {
            const lower = m.name.trim().toLowerCase();
            return !assignedSet.has(lower);
          });

          if (candidate) {
            const lower = candidate.name.trim().toLowerCase();
            teamsAssignments[key] = { name: candidate.name, job: candidate.job, power: candidate.power };
            occupiedMap.set(lower, key);
            rowJobFilter[key] = candidate.job;
            assignedSet.add(lower);
          }
        }
      }
    });
  }
  } // End of Sub Field

  saveState();
}

/* Clear All Main Field Teams */
function clearMainFieldTeams() {
  if (!confirm("⚠️ คุณต้องการล้างสมาชิกสนามหลักทั้งหมด (12 ทีม) ใช่หรือไม่?\n(สมาชิกทั้งหมดจะถูกคืนกลับเข้าสู่ลิสต์ส่วนกลาง)")) {
    return;
  }

  const fm = fieldMeta[0];
  if (!fm) return;

  let clearedCount = 0;
  fm.teamNames.forEach(teamName => {
    const cap = fm.capacity[teamName] || 5;
    for (let i = 0; i < cap; i++) {
      const key = slotKey(0, teamName, i);
      if (teamsAssignments[key]) {
        delete teamsAssignments[key];
        delete rowJobFilter[key];
        clearedCount++;
      }
    }
  });

  saveState();
  showToast(`ล้างสมาชิกสนามหลักเรียบร้อยแล้ว (${clearedCount} คน)`, "success");
}

/* Clear All Sub Field Teams */
function clearSubFieldTeams() {
  if (!confirm("⚠️ คุณต้องการล้างสมาชิกสนามรองทั้งหมดใช่หรือไม่?\n(สมาชิกทั้งหมดจะถูกคืนกลับเข้าสู่ลิสต์ส่วนกลาง)")) {
    return;
  }

  const fm = fieldMeta[1];
  if (!fm) return;

  let clearedCount = 0;
  fm.teamNames.forEach(teamName => {
    const cap = fm.capacity[teamName] || 5;
    for (let i = 0; i < cap; i++) {
      const key = slotKey(1, teamName, i);
      if (teamsAssignments[key]) {
        delete teamsAssignments[key];
        delete rowJobFilter[key];
        clearedCount++;
      }
    }
  });

  saveState();
  showToast(`ล้างสมาชิกสนามรองเรียบร้อยแล้ว (${clearedCount} คน)`, "success");
}

/* Clear Current Field Teams (Main or Sub depending on active tab) */
function clearCurrentFieldTeams() {
  if (currentFieldIdx === 0) {
    clearMainFieldTeams();
  } else {
    clearSubFieldTeams();
  }
}

window.clearMainFieldTeams = clearMainFieldTeams;
window.clearSubFieldTeams = clearSubFieldTeams;
window.clearCurrentFieldTeams = clearCurrentFieldTeams;

/* Team Search Logic */
let lastFoundInfo = null;

function warpToFoundTeam() {
  if (!lastFoundInfo) return;
  const { fieldIdx, teamName, memberName } = lastFoundInfo;

  if (fieldIdx !== currentFieldIdx) {
    currentFieldIdx = fieldIdx;
    renderTeams();
  }

  // Clear previous search target highlights
  document.querySelectorAll('.team-card.search-target').forEach(el => el.classList.remove('search-target'));
  document.querySelectorAll('tr.search-row-match').forEach(el => el.classList.remove('search-row-match'));

  const teamsGrid = document.getElementById('teamsGrid');
  if (teamsGrid) {
    const teamCards = teamsGrid.querySelectorAll('.team-card');
    const sortedNames = sortTeamNames(fieldMeta[currentFieldIdx].teamNames);
    const cardIdx = sortedNames.indexOf(teamName);

    if (cardIdx !== -1 && teamCards[cardIdx]) {
      const targetCard = teamCards[cardIdx];
      targetCard.classList.add('search-target');

      // Highlight row matching name
      const rows = targetCard.querySelectorAll('tbody tr');
      rows.forEach(tr => {
        const select = tr.querySelector('select.name-input');
        if (select && select.value.toLowerCase() === memberName.toLowerCase()) {
          tr.classList.add('search-row-match');
        }
      });

      targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

function handleTeamSearch() {
  const inputEl = document.getElementById('teamSearchInput');
  const resultEl = document.getElementById('teamSearchResult');
  if (!inputEl || !resultEl) return;

  const query = inputEl.value.trim().toLowerCase();

  // Clear previous highlights
  document.querySelectorAll('.team-card.search-target').forEach(el => el.classList.remove('search-target'));
  document.querySelectorAll('tr.search-row-match').forEach(el => el.classList.remove('search-row-match'));

  if (!query) {
    resultEl.innerHTML = '';
    lastFoundInfo = null;
    return;
  }

  // Find member across all fields & teams
  let foundFieldIdx = null;
  let foundTeamName = null;
  let foundMember = null;
  let foundSlotIdx = null;

  fieldMeta.forEach((fm, fIdx) => {
    fm.teamNames.forEach(teamName => {
      const cap = fm.capacity[teamName];
      for (let i = 0; i < cap; i++) {
        const key = slotKey(fIdx, teamName, i);
        const a = teamsAssignments[key];
        if (a && a.name && a.name.toLowerCase().includes(query)) {
          if (!foundMember) {
            foundFieldIdx = fIdx;
            foundTeamName = teamName;
            foundMember = a;
            foundSlotIdx = i;
          }
        }
      }
    });
  });

  if (!foundMember) {
    lastFoundInfo = null;
    resultEl.innerHTML = `<div class="team-found-badge" style="border-color:var(--danger);background:#fff2f0;"><span class="team-found-text" style="color:var(--danger)">ไม่พบสมาชิกชื่อ "${escapeHtml(inputEl.value)}" ในตารางทีม</span></div>`;
    return;
  }

  lastFoundInfo = {
    fieldIdx: foundFieldIdx,
    teamName: foundTeamName,
    memberName: foundMember.name
  };

  const fieldTitle = fieldMeta[foundFieldIdx].isMain ? "สนามหลัก" : "สนามรอง";

  resultEl.innerHTML = `
    <div class="team-found-badge">
      <span class="team-found-text">📍 พบคุณ <b>"${escapeHtml(foundMember.name)}"</b> อยู่ที่ [${fieldTitle}] <b>${escapeHtml(foundTeamName)}</b> (คนที่ ${foundSlotIdx + 1})</span>
      <button type="button" class="btn-warp-to-team" id="btnWarpToTeam">🚀 ไปยังทีมนี้</button>
    </div>`;

  document.getElementById('btnWarpToTeam')?.addEventListener('click', warpToFoundTeam);
}

function renderAll() {
  if (typeof buildFieldTabs === "function") buildFieldTabs();
  window.guildRoster = guildRoster;
  window.handleNameChange = handleNameChange;
  window.occupiedMap = occupiedMap;
  window.rowJobFilter = rowJobFilter;
  window.teamsAssignments = teamsAssignments;
  renderRoster();
  renderTeams();
}



function getRecommendedMain60Candidates() {
  const masterList = getMasterMemberList();
  // Filter out those locked to sub field
  const eligible = masterList.filter(m => m.fieldPref !== 'sub');
  
  // 1. Get everyone locked to 'main'
  const mainLocked = eligible.filter(m => m.fieldPref === 'main').sort((a, b) => (b.power || 0) - (a.power || 0));
  const mainLockedNames = new Set(mainLocked.map(p => p.name.trim().toLowerCase()));

  // 2. We still need up to 12 priests in total (including those in mainLocked)
  const lockedPriestCount = mainLocked.filter(m => m.job === 'Priest').length;
  const neededPriests = Math.max(0, 12 - lockedPriestCount);
  
  const remainingPriests = eligible.filter(m => m.job === 'Priest' && !mainLockedNames.has(m.name.trim().toLowerCase()))
                                   .sort((a, b) => (b.power || 0) - (a.power || 0));
  
  const topRemainingPriests = remainingPriests.slice(0, neededPriests);
  const selectedPriestNames = new Set(topRemainingPriests.map(p => p.name.trim().toLowerCase()));

  // 3. Fill the rest of the 60 slots with highest power 'any' players
  const neededOthers = Math.max(0, 60 - mainLocked.length - topRemainingPriests.length);
  const remainingOthers = eligible.filter(m => !mainLockedNames.has(m.name.trim().toLowerCase()) && !selectedPriestNames.has(m.name.trim().toLowerCase()))
                                  .sort((a, b) => (b.power || 0) - (a.power || 0));
                                  
  const topOthers = remainingOthers.slice(0, neededOthers);

  const combined = [...mainLocked, ...topRemainingPriests, ...topOthers];
  // Note: if mainLocked > 60, it will exceed 60. We should trim to 60 just in case.
  const final60 = combined.slice(0, 60).sort((a, b) => (b.power || 0) - (a.power || 0));
  
  return final60;
}



window.runAutoOptimizeSub = function() {
  const success = autoOptimizeTeams(null, 'sub');
  if (success !== false) {
    showToast(`จัดสนามรองเรียบร้อยแล้ว!`, 'success');
    renderAll();
  }
};

/* Dynamic Team Addition & Removal */
function addNewTeam() {
  const fm = fieldMeta[currentFieldIdx];
  if (!fm) return;

  // Cap Main Field at 12 teams max (60 players)
  if (fm.isMain && fm.teamNames.length >= 12) {
    showToast('⚠️ สนามหลักสามารถมีได้สูงสุด 12 ทีม (60 คน) เท่านั้น', 'error');
    return;
  }

  const sortedNames = sortTeamNames(fm.teamNames);
  let maxNum = 0;
  sortedNames.forEach(tName => {
    const num = parseInt(tName.replace(/\D/g, ''), 10) || 0;
    if (num > maxNum) maxNum = num;
  });

  const nextNum = maxNum + 1;
  const newTeamName = `ทีม ${nextNum}`;

  fm.teamNames.push(newTeamName);
  fm.capacity[newTeamName] = 5;

  for (let i = 0; i < 5; i++) {
    const key = slotKey(currentFieldIdx, newTeamName, i);
    teamsAssignments[key] = null;
  }

  saveState();
  const fieldTitle = fm.isMain ? "สนามหลัก" : "สนามรอง";
  showToast(`เพิ่ม "${newTeamName}" (5 คน) ใน${fieldTitle}เรียบร้อยแล้ว!`, 'success');
}

function removeSpecificTeam(targetTeamName) {
  const fm = fieldMeta[currentFieldIdx];
  if (!fm || !fm.teamNames || fm.teamNames.length === 0) return;

  if (fm.teamNames.length <= 1) {
    showToast('⚠️ ต้องมีอย่างน้อย 1 ทีมในสนามนี้', 'error');
    return;
  }

  const fieldTitle = fm.isMain ? "สนามหลัก" : "สนามรอง";

  if (confirm(`คุณต้องการลบ "${targetTeamName}" (พร้อมสมาชิกในทีมนี้) ออกจาก${fieldTitle}ใช่หรือไม่?`)) {
    const cap = fm.capacity[targetTeamName] || 5;

    for (let i = 0; i < cap; i++) {
      const key = slotKey(currentFieldIdx, targetTeamName, i);
      const a = teamsAssignments[key];
      if (a && a.name) {
        occupiedMap.delete(a.name.trim().toLowerCase());
      }
      delete teamsAssignments[key];
      delete rowJobFilter[key];
    }

    fm.teamNames = fm.teamNames.filter(t => t !== targetTeamName);
    delete fm.capacity[targetTeamName];

    saveState();
    showToast(`ลบ "${targetTeamName}" ออกจาก${fieldTitle}เรียบร้อยแล้ว!`, 'info');
  }
}

function removeLastTeam() {
  const fm = fieldMeta[currentFieldIdx];
  if (!fm || !fm.teamNames || fm.teamNames.length === 0) return;
  const sortedNames = sortTeamNames(fm.teamNames);
  const lastTeamName = sortedNames[sortedNames.length - 1];
  removeSpecificTeam(lastTeamName);
}

window.removeSpecificTeam = removeSpecificTeam;

/* DOM Event Listeners & Initialization */
function initApp() {
  // Main Tab Navigation
  document.querySelectorAll('.main-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pageId = e.currentTarget.dataset.page;
      if (pageId && typeof switchTab === 'function') {
        switchTab(pageId);
      }
    });
  });

  // Config Toggle Button in Top Bar
  const btnConfig = document.getElementById('btnConfigToggle');
  if (btnConfig) {
    btnConfig.addEventListener('click', openSettingsPage);
  }

  // Team Search Handler
  const teamSearchInput = document.getElementById('teamSearchInput');
  const btnTeamSearch = document.getElementById('btnTeamSearch');
  const btnAddTeamBtn = document.getElementById('btnAddTeamBtn');
  const btnRemoveTeamBtn = document.getElementById('btnRemoveTeamBtn');

  if (btnAddTeamBtn) btnAddTeamBtn.addEventListener('click', addNewTeam);
  if (btnRemoveTeamBtn) btnRemoveTeamBtn.addEventListener('click', removeLastTeam);

  if (teamSearchInput) {
    teamSearchInput.addEventListener('input', handleTeamSearch);
    teamSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleTeamSearch();
        warpToFoundTeam();
      }
    });
  }

  if (btnTeamSearch) {
    btnTeamSearch.addEventListener('click', () => {
      handleTeamSearch();
      warpToFoundTeam();
    });
  }

  // Top Bar Controls Explicit Event Listeners
  const bSolid = document.getElementById('btnStyleSolid');
  if (bSolid) bSolid.addEventListener('click', () => setJobStyle('solid'));
  const bOutline = document.getElementById('btnStyleOutline');
  if (bOutline) bOutline.addEventListener('click', () => setJobStyle('outline'));
  const bTheme = document.getElementById('btnThemeToggle');
  if (bTheme) bTheme.addEventListener('click', () => toggleTheme());
  const bGuide = document.getElementById('btnOpenGuideModal');
  if (bGuide) bGuide.addEventListener('click', () => openGuideModal());

  // Roster Search
  const searchInput = document.getElementById('rosterSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      rosterSearchQuery = e.target.value;
      renderRoster();
    });
  }

  // Add Member Modal
  const btnAddM = document.getElementById('btnAddMember');
  if (btnAddM) btnAddM.addEventListener('click', () => openMemberModal());
  const btnCloseM = document.getElementById('btnCloseModal');
  if (btnCloseM) btnCloseM.addEventListener('click', closeMemberModal);
  const btnCancelM = document.getElementById('btnCancelModal');
  if (btnCancelM) btnCancelM.addEventListener('click', closeMemberModal);

  const modalDeleteBtn = document.getElementById('btnDeleteMemberModal');
  if (modalDeleteBtn) {
    modalDeleteBtn.addEventListener('click', () => {
      const origName = document.getElementById('editOriginalName').value;
      const job = document.getElementById('modalMemberJob').value;
      if (origName) {
        if (confirm(`คุณต้องการลบสมาชิก "${origName}" ออกจากกิลด์ใช่หรือไม่?`)) {
          deleteMember(job, origName);
          closeMemberModal();
        }
      }
    });
  }

  const memberFm = document.getElementById('memberForm');
  if (memberFm) {
    memberFm.addEventListener('submit', (e) => {
      e.preventDefault();
      const origName = document.getElementById('editOriginalName').value;
      const name = document.getElementById('modalMemberName').value.trim();
      const job = document.getElementById('modalMemberJob').value;
      const power = document.getElementById('modalMemberPower').value === '' ? null : Number(document.getElementById('modalMemberPower').value);
      const fieldPrefEl = document.getElementById('modalMemberFieldPref');
      const fieldPref = fieldPrefEl ? fieldPrefEl.value : 'any';
      
      if (name && job) {
        saveMemberFromModal(origName, name, job, power, fieldPref);
      }
    });
  }

  // Auto Match Modal Controls
  const btnRunAutoModal = document.getElementById('btnRunAutoMatchModal');
  const btnFillTop60Power = document.getElementById('btnFillTop60Power');
  const customMainListText = document.getElementById('customMainListText');
  const customListCountBadge = document.getElementById('customListCountBadge');

  if (btnFillTop60Power && customMainListText) {
    btnFillTop60Power.addEventListener('click', () => {
      const rec60 = getRecommendedMain60Candidates();
      customMainListText.value = rec60.map(m => m.name).join('\n');
      if (customListCountBadge) customListCountBadge.textContent = `ตรวจพบรายชื่อ: ${rec60.length} / 60 คน`;
    });
  }

  if (customMainListText && customListCountBadge) {
    customMainListText.addEventListener('input', () => {
      const raw = customMainListText.value;
      const lines = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      customListCountBadge.textContent = `ตรวจพบรายชื่อ: ${lines.length} / 60 คน`;
    });
  }

  if (btnRunAutoModal) {
    btnRunAutoModal.addEventListener('click', () => {
      const raw = customMainListText ? customMainListText.value : '';
      const parsedNames = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);

      if (parsedNames.length === 0) {
        alert('กรุณาวางหรือระบุรายชื่อตัวละครสนามหลักอย่างน้อย 1 ชื่อ');
        return;
      }

      const success = autoOptimizeTeams(parsedNames, 'main');
      if (success !== false) {
        showToast(`จัดสนามหลัก (${parsedNames.length} คน) เรียบร้อยแล้ว!`, 'success');
        closeAutoMatchModal();
        renderAll();
      }
    });
  }

  // Firebase Only Mode: render empty first, then Firebase will fill data
  guildRoster = {};
  initTeamStructure([]);
  renderAll(); // shows loading state

  // Connect to Firebase (data will render automatically when fetched)
  try {
    setupFirebase(DEFAULT_FIREBASE_CONFIG);
  } catch (err) {
    console.error("Firebase auto-connect error:", err);
  }

  const btnSaveFB = document.getElementById('btnSaveFirebaseConfig');
  if (btnSaveFB) btnSaveFB.addEventListener('click', handleSaveFirebaseConfig);

  const btnDiscFB = document.getElementById('btnDisconnectFirebase');
  if (btnDiscFB) btnDiscFB.addEventListener('click', handleDisconnectFirebase);

  const btnSeed = document.getElementById('btnSeedDefault');
  if (btnSeed) btnSeed.addEventListener('click', handleSeedDefaultData);

  const btnExport = document.getElementById('btnExportJSON');
  if (btnExport) btnExport.addEventListener('click', handleExportJSON);

  const btnImport = document.getElementById('btnImportJSON');
  if (btnImport) btnImport.addEventListener('click', handleImportJSON);

  const importInput = document.getElementById('importFileInput');

  const btnClearAll = document.getElementById('btnClearAllData');
  if (btnClearAll) btnClearAll.addEventListener('click', handleClearAllData);

  // Initialize UI state before auth finishes
  document.getElementById('authWrap').style.display = 'block';
  document.getElementById('appWrap').style.display = 'none';
}

// Guarantee execution for ES Module scripts regardless of document.readyState
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function parseFirebaseConfig(rawVal) {
  if (!rawVal) return null;

  // 1. Try standard JSON.parse first
  try {
    const p = JSON.parse(rawVal);
    if (p && p.apiKey) return p;
  } catch (e) {}

  // 2. Clean imports, const/let/var declarations and comments
  try {
    let cleaned = rawVal
      .replace(/^[\s\S]*?(?:const|let|var)\s+\w+\s*=\s*/i, '')
      .replace(/import\s+[\s\S]*?;\s*/g, '')
      .trim();
    if (cleaned.endsWith(';')) cleaned = cleaned.slice(0, -1).trim();

    const p = JSON.parse(cleaned);
    if (p && p.apiKey) return p;
  } catch (e) {}

  // 3. Try JS Object evaluation
  try {
    let cleaned = rawVal
      .replace(/^[\s\S]*?(?:const|let|var)\s+\w+\s*=\s*/i, '')
      .replace(/import\s+[\s\S]*?;\s*/g, '')
      .trim();
    if (cleaned.endsWith(';')) cleaned = cleaned.slice(0, -1).trim();
    const match = cleaned.match(/\{[\s\S]*?\}/);
    if (match) {
      const evaled = Function(`"use strict"; return (${match[0]});`)();
      if (evaled && evaled.apiKey) return evaled;
    }
  } catch (e) {}

  // 4. Regex extraction for key-value pairs
  try {
    const getKey = (key) => {
      const reg = new RegExp(key + `\\s*:\\s*["']([^"']+)["']`, 'i');
      const m = rawVal.match(reg);
      return m ? m[1].trim() : '';
    };

    const apiKey = getKey('apiKey');
    if (apiKey) {
      return {
        apiKey: apiKey,
        authDomain: getKey('authDomain'),
        projectId: getKey('projectId'),
        storageBucket: getKey('storageBucket'),
        messagingSenderId: getKey('messagingSenderId'),
        appId: getKey('appId')
      };
    }
  } catch (e) {}

  return null;
}

function handleSaveFirebaseConfig() {
  const rawVal = document.getElementById('firebaseConfigInput').value.trim();
  if (!rawVal) {
    showToast("กรุณากรอก Firebase Config", "error");
    return;
  }

  const parsed = parseFirebaseConfig(rawVal);
  if (parsed && parsed.apiKey) {
    document.getElementById('firebaseConfigInput').value = JSON.stringify(parsed, null, 2);
    localStorage.setItem('firebase_config_json', JSON.stringify(parsed, null, 2));
    setupFirebase(parsed);
    showToast("บันทึกและซิงค์ Firebase Config เรียบร้อย 🟢", "success");
  } else {
    showToast("รูปแบบ Config ไม่ถูกต้อง กรุณาวางโค้ด firebaseConfig ที่มี apiKey", "error");
  }
}

function handleDisconnectFirebase() {
  localStorage.removeItem('firebase_config_json');
  if (unsubRosterListener) unsubRosterListener();
  if (unsubTeamsListener) unsubTeamsListener();
  isFirebaseActive = false;
  db = null;
  guildRoster = {};
  initTeamStructure([]);
  updateStatusUI('local', 'ยกเลิกการเชื่อมต่อ Firebase แล้ว');
  renderAll();
  showToast("ยกเลิกการเชื่อมต่อ Firebase แล้ว", "info");
}

function handleSeedDefaultData() {
  if (confirm("คุณต้องการโหลดข้อมูลเริ่มต้น (Default Guild Data) มาแทนที่ข้อมูลปัจจุบันใช่หรือไม่?")) {
    guildRoster = JSON.parse(JSON.stringify(INITIAL_ROSTER));
    initTeamStructure(INITIAL_TEAMS);
    renderAll();
    saveState();
    showToast("โหลดข้อมูลเริ่มต้นสำเร็จ 🟢", "success");
  }
}

function handleExportJSON() {
  const payload = {
    roster: guildRoster,
    teams: serializeTeamsState()
  };
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", `guild_backup_${new Date().toISOString().slice(0,10)}.json`);
  dlAnchorElem.click();
  showToast("ส่งออกไฟล์ Backup เรียบร้อยแล้ว", "success");
}

function handleImportJSON() {
  const importInput = document.getElementById('importFileInput');
  if (importInput) importInput.click();
}

function handleClearAllData() {
  if (confirm("⚠️ คำเตือน: คุณต้องการลบข้อมูลสมาชิกและการจัดทีมทั้งหมดใช่หรือไม่?")) {
    guildRoster = {};
    initTeamStructure([]);
    renderAll();
    saveState();
    showToast("ล้างข้อมูลเรียบร้อยแล้ว", "info");
  }
}

function handleImportFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (parsed.roster && parsed.teams) {
        guildRoster = parsed.roster;
        initTeamStructure(parsed.teams);
        renderAll();
        saveState();
        showToast("นำเข้าข้อมูลจากไฟล์ Backup สำเร็จ 🟢", "success");
      } else {
        showToast("โครงสร้างไฟล์ JSON ไม่ถูกต้อง", "error");
      }
    } catch (err) {
      showToast("อ่านไฟล์ JSON ไม่สำเร็จ: " + err.message, "error");
    }
  };
  reader.readAsText(file);
}

window.appSeedDefault = function() {
  guildRoster = JSON.parse(JSON.stringify(INITIAL_ROSTER));
  initTeamStructure(INITIAL_TEAMS);
  renderAll();
  saveState();
  showToast("โหลดข้อมูลเริ่มต้นสำเร็จ 🟢", "success");
};

window.appExportJSON = function() {
  const payload = {
    roster: guildRoster,
    teams: serializeTeamsState()
  };
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", `guild_backup_${new Date().toISOString().slice(0,10)}.json`);
  dlAnchorElem.click();
  showToast("ส่งออกไฟล์ Backup เรียบร้อยแล้ว 🟢", "success");
};

window.appImportJSON = function(parsed) {
  if (parsed && parsed.roster && parsed.teams) {
    guildRoster = parsed.roster;
    initTeamStructure(parsed.teams);
    renderAll();
    saveState();
    showToast("นำเข้าข้อมูลจากไฟล์ Backup สำเร็จ 🟢", "success");
  }
};

window.appClearAll = function() {
  guildRoster = {};
  initTeamStructure([]);
  renderAll();
  saveState();
  showToast("ล้างข้อมูลเรียบร้อยแล้ว", "info");
};

window.parseFirebaseConfig = parseFirebaseConfig;
window.handleSaveFirebaseConfig = handleSaveFirebaseConfig;
window.handleDisconnectFirebase = handleDisconnectFirebase;
window.handleSeedDefaultData = handleSeedDefaultData;
window.handleExportJSON = handleExportJSON;
window.handleImportJSON = handleImportJSON;
window.handleImportFileChange = handleImportFileChange;
window.handleClearAllData = handleClearAllData;
window.openMemberModal = openMemberModal;
window.closeMemberModal = closeMemberModal;
window.deleteMember = deleteMember;
window.clearCurrentFieldTeams = clearCurrentFieldTeams;
window.openAutoMatchModal = openAutoMatchModal;
window.closeAutoMatchModal = closeAutoMatchModal;
window.switchTab = switchTab;
window.openSettingsPage = openSettingsPage;
window.addNewTeam = addNewTeam;
window.removeLastTeam = removeLastTeam;
window.handleTeamSearch = handleTeamSearch;
window.warpToFoundTeam = warpToFoundTeam;
window.showToast = showToast;
window.renderAll = renderAll;
window.escapeHtml = escapeHtml;
window.saveState = saveState;
