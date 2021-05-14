import { useState } from 'react'
import './Sentiment.css'
import { Button, InputGroup, FormControl } from 'react-bootstrap'
import * as d3 from 'd3'
import RingLoader from 'react-spinners/RingLoader'

export default function Sentiment() {
	const [loading, setLoading] = useState(false)

	const onSubmit = () => {
		if (loading) {
			return
		}
		var inputVal = document.getElementById('input').value
		if (inputVal !== inputVal.toUpperCase() || inputVal.length > 5) {
			alert('please enter a valid uppercase stock ticker')
			return
		}

		let xhr = new XMLHttpRequest()
		const url = 'http://localhost:5000/get_sentiment'
		xhr.open('POST', url, true)
		xhr.setRequestHeader('Content-Type', 'application/json')
		let data = JSON.stringify({ query: inputVal })
		setLoading(true)
		xhr.send(data)
		xhr.onreadystatechange = (e) => {
			let jsonResponse = JSON.parse(xhr.responseText)
			if (jsonResponse.error) {
				alert(jsonResponse.error)
			}
			createGraph(jsonResponse)
			setLoading(false)
		}
	}

	const createGraph = (jsonData) => {
		const graph = document.getElementById('graph')
		graph.innerHTML = ''
		var maxCount = 0
		var data = []
		for (let key in jsonData) {
			if (jsonData.hasOwnProperty(key)) {
				if (jsonData[key]['count'] > maxCount) {
					maxCount = jsonData[key]['count']
				}
				data.push({
					date: key,
					count: jsonData[key]['count'],
					negative_count: jsonData[key]['negative_count'],
					negative_favorites: jsonData[key]['negative_favorites'],
					negative_text: jsonData[key]['negative_text'],
					neutral_count: jsonData[key]['neutral_count'],
					neutral_favorites: jsonData[key]['neutral_favorites'],
					neutral_text: jsonData[key]['neutral_text'],
					positive_count: jsonData[key]['positive_count'],
					positive_favorites: jsonData[key]['positive_favorites'],
					positive_text: jsonData[key]['positive_text'],
				})
			}
		}
		let margin = { top: 40, right: 30, bottom: 40, left: 50 },
			width = 460 - margin.left - margin.right,
			height = 600 - margin.top - margin.bottom

		var svg = d3
			.select('#graph')
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

		var hover = d3
			.select('#popover')
			.append('div')
			.attr('class', 'tooltip')
			.style('opacity', 0)

		let subgroups = ['negative_count', 'neutral_count', 'positive_count']

		let groups = data.map((d) => {
			return d.date
		})

		// Add X axis
		const x = d3.scaleBand().domain(groups).range([0, width]).padding([0.2])

		svg
			.append('g')
			.attr('transform', 'translate(0,' + height + ')')
			.call(d3.axisBottom(x).tickSizeOuter(0))

		svg
			.append('text')
			.attr('transform', 'translate(0,' + (height + 40) + ')')
			.attr('x', width / 2 - margin.left / 2)
			.text('Date')
			.style('font-size', '14px')

		// Add Y axis
		var y = d3.scaleLinear().domain([0, maxCount]).range([height, 0])
		svg.append('g').call(d3.axisLeft(y))

		svg
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', -40)
			.attr('x', -height / 2 - 50)
			.text('Number of Popular Tweets')
			.style('font-size', '14px')
			.style('font-color', 'black')

		const ticker = document.getElementById('input').value
		svg
			.append('text')
			.attr('x', width / 2)
			.attr('y', 0 - margin.top / 2)
			.attr('text-anchor', 'middle')
			.style('font-size', '20px')
			.style('font-weight', 'bold')
			.text(`${ticker} Sentiment Last 7 days`)

		// color palette = one color per subgroup
		var color = d3
			.scaleOrdinal()
			.domain(subgroups)
			.range(['#e41a1c', '#377eb8', '#4daf4a'])

		//stack the data? --> stack per subgroup
		var stackedData = d3.stack().keys(subgroups)(data)
		// Show the bars
		svg
			.append('g')
			.selectAll('g')
			// Enter in the stack data = loop key per key = group per group
			.data(stackedData)
			.enter()
			.append('g')
			.attr('fill', function (d) {
				return color(d.key)
			})
			.selectAll('rect')
			// enter a second time = loop subgroup per subgroup to add all rectangles
			.data(function (d) {
				return d
			})
			.enter()
			.append('rect')
			.attr('x', function (d) {
				return x(d.data.date)
			})
			.attr('y', function (d) {
				return y(d[1])
			})
			.attr('height', function (d) {
				return y(d[0]) - y(d[1])
			})
			.attr('width', x.bandwidth())
			.on('mouseover', function (_, d) {
				d3.select(this).transition().duration('50').attr('opacity', '.7')
				var tweet = 'No data available'
				var favorites = 'No data available'
				var type = 'Positive'

				if (d3.select(this).style('fill') === 'rgb(228, 26, 28)') {
					// Negative
					tweet = d.data.negative_text
					favorites = d.data.negative_favorites
					type = 'Negative'
				} else if (d3.select(this).style('fill') === 'rgb(55, 126, 184)') {
					// Neutral
					tweet = d.data.neutral_text
					favorites = d.data.neutral_favorites
					type = 'Neutral'
				} else {
					// Positive
					tweet = d.data.positive_text
					favorites = d.data.positive_favorites
				}

				let output = `<div style="border-radius: 100&" >
									<p style="font-size: 18px; text-align: center;">Top ${type} Tweet</p>
									<p style="font-weight: 700;">${tweet}</p>
									<p>Number of Favorites: <span style="font-weight: 700;">${favorites}</span></p>
									<p>Date Posted: <span style="font-weight: 700;">${d.data.date}</span></p>
								</div>`

				hover.transition().duration(50).style('opacity', 1)
				hover.html(output)
			})
			.on('mouseout', function (d) {
				d3.select(this).transition().duration('50').attr('opacity', '1')
				hover.transition().duration('50').style('opacity', 0)
			})
	}

	if (loading) {
		const graph = document.getElementById('graph')
		graph.innerHTML = ''
	}

	return (
		<div className="graph1-container">
			<div className="title-container">
				<h1>Get Sentiment of Recent Tweets</h1>
			</div>
			<div className="desc-container">
				<p>
					This graph pulls the latest "popular" tweets from the past 7 days
					according to the Twitter API and analyzes the sentiment of these
					tweets with finBert
				</p>
			</div>
			<div className="button-container">
				<InputGroup className="text-form-control">
					<FormControl
						id="input"
						placeholder="Enter a 4 letter stock ticker in uppercase such as 'TSLA'"
						aria-label="Stock Ticker"
						disabled={loading}
					/>
				</InputGroup>

				<Button
					variant="primary"
					size="sm"
					style={{
						marginLeft: '10px',
					}}
					onClick={() => onSubmit()}
					id="submit"
				>
					Submit
				</Button>
			</div>
			<div className="loading-container">
				<RingLoader
					className="loader"
					loading={loading}
					size={100}
					color="#025955"
				/>
			</div>
			<div className="popover-container" id="popover"></div>
			<div className="graph-container" id="graph"></div>
		</div>
	)
}
