require("dotenv").config();
const Discord = require("discord.js");
const { MongoClient } = require("mongodb");
// const { CronJob } = require('cron');
const axios = require("axios");
const cheerio = require("cheerio");
const client = new Discord.Client();
const cotwBoard = "http://boards.nexustk.com/Chronicles/index.html";
const channelID = process.env.CHANNEL_ID;

// const j = new CronJob(
// 	'*/5 * * * *',
// 	async function() {
// 		console.log('running at: ' + Date.now());
// 		const { links, topPost } = await getPosts();
// 		console.log('newPosts: ', links, 'topPost: ', topPost);
// 		await sendPosts(links, topPost);
// 	},
// 	null, // onComplete
// 	false, // start automatically
// 	'America/Los_Angeles',
// 	null, // context
// 	false, // runOnInit
// );

function start() {
  console.log("start");
  client.login(process.env.COTW_BOT_TOKEN);
  // j.start();
}

async function restartClient() {
  try {
    // j.stop();
    // console.log('rescheduling...');
    client.destroy();
  } catch (e) {
    console.log(e);
  } finally {
    console.log("restarting...");
    start();
  }
}

async function updatePostNumber(postno) {
  const mongoClient = new MongoClient(process.env.MONGO_URL);
  await mongoClient.connect();
  await mongoClient
    .db("cotw")
    .collection("postno")
    .updateOne({ _id: "postno" }, { $set: { postno } }, { upsert: true });
  await mongoClient.close();
  return;
}

async function getPostNumber() {
  const mongoClient = new MongoClient(process.env.MONGO_URL);
  await mongoClient.connect();
  const postNumber = await mongoClient
    .db("cotw")
    .collection("postno")
    .findOne({ _id: "postno" }, { _id: 0 });
  await mongoClient.close();
  return postNumber;
}

async function sendPosts(newPosts, topPost) {
  try {
    for (i = newPosts.length - 1; i >= 0; i--) {
      const post = newPosts[i];
      const data = await axios.get(post);
      const $ = cheerio.load(data.data);
      const author = $('tr:contains("Author :") td').eq(1).text();
      const subject = $('tr:contains("Subject :") td').eq(1).text();
      const date = $('tr:contains("Date :") td').eq(1).text();
      const body = $("tr:nth-child(5) td").text();
      await client.channels.cache
        .get(channelID)
        .send(
          "```md\n" +
            "< Author: " +
            author +
            " >\n< Subject: " +
            subject +
            " >\n< Date: " +
            date +
            " >\n\n" +
            body.split("**").join("") +
            "```",
          {
            split: {
              prepend: "```\n",
              append: "```",
            },
          },
        );
    }
    await updatePostNumber(topPost);
    return;
  } catch (e) {
    console.log(e);
  }
}

async function getPosts() {
  try {
    const data = await axios.get(cotwBoard);
    const $ = cheerio.load(data.data);
    const { postno } = await getPostNumber();
    let topPost = postno;
    const links = [];
    $("tr td:first-child a").each(function () {
      const postNumber = Number($(this).text());
      console.log(topPost, postNumber);
      if (postNumber > topPost) {
        links.push(
          `http://boards.nexustk.com/Chronicles/${$(this).attr("href")}`,
        );
        topPost = postNumber;
      }
    });
    return { links, topPost };
  } catch (e) {
    console.log(e);
  }
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
client.on("message", async (msg) => {
  try {
    const message = msg.content.split(" ");
    if (message[0] === "!cotwforcerun") {
      const { links, topPost } = await getPosts();
      console.log("newPosts: ", links, "topPost: ", topPost);
      sendPosts(links, topPost);
    } else if (message[0] === "!cotwset") {
      console.log("setting post number...");
      updatePostNumber(Number(message[1]));
    } else if (message[0] === "!cotwrestart") {
      restartClient();
    }
  } catch (e) {
    console.log(e);
  }
});
start();
