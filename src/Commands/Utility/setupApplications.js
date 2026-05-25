
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

module.exports = {

  data: new SlashCommandBuilder()

    .setName('setup-applications')

    .setDescription(
      'Setup the clan application panel'
    ),

  async execute(interaction) {

    // ========================================
    // ROLE CHECK
    // ========================================

    const CLAN_MOD_ROLE =
      '1503150238582444125';

    if (
      !interaction.member.roles.cache.has(
        CLAN_MOD_ROLE
      )
    ) {

      return interaction.reply({

        content:
          '❌ Only Clan Mods or higher can use this command.',

        ephemeral: true

      });

    }

    // ========================================
    // EMBED
    // ========================================

    const embed =
      new EmbedBuilder()

        .setColor(0xFFD700)

        .setTitle(
          '🏆 Oil Empire Clan Applications'
        )

        .setDescription(

`Click the button below to apply for the clan.

📋 **Requirements**
• 300K Gas/s UI or higher

📝 **Application Process**
• Click the button below
• Upload a screenshot showing your gas/s
• Clan moderators will review your application

⚠️ **Important**
• Only 100 members can join the clan
• Applications may take up to 24 hours

🎁 **Clan Perks**
• Oil distributions
• Helpful community
• Free private servers
• Giveaways
• Price bot
• Oil calculator
• Useful clan tools`

        )

        .setFooter({
          text:
            'Oil Empire • Clan Applications'
        })

        .setTimestamp();

    // ========================================
    // BUTTON
    // ========================================

    const row =
      new ActionRowBuilder()

        .addComponents(

          new ButtonBuilder()

            .setCustomId('apply_ticket')

            .setLabel('🏆 Apply Now')

            .setStyle(ButtonStyle.Success)

        );

    // ========================================
    // SEND PANEL
    // ========================================

    await interaction.reply({

      embeds: [embed],

      components: [row]

    });

  }

};

