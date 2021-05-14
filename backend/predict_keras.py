from models_keras import get_LSTM_model
from data_proc import load_data
from utils import init_scalers, fit_scalers, transform_scalers, viz_test_vs_pred

import math
import matplotlib.pyplot as plt
import keras as keras
import pandas as pd
import numpy as np
import pickle

from sklearn.preprocessing import MinMaxScaler
import argparse

# Parser
parser = argparse.ArgumentParser()
parser.add_argument('--window_size', default=100, type=int, help='window size')
parser.add_argument('--company', type=str, help='company', required=True)
parser.add_argument('--modelpath', type=str, help='model path', required=True)
parser.add_argument('--scpath', type=str, help='scaler path', required=True)

parser.add_argument('--stockdir', type=str, help='stock')
parser.add_argument('--redditdir', type=str, help='reddit')
parser.add_argument('--twitterdir', type=str, help='twitter')
parser.add_argument('--years', nargs='+', help='Years')

args = parser.parse_args()
args.years = [int(year) for year in args.years]

############### Model loading ####################

model = get_LSTM_model(args.window_size, 11)
model.load_weights(args.modelpath)

sc_dict = pickle.load(open(args.scpath, "rb"))

#### Get last entry from train data to kick start test data
dates_pre_test, X_pre_test_indi = load_data(args.company, args.stockdir, args.redditdir, args.twitterdir, [args.years[0] - 1], ['Close','positive_reddit','negative_reddit', 'neutral_reddit', 'count_reddit', 'positive_twitter', 'negative_twitter','neutral_twitter', 'count_twitter', 'retweet_num_twitter', 'like_num_twitter'])

############### Evaluate on test set ####################
dates_test, X_test_indi = load_data(args.company, args.stockdir, args.redditdir, args.twitterdir, args.years, ['Close','positive_reddit','negative_reddit', 'neutral_reddit', 'count_reddit', 'positive_twitter', 'negative_twitter','neutral_twitter', 'count_twitter', 'retweet_num_twitter', 'like_num_twitter'])

dates_pre_test_win = dates_pre_test[-args.window_size:]
X_pre_test_indi_win = X_pre_test_indi[-args.window_size:]

dates_test = dates_pre_test_win + dates_test
X_test_indi = np.concatenate((X_pre_test_indi_win, X_test_indi))

## test: Scale data, combine data into sequences then send into the model
X_test_indi = transform_scalers(X_test_indi, sc_dict)

X_test = []
y_test = []
for i in range(args.window_size, X_test_indi.shape[0]):
    X_test.append(X_test_indi[i-args.window_size:i, :])
    y_test.append(X_test_indi[i, :][0]) # just closing price

X_test, y_test = np.array(X_test), np.array(y_test)
print(X_test.shape, y_test.shape)

predicted_stock_price = model.predict(X_test)
hist_test = model.evaluate(X_test, y_test)

predicted_stock_price = sc_dict["Close"].inverse_transform(predicted_stock_price.reshape(-1, 1)).reshape(-1)
y_test = sc_dict["Close"].inverse_transform(y_test.reshape(-1, 1)).reshape(-1)

RMSE_score = (np.sum(np.power(y_test - predicted_stock_price, 2))) / y_test.shape[0]
RMSE_score = np.sqrt(RMSE_score)

print("RMSE is {}".format(RMSE_score))

viz_test_vs_pred("RMSE: {:.2f}".format(RMSE_score), dates_test[args.window_size:], y_test, predicted_stock_price)


