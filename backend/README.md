# cse6242-project
All the data will now be at this link: https://drive.google.com/drive/folders/1RQlCXTDjg-_fbt9_nhTIWSsGnP4_sh4K?usp=sharing

To get the data:
1. Download the twitter(`company_tweets_2015_to_2019.csv`, e.g. `TSLA_tweets_2015_to_2019.csv`) and reddit data(`company_reddit_2015_to_2019.csv`, e.g. `TSLA_reddit_2015_to_2019.csv`) from google drive and put it in the same path as starter_code.
2. Run `starter_code.py company` or any other company (should enter the stock name). It creates two directories (`twitter/company/` and `reddit/company/`) and adds the data for each year to those directories.
3. Run `load_data.py` with the following arguments: `load_data(stock_name, stock_path, reddit_path, twitter_path, year_list, return_columns_list)`
  - For example, for getting data of TSLA for years 2015 to 1018 and the desired outputs listed below, run ```load_data("TSLA", "stock_data/tesla/", "reddit/TSLA/", "twitter/TSLA/", [2015, 2016, 2017, 2018], ['Close','positive_reddit','negative_reddit', 'neutral_reddit', 'count_reddit','comment_num_reddit', 'positive_twitter', 'negative_twitter','neutral_twitter', 'count_twitter', 'comment_num_twitter','retweet_num_twitter', 'like_num_twitter'])```
  - If you want all the columns in the returned array, pass an empty list `[]` as `return_columns_list` in `load_data()`.
