'use strict';

const fs = require('fs');
const csv = require('csv-parser');
const { knuthMorrisPratt } = require('./kmp');

const escapeRegExp = (str) => str.replace(/[\-\[\]\/{}()*+?.\\^$|]/g, '\\$&');
const getRegForWord = (word) => new RegExp(`(^|\\b)${escapeRegExp(word)}(\\b|$)`, 'i');



const toBlackList = (str, blacklist) => {
    for (let i = 0; i < blacklist.length; i++) {
        const word = blacklist[i];
        // const wR = getRegForWord(word);
        // const isMatch = str.match(wR);
        const isMatch = knuthMorrisPratt(str, word);

        if (isMatch !== -1) {
            return true;
        }
    }

    return false;
}

const parseData = async () => {
    return new Promise ((resolve) => {
        let data = [];

        const blackList = fs.readFileSync('./data/blacklist.txt')
            .toLocaleString()
            .split('\n')
            .reduce((acc, curr) => {
                const w = `${curr.charAt(0).toUpperCase()}${curr.substring(1)}`;
                return [...acc, w]
            }, []);

        fs.createReadStream('./data/demo.csv')
            .pipe(csv())
            .on('data', (csvrow) => {
                const str = csvrow['DESC'];
                const isBlackListed = toBlackList(str, blackList);

                if (!isBlackListed) {
                    data = [...data, csvrow];
                }
            })
            .on('end', function () {
                resolve(data);
            });
    });
}

module.exports = {
    parseData
}

