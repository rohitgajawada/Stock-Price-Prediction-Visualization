from models_keras import get_LSTM_model
from data_proc import load_data
from utils import init_scalers, fit_scalers, transform_scalers, viz_test_vs_pred

import math
import matplotlib.pyplot as plt
import keras as keras
import pandas as pd
import numpy as np
import pickle
import random

from sklearn.preprocessing import MinMaxScaler
import argparse


def extrapolate_func(window_size, company, modelpath, scpath, fdpath, stockdir, redditdir, twitterdir, years):

    ############### Model loading ####################

    model = get_LSTM_model(window_size, 11)
    model.load_weights(modelpath)

    sc_dict = pickle.load(open(scpath, "rb"))

    #### Get last entry from train data to kick start test data
    dates_pre_test, X_pre_test_indi = load_data(company, stockdir, redditdir, twitterdir, [years[0] - 1], ['Close','positive_reddit','negative_reddit', 'neutral_reddit', 'count_reddit', 'positive_twitter', 'negative_twitter','neutral_twitter', 'count_twitter', 'retweet_num_twitter', 'like_num_twitter'])

    ############### Evaluate on test set (remove this later) ####################
    dates_test, X_test_indi = load_data(company, stockdir, redditdir, twitterdir, years, ['Close','positive_reddit','negative_reddit', 'neutral_reddit', 'count_reddit', 'positive_twitter', 'negative_twitter','neutral_twitter', 'count_twitter', 'retweet_num_twitter', 'like_num_twitter'])

    dates_pre_test_win = dates_pre_test[-window_size:]
    X_pre_test_indi_win = X_pre_test_indi[-window_size:]

    dates_test = dates_pre_test_win + dates_test
    X_test_indi = np.concatenate((X_pre_test_indi_win, X_test_indi))



    # print(dates_test)
    print(len(dates_test))
    print(X_test_indi.shape)
    # exit()

    ## test: Scale data, combine data into sequences then send into the model (remove this later)
    X_test_indi = transform_scalers(X_test_indi, sc_dict)

    X_test_orig = []
    y_test_orig = []
    for i in range(window_size, X_test_indi.shape[0]):
        X_test_orig.append(X_test_indi[i-window_size:i, :])
        y_test_orig.append(X_test_indi[i, :][0]) # just closing price

    ### All test elements
    X_test_prev, y_test_prev = np.array(X_test_orig), np.array(y_test_orig)
    predicted_stock_price_prev = model.predict(X_test_prev)
    predicted_stock_price_prev = sc_dict["Close"].inverse_transform(predicted_stock_price_prev.reshape(-1, 1)).reshape(-1)
    y_test_prev = sc_dict["Close"].inverse_transform(y_test_prev.reshape(-1, 1)).reshape(-1)

    ## Get the last element for extrapolating
    X_test_elem, y_test_elem = np.array(X_test_orig[-1]), np.array(y_test_orig[-1])
    X_test_elem = np.expand_dims(X_test_elem, axis=0)
    y_test_elem = np.expand_dims(y_test_elem, axis=0)
    print(X_test_elem.shape, y_test_elem.shape)
    print(X_test_elem, y_test_elem)

    X_test_curr = X_test_elem
    curr_date = dates_test[-1]

    last_entry = X_test_curr[0][-1].reshape(1, 1, -1)

    future_dates = []
    y_future_preds = []

    future_df = pd.read_csv(fdpath, sep=',').values
    num_weeks_future = future_df.shape[0]

    def calc_ratios_from_score(sent_score):

        pos_score, neutral_score, neg_score = 0.05, 0.05, 0.05
        sent_score = max(sent_score, 0)

        if sent_score > 0.75:
            pos_score = (sent_score - 0.75) / 0.25
            neutral_score = (3/4) * (1 - pos_score)
            neg_score = (1/4) * (1 - pos_score)

        elif sent_score < 0.25:
            neg_score = (0.25 - sent_score) / 0.25
            neutral_score = (3/4) * (1 - neg_score)
            pos_score = (1/4) * (1 - neg_score)

        else:
            if sent_score < 0.5:
                neutral_score = (sent_score - 0.25) / 0.25
                neg_score = (3/4) * (1 - neutral_score)
                pos_score = (1/4) * (1 - neutral_score)
            else:
                neutral_score = (0.75 - sent_score) / 0.25
                pos_score = (3/4) * (1 - neutral_score)
                neg_score = (1/4) * (1 - neutral_score)

        pos_score += (np.random.rand(1)[0] / 20)
        neutral_score += (np.random.rand(1)[0] / 20)
        neg_score += (np.random.rand(1)[0] / 20)

        sum_total = pos_score + neutral_score + neg_score
        final_ratios = [pos_score / sum_total, neg_score / sum_total, neutral_score / sum_total] 

        return final_ratios
            

    for i in range(num_weeks_future - 1):

        curr_date = curr_date + pd.to_timedelta(2, unit='d')
        curr_week_future = future_df[i]
        next_week_future = future_df[i+1]

        reddit_sents = np.linspace(curr_week_future[1], next_week_future[1], 5)
        reddit_counts = np.linspace(curr_week_future[2], next_week_future[2], 5)
        twitter_sents = np.linspace(curr_week_future[3], next_week_future[3], 5)
        twitter_counts = np.linspace(curr_week_future[4], next_week_future[4], 5)
        twitter_activity = np.linspace(curr_week_future[5], next_week_future[5], 5)

        for day in range(5):
            # get random noise
            rand_val = random.uniform(-1, 1) / 10
            rand_val_2 = random.uniform(-1, 1) / 10
            rand_val_3 = random.uniform(-1, 1) / 10
            rand_val_4 = random.uniform(-1, 1) / 10

            # create new entry
            curr_date = curr_date + pd.to_timedelta(1, unit='d')

            predicted_stock_price_norm = model.predict(X_test_curr)
            predicted_stock_price_curr = sc_dict["Close"].inverse_transform(predicted_stock_price_norm.reshape(-1, 1)).reshape(-1)

            future_dates.append(curr_date)
            y_future_preds.append(predicted_stock_price_curr)

            print(curr_date, predicted_stock_price_curr)

            # Add predicted close price at 0th position
            new_entry = last_entry.copy()
            new_entry[0][0][0] = predicted_stock_price_norm[0][0]

            # Add reddit pos, neg, neutral
            reddit_sent_ratios_day = calc_ratios_from_score(reddit_sents[day])
            # pos
            new_entry[0][0][1] = reddit_sent_ratios_day[0]
            # neg
            new_entry[0][0][2] = reddit_sent_ratios_day[1]
            # neutral
            new_entry[0][0][3] = reddit_sent_ratios_day[2]

            # Add count reddit
            reddit_ct_day = reddit_counts[day]
            new_entry[0][0][4] = reddit_ct_day + rand_val

            # Add twitter pos, neg, neutral
            twitter_sent_ratios_day = calc_ratios_from_score(twitter_sents[day])
            # pos
            new_entry[0][0][5] = twitter_sent_ratios_day[0]
            # neg
            new_entry[0][0][6] = twitter_sent_ratios_day[1]
            # neutral
            new_entry[0][0][7] = twitter_sent_ratios_day[2]

            # Add count twitter
            twitter_ct_day = twitter_counts[day]
            new_entry[0][0][8] = twitter_ct_day + rand_val_2

            # Add retweet twitter
            twitter_retweet_day = twitter_activity[day]
            new_entry[0][0][9] = twitter_retweet_day + rand_val_3

            # Add likes twitter
            twitter_likes_day = twitter_activity[day]
            new_entry[0][0][10] = twitter_likes_day + rand_val_4

            
            print(new_entry)
                

            X_test_curr = np.concatenate((X_test_curr, new_entry), axis=1)[:, 1:, :]


    # Plotting
    all_dates = dates_test[window_size:] + future_dates
    # print(all_dates)
    all_preds = np.concatenate((predicted_stock_price_prev, np.array(y_future_preds).reshape(-1))) 
    all_labels = np.concatenate((y_test_prev, np.array(y_future_preds).reshape(-1))) 
    print(len(all_dates))
    print(len(all_preds))
    print(len(all_labels))
    result = {"dates": all_dates, "actual": y_test_prev.tolist(), "pred": all_preds.tolist()}
    # for i in range(len(all_dates)):
    #     result(all_dates[i], all_preds[i], all_labels[i]))
    return result
    # plt.plot(all_dates, all_labels, color = "red", label = "Real Stock Price")
    # plt.plot(all_dates, all_preds, color = "blue", label = "Predicted Stock Price")

    # plt.xlabel('Time')
    # plt.ylabel('Stock Price')
    # plt.legend()
    # plt.show()

# print(extrapolate_func(90, "TSLA", "weights/best_weights_TSLA_wsize90.hdf5",
#             "weights/TSLA_wsize90_sc_dict.p", "Tesla_5_weeks.csv", "stock_data/tesla/",
#             "reddit/TSLA/", "twitter/TSLA/", [2019]))
# Parser
# parser = argparse.ArgumentParser()
# parser.add_argument('--window_size', default=100, type=int, help='window size')

# parser.add_argument('--company', type=str, help='company', required=True)
# parser.add_argument('--modelpath', type=str, help='model path', required=True)
# parser.add_argument('--scpath', type=str, help='scaler path', required=True)
# parser.add_argument('--fdpath', type=str, help='future data csv path', required=True)

# # Remove this later and just use one entry in a csv
# parser.add_argument('--stockdir', type=str, help='stock')
# parser.add_argument('--redditdir', type=str, help='reddit')
# parser.add_argument('--twitterdir', type=str, help='twitter')
# parser.add_argument('--years', nargs='+', help='Years')

# args = parser.parse_args()
# args.years = [int(year) for year in args.years]

# extrapolate_func(args.window_size, args.company, args.modelpath, args.scpath, args.fdpath, args.stockdir, args.redditdir, args.twitterdir, args.years)

    

