import { useEffect } from 'react'
import * as d3 from 'd32'
import combined1 from './combined1.csv'
import './Financial.css'

export default function Financial() {
	useEffect(() => {
		componentDidMount()
	})

	const componentDidMount = () => {
		var margin = { top: 30, right: 20, bottom: 100, left: 50 },
			margin2 = { top: 210, right: 20, bottom: 20, left: 50 },
			width = 800 - margin.left - margin.right,
			height = 310 - margin.top - margin.bottom,
			height2 = 310 - margin2.top - margin2.bottom

		var parseDate = d3.time.format('%m/%d/%Y').parse,
			bisectDate = d3.bisector(function (d) {
				return d.date
			}).left,
			legendFormat = d3.time.format('%b %d, %Y')

		var x = d3.time.scale().range([0, width]),
			x2 = d3.time.scale().range([0, width]),
			y = d3.scale.linear().range([height, 0]),
			y2 = d3.scale.linear().range([height2, 0]),
			y3 = d3.scale.linear().range([60, 0])

		var xAxis = d3.svg.axis().scale(x).orient('bottom'),
			xAxis2 = d3.svg.axis().scale(x2).orient('bottom'),
			yAxis = d3.svg.axis().scale(y).orient('left')

		var priceLine = d3.svg
			.line()
			.interpolate('monotone')
			.x(function (d) {
				return x(d.date)
			})
			.y(function (d) {
				return y(d.price)
			})

		var area2 = d3.svg
			.area()
			.interpolate('monotone')
			.x(function (d) {
				return x2(d.date)
			})
			.y0(height2)
			.y1(function (d) {
				return y2(d.price)
			})

		var svg = d3
			.select('#graph')
			.append('svg')
			.attr('id', 'svg2')
			.attr('class', 'chart')
			.attr('width', 750 + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom + 120)
		var svg33 = d3
			.select('#graph')
			.append('svg')
			.attr('id', 'svg33')
			.attr('class', 'chart33')
			.attr('width', 220 + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom + 120)

		svg
			.append('defs')
			.append('clipPath')
			.attr('id', 'clip')
			.append('rect')
			.attr('width', width)
			.attr('height', height)

		var make_y_axis = function () {
			return d3.svg.axis().scale(y).orient('left').ticks(10)
		}

		var focus = svg
			.append('g')
			.attr('class', 'focus')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

		var barsGroup = svg
			.append('g')
			.attr('class', 'volume')
			.attr('clip-path', 'url(#clip)')
			.attr(
				'transform',
				'translate(' + margin.left + ',' + (margin.top + 90 + 20) + ')'
			)

		var context = svg
			.append('g')
			.attr('class', 'context')
			.attr(
				'transform',
				'translate(' + margin2.left + ',' + (margin2.top + 90) + ')'
			)

		var legend = svg
			.append('g')
			.attr('class', 'chart__legend')
			.attr('width', width)
			.attr('height', 30)
			.attr('transform', 'translate(' + margin2.left + ', 10)')
		var legend1 = svg
			.append('g')
			.attr('class', 'chart__legend')
			.attr('width', width)
			.attr('height', 30)
			.attr('transform', 'translate(' + 5 + ',' + (margin.top + 60 + 205) + ')')

		legend1
			.append('text')
			.attr('class', 'chart__symbol')
			.attr('transform', 'rotate(-90)')
			.attr('y', 35)
			.attr('x', -30)
			.style('fill', 'darkOrange')
			.text('Stock Volume ')

		var legend2 = svg
			.append('g')
			.attr('class', 'chart__legend')
			.attr('width', width)
			.attr('height', 30)
			.attr(
				'transform',
				'translate(' + margin.left + ',' + (margin.top + 60 + 225) + ')'
			)

		legend2
			.append('text')
			.attr('class', 'chart__symbol')
			.text('Time period selection:Select an area on bottom graph')
			.attr('font-size', '14px')

		legend.append('text').attr('class', 'chart__symbol').text('NASDAQ')

		var rangeSelection = legend
			.append('g')
			.attr('class', 'chart__range-selection')
			.attr('transform', 'translate(110, 0)')

		d3.csv(combined1, type, function (err, data) {
			var nest = d3
				.nest()
				.key(function (d) {
					return d.comp
				})
				.entries(data)
			var fruitMenu = d3.select('#fruitDropdown')

			fruitMenu
				.append('select')
				.selectAll('option')
				.data(nest)
				.enter()
				.append('option')
				.attr('value', function (d) {
					return d.key
				})
				.text(function (d) {
					return d.key
				})
			var selectFruit = nest.filter(function (d) {
				return d.key === 'Microsoft'
			})
			console.log(selectFruit[0].values)
			var brush = d3.svg.brush().x(x2).on('brush', brushed)
			//     -----------------------------------------------------------------------------------
			var xRange = d3.extent(
				selectFruit[0].values.map(function (d) {
					return d.date
				})
			)

			x.domain(xRange)
			y.domain(
				d3.extent(
					selectFruit[0].values.map(function (d) {
						return d.price
					})
				)
			)
			y3.domain(
				d3.extent(
					selectFruit[0].values.map(function (d) {
						return d.price
					})
				)
			)
			x2.domain(x.domain())
			y2.domain(y.domain())

			var min = d3.min(
				selectFruit[0].values.map(function (d) {
					return d.price
				})
			)
			var max = d3.max(
				selectFruit[0].values.map(function (d) {
					return d.price
				})
			)

			var range = legend
				.append('text')
				.text(
					legendFormat(new Date(xRange[0])) +
						' - ' +
						legendFormat(new Date(xRange[1]))
				)
				.style('text-anchor', 'end')
				.attr('transform', 'translate(' + width + ', 0)')

			focus
				.append('g')
				.attr('class', 'y chart__grid')
				.call(make_y_axis().tickSize(-width, 0, 0).tickFormat(''))

			// var averageChart = focus.append('path')
			// .datum(selectFruit[0].values)
			// .attr('class', 'chart__line chart__average--focus line')
			// .style("stroke-width","0.5px")
			// .attr('d', avgLine);

			var priceChart = focus
				.append('path')
				.datum(selectFruit[0].values)
				.attr('class', 'chart__line chart__price--focus line')
				.style('stroke-width', '1.7px')
				.style('stroke', ' #2980b9')
				.attr('d', priceLine)

			focus
				.append('g')
				.attr('class', 'x axis')
				.attr('transform', 'translate(0 ,' + height + ')')
				.call(xAxis)
				.append('text')
				.attr('class', 'label')
				.attr('x', width)
				.attr('y', -6)
				.style('text-anchor', 'end')
				.style('fill', 'darkOrange')
				.text('Date')

			focus
				.append('g')
				.attr('class', 'y axis')
				.attr('transform', 'translate(12, 0)')
				.call(yAxis)
				.append('text')
				.attr('class', 'label')
				.attr('x', -20)
				.attr('y', -30)
				.attr('dy', '.71em')
				.attr('transform', 'rotate(-90)')
				.style('text-anchor', 'end')
				.style('fill', 'darkOrange')
				.text('Stock price in USD')

			var focusGraph = barsGroup
				.selectAll('rect')
				.data(selectFruit[0].values)
				.enter()
				.append('rect')
				.attr('class', 'chart__bars')
				.attr('x', function (d, i) {
					return x(d.date)
				})
				.attr('y', function (d) {
					return 155 - y3(d.price)
				})
				.attr('width', 1)
				.style('fill', '#7161db')
				.attr('height', function (d) {
					return y3(d.price)
				})

			var helper = svg33
				.append('g')
				.attr('class', 'chart__helper')
				.attr('transform', 'translate(' + 40 + ',' + 210 + ')')

			var helperText = helper
				.append('text')
				.style('fill', 'blue')
				.style('font-size', '12px')

			var helper1 = svg33
				.append('g')
				.attr('class', 'chart__helper1')
				.attr('transform', 'translate(' + 40 + ',' + 230 + ')')

			var helperText1 = helper1
				.append('text')
				.style('fill', 'blue')
				.style('font-size', '12px')

			var helper2 = svg33
				.append('g')
				.attr('class', 'chart__helper2')
				.attr('transform', 'translate(' + 40 + ',' + 250 + ')')

			var helperText2 = helper2
				.append('text')
				.style('fill', 'blue')
				.style('font-size', '12px')
			var priceTooltip = focus
				.append('g')
				.attr('class', 'chart__tooltip--price')
				.append('circle')
				.style('display', 'none')
				.attr('r', 2.5)

			// eslint-disable-next-line
			var mouseArea = svg
				.append('g')
				.attr('class', 'chart__mouse')
				.append('rect')
				.attr('class', 'chart__overlay')
				.attr('width', width)
				.attr('height', height)
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
				.on('mouseover', function () {
					priceTooltip.style('display', null)
					svg33.style('display', null)
				})
				.on('mouseout', function () {
					priceTooltip.style('display', 'none')
					svg33.style('display', 'none')
				})
				.on('mousemove', mousemove)

			context
				.append('path')
				.datum(selectFruit[0].values)
				.attr('class', 'chart__area area')
				.attr('d', area2)
				.style('fill', '#67c0ed')

			context
				.append('g')
				.attr('class', 'x axis chart__axis--context')
				.attr('y', 0)
				.attr('transform', 'translate(0,' + (height2 - 22) + ')')
				.call(xAxis2)

			context
				.append('g')
				.attr('class', 'x brush')
				.call(brush)
				.selectAll('rect')
				.attr('y', -6)
				.attr('height', height2 + 7)

			function mousemove() {
				var x0 = x.invert(d3.mouse(this)[0])
				var i = bisectDate(selectFruit[0].values, x0, 1)
				var d0 = selectFruit[0].values[i - 1]
				var d1 = selectFruit[0].values[i]
				var d = x0 - d0.date > d1.date - x0 ? d1 : d0
				var aColor = ['rgb(0, 255, 0)', 'rgb(255, 0, 0)', 'rgb(200,200,200)']

				var r = 50
				var data1 = [{ value: d.tp }, { value: d.tn }, { value: d.tnn }]

				var p1 = svg33
					.append('svg')
					.attr('id', 'svg3')
					.attr('class', 'chart__pie')
					.data([data1])
					.attr('width', width)
					.attr('height', height)
					.append('svg:g')
				svg33
					.append('text')
					.attr('x', 40)
					.attr('y', 8)
					.text('Pie chart of stock sentiment ratios')
					.style('font-size', '12px')
					.attr('alignment-baseline', 'middle')
				svg33
					.append('text')
					.attr('x', 40)
					.attr('y', 25)
					.text('calculated using FinBERT model')
					.style('font-size', '12px')
					.attr('alignment-baseline', 'middle')
				svg33
					.append('circle')
					.attr('cx', 170)
					.attr('cy', 70)
					.attr('r', 7)
					.style('fill', 'rgb(0, 255, 0)')
				svg33
					.append('circle')
					.attr('cx', 170)
					.attr('cy', 100)
					.attr('r', 7)
					.style('fill', 'rgb(255, 0, 0)')
				svg33
					.append('circle')
					.attr('cx', 170)
					.attr('cy', 130)
					.attr('r', 7)
					.style('fill', 'rgb(200,200,200)')
				svg33
					.append('text')
					.attr('x', 180)
					.attr('y', 70)
					.text('positive sentiment ratio')
					.style('font-size', '10px')
					.attr('alignment-baseline', 'middle')
				svg33
					.append('text')
					.attr('x', 180)
					.attr('y', 100)
					.text('negative sentiment ratio')
					.style('font-size', '10x')
					.attr('alignment-baseline', 'middle')
				svg33
					.append('text')
					.attr('x', 180)
					.attr('y', 130)
					.text('neutral sentiment ratio')
					.style('font-size', '10x')
					.attr('alignment-baseline', 'middle')
				//svg.append("circle").attr("cx",200).attr("cy",160).attr("r", 6).style("fill", "#404080")
				//svg.append("text").attr("x", 220).attr("y", 130).text("variable A").style("font-size", "15px").attr("alignment-baseline","middle")
				//svg.append("text").attr("x", 220).attr("y", 160).text("variable B").style("font-size", "15px").attr("alignment-baseline","middle")

				var pie = d3.layout.pie().value(function (d) {
					return d.value
				})

				// Declare an arc generator function
				var arc = d3.svg.arc().outerRadius(r)

				// Select paths, use arc generator to draw
				var arcs = p1
					.selectAll('g.slice')
					.data(pie)
					.enter()
					.append('svg:g')
					.attr('class', 'slice')
				arcs
					.append('svg:path')
					.attr('fill', function (d, i) {
						return aColor[i]
					})
					.attr('d', function (d) {
						return arc(d)
					})
				p1.attr('transform', 'translate(' + 70 + ',' + 100 + ')')
				/* svg33.append("text").attr("x", 40).attr("y", 240).text("Date").style("font-size", "10px").attr("alignment-baseline","middle")
svg33.append("text").attr("x", 40).attr("y", 270).text("Price").style("font-size", "10x").attr("alignment-baseline","middle")
svg33.append("text").attr("x", 40).attr("y", 290).text("# likes").style("font-size", "10x").attr("alignment-baseline","middle")
svg33.append("text").attr("x", 95).attr("y", 240).text(legendFormat(new Date(d.date))).style("font-size", "10px").attr("alignment-baseline","middle")
svg33.append("text").attr("x", 95).attr("y", 270).text(d.price).style("font-size", "10x").attr("alignment-baseline","middle")*/
				// svg33.append("text").attr("x", 95).attr("y", 290).text(d.lk).style("font-size", "10x").attr("alignment-baseline","middle")
				helperText.text('Date:  ' + legendFormat(new Date(d.date)))
				helperText1.text('Stock Price:   ' + d.price)
				helperText2.text('Total #Tweet Favorites:  ' + d.lk)
				priceTooltip.attr(
					'transform',
					'translate(' + x(d.date) + ',' + y(d.price) + ')'
				)
				//averageTooltip.attr('transform', 'translate(' + x(d.date) + ',' + y(d.price+5*d.score) + ')');
			}

			function brushed() {
				var ext = brush.extent()
				if (!brush.empty()) {
					x.domain(brush.empty() ? x2.domain() : brush.extent())
					y.domain([
						d3.min(
							selectFruit[0].values.map(function (d) {
								return d.date >= ext[0] && d.date <= ext[1] ? d.price : max
							})
						),
						d3.max(
							selectFruit[0].values.map(function (d) {
								return d.date >= ext[0] && d.date <= ext[1] ? d.price : min
							})
						),
					])
					range.text(
						legendFormat(new Date(ext[0])) +
							' - ' +
							legendFormat(new Date(ext[1]))
					)
					focusGraph.attr('x', function (d, i) {
						return x(d.date)
					})

					var days = Math.ceil((ext[1] - ext[0]) / (24 * 3600 * 1000))
					focusGraph.attr('width', 40 > days ? ((40 - days) * 5) / 6 : 5)
				}

				priceChart.attr('d', priceLine)
				//  averageChart.attr('d', avgLine);
				focus.select('.x.axis').call(xAxis)
				focus.select('.y.axis').call(yAxis)
			}

			var dateRange = ['1w', '1m', '3m', '6m', '1y', '5y']
			for (var i = 0, l = dateRange.length; i < l; i++) {
				var v = dateRange[i]
				rangeSelection
					.append('text')
					.attr('class', 'chart__range-selection')
					.text(v)
					.attr('transform', 'translate(' + 18 * i + ', 0)')
					.on('click', function (d) {
						focusOnRange(this.textContent)
					})
			}

			function focusOnRange(range) {
				var today = new Date(
					selectFruit[0].values[selectFruit[0].values.length - 1].date
				)
				var ext = new Date(
					selectFruit[0].values[selectFruit[0].values.length - 1].date
				)

				if (range === '1m') ext.setMonth(ext.getMonth() - 1)

				if (range === '1w') ext.setDate(ext.getDate() - 7)

				if (range === '3m') ext.setMonth(ext.getMonth() - 3)

				if (range === '6m') ext.setMonth(ext.getMonth() - 6)

				if (range === '1y') ext.setFullYear(ext.getFullYear() - 1)

				if (range === '5y') ext.setFullYear(ext.getFullYear() - 5)

				brush.extent([ext, today])
				brushed()
				context.select('g.x.brush').call(brush.extent([ext, today]))
			}

			fruitMenu.on('change', function () {
				// Find which fruit was selected from the dropdown
				var selectedFruit = d3.select(this).select('select').property('value')
				console.log('s', selectedFruit)

				// Run update function with the selected fruit
				updateGraph(selectedFruit)
			})

			var updateGraph = function (fruit) {
				d3.select('#svg2').remove()
				d3.select('#svg33').remove()

				//-----------------------
				var margin = { top: 30, right: 20, bottom: 100, left: 50 },
					margin2 = { top: 210, right: 20, bottom: 20, left: 50 },
					width = 800 - margin.left - margin.right,
					height = 310 - margin.top - margin.bottom,
					height2 = 310 - margin2.top - margin2.bottom

				var x = d3.time.scale().range([0, width]),
					x2 = d3.time.scale().range([0, width]),
					y = d3.scale.linear().range([height, 0]),
					y2 = d3.scale.linear().range([height2, 0]),
					y3 = d3.scale.linear().range([60, 0])

				var xAxis = d3.svg.axis().scale(x).orient('bottom'),
					xAxis2 = d3.svg.axis().scale(x2).orient('bottom'),
					yAxis = d3.svg.axis().scale(y).orient('left')

				var priceLine = d3.svg
					.line()
					.interpolate('monotone')
					.x(function (d) {
						return x(d.date)
					})
					.y(function (d) {
						return y(d.price)
					})

				var area2 = d3.svg
					.area()
					.interpolate('monotone')
					.x(function (d) {
						return x2(d.date)
					})
					.y0(height2)
					.y1(function (d) {
						return y2(d.price)
					})

				var svg = d3
					.select('#graph')
					.append('svg')
					.attr('id', 'svg2')
					.attr('class', 'chart')
					.attr('width', 750 + margin.left + margin.right)
					.attr('height', height + margin.top + margin.bottom + 180)
				var svg33 = d3
					.select('#graph')
					.append('svg')
					.attr('id', 'svg33')
					.attr('class', 'chart33')
					.attr('width', 220 + margin.left + margin.right)
					.attr('height', height + margin.top + margin.bottom + 120)

				svg
					.append('defs')
					.append('clipPath')
					.attr('id', 'clip')
					.append('rect')
					.attr('width', width)
					.attr('height', height)

				var make_y_axis = function () {
					return d3.svg.axis().scale(y).orient('left').ticks(10)
				}

				var focus = svg
					.append('g')
					.attr('class', 'focus')
					.attr(
						'transform',
						'translate(' + margin.left + ',' + margin.top + ')'
					)

				var barsGroup = svg
					.append('g')
					.attr('class', 'volume')
					.attr('clip-path', 'url(#clip)')
					.attr(
						'transform',
						'translate(' + margin.left + ',' + (margin.top + 90 + 20) + ')'
					)

				var context = svg
					.append('g')
					.attr('class', 'context')
					.attr(
						'transform',
						'translate(' + margin2.left + ',' + (margin2.top + 90) + ')'
					)

				var legend = svg
					.append('g')
					.attr('class', 'chart__legend')
					.attr('width', width)
					.attr('height', 30)
					.attr('transform', 'translate(' + margin2.left + ', 10)')
				var legend1 = svg
					.append('g')
					.attr('class', 'chart__legend')
					.attr('width', width)
					.attr('height', 30)
					.attr(
						'transform',
						'translate(' + 5 + ',' + (margin.top + 60 + 205) + ')'
					)

				legend1
					.append('text')
					.attr('class', 'chart__symbol')
					.attr('transform', 'rotate(-90)')
					.attr('y', 35)
					.attr('x', -30)
					.style('fill', 'darkOrange')
					.text('Stock Volume ')

				var legend2 = svg
					.append('g')
					.attr('class', 'chart__legend')
					.attr('width', width)
					.attr('height', 30)
					.attr(
						'transform',
						'translate(' + margin.left + ',' + (margin.top + 60 + 225) + ')'
					)

				legend2
					.append('text')
					.attr('class', 'chart__symbol')
					.text('Time period selection:Select an area on bottom graph')
					.attr('font-size', '14px')

				legend.append('text').attr('class', 'chart__symbol').text('NASDAQ')

				var rangeSelection = legend
					.append('g')
					.attr('class', 'chart__range-selection')
					.attr('transform', 'translate(110, 0)')

				//=================

				// Filter the data to include only fruit of interest
				var selectFruit = nest.filter(function (d) {
					return d.key === fruit
				})
				//	console.log(data)
				console.log(selectFruit[0].values)

				//-----------------------------
				var brush = d3.svg.brush().x(x2).on('brush', brushed)
				//     -----------------------------------------------------------------------------------
				var xRange = d3.extent(
					selectFruit[0].values.map(function (d) {
						return d.date
					})
				)

				x.domain(xRange)
				y.domain(
					d3.extent(
						selectFruit[0].values.map(function (d) {
							return d.price
						})
					)
				)
				y3.domain(
					d3.extent(
						selectFruit[0].values.map(function (d) {
							return d.price
						})
					)
				)
				x2.domain(x.domain())
				y2.domain(y.domain())

				var min = d3.min(
					selectFruit[0].values.map(function (d) {
						return d.price
					})
				)
				var max = d3.max(
					selectFruit[0].values.map(function (d) {
						return d.price
					})
				)

				var range = legend
					.append('text')
					.text(
						legendFormat(new Date(xRange[0])) +
							' - ' +
							legendFormat(new Date(xRange[1]))
					)
					.style('text-anchor', 'end')
					.attr('transform', 'translate(' + width + ', 0)')

				focus
					.append('g')
					.attr('class', 'y chart__grid')
					.call(make_y_axis().tickSize(-width, 0, 0).tickFormat(''))

				// var averageChart = focus.append('path')
				// .datum(selectFruit[0].values)
				// .attr('class', 'chart__line chart__average--focus line')
				// .style("stroke-width","0.5px")
				// .attr('d', avgLine);

				var priceChart = focus
					.append('path')
					.datum(selectFruit[0].values)
					.attr('class', 'chart__line chart__price--focus line')
					.style('stroke-width', '1.7px')
					.style('stroke', ' #2980b9')
					.attr('d', priceLine)

				focus
					.append('g')
					.attr('class', 'x axis')
					.attr('transform', 'translate(0 ,' + height + ')')
					.call(xAxis)
					.append('text')
					.attr('class', 'label')
					.attr('x', width)
					.attr('y', -6)
					.style('text-anchor', 'end')
					.style('fill', 'darkOrange')
					.text('Date')

				focus
					.append('g')
					.attr('class', 'y axis')
					.attr('transform', 'translate(12, 0)')
					.call(yAxis)
					.append('text')
					.attr('class', 'label')
					.attr('x', -20)
					.attr('y', -30)
					.attr('dy', '.71em')
					.attr('transform', 'rotate(-90)')
					.style('text-anchor', 'end')
					.style('fill', 'darkOrange')
					.text('Stock price in USD')

				var focusGraph = barsGroup
					.selectAll('rect')
					.data(selectFruit[0].values)
					.enter()
					.append('rect')
					.attr('class', 'chart__bars')
					.attr('x', function (d, i) {
						return x(d.date)
					})
					.attr('y', function (d) {
						return 155 - y3(d.price)
					})
					.attr('width', 1)
					.style('fill', '#7161db')
					.attr('height', function (d) {
						return y3(d.price)
					})

				var helper = svg33
					.append('g')
					.attr('class', 'chart__helper')
					.attr('transform', 'translate(' + 40 + ',' + 210 + ')')

				var helperText = helper
					.append('text')
					.style('fill', 'blue')
					.style('font-size', '12px')

				var helper1 = svg33
					.append('g')
					.attr('class', 'chart__helper1')
					.attr('transform', 'translate(' + 40 + ',' + 230 + ')')

				var helperText1 = helper1
					.append('text')
					.style('fill', 'blue')
					.style('font-size', '12px')

				var helper2 = svg33
					.append('g')
					.attr('class', 'chart__helper2')
					.attr('transform', 'translate(' + 40 + ',' + 250 + ')')

				var helperText2 = helper2
					.append('text')
					.style('fill', 'blue')
					.style('font-size', '12px')
				var priceTooltip = focus
					.append('g')
					.attr('class', 'chart__tooltip--price')
					.append('circle')
					.style('display', 'none')
					.attr('r', 2.5)

				// var averageTooltip = focus.append('g')
				// .attr('class', 'chart__tooltip--average')
				// .append('circle')
				// .style('display', 'none')
				// .attr('r', 2.5);

				// eslint-disable-next-line
				var mouseArea = svg
					.append('g')
					.attr('class', 'chart__mouse')
					.append('rect')
					.attr('class', 'chart__overlay')
					.attr('width', width)
					.attr('height', height)
					.attr(
						'transform',
						'translate(' + margin.left + ',' + margin.top + ')'
					)
					.on('mouseover', function () {
						helper.style('display', null)
						helper1.style('display', null)
						helper2.style('display', null)
						priceTooltip.style('display', null)
						//averageTooltip.style('display', null);
						svg33.style('display', null)
						//d3.select("#svg3").remove();
					})
					.on('mouseout', function () {
						helper.style('display', 'none')
						helper1.style('display', 'none')
						helper2.style('display', 'none')
						priceTooltip.style('display', 'none')
						// averageTooltip.style('display', 'none');
						//d3.select("#svg3").remove();
						svg33.style('display', 'none')
						//d3.select("#svg3").remove();
					})
					.on('mousemove', mousemove)

				context
					.append('path')
					.datum(selectFruit[0].values)
					.attr('class', 'chart__area area')
					.attr('d', area2)
					.style('fill', '#67c0ed')

				context
					.append('g')
					.attr('class', 'x axis chart__axis--context')
					.attr('y', 0)
					.attr('transform', 'translate(0,' + (height2 - 22) + ')')
					.call(xAxis2)

				context
					.append('g')
					.attr('class', 'x brush')
					.call(brush)
					.selectAll('rect')
					.attr('y', -6)
					.attr('height', height2 + 7)

				function mousemove() {
					var x0 = x.invert(d3.mouse(this)[0])
					var i = bisectDate(selectFruit[0].values, x0, 1)
					var d0 = selectFruit[0].values[i - 1]
					var d1 = selectFruit[0].values[i]
					var d = x0 - d0.date > d1.date - x0 ? d1 : d0
					var aColor = ['rgb(0, 255, 0)', 'rgb(255, 0, 0)', 'rgb(200,200,200)']

					var r = 50
					var data1 = [{ value: d.tp }, { value: d.tn }, { value: d.tnn }]

					var p1 = svg33
						.append('svg')
						.attr('id', 'svg3')
						.attr('class', 'chart__pie')
						.data([data1])
						.attr('width', width)
						.attr('height', height)
						.append('svg:g')

					svg33
						.append('text')
						.attr('x', 40)
						.attr('y', 8)
						.text('Pie chart of stock sentiment ratios')
						.style('font-size', '12px')
						.attr('alignment-baseline', 'middle')
					svg33
						.append('text')
						.attr('x', 40)
						.attr('y', 25)
						.text('calculated using FinBERT model')
						.style('font-size', '12px')
						.attr('alignment-baseline', 'middle')
					svg33
						.append('circle')
						.attr('cx', 170)
						.attr('cy', 70)
						.attr('r', 7)
						.style('fill', 'rgb(0, 255, 0)')
					svg33
						.append('circle')
						.attr('cx', 170)
						.attr('cy', 100)
						.attr('r', 7)
						.style('fill', 'rgb(255, 0, 0)')
					svg33
						.append('circle')
						.attr('cx', 170)
						.attr('cy', 130)
						.attr('r', 7)
						.style('fill', 'rgb(200,200,200)')
					svg33
						.append('text')
						.attr('x', 180)
						.attr('y', 70)
						.text('positive sentiment ratio')
						.style('font-size', '10px')
						.attr('alignment-baseline', 'middle')
					svg33
						.append('text')
						.attr('x', 180)
						.attr('y', 100)
						.text('negative sentiment ratio')
						.style('font-size', '10x')
						.attr('alignment-baseline', 'middle')
					svg33
						.append('text')
						.attr('x', 180)
						.attr('y', 130)
						.text('neutral sentiment ratio')
						.style('font-size', '10x')
						.attr('alignment-baseline', 'middle')
					//svg.append("circle").attr("cx",200).attr("cy",160).attr("r", 6).style("fill", "#404080")
					//svg.append("text").attr("x", 220).attr("y", 130).text("variable A").style("font-size", "15px").attr("alignment-baseline","middle")
					//svg.append("text").attr("x", 220).attr("y", 160).text("variable B").style("font-size", "15px").attr("alignment-baseline","middle")

					//var vis = d3.select('#chart').append("svg:svg").data([data]).attr("width", w).attr("height", h).append("svg:g").attr("transform", "translate(" + r + "," + r + ")");

					var pie = d3.layout.pie().value(function (d) {
						return d.value
					})

					// Declare an arc generator function
					var arc = d3.svg.arc().outerRadius(r)

					// Select paths, use arc generator to draw
					var arcs = p1
						.selectAll('g.slice')
						.data(pie)
						.enter()
						.append('svg:g')
						.attr('class', 'slice')
					arcs
						.append('svg:path')
						.attr('fill', function (d, i) {
							return aColor[i]
						})
						.attr('d', function (d) {
							return arc(d)
						})
					p1.attr('transform', 'translate(' + 70 + ',' + 100 + ')')
					/* svg33.append("text").attr("x", 40).attr("y", 240).text("Date").style("font-size", "10px").attr("alignment-baseline","middle")
svg33.append("text").attr("x", 40).attr("y", 270).text("Price").style("font-size", "10x").attr("alignment-baseline","middle")
svg33.append("text").attr("x", 40).attr("y", 290).text("# likes").style("font-size", "10x").attr("alignment-baseline","middle")
svg33.append("text").attr("x", 95).attr("y", 240).text(legendFormat(new Date(d.date))).style("font-size", "10px").attr("alignment-baseline","middle")
svg33.append("text").attr("x", 95).attr("y", 270).text(d.price).style("font-size", "10x").attr("alignment-baseline","middle")*/
					// svg33.append("text").attr("x", 95).attr("y", 290).text(d.lk).style("font-size", "10x").attr("alignment-baseline","middle")
					helperText.text('Date:  ' + legendFormat(new Date(d.date)))
					helperText1.text('Stock Price:  ' + d.price)
					helperText2.text('#Twitter Likes:  ' + d.lk)
					priceTooltip.attr(
						'transform',
						'translate(' + x(d.date) + ',' + y(d.price) + ')'
					)
					//  averageTooltip.attr('transform', 'translate(' + x(d.date) + ',' + y(d.price+5*d.score) + ')');
				}

				function brushed() {
					var ext = brush.extent()
					if (!brush.empty()) {
						x.domain(brush.empty() ? x2.domain() : brush.extent())
						y.domain([
							d3.min(
								selectFruit[0].values.map(function (d) {
									return d.date >= ext[0] && d.date <= ext[1] ? d.price : max
								})
							),
							d3.max(
								selectFruit[0].values.map(function (d) {
									return d.date >= ext[0] && d.date <= ext[1] ? d.price : min
								})
							),
						])
						range.text(
							legendFormat(new Date(ext[0])) +
								' - ' +
								legendFormat(new Date(ext[1]))
						)
						focusGraph.attr('x', function (d, i) {
							return x(d.date)
						})

						var days = Math.ceil((ext[1] - ext[0]) / (24 * 3600 * 1000))
						focusGraph.attr('width', 40 > days ? ((40 - days) * 5) / 6 : 5)
					}

					priceChart.attr('d', priceLine)
					//averageChart.attr('d', avgLine);
					focus.select('.x.axis').call(xAxis)
					focus.select('.y.axis').call(yAxis)
				}

				var dateRange = ['1w', '1m', '3m', '6m', '1y', '5y']
				for (var i = 0, l = dateRange.length; i < l; i++) {
					var v = dateRange[i]
					rangeSelection
						.append('text')
						.attr('class', 'chart__range-selection')
						.text(v)
						.attr('transform', 'translate(' + 18 * i + ', 0)')
						.on('click', function (d) {
							focusOnRange(this.textContent)
						})
				}

				function focusOnRange(range) {
					var today = new Date(
						selectFruit[0].values[selectFruit[0].values.length - 1].date
					)
					var ext = new Date(
						selectFruit[0].values[selectFruit[0].values.length - 1].date
					)

					if (range === '1m') ext.setMonth(ext.getMonth() - 1)

					if (range === '1w') ext.setDate(ext.getDate() - 7)

					if (range === '3m') ext.setMonth(ext.getMonth() - 3)

					if (range === '6m') ext.setMonth(ext.getMonth() - 6)

					if (range === '1y') ext.setFullYear(ext.getFullYear() - 1)

					if (range === '5y') ext.setFullYear(ext.getFullYear() - 5)

					brush.extent([ext, today])
					brushed()
					context.select('g.x.brush').call(brush.extent([ext, today]))
				}

				//------------------------

				// Select all of the grouped elements and update the data
				var selectFruitGroups = svg.selectAll('.fruitGroups').data(selectFruit)

				// Select all the lines and transition to new positions
				selectFruitGroups
					.selectAll('path.line')
					.data(function (d) {
						return d.values
					})
					.transition()
					.duration(1000)
					.attr('d', function (d) {
						//return valueLine(d.values)
					})

				selectFruitGroups.exit().remove()
			}
		}) // end Data

		function type(d) {
			return {
				date: parseDate(d.Date),
				price: +d.Close,
				score: +d.positive_twitter,
				tp: +d.positive_twitter,
				tn: +d.negative_twitter,
				tnn: +d.neutral_twitter,
				comp: d.company,
				volume: +d.volume,
				lk: d.like_num_twitter,
			}
		}
	}

	return (
		<div className="graph3-container">
			<div className="title-container">
				<h1>Historical Stock Price Data by Company</h1>
			</div>
			<div className="page-desc-container">
				<p>
					This graph allows you to view stock and social media sentiment data
					for 5 companies between 2015-2020.
				</p>
			</div>
			<div className="dropdown-container">
				<div id="fruitDropdown"> Select Company: </div>
			</div>
			<br></br>
			<div id="graph"></div>
		</div>
	)
}
