const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

// Store wheel rewards
const wheels = new Map();

module.exports = {

  data: new SlashCommandBuilder()

    .setName('wheelcreate')

    .setDescription(
      'Create a custom wheel'
    )

    .addStringOption(option =>
      option
        .setName('reward1')
        .setDescription('Reward 1')
        .setRequired(true)
    )

    .addStringOption(option =>
      option
        .setName('reward2')
        .setDescription('Reward 2')
        .setRequired(true)
    )

    .addStringOption(option =>
      option
        .setName('reward3')
        .setDescription('Reward 3')
        .setRequired(true)
    )

    .addStringOption(option =>
      option
        .setName('reward4')
        .setDescription('Reward 4')
        .setRequired(false)
    )

    .addStringOption(option =>
      option
        .setName('reward5')
        .setDescription('Reward 5')
        .setRequired(false)
    ),

  async execute(interaction) {

    const rewards = [

      interaction.options.getString('reward1'),
      interaction.options.getString('reward2'),
      interaction.options.getString('reward3'),
      interaction.options.getString('reward4'),
      interaction.options.getString('reward5')

    ].filter(Boolean);

    // Save rewards
    wheels.set(interaction.guild.id, rewards);

    const embed =
      new EmbedBuilder()

        .setColor(0xFFD700)

        .setTitle(
          '🎡 Wheel of Fortune'
        )

        .setDescription(
          rewards.map(r => `• ${r}`).join('\n')
        )

        .setFooter({
          text:
            'Click the button below to spin'
        });

    const row =
      new ActionRowBuilder()

        .addComponents(

          new ButtonBuilder()

            .setCustomId('spin_custom_wheel')

            .setLabel('🎡 Spin')

            .setStyle(ButtonStyle.Success)

        );

    await interaction.reply({

      embeds: [embed],

      components: [row]

    });

  }

};

// Export wheels
module.exports.wheels = wheels;