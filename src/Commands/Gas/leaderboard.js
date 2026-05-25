
const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');

const db = require('../../Handlers/databaseHandler');

module.exports = {

  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View gas production leaderboard')

    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Leaderboard type')
        .setRequired(true)

        .addChoices(
          { name: 'Online Gas', value: 'online' },
          { name: 'Offline Gas', value: 'offline' }
        )
    ),

  async execute(interaction) {

    await interaction.deferReply();

    // =========================
    // TYPE
    // =========================

    const type =
      interaction.options.getString('type');

    // =========================
    // GET PROFILES
    // =========================

    const allProfiles =
      await db.getAllProfiles();

    const leaderboardData = [];

    // =========================
    // LOOP USERS
    // =========================

    for (const profile of allProfiles) {

      // ONLY USERS WITH PROFILE SET
      const gasPerSecond =
        profile.base_gas_per_second || 0;

      if (gasPerSecond <= 0)
        continue;

      const offlineBoost =
        profile.offline_gas_boost || 100;

      let score = 0;

      // =========================
      // ONLINE
      // =========================

      if (type === 'online') {

        score = gasPerSecond;

      }

      // =========================
      // OFFLINE
      // =========================

      else if (type === 'offline') {

        score =
          gasPerSecond *
          36 *
          (offlineBoost / 100);

      }

      leaderboardData.push({

        userId: profile.userId,

        username: profile.username,

        score: score,

        gasPerSecond: gasPerSecond,

        offlineBoost: offlineBoost

      });

    }

    // =========================
    // SORT
    // =========================

    leaderboardData.sort(
      (a, b) => b.score - a.score
    );

    const topUsers =
      leaderboardData.slice(0, 10);

    // =========================
    // NO DATA
    // =========================

    if (topUsers.length === 0) {

      const errorEmbed =
        new EmbedBuilder()

          .setColor(0xFF0000)

          .setTitle('❌ No Profiles Found')

          .setDescription(
            'No users have setup profiles yet.\nUse `/profile set` first.'
          )

          .setFooter({
            text: 'U.E.O | Leaderboard'
          })

          .setTimestamp();

      return interaction.editReply({
        embeds: [errorEmbed]
      });

    }

    // =========================
    // BUILD TEXT
    // =========================

    let leaderboardText = '';

    for (let i = 0; i < topUsers.length; i++) {

      const user = topUsers[i];

      let medal = '';

      if (i === 0)
        medal = '🥇';

      else if (i === 1)
        medal = '🥈';

      else if (i === 2)
        medal = '🥉';

      else
        medal = `\`${i + 1}.\``;

      let value = '';

      if (type === 'online') {

        value =
          `${formatNumber(user.score)} gas/s`;

      } else {

        value =
          `${formatNumber(user.score)} gas/hour`;

      }

      leaderboardText +=
        `${medal} **${user.username}**\n` +
        `↳ \`${value}\`\n\n`;

    }

    // =========================
    // TITLES
    // =========================

    let title = '';
    let footer = '';

    if (type === 'online') {

      title =
        '🏆 Online Gas Leaderboard';

      footer =
        'Ranked by base gas production';

    } else {

      title =
        '⏸️ Offline Gas Leaderboard';

      footer =
        'Gas/hour using offline boost';

    }

    // =========================
    // EMBED
    // =========================

    const embed =
      new EmbedBuilder()

        .setColor(0xFFD700)

        .setTitle(title)

        .setDescription(leaderboardText)

        .setFooter({
          text: footer
        })

        .setTimestamp();

    // =========================
    // SEND
    // =========================

    await interaction.editReply({
      embeds: [embed]
    });

  }
};

// ========================================
// FORMAT NUMBER
// ========================================

function formatNumber(num) {

  if (num >= 1e12)
    return (num / 1e12).toFixed(2) + 'T';

  if (num >= 1e9)
    return (num / 1e9).toFixed(2) + 'B';

  if (num >= 1e6)
    return (num / 1e6).toFixed(2) + 'M';

  if (num >= 1e3)
    return (num / 1e3).toFixed(2) + 'K';

  return num.toFixed(2);
}
