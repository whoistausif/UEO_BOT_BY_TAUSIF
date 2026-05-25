
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../Handlers/databaseHandler');

const drills = [
  { name: 'Strong Drill', oilPerSec: 3, cost: 1800 },
  { name: 'Enhanced Drill', oilPerSec: 4, cost: 3600 },
  { name: 'Speed Drill', oilPerSec: 6, cost: 7200 },
  { name: 'Reinforced Drill', oilPerSec: 8, cost: 12000 },
  { name: 'Industrial Drill', oilPerSec: 10, cost: 20000 },
  { name: 'Double Industrial Drill', oilPerSec: 12, cost: 30000 },
  { name: 'Turbo Drill', oilPerSec: 16, cost: 80000 },
  { name: 'Mega Drill', oilPerSec: 20, cost: 140000 },
  { name: 'Mega Emerald Drill', oilPerSec: 25, cost: 400000 },
  { name: 'Hell Drill', oilPerSec: 35, cost: 1225000 },
  { name: 'Plasma Drill', oilPerSec: 50, cost: 4500000 },
  { name: 'Huge Long Drill', oilPerSec: 220, cost: 40000000 },
  { name: 'Mega Plasma Drill', oilPerSec: 275, cost: 95000000 },
  { name: 'Multi Drill', oilPerSec: 350, cost: 280000000 },
  { name: 'Lava Drill', oilPerSec: 600, cost: 900000000 },
  { name: 'Ice Plasma Drill', oilPerSec: 800, cost: 2400000000 },
  { name: 'Crystal Drill', oilPerSec: 1500, cost: 9000000000 },
  { name: 'Diamond Drill', oilPerSec: 2750, cost: 27500000000 },
  { name: 'Ruby Drill', oilPerSec: 4500, cost: 85500000000 },
  { name: 'Fusion Drill', oilPerSec: 7500, cost: 187500000000 },
  { name: 'Uranium Drill', oilPerSec: 12500, cost: 437500000000 },
  { name: 'Radium Drill', oilPerSec: 18000, cost: 810000000000 },
  { name: 'Palladium Drill', oilPerSec: 25000, cost: 1200000000000 },
  { name: 'Thorium Drill', oilPerSec: 37500, cost: 2100000000000 },
  { name: 'Barium Drill', oilPerSec: 60000, cost: 3600000000000 }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('drillafford')
    .setDescription('Calculate how long until you can afford a drill')

    .addStringOption(option =>
      option
        .setName('drill')
        .setDescription('Select drill')
        .setRequired(true)

        .addChoices(
          ...drills.map(drill => ({
            name: drill.name,
            value: drill.name
          }))
        )
    )

    .addStringOption(option =>
      option
        .setName('cash')
        .setDescription('Your current cash')
        .setRequired(true)
    )

    .addIntegerOption(option =>
      option
        .setName('price')
        .setDescription('Gas price ($1 - $15)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(15)
    )

    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('How many drills')
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction) {

    await interaction.deferReply();

    // =========================
    // OPTIONS
    // =========================

    const drillName =
      interaction.options.getString('drill');

    const cashInput =
      interaction.options.getString('cash');

    const price =
      interaction.options.getInteger('price');

    const amount =
      interaction.options.getInteger('amount');

    // =========================
    // PROFILE
    // =========================

    const profile =
      await db.getProfile(interaction.user.id);

    const boost =
      profile?.cash_boost || 100;

    const gasPerSecond =
      profile?.base_gas_per_second || 0;

    // =========================
    // CHECK GAS
    // =========================

    if (gasPerSecond <= 0) {

      return interaction.editReply({
        content:
          '❌ Set your gas first using `/profile set gas_per_second:<amount>`'
      });

    }

    // =========================
    // FIND DRILL
    // =========================

    const drill =
      drills.find(d => d.name === drillName);

    if (!drill) {

      return interaction.editReply({
        content: '❌ Drill not found.'
      });

    }

    // =========================
    // PARSE CASH
    // =========================

    const cash =
      parseNumber(cashInput);

    if (cash === null) {

      return interaction.editReply({
        content:
          '❌ Invalid cash format. Example: `100K`, `1M`, `1B`, `1T`'
      });

    }

    // =========================
    // CALCULATIONS
    // =========================

    const totalCost =
      drill.cost * amount;

    const remainingCash =
      totalCost - cash;

    // Already affordable
    if (remainingCash <= 0) {

      const affordEmbed =
        new EmbedBuilder()

          .setColor(0x00FF00)

          .setTitle(`✅ ${drill.name}`)

          .setDescription(
            'You can already afford this purchase!'
          )

          .addFields(

            {
              name: '💰 Total Cost',
              value: `\`$${formatNumber(totalCost)}\``,
              inline: true
            },

            {
              name: '💵 Your Cash',
              value: `\`$${formatNumber(cash)}\``,
              inline: true
            },

            {
              name: '📈 Gas/s Added',
              value:
                `\`+${formatNumber(drill.oilPerSec * amount)} gas/s\``,
              inline: true
            }

          )

          .setFooter({
            text: 'U.E.O | Drill Afford Calculator'
          })

          .setTimestamp();

      return interaction.editReply({
        embeds: [affordEmbed]
      });

    }

    // =========================
    // FORMULA
    // =========================

    const multiplier =
      1 + ((boost - 100) / 100);

    const incomePerSecond =
      gasPerSecond * price * multiplier;

    const secondsNeeded =
      remainingCash / incomePerSecond;

    const gasNeeded =
      remainingCash / price;

    // =========================
    // EMBED
    // =========================

    const embed =
      new EmbedBuilder()

        .setColor(0xFFD700)

        .setTitle(`🛢️ ${drill.name} x${amount}`)

        .setDescription(
          'Time until you can afford this purchase'
        )

        .addFields(

          {
            name: '💰 Total Cost',
            value: `\`$${formatNumber(totalCost)}\``,
            inline: true
          },

          {
            name: '💵 Your Cash',
            value: `\`$${formatNumber(cash)}\``,
            inline: true
          },

          {
            name: '📉 Cash Needed',
            value: `\`$${formatNumber(remainingCash)}\``,
            inline: true
          },

          {
            name: '⛽ Gas Needed',
            value: `\`${formatNumber(gasNeeded)} gas\``,
            inline: true
          },

          {
            name: '⚡ Your Gas/s',
            value: `\`${formatNumber(gasPerSecond)} gas/s\``,
            inline: true
          },

          {
            name: '💰 Gas Price',
            value: `\`$${price}\``,
            inline: true
          },

          {
            name: '📊 Cash Boost',
            value: `\`${boost}%\``,
            inline: true
          },

          {
            name: '💵 Income/s',
            value: `\`$${formatNumber(incomePerSecond)}/s\``,
            inline: true
          },

          {
            name: '⏱️ Time Needed',
            value: `\`${formatTime(secondsNeeded)}\``,
            inline: true
          },

          {
            name: '⚙️ Per Drill',
            value:
              `\`${formatNumber(drill.oilPerSec)} gas/s | $${formatNumber(drill.cost)}\``,
            inline: false
          },

          {
            name: '📈 Total Gas/s Added',
            value:
              `\`+${formatNumber(drill.oilPerSec * amount)} gas/s\``,
            inline: true
          }

        )

        .setFooter({
          text: 'U.E.O | Drill Afford Calculator'
        })

        .setTimestamp();

    await interaction.editReply({
      embeds: [embed]
    });

  }
};

// ========================================
// PARSE NUMBER
// ========================================

function parseNumber(input) {

  input = input.toUpperCase().replace(/,/g, '');

  const multipliers = {
    K: 1e3,
    M: 1e6,
    B: 1e9,
    T: 1e12
  };

  const match =
    input.match(/^([\d.]+)([KMBT])?$/);

  if (!match) return null;

  let number =
    parseFloat(match[1]);

  const suffix =
    match[2];

  if (suffix) {
    number *= multipliers[suffix];
  }

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

