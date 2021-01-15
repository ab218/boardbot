require("dotenv").config();
const Discord = require("discord.js");
const { CronJob } = require("cron");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
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

const cronJob = new CronJob(
  "0 */15 * * * *",
  async function () {
    console.log("running at: " + Date.now());
    try {
      for (let i = 0; i < boardKeys.length; i++) {
        const board = boardKeys[i];
        const postno = getPostNumber(board);
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
  cronJob.stop();
}

function start() {
  console.log("starting...");
  client.login(process.env.BOARD_BOT_TOKEN);
  cronJob.start();
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

function updatePostNumber(board, postno) {
  const data = JSON.parse(fs.readFileSync("./topBoardPosts.json"));
  data[board] = postno;
  fs.writeFileSync(
    `./topBoardPosts.json`,
    JSON.stringify(data),
    function (err) {
      if (err) {
        console.error("Crap happens");
      }
    },
  );
}

function getPostNumber(board) {
  const data = JSON.parse(fs.readFileSync("./topBoardPosts.json"));
  return data[board];
}

async function sendPosts(newPosts, topPost, board) {
  try {
    for (i = 0; i < newPosts.length; i++) {
      const post = newPosts[i];
      const linkURL = post.split(".html")[0];
      const postNumber = linkURL.slice(linkURL.length - 4);
      const data = await axios.get(post);
      const $ = cheerio.load(data.data);
      const author = $('tr:contains("Author :") td').eq(1).text();
      const subject = $('tr:contains("Subject :") td').eq(1).text();
      const date = $('tr:contains("Date :") td').eq(1).text();
      const body = $("tr:nth-child(5) td").text().split("<b>").join("");
      await client.channels.cache
        .get(boardLookupTable[board])
        .send(
          "```md\n" +
            "#" +
            postNumber +
            "\n" +
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
              char: " ",
              prepend: "```md\n",
              append: "```",
            },
          },
        );
    }
    updatePostNumber(board, topPost);
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
  const boardName = message[1];
  if (boardName === "all") {
    try {
      for (let i = 0; i < boardKeys.length; i++) {
        const board = boardKeys[i];
        const postno = getPostNumber(board);
        const { links, topPost } = await getPosts(board, postno);
        console.log("newPosts: ", links, "topPost: ", topPost);
        await sendPosts(links, topPost, board);
      }
    } catch (e) {
      console.log(e, "in forcerun command");
    }
  } else if (!boardLookupTable[boardName]) {
    console.log(
      `${boardName} board not found. Choose from the following: ${boardKeys} or all.`,
    );
    return;
  } else if (
    boardLookupTable[boardName] &&
    typeof boardLookupTable[boardName] === "string"
  ) {
    const postno = getPostNumber(boardName);
    const { links, topPost } = await getPosts(boardName, postno);
    console.log("newPosts: ", links, "topPost: ", topPost);
    return sendPosts(links, topPost, boardName);
  } else {
    console.log("something went wrong, idiot");
    return;
  }
}

function setBoard(message) {
  const boardName = message[1];
  const newTopPost = message[2];
  if (boardName === "all") {
    for (let i = 0; i < boardKeys.length; i++) {
      updatePostNumber(boardKeys[i], 9999);
    }
    return;
  } else if (!boardLookupTable[boardName]) {
    console.log(
      `${boardName} board not found. Choose from the following: ${boardKeys}`,
    );
    return;
  } else if (!newTopPost || !Number(newTopPost)) {
    console.log("please enter a valid post number to set board to.");
    return;
  }
  console.log(`setting post number of ${boardName} to ${newTopPost}...`);
  updatePostNumber(boardName, Number(newTopPost));
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (msg) => {
  try {
    const message = msg.content.split(" ");
    const userCommand = message[0];
    if (userCommand === "!boardsforcerun") {
      forceRun(message);
    } else if (userCommand === "!setboard") {
      setBoard(message);
    } else if (userCommand === "!boardsrestart") {
      restartClient();
    } else if (userCommand === "!boardsstart") {
      start();
    } else if (userCommand === "!boardsstop") {
      stop();
    }
  } catch (e) {
    console.log(e);
  }
});

start();
