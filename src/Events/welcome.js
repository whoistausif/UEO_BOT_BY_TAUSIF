
const {
  EmbedBuilder,
  AttachmentBuilder
} = require('discord.js');

module.exports = {
  name: 'guildMemberAdd',

  async execute(member) {

    // =========================
    // CHANNEL IDS
    // =========================

    const WELCOME_CHANNEL_ID = '1503150238846947417';
    const RULES_CHANNEL_ID = '1503150238846947412';
    // const ROLES_CHANNEL_ID = 'PUT_ROLES_CHANNEL_ID';
    const NON_MEMBER_CHANNEL_ID = '1507409862907134093';

    // =========================
    // GET CHANNEL
    // =========================

    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);

    if (!channel) return;

    // =========================
    // BANNER IMAGE
    // =========================

    const banner = new AttachmentBuilder('./src/assets/ueo.png');

    // =========================
    // EMBED
    // =========================

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('👋 Welcome To UNITED EMPIRE\'S OF OIL')
      .setDescription(`
🎉 Heyo ${member} ❤️

Welcome to **U.E.O Clan Server**!

You are our **${member.guild.memberCount}th** member! ⚙️

━━━━━━━━━━━━━━━━━━

📜 Make sure to read <#${RULES_CHANNEL_ID}>

💬 See non member channel <#${NON_MEMBER_CHANNEL_ID}>

🔥 Here you go now you can have fun!

━━━━━━━━━━━━━━━━━━
      `)
      .setThumbnail(member.user.displayAvatarURL({
        dynamic: true
      }))
      .setImage('attachment://ueo.png')
      .setFooter({
        text: 'UNITED WE’RE STRONGER'
      })
      .setTimestamp();

    // =========================
    // SEND MESSAGE
    // =========================

    channel.send({
      content: `${member}`,
      embeds: [embed],
      files: [banner]
    });

  }
};
