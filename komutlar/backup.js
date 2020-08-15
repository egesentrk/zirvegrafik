const { RichEmbed, Client, Util, Message } = require("discord.js");
const fs = require("fs");
const hastebins = require("hastebin-gen"),
  db = require("quick.db");

var backups = JSON.parse(fs.readFileSync("./Data/backups.json", "utf8"));

module.exports.run = async (client, message, args) => {
  let kontrol = await db.fetch(`dil_${message.guild.id}`);
    let prefix = await db.fetch(`prefix_${message.guild.id}`) || "ig!"
  if (kontrol == "TR_tr") {
    try {
      let info = client.emojis.get("655091815401127966") || "??"; //https://cdn.discordapp.com/emojis/655091815401127966.png?v=1
      let waiting = client.emojis.get("655695570769412096") || "?"; //https://images-ext-1.discordapp.net/external/lWj3uW4qvfFB9t0QgGsDJ8vLvh5bSObQ-wwUxYFH4wo/https/images-ext-1.discordapp.net/external/AzWR8HxPJ4t4rPA1DagxJkZsOCOMp4OTgwxL3QAjF4U/https/cdn.discordapp.com/emojis/424900448663633920.gif
      let green = client.emojis.get("655696285286006784") || "?"; //https://images-ext-2.discordapp.net/external/NU9I3Vhi79KV6srTXLJuHxOgiyzmEwgS5nFAbA13_YQ/https/cdn0.iconfinder.com/data/icons/small-n-flat/24/678134-sign-check-512.png
      let error = client.emojis.get("655704809483141141") || "?"; //https://cdn.discordapp.com/emojis/655704809483141141.png?v=1
      let warning = client.emojis.get("656030540310380574") || "??"; //https://cdn.discordapp.com/emojis/656030540310380574.png?v=1

      let guildsonlyEmbed = new RichEmbed()
        .setTitle(`${error} Hata!`)
        .setDescription(
          `Bu komutu özel mesajlarda kullanamazsın.
            
            [Destek](https://discord.gg/WWhEu2f)`
        )
        .setColor("BLACK");
      if (message.channel.type === "dm")
        return message.channel.send(guildsonlyEmbed);
      if (args[0] === "al") {
        let creatingEmbed = new RichEmbed()
          .setTitle(`${waiting} Lütfen bekleyin...`)
          .setDescription("Yedek oluşturuluyor...");
        message.channel.send(creatingEmbed).then(m => {
          let id = makeid(16);

          const channels = message.guild.channels
            .sort(function(a, b) {
              return a.position - b.position;
            })
            .array()
            .map(c => {
              const channel = {
                type: c.type,
                name: c.name,
                postion: c.calculatedPosition
              };
              if (c.parent) channel.parent = c.parent.name;
              return channel;
            });

          const roles = message.guild.roles
            .filter(r => r.name !== "@everyone")
            .sort(function(a, b) {
              return a.position - b.position;
            })
            .array()
            .map(r => {
              const role = {
                name: r.name,
                color: r.color,
                hoist: r.hoist,
                permissions: r.permissions,
                mentionable: r.mentionable,
                position: r.position
              };
              return role;
            });

          if (!backups[message.author.id]) backups[message.author.id] = {};
          backups[message.author.id][id] = {
            icon: message.guild.iconURL,
            name: message.guild.name,
            owner: message.guild.ownerID,
            members: message.guild.memberCount,
            createdAt: message.guild.createdAt,
            roles,
            channels
          };

          save();
          let result = new RichEmbed()
            .setTitle(`${info}  Info`)
            .setDescription(
              `Bir yedek oluşturuldu! **${message.guild.name}** sunucusunun yedek idsi \`${id}\``
            )
            .addField(
              "Kullanım",
              `\`\`\`ig!yedek yükle ${id}\`\`\`
\`\`\`ig!yedek bilgi ${id}\`\`\``
            )
            .setColor("BLACK");

          message.author.send(result);

          let resultPublic = new RichEmbed()
            .setTitle(`${green} Başarılı!`)
            .setDescription(
              `Bir yedek oluşturuldu! **${message.guild.name}** sunucusunun yedek idsi \`${id}\``
            )
            .addField(
              "Kullanım",
              `\`\`\`ig!yedek yükle ${id}\`\`\`
\`\`\`ig!yedek bilgi ${id}\`\`\``
            )
            .setColor("BLACK");

          m.edit(resultPublic);
        });
      }

      if (args[0] === "sil") {
        let code = args[1];
        let errorEmbed = new RichEmbed()
          .setTitle(`${error} Hata!`)
          .setDescription(
            `Böyle bir id bulunamadı!
[Destek](https://discord.gg/WWhEu2f)`
          )
          .setColor("BLACK");
        if (!code) return message.channel.send(errorEmbed);

        let cantfindbackup = new RichEmbed()
          .setTitle(`${error} Hata!`)
          .setTitle(`Böyle bir ${code} sunucu yedeği yok.`)
          .setDescription(
            `
[Destek](https://discord.gg/WWhEu2f)`
          )
          .setColor("BLACK");
        if (!backups[message.author.id][code])
          return message.channel.send(cantfindbackup);

        delete backups[message.author.id][code];
        save();

        let deletedsuc = new RichEmbed()
          .setTitle(`${green} Başarılı!`)
          .setDescription(`Başarılı **sunucu yedeği silindi**.`)
          .setColor("BLACK");
        message.channel.send(deletedsuc);
      }

      if (args[0] === "yükle") {
        let error = client.emojis.get("655704809483141141") || "?";
        let code = args[1];
        let errorEmbed = new RichEmbed().setTitle(`${error} Hata`)
          .setDescription(`Lütfen bir sunucu yedek **id**'si giriniz.
[Destek](https://discord.gg/WWhEu2f)`);
        if (!code) return message.channel.send(errorEmbed);
        let cantfindbackup = new RichEmbed()
          .setTitle(`${error}  Error`)
          .setTitle(`Böyle bir ${code} id yok!`)
          .setDescription("[Destek](https://discord.gg/WWhEu2f)")
          .setColor("BLACK");
        if (!backups[message.author.id][code])
          return message.channel.send(cantfindbackup);

        message.guild.channels.forEach(channel => {
          channel.delete("Yedek yükleniyor!");
        });

        message.guild.roles
          .filter(role => role.members.every(member => !member.user.bot))
          .forEach(role => {
            role.delete("Yedek yükleniyor!");
          });
        await backups[message.author.id][code].roles.forEach(async function(
          role
        ) {
          message.guild
            .createRole({
              name: role.name,
              color: role.color,
              permissions: role.permissions,
              hoist: role.hoist,
              mentionable: role.mentionable,
              position: role.position
            })
            .then(role => {
              role.setPosition(role.position);
            });
        });

        await backups[message.author.id][code].channels
          .filter(c => c.type === "category")
          .forEach(async function(ch) {
            message.guild.createChannel(
              ch.name,
              ch.type,
              ch.permissionOverwrites
            );
          });

        await backups[message.author.id][code].channels
          .filter(c => c.type !== "category")
          .forEach(async function(ch) {
            message.guild
              .createChannel(ch.name, ch.type, ch.permissionOverwrites)
              .then(c => {
                const parent = message.guild.channels
                  .filter(c => c.type === "category")
                  .find(c => c.name === ch.parent);
                ch.parent ? c.setParent(parent) : "";
              });
          });
        message.guild.setName(backups[message.author.id][code].name);
        message.guild.setIcon(backups[message.author.id][code].icon);
      }

      if (args[0] === "bilgi") {
        let id = args[1];
        let MissingbackupinfoEmbed = new RichEmbed()
          .setTitle(`${error} Hata`)
          .setDescription(
            `Lütfen bir yedeklenen sunucunun yedek **id**'si giriniz.   
                    [Destek](https://discord.gg/WWhEu2f)`
          )
          .setColor("BLACK");
        if (!id) return message.channel.send(MissingbackupinfoEmbed);

        let cantfindEmbed = new RichEmbed()
          .setTitle(`${error} Hata!`)
          .setDescription(
            `Bu **id**'ye sahip bir yedeğin yok!'\`${id}\`.
                "[Destek](https://discord.gg/WWhEu2f)`
          )
          .setColor("BLACK");
        if (!backups[message.author.id][id])
          return message.channel.send(cantfindEmbed);

        try {
          let infoEmbed = new RichEmbed()
            .setTitle(backups[message.author.id][id].name)
            .setThumbnail(backups[message.author.id][id].icon)
            .addField(
              "Oluşturan",
              `<@${backups[message.author.id][id].owner}>`,
              true
            )
            .addField(
              "Kullanıcılar",
              backups[message.author.id][id].members,
              true
            )
            .addField(
              "Oluşturulma Tarihi",
              backups[message.author.id][id].createdAt
            )
            .addField(
              "Kanallar",
              `\`\`\`${backups[message.author.id][id].channels
                .map(channel => channel.name)
                .join("\n")}\`\`\``,
              true
            )
            .addField(
              "Roller",
              `\`\`\`${backups[message.author.id][id].roles
                .map(role => role.name)
                .join("\n")}\`\`\``,
              true
            );
          message.channel.send(infoEmbed);
        } catch (e) {
          hastebins(
            backups[message.author.id][id].channels
              .map(channel => channel.name)
              .join("\n"),
            "txt"
          ).then(ch => {
            hastebins(
              backups[message.author.id][id].roles
                .map(role => role.name)
                .join("\n"),
              "txt"
            ).then(ro => {
              let infoEmbed = new RichEmbed()
                .setTitle(backups[message.author.id][id].name)
                .setThumbnail(backups[message.author.id][id].icon)
                .addField(
                  "Oluşturan",
                  `<@${backups[message.author.id][id].owner}>`,
                  true
                )
                .addField(
                  "Kullanıcılar",
                  backups[message.author.id][id].members,
                  true
                )
                .addField(
                  "Oluşturulma Tarihi",
                  backups[message.author.id][id].createdAt
                )
                .addField("Kanallar", ch, true)
                .addField("Roller", ro, true);
              message.channel.send(infoEmbed);
            });
          });
        }
      }

      if (args[0] === "temizle") {
        let errorEmbed = new RichEmbed()
          .setTitle(`${error}  Error`)
          .setDescription(
            `Ne yazık ki yedekte hiç sunucun yok.
[Destek](https://discord.gg/WWhEu2f)`
          )
          .setColor("BLACK");
        if (!backups[message.author.id])
          return message.channel.send(errorEmbed);

        let warningEmbed = new RichEmbed().setTitle(`${warning} UYARI`)
          .setDescription(`Tüm yedeklerini silmeye emin misin?
___Bu işlem geri alınamaz!__`);
        message.channel.sendEmbed(warningEmbed).then(msg => {
          msg.react("👍").then(() => msg.react("👎"));

          
          let yesFilter = (reaction, user) =>
            reaction.emoji.name === "👍" && user.id === message.author.id;
          let noFilter = (reaction, user) =>
            reaction.emoji.name === "👎" && user.id === message.author.id;

          let yes = msg.createReactionCollector(yesFilter, { time: 0 });
          let no = msg.createReactionCollector(noFilter, { time: 0 });

          yes.on("collect", r => {
            delete backups[message.author.id];

            let deletedsuc = new RichEmbed()
              .setTitle(`${green} Başarılı!`)
              .setDescription(`Tüm yedekler silindi!`)
              .setColor("BLACK");
            message.channel.send(deletedsuc);
            msg.delete();
          });

          no.on("collect", r => {
            msg.delete();
          });
        });
      }

      if (!args[0]) {
        const embed = new RichEmbed()
          .setTitle(
            `**ig!yedek**

Sunucunun yedeğini al ve yükle

__**Komutlar**__
`
          )
          .setDescription(
            `
                ${prefix}yedek al             Sunucunuzu yedek alırsınız.
                ${prefix}yedek sil            Sunucu yedeğinizi silersiniz.
                ${prefix}yedek bilgi          Sunucu yedeğiniz hakkında bilgi alırsınız.
                ${prefix}yedek yükle          Sunucu yedeğinizi yüklersiniz.
                ${prefix}yedek temizle        Tüm yedeklerinizi silersiniz.
`
          )
          .addBlankField()
          .setColor("BLACK");
        message.channel.send(embed);
        return;
      }

      function makeid(length) {
        var result = "";
        var characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
          result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
          );
        }
        return result;
      }

      function save() {
        fs.writeFile("./Data/backups.json", JSON.stringify(backups), err => {
          if (err) message.channel.send("Bir hata var!");
        });
      }
    } catch (e) {
      throw e;
    }
  } else {
    try {
      let info = client.emojis.get("655091815401127966") || "??"; //https://cdn.discordapp.com/emojis/655091815401127966.png?v=1
      let waiting = client.emojis.get("655695570769412096") || "?"; //https://images-ext-1.discordapp.net/external/lWj3uW4qvfFB9t0QgGsDJ8vLvh5bSObQ-wwUxYFH4wo/https/images-ext-1.discordapp.net/external/AzWR8HxPJ4t4rPA1DagxJkZsOCOMp4OTgwxL3QAjF4U/https/cdn.discordapp.com/emojis/424900448663633920.gif
      let green = client.emojis.get("655696285286006784") || "?"; //https://images-ext-2.discordapp.net/external/NU9I3Vhi79KV6srTXLJuHxOgiyzmEwgS5nFAbA13_YQ/https/cdn0.iconfinder.com/data/icons/small-n-flat/24/678134-sign-check-512.png
      let error = client.emojis.get("655704809483141141") || "?"; //https://cdn.discordapp.com/emojis/655704809483141141.png?v=1
      let warning = client.emojis.get("656030540310380574") || "??"; //https://cdn.discordapp.com/emojis/656030540310380574.png?v=1

      let guildsonlyEmbed = new RichEmbed()
        .setTitle(`${error} Error`)
        .setDescription(
          `This command **can't be used** in **private** messages
            
            [Support](https://discord.gg/WWhEu2f)`
        )
        .setColor("BLACK");
      if (message.channel.type === "dm")
        return message.channel.send(guildsonlyEmbed);
      if (args[0] === "create") {
        let creatingEmbed = new RichEmbed()
          .setTitle(`${waiting}  Please wait ...`)
          .setDescription("Creating backup ...");
        message.channel.send(creatingEmbed).then(m => {
          let id = makeid(16);

          const channels = message.guild.channels
            .sort(function(a, b) {
              return a.position - b.position;
            })
            .array()
            .map(c => {
              const channel = {
                type: c.type,
                name: c.name,
                postion: c.calculatedPosition
              };
              if (c.parent) channel.parent = c.parent.name;
              return channel;
            });

          const roles = message.guild.roles
            .filter(r => r.name !== "@everyone")
            .sort(function(a, b) {
              return a.position - b.position;
            })
            .array()
            .map(r => {
              const role = {
                name: r.name,
                color: r.color,
                hoist: r.hoist,
                permissions: r.permissions,
                mentionable: r.mentionable,
                position: r.position
              };
              return role;
            });

          if (!backups[message.author.id]) backups[message.author.id] = {};
          backups[message.author.id][id] = {
            icon: message.guild.iconURL,
            name: message.guild.name,
            owner: message.guild.ownerID,
            members: message.guild.memberCount,
            createdAt: message.guild.createdAt,
            roles,
            channels
          };

          save();
          let result = new RichEmbed()
            .setTitle(`${info}  Info`)
            .setDescription(
              `Created backup of **${message.guild.name}** with the backup id \`${id}\``
            )
            .addField(
              "Usage",
              `\`\`\`ig!backup load ${id}\`\`\`
\`\`\`ig!backup info ${id}\`\`\``
            )
            .setColor("BLACK");

          message.author.send(result);

          let resultPublic = new RichEmbed()
            .setTitle(`${green}  Voila!`)
            .setDescription(
              `Created backup of **${message.guild.name}** with the backup id \`${id}\``
            )
            .addField(
              "Usage",
              `\`\`\`ig!backup load ${id}\`\`\`
\`\`\`ig!backup info ${id}\`\`\``
            )
            .setColor("BLACK");

          m.edit(resultPublic);
        });
      }

      if (args[0] === "delete") {
        let code = args[1];
        let errorEmbed = new RichEmbed()
          .setTitle(`${error}  Error`)
          .setDescription(
            `You forgot to define the argument backup id. Use ig!help backup load for more information.
[Support](https://discord.gg/WWhEu2f)`
          )
          .setColor("BLACK");
        if (!code) return message.channel.send(errorEmbed);

        let cantfindbackup = new RichEmbed()
          .setTitle(`${error}  Error`)
          .setTitle(`You have no backup with the id ${code}.`)
          .setDescription(
            `
[Support](https://discord.gg/WWhEu2f)`
          )
          .setColor("BLACK");
        if (!backups[message.author.id][code])
          return message.channel.send(cantfindbackup);

        delete backups[message.author.id][code];
        save();

        let deletedsuc = new RichEmbed()
          .setTitle(`${green}  Voila!`)
          .setDescription(`Successfully **deleted backup**.`)
          .setColor("BLACK");
        message.channel.send(deletedsuc);
      }

      if (args[0] === "load") {
        let error = client.emojis.get("655704809483141141") || "?";
        let code = args[1];
        let errorEmbed = new RichEmbed().setTitle(`${error}  Error`)
          .setDescription(`You forgot to define the argument backup_id. Use ig!help backup load for more information.
[Support](https://discord.gg/WWhEu2f)`);
        if (!code) return message.channel.send(errorEmbed);
        let cantfindbackup = new RichEmbed()
          .setTitle(`${error}  Error`)
          .setTitle(`You have no backup with the id ${code}.`)
          .setDescription("[Support](https://discord.gg/WWhEu2f)")
          .setColor("BLACK");
        if (!backups[message.author.id][code])
          return message.channel.send(cantfindbackup);

        message.guild.channels.forEach(channel => {
          channel.delete("For Loading A Backup");
        });

        message.guild.roles
          .filter(role => role.members.every(member => !member.user.bot))
          .forEach(role => {
            role.delete("For Loading A Backup");
          });
        await backups[message.author.id][code].roles.forEach(async function(
          role
        ) {
          message.guild
            .createRole({
              name: role.name,
              color: role.color,
              permissions: role.permissions,
              hoist: role.hoist,
              mentionable: role.mentionable,
              position: role.position
            })
            .then(role => {
              role.setPosition(role.position);
            });
        });

        await backups[message.author.id][code].channels
          .filter(c => c.type === "category")
          .forEach(async function(ch) {
            message.guild.createChannel(
              ch.name,
              ch.type,
              ch.permissionOverwrites
            );
          });

        await backups[message.author.id][code].channels
          .filter(c => c.type !== "category")
          .forEach(async function(ch) {
            message.guild
              .createChannel(ch.name, ch.type, ch.permissionOverwrites)
              .then(c => {
                const parent = message.guild.channels
                  .filter(c => c.type === "category")
                  .find(c => c.name === ch.parent);
                ch.parent ? c.setParent(parent) : "";
              });
          });
        message.guild.setName(backups[message.author.id][code].name);
        message.guild.setIcon(backups[message.author.id][code].icon);
      }

      if (args[0] === "info") {
        let id = args[1];
        let MissingbackupinfoEmbed = new RichEmbed()
          .setTitle(`${error}  Error`)
          .setDescription(
            `You forgot to define the argument **backup_id**. Use \`ig!help backup info\` for more information   
                    [Support](https://discord.gg/WWhEu2f)`
          )
          .setColor("BLACK");
        if (!id) return message.channel.send(MissingbackupinfoEmbed);

        let cantfindEmbed = new RichEmbed()
          .setTitle(`${error}  Error`)
          .setDescription(
            `You have **no backup** with the id \`${id}\`.
                "[Support](https://discord.gg/WWhEu2f)`
          )
          .setColor("BLACK");
        if (!backups[message.author.id][id])
          return message.channel.send(cantfindEmbed);

        try {
          let infoEmbed = new RichEmbed()
            .setTitle(backups[message.author.id][id].name)
            .setThumbnail(backups[message.author.id][id].icon)
            .addField(
              "Creator",
              `<@${backups[message.author.id][id].owner}>`,
              true
            )
            .addField("Members", backups[message.author.id][id].members, true)
            .addField("Created At", backups[message.author.id][id].createdAt)
            .addField(
              "Channels",
              `\`\`\`${backups[message.author.id][id].channels
                .map(channel => channel.name)
                .join("\n")}\`\`\``,
              true
            )
            .addField(
              "Roles",
              `\`\`\`${backups[message.author.id][id].roles
                .map(role => role.name)
                .join("\n")}\`\`\``,
              true
            );
          message.channel.send(infoEmbed);
        } catch (e) {
          hastebins(
            backups[message.author.id][id].channels
              .map(channel => channel.name)
              .join("\n"),
            "txt"
          ).then(ch => {
            hastebins(
              backups[message.author.id][id].roles
                .map(role => role.name)
                .join("\n"),
              "txt"
            ).then(ro => {
              let infoEmbed = new RichEmbed()
                .setTitle(backups[message.author.id][id].name)
                .setThumbnail(backups[message.author.id][id].icon)
                .addField(
                  "Creator",
                  `<@${backups[message.author.id][id].owner}>`,
                  true
                )
                .addField(
                  "Members",
                  backups[message.author.id][id].members,
                  true
                )
                .addField(
                  "Created At",
                  backups[message.author.id][id].createdAt
                )
                .addField("Channels", ch, true)
                .addField("Roles", ro, true);
              message.channel.send(infoEmbed);
            });
          });
        }
      }

      if (args[0] === "purge") {
        let errorEmbed = new RichEmbed()
          .setTitle(`${error}  Error`)
          .setDescription(
            `You did'nt backup any server yet
[Support](https://discord.gg/WWhEu2f)`
          )
          .setColor("BLACK");
        if (!backups[message.author.id])
          return message.channel.send(errorEmbed);

        let warningEmbed = new RichEmbed().setTitle(`${warning}  Warning`)
          .setDescription(`Are you sure that you want to delete all your backups?
__This cannot be undone!__`);
        message.channel.sendEmbed(warningEmbed).then(msg => {
          msg.react("👍").then(() => msg.react("👎"));

          let yesFilter = (reaction, user) =>
            reaction.emoji.name === "👍" && user.id === message.author.id;
          let noFilter = (reaction, user) =>
            reaction.emoji.name === "👎" && user.id === message.author.id;

          let yes = msg.createReactionCollector(yesFilter, { time: 0 });
          let no = msg.createReactionCollector(noFilter, { time: 0 });

          yes.on("👍", r => {
            delete backups[message.author.id];

            let deletedsuc = new RichEmbed()
              .setTitle(`${green} Başarılı!`)
              .setDescription(`Tüm yedekler silindi!`)
              .setColor("BLACK");
            message.channel.send(deletedsuc);
            msg.delete();
          });

          no.on("👎", r => {
            msg.delete();
          });
        });
      }

      if (!args[0]) {
        const embed = new RichEmbed()
          .setTitle(
            `**ig!backup**

Create & load backups of your servers

__**Commands**__
`
          )
          .setDescription(
            `
                ${prefix}backup create        Create a backup
                ${prefix}backup delete        Delete one of your backups
                ${prefix}backup info          Get information about a backup
                ${prefix}backup load          Load a backup
                ${prefix}backup purge         Delete all your backups`
          )
          .addBlankField()
          .setColor("BLACK");
        message.channel.send(embed);
        return;
      }

      function makeid(length) {
        var result = "";
        var characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
          result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
          );
        }
        return result;
      }

      function save() {
        fs.writeFile("./Data/backups.json", JSON.stringify(backups), err => {
          if (err) message.channel.send("I think there was a problem!");
        });
      }
    } catch (e) {
      throw e;
    }
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["yedek"],
  permLevel: 3
};

exports.help = {
  name: "backup",
  description: "backup",
  usage: "backup"
};
