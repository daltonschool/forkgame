import preact from 'preact'

class FullStats extends preact.Component {
	render(props, state) {
		const rankings = props.stats.map((person, index) =>
			<tr>
				<td scope="row">{index + 1}</td>
				<td>{person.dead && <i class="fa fa-times" aria-hidden="true"></i>} {person.nickname ? person.nickname : person.firstname} {person.lastname}</td>
				<td>{person.kills}</td>
				<td>{person.dead && <span>{person.killer.dead && <i class="fa fa-times" aria-hidden="true"></i>} {person.killer.nickname ? person.killer.nickname : person.killer.firstname} {person.killer.lastname}</span>}</td>
			</tr>
		);

		return <div>
			<h1>Rankings</h1>
			<table class="table">
				<thead class="thead-dark">
					<tr>
						<th scope="col">#</th>
						<th scope="col">Name</th>
						<th scope="col">Kills</th>
						<th scope="col">Killed by</th>
					</tr>
				</thead>
				<tbody>
					{rankings}
				</tbody>
			</table>
		</div>
	}
}

export default FullStats