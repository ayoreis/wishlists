import { Head } from '$fresh/runtime.ts';

const TITLE = '404 — page not found';

export default function () {
	return (
		<>
			<Head>
				<title>{TITLE}</title>
			</Head>

			<h1>{TITLE}</h1>

			<a href='/'>{'<'}- Back home</a>
		</>
	);
}
