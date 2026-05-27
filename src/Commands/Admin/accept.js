const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');

const MOD_ROLE_ID = '1503150238582444125';
const CLAN_ROLE_ID = '1503150238574186621';

module.exports = {

  data: new SlashCommandBuilder()

    .setName('accept')

    .setDescription('Accept a clan application')

    .addUserOption(option =>

      option
        .setName('user')
        .setDescription('User to accept')
        .setRequired(true)

    ),

  async execute(interaction) {

    // ========================================
    // MODERATOR CHECK
    // ========================================

    if (
      !interaction.member.roles.cache.has(
        MOD_ROLE_ID
      )
    ) {

      return interaction.reply({

        content:
          '❌ Only clan moderators can use this command.',

        ephemeral: true

      });

    }

    // ========================================
    // GET USER
    // ========================================

    const user =
      interaction.options.getUser('user');

    const member =
      await interaction.guild.members.fetch(
        user.id
      );

    // ========================================
    // GIVE CLAN ROLE
    // ========================================

    await member.roles.add(CLAN_ROLE_ID);

    // ========================================
    // EMBED
    // ========================================

    const embed =
      new EmbedBuilder()

        .setColor(0x00FF00)

        .setTitle(
          '✅ Application Accepted'
        )

        .setDescription(
          `${user} has been accepted into the clan!`
        )

        .setTimestamp();

    // ========================================
    // REPLY
    // ========================================

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