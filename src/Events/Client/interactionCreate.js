
const {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ChannelType
} = require('discord.js');

module.exports = {

  name: Events.InteractionCreate,

  async execute(interaction, client) {

    // ========================================
    // SLASH COMMANDS
    // ========================================

    if (interaction.isChatInputCommand()) {

      const command =
        client.commands.get(interaction.commandName);

      if (!command) return;

      try {

        await command.execute(interaction, client);

      } catch (error) {

        console.error(error);

        const errorMessage = {
          content:
            '❌ There was an error executing this command.',
          ephemeral: true
        };

        try {

          if (
            interaction.deferred ||
            interaction.replied
          ) {

            await interaction.editReply(errorMessage);

          } else {

            await interaction.reply(errorMessage);

          }

        } catch (err) {
          console.error(err);
        }
      }
    }

    // ========================================
    // BUTTONS
    // ========================================

    if (interaction.isButton()) {

      // ========================================
      // APPLY TICKET
      // ========================================

      if (interaction.customId === 'apply_ticket') {

        // ========================================
        // ROLE CHECK
        // ========================================

        const ALLOWED_ROLE_ID =
          '1503150238582444125';

        if (
          !interaction.member.roles.cache.has(
            ALLOWED_ROLE_ID
          )
        ) {

          return interaction.reply({
            content:
              '❌ Only Clan Mods or higher can create tickets.',
            ephemeral: true
          });

        }

        // ========================================
        // CHECK EXISTING
        // ========================================

        const existingChannel =
          interaction.guild.channels.cache.find(
            c =>
              c.name ===
              `application-${interaction.user.username.toLowerCase()}`
          );

        if (existingChannel) {

          return interaction.reply({
            content:
              '❌ You already have an open application!',
            ephemeral: true
          });

        }

        // ========================================
        // CREATE CHANNEL
        // ========================================

        const channel =
          await interaction.guild.channels.create({

            name:
              `application-${interaction.user.username.toLowerCase()}`,

            type:
              ChannelType.GuildText,

            parent:
              '1503643591728431164',

            permissionOverwrites: [

              // Everyone denied
              {
                id: interaction.guild.id,

                deny: [
                  PermissionsBitField.Flags.ViewChannel
                ]
              },

              // User
              {
                id: interaction.user.id,

                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.AttachFiles,
                  PermissionsBitField.Flags.ReadMessageHistory
                ]
              },

              // Clan Mod
              {
                id: ALLOWED_ROLE_ID,

                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ReadMessageHistory
                ]
              }

            ]

          });

        // ========================================
        // EMBED
        // ========================================

        const embed =
          new EmbedBuilder()

            .setColor(0xFFD700)

            .setTitle('📝 Clan Application')

            .setDescription(

`Welcome ${interaction.user}!

📋 **Requirements**
• 300K/s UI or higher

💥 **How to Apply**
Upload a screenshot of your GUI showing your gas/s.`

            )

            .setFooter({
              text:
                'Oil Empire • Clan Application'
            })

            .setTimestamp();

        // ========================================
        // BUTTONS
        // ========================================

        const row =
          new ActionRowBuilder()

            .addComponents(

              new ButtonBuilder()

                .setCustomId('close_ticket')

                .setLabel('Close Ticket')

                .setStyle(ButtonStyle.Danger)

            );

        // ========================================
        // SEND MESSAGE
        // ========================================

        await channel.send({

          content:
            `${interaction.user} <@&1503150238582444125>`,

          embeds: [embed],

          components: [row]

        });

        // ========================================
        // REPLY
        // ========================================

        await interaction.reply({

          content:
            `✅ Your application has been created: ${channel}`,

          ephemeral: true

        });

      }

      // ========================================
      // CLOSE TICKET
      // ========================================

      if (interaction.customId === 'close_ticket') {

        await interaction.reply({

          content:
            '🔒 Closing ticket in 5 seconds...'

        });

        setTimeout(() => {

          interaction.channel
            .delete()
            .catch(console.error);

        }, 5000);

      }

    }

  }

};

