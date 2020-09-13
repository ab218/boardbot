require('dotenv').config();
const puppeteer = require('puppeteer');
const schedule = require('node-schedule');
const moment = require('moment-timezone');
const Discord = require('discord.js');
const client = new Discord.Client();
const carnageBoard = 'http://boards.nexustk.com/Carnage/index.html';

async function run(msg) {
	try {
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
		const dailySchedule = data[8].split('<b>');
		// schedule jobs
		const msgChannel = msg.channel.id;
		dailySchedule.forEach((hour) => {
			const split = hour.split('\n').filter(Boolean);
			if (split.length && moment(split[0]).isValid()) {
				split.forEach((slot) => {
					const date = moment(split[0]).year(2020).tz('America/New_York');
					const words = slot.split(' ');
					const firstWord = words[0].toLowerCase();
					if (firstWord.includes('am')) {
						const hour = Number(firstWord.split('am')[0]);
						const time = date.hour(hour).subtract(30, 'm');
						const event = words.slice(1).join(' ');
						const timeChannelID = time.unix() + msgChannel;
						if (!schedule.scheduledJobs[timeChannelID]) {
							schedule.scheduleJob(timeChannelID, time.unix(), () => {
								return client.channels.cache.get(msgChannel).send(`@pk ${event} beginning in 30 minutes!`);
							});
						}
					} else if (firstWord.includes('pm')) {
						const hour = Number(firstWord.split('pm')[0]);
						const time = date.hour(hour).add(12, 'h').subtract(30, 'm');
						const event = words.slice(1).join(' ');
						const timeChannelID = time.unix() + msgChannel;
						if (!schedule.scheduledJobs[timeChannelID]) {
							schedule.scheduleJob(timeChannelID, time.unix(), () => {
								return client.channels.cache.get(msgChannel).send(`@pk ${event} beginning in 30 minutes!`);
							});
						}
					} else if (firstWord.includes('midn')) {
						const time = date.hour(23).add(30, 'm');
						const event = words.slice(1).join(' ');
						const timeChannelID = time.unix() + msgChannel;
						if (!schedule.scheduledJobs[timeChannelID]) {
							schedule.scheduleJob(timeChannelID, time.unix(), () => {
								return client.channels.cache.get(msgChannel).send(`@pk ${event} beginning in 30 minutes!`);
							});
						}
					}
				});
			}
		});
		msg.reply('```md\n' + dailySchedule.join('# ').split('**').join('') + '```', {
			split: {
				prepend: '```md\n',
				append: '```',
			},
		});
		return;
	} catch (e) {
		console.log(e);
	}
}

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});
client.on('message', async (msg) => {
	try {
		if (msg.channel.name === 'carnage-schedule' && msg.content === '!schedule') {
			run(msg);
		}
	} catch (e) {
		console.log(e);
	}
});
client.login(process.env.CARNY_BOT_TOKEN);
