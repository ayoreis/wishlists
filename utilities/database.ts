import { deleteSiteSession } from 'deno_kv_oauth/lib/_kv.ts';

type AtLeastOne<Type> = [Type, ...Type[]];

export interface User {
	username: string;
	session_id: string;
}

interface Item {
	name: string;
	// id?
	slug: string;
	lists: AtLeastOne<ListKey>;
}

interface List {
	user: User['username'];
	name: string;
	slug: string;
	items: Item['slug'][];
}

interface ListKey {
	// owner?
	username: User['username'];
	list_slug: List['slug'];
}

const USERS_KEY = 'users';
const USERS_BY_SESSION_ID_KEY = 'users_by_session_id';
const LISTS_KEY = 'lists';
const ITEMS_KEY = 'items';

export const kv = await Deno.openKv();

export async function userExists(username: User['username']) {
	const response = await kv.atomic()
		.check({ key: [USERS_KEY, username], versionstamp: null })
		.commit();

	return !response.ok;
}

export async function create_user({ username, session_id }: User) {
	const userKey = [USERS_KEY, username];
	const userBySessionKey = [USERS_BY_SESSION_ID_KEY, session_id];

	const response = await kv.atomic()
		.check({ key: userKey, versionstamp: null })
		.check({ key: userBySessionKey, versionstamp: null })
		.set(userKey, session_id)
		.set(userBySessionKey, username)
		.commit();

	if (!response.ok) throw new Error('Failed to create user');

	await create_list({
		user: username,
		name: 'Default',
		slug: 'default',
		items: [],
	});
}

export async function updateUserSessionId(
	username: User['username'],
	newSessionId: string,
) {
	const userKey = [USERS_KEY, username];
	const oldSessionId = (await kv.get<User['session_id']>(userKey)).value!;
	const oldUserBySessionIdKey = [USERS_BY_SESSION_ID_KEY, oldSessionId];
	const newUserBySessionIdKey = [USERS_BY_SESSION_ID_KEY, newSessionId];

	const response = await kv.atomic()
		.set(userKey, newSessionId)
		.delete(oldUserBySessionIdKey)
		.check({ key: newUserBySessionIdKey, versionstamp: null })
		.set(newUserBySessionIdKey, username)
		.commit();

	if (!response.ok) throw new Error('Failed to update user');

	deleteSiteSession(oldSessionId);
}

export async function getUsername(sessionId: User['session_id']) {
	const response = await kv.get<User['username']>([
		USERS_BY_SESSION_ID_KEY,
		sessionId,
	]);

	return response.value;
}

export async function getAllUsersBySessionId() {
	const result = [];

	for await (
		const { value } of kv.list<User['session_id']>({
			prefix: [USERS_BY_SESSION_ID_KEY],
		})
	) {
		result.push(value);
	}

	return result;
}

export async function create_list(list: List) {
	const key = [LISTS_KEY, list.user, list.slug];

	const { ok } = await kv.atomic()
		.check({ key, versionstamp: null })
		.set(key, list satisfies List)
		.commit();

	if (!ok) throw new Error('Failed to create list');
}

export async function create_item(item: Item) {
	const key = [ITEMS_KEY, item.slug];

	const { ok } = await kv.atomic()
		.check({ key, versionstamp: null })
		.set(key, item satisfies Item)
		.commit();

	if (!ok) throw new Error('Failed to create item');
}

export async function get_list(username: User['username'], slug: List['slug']) {
	return await kv.get<List>([LISTS_KEY, username, slug]);
}

export async function get_item(slug: Item['slug']) {
	return await kv.get<Item>([ITEMS_KEY, slug]);
}

export async function get_list_items(
	username: User['username'],
	slug: List['slug'],
) {
	const list = await get_list(username, slug);

	// TOOD database structure better for this, secondary indecies
	return Promise.all(
		list.value!.items.map(async (item_slug) =>
			(await get_item(item_slug)).value!
		),
	);
}

export async function add_item_to_list(
	username: User['username'],
	list_slug: List['slug'],
	item_slug: Item['slug'],
) {
	const { value } = await get_list(username, list_slug);

	value!.items.push(item_slug);

	await kv.set([LISTS_KEY, username, list_slug], value!);
}

// for await (const entry of kv.list({ prefix: [] })) {
// 	kv.delete(entry.key);
// }

// item slug? it going to conflic alot
// sugest copy if slug/title is same
// store in user/list

// TOOD more satesfies

// await create_list({
// 	user: 'ayoreis',
// 	name: 'Default',
// 	'slug': 'default',
// 	items: ['laptop'],
// });

// better key typing and naming (return await kv.get<Item>([ITEMS_KEY, slug]);)

// console.log(await Array.fromAsync(kv.list({ prefix: [] })));
