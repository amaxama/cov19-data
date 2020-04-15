const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

async function getMnData(row, index, arr) {
    arr[index] = { name: row[0], MN_new: Number(row[1]), MN_total: Number(row[2].replace(',','')) }
}

function getCases(str) {
    const i = str.indexOf('(');
    const sub = str.substring(0, i);
    const numStr = sub.replace(',','');
    return Number(numStr);
    
}

// function getYesterdayCases(str, todayCases) {
//     console.log(str);
//     const iPlus = str.indexOf('+');
//     const iPercent = str.indexOf('%');
//     const sub = str.substring(iPlus+1, iPercent);
//     console.log(sub)
//     const percent = Number(sub)/100
//     const num = Number(1 + percent);
//     const newCases = todayCases / num;
//     console.log(newCases);
//     console.log(Math.floor(newCases));
//     return Math.round(newCases);
// }

function getYesterdayCases(row, index, arr) {
    if(index>0) {
        return arr[index-1].IL_total;
    } else {
        return 6;
    }
}

async function getIlData(row, index, arr) {
    // console.log(row);
    const date = row[0].slice(5, this.length);
    // const yesterdayCases = getYesterdayCases(row[2], todayCases)
    const yesterdayCases = getYesterdayCases(row, index, arr)
    // console.log("yestCases: " + yesterdayCases);
    const todayCases = getCases(row[2]);
    // console.log("todayCases: " + todayCases);
    arr[index] = { 
        name: date,
        IL_new: todayCases - yesterdayCases,
        IL_total: todayCases
    }
}

app.get('/api/ilData', async (req, res) => {
    // console.log("made it to IL");
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(req.query.url);

    // console.log("made it past page");
    const data = await page.evaluate(
        () => Array.from(
            document.querySelectorAll('#mw-content-text > div > div.barbox.tright > div > table > tbody > tr'),
            row => 
            Array.from(
                row.querySelectorAll('td'), 
                cell => cell.innerText,
            )
        )
    );

    const result = data.slice(8,data.length-1);
    console.log(result);
    result.forEach(getIlData);

    console.log(result);

    res.status(200).send({ data : result});
    // console.log("sent data back")
    await browser.close();
});

app.get('/api/data', async (req, res) => { 
    // scrapeMnData(req.query.url, res)
    // console.log("made it!");

    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(req.query.url);
    
    const data = await page.evaluate(
        () => Array.from(
          document.querySelectorAll('#cases > div > table > tbody > tr'),
          row =>  Array.from(row.querySelectorAll('th, td'), cell => cell.innerText) 
        )
    );
    const result = data.slice(3,data.length)
    result.forEach(getMnData)

    console.log(result);

    // console.log(result[1][2]);

    res.status(200).send({ data : result});

    // console.log("sent data back")
    
    await browser.close();
});

app.get("/*", function (req, res) {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'), function(err) {
        if (err) {
        res.status(500).send(err)
        }
    });
});

const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Listening on port ${port}`));


// async function scrapeData(ilUrl, mnUrl) {
    // scrapeIlData(ilUrl)
    // return scrapeMnData(mnUrl);
// }

// function buildDate() {
//     let today = new Date();
//     return (String(today.getMonth() + 1) + '-' + String(today.getDate()) + '-' + String(today.getFullYear()));

// }

// function logCases(cases) {
//     console.log(buildDate() + ': ' + cases);
// }

// async function scrapeIlData(url) {
//     const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
//     const page = await browser.newPage();
//     await page.goto(url);

    
//     const [ilCasesEl] = await page.$x('//*[@id="covid19positive"]');
//     const ilCasesTxt = await ilCasesEl.getProperty('textContent');
//     const ilCases = await ilCasesTxt.jsonValue();

//     logCases(ilCases);

//     browser.close();

// }

// function splitCases(cases) {
//     const data = cases.split("\n");
//     const parsed = data.slice(1, data.length-1);
//     parsed.forEach(getDayData);
//     return parsed; 
// }

// function getDayData(dayString, index, arr) {
//     const day = dayString.replace("\t", " ").split(", ");
//     arr[index] = { name: day[0], MN_new: Number(day[1]), MN_total: Number(day[2]) }
//     // dayString = dayString.replace("\t", " ").split(", ");
//     // console.log(dayString);
//     // return a;
// }

// async function scrapeMnData(url, res) {
//     const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
//     const page = await browser.newPage();
//     await page.goto(url);

//     const [mnCasesEl] = await page.$x('//*[@id="body"]/ul[2]/li/text()')
//     const mnCasesTxt = await mnCasesEl.getProperty('textContent');
//     const mnCases = await mnCasesTxt.jsonValue();

//     const [mnCasesChartEl] = await page.$x('//*[@id="body"]/img[1]');
//     const mnCasesChartTxt = await mnCasesChartEl.getProperty('alt');
//     const mnCasesChart = await mnCasesChartTxt.jsonValue();

//     logCases(mnCases);

//     res.writeHead(200, {
//         'Content-Type': 'application/json',
//         'Content-Length': data.length
//     });
//     res.end(splitCases(mnCasesChart));
    
//     await browser.close();

//     // return splitCases(mnCasesChart);

// }




// scrapeData('https://covid19stats.live/coronavirus/statistics/usa')

// scrapeData('https://www.amazon.com/Black-Swan-Improbable-Nicholas-Takeaways/dp/B01AIKQ5LY/ref=sr_1_8?dchild=1&keywords=The+Black+Swan&qid=1586028302&s=books&sr=1-8')

// scrapeData('https://www.amazon.com/Original-Sliding-C-Slide-Privacy-Chromebooks/dp/B00HPC66U4/ref=redir_mobile_desktop?ie=UTF8&aaxitk=kvaMVx7EIROYGBtiHtuOuA&hsa_cr_id=9596171540801&ref_=sb_s_sparkle')

// const mnData = scrapeData('https://www.dph.illinois.gov/covid19/covid19-statistics', 'https://www.health.state.mn.us/diseases/coronavirus/situation.html')

// export default mnData;


