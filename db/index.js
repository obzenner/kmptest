const createArtistsTable = async (dynamoDB) => {
    const tableParams = {
        TableName: 'Artists',
        KeySchema: [
            { AttributeName: "artist", KeyType: "HASH"},  //Partition key
            { AttributeName: "rank", KeyType: "RANGE" }  //Sort key
        ],
        AttributeDefinitions: [       
            { AttributeName: "artist", AttributeType: "S" },
            { AttributeName: "rank", AttributeType: "N" }
        ],
        ProvisionedThroughput: {       
            ReadCapacityUnits: 10, 
            WriteCapacityUnits: 10
        }
    }

    const tables = await dynamoDB.listTables({}).promise();
    const hasTable = tables['TableNames'].includes('Artists');

    if (hasTable) {
        return;
    }
    
    dynamoDB.createTable(tableParams, function(err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}

// kmptest-web-1  |     rank: '124',
// kmptest-web-1  |     title: 'The Greatest Story Never Told',
// kmptest-web-1  |     artist: 'Saigon',
// kmptest-web-1  |     release: 'February 15, 2011',
// kmptest-web-1  |     summary: 'The long-awaited debut album by the Brooklyn-based rapper is produced by Just Blaze and features guest appearances from Q-Tip, Jay-Z and other notable artists.',
// kmptest-web-1  |     metascore: '89',
// kmptest-web-1  |     userscore: '8.3'
// kmptest-web-1  |   },

const saveToArtistsDB = async (dynamoDBClient, data) => {
    return new Promise((resolve, reject) => {
        let params;
        for (const _artist of data) {
            const { artist, rank, title, release, summary, metascore, userscore } = _artist;
            params = {
                TableName: 'Artists',
                Item: {
                    'artist': artist,
                    'rank': Number(rank),
                    'info': {
                        title,
                        release,
                        summary,
                        metascore,
                        userscore
                    }
                }
            }

            dynamoDBClient.put(params, function (err, data) {
                if (err) {
                    console.error("Unable to add artist", artist, ". Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("PutItem succeeded:", artist);
                }
            })
        }
        resolve('Write to Artists table successful.')()
    })
}

module.exports = {
    createArtistsTable,
    saveToArtistsDB
}