import pandas as pd
import numpy as np
import datetime
import os, sys


def starter_code():
	company = sys.argv[1].upper()

	reddit_path = company + '_reddit_2015_to_2019.csv'
	twitter_path = company + '_tweets_2015_to_2019.csv'

	reddit_df = pd.read_csv(reddit_path)
	twitter_df = pd.read_csv(twitter_path)

	reddit_df = reddit_df.loc[:, ~reddit_df.columns.str.contains('^Unnamed')]
	twitter_df = twitter_df.loc[:, ~twitter_df.columns.str.contains('^Unnamed')]

	print('Creating the data for each year ...')

	for year in pd.to_datetime(twitter_df['post_date'], unit='s').dt.year.unique():

		tw_df = twitter_df[pd.to_datetime(twitter_df['post_date'], unit='s').dt.year==year]
		red_df = reddit_df[pd.to_datetime(reddit_df['post_date'], unit='s').dt.year==year]

		tw_out_name = str(company) + '_tweets_' + str(year) + '.csv'
		outdir = './twitter/' + company
		if not os.path.exists(outdir):
		    os.mkdir(outdir)
		fullname = os.path.join(outdir, tw_out_name)
		tw_df.to_csv(fullname)

		red_out_name = str(company) + '_reddit_' + str(year) + '.csv'
		outdir = './reddit/'+ company
		if not os.path.exists(outdir):
		    os.mkdir(outdir)
		fullname = os.path.join(outdir, red_out_name)    
		red_df.to_csv(fullname)

		print('year ' + str(year) + ' done')
		
if __name__ == '__main__':
	starter_code()