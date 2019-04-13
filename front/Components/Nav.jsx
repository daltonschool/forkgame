import preact from 'preact'

import './Nav.styl'

class Nav extends preact.Component {
	render(props, state) {
		return <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
			<a class="navbar-brand" href="#">Fork Game</a>
			<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
				<span class="navbar-toggler-icon"></span>
			</button>
			<div class="collapse navbar-collapse" id="navbarColor01">
				<ul class="navbar-nav mr-auto">
					<li class="nav-item">
						<a class="nav-link" onClick={props.goHome}>Home</a>
					</li>
				</ul>
				<ul class="navbar-nav nav-right">
					<li class="nav-item nav-login">
						<a class="nav-link" onClick={props.login}>{props.isLoggedIn ? `Hi, ${props.me.nickname ? props.me.nickname : props.me.firstname}!` : "Log in"}</a>
					</li>
				</ul>
			</div>
		</nav>
	}
}

export default Nav;