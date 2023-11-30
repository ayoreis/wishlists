import type { State } from '../../plugins/session.ts';
import { defineRoute } from '$fresh/server.ts';
import AddItemForm from '../../islands/add-item-form.tsx';
import { get_list_items } from '../../utilities/database.ts';

export default defineRoute<State>(async (_request, { params, state }) => {
	return (
		<>
			<h1>{params.username}</h1>
			<h2>List</h2>

			{state.user && <AddItemForm></AddItemForm>}

			<ul>
				{(await get_list_items(params.username, 'default')).map((item) => (
					<li>{item.name}</li>
				))}
			</ul>
		</>
	);
});
