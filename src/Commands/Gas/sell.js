
const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');

const db = require('../../Handlers/databaseHandler');

module.exports = {

  data: new SlashCommandBuilder()
    .setName('sell')
    .setDescription('Calculate sell price using your profile boost')

    .addStringOption(option =>
      option
        .setName('gas')
        .setDescription('Gas amount (Example: 590B, 1.5T, 250M)')
        .setRequired(true)
    )

    .addIntegerOption(option =>
      option
        .setName('price')
        .setDescription('Price per gas unit ($1 - $15)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(15)
    ),

  async execute(interaction) {

    await interaction.deferReply();

    // =========================
    // GET INPUTS
    // =========================

    const gasInput = interaction.options.getString('gas');
    const price = interaction.options.getInteger('price');

    // =========================
    // GET USER PROFILE
    // =========================

    const profile = await db.getProfile(interaction.user.id);

    const boost = profile?.cash_boost || 100;

    // =========================
    // PARSE GAS
    // =========================

    const gas = parseNumber(gasInput);

    if (!gas) {

      return interaction.editReply({
        content: '❌ Invalid gas amount. Example: `590B`, `1.5T`, `250M`'
      });

    }

    // =========================
    // FORMULA
    // =========================

    // Base Price
    const basePrice = gas * price;

    // Boost Bonus
    const bonus = basePrice * ((boost - 100) / 100);

    // Final Total
    const finalTotal = basePrice + bonus;

    // =========================
    // EMBED
    // =========================

    const embed = new EmbedBuilder()

      .setColor(0xFFD700)

      .setTitle('💰 Sell Calculator')

      .addFields(

        {
          name: '⛽ Gas',
          value: `\`${formatNumber(gas)}\``,
          inline: true
        },

        {
          name: '💸 Price per Unit',
          value: `\`$${price}\``,
          inline: true
        },

        {
          name: '📊 Boost',
          value: `\`${boost}%\``,
          inline: true
        },

        {
          name: '💵 Base Price',
          value: `\`$${formatNumber(basePrice)}\``,
          inline: true
        },

        {
          name: '✨ Bonus',
          value: `\`+$${formatNumber(bonus)}\``,
          inline: true
        },

        {
          name: '🏆 Final Total',
          value: `\`$${formatNumber(finalTotal)}\``,
          inline: true
        }

      )

      .setFooter({
        text: 'U.E.O | Sell Price Calculator | Boost fetched from /profile'
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

  const match = input.match(/^([\d.]+)([KMBT])?$/);

  if (!match) return null;

  let number = parseFloat(match[1]);

  const suffix = match[2];

  if (suffix) {
    number *= multipliers[suffix];
  }

  return number;
}

// ========================================
// FORMAT NUMBER
// ========================================

function formatNumber(num) {

  if (num >= 1e12) {
    return (num / 1e12).toFixed(2) + 'T';
  }

  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B';
  }

  if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  }

  if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K';
  }

  return num.toFixed(2);
}

