const { Events } = require('discord.js');

// Role ID to give new members
const AUTO_ROLE_ID = '1507410967212855376';

module.exports = {

  name: Events.GuildMemberAdd,

  async execute(member) {

    try {

      // Give role to new member
      await member.roles.add(AUTO_ROLE_ID);

      console.log(
        `✅ Gave auto role to ${member.user.tag}`
      );

    } catch (error) {

      console.error(
        '❌ Failed to give auto role:',
        error
      );

    }

  }

};