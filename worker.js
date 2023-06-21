const cliProgress = require('cli-progress');
const bip39 = require('bip39');
const fs = require('fs');
const { Wallet, utils } = require('ethers');
const colors = require('ansi-colors');


// create new container
const progressBar = new cliProgress.SingleBar({
    format: `Generated: {address} || ${colors.cyan('{value}')} addresses || Speed: ${colors.yellow('{speed}')} addr/s, Running time: ${colors.magenta('{time}')}s | Found: ${colors.green('{found}')}`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
});
const threads = 1;
const mnemonic = bip39.generateMnemonic();
// console.log(mnemonic)

// const hdNode = utils.HDNode.fromMnemonic(mnemonic);
const hdNode = utils.HDNode.fromMnemonic(mnemonic);
const regexs = [
    [/(\w)\1{5}$/i, '4 last same numbers'],
    [/^0x(cafe).*(cafe)$/i, 'cafe..cafe'],
    [/^0x(cafeda).*(cafeda)$/i, 'cafeda..cafeda'],
    [/^0x(beef).*(beef)$/i, 'beef..beef'],
    [/^0x(beefbeef).*(beefbeef)$/i, 'beef..beef'],
    [/(beefbeefbeef)$/i, '3*beef'],
    
    [/^0x(\w)\1{2}(.*)\1{3}$/i, '000..000'],
    [/^0x(\w)\1{3}(.*)\1{4}$/i, '0000..0000'],
    [/^0x(\w)\1{4}(.*)\1{5}$/i, '00000..00000'],
    
    [/^0x(\w)\1{1}(\w)\2{1}(.*)(\w)\4{1}(\w)\5{1}$/i, '0011..2233'],
    [/^0x(\w)\1{1}(\w)\2{1}(.*)(\1{2}\2{2})$/i, '0011..0011'],
    [/^0x(\w)\1{1}(\w)\2{1}(.*)\2{2}\1{2}$/i, '0011..1100'],
    [/^0x(\w)\1{1}(\w)\2{1}(.*)\4{3}$/i, '0011..2222'],
    [/^0x(\w)\1{3}(.*)(\w)\3{3}$/i, '0000..1111'],
    [/^0x(\w)\1{3}(.*)(\w)\3{3}$/i, '0000..1111'],
];
let n = 0;
progressBar.start(Infinity, 0, {
    speed: "N/A"
});
let before = Date.now();
let found = 0;
while (true) {
    const account = hdNode.derivePath(`m/44'/60'/0'/0/${n}`);
    for (let i = 0; i < regexs.length; i++) {
        const regex = regexs[i][0];
        let time = Date.now() - before;
        let speed = time/n;
        progressBar.update(n, {
            speed: speed.toFixed(2),
            time: (time/1000).toFixed(0),
            found,
            address: account.address.toLowerCase()
        })
        // console.log(account.address.toLowerCase())
        if (regex.test(account.address)) {
            console.log(`\n${account.address.toLowerCase()} || (${regexs[i][1]})`);
            found++;
            fs.appendFileSync('localdb/' + mnemonic, `${JSON.stringify(account, null, 2)}\n`);
        }
    }
    n++;
}