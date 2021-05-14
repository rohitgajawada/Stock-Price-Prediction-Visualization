export default function Landing() {
	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'center' }}>
				<h1 style={{ marginTop: '20px' }}>
					Welcome to Team 6's Data Visualization Tool{' '}
				</h1>
			</div>
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					marginTop: '100px',
				}}
			>
				<p style={{ width: '40%' }}>
					This tool using React + D3 + Flask to generate visualizations involing
					sentiment analysis of social media posts about Stocks, financial data
					about Stocks, and more! Click on a graph on the left to get started.
				</p>
			</div>
		</div>
	)
}
