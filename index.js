const puppeteer = require('puppeteer');
const fs = require("fs");
const {slugify} = require('transliteration');

(async () => {
    const exist_pages = './exist_pages';
    const start_url = 'https://zhityl.rosfirm.info/tagil/';
    let linksJSON = require("./links/links.json");



    const browser = await puppeteer.launch({
        headless: false,
        devtools: false,
        userDataDir: './cacahe',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-accelerated-2d-canvas',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            //'--window-size=1920x720',
            '--blink-settings=imagesEnabled=false',
        ],
        'ignoreHTTPSErrors': true
    });

    const page = await browser.newPage();
    await page.setCacheEnabled(true);
    await page.setDefaultNavigationTimeout(0);
    await page.setViewport({width: 1280, height: 1024});

    await pageOpen(start_url);
    await rinLInksjson();
    async function pageOpen(u) {

        let urlstr = decodeURIComponent(new URL(u).pathname.replace(/\//g, '_'));

        if (!fs.existsSync(`${exist_pages}/${urlstr}`)) {
            await page.goto(u);

            try {
                console.log('start url', urlstr);

                await page.waitForSelector('#myForm', {timeout: 3000});
                const data = await page.content();
                const html = data.toString('utf8');
                await getLinks();
                await parseable(urlstr);
                await fs.writeFileSync(`${exist_pages}/${urlstr}`,html);

            } catch (e) {
                console.log('error seletor', e);
            }
        } else {
            console.log('url exist', urlstr);
        }
        return true;
    }

    async function getLinks() {
        const hrefs = await page.$$eval('a', as => as.map(a => a.href));
        for (const value of hrefs) {

            let nValue = decodeURIComponent(value);

            if (await value.includes('tagil')) {


                let find_index = linksJSON.findIndex(item => item === nValue);
                //console.log('find_index',find_index)

                if (find_index === -1) {
                    linksJSON.push(nValue);
                }
            }

        }

        let Hotlinks = await linksJSON;
        fs.writeFileSync('./links/links.json', JSON.stringify(Hotlinks));
        return Hotlinks;
    }


    async function rinLInksjson() {

        for (const valueUrl of linksJSON) {
            //
            await pageOpen(encodeURI(valueUrl));
        }
    }

    async function parseable(url) {
        const datatable = await page.$$eval('tr.data', (tr) => {
            let datatd = [];
            if (tr.length) {
                //let td = e.querySelectorAll('td');

                tr.forEach((tr_item, k) => {
                    let tds = tr_item.querySelectorAll('td');
                    let tdrow = [];
                    if (tds.length == 3) {
                        tds.forEach((td_item, k) => {

                            tdrow.push(td_item.innerText);
                        });
                        datatd.push(tdrow);
                    }


                });

            }

            return datatd;
        });

        if (datatable.length) {
            fs.writeFileSync(`./datatable/${url}.json`, JSON.stringify(datatable));
            //console.log('datatable',datatable)
            console.log('parseable', url);
        }


        //console.log('datatable',datatable)
    }

})();
