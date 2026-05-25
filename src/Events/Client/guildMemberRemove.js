
const { Events } = require('discord.js');

const db =
  require('../../Handlers/databaseHandler');

module.exports = {

  name: Events.GuildMemberRemove,

  async execute(member) {

    try {

      // ========================================
      // DELETE USER DATA
      // ========================================

      await db.deleteProfile(member.id);

      console.log(
        `🗑️ Deleted data for ${member.user.tag}`
      );

    } catch (error) {

      console.error(
        `❌ Failed to delete data for ${member.user.tag}`
      );

      console.error(error);

    }

  }

};

