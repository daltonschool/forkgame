import preact from 'preact'

class LogInScreen extends preact.Component {
	constructor(props) {
		super(props)
		this.state = {
			username: "",
			password: "",
			error: null,
			isLoading: false,
		}
	}

	async logIn() {
		if (this.state.username == "" || this.state.password == "") {
			this.setState({
				error: "You must enter both a username and password."
			})
			return
		}
		this.setState({ isLoading: true })
		let error = await this.props.login(this.state.username, this.state.password)
		if (error == "login was unsuccessful") {
			error = "The username or password that you entered is incorrect. Please try again."
		}
		this.setState({ error: error, isLoading: false })

	}

	updateUsername(event) {
		this.setState({ username: event.target.value });
	}

	updatePassword(event) {
		this.setState({ password: event.target.value });
	}

	render(props, state) {
		if (props.isLoggedIn) {
			return <div>
				<div class="jumbotron jumbotron-fluid">
					<div class="container">
						<h1 class="display-4">Log out</h1>
					</div>
				</div>
				<div class="container">
					<button class="btn btn-danger" onClick={props.logOut}>Log out</button>
				</div>
			</div>
		}
		return <div>
			<div class="jumbotron jumbotron-fluid">
				<div class="container">
					<h1 class="display-4">Log in</h1>
					<p class="lead">Use your Dalton Account to log in.</p>
				</div>
			</div>
			<div class="container">
				{state.error ? <div class="alert alert-danger" role="alert">
					{state.error}
				</div> : null}
				<div class="input-group mb-3">
					<input type="text" class="form-control" placeholder="cXXyy" aria-label="cXXyy" aria-describedby="basic-addon2" value={state.username} onChange={this.updateUsername.bind(this)} />
					<div class="input-group-append">
						<span class="input-group-text" id="basic-addon2">@dalton.org</span>
					</div>
				</div>
				<div class="input-group mb-3">
					<input type="password" class="form-control" placeholder="Password" aria-label="Password" value={state.password} onChange={this.updatePassword.bind(this)} />
				</div>
				<button onClick={this.logIn.bind(this)} class="btn btn-primary" disabled={state.isLoading}>{state.isLoading ? <i class="fa fa-circle-o-notch fa-spin"></i> : "Log in"}</button>
			</div>
		</div>
	}
}

export default LogInScreen