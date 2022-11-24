const parse = require('csv-parse/sync').parse;
const fs = require("fs");
const {spawn} = require('node:child_process');
const csv = "/list.csv";

const data = fs.readFileSync(csv, {encoding: 'utf8', flag: 'r'});

run = async() => {
    const records = parse(data, {
        columns: true,
        skip_empty_lines: true
    });
    for (var key in records) {
        record = records[key];
        var url = record['link-href'];
        await processUrl(key, url);
    }
}


var processUrl = async(key, url) => {
    process.chdir('/download');
    var lastKey
    try {
        lastKey = parseInt(fs.readFileSync("LAST_KEY"));
    } catch (e) {
        lastKey = -1;
    }
    if (lastKey >= key) {
        console.log(`SKIP: ${url}`);
        return;
    }

    return new Promise((resolve, reject) => {
        console.log(`PROCESS URL: ${url}`)
        
        var cmd;
        if(process.env.FORMAT) {
            cmd = spawn('yt-dlp', ["-f", process.env.FORMAT , "-o", "%(upload_date)s-%(title)s.%(ext)s", url]);
        }
        else {
            cmd = spawn('yt-dlp', ["-o", "%(upload_date)s-%(title)s.%(ext)s", url]);
        }
        
        cmd.stdout.pipe(process.stdout)

//        cmd.stdout.on('data', (data) => {
//            console.log("data", data);
//        });

        cmd.stderr.on('data', (data) => {
            console.error(`ps stderr: ${data}`);
        });

        cmd.stderr.pipe(process.stderr)

        cmd.on('close', (code) => {
            if (code !== 0) {
                console.log("fail");
                reject(code);
            } else {
                console.log("success");
                fs.writeFileSync("LAST_KEY", key);
                resolve();
            }
        });

    })
}

run();