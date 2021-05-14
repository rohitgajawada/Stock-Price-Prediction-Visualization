# Imports 
import os
import tweepy as tw
import pandas as pd
from extrapolate_backend import extrapolate_func
import csv
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from datetime import datetime, timedelta
from dotenv import load_dotenv
from finBert.sentiment import get_prediction

# Need to do one time
#import nltk
#import ssl
#try:
    #_create_unverified_https_context = ssl._create_unverified_context
#except AttributeError:
    #pass
#else:
    #ssl._create_default_https_context = _create_unverified_https_context
#nltk.download('punkt')

# Load env variables
load_dotenv()

# Flask configuration
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# API for getting sentiment of popular tweets 
# in the last 7 days with finBert
@app.route('/get_sentiment', methods=['POST'])
@cross_origin()
def get_sentiment():
    date_since = str(datetime.now() - timedelta(days=7)).split(' ')[0]
    curr_date = str(datetime.now()).split(' ')[0]
    search_words = request.json['query'] + ' -filter:retweets until:'+curr_date

    # Initialize tweepy isntance
    auth = tw.OAuthHandler(os.getenv('consumer_key'), os.getenv('consumer_secret'))
    auth.set_access_token(os.getenv('access_token'), os.getenv('access_token_secret'))
    api = tw.API(auth, wait_on_rate_limit=True)

    # Get tweets
    tweets = tw.Cursor(api.search,
                    q=search_words,
                    lang="en",
                    since=date_since,
                    result_type="popular").items(100)

    tweet_list = [tweet for tweet in tweets]
    data = {'created_at': [], 'text': [], 'favorite_count': [], 'sentiment': []}
    created_at, text, favorite_count = [], [], []
    for tweet in tweet_list:
        data['created_at'].append(str(tweet.created_at).split(' ')[0])
        data['text'].append(tweet.text)
        data['favorite_count'].append(tweet.favorite_count)

    sentiment_list = get_prediction(data['text'])
    for sentiment in sentiment_list:
        data['sentiment'].append(sentiment)

    # Create dataframe
    df = pd.DataFrame(data)
    if (len(df.index) == 0) :
        return jsonify({'error': 'Could not find any tweets or input had invalid character such as "$"'})
    keys1, keys2 = [], []

    # Get data for graphs 
    positive_df = df[df['sentiment']=='positive']
    negative_df = df[df['sentiment']=='negative']
    neutral_df = df[df['sentiment']=='neutral']
    if len(positive_df.index) > 0:
        keys1.append('positive_count')
        keys2.append('positive')
    if len(negative_df.index) > 0:
        keys1.append('negative_count')
        keys2.append('negative')
    if len(neutral_df.index) > 0:
        keys1.append('neutral_count')
        keys2.append('neutral')
   

    cols = ['count', 'negative_count', 'neutral_count', 'positive_count']
    grouped_df = pd.DataFrame([], columns=cols)
    grouped_df['count'] = df['sentiment'].groupby(df['created_at']).count()
    grouped_df[keys1] = \
                df.reset_index().groupby(['created_at','sentiment'], as_index=False)\
                .size()\
                .pivot(index='created_at', columns='sentiment', values='size')\
                    [keys2]\
                .fillna(0)
    idx_negative = negative_df.groupby(['created_at'])['favorite_count'].transform(max) == negative_df['favorite_count']
    top_negative = negative_df[idx_negative]
    idx_positive = positive_df.groupby(['created_at'])['favorite_count'].transform(max) == positive_df['favorite_count']
    top_positive = positive_df[idx_positive]
    idx_neutral = neutral_df.groupby(['created_at'])['favorite_count'].transform(max) == neutral_df['favorite_count']
    top_neutral = neutral_df[idx_neutral]
    x = pd.merge(grouped_df, top_negative, on='created_at', how='outer').fillna('N/A')
    x = x.drop(['sentiment'], axis=1)
    x = x.rename(columns={"text": "negative_text", "favorite_count": "negative_favorites"})
    x = pd.merge(x, top_positive, on='created_at', how='outer').fillna('N/A')
    x = x.drop(['sentiment'], axis=1)
    x = x.rename(columns={"text": "positive_text", "favorite_count": "positive_favorites"})
    x = pd.merge(x, top_neutral, on='created_at', how='outer').fillna('N/A')
    x = x.drop(['sentiment'], axis=1)
    x = x.rename(columns={"text": "neutral_text", "favorite_count": "neutral_favorites"})
    
    output = {}
    for index, row in x.iterrows():
        row_data = {}
        row_data['count'] = row['count']
        row_data['negative_count'] = row['negative_count']
        row_data['neutral_count'] = row['neutral_count']
        row_data['positive_count'] = row['positive_count']
        row_data['negative_text'] = row['negative_text']
        row_data['negative_favorites'] = row['negative_favorites']
        row_data['positive_text'] = row['positive_text']
        row_data['positive_favorites'] = row['positive_favorites']
        row_data['neutral_text'] = row['neutral_text']
        row_data['neutral_favorites'] = row['neutral_favorites']
        output[row['created_at']] = row_data

    return jsonify(output)

@app.route('/', methods=['POST'])
@cross_origin()
def get_plots():
    with open(f'{request.json["company"]}_{request.json["window"]}_5weeks.csv', 'w', newline='') as csvfile:
        spamwriter = csv.writer(csvfile, delimiter=',', quotechar='|', quoting=csv.QUOTE_MINIMAL)
        for row in request.json["data"]:
            spamwriter.writerow(row)
    if request.json["company"] == "Tesla":
        if request.json["window"] == "30":
            result = extrapolate_func(int(request.json["window"]), "TSLA", "best_weights/best_weights_TSLA_wsize30.hdf5",
            "best_weights/TSLA_wsize30_sc_dict.p", f'{request.json["company"]}_{request.json["window"]}_5weeks.csv', "stock_data/tesla/",
            "reddit/TSLA/", "twitter/TSLA/", [2019])
        elif request.json["window"] == "60":
            result = extrapolate_func(int(request.json["window"]), "TSLA", "best_weights/best_weights_TSLA_wsize60.hdf5",
            "best_weights/TSLA_wsize60_sc_dict.p", f'{request.json["company"]}_{request.json["window"]}_5weeks.csv', "stock_data/tesla/",
            "reddit/TSLA/", "twitter/TSLA/", [2019])
        elif request.json["window"] == "90":
            result = extrapolate_func(int(request.json["window"]), "TSLA", "best_weights/best_weights_TSLA_wsize90.hdf5",
            "best_weights/TSLA_wsize90_sc_dict.p", f'{request.json["company"]}_{request.json["window"]}_5weeks.csv', "stock_data/tesla/",
            "reddit/TSLA/", "twitter/TSLA/", [2019])
    elif request.json["company"] == "Amazon":
        if request.json["window"] == "30":
            result = extrapolate_func(int(request.json["window"]), "AMZN", "best_weights/best_weights_AMZN_wsize30.hdf5",
            "best_weights/AMZN_wsize30_sc_dict.p", f'{request.json["company"]}_{request.json["window"]}_5weeks.csv', "stock_data/amazon/",
            "reddit/AMZN/", "twitter/AMZN/", [2019])
        elif request.json["window"] == "60":
            result = extrapolate_func(int(request.json["window"]), "AMZN", "best_weights/best_weights_AMZN_wsize60.hdf5",
            "best_weights/AMZN_wsize60_sc_dict.p", f'{request.json["company"]}_{request.json["window"]}_5weeks.csv', "stock_data/amazon/",
            "reddit/AMZN/", "twitter/AMZN/", [2019])
        elif request.json["window"] == "90":
            result = extrapolate_func(int(request.json["window"]), "AMZN", "best_weights/best_weights_AMZN_wsize90.hdf5",
            "best_weights/AMZN_wsize90_sc_dict.p", f'{request.json["company"]}_{request.json["window"]}_5weeks.csv', "stock_data/amazon/",
            "reddit/AMZN/", "twitter/AMZN/", [2019])
    elif request.json["company"] == "Apple":
        if request.json["window"] == "30":
            result = extrapolate_func(int(request.json["window"]), "AAPL", "best_weights/best_weights_AAPL_wsize30.hdf5",
            "best_weights/AAPL_wsize30_sc_dict.p", f'{request.json["company"]}_{request.json["window"]}_5weeks.csv', "stock_data/apple/",
            "reddit/AAPL/", "twitter/AAPL/", [2019])
        elif request.json["window"] == "60": 
            result = extrapolate_func(int(request.json["window"]), "AAPL", "best_weights/best_weights_AAPL_wsize60.hdf5",
            "best_weights/AAPL_wsize60_sc_dict.p", f'{request.json["company"]}_{request.json["window"]}_5weeks.csv', "stock_data/apple/",
            "reddit/AAPL/", "twitter/AAPL/", [2019])  
        elif request.json["window"] == "90": 
            result = extrapolate_func(int(request.json["window"]), "AAPL", "best_weights/best_weights_AAPL_wsize90.hdf5",
            "best_weights/AAPL_wsize90_sc_dict.p", f'{request.json["company"]}_{request.json["window"]}_5weeks.csv', "stock_data/apple/",
            "reddit/AAPL/", "twitter/AAPL/", [2019])
    elif request.json["company"] == "Microsoft":
        if request.json["window"] == "30":
            result = extrapolate_func(int(request.json["window"]), "MSFT", "best_weights/best_weights_MSFT_wsize30.hdf5",
            "best_weights/MSFT_wsize30_sc_dict.p", f'{request.json["company"]}_{request.json["window"]}_5weeks.csv', "stock_data/microsoft/",
            "reddit/MSFT/", "twitter/MSFT/", [2019])
        elif request.json["window"] == "60": 
            result = extrapolate_func(int(request.json["window"]), "MSFT", "best_weights/best_weights_MSFT_wsize60.hdf5",
            "best_weights/MSFT_wsize60_sc_dict.p", f'{request.json["company"]}_{request.json["window"]}_5weeks.csv', "stock_data/microsoft/",
            "reddit/MSFT/", "twitter/MSFT/", [2019])
        elif request.json["window"] == "90": 
            result = extrapolate_func(int(request.json["window"]), "MSFT", "best_weights/best_weights_MSFT_wsize90.hdf5",
            "best_weights/MSFT_wsize90_sc_dict.p", f'{request.json["company"]}_{request.json["window"]}_5weeks.csv', "stock_data/microsoft/",
            "reddit/MSFT/", "twitter/MSFT/", [2019])
    elif request.json["company"] == "Google":
        if request.json["window"] == "30":
            result = extrapolate_func(int(request.json["window"]), "GOOGL", "best_weights/best_weights_GOOGL_wsize30.hdf5",
            "best_weights/GOOGL_wsize30_sc_dict.p", f'{request.json["company"]}_{request.json["window"]}_5weeks.csv', "stock_data/google/",
            "reddit/GOOGL/", "twitter/GOOGL/", [2019])
        elif request.json["window"] == "60": 
            result = extrapolate_func(int(request.json["window"]), "GOOGL", "best_weights/best_weights_GOOGL_wsize60.hdf5",
            "best_weights/GOOGL_wsize60_sc_dict.p", f'{request.json["company"]}_{request.json["window"]}_5weeks.csv', "stock_data/google/",
            "reddit/GOOGL/", "twitter/GOOGL/", [2019])
        elif request.json["window"] == "90": 
            result = extrapolate_func(int(request.json["window"]), "GOOGL", "best_weights/best_weights_GOOGL_wsize90.hdf5",
            "best_weights/GOOGL_wsize90_sc_dict.p", f'{request.json["company"]}_{request.json["window"]}_5weeks.csv', "stock_data/google/",
            "reddit/GOOGL/", "twitter/GOOGL/", [2019])
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)