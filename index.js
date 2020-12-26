require("dotenv").config();
const Discord = require("discord.js");
const { MongoClient } = require("mongodb");
const { CronJob } = require("cron");
const axios = require("axios");
const cheerio = require("cheerio");
const client = new Discord.Client();

// Constants
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

const boardLookupTable = {
  [CHRONICLES]: process.env.CHRONICLES,
  [BUY]: process.env.BUY,
  [SELL]: process.env.SELL,
  [COMMUNITY]: process.env.COMMUNITY,
  [DREAM_WEAVER]: process.env.DREAM_WEAVER,
  [DREAMS]: process.env.DREAMS,
  [COMM_EVENTS]: process.env.COMM_EVENTS,
  [WHISPERING_WINDS]: process.env.WHISPERING_WINDS,
  [POETRY]: process.env.POETRY,
  [STORY_CONTEST]: process.env.STORY_CONTEST,
  [HUNTING]: process.env.HUNTING,
  [CARNAGE]: process.env.CARNAGE,
};

const boardKeys = Object.keys(boardLookupTable);

const j = new CronJob(
  "0 */5 * * * *",
  async function () {
    console.log("running at: " + Date.now());
    try {
      for (let i = 0; i < boardKeys.length; i++) {
        const board = boardKeys[i];
        const { postno } = await getPostNumber(board);
        const { links, topPost } = await getPosts(board, postno);
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
      console.log("an error happened with CronJob");
    }
  },
  null, // onComplete
  false, // start automatically
  "America/Los_Angeles",
  null, // context
  false, // runOnInit
);

function stop() {
  console.log("stopping jobs...");
  j.stop();
}

function start() {
  console.log("starting...");
  client.login(process.env.BOARDS_BOT_TOKEN);
  j.start();
}

async function restartClient() {
  try {
    stop();
    client.destroy();
  } catch (e) {
    console.log(e);
  } finally {
    console.log("restarting...");
    start();
  }
}

async function updatePostNumber(board, postno) {
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
        .get(boardLookupTable[board])
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
    await updatePostNumber(board, topPost);
    return;
  } catch (e) {
    console.log(e);
  }
}

async function getPosts(board, prevTop) {
  try {
    const data = await axios.get(
      `http://boards.nexustk.com/${board}/index.html`,
    );
    const $ = cheerio.load(data.data);
    const posts = $("tr td:first-child a");
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
    console.log(`an error in getPosts getting ${board}`);
    return { links: [], topPost: prevTop };
  }
}

async function forceRun(message) {
  if (message[1] && message[1] === "all") {
    try {
      for (let i = 0; i < boardKeys.length; i++) {
        const board = boardKeys[i];
        const { postno } = await getPostNumber(board);
        const { links, topPost } = await getPosts(board, postno);
        console.log("newPosts: ", links, "topPost: ", topPost);
        return sendPosts(links, topPost, board);
      }
    } catch (e) {
      console.log(e, "in forcerun command");
    }
  } else if (!boardLookupTable[message[1]]) {
    console.log(
      `${message[1]} board not found. Choose from the following: ${boardKeys} or all.`,
    );
    return;
  } else if (
    boardLookupTable[message[1]] &&
    typeof boardLookupTable[message[1]] === "string"
  ) {
    const { postno } = await getPostNumber(message[1]);
    const { links, topPost } = await getPosts(message[1], postno);
    console.log("newPosts: ", links, "topPost: ", topPost);
    return sendPosts(links, topPost, message[1]);
  } else {
    console.log("something went wrong, idiot");
    return;
  }
}

function setBoard(message) {
  if (message[1] && message[1] === "all") {
    for (let i = 0; i < boardKeys.length; i++) {
      updatePostNumber(boardKeys[i], 9999);
    }
  } else if (!boardLookupTable[message[1]]) {
    console.log(
      `${message[1]} board not found. Choose from the following: ${boardKeys}`,
    );
    return;
  }
  if (!message[2] || !Number(message[2])) {
    console.log("please enter a valid post number to set board to.");
    return;
  }
  console.log(`setting post number of ${message[1]} to ${message[2]}...`);
  updatePostNumber(message[1], Number(message[2]));
}

client.on("message", (msg) => {
  try {
    const message = msg.content.split(" ");
    if (message[0] === "!boardsforcerun") {
      forceRun(message);
    } else if (message[0] === "!setboard") {
      setBoard(message);
    } else if (message[0] === "!boardsrestart") {
      restartClient();
    } else if (message[0] === "!boardsstart") {
      start();
    } else if (message[0] === "!boardsstop") {
      stop();
    }
  } catch (e) {
    console.log(e);
  }
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

start();
