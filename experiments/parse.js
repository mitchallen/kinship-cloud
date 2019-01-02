var fs = require('fs');

const GED_FILE_1 = './data/snell-1.ged';
const GED_FILE_2 = './data/parents.ged';

var rs = fs.createReadStream(GED_FILE_2);

let string = '';

rs
    .on('data', (buf) => string += buf.toString())
    .on('end', () => {
        // console.log(string);
        const list = string.split(/\n/);
        // console.log(JSON.stringify(list, null, 2));

        // could impact child props - have to remove subtree
        const skipList = [/*'NOTE','TEXT'*/];

        const records = list.map(el => {
            const tokens = el.trim().split(/\s+/); 
            // console.log(tokens);
            const level = +tokens[0];

            // 0 @I6000000000952775792@ INDI // Type is at [2] instead of [1]
            const isAtRecord = (level === 0 && tokens[1][0] === '@');

            recordType = isAtRecord ? tokens[2] : tokens[1];

            const skip = skipList.indexOf( recordType ) !== -1;

            var record = {
                level: level,
                type: recordType,
                data: tokens.slice(isAtRecord ? 3 : 2).join(' '),
            }

            if (isAtRecord) {
                record.id = tokens[1];
            }

            if( skip ) {
                record.skip = true;
            }

            return record;
        })
        
        logTypes(records);

        const result = hoist(records.filter( el => !el.skip ));

        console.log(JSON.stringify(result, null, 2));

        logTypes(result);
    });

function logTypes(list) {

    const types = list.reduce(function (acc, curr) {
        if (typeof acc[curr.type] == 'undefined') {
          acc[curr.type] = 1;
        } else {
          acc[curr.type] += 1;
        }
      
        return acc;
      }, {});

      console.log(types);
}
 
function hoist(list) {

    var cursor = list.length - 1;

    while (cursor >= 0) {
        if (list[cursor].level == 0) {
            cursor--;
            continue;
        }
        var scanner = cursor - 1;
        while (scanner >= 0) {
            // console.log(`cursor: ${cursor}, scanner: ${scanner}, length: ${list.length}`);
            if(list[scanner] == null || list[cursor] == null ) {
                scanner--;
                continue;
            }
            if (list[scanner].level == list[cursor].level - 1) {
                // hoist!
                if (list[scanner].props == null) {
                    list[scanner].props = [];
                }
                list[scanner].props.unshift(list[cursor])
                list.splice(cursor, 1);
            }
            scanner--;
        }
        cursor--
    }

    return list;
}



