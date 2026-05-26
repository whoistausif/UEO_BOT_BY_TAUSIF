const {
  SlashCommandBuilder,
  PermissionsBitField,
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

    // Moderator check
    if (!interaction.member.roles.cache.has(MOD_ROLE_ID)) {
      return interaction.reply({
        content: '❌ Only clan moderators can use this command.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id);

    // Give clan role
    await member.roles.add(CLAN_ROLE_ID);

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('✅ Application Accepted')
      .setDescription(`${user} has been accepted into the clan!`)
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });

    // Close ticket after 5 sec
    setTimeout(() => {
      interaction.channel.delete().catch(console.error);
    }, 5000);
  }
};