const axios = require('axios');
const tmi = require('tmi.js');

const env = require('dotenv').config();


console.log(env.parsed.BOT_USERNAME);
console.log(env.parsed.BOT_OAUTH);
console.log(env.parsed.CHANNEL_NAME);
console.log(env.parsed.BOT_ID);
console.log(env.parsed.BOT_SECRET);

// Define configuration options
const opts = {
  identity: {
    username: env.parsed.BOT_USERNAME,
    password: env.parsed.BOT_OAUTH
  },
  channels: [
    env.parsed.CHANNEL_NAME
  ]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register event handlers
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch
client.connect();

const badWords = ['placeholder1', 'placeholder2', 'placeholder3'];
const userBadWords = {};


// twitch token -u -s 'chat:read chat:edit channel:read:polls channel:manage:polls'

async function getOAuthToken() {
  return axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: env.parsed.BOT_ID,
        client_secret: env.parsed.BOT_SECRET, 
        grant_type: 'client_credentials',
        scope: 'channel:manage:polls'
      }
    })
    .then(response => {
      const oauthToken = response.data.access_token;
      console.log('OAuth token:', oauthToken);
      return oauthToken;
    })
    .catch(error => {
      console.error('Error getting OAuth token:', error.response.data);
      return null;
    });
}

// Called every time a message comes in
async function onMessageHandler (target: string, context: any, msg: string, self: boolean) {
  if (self) return; // Ignore messages from the bot

  const commandName = msg.trim();

  if (commandName === '!poll') {
    const oauthToken = await getOAuthToken();
    console.log('OAuth token:', oauthToken);

    const headers2 = {
      'client-id': env.parsed.BOT_ID,
      'Authorization': 'Bearer ' + env.parsed.BOT_OAUTH,
    };
    
    axios.get('https://api.twitch.tv/helix/users?login=xxbitforgexx', {headers: headers2 })
      .then(async (response: any) => {
        const broadcasterId = response.data.data[0].id;
        console.log("Broadcaster id: " + broadcasterId);
        
        // Creating poll
        const url = "https://api.twitch.tv/helix/polls";
        const data = {
          "broadcaster_id": broadcasterId,
          "title": "Streaming next Tuesday. Which time works best for you?",
          "choices": [
              {"title": "9AM"},
              {"title": "10AM"},
              {"title": "7PM"},
              {"title": "8PM"},
              {"title": "9PM"}
          ],
          "duration": 300
        };

        fetch(url, {
          method: 'POST',
          headers: {
            "Authorization": "Bearer " + env.parsed.BOT_OAUTH,
            "Client-ID": env.parsed.BOT_ID,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch((error: any) => console.error('Error:', error));
      
      })
      .catch((error: any) => {
          console.error(error);
      });
      
    console.log(`* Executed ${commandName} command`);

  } else if (commandName === '!hei') {
    client.say(target, `@${context.username}, Sug en feit kuk!`);
    console.log(`* Executed ${commandName} command`);

  } else if (commandName.includes('!styggeord')) {
    const split_command = commandName.split('@');
    const username = split_command[1];

    console.log(username)

    let bw1 = 0;
    let bw2 = 0;
    let bw3 = 0;

    if (userBadWords[username.toLowerCase()]) {
      for (const word of userBadWords[username.toLowerCase()]) {
        if (word == "placeholder1") {
          bw1++;
        } else if (word == "placeholder2") {
          bw2++;
        } else if (word == "placeholder3") {
          bw3++;
        }
      }

      client.say(target, `@${context.username} har sagt: placeholder1 ${bw1} ganger, placeholder2 ${bw2} ganger, placeholder3 ${bw3} ganger.`);
    } else {
      client.say(target, `@${context.username} har ikke sagt noen stygge ord :)`)
    }

    console.log(`* Executed ${commandName} command`);
  } else if (commandName === '!hjelp') {
    client.say(target, `@${context.username}, her er en liste over tilgjengelige kommandoer: 
    1. !poll - Start en avstemning.
    2. !hei - Sier hei tilbake til deg.
    3. !styggeord @brukernavn - Sjekker hvor mange ganger den personen har brukt stygge ord.
    4. !hjelp - Viser denne hjelpemeldingen.`);
    console.log(`* Executed ${commandName} command`);
  }
  
  
  else {
    console.log(`* Unknown command ${commandName}`);
  }

  for (const word of badWords) {
    if (commandName.includes(word)) {
      if (!userBadWords[context.username]) {
        userBadWords[context.username] = [];
      }

      userBadWords[context.username].push(word);

      console.log(userBadWords);
    }  
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr: string, port: number) {
  console.log(`* Connected to ${addr}:${port}`);
}
