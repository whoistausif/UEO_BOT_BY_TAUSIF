const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');

const MOD_ROLE_ID = '1503150238582444125';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deny')
    .setDescription('Deny a clan application')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to deny')
        .setRequired(true)
    ),

  async execute(interaction) {

    // Moderator check
    if (!interaction.member.roles.cache.has(MOD_ROLE_ID)) {
      return interaction.reply({
        content: '❌ Only clan moderators can use this command.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('user');

    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('❌ Application Denied')
      .setDescription(`${user}'s application has been denied.`)
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });


    // ========================================
    // DELETE ONLY APPLICATION TICKETS
    // ========================================

    if (
      interaction.channel.name.startsWith(
        'application-'
      )
    ) {

      setTimeout(() => {

        interaction.channel
          .delete()
          .catch(console.error);

      }, 5000);

    }

  }

};