import type { Plugin } from '$fresh/server.ts';

import { createGitHubOAuthConfig, createHelpers } from 'deno_kv_oauth';

import { getUser as getGithubUser } from '../utilities/github.ts';
import {
	create_user,
	updateUserSessionId,
	userExists,
} from '../utilities/database.ts';

export const { signIn, handleCallback, signOut, getSessionId } = createHelpers(
	createGitHubOAuthConfig(),
);

export default {
	name: 'kv-oauth',

	routes: [
		{
			path: '/signin',

			async handler(request) {
				return await signIn(request);
			},
		},

		{
			path: '/callback',

			async handler(request) {
				const { response, sessionId, tokens } = await handleCallback(request);

				// TODO renew
				// TODO username changed
				// TODO multiple devices
				const { login: username } = await getGithubUser(tokens.accessToken);

				if (!await userExists(username)) {
					await create_user({
						username,
						session_id: sessionId,
					});
				} else {
					await updateUserSessionId(username, sessionId);
				}

				return response;
			},
		},

		{
			path: '/signout',

			async handler(request) {
				return await signOut(request);
			},
		},
	],
} satisfies Plugin;
