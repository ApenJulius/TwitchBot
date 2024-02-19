const axios = require('axios');
const tmi = require('tmi.js');


// Define configuration options
const opts = {
  identity: {
    username: 'bitforgebot',
    password: '6jajkl76y6mjc6w3pmw5p7d3ymshp9'
  },
  channels: [
    'xxbitforgexx'
  ]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register event handlers
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch
client.connect();


async function getOAuthToken() {
  return axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: 'pgst6bpckqhgg28f50thunldwiaxdr', // Your client ID
        client_secret: 'kfvjmqgt2940bvmzj3ljpaz9v5d23e', // Your client secret
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
      'client-id': 'pgst6bpckqhgg28f50thunldwiaxdr',
      'Authorization': 'Bearer ' + oauthToken,
    };
    
    axios.get('https://api.twitch.tv/helix/users?login=xxbitforgexx', {headers: headers2 })
      .then(async (response: any) => {
        const broadcasterId = response.data.data[0].id;
        console.log("Broadcaster id: " + broadcasterId);
        
        // Creating poll
        const url = "https://api.twitch.tv/helix/polls";
        const data = {
          "broadcaster_id": broadcasterId, // Your broadcaster ID
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

        const oauthToken2 = await getOAuthToken();
        console.log('OAuth token:', oauthToken2);

        fetch(url, {
          method: 'POST',
          headers: {
            "Authorization": "Bearer " + oauthToken2,
            "Client-ID": "pgst6bpckqhgg28f50thunldwiaxdr", // Your client ID
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
  } else {
    console.log(`* Unknown command ${commandName}`);
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr: string, port: number) {
  console.log(`* Connected to ${addr}:${port}`);
}
