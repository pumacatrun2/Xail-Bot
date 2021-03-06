const sql = require('sqlite');
sql.open('./score.sqlite');

exports.run = (client, message, args) => {	
	leaderboard();
	async function leaderboard() {
		var limit = args;
		
		if (limit.isNaN || limit == 0 || limit == "" || limit == "NaN") {
			var limit = 5;
		}
		
		if (limit > 10) {
		message.reply(":no_entry_sign: **NOPE:** You can't display more than 10 people at a time.");
		return;
		}
		
		var tosend = [];
		//SQL query in variable.
		var test = await sql.all(`SELECT userId, experience FROM scores ORDER BY experience DESC LIMIT ${limit}`);
		//Loop through all users in query and push them to an array.
		for (let i = 0; i < limit; i++) {
			message.guild.fetchMember(test[i].userId).then(function (member) {
				//Don't count Blake or Xail Bot Testing.
				if (member.id !== "246574843460321291" || member.id !== "300551512873238538") {
				tosend.push("**" + member.displayName + "**  ■  *" + test[i].experience + " experience*\n");
				}
			})
		}
		//Send array.
		await console.log();
		
		message.channel.send({embed: {
		title: "ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ » ",
		color: 3191350,
		author: {icon_url: message.author.displayAvatarURL},
		description: ":star2: Listing the top **" + limit + "** users with the most experience.",
		fields: [
		{
		  name: '**Leaderboard**',
		  value: tosend
		}
		],
		timestamp: new Date()
		}});
	}
}
