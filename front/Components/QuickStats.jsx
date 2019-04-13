import preact from 'preact'
import './QuickStats.styl'

class QuickStats extends preact.Component {
	render(props, state) {
		let dead = 0
		let alive = 0
		let ranking = -1
		for (var k in props.stats) {
			if (props.stats[k].dead) {
				dead++
			} else {
				alive++
			}
			if (props.stats[k].id == props.me.id) {
				ranking = k + 1
			}
		}
		return <div class="quickstats">
			<div class="container">
				<div class="row">
					<div class="col-md-3 stat">
						<h1 class="big-number">{dead}</h1>
						Players dead
					</div>
					<div class="col-md-3 stat">
						<h1 class="big-number">{alive}</h1>
						Players alive
					</div>
					{props.isLoggedIn && <div class="col-md-3 stat">
						<h1 class="big-number">#{ranking}</h1>
						Ranking
					</div>}
					{props.isLoggedIn && <div class="col-md-3 stat">
						<h1 class="big-number">{props.me.kills}</h1>
						Kills
					</div>}
					{!props.isLoggedIn && <div class="col-md-6 stat you-should-sign-in">
						<h3>Sign in for individualized stats</h3>
					</div>}
				</div>
				<div class="rankings-desc">
					<div><strong>How rankings work</strong></div>
					<div>First, the living players are ranked from most kills to least kills, then the dead players are ranked from most kills to least kills.</div>
				</div>
			</div>
		</div>
	}
}

export default QuickStats