import type { Handlers } from '$fresh/server.ts';
import type { State } from '../../../../plugins/session.ts';

import { Status } from '$std/http/http_status.ts';
import {
	add_item_to_list,
	create_item,
} from '../../../../utilities/database.ts';

export const handler: Handlers<never, State> = {
	async POST(request, { state }) {
		// TODO
		if (state.user) {
			const form_data = await request.formData();
			const slug = form_data.get('slug');
			const name = form_data.get('name');

			// TODO zod, valibot
			// TOOD handle error case
			await create_item({
				slug: slug as string,
				name: name as string,
				lists: [{ username: state.user.username, list_slug: 'default' }],
			});

			await add_item_to_list(state.user.username, 'default', slug as string);
		}

		return Response.redirect(request.headers.get('referer')!, Status.SeeOther);
	},
};

// top-level nothing conflictiong (eg username)
// do you wan't to use list? how?

// users
// lists username name
// items
