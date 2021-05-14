import pandas as pd
import datetime as dt
import sys

def get_grouped_df(source, df):
	# print('\n-- get_grouped_df -- ')

	df = df.loc[:, ~df.columns.str.contains('^Unnamed')]
	df.loc[:, 'post_date'] = pd.to_datetime(df['post_date'], unit='s').dt.date	

	cols = ['positive_'+source, 'negative_'+source, 'neutral_'+source, 'count_'+source]

	grouped_df = pd.DataFrame([], columns=cols)

	grouped_df['count_'+source] = df['prediction'].groupby(df['post_date']).count()

	grouped_df[['negative_'+source,'neutral_'+source,'positive_'+source]] = \
		df.groupby(['post_date','prediction'], as_index=False)\
			.size()\
			.pivot(index='post_date', columns='prediction', values='size')\
				[['negative','neutral','positive']]\
			.fillna(0)

	if source == 'twitter':
		grouped_df['comment_num_'+source] = df.groupby(['post_date']).agg({'comment_num':'sum'})['comment_num']
		grouped_df['retweet_num_'+source] = df.groupby(['post_date']).agg({'retweet_num':'sum'})['retweet_num']
		grouped_df['like_num_'+source] = df.groupby(['post_date']).agg({'like_num':'sum'})['like_num']

	if source == 'reddit':
		grouped_df['comment_num_'+source] = df.groupby(['post_date']).agg({'comment_num':'sum'})['comment_num']

	grouped_df[['positive_'+source, 'negative_'+source, 'neutral_'+source]] = \
	grouped_df[['positive_'+source, 'negative_'+source, 'neutral_'+source]].div(grouped_df['count_'+source],0)
	# grouped_df.loc[:,grouped_df.columns!='count_'+source] = grouped_df.loc[:, grouped_df.columns!='count_'+source].div(grouped_df['count_'+source],0)

	return grouped_df


def load_data(company, stock_path, reddit_path, twitter_path, year_list, return_cols):
	# print('\n-- load_data -- ')

	fin_df = pd.DataFrame([])

	if stock_path != False:
		for y in year_list:
			df = pd.read_csv(stock_path + company+"_"+str(y)+'.csv')
			fin_df = fin_df.append(df)

		fin_df = fin_df.drop('Adj Close', 1)
		fin_df['Date'] = pd.to_datetime(fin_df['Date'])
		fin_df.set_index('Date', inplace=True)

	# adding financial dataframe to final_df, then we're gonna add twitter and reddit data to 
	# final_df (if they exist)
	final_df = fin_df.copy()


	# adding reddit data
	if reddit_path != False:
		reddit_df = pd.DataFrame([])
		cols = ['post_date','comment_num','prediction']
		for y in year_list:
			df = pd.read_csv(reddit_path + str(company) + "_reddit_" + str(y)+'.csv', usecols=cols)
			reddit_df = reddit_df.append(df)

		grouped_reddit_df = get_grouped_df('reddit', reddit_df)
		final_df = final_df.merge(grouped_reddit_df, 
									left_index=True, 
									right_index=True, 
									how='left')

	# adding twitter data
	if twitter_path != False:
		twitter_df = pd.DataFrame([])
		cols = [ 'post_date','comment_num', 'retweet_num', 'like_num', 'prediction']
		for y in year_list:
			df = pd.read_csv(twitter_path + str(company) +"_tweets_" + str(y)+'.csv', usecols=cols)
			twitter_df = twitter_df.append(df)
		
		grouped_twitter_df = get_grouped_df('twitter', twitter_df)
		final_df = final_df.merge(grouped_twitter_df, 
									left_index=True, 
									right_index=True, 
									how='left')

	# fillna with 0
	final_df.fillna(0, inplace=True)
	if len(return_cols) == 0:
		return_cols = final_df.columns


	return final_df.index.tolist(), final_df[return_cols].to_numpy()

# if __name__ == '__main__':
# 	print(load_data("TSLA", "stock_data/tesla/", "reddit/TSLA/","twitter/TSLA/", [2015,2016,2017,2018], []))



