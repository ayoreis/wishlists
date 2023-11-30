import type { Plugin } from '$fresh/server.ts';

import { getSessionId } from '../plugins/kv_oauth.ts';
import { getUsername, User } from '../utilities/database.ts';

export interface State {
	user: User | null;
}

export default {
	name: 'session',

	middlewares: [
		{
			path: '/',

			middleware: {
				async handler(
					request,
					{ state, destination, next },
				) {
					state.user = null;

					if (destination !== 'route' && destination !== 'notFound') {
						return await next();
					}

					const session_id = await getSessionId(request);

					if (typeof session_id === 'undefined') return await next();

					const username = await getUsername(session_id);

					if (username === null) return await next();

					state.user = {
						username,
						session_id,
					};

					return await next();
				},
			},
		},
	],
} satisfies Plugin<State>;
