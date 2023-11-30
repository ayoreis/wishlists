import type { State } from '../plugins/session.ts';

import { defineApp } from '$fresh/server.ts';

export default defineApp<State>((_request, { Component, state }) => {
	return (
		<html>
			<head>
				<meta charset='UTF-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1.0' />

				<title>Wishlists</title>

				<link rel='stylesheet' href='/styles.css' />
			</head>

			<body>
				<header>
					<nav>
						<ul>
							<li>
								<a href='/'>Wishgroups</a>
							</li>

							{state.user
								? (
									<li>
										<a href={`/users/${state.user.username}`}>
											{state.user.username} (<a href='/signout'>sign out</a>)
										</a>
									</li>
								)
								: (
									<li>
										<a href='/signin'>Sign in</a>
									</li>
								)}
						</ul>
					</nav>
				</header>

				<main>
					<Component />
				</main>

				<footer>
					<p>
						Made by <a href='https://ayoreis.com'>Ayo</a> with{' '}
						<a href='https://fresh.deno.dev'>Fresh</a>{' '}
						(<a href='https://github.com/ayoreis/wishlists'>source</a>)
					</p>
				</footer>
			</body>
		</html>
	);
});
