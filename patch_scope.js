const fs = require('fs');
let html = fs.readFileSync('app.js', 'utf8');

const regex = /window\.onTeamCardDrop = function[\s\S]*?console\.error\(e\);\n  \}\n};/m;
const match = html.match(regex);
if (match) {
    let funcCode = match[0];
    
    // Replace window. variables with local variables
    funcCode = funcCode.replace(/window\.currentFieldIdx/g, 'currentFieldIdx');
    funcCode = funcCode.replace(/window\.fieldMeta/g, 'fieldMeta');
    funcCode = funcCode.replace(/window\.teamsAssignments/g, 'teamsAssignments');
    funcCode = funcCode.replace(/window\.occupiedMap/g, 'occupiedMap');
    funcCode = funcCode.replace(/window\.rowJobFilter/g, 'rowJobFilter');
    funcCode = funcCode.replace(/window\.saveState/g, 'saveState');
    funcCode = funcCode.replace(/window\.renderAll/g, 'renderAll');
    funcCode = funcCode.replace(/window\.showToast/g, 'showToast');

    html = html.replace(regex, funcCode);
    
    // Also fix dragStart
    const dragStartRegex = /window\.onTeamCardDragStart = function[\s\S]*?event\.dataTransfer\.effectAllowed = 'move';\n};/m;
    const dsMatch = html.match(dragStartRegex);
    if (dsMatch) {
        let dsCode = dsMatch[0];
        dsCode = dsCode.replace(/window\.currentFieldIdx/g, 'currentFieldIdx');
        html = html.replace(dragStartRegex, dsCode);
    }
    
    fs.writeFileSync('app.js', html);
    console.log('Fixed variable scope references');
} else {
    console.log('Could not find drop function');
}
