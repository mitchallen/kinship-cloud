// Splits a given file into smaller subfiles 

var fs = require('fs');

// const GED_FILE_1 = 'data/snell-1.ged';
// const GED_FILE_2 = 'data/parents.ged';

function getData( record, keys ) {
    if( keys.length < 1 ) {
        return null;
    }

    if(  ! record.props ) {
        return null;
    }
    
    const result = record.props.filter(el => el.type === keys[0]);
    if( result.length < 1 ) {
        // console.log(`propery not found for ${keys}`);
        return null;
    }
    // console.log(`getData: RESULT: ${JSON.stringify(result[0],null,2)} - ${keys[0]}`);
    if( keys.length > 1 ) {
        return getData( result[0], keys.slice(1) )
    }

    // console.log(`--- RETURNING: ${result[0].data}`)

    return result[0].data;
}

function processRecord( lines, counter ) {
    if( lines.length > 0 ) {
        console.log(`\n### RECORD [${counter}] ###`)
        // console.log(JSON.stringify(lines, null, 2));
        // TODO - send to database

        // could impact child props - have to remove subtree
        const skipList = [/*'NOTE','TEXT'*/];

        const records = lines.map(el => {
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
    
        const result = hoist(records.filter( el => !el.skip ));

        // console.log(JSON.stringify(result, null, 2));

        console.log(` ===> id: ${result.id}`);
        console.log(` ===> FAMC: ${getData(result,['FAMC'])}`);
        console.log(` ===> FAMS: ${getData(result,['FAMS'])}`);
        console.log(` ===> NAME: ${getData(result,['NAME'])}`);
        console.log(` ===> SEX: ${getData(result,['SEX'])}`);
        console.log(` ===> NAME.GIVN: ${getData(result,['NAME','GIVN'])}`);
        console.log(` ===> NAME.SURN: ${getData(result,['NAME','SURN'])}`);
        console.log(` ===> NAME._MAR: ${getData(result,['NAME','_MAR'])}`);
        console.log(` ===> BIRT.DATE: ${getData(result,['BIRT','DATE'])}`);
        console.log(` ===> BIRT.PLAC: ${getData(result,['BIRT','PLAC'])}`);
        console.log(` ===> BIRT.CITY: ${getData(result,['BIRT','CITY'])}`);
        console.log(` ===> BIRT.STAE: ${getData(result,['BIRT','STAE'])}`);
        console.log(` ===> BIRT.CTRY: ${getData(result,['BIRT','CTRY'])}`);
        console.log(` ===> MARR.DATE: ${getData(result,['MARR','DATE'])}`);
        console.log(` ===> MARR.PLAC: ${getData(result,['MARR','PLAC'])}`);
        console.log(` ===> DEAT.DATE: ${getData(result,['DEAT','DATE'])}`);
    }
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

    if( list.length > 1 ) {
        throw new Error('### Hoist returning more than one record.')
    }

    return list.length ? list[0] : {}; // should just be one item
}


module.exports.import = (spec) => {

    spec = spec || {};

    var infileName = spec.filename;

    if( ! infileName ) {
        console.log("### import called with no input file name");
        return;
    }

    console.log(infileName);

    var counter = 0;

    var record = [];

    var fileCount = 0;
    var count = 0;
    // var outStream = null;

    var inStream = fs.createReadStream(infileName);

    var lineReader = require('readline').createInterface({
        input: inStream
    });

    lineReader.on('line', function (line) {
        count++;
        const tokens = line.trim().split(/\s+/);
        const level = +tokens[0];

        if (level == 0) {
            // Close previous outStream (if any)
            // if (outStream) {
            //     outStream.end();
            // }
            // Create new outStream;
            // fileCount++;
            // outfileName = `output/${infileName}.${fileCount}`;
            // console.log(`=> ${outfileName}`)
            // outStream = fs.createWriteStream(outfileName);

            // 1. process current record
            processRecord( record, counter++ );
 
            // 2. reinitialize with []
            record = [];
        }

        // outStream.write(line + '\n');
        record.push(line);
    });

    lineReader.on('close', function () {
        inStream.close();
        processRecord(record, counter++ );
        console.log('\n... done \n');
    });

};