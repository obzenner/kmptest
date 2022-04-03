"use strict";

const fs = require("fs");
const csv = require("csv-parser");
const { knuthMorrisPratt } = require("./kmp");

const escapeRegExp = (str) => str.replace(/[\-\[\]\/{}()*+?.\\^$|]/g, "\\$&");
const getRegForWord = (word) =>
    new RegExp(`(^|\\b)${escapeRegExp(word)}(\\b|$)`, "i");

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
};

const removeDuplicationFromList = (list) => {
    const checkedKeyword = new Map();
  
    return list.reduce((acc, kw) => {
      const exists = checkedKeyword.get(kw); // check if kw exists in Map (O(1))
  
      // if duplicate kw's volume is > than existing, replace
      if (exists) {
        acc[exists.index] = kw; // replace with new in acc at the write index
        return acc;
      }
  
      if (!exists) {
        acc.push(kw);
        checkedKeyword.set(kw, { index: acc.length - 1 });
      }
  
      return acc;
    }, []);
  };

const parseData = async (kmp) => {
    return new Promise((resolve) => {
        let data = [];

        const blackList = fs
            .readFileSync("./data/blacklist.txt")
            .toLocaleString()
            .split("\n")
            .reduce((acc, curr) => {
                const w = `${curr.charAt(0).toUpperCase()}${curr.substring(1)}`;
                return [...acc, w];
            }, []);

        fs.createReadStream("./data/metacritic.csv")
            .pipe(csv())
            .on("data", (csvrow) => {
                const str = csvrow["artist"];
                console.log(str)
                const isBlackListed = toBlackList({ str, blackList, kmp });

                if (!isBlackListed) {
                    data = [...data, csvrow];
                }
            })
            .on("end", function () {
                resolve(data);
            });
    });
};

const compareLists = () => {
    const blackList = fs
        .readFileSync("./data/blacklist.txt")
        .toLocaleString()
        .split("\n");

    const wordlist = fs
        .readFileSync("./data/wordlist.txt")
        .toLocaleString()
        .split("\n");

    const unqWordList = removeDuplicationFromList(wordlist); // time: O(N)
    const blackListToString = blackList.reduce((acc, w) => `${acc} ${w}`); // time: O(N);
    const existsInBlackList = unqWordList.reduce((acc, w) => {
        if (knuthMorrisPratt(blackListToString, w) !== -1) {
            acc.push(w);
        }
        return acc;
    }, [])
    return existsInBlackList;
};

module.exports = {
    parseData,
    compareLists,
};
