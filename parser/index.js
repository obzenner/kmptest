'use strict';

const fs = require('fs');
const csv = require('csv-parser');
const { knuthMorrisPratt } = require('./kmp');

const escapeRegExp = (str) => str.replace(/[\-\[\]\/{}()*+?.\\^$|]/g, '\\$&');
const getRegForWord = (word) => new RegExp(`(^|\\b)${escapeRegExp(word)}(\\b|$)`, 'i');



const toBlackList = ({ str, blackList, kmp }) => {
    let isMatch = false;

    for (let i = 0; i < blackList.length; i++) {
        const word = blackList[i];
        const wR = getRegForWord(word);
        const found = kmp ? knuthMorrisPratt(str, word) !== -1 : str.match(wR); 

        if (found) {
            isMatch = true;
            break;
        }
    }

    return isMatch;
}

const parseData = async (kmp) => {
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
                const isBlackListed = toBlackList({ str, blackList, kmp });

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

