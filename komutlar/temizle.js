const Discord = require("discord.js");

exports.run = function(client, message) {
  message.channel.bulkDelete(99);
  message.channel.send("**Mesajlar silindi.**").then(msg => {
    msg.delete(5000);
  });
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: "sil",
  description: "Belirtilen miktarda mesaj siler",
  usage: "sil <miktar>"
};
