const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const writeXlsxFile = require("write-excel-file/node");

const seriesId = "ipl-2020-21-1210595";

request("https://www.espncricinfo.com/series/" + seriesId + "/match-results" , callBack);

async function callBack(err , res , html) {
    const $ = cheerio.load(html);
    const scorecardAttr = $('[data-hover = "Scorecard"]');

    const scorecard_Url_Array = [];

    for (let i = 0 ; i < scorecardAttr.length; i++) {

        let url = await "https://www.espncricinfo.com/" + $(scorecardAttr[i]).attr("href");

        scorecard_Url_Array.push(url);

    }

    for (let i = 0 ; i < scorecard_Url_Array.length ; i++) {
        request(scorecard_Url_Array[i] , tableFetcher);
    }

    //  console.log(scorecard_Url_Array);
}
let c = 0;

const schema = [
    // Column #1
    {
      column: 'Name',
      type: String,
      value: player => player.Name
    },
    // Column #2
    {
      column: 'Runs',
      type: String,
      value: player => player.Runs
    },
    // Column #3
    {
      column: 'Balls',
      type: String,
      value: player => player.Balls
    },
    // Column #4
    {
      column: "Four's",
      type: String,
      value: player => player.Fours
    },
    //Col #4
    {
        column : "Six's",
        type : String,
        value: player => player.Sixs
    },
    {
        column : "Strike Rate",
        type : String,
        value: player => player.StrikeRate
    },
    {
        column : "Extra's",
        type : String,
        value: player => player.Extras
    },
    {
        column : "Extra's Run",
        type : String,
        value: player => player.Extra_Runs
    }
    
]

async function tableFetcher(err , res , html) {
    if (err) {

    }
    else {
        const $ = await cheerio.load(html);
        const ining_1_batting = $("table.batsman tbody tr");
        // console.log(ining_1_batting.length);

        let obj1 = [] , obj2 = [] , obj3 = [] , obj4 = [] , flag = 0;

        for (let i = 0 ; i < ining_1_batting.length ; i++) {
            let bat_stats = $(ining_1_batting[i]).find("td");
            // console.log(bat_stats.length);

            if (bat_stats.length == 8 && flag == 0) {
                obj1.push({
                    Name : $(bat_stats[0]).text(),
                    Runs : $(bat_stats[2]).text(),
                    Balls : $(bat_stats[3]).text(),
                    Fours : $(bat_stats[5]).text(),
                    Sixs : $(bat_stats[6]).text(),
                    StrikeRate : $(bat_stats[7]).text(),
                });
            }
            else if (bat_stats.length == 4 && flag == 0) {
                obj1.push({
                    Extras : $(bat_stats[1]).text(),
                    Extra_Runs : $(bat_stats[2]).text(),
                });
                flag = 1;
            }
            else if (bat_stats.length == 8 && flag == 1) {
                obj2.push({
                    Name : $(bat_stats[0]).text(),
                    Runs : $(bat_stats[2]).text(),
                    Balls : $(bat_stats[3]).text(),
                    Fours : $(bat_stats[5]).text(),
                    Sixs : $(bat_stats[6]).text(),
                    StrikeRate : $(bat_stats[7]).text(),
                });
            }
            else if (bat_stats.length == 4 && flag == 1) {
                obj2.push({
                    Extras : $(bat_stats[1]).text(),
                    Extra_Runs : $(bat_stats[2]).text(),
                });
                c++;
                console.log(c);
                await writeXlsxFile([obj1 , obj2] , {
                    schema : [schema , schema],
                    sheets : ["Match 1" , "Match 2"],
                    filePath : 'fileBat' + c + '.xlsx'
                });
                break;
            }

        }
    }
}