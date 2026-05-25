
const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');

const db =
  require('../../Handlers/databaseHandler');

module.exports = {

  data: new SlashCommandBuilder()

    .setName('profile')

    .setDescription(
      'View or manage your profile'
    )

    // ========================================
    // VIEW
    // ========================================

    .addSubcommand(subcommand =>

      subcommand

        .setName('view')

        .setDescription(
          'View your profile'
        )

        .addUserOption(option =>

          option

            .setName('user')

            .setDescription(
              'User to view'
            )

            .setRequired(false)

        )

    )

    // ========================================
    // SET
    // ========================================

    .addSubcommand(subcommand =>

      subcommand

        .setName('set')

        .setDescription(
          'Set your profile stats'
        )

        .addNumberOption(option =>

          option

            .setName('cash_boost')

            .setDescription(
              'Cash boost %'
            )

            .setMinValue(100)

            .setMaxValue(485)

        )

        .addNumberOption(option =>

          option

            .setName('offline_gas_boost')

            .setDescription(
              'Offline gas boost %'
            )

            .setMinValue(100)

            .setMaxValue(1300)

        )

        .addNumberOption(option =>

          option

            .setName('gas_per_second')

            .setDescription(
              'Gas per second'
            )

            .setMinValue(0)

        )

        .addNumberOption(option =>

          option

            .setName('energy_per_second')

            .setDescription(
              'Energy per second'
            )

            .setMinValue(0)

        )

    )

    // ========================================
    // RESET
    // ========================================

    .addSubcommand(subcommand =>

      subcommand

        .setName('reset')

        .setDescription(
          'Reset your profile'
        )

    ),

  // ========================================
  // EXECUTE
  // ========================================

  async execute(interaction) {

    const subcommand =
      interaction.options.getSubcommand();

    if (subcommand === 'view') {

      await viewProfile(interaction);

    }

    else if (subcommand === 'set') {

      await setProfile(interaction);

    }

    else if (subcommand === 'reset') {

      await resetProfile(interaction);

    }

  }

};

// ========================================
// VIEW PROFILE
// ========================================

async function viewProfile(interaction) {

  const targetUser =
    interaction.options.getUser('user')
    || interaction.user;

  const profile =
    await db.getProfile(targetUser.id);

  const embed =
    new EmbedBuilder()

      .setColor(0xFFD700)

      .setTitle(
        `${targetUser.username}'s Profile`
      )

      .setThumbnail(
        targetUser.displayAvatarURL()
      )

      .addFields(

        {
          name: '💰 Cash Boost',

          value:
            profile
              ? `\`${profile.cash_boost}%\``
              : '`Not set`',

          inline: true
        },

        {
          name: '⏸️ Offline Gas Boost',

          value:
            profile
              ? `\`${profile.offline_gas_boost}%\``
              : '`Not set`',

          inline: true
        },

        {
          name: '⛽ Gas/sec',

          value:
            profile
              ? `\`${Math.floor(profile.base_gas_per_second).toLocaleString()} gas/s\``
              : '`Not set`',

          inline: true
        },

        {
          name: '⚡ Energy/sec',

          value:
            profile
              ? `\`${Math.floor(profile.base_energy_per_second || 0).toLocaleString()} energy/s\``
              : '`Not set`',

          inline: true
        }

      )

      .setFooter({
        text:
          'Use /profile set to update stats'
      })

      .setTimestamp();

  await interaction.reply({
    embeds: [embed]
  });

}

// ========================================
// SET PROFILE
// ========================================

async function setProfile(interaction) {

  const cashBoost =
    interaction.options.getNumber('cash_boost');

  const offlineGasBoost =
    interaction.options.getNumber('offline_gas_boost');

  const gasPerSecond =
    interaction.options.getNumber('gas_per_second');

  const energyPerSecond =
    interaction.options.getNumber('energy_per_second');

  const updates = {};

  if (cashBoost !== null)
    updates.cash_boost = cashBoost;

  if (offlineGasBoost !== null)
    updates.offline_gas_boost = offlineGasBoost;

  if (gasPerSecond !== null)
    updates.base_gas_per_second = gasPerSecond;

  if (energyPerSecond !== null)
    updates.base_energy_per_second = energyPerSecond;

  await db.createOrUpdateProfile(

    interaction.user.id,

    interaction.user.username,

    updates

  );

  const embed =
    new EmbedBuilder()

      .setColor(0x00FF00)

      .setTitle(
        '✅ Profile Updated'
      )

      .setDescription(
        'Your stats have been saved!'
      )

      .addFields(

        {
          name: '💰 Cash Boost',

          value:
            cashBoost !== null
              ? `\`${cashBoost}%\``
              : '`Unchanged`',

          inline: true
        },

        {
          name: '⏸️ Offline Boost',

          value:
            offlineGasBoost !== null
              ? `\`${offlineGasBoost}%\``
              : '`Unchanged`',

          inline: true
        },

        {
          name: '⛽ Gas/sec',

          value:
            gasPerSecond !== null
              ? `\`${Math.floor(gasPerSecond).toLocaleString()} gas/s\``
              : '`Unchanged`',

          inline: true
        },

        {
          name: '⚡ Energy/sec',

          value:
            energyPerSecond !== null
              ? `\`${Math.floor(energyPerSecond).toLocaleString()} energy/s\``
              : '`Unchanged`',

          inline: true
        }

      )

      .setFooter({
        text:
          'Use /profile view to see stats'
      })

      .setTimestamp();

  await interaction.reply({
    embeds: [embed]
  });

}

// ========================================
// RESET PROFILE
// ========================================

async function resetProfile(interaction) {

  await db.createOrUpdateProfile(

    interaction.user.id,

    interaction.user.username,

    {

      cash_boost: 100,

      offline_gas_boost: 100,

      base_gas_per_second: 0,

      base_energy_per_second: 0

    }

  );

  const embed =
    new EmbedBuilder()

      .setColor(0xFFD700)

      .setTitle(
        '🔄 Profile Reset'
      )

      .setDescription(
        'Your profile has been reset.'
      )

      .addFields(

        {
          name: '💰 Cash Boost',
          value: '`100%`',
          inline: true
        },

        {
          name: '⏸️ Offline Boost',
          value: '`100%`',
          inline: true
        },

        {
          name: '⛽ Gas/sec',
          value: '`0 gas/s`',
          inline: true
        },

        {
          name: '⚡ Energy/sec',
          value: '`0 energy/s`',
          inline: true
        }

      )

      .setTimestamp();

  await interaction.reply({
    embeds: [embed]
  });

}

