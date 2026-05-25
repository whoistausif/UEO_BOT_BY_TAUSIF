
const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');

const db =
  require('../../Handlers/databaseHandler');

module.exports = {

  data: new SlashCommandBuilder()

    .setName('time')

    .setDescription(
      'Calculate time to reach a goal'
    )

    .addStringOption(option =>

      option

        .setName('type')

        .setDescription('Goal type')

        .setRequired(true)

        .addChoices(

          { name: 'Gas', value: 'gas' },

          { name: 'Cash', value: 'cash' },

          { name: 'Energy', value: 'energy' }

        )

    )

    .addStringOption(option =>

      option

        .setName('goal')

        .setDescription(
          'Example: 100K, 1M, 1B'
        )

        .setRequired(true)

    )

    .addStringOption(option =>

      option

        .setName('status')

        .setDescription(
          'Online or offline'
        )

        .setRequired(true)

        .addChoices(

          { name: 'Online', value: 'online' },

          { name: 'Offline', value: 'offline' }

        )

    )

    .addUserOption(option =>

      option

        .setName('user')

        .setDescription(
          'User to check'
        )

        .setRequired(false)

    ),

  async execute(interaction) {

    await interaction.deferReply();

    // ========================================
    // OPTIONS
    // ========================================

    const type =
      interaction.options.getString('type');

    const goalInput =
      interaction.options.getString('goal');

    const status =
      interaction.options.getString('status');

    const targetUser =
      interaction.options.getUser('user')
      || interaction.user;

    // ========================================
    // PROFILE
    // ========================================

    const profile =
      await db.getProfile(targetUser.id);

    const gasPerSecond =
      profile?.base_gas_per_second || 0;

    const energyPerSecond =
      profile?.base_energy_per_second || 0;

    const cashBoost =
      profile?.cash_boost || 100;

    const offlineBoost =
      profile?.offline_gas_boost || 100;

    // ========================================
    // PARSE GOAL
    // ========================================

    const goalAmount =
      parseNumber(goalInput);

    if (goalAmount === null) {

      return interaction.editReply({

        content:
          '❌ Invalid goal format.\nExamples:\n`100K`\n`1M`\n`1B`\n`1T`'

      });

    }

    // ========================================
    // ENERGY CHECK
    // ========================================

    if (
      type === 'energy' &&
      status === 'offline'
    ) {

      return interaction.editReply({

        content:
          '❌ Energy only supports online production.'

      });

    }

    // ========================================
    // CHECK PROFILE
    // ========================================

    if (
      type === 'energy' &&
      energyPerSecond <= 0
    ) {

      return interaction.editReply({

        content:
          `❌ ${targetUser.username} has not setup energy production yet.\nUse \`/profile set energy_per_second:<amount>\``

      });

    }

    if (
      (type === 'gas' || type === 'cash')
      && gasPerSecond <= 0
    ) {

      return interaction.editReply({

        content:
          `❌ ${targetUser.username} has not setup gas production yet.\nUse \`/profile set gas_per_second:<amount>\``

      });

    }

    // ========================================
    // PRODUCTION RATE
    // ========================================

    let productionRate = 0;

    let boostUsed = 0;

    let rateDescription = '';

    // ========================================
    // ENERGY
    // ========================================

    if (type === 'energy') {

      productionRate =
        energyPerSecond;

      boostUsed =
        100;

      rateDescription =
        `${formatNumber(energyPerSecond)} energy/s`;

    }

    // ========================================
    // ONLINE
    // ========================================

    else if (status === 'online') {

      productionRate =
        gasPerSecond;

      boostUsed =
        cashBoost;

      rateDescription =
        `${formatNumber(gasPerSecond)} gas/s`;

    }

    // ========================================
    // OFFLINE
    // ========================================

    else {

      const baseOfflinePerHour =
        gasPerSecond * 36;

      const boostedOfflinePerHour =
        baseOfflinePerHour *
        (offlineBoost / 100);

      productionRate =
        boostedOfflinePerHour / 3600;

      boostUsed =
        offlineBoost;

      rateDescription =
        `${formatNumber(boostedOfflinePerHour)} gas/hour`;

    }

    // ========================================
    // TIME CALCULATION
    // ========================================

    let secondsNeeded = 0;

    let targetDescription = '';

    // ========================================
    // GAS
    // ========================================

    if (type === 'gas') {

      secondsNeeded =
        goalAmount / productionRate;

      targetDescription =
        `${formatNumber(goalAmount)} gas`;

    }

    // ========================================
    // CASH
    // ========================================

    else if (type === 'cash') {

      const sellPrice = 15;

      const cashPerSecond =
        productionRate *
        sellPrice *
        (cashBoost / 100);

      secondsNeeded =
        goalAmount / cashPerSecond;

      targetDescription =
        `$${formatNumber(goalAmount)}`;

    }

    // ========================================
    // ENERGY
    // ========================================

    else {

      secondsNeeded =
        goalAmount / productionRate;

      targetDescription =
        `${formatNumber(goalAmount)} energy`;

    }

    // ========================================
    // EMBED
    // ========================================

    const embed =
      new EmbedBuilder()

        .setColor(0xFFD700)

        .setTitle(
          '⏱️ Time Calculator'
        )

        .setDescription(
          `${targetUser.username}'s estimated time to reach the goal`
        )

        .addFields(

          {
            name: '🎯 Goal',

            value:
              `\`${targetDescription}\``,

            inline: true
          },

          {
            name: '📊 Status',

            value:
              `\`${status}\``,

            inline: true
          },

          {
            name: '📈 Boost Used',

            value:
              `\`${boostUsed}%\``,

            inline: true
          },

          {
            name: '⚡ Production',

            value:
              `\`${rateDescription}\``,

            inline: true
          },

          {
            name: '⏱️ Time Needed',

            value:
              `\`${formatTime(secondsNeeded)}\``,

            inline: false
          }

        )

        .setFooter({
          text:
            'U.E.O | Time Calculator'
        })

        .setTimestamp();

    // ========================================
    // SEND
    // ========================================

    await interaction.editReply({
      embeds: [embed]
    });

  }

};

// ========================================
// PARSE NUMBER
// ========================================

function parseNumber(input) {

  input =
    input.toUpperCase().replace(/,/g, '');

  const multipliers = {

    K: 1e3,

    M: 1e6,

    B: 1e9,

    T: 1e12

  };

  const match =
    input.match(/^([\d.]+)([KMBT])?$/);

  if (!match)
    return null;

  let number =
    parseFloat(match[1]);

  const suffix =
    match[2];

  if (suffix)
    number *= multipliers[suffix];

  return number;

}

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

// ========================================
// FORMAT TIME
// ========================================

function formatTime(seconds) {

  const years =
    Math.floor(seconds / 31536000);

  seconds %= 31536000;

  const days =
    Math.floor(seconds / 86400);

  seconds %= 86400;

  const hours =
    Math.floor(seconds / 3600);

  seconds %= 3600;

  const minutes =
    Math.floor(seconds / 60);

  const secs =
    Math.floor(seconds % 60);

  const parts = [];

  if (years > 0)
    parts.push(`${years}y`);

  if (days > 0)
    parts.push(`${days}d`);

  if (hours > 0)
    parts.push(`${hours}h`);

  if (minutes > 0)
    parts.push(`${minutes}m`);

  if (secs > 0 || parts.length === 0)
    parts.push(`${secs}s`);

  return parts.join(' ');

}

