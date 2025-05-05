import { msg } from "../lib/simple.js"
import { removeAcents } from "../lib/functions.js"

const prefix = '-'
const owner = ['5491121931040']

import { exec } from "child_process"

export async function upsert(sock, m, plugins) {
	try {
		m = await msg(sock, m)

		const isCmd = m.body.startsWith(prefix)
		const command = isCmd ? removeAcents(m.body.slice(1).toLowerCase().trim().split(/ +/).filter((c) => c)[0]) : ""

		const args = m.body.trim().split(/ +/).slice(1)
		const text = args.join(" ")
		const senderNumber = m.sender.split("@")[0]
		const botNumber = sock.decodeJid(sock.user.id)

		const isMe = botNumber.includes(senderNumber)
		const isOwner = isMe || owner.includes(senderNumber)

		/* Cmd console */
		isCmd ? console.log('> Comando ' + command + ' ejecutado por ' + (isOwner ? 'Owner' : senderNumber)) : false

		if (m.body.startsWith('>')) {
			if (!isOwner) return
			exec(m.body.slice(2), (err, stdout, stderr) => {
				if (err) return m.reply(`Error: ${err.message}`)
				if (stderr) return m.reply(`stderr: ${stderr}`)
				if (stdout) return m.reply(stdout)
			})
		}
		
		for (let name in plugins) {
			let plugin = plugins[name]

			if (!plugin || plugin.desactive) continue

			let _arguments = {
				sock,
				v: m.isQuoted ? m.quoted : m,
				plugins,
				plugin,
				name
			}

			let isCommand = isCmd && plugin.prefix ? plugin.command.includes(command) : false

			if (plugin.runCode && typeof plugin.runCode === "function" && isCommand) {
				try {
					await plugin.runCode.call(this, m, _arguments);
				} catch(e) {
					console.log(`Error en el plugin ${name}: `, e);
				}
			}
		}

	} catch(e) {
		console.log("Error en messages.upsert: ", e);
	}
}
