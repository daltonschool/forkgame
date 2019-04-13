module.exports = {
	GET: async function (endpoint) {
		const response = await fetch("/api/" + endpoint)
		return await response.json()
	},
	POST: async function (endpoint, body) {
		let formBody = ""
		for (key in body) {
			formBody += encodeURIComponent(key) + "=" + encodeURIComponent(body[key]) + "&";
		}
		const response = await fetch("/api/" + endpoint, {
			method: "POST",
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: formBody
		})
		return await response.json()
	}
}