import { Message as DiscordMessage } from 'discord.js';
import { Result } from './parseMessage';

export const parseEmbed = async (
  result: Result,
  message: DiscordMessage,
): Promise<any> => {
  const {
    discordId,
    accountName,
    characterName,
    poeProfile,
    charactersCount,
    characters80to94,
    characters95to100,
    blacklist,
  } = result;

  const discordTag = discordId ? `<@${discordId}>` : `<@${message.author.id}>`;

  let fields = [
    {
      "name": "Discord ID",
      "value": discordTag,
      "inline": true
    },
    {
      "name": "Account Name",
      "value": `\`${accountName}\``,
      "inline": true
    },
    {
      "name": "Character Name",
      "value": `\`${characterName}\``,
      "inline": true
    },
    {
      "name": "Current Guild",
      "value": `\`${poeProfile.guild}\``,
      "inline": true
    },
    {
      "name": "Joined",
      "value": poeProfile.joined,
      "inline": true
    },
    {
      "name": "Achievements",
      "value": poeProfile.achievement,
      "inline": true
    },
    {
      "name": "Total Characters",
      "value": charactersCount,
      "inline": true
    },
    {
      "name": "Level 80-94",
      "value": characters80to94,
      "inline": true
    },
    {
      "name": "Level 95-100",
      "value": characters95to100,
      "inline": true
    }
  ];

  if (!blacklist) {
    fields = fields.concat({
      "name": "TFT Blacklist",
      "value": "No",
      "inline": true
    });
  } else {
    fields = fields.concat({
      "name": "TFT Blacklist",
      "value": "**YES**",
      "inline": true
    }, {
      "name": "Blacklisted On",
      "value": blacklist.blacklisted_on,
      "inline": true
    }, {
      "name": "Reason",
      "value": blacklist.reason,
      "inline": true
    });
  }

  return {
    // "channel_id": "123456",
    "content": "",
    "tts": false,
    "embeds": [
      {
        "type": "rich",
        "title": "POE Profile",
        "description": "",
        "color": 0x0077DD,
        fields,
        "url": "https://www.pathofexile.com/account/view-profile/Fareekshow"
      }
    ],
    /*
    "components": [
      {
        "type": 1,
        "components": [
          {
            "custom_id": "row_0_select_0",
            "placeholder": "verdict (not implemented yet)",
            "options": [
              {
                "label": "Accept",
                "value": "accept",
                "emoji": {
                  "id": null,
                  "name": "✅"
                },
                "default": false
              },
              {
                "label": "Reject",
                "value": "reject",
                "emoji": {
                  "id": null,
                  "name": "❌"
                },
                "default": false
              }
            ],
            "min_values": 1,
            "max_values": 1,
            "type": 3
          }
        ]
      }
    ],
    */
  };

};
