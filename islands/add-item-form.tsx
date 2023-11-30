export default function () {
	return (
		// TODO
		<form method='POST' action='/api/lists/items/add'>
			<label>
				Item name <input type='text' required name='name' />
			</label>

			<label>
				Item slug
				<input type='text' required name='slug' autoCapitalize='none' />
			</label>

			<button>Add item</button>
		</form>
	);
}
