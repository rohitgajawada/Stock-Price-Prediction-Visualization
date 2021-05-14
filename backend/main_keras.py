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
parser.add_argument('--num_epochs', default=100, type=int, help='num epochs')

parser.add_argument('--company', type=str, help='company', required=True)
parser.add_argument('--stockdir', type=str, help='stock', required=True)
parser.add_argument('--redditdir', type=str, help='reddit', required=True)
parser.add_argument('--twitterdir', type=str, help='twitter', required=True)
parser.add_argument('--trainyears', nargs='+', help='Years', required=True)
parser.add_argument('--testyears', nargs='+', help='Years', required=True)

args = parser.parse_args()

### Default parameters ###
window_size = int(args.window_size)
title = "TSLA_wsize" + str(window_size)
args.trainyears = [int(year) for year in args.trainyears]
args.testyears = [int(year) for year in args.testyears]

print(title)
print(args.trainyears)
print(args.testyears)

############### Dataloading ####################
## Implement load_data function
## If you are changing fields, you need to change the indices in utils.py fit scalers as well as the label index when making label sets

dates_train, X_train_indi = load_data(args.company, args.stockdir, args.redditdir, args.twitterdir, args.trainyears, ['Close','positive_reddit','negative_reddit', 'neutral_reddit', 'count_reddit', 'positive_twitter', 'negative_twitter','neutral_twitter', 'count_twitter', 'retweet_num_twitter', 'like_num_twitter'])

dates_test, X_test_indi = load_data(args.company, args.stockdir, args.redditdir, args.twitterdir, args.testyears, ['Close','positive_reddit','negative_reddit', 'neutral_reddit', 'count_reddit', 'positive_twitter', 'negative_twitter','neutral_twitter', 'count_twitter', 'retweet_num_twitter', 'like_num_twitter'])

# dates_train, X_train_indi = load_data("TSLA", 'stock_data/tesla/', "reddit/TSLA/","twitter/TSLA/", [2015, 2016, 2017, 2018], ['Close','positive_reddit','negative_reddit', 'neutral_reddit', 'count_reddit', 'positive_twitter', 'negative_twitter','neutral_twitter', 'count_twitter', 'retweet_num_twitter', 'like_num_twitter'])

# dates_test, X_test_indi = load_data("TSLA", 'stock_data/tesla/', "reddit/TSLA/","twitter/TSLA/", [2019], ['Close','positive_reddit','negative_reddit', 'neutral_reddit', 'count_reddit', 'positive_twitter', 'negative_twitter','neutral_twitter', 'count_twitter', 'retweet_num_twitter', 'like_num_twitter'])


## train: Scale data, combine data into sequences then send into the model
sc_dict = init_scalers()
X_train_indi, sc_dict = fit_scalers(X_train_indi, sc_dict)

X_train = []
y_train = []
for i in range(window_size, X_train_indi.shape[0]):
    X_train.append(X_train_indi[i-window_size:i, :])
    y_train.append(X_train_indi[i, :][0]) # just closing price

X_train, y_train = np.array(X_train), np.array(y_train)
print(X_train.shape, y_train.shape)

## test: Scale data, combine data into sequences then send into the model
X_test_indi = transform_scalers(X_test_indi, sc_dict)

X_test = []
y_test = []
for i in range(window_size, X_test_indi.shape[0]):
    X_test.append(X_test_indi[i-window_size:i, :])
    y_test.append(X_test_indi[i, :][0]) # just closing price

X_test, y_test = np.array(X_test), np.array(y_test)
print(X_test.shape, y_test.shape)

############### Model setup and train ####################

model = get_LSTM_model(X_train.shape[1], X_train.shape[2])

# Callbacks
best_weights_filepath = './weights/best_weights_' + str(title) + '.hdf5'
earlyStopping = keras.callbacks.EarlyStopping(monitor='val_loss', patience=10, verbose=1, mode='auto')
saveBestModel = keras.callbacks.ModelCheckpoint(best_weights_filepath, monitor='val_loss', verbose=1, save_best_only=True, mode='auto')

# Fitting the model to the Training set
hist_train = model.fit(X_train, y_train, epochs = args.num_epochs, batch_size = 16, shuffle=True, validation_data=(X_test, y_test), callbacks=[earlyStopping, saveBestModel])

pickle.dump(sc_dict, open('./weights/' + title + "_sc_dict.p", "wb"))

############### Testing and Viz ####################
#reload best weights
model.load_weights(best_weights_filepath)
sc_dict = pickle.load(open('./weights/' + title + "_sc_dict.p", "rb" ) )

predicted_stock_price = model.predict(X_test)
hist_test = model.evaluate(X_test, y_test)

#Rescale stock prices
predicted_stock_price = sc_dict["Close"].inverse_transform(predicted_stock_price.reshape(-1, 1)).reshape(-1)
y_test = sc_dict["Close"].inverse_transform(y_test.reshape(-1, 1)).reshape(-1)

RMSE_score = (np.sum(np.power(y_test - predicted_stock_price, 2))) / y_test.shape[0]
RMSE_score = np.sqrt(RMSE_score)

print("RMSE is {}".format(RMSE_score))

viz_test_vs_pred(title + " -- RMSE: {:.2f}".format(RMSE_score), dates_test[window_size:], y_test, predicted_stock_price)
