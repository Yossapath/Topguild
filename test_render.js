const fs = require('fs');

// Mock window, document, etc.
global.window = {
  currentDungeonTab: 'มายา (Maya)',
  currentUser: { role: 'admin' },
  isUserAdmin: () => true,
  escapeHtml: (s) => s,
  dungeonData: undefined,
  addEventListener: () => {},
  guildRoster: {
    'Swordman': [{name: 'Test', power: 1000}]
  }
};
global.document = {
  getElementById: (id) => {
    if (id === 'dqList' || id === 'dungeonTeamsArea' || id === 'btnCreateDungeonTeam' || id === 'dungeonStatsArea') {
      return {
        innerHTML: '',
        style: {},
        classList: { remove: ()=>{}, add: ()=>{} },
        addEventListener: ()=>{}
      };
    }
    return null;
  },
  querySelectorAll: () => [],
  addEventListener: () => {}
};

// Mock Firebase functions
let getDocMock, setDocMock, onSnapshotMock;
const mockDb = {};
global.window.db = mockDb;

// Fake snapshot
const fakeSnapshot = {
  exists: () => true,
  data: () => ({
    queues: [
      { name: 'Player1', job: 'Swordman', status: 'active', dungeon: 'มายา (Maya)' }
    ],
    teams: [
      {
        id: 'team1', type: 'มายา (Maya)', dungeonName: 'Team 1', capacity: 5,
        members: [{name: 'Player2', job: 'Acolyte', power: 500}, null, null, null, null]
      }
    ]
  })
};

// We will simulate evaluating the module_dungeon.js script.
// Since it's an ES module with imports, we need to stub the import line.
let code = fs.readFileSync('module_dungeon.js', 'utf8');
code = code.replace(/import\s+\{.*\}\s+from\s+.*firebase-firestore.js".*/, 
  'const doc = ()=>{}; const getDoc = async ()=>fakeSnapshot; const setDoc = async ()=>{}; const onSnapshot = (ref, cb) => { cb(fakeSnapshot); };');

try {
  eval(code);
  
  setTimeout(async () => {
    console.log('Calling setupDungeonFirebase()...');
    await window.setupDungeonFirebase();
    console.log('Dungeon Data:', window.dungeonData);
    console.log('Success without errors!');
  }, 100);
} catch (e) {
  console.error('Crash:', e);
}
