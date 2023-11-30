interface User {
	login: string;
}

export async function getUser(accessToken: string): Promise<User> {
	const response = await fetch('https://api.github.com/user', {
		headers: { authorization: `Bearer ${accessToken}` },
	});

	return await response.json();
}
