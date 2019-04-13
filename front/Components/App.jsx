import preact from 'preact'

import api from '../api.js'

import LogInScreen from './LogInScreen.jsx'
import Nav from './Nav.jsx'
import QuickStats from './QuickStats.jsx'
import KillSomeone from './KillSomeone.jsx'
import FullStats from './FullStats.jsx'

import './App.styl'

class App extends preact.Component {
	constructor(props) {
		super(props)
		this.state = {
			isLoading: true,
			mode: "main",
			isLoginScreen: false
		}
		this.load()
	}

	async load() {
		let stats = await api.GET("stats")
		let me = await api.GET("auth/me")
		this.setState({
			isLoading: false,
			me: me,
			stats: stats,
			isLoggedIn: me.status == undefined
		})
	}

	goLogin() {
		this.setState({
			isLoginScreen: true
		})
	}

	goHome() {
		this.setState({
			isLoginScreen: false,
		})
	}

	async logout() {
		this.setState({
			isLoading: true,
		})
		await api.POST("auth/logout")
		this.setState({
			me: {},
			isLoggedIn: false,
			isLoading: false,
			isLoginScreen: false
		})
	}

	async login(username, password) {
		let result = await api.POST("auth/login", {
			username: username,
			password: password
		})
		if (result.status == "error") {
			return result.error
		}
		let me = await api.GET("auth/me")
		this.setState({
			isLoginScreen: false,
			me: me,
			isLoggedIn: true,
		})
	}

	render(props, state) {
		if (state.isLoading) {
			return <div class="loading-indicator"><i class="fa fa-circle-o-notch fa-3x fa-spin"></i></div>
		} else if (state.isLoginScreen) {
			return <div>
				<Nav me={state.me} login={this.goLogin.bind(this)} isLoggedIn={state.isLoggedIn} goHome={this.goHome.bind(this)} />
				<LogInScreen login={this.login.bind(this)} isLoggedIn={state.isLoggedIn} logOut={this.logout.bind(this)} />
			</div>
		}
		return <div>
			<Nav me={state.me} isLoggedIn={state.isLoggedIn} login={this.goLogin.bind(this)} goHome={this.goHome.bind(this)} />
			<QuickStats stats={state.stats} isLoggedIn={state.isLoggedIn} me={state.me} />
			<div class="container">
				{state.isLoggedIn ?
					<div>
						{!state.me.dead ?
							<KillSomeone stats={state.stats} me={state.me} refreshStats={this.load.bind(this)}/> :
							<div class="alert alert-danger" role="alert">
								You are dead and therefore cannot kill anyone else.
							</div>}
					</div> :
					<div class="alert alert-primary" role="alert">
						Killed someone? Sign in in the upper left hand corner to report the kill.
					</div>
				}
				<FullStats stats={state.stats} isLoggedIn={state.isLoggedIn} me={state.me} />
			</div>
		</div >
	}
}

export default App;