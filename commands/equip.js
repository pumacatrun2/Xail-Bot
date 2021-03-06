const fs = require('fs');

exports.run = (client, message, args) => {
	
	message.delete();
	
var num = args[0];
var badge = args[1].toString();

let badgesA = JSON.parse(fs.readFileSync('./badges.json', 'utf8'));
let badgesP = JSON.parse(fs.readFileSync('./data/profile/profile-background.json', 'utf8'));
var badges = JSON.parse(fs.readFileSync('./slots.json', 'utf8'));

		// if the user has no badges, init to false.
		if (!badges[message.author.id])
			badges[message.author.id] = {
				slot1: "empty",
				slot2: "empty",
				slot3: "empty",
				slot4: "empty",
				slot5: "empty",
				slot6: "empty"
			};
			
		// if the user has no badges, init to false.
		if (!badgesP[message.author.id])
			badgesP[message.author.id] = {
				background: "default"
			};
			
		var userSlots = badges[message.author.id];
		var userBadges = badgesA[message.author.id];
		var userProfile = badgesP[message.author.id];

		if (num == "list") {
		message.reply(":white_check_mark: **OK:** These are the badges that you currently have: " + badgesA[message.author.id].toString());
		return;
		}

		if (num == 1 || num == 2 || num == 3 || num == 4 || num == 5 || num == 6) {
		if (eval(`userBadges.${badge} == 1`) == true) {
 		eval(`userSlots.slot${num} = "${badge}"`);
		message.reply(":white_check_mark: **OK:** You've successfully equipped the badge **" + badge + "** into slot **" + num + "**.");
		} else {
		message.reply(":no_entry_sign: **NOPE:** You can't equip this badge because you don't own it or it doesn't exist.");
		return;
		}
		}
							
		if (num == "background") {
		eval(`userProfile.background = "${badge}"`);
		fs.writeFile('./data/profile/profile-background.json', JSON.stringify(badgesP, null, 2), function(err) {
				if (err) {
					console.error(err)
				}
			});
			message.reply(":white_check_mark: **OK:** You've successfully equipped the background **" + badge + "**.");
		return;
		//message.reply(":no_entry_sign: **NOPE:** You can't equip this background because you don't own it or it doesn't exist.");
		}
		
			
		if (num == "all") {
			if (badge == "empty") {
			userSlots.slot1 = "empty";
			userSlots.slot2 = "empty";
			userSlots.slot3 = "empty";
			userSlots.slot4 = "empty";
			userSlots.slot5 = "empty";
			userSlots.slot6 = "empty";
			message.reply(":white_check_mark: **OK:** You've successfully unequipped **all** of your badges.");
			}
		} 
		
		if (badge == "empty") {
		message.reply(":white_check_mark: **OK:** You've successfully unequipped any badge in slot **" + num + "**.");
		}
		

		
		fs.writeFile('./slots.json', JSON.stringify(badges, null, 2), function(err) {
				if (err) {
					console.error(err)
				}
			});
}
