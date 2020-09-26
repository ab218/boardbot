require('dotenv').config();
const Discord = require('discord.js');
const { MongoClient } = require('mongodb');
const axios = require('axios');
const cheerio = require('cheerio');
const schedule = require('node-schedule');
const client = new Discord.Client();
const cotwBoard = 'http://boards.nexustk.com/Chronicles/index.html';
const channelID = process.env.CHANNEL_ID;

schedule.scheduleJob('*/5 * * * *', async function() {
	console.log('running at: ' + Date.now());
	const newPosts = await getPosts();
	console.log('newPosts', newPosts);
	await sendPosts(newPosts);
});

async function destroyClient() {
	client.destroy();
}

async function updatePostNumber(client, postno) {
	await client.db('cotw').collection('postno').updateOne({ _id: 'postno' }, { $set: { postno } }, { upsert: true });
}

async function getPostNumber(client) {
	return await client.db('cotw').collection('postno').findOne({ _id: 'postno' }, { _id: 0 });
}

async function setCotw(targetPostNumber) {
	const mongoClient = new MongoClient(process.env.MONGO_URL);
	try {
		console.log('setting post number');
		await mongoClient.connect();
		await updatePostNumber(mongoClient, Number(targetPostNumber));
	} catch (e) {
		console.log(e);
	} finally {
		await mongoClient.close();
	}
}

async function sendPosts(newPosts) {
	try {
		for (i = newPosts.length - 1; i >= 0; i--) {
			const post = newPosts[i];
			const data = await axios.get(post);
			const $ = cheerio.load(data.data);
			const author = $('tr:contains("Author :") td').eq(1).text();
			const subject = $('tr:contains("Subject :") td').eq(1).text();
			const date = $('tr:contains("Date :") td').eq(1).text();
			const body = $('tr:nth-child(5) td').text();
			client.channels.cache
				.get(channelID)
				.send(
					'```md\n' +
						'< Author: ' +
						author +
						' >\n< Subject: ' +
						subject +
						' >\n< Date: ' +
						date +
						' >\n\n' +
						body.split('**').join('') +
						'```',
					{
						split: {
							prepend: '```\n',
							append: '```',
						},
					},
				);
		}
	} catch (e) {
		console.log(e);
	}
}

async function getPosts() {
	const mongoClient = new MongoClient(process.env.MONGO_URL);
	try {
		console.log('start');
		await mongoClient.connect();
		const data = await axios.get(cotwBoard);
		const $ = cheerio.load(data.data);
		const { postno } = await getPostNumber(mongoClient);
		let topPost = postno;
		const links = [];
		$('tr td:first-child a').each(function() {
			const postNumber = Number($(this).text());
			if (postNumber > topPost) {
				topPost = postNumber;
			}
			if (postNumber > postno) {
				links.push(`http://boards.nexustk.com/Chronicles/${$(this).attr('href')}`);
			}
		});
		await updatePostNumber(mongoClient, topPost);
		return links;
	} catch (e) {
		console.log(e);
	} finally {
		await mongoClient.close();
	}
}

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});
client.on('message', async (msg) => {
	try {
		const message = msg.content.split(' ');
		if (message[0] === '!cotwforcerun') {
			const newPosts = await getPosts();
			console.log('newPosts', newPosts);
			await sendPosts(newPosts);
		} else if (message[0] === '!cotwset') {
			setCotw(message[1]);
		} else if (message[0] === '!destroy') {
			destroyClient();
		}
	} catch (e) {
		console.log(e);
	}
});
client.login(process.env.COTW_BOT_TOKEN);
