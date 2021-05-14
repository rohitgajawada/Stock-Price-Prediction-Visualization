import { useState } from 'react'
import { ProSidebar, SidebarHeader, Menu, MenuItem } from 'react-pro-sidebar'
import 'react-pro-sidebar/dist/css/styles.css'
import './App.css'
import Landing from './components/Misc/Landing'
import Sentiment from './components/Sentiment/Sentiment'
import Prediction from './components/Prediction/Prediction'
import Financial from './components/Financial/Financial'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faChartLine,
	faMoneyCheck,
	faComment,
} from '@fortawesome/free-solid-svg-icons'

export default function App() {
	const [graph, setGraph] = useState('Landing')

	var currGraph
	if (graph === 'graph1') {
		currGraph = <Financial />
	} else if (graph === 'graph2') {
		currGraph = <Prediction />
	} else if (graph === 'graph3') {
		currGraph = <Sentiment />
	} else {
		currGraph = <Landing />
	}

	return (
		<div className="App">
			<div className="page-container">
				<div className="left-half">
					<ProSidebar style={{ height: window.screen.height }}>
						<SidebarHeader className="sidebar-header">Stock Viz</SidebarHeader>
						<Menu iconShape="square">
							<MenuItem onClick={() => setGraph('graph1')} className="menuItem">
								<FontAwesomeIcon
									icon={faChartLine}
									style={{ paddingRight: '5px' }}
								/>
								Financial Dashboard
							</MenuItem>
							<MenuItem onClick={() => setGraph('graph2')} className="menuItem">
								<FontAwesomeIcon
									icon={faMoneyCheck}
									style={{ paddingRight: '5px' }}
								/>
								Predict Stock Price
							</MenuItem>
							<MenuItem onClick={() => setGraph('graph3')} className="menuItem">
								<FontAwesomeIcon
									icon={faComment}
									style={{ paddingRight: '5px' }}
								/>
								Analyze Recent Sentiment
							</MenuItem>
						</Menu>
					</ProSidebar>
				</div>
				<div className="right-half">{currGraph}</div>
			</div>
		</div>
	)
}
