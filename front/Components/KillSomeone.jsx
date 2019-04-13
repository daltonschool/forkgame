import preact from 'preact'
import api from '../api.js'

import './KillSomeone.styl'

class KillSomeone extends preact.Component {
	constructor(props) {
		super(props)
		this.state = {
			name: "",
			searchResults: []
		}
	}

	updateName(event) {
		this.setState({
			name: event.target.value
		})
		this.search(event.target.value)
	}

	async search(query) {
		let results = await api.POST("findSomeoneToKill", { query: query })
		if (!Array.isArray(results)) {
			this.setState({ seachResults: [] })
			return
		}
		console.log(results)
		this.setState({
			searchResults: results
		})
	}

	kill(person) {
		if(confirm(`Are you sure you'd like to kill ${person.nickname ? person.nickname : person.firstname} ${person.lastname}?`)) {
			api.POST("kill", {player: person.id})
			this.setState({
				killed: person
			})
		}
		this.props.refreshStats()
	}

	render(props, state) {
		if(state.killed) {
			return <div class="alert alert-success" role="alert">
				You killed {state.killed.nickname ? state.killed.nickname : state.killed.firstname} {state.killed.lastname}.
		 	</div>
		}
		const searchResults = state.searchResults.map((element, i) => 
			<li><a href="#" onClick={() => this.kill(element)}>{element.nickname ? element.nickname : element.firstname} {element.lastname}</a></li>
		)
		console.log(searchResults)
		return <div class="kill">
			<h1>Kill Someone</h1>
			<div>
				Who did you kill?
				<input type="text" class="form-control" placeholder="Joe Schmo" value={state.name} onKeyUp={this.updateName.bind(this)} />
			</div>
			<ul>
				{searchResults}
			</ul>
		</div>
	}
}

export default KillSomeone