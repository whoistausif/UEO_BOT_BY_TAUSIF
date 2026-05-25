const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute: async (client) => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    
    client.user.setPresence({
      activities: [{ 
        name: 'U.E.O Official Bot', 
        type: 0 
      }],
      status: 'idle',
    });
    
    console.log(`✅ Bot is ready in ${client.guilds.cache.size} servers`);
  }
};