const records = [
    { level: 0, type: 'INDI', data: 'alpha' },
    { level: 1, type: 'NAME', data: 'alpha1.1A' },
    { level: 2, type: 'GIVN', data: 'alpha1.2A' },
    { level: 2, type: 'BIRT', data: 'alpha1.2B' },
    { level: 1, type: 'ADDR', data: 'alpha2.1A' },
    { level: 2, type: 'CITY', data: 'alpha2.2A' },
    { level: 2, type: 'STAE', data: 'alpha2.2B' },
    { level: 0, type: 'INDI', data: 'beta' },
];

function hoist(list) {

    var cursor = list.length - 1;

    while( cursor >= 0 ) {
        if( list[cursor].level == 0 ) {
            cursor--;
            continue;
        } 
        var scanner = cursor - 1;
        while( scanner >= 0 ) {
            console.log(`=> CURSOR [${cursor}]: ${list[cursor].title}, SCANNER [${scanner}]: ${list[scanner].title}`)
            if( list[scanner].level == list[cursor].level - 1 ) {
                // hoist!
                if( list[scanner].props == null ) {
                    list[scanner].props = [];
                }
                list[scanner].props.unshift(list[cursor])
                list.splice(cursor,1);
            }
            scanner--;
        }
        cursor--
    }

    return list;
}

console.log("### BEFORE ###");
console.log(records);

const result = hoist(records);

console.log("### AFTER ###");
console.log(result);