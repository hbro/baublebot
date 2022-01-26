const { SlashCommandBuilder } = require('@discordjs/builders');
const { DateTime, Interval } = require("luxon");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nextfarm')
		.setDescription('Gives information about the next upcoming Bauble Farm events.'),
	async execute(interaction) {	

		// icon
		const iconEventDone = ':white_circle:';
		const iconEventActive = ':yellow_circle:';
		const iconEventTodo = ':purple_circle:';
		const wrapperEventDone = '~~';
		const wrapperEventActive = '**';
		const wrapperEventTodo = '';

		// set a few timestamps
		const bfMapRotationStartDateTimeMarker = DateTime.utc(2021,12,30,20,30,0);
		const now = DateTime.utc()

		// // set a few variables
		const hotMapRotationTotalDays = 21;
		const bfMapRotationDays = 7;

		// farm modulo
		const farmModulo = Interval.fromDateTimes(bfMapRotationStartDateTimeMarker,now).length('days')%hotMapRotationTotalDays;
		const isBfMapRotationActive = farmModulo<bfMapRotationDays;

		// determine next bauble farm map rotation
		const bfNextMapRotationStartDateTime = now.plus({ days: (hotMapRotationTotalDays-farmModulo) }).plus({ seconds: 1 }).set({ minutes: 0, seconds: 0, milliseconds: 0 });
		const bfNextMapRotationEndDateTime = bfNextMapRotationStartDateTime.plus({ days: bfMapRotationDays });

		// determine bauble farm map rotation to gather info about
		const bfMapRotationStartDateTime = isBfMapRotationActive ? bfNextMapRotationStartDateTime.minus({ days: hotMapRotationTotalDays }) : bfNextMapRotationStartDateTime;
		const bfMapRotationEndDateTime = bfMapRotationStartDateTime.plus({ days: bfMapRotationDays });

		// gather up all bauble farm events for that rotation
		var doneAllEvents = false;
		var bfEventStartDateTime = null;
		var bfEvents = []
		while (!doneAllEvents) {
			bfEventStartDateTime = bfEventStartDateTime == null ? bfMapRotationStartDateTime.plus({ minutes: 30 }) : bfEventStartDateTime.plus({ hours: 2 });
			const bfEventEndDateTime = bfEventStartDateTime.plus({ minutes: 75 });
			if (bfEventEndDateTime>bfMapRotationEndDateTime) {
				doneAllEvents = true;
			}
			else {
				bfEvents.push( Interval.fromDateTimes(bfEventStartDateTime,bfEventEndDateTime) );
			}
		}

		var bfEventsSortedByDate = new Map()
		bfEvents.forEach((bfEvent) => {
			const bfEventDate = bfEvent.start.toFormat('yyyy-MM-dd');
			var arr = bfEventsSortedByDate.get(bfEventDate);
			if (arr==null) {
				arr = [];
			}
			arr.push(bfEvent);
			bfEventsSortedByDate.set(bfEventDate,arr);
		});

		var chatMessage = '__Bauble Farm overview__:\n';
		bfEventsSortedByDate.forEach((bfEvents,bfEventDate) => {
			var chatLine = `**${bfEventDate}**`;
			bfEvents.forEach((bfEvent) => {
				//const icon = bfEvent.contains(now) ? iconEventActive : now<bfEvent.start ? iconEventTodo : iconEventDone;
				const wrapper = bfEvent.contains(now) ? wrapperEventActive : now<bfEvent.start ? wrapperEventTodo : wrapperEventDone;
				chatLine += ` | ${wrapper}${bfEvent.start.toFormat('HH:mm')}${wrapper}`;
			});
			//console.log(chatLine);
			chatMessage += `${chatLine}\n`;
		});
		chatMessage += '*All times are in UTC*'


		await interaction.reply(chatMessage);
	},
};