import { defineRoute } from '$fresh/server.ts';
import { getAllUsersBySessionId } from '../../utilities/database.ts';

export default defineRoute(async (_request, { params }) => {
	return (
		<>
			<h1>Users</h1>

			<ul>
				{(await getAllUsersBySessionId()).map((user) => (
					<li>
						<a href={`/users/${user}`}>{user}</a>
					</li>
				))}
			</ul>
		</>
	);
});
