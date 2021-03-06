const Experience = require('./../structures/profile/Experience');
const Canvas = require('canvas');
const userStats = require('./../bot.js');
const path = require('path');
const request = require('request-promise');
const {
	promisifyAll
} = require('tsubaki');
const fs = promisifyAll(require('fs'));
const sql = require('sqlite');
sql.open('./score.sqlite');

exports.run = (client, message, args) => {

	let badges = JSON.parse(fs.readFileSync('./badges.json', 'utf8'));
	let slots = JSON.parse(fs.readFileSync('./slots.json', 'utf8'));
	
	args = args.toString();
	if (args == "") {
		args = message.author.id;
	} else {

		function getUserID(user) {
			var u = user;
			if (user.user != null) {
				u = user.user;
			}
			return u.id;
		}
		args = args.replace(",", " ").replace(",", " ").replace(",", " ").toString();

		if (!args.includes("<")) {
			var foundUsers = client.users.findAll("username", args);
			if (foundUsers.length == 0) {
				message.channel.send(':no_entry_sign: **ERROR:** Couldn\'t find anyone with that username. You might want to try again.');
				return;
			} else {
				for (let user of foundUsers) {
					args = getUserID(user);
				}
			}
		} else {
			args = args.replace("<", "").replace(">", "").replace("@", "").replace("!", "").replace(/[^0-9.]/g, "");
			console.log("Username not provided for arguments.");
		}
	}

	message.guild.fetchMember(args).then(function (member) {
		
	sql.get(`SELECT * FROM scores WHERE userId ='${member.id}'`).then(row => {
		async function drawStats() {
			var uSlot = slots[member.id];
			var uBadge = badges[member.id];
			message.delete ();

			//Fix error with late promise
			var totalExperience = `${row.experience}`;
			var totalExp = await Experience.getTotalExperience(member.id);
			const level = await Experience.getLevel(member.id);
			const levelBounds = await Experience.getLevelBounds(level);
			const currentExp = await Experience.getCurrentExperience(member.id);
			const fillValue = Math.min(Math.max(currentExp / (levelBounds.upperBound - levelBounds.lowerBound), 0), 1);
			
			if (!badges[member.id])
				badges[member.id] = {
					developer: 0,
					active: 0,
					moderator: 0,
					essaywriter: 0,
					subscriber: 0,
					streamer: 0,
					xbt: 0,
					friendship: 0
				};

			function fontFile(name) {
				return path.join(__dirname, '..', '/assets/', 'profile', 'fonts', name)
			}

			Canvas.registerFont(fontFile('UniSansHeavy.ttf'), {
				family: "Uni Sans CAPS"
			}) // eslint-disable-line max-len
			Canvas.registerFont(fontFile('Roboto.ttf'), {
				family: 'Roboto'
			}) // eslint-disable-line max-len
			const Image = Canvas.Image;

			var canvas = new Canvas(300, 300)
			var ctx = canvas.getContext('2d')
			const base = new Image();
			const cond = new Image();
			const subbadge = new Image();
			const devbadge = new Image();
			const activebadge = new Image();
			const modbadge = new Image();
			const essaywriterbadge = new Image();
			const streamerbadge = new Image();
			const xbtbadge = new Image();
			const friendshipbadge = new Image();
			const photographerbadge = new Image();

			const generate = () => {
				// Environment Variables
				ctx.globalAlpha = 1
					ctx.drawImage(base, 0, 0, 300, 300);
				ctx.scale(1, 1);
				ctx.patternQuality = 'billinear';
				ctx.filter = 'bilinear';
				ctx.antialias = 'subpixel';
				ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
				ctx.shadowOffsetY = 2;
				ctx.shadowBlur = 3;

				// Username
				ctx.font = '16px Roboto';
				ctx.fillStyle = member.displayHexColor;
				ctx.fillText(member.displayName, 75, 35);

				// Role
				ctx.font = '12px Roboto';
				ctx.fillStyle = member.displayHexColor;
				ctx.fillText(member.highestRole.name.toUpperCase(), 75, 50);
				
				//If XBT:
				if (badges[member.id].xbt == 1) {
				ctx.font = '12px Roboto';
				ctx.fillStyle = '#3498db';
				ctx.fillText("Xail Bot Testing", 205, 50);
				}

				// EXP TITLE
				ctx.font = '22px Uni Sans Heavy CAPS';
				ctx.textAlign = 'left';
				ctx.fillStyle = '#E5E5E5';
				ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
				ctx.fillText('EXP.', 74, 142);

				// EXP
				ctx.font = '16px Roboto';
				ctx.textAlign = 'left';
				ctx.fillStyle = '#d1d1d1';
				ctx.shadowColor = 'rgba(0, 0, 0, 0)';
				ctx.fillText(`${currentExp}/${levelBounds.upperBound - levelBounds.lowerBound}`, 74, 160);

				// EXP
				ctx.font = '10px Roboto';
				ctx.textAlign = 'center';
				ctx.fillStyle = '#3498DB';
				ctx.shadowColor = 'rgba(0, 0, 0, 0)';
				ctx.fillRect(30, 225, 17, fillValue * -135);
				
				// LVL
				ctx.font = '22px Uni Sans Heavy CAPS';
				ctx.textAlign = 'left';
				ctx.fillStyle = '#E5E5E5';
				ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
				ctx.fillText('LVL.', 74, 87);

				// LVL Number
				ctx.font = '19px Roboto';
				ctx.fillStyle = '#E5E5E5';
				ctx.fillText(`${level}`, 74, 107);

				// TOTAL EXP TITLE
				ctx.font = '22px Uni Sans Heavy CAPS';
				ctx.textAlign = 'left';
				ctx.fillStyle = '#E5E5E5';
				ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
				ctx.fillText('TOTAL EXP.', 74, 197);

				// TOTAL EXP
				ctx.font = '16px Roboto';
				ctx.textAlign = 'left';
				ctx.fillStyle = '#d1d1d1';
				if (totalExp == "Error.") {
					ctx.fillStyle = '#c1453a';
				}
				ctx.shadowColor = 'rgba(0, 0, 0, 0)';
				ctx.fillText(totalExperience, 74, 215);

				//BADGES
				// BADGE TITLE
				ctx.font = '15px Uni Sans Heavy CAPS';
				ctx.textAlign = 'left';
				ctx.fillStyle = '#E5E5E5';
				ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
				ctx.fillText('YOUR BADGES', 25, 255);
				// Badges are spaced out +40 X for each badge
				let slot1X = 25;
				let slot2X = 65;
				let slot3X = 105;
				let slot4X = 145;
				let slot5X = 185;
				let slot6X = 225;
				
				// If member is a subscriber
				if (uSlot.slot1 == "subscriber") {
					ctx.drawImage(subbadge, slot1X, 260, 25, 25);
				} else if (uSlot.slot2 == "subscriber") {
					ctx.drawImage(subbadge, slot2X, 260, 25, 25);
					} else if (uSlot.slot3 == "subscriber") {
						ctx.drawImage(subbadge, slot3X, 260, 25, 25);
						} else if (uSlot.slot4 == "subscriber") {
							ctx.drawImage(subbadge, slot4X, 260, 25, 25);
							} else if (uSlot.slot5 == "subscriber") {
								ctx.drawImage(subbadge, slot5X, 260, 25, 25);
								} else if (uSlot.slot6 == "subscriber") {
									ctx.drawImage(subbadge, slot6X, 260, 25, 25);
								}
								
				// If member is active
				if (uSlot.slot1 == "active") {
					ctx.drawImage(activebadge, slot1X, 260, 25, 25);
				} else if (uSlot.slot2 == "active") {
					ctx.drawImage(activebadge, slot2X, 260, 25, 25);
					} else if (uSlot.slot3 == "active") {
						ctx.drawImage(activebadge, slot3X, 260, 25, 25);
						} else if (uSlot.slot4 == "active") {
							ctx.drawImage(activebadge, slot4X, 260, 25, 25);
							} else if (uSlot.slot5 == "active") {
								ctx.drawImage(activebadge, slot5X, 260, 25, 25);
								} else if (uSlot.slot6 == "active") {
									ctx.drawImage(activebadge, slot6X, 260, 25, 25);
								}
								
				// If member is a mod
				if (uSlot.slot1 == "moderator") {
					ctx.drawImage(modbadge, slot1X, 260, 25, 25);
				} else if (uSlot.slot2 == "moderator") {
					ctx.drawImage(modbadge, slot2X, 260, 25, 25);
					} else if (uSlot.slot3 == "moderator") {
						ctx.drawImage(modbadge, slot3X, 260, 25, 25);
						} else if (uSlot.slot4 == "moderator") {
							ctx.drawImage(modbadge, slot4X, 260, 25, 25);
							} else if (uSlot.slot5 == "moderator") {
								ctx.drawImage(modbadge, slot5X, 260, 25, 25);
								} else if (uSlot.slot6 == "moderator") {
									ctx.drawImage(modbadge, slot6X, 260, 25, 25);
								}
								
				// If member is essaywriter
				if (uSlot.slot1 == "essaywriter") {
					ctx.drawImage(essaywriterbadge, slot1X, 260, 25, 25);
				} else if (uSlot.slot2 == "essaywriter") {
					ctx.drawImage(essaywriterbadge, slot2X, 260, 25, 25);
					} else if (uSlot.slot3 == "essaywriter") {
						ctx.drawImage(essaywriterbadge, slot3X, 260, 25, 25);
						} else if (uSlot.slot4 == "essaywriter") {
							ctx.drawImage(essaywriterbadge, slot4X, 260, 25, 25);
							} else if (uSlot.slot5 == "essaywriter") {
								ctx.drawImage(essaywriterbadge, slot5X, 260, 25, 25);
								} else if (uSlot.slot6 == "essaywriter") {
									ctx.drawImage(essaywriterbadge, slot6X, 260, 25, 25);
								}
								
				// If member is in XBT
				if (uSlot.slot1 == "xbt") {
					ctx.drawImage(xbtbadge, slot1X, 260, 25, 25);
				} else if (uSlot.slot2 == "xbt") {
					ctx.drawImage(xbtbadge, slot2X, 260, 25, 25);
					} else if (uSlot.slot3 == "xbt") {
						ctx.drawImage(xbtbadge, slot3X, 260, 25, 25);
						} else if (uSlot.slot4 == "xbt") {
							ctx.drawImage(xbtbadge, slot4X, 260, 25, 25);
							} else if (uSlot.slot5 == "xbt") {
								ctx.drawImage(xbtbadge, slot5X, 260, 25, 25);
								} else if (uSlot.slot6 == "xbt") {
									ctx.drawImage(xbtbadge, slot6X, 260, 25, 25);
								}
								
				// If member is FRIENDSHIP
				if (uSlot.slot1 == "friendship") {
					ctx.drawImage(friendshipbadge, slot1X, 260, 25, 25);
				} else if (uSlot.slot2 == "friendship") {
					ctx.drawImage(friendshipbadge, slot2X, 260, 25, 25);
					} else if (uSlot.slot3 == "friendship") {
						ctx.drawImage(friendshipbadge, slot3X, 260, 25, 25);
						} else if (uSlot.slot4 == "friendship") {
							ctx.drawImage(friendshipbadge, slot4X, 260, 25, 25);
							} else if (uSlot.slot5 == "friendship") {
								ctx.drawImage(friendshipbadge, slot5X, 260, 25, 25);
								} else if (uSlot.slot6 == "friendship") {
									ctx.drawImage(friendshipbadge, slot6X, 260, 25, 25);
								}
								
				// If member is a developer
				if (uSlot.slot1 == "developer") {
					ctx.drawImage(devbadge, slot1X, 260, 25, 25);
				} else if (uSlot.slot2 == "developer") {
					ctx.drawImage(devbadge, slot2X, 260, 25, 25);
					} else if (uSlot.slot3 == "developer") {
						ctx.drawImage(devbadge, slot3X, 260, 25, 25);
						} else if (uSlot.slot4 == "developer") {
							ctx.drawImage(devbadge, slot4X, 260, 25, 25);
							} else if (uSlot.slot5 == "developer") {
								ctx.drawImage(devbadge, slot5X, 260, 25, 25);
								} else if (uSlot.slot6 == "developer") {
									ctx.drawImage(devbadge, slot6X, 260, 25, 25);
								}
								
				// If member is a photographer
				if (uSlot.slot1 == "photographer") {
					ctx.drawImage(photographerbadge, slot1X, 260, 25, 25);
				} else if (uSlot.slot2 == "photographer") {
					ctx.drawImage(photographerbadge, slot2X, 260, 25, 25);
					} else if (uSlot.slot3 == "photographer") {
						ctx.drawImage(photographerbadge, slot3X, 260, 25, 25);
						} else if (uSlot.slot4 == "photographer") {
							ctx.drawImage(photographerbadge, slot4X, 260, 25, 25);
							} else if (uSlot.slot5 == "photographer") {
								ctx.drawImage(photographerbadge, slot5X, 260, 25, 25);
								} else if (uSlot.slot6 == "photographer") {
									ctx.drawImage(photographerbadge, slot6X, 260, 25, 25);
								}
				
				// Image
				ctx.globalAlpha = 1
				ctx.beginPath();
				ctx.arc(40, 40, 25, 0, 2 * Math.PI, true);
				ctx.closePath();
				ctx.clip();
				ctx.shadowBlur = 5;
				ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
				ctx.drawImage(cond, 15, 15, 50, 50); //org 15, 15, 50, 50
			};

			base.src = await fs.readFileAsync('./assets/profile/backgrounds/default.png');
			cond.src = await request({
					uri: member.user.avatarURL() ? member.user.avatarURL( {format: 'png'} ) : member.user.displayAvatarURL,
					encoding: null
				});
			subbadge.src = await fs.readFileAsync('./assets/profile/badges/subscriber.png');
			devbadge.src = await fs.readFileAsync('./assets/profile/badges/developer.png');
			modbadge.src = await fs.readFileAsync('./assets/profile/badges/moderator.png');
			activebadge.src = await fs.readFileAsync('./assets/profile/badges/active.png');
			essaywriterbadge.src = await fs.readFileAsync('./assets/profile/badges/essaywriter.png');
			streamerbadge.src = await fs.readFileAsync('./assets/profile/badges/streamer.png');
			xbtbadge.src = await fs.readFileAsync('./assets/profile/badges/xbt.png');
			friendshipbadge.src = await fs.readFileAsync('./assets/profile/badges/friendship.png');
			photographerbadge.src = await fs.readFileAsync('./assets/profile/badges/photographer.png');

			generate();

			return message.channel.send({
				files: [{
						attachment: canvas.toBuffer(),
						name: 'profile.png'
					}
				]
			});
		}

		drawStats();

	})
	})
}
