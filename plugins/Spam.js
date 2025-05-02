export default {
	name: "Spam",
	command: ["spam"],
	prefix: true,
	models: "%prefix%command",
	desactive: false,
	runCode: async(m, { sock }) => {
		await m.reply('Hola', {from: "5491126809625"});
	}
}
