const {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ChannelType
} = require('discord.js');

const {
  wheels
} = require('../../Commands/wheelcreate');

module.exports = {

  name: Events.InteractionCreate,

  async execute(interaction, client) {

    // ========================================
    // SLASH COMMANDS
    // ========================================

    if (interaction.isChatInputCommand()) {

      const command =
        client.commands.get(interaction.commandName);

      if (!command) {

        console.error(
          `No command matching ${interaction.commandName}`
        );

        return;
      }

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

      return;
    }

    // ========================================
    // BUTTONS
    // ========================================

    if (interaction.isButton()) {

      // ========================================
      // SPIN CUSTOM WHEEL
      // ========================================

      if (interaction.customId === 'spin_custom_wheel') {

        const rewards =
          wheels.get(interaction.guild.id);

        if (!rewards) {

          return interaction.reply({

            content:
              '❌ No wheel found.',

            ephemeral: true

          });

        }

        const reward =
          rewards[
            Math.floor(
              Math.random() * rewards.length
            )
          ];

        const embed =
          new EmbedBuilder()

            .setColor(0xFFD700)

            .setTitle(
              '🎡 Wheel Result'
            )

            .setDescription(
              `${interaction.user} won:\n\n🎁 **${reward}**`
            )

            .setTimestamp();

        await interaction.reply({

          embeds: [embed]

        });

      }

      // ========================================
      // APPLY BUTTON
      // ========================================

      if (interaction.customId === 'apply_ticket') {

        // ========================================
        // CLAN MOD ROLE ID
        // ========================================

        const ALLOWED_ROLE_ID =
          '1503150238582444125';

        // ========================================
        // CHECK EXISTING TICKET
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

              // Everyone allowed
              {
                id: interaction.guild.id,

                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ReadMessageHistory
                ]
              },

              // Ticket Creator
              {
                id: interaction.user.id,

                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.AttachFiles,
                  PermissionsBitField.Flags.ReadMessageHistory
                ]
              },

              // Clan Mod Role
              {
                id: ALLOWED_ROLE_ID,

                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ReadMessageHistory,
                  PermissionsBitField.Flags.ManageMessages
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

            .setTitle(
              '📝 Clan Application'
            )

            .setDescription(

`Welcome ${interaction.user}!

📋 **Requirements**
• 300K/s UI or higher

💥 **How to Apply**
Upload a screenshot showing your gas/s.

👥 Everyone can interact in this ticket.

⏳ Please wait for Clan Mods to review your application.`

            )

            .setFooter({
              text:
                'Oil Empire • Clan Application'
            })

            .setTimestamp();

        // ========================================
        // CLOSE BUTTON
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