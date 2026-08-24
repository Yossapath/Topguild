const fs = require('fs');

const jsFiles = ['app.js', 'module_attendance.js', 'module_auth.js', 'module_dungeon.js', 'module_leave.js', 'module_log.js'];

for (const file of jsFiles) {
    if (!fs.existsSync(file)) continue;
    let js = fs.readFileSync(file, 'utf8');
    let modified = false;

    const funcsToAsync = [
        'autoOptimizeTeams', 'clearMainFieldTeams', 'clearSubFieldTeams',
        'removeSpecificTeam', 'removeLastTeam', 'deleteMember',
        'handleSeedDefaultData', 'handleClearAllData',
        'autoGenerateAttendance', 'archiveAttendanceDate',
        'deleteAdminUser', 'clearDungeonTeam', 'deleteDungeonData',
        'deleteLeaveRecord', 'revertAction', 'rollbackBackup', 'handleTeamSearch',
        'showMemberLogs', 'btnAdminCreateAttendance'
    ];

    funcsToAsync.forEach(fn => {
        const target1 = 'function ' + fn + '(';
        if (js.includes(target1) && !js.includes('async ' + target1)) {
            js = js.replace(target1, 'async ' + target1);
            modified = true;
        }
        
        const target2 = 'window.' + fn + ' = function(';
        if (js.includes(target2) && !js.includes('window.' + fn + ' = async function(')) {
            js = js.replace(target2, 'window.' + fn + ' = async function(');
            modified = true;
        }
    });

    if (js.includes('confirm(')) {
        js = js.replace(/confirm\(/g, 'await window.UI.confirm(');
        modified = true;
    }
    if (js.includes('alert(')) {
        js = js.replace(/alert\(/g, 'await window.UI.alert(');
        modified = true;
    }
    if (js.includes('prompt(')) {
        js = js.replace(/prompt\(/g, 'await window.UI.prompt(');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(file, js, 'utf8');
        console.log('Patched ' + file + ' with UI modals');
    }
}
