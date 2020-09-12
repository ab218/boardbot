require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const puppeteer = require('puppeteer');
const carnageBoard = 'http://boards.nexustk.com/Carnage/index.html';

async function run(msg) {
	console.log('start');
	const browser = await puppeteer.launch({ headless: true, args: [ '--no-sandbox', '--disable-setuid-sandbox' ] });
	const page = await browser.newPage();
	await page.goto(carnageBoard, { waitUntil: 'networkidle0' });
	console.log('go to page');
	await page.waitFor('td');
	const [ schedulePost ] = await page.$x("//a[contains(., 'hedule')]");
	if (schedulePost) {
		await schedulePost.click();
	} else {
		return msg.reply('Could not find any schedule... :(');
	}
	await page.waitFor('td');
	const data = await page.$$eval('table tr td', (tds) =>
		tds.map((td) => {
			return td.innerText;
		}),
	);
	await browser.close();
	const formattedData = data[8].split('<b>').join('#');
	msg.reply('```md\n' + formattedData + '```', {
		split: {
			prepend: '```md\n',
			append: '```',
		},
	});
	return;
}

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});
client.on('message', async (msg) => {
	if (msg.channel.name === 'carnage-schedule' && msg.content === '!schedule') {
		run(msg);
	}
});
client.login(process.env.CARNY_BOT_TOKEN);
