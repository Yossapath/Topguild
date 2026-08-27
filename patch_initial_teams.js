const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const regexInitial = /"title": "สนามรอง.*?\}\s*\}\s*\];/;
const replaceInitial = `"title": "สนามรอง  (81 คน / 17 ทีม)",
    "teams": {
      "ทีม 1": [{"name": "Fujiro", "job": "Assassin Cross", "power": 30251}, {"name": "KJสารวัตรแจ๊ะ", "job": "Gunslinger", "power": 30184}, {"name": "HyPerTo", "job": "Lord Knight", "power": 29994}, {"name": "Katoonz", "job": "Gunslinger", "power": 29936}, {"name": "P9D", "job": "High Wizard", "power": 29627}],
      "ทีม 2": [{"name": "Pairot_1995", "job": "Sniper", "power": 29494}, {"name": "I'm18", "job": "Sniper", "power": 29434}, {"name": "凡依", "job": "Merchant", "power": 29313}, {"name": "Maboom", "job": "Sniper", "power": 29251}, {"name": "MasterClover", "job": "Champion", "power": 29153}],
      "ทีม 3": [{"name": "ขุนทวนสวนทวาร", "job": "Gunslinger", "power": 29093}, {"name": "InseptiOn", "job": "Lord Knight", "power": 28953}, {"name": "Atomic", "job": "Sniper", "power": 28920}, {"name": "CGame", "job": "Gunslinger", "power": 28828}, {"name": "GOLF", "job": "Priest", "power": 28745}],
      "ทีม 4": [{"name": "เวลดอล่า", "job": "Gunslinger", "power": 28663}, {"name": "3ararentz", "job": "Sniper", "power": 28530}, {"name": "FishStop", "job": "High Wizard", "power": 28484}, {"name": "ยาซป", "job": "Gunslinger", "power": 28297}, {"name": "Avalon", "job": "Paladin", "power": 28038}],
      "ทีม 5": [{"name": "Flexx", "job": "Assassin Cross", "power": 27909}, {"name": "mochi3", "job": "High Wizard", "power": 27833}, {"name": "Paxx", "job": "Sniper", "power": 27752}, {"name": "พระปลาย", "job": "Priest", "power": 27745}, {"name": "Over_Topup", "job": "Lord Knight", "power": 27579}],
      "ทีม 6": [{"name": "หงุดหงิดง่ะ", "job": "Sniper", "power": 27509}, {"name": "zM3z", "job": "Assassin Cross", "power": 27488}, {"name": "EilL", "job": "Gunslinger", "power": 27439}, {"name": "หงส์เพชร", "job": "High Wizard", "power": 27284}, {"name": "SiriN", "job": "Priest", "power": 27220}],
      "ทีม 7": [{"name": "พุดเดิ้ล", "job": "High Wizard", "power": 27150}, {"name": "BUNNY-B", "job": "Lord Knight", "power": 27072}, {"name": "oI2eaLz", "job": "Assassin Cross", "power": 26978}, {"name": "LnwPlaTOO", "job": "Sniper", "power": 26738}, {"name": "NIGHTMARE", "job": "Sniper", "power": 26610}],
      "ทีม 8": [{"name": "Luffy", "job": "Sniper", "power": 26604}, {"name": "ชูวับ", "job": "High Wizard", "power": 26569}, {"name": "WzX", "job": "Sniper", "power": 26493}, {"name": "N0", "job": "Sniper", "power": 26233}, {"name": "ลุงแจ็ค", "job": "Priest", "power": 26189}],
      "ทีม 9": [{"name": "พญาไก่", "job": "Paladin", "power": 26038}, {"name": "ก๊อบแก๊บ", "job": "Sniper", "power": 26012}, {"name": "TheStarX", "job": "Assassin Cross", "power": 25774}, {"name": "S4KU12A", "job": "Lord Knight", "power": 25686}, {"name": "G2000", "job": "Priest", "power": 25633}],
      "ทีม 10": [{"name": "สติ", "job": "Assassin Cross", "power": 25527}, {"name": "TheKlopp", "job": "Champion", "power": 25425}, {"name": "MeaNLia", "job": "Sniper", "power": 25418}, {"name": "ต้าวลุงตุ๋ย", "job": "High Wizard", "power": 25301}, {"name": "NalDoo", "job": "Paladin", "power": 25299}],
      "ทีม 11": [{"name": "Baki", "job": "Sniper", "power": 25243}, {"name": "Fries", "job": "Gunslinger", "power": 25056}, {"name": "12i[P]P[E]I2", "job": "High Wizard", "power": 24967}, {"name": "หงส์ทอง", "job": "Sniper", "power": 24705}, {"name": "X_x", "job": "Priest", "power": 24522}],
      "ทีม 12": [{"name": "C0nstantine", "job": "High Wizard", "power": 24519}, {"name": "ป๋องแป๋ง", "job": "Lord Knight", "power": 24195}, {"name": "TUM_13", "job": "Assassin Cross", "power": 24151}, {"name": "C27J", "job": "Sniper", "power": 24089}, {"name": "จ้าวพายุ", "job": "Priest", "power": 23512}],
      "ทีม 13": [{"name": "O[l]e", "job": "Sniper", "power": 23415}, {"name": "Lumin0us", "job": "Lord Knight", "power": 23377}, {"name": "TheLast1", "job": "High Wizard", "power": 23204}, {"name": "Oreo", "job": "Sniper", "power": 22915}, {"name": "H2O", "job": "Priest", "power": 22841}],
      "ทีม 14": [{"name": "12ED!TUS_Jr", "job": "High Wizard", "power": 22756}, {"name": "Jaime_Jr", "job": "Assassin Cross", "power": 22699}, {"name": "KiMuJi_Jr", "job": "Priest", "power": 22430}, {"name": "คุคุ_Jr", "job": "Sniper", "power": 22184}, {"name": "โอ๊ยร้อนน_Jr", "job": "Lord Knight", "power": 21908}],
      "ทีม 15": [{"name": "ChomPoo_Jr", "job": "Paladin", "power": 21855}, {"name": "KiTzAoo3_Jr", "job": "High Wizard", "power": 21670}, {"name": "LinPing_Jr", "job": "Assassin Cross", "power": 21542}, {"name": "SAFEZONE_Jr", "job": "Sniper", "power": 21390}, {"name": "Baki_Hanma_Jr", "job": "Priest", "power": 21255}],
      "ทีม 16": [{"name": "เอมิจังงง_Jr", "job": "Druid", "power": 21104}, {"name": "บักตุ่น_Jr", "job": "Gunslinger", "power": 20958}, {"name": "หวานเจี๊ยฟ_Jr", "job": "Sniper", "power": 20822}, {"name": "zzzTOzzz_Jr", "job": "Champion", "power": 20689}, {"name": "Dumpling_Jr", "job": "Priest", "power": 20511}],
      "ทีม 17": [{"name": "Cal2nivaLxD_Jr", "job": "Assassin Cross", "power": 20450}]
    }
  },
  {
    "title": "ออฟไลน์",
    "teams": {
      "ทีม 1": [{},{},{},{},{}]
    }
  }
];`;

if (code.match(regexInitial)) {
  code = code.replace(regexInitial, replaceInitial);
  fs.writeFileSync('app.js', code);
  console.log('Patched INITIAL_TEAMS');
} else {
  console.log('INITIAL_TEAMS match failed');
}
