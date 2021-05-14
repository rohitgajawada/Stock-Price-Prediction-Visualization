import * as d3 from 'd3'
import './Prediction.css'
import { Button } from 'react-bootstrap'
import { useState } from 'react'
import RingLoader from 'react-spinners/RingLoader'

export default function Prediction() {
	const [loading, setLoading] = useState(false)

	const onSubmit = () => {
		let parseDate = d3.timeParse('%d %b %Y')
		var svg = d3.select('#graph2')
		svg.selectAll('.linegraph').remove()
		let xhr = new XMLHttpRequest()
		const url = 'http://localhost:5000/'
		xhr.open('POST', url, true)
		xhr.setRequestHeader('Content-Type', 'application/json')
		let weekData = [
			[
				'Week',
				'Reddit Sentiment',
				'Number of Reddit Posts',
				'Twitter Sentiment',
				'Number of Tweets',
				'Tweet Activity',
			],
			[
				'1',
				d3.select('#one_red_sent')['_groups'][0][0].value / 100,
				d3.select('#one_red')['_groups'][0][0].value / 100,
				d3.select('#one_tw_sent')['_groups'][0][0].value / 100,
				d3.select('#one_tw')['_groups'][0][0].value / 100,
				d3.select('#one_tw_ac')['_groups'][0][0].value / 100,
			],
			[
				'2',
				d3.select('#two_red_sent')['_groups'][0][0].value / 100,
				d3.select('#two_red')['_groups'][0][0].value / 100,
				d3.select('#two_tw_sent')['_groups'][0][0].value / 100,
				d3.select('#two_tw')['_groups'][0][0].value / 100,
				d3.select('#two_tw_ac')['_groups'][0][0].value / 100,
			],
			[
				'3',
				d3.select('#three_red_sent')['_groups'][0][0].value / 100,
				d3.select('#three_red')['_groups'][0][0].value / 100,
				d3.select('#three_tw_sent')['_groups'][0][0].value / 100,
				d3.select('#three_tw')['_groups'][0][0].value / 100,
				d3.select('#three_tw_ac')['_groups'][0][0].value / 100,
			],
			[
				'4',
				d3.select('#four_red_sent')['_groups'][0][0].value / 100,
				d3.select('#four_red')['_groups'][0][0].value / 100,
				d3.select('#four_tw_sent')['_groups'][0][0].value / 100,
				d3.select('#four_tw')['_groups'][0][0].value / 100,
				d3.select('#four_tw_ac')['_groups'][0][0].value / 100,
			],
			[
				'5',
				d3.select('#five_red_sent')['_groups'][0][0].value / 100,
				d3.select('#five_red')['_groups'][0][0].value / 100,
				d3.select('#five_tw_sent')['_groups'][0][0].value / 100,
				d3.select('#five_tw')['_groups'][0][0].value / 100,
				d3.select('#five_tw_ac')['_groups'][0][0].value / 100,
			],
		]
		let data2 = JSON.stringify({
			company: d3.select('#select')['_groups'][0][0].value,
			window: d3.select('#select2')['_groups'][0][0].value,
			data: weekData,
		})
		setLoading(true)
		xhr.send(data2)
		xhr.onreadystatechange = (e) => {
			console.log(xhr.responseText)
			if (xhr.readyState === XMLHttpRequest.DONE) {
				let x = JSON.parse(xhr.responseText)

				let preds = []
				let actual = []
				for (let i = 0; i < x['dates'].length; i++) {
					let date = x['dates'][i].split(' ')
					preds.push({
						date: parseDate(date[1] + ' ' + date[2] + ' ' + date[3]),
						price: x['pred'][i],
					})
					if (x['actual'].length > i) {
						actual.push({
							date: parseDate(date[1] + ' ' + date[2] + ' ' + date[3]),
							price: x['actual'][i],
						})
					}
				}

				generate_graph(preds, actual)
				setLoading(false)
			}
		}
	}

	const generate_graph = (preds, actual) => {
		var timeFormat = d3.timeFormat('%d %b %y')

		var margin = { top: 50, right: 200, bottom: 50, left: 75 }
		var width = window.innerWidth - margin.left - margin.right - 400
		var height = window.innerHeight - margin.top - margin.bottom - 20

		var n = preds.length

		var xScale = d3
			.scaleTime()
			.domain([preds[0].date, preds[n - 1].date])
			.range([0, width])

		let maxPrice = 0
		for (let i = 0; i < preds.length; i++) {
			if (actual.length > i) {
				if (actual[i].price > maxPrice) {
					maxPrice = actual[i].price
				}
			}
			if (preds[i].price > maxPrice) {
				maxPrice = preds[i].price
			}
		}

		var yScale = d3.scaleLinear().domain([0, maxPrice]).range([height, 0])

		var line = d3
			.line()
			.x(function (d) {
				return xScale(d.date)
			})
			.y(function (d) {
				return yScale(d.price)
			})

		var svg = d3
			.select('#graph2')
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.attr('class', 'linegraph')
			.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

		svg
			.append('g')
			.attr('class', 'x-axis')
			.attr('transform', 'translate(0,' + height + ')')
			.call(d3.axisBottom(xScale).tickFormat(timeFormat))

		svg
			.append('text')
			.attr('transform', 'translate(400,' + (height + 38) + ')')
			.text('Date')
			.style('font-size', '14px')

		svg.append('g').attr('class', 'y-axis').call(d3.axisLeft(yScale))

		svg
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', -50)
			.attr('x', -400)
			.text('Stock Price in Dollars')
			.style('font-size', '14px')

		svg
			.append('path')
			.datum(preds)
			.attr('class', 'line')
			.attr('d', line)
			.style('stroke', 'blue')

		svg
			.append('path')
			.datum(actual)
			.attr('class', 'line')
			.attr('d', line)
			.style('stroke', 'red')

		var legend = svg.append('g')

		svg
			.append('text')
			.attr('x', width / 2)
			.attr('y', 0 - margin.top / 2)
			.attr('text-anchor', 'middle')
			.style('font-size', '20px')
			.style('font-weight', 'bold')
			.text(
				'Stock Price for ' +
					d3.select('#select')['_groups'][0][0].value +
					' ' +
					'at Window Size ' +
					d3.select('#select2')['_groups'][0][0].value
			)

		legend
			.append('text')
			.attr('dx', width + 55)
			.attr('dy', 50)
			.text('Predicted Stock Price')
			.style('fill', 'blue')
			.style('font-size', '14px')

		legend
			.append('text')
			.attr('dx', width + 55)
			.attr('dy', 70)
			.text('Actual Stock Price')
			.style('fill', 'red')
			.style('font-size', '14px')

		let future_length = preds.length - actual.length
		let future_week = [0, 0, 0, 0, 0]
		let future_week_lengths = [0, 0, 0, 0, 0]
		for (let i = 0; i < future_length; i++) {
			future_week[i % 5] += preds[actual.length + i].price
			future_week_lengths[i % 5] += 1
		}
		console.log(future_week)
		console.log(future_week_lengths)
		for (let i = 0; i < future_week.length; i++) {
			future_week[i] = future_week[i] / future_week_lengths[i]
		}
		console.log(future_week)
		legend
			.append('text')
			.attr('dx', width + 55)
			.attr('dy', 280)
			.text('Prediction Average Price')
			.style('fill', 'black')
			.style('font-size', '13px')

		legend
			.append('text')
			.attr('dx', width + 55)
			.attr('dy', 300)
			.text('Week 1: $' + Math.round(future_week[0] * 100) / 100)
			.style('fill', 'black')
			.style('font-size', '13px')

		legend
			.append('text')
			.attr('dx', width + 55)
			.attr('dy', 320)
			.text('Week 2: $' + Math.round(future_week[1] * 100) / 100)
			.style('fill', 'black')
			.style('font-size', '13px')

		legend
			.append('text')
			.attr('dx', width + 55)
			.attr('dy', 340)
			.text('Week 3: $' + Math.round(future_week[2] * 100) / 100)
			.style('fill', 'black')
			.style('font-size', '13px')

		legend
			.append('text')
			.attr('dx', width + 55)
			.attr('dy', 360)
			.text('Week 4: $' + Math.round(future_week[3] * 100) / 100)
			.style('fill', 'black')
			.style('font-size', '13px')

		legend
			.append('text')
			.attr('dx', width + 55)
			.attr('dy', 380)
			.text('Week 5: $' + Math.round(future_week[4] * 100) / 100)
			.style('fill', 'black')
			.style('font-size', '13px')
	}

	return (
		<div className="graph2-container" id="graph2">
			<div className="title-container">
				<h1>Use Sentiment to Predict Future Stock Price</h1>
			</div>
			<div className="page-desc-container">
				<p>
					This graph allows you to adjust different social media sentiment
					values and see the impact on a company's closing stock price.
				</p>
			</div>
			<table className="tg" width="98%" style={{ marginLeft: '10px' }}>
				<thead>
					<tr>
						<th className="tg-0lax"></th>
						<th className="tg-0lax">Reddit Sentiment</th>
						<th className="tg-0lax">Number of Reddit Posts</th>
						<th className="tg-0lax">Twitter Sentiment</th>
						<th className="tg-0lax">Number of Tweets</th>
						<th className="tg-0lax">Tweet Activity (Retweets and Likes)</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td className="tg-0lax">Week 1</td>
						<td className="tg-0lax">
							<input id="one_red_sent" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>Negative             Positive</pre>
							</label>
						</td>
						<td className="tg-0lax">
							<input id="one_red" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>No Posts             Many Posts</pre>
							</label>
						</td>
						<td className="tg-0lax">
							<input id="one_tw_sent" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>Negative             Positive</pre>
							</label>
						</td>
						<td className="tg-0lax">
							<input id="one_tw" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>No Tweets             Many Tweets</pre>
							</label>
						</td>
						<td className="tg-0lax">
							<input id="one_tw_ac" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>No Activity            Alot of Activity</pre>
							</label>
						</td>
					</tr>
					<tr>
						<td className="tg-sjuo">Week 2</td>
						<td className="tg-sjuo">
							<input id="two_red_sent" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>Negative             Positive</pre>
							</label>
						</td>
						<td className="tg-sjuo">
							<input id="two_red" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>No Posts             Many Posts</pre>
							</label>
						</td>
						<td className="tg-sjuo">
							<input id="two_tw_sent" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>Negative             Positive</pre>
							</label>
						</td>
						<td className="tg-sjuo">
							<input id="two_tw" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>No Tweets             Many Tweets</pre>
							</label>
						</td>
						<td className="tg-sjuo">
							<input id="two_tw_ac" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>No Activity            Alot of Activity</pre>
							</label>
						</td>
					</tr>
					<tr>
						<td className="tg-0lax">Week 3</td>
						<td className="tg-0lax">
							<input id="three_red_sent" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>Negative             Positive</pre>
							</label>
						</td>
						<td className="tg-0lax">
							<input id="three_red" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>No Posts             Many Posts</pre>
							</label>
						</td>
						<td className="tg-0lax">
							<input id="three_tw_sent" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>Negative             Positive</pre>
							</label>
						</td>
						<td className="tg-0lax">
							<input id="three_tw" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>No Tweets             Many Tweets</pre>
							</label>
						</td>
						<td className="tg-0lax">
							<input id="three_tw_ac" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>No Activity            Alot of Activity</pre>
							</label>
						</td>
					</tr>
					<tr>
						<td className="tg-sjuo">Week 4</td>
						<td className="tg-sjuo">
							<input id="four_red_sent" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>Negative             Positive</pre>
							</label>
						</td>
						<td className="tg-sjuo">
							<input id="four_red" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>No Posts             Many Posts</pre>
							</label>
						</td>
						<td className="tg-sjuo">
							<input id="four_tw_sent" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>Negative             Positive</pre>
							</label>
						</td>
						<td className="tg-sjuo">
							<input id="four_tw" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>No Tweets             Many Tweets</pre>
							</label>
						</td>
						<td className="tg-sjuo">
							<input id="four_tw_ac" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>No Activity            Alot of Activity</pre>
							</label>
						</td>
					</tr>
					<tr>
						<td className="tg-0lax">Week 5</td>
						<td className="tg-0lax">
							<input id="five_red_sent" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>Negative             Positive</pre>
							</label>
						</td>
						<td className="tg-0lax">
							<input id="five_red" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>No Posts             Many Posts</pre>
							</label>
						</td>
						<td className="tg-0lax">
							<input id="five_tw_sent" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>Negative             Positive</pre>
							</label>
						</td>
						<td className="tg-0lax">
							<input id="five_tw" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>No Tweets             Many Tweets</pre>
							</label>
						</td>
						<td className="tg-0lax">
							<input id="five_tw_ac" type="range" min="0" max="100" />
							<label>
								{/* prettier-ignore */}
								<pre>No Activity            Alot of Activity</pre>
							</label>
						</td>
					</tr>
				</tbody>
			</table>
			<div className="desc-container">
				<p className="desc">
					Please select which company and window size you want to predict the
					next month for. A smaller window size means you are okay with more
					volatility in price.
				</p>
			</div>
			<div className="desc2-container">
				<p className="desc2">
					We are only predicting for January 2020, due to data limitations. We
					are confident in our model's ability to predict real time stock prices
					given real time access to stock + social media data.
				</p>
			</div>

			<div className="dropdown-container">
				<select id="select">
					<option value="Microsoft">Microsoft</option>
					<option value="Apple">Apple</option>
					<option value="Amazon">Amazon</option>
					<option value="Tesla">Tesla</option>
					<option value="Google">Google</option>
				</select>
				<select id="select2" style={{ marginLeft: '10px' }}>
					<option value="30">30</option>
					<option value="60">60</option>
					<option value="90">90</option>
				</select>
				<Button
					variant="primary"
					size="sm"
					style={{ marginLeft: '10px' }}
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
		</div>
	)
}
