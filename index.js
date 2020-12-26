require("dotenv").config();
const Discord = require("discord.js");
const { MongoClient } = require("mongodb");
const { CronJob } = require("cron");
const axios = require("axios");
const cheerio = require("cheerio");
const client = new Discord.Client();

const CHRONICLES = "Chronicles";
const BUY = "MarketB";
const SELL = "MarketS";
const COMMUNITY = "Community";
const DREAM_WEAVER = "DreamWeaver";
const DREAMS = "Dreams";
const COMM_EVENTS = "ComEvents";
const WHISPERING_WINDS = "WhisperingWinds";
const POETRY = "Poetry";
const STORY_CONTEST = "Story";
const HUNTING = "Hunting";
const CARNAGE = "Carnage";

const boardsList = [
  CHRONICLES,
  BUY,
  SELL,
  COMMUNITY,
  DREAM_WEAVER,
  DREAMS,
  COMM_EVENTS,
  WHISPERING_WINDS,
  POETRY,
  STORY_CONTEST,
  HUNTING,
  CARNAGE,
];

function getChannelID(board) {
  switch (board) {
    case CHRONICLES:
      return process.env.CHRONICLES;
    case BUY:
      return process.env.BUY;
    case SELL:
      return process.env.SELL;
    case COMMUNITY:
      return process.env.COMMUNITY;
    case DREAM_WEAVER:
      return process.env.DREAM_WEAVER;
    case DREAMS:
      return process.env.DREAMS;
    case COMM_EVENTS:
      return process.env.COMM_EVENTS;
    case WHISPERING_WINDS:
      return process.env.WHISPERING_WINDS;
    case POETRY:
      return process.env.POETRY;
    case STORY_CONTEST:
      return process.env.STORY_CONTEST;
    case HUNTING:
      return process.env.HUNTING;
    case CARNAGE:
      return process.env.CARNAGE;
    default:
      return null;
  }
}

const j = new CronJob(
  "0 */5 * * * *",
  async function () {
    console.log("running at: " + Date.now());
    try {
      for (let i = 0; i < boardsList.length; i++) {
        const board = boardsList[i];
        const { links, topPost } = await getPosts(board);
        console.log(
          "board: ",
          board,
          "newPosts: ",
          links,
          "topPost: ",
          topPost,
        );
        await sendPosts(links, topPost, board);
      }
    } catch (e) {
      console.log(e);
    }
  },
  null, // onComplete
  false, // start automatically
  "America/Los_Angeles",
  null, // context
  false, // runOnInit
);

function start() {
  console.log("start");
  client.login(process.env.COTW_BOT_TOKEN);
  j.start();
}

async function restartClient() {
  try {
    j.stop();
    console.log("rescheduling...");
    client.destroy();
  } catch (e) {
    console.log(e);
  } finally {
    console.log("restarting...");
    start();
  }
}

async function updatePostNumber(postno, board) {
  const mongoClient = new MongoClient(process.env.MONGO_URL);
  await mongoClient.connect();
  await mongoClient
    .db("boards")
    .collection(board)
    .updateOne({ _id: "postno" }, { $set: { postno } }, { upsert: true });
  await mongoClient.close();
  return;
}

async function getPostNumber(board) {
  const mongoClient = new MongoClient(process.env.MONGO_URL);
  await mongoClient.connect();
  const postNumber = await mongoClient
    .db("boards")
    .collection(board)
    .findOne({ _id: "postno" }, { _id: 0 });
  await mongoClient.close();
  return postNumber;
}

async function sendPosts(newPosts, topPost, board) {
  try {
    for (i = 0; i < newPosts.length; i++) {
      const post = newPosts[i];
      const data = await axios.get(post);
      const $ = cheerio.load(data.data);
      const author = $('tr:contains("Author :") td').eq(1).text();
      const subject = $('tr:contains("Subject :") td').eq(1).text();
      const date = $('tr:contains("Date :") td').eq(1).text();
      const body = $("tr:nth-child(5) td").text();
      await client.channels.cache
        .get(getChannelID(board))
        .send(
          "```md\n" +
            "> Date: " +
            date +
            "\n" +
            "< Author: " +
            author +
            " >\n" +
            "< Subject: " +
            subject +
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
    await updatePostNumber(topPost, board);
    return;
  } catch (e) {
    console.log(e);
  }
}

async function getPosts(board) {
  try {
    const data = await axios.get(
      `http://boards.nexustk.com/${board}/index.html`,
    );
    const $ = cheerio.load(data.data);
    const posts = $("tr td:first-child a");
    const { postno } = await getPostNumber(board);
    const prevTop = postno;
    const newTop = Number($(posts[0]).text());

    const links = [];

    for (let i = posts.length - 1; i >= 0; i--) {
      const postNumber = Number($(posts[i]).text());
      if (postNumber > prevTop) {
        links.push(
          `http://boards.nexustk.com/${board}/${$(posts[i]).attr("href")}`,
        );
      }
    }

    return { links, topPost: newTop };
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
      try {
        for (let i = 0; i < boardsList.length; i++) {
          const board = boardsList[i];
          const { links, topPost } = await getPosts(board);
          console.log("newPosts: ", links, "topPost: ", topPost);
          sendPosts(links, topPost, board);
        }
      } catch (e) {
        console.log(e);
      }
    } else if (message[0] === "!setall") {
      try {
        for (let i = 0; i < boardsList.length; i++) {
          updatePostNumber(Number(message[1]), boardsList[i]);
        }
      } catch (e) {
        console.log(e);
      }
    } else if (message[0] === "!cotwset") {
      console.log("setting post number...");
      updatePostNumber(Number(message[1]), boardsList[0]);
    } else if (message[0] === "!buyset") {
      console.log("setting post number...");
      updatePostNumber(Number(message[1]), boardsList[1]);
    } else if (message[0] === "!sellset") {
      console.log("setting post number...");
      updatePostNumber(Number(message[1]), boardsList[2]);
    } else if (message[0] === "!cotwrestart") {
      restartClient();
    }
  } catch (e) {
    console.log(e);
  }
});
start();
