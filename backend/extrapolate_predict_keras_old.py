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
parser.add_argument('--futuredays', default=100, type=int, help='window size')
parser.add_argument('--futuresentiment', type=str, help='positive | negative | neutral', required=True)

parser.add_argument('--company', type=str, help='company', required=True)
parser.add_argument('--modelpath', type=str, help='model path', required=True)
parser.add_argument('--scpath', type=str, help='scaler path', required=True)

# Remove this later and just use one entry in a csv
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

############### Evaluate on test set (remove this later) ####################
dates_test, X_test_indi = load_data(args.company, args.stockdir, args.redditdir, args.twitterdir, args.years, ['Close','positive_reddit','negative_reddit', 'neutral_reddit', 'count_reddit', 'positive_twitter', 'negative_twitter','neutral_twitter', 'count_twitter', 'retweet_num_twitter', 'like_num_twitter'])

## test: Scale data, combine data into sequences then send into the model (remove this later)
X_test_indi = transform_scalers(X_test_indi, sc_dict)

X_test_orig = []
y_test_orig = []
for i in range(args.window_size, X_test_indi.shape[0]):
    X_test_orig.append(X_test_indi[i-args.window_size:i, :])
    y_test_orig.append(X_test_indi[i, :][0]) # just closing price

### All test elements
X_test_prev, y_test_prev = np.array(X_test_orig), np.array(y_test_orig)
predicted_stock_price_prev = model.predict(X_test_prev)
predicted_stock_price_prev = sc_dict["Close"].inverse_transform(predicted_stock_price_prev.reshape(-1, 1)).reshape(-1)
y_test_prev = sc_dict["Close"].inverse_transform(y_test_prev.reshape(-1, 1)).reshape(-1)


# viz_test_vs_pred("trial", dates_test[args.window_size:], y_test_prev, predicted_stock_price_prev, True)
# print(dates_test)
# import pdb; pdb.set_trace()

## Get the last element for extrapolating
X_test_elem, y_test_elem = np.array(X_test_orig[-1]), np.array(y_test_orig[-1])
X_test_elem = np.expand_dims(X_test_elem, axis=0)
y_test_elem = np.expand_dims(y_test_elem, axis=0)
print(X_test_elem.shape, y_test_elem.shape)
print(X_test_elem, y_test_elem)

X_test_curr = X_test_elem
y_test_curr = y_test_elem
curr_date = dates_test[-1]

last_entry = X_test_curr[0][-1].reshape(1, 1, -1)

future_dates = []
y_future_preds = []

trial = args.futuresentiment

for i in range(args.futuredays):

    # ignoring weekends at the moment
    curr_date = curr_date + pd.to_timedelta(1, unit='d')

    predicted_stock_price_norm = model.predict(X_test_curr)
    predicted_stock_price_curr = sc_dict["Close"].inverse_transform(predicted_stock_price_norm.reshape(-1, 1)).reshape(-1)

    future_dates.append(curr_date)
    y_future_preds.append(predicted_stock_price_curr)

    print(curr_date, predicted_stock_price_curr)

    new_entry = last_entry.copy()
    new_entry[0][0][0] = predicted_stock_price_norm[0][0]

    if trial == "positive":
        rand_val = np.random.rand(1)[0] / 5
        rand_val2 = np.random.rand(1)[0] / 5

        new_entry[0][0][1] = 0.7 + rand_val 
        new_entry[0][0][2] = 0.15 - (rand_val / 2)
        new_entry[0][0][3] = 0.15 - (rand_val / 2)
        new_entry[0][0][5] = 0.7 + rand_val2 
        new_entry[0][0][6] = 0.15 - (rand_val2 / 2)
        new_entry[0][0][7] = 0.15 - (rand_val2 / 2)

    elif trial == "negative":

        rand_val = np.random.rand(1)[0] / 5
        rand_val2 = np.random.rand(1)[0] / 5

        new_entry[0][0][1] = 0.15 + (rand_val / 2) 
        new_entry[0][0][2] = 0.7 - rand_val
        new_entry[0][0][3] = 0.15 - (rand_val / 2)
        new_entry[0][0][5] = 0.15 + (rand_val2  / 2)
        new_entry[0][0][6] = 0.7 - rand_val2 
        new_entry[0][0][7] = 0.15 - (rand_val2 / 2)

    elif trial == "neutral":

        rand_val = np.random.rand(1)[0] / 5
        rand_val2 = np.random.rand(1)[0] / 5

        new_entry[0][0][1] = 0.15 + (rand_val / 2) 
        new_entry[0][0][2] = 0.15 - (rand_val / 2)
        new_entry[0][0][3] = 0.7 - rand_val
        
        new_entry[0][0][5] = 0.15 + (rand_val2  / 2)
        new_entry[0][0][6] = 0.15 - (rand_val2 / 2)
        new_entry[0][0][7] = 0.7 - rand_val2 
        

    X_test_curr = np.concatenate((X_test_curr, new_entry), axis=1)[:, 1:, :]


# Plotting
# import pdb; pdb.set_trace()

all_dates = dates_test[args.window_size:] + future_dates
all_preds = np.concatenate((predicted_stock_price_prev, np.array(y_future_preds).reshape(-1))) 
all_labels = np.concatenate((y_test_prev, np.array(y_future_preds).reshape(-1))) 

plt.plot(all_dates, all_labels, color = "red", label = "Real Stock Price")
plt.plot(all_dates, all_preds, color = "blue", label = "Predicted Stock Price")

# plt.title(title)
plt.xlabel('Time')
plt.ylabel('Stock Price')
plt.legend()
plt.show()



    

