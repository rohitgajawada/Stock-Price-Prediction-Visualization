import keras
from keras.models import Sequential
from keras.layers import Dense
from keras.layers import LSTM
from keras.layers import Dropout
from keras.layers import *

def get_LSTM_model(window_size, dim_size):

    model = Sequential()

    model.add(LSTM(units = 50, return_sequences = True, input_shape = (window_size, dim_size))) # X_train.shape[1]
    model.add(Dropout(0.2))

    model.add(LSTM(units = 50, return_sequences = True))
    model.add(Dropout(0.2))

    model.add(LSTM(units = 50, return_sequences = True))
    model.add(Dropout(0.2))

    model.add(LSTM(units = 50))
    model.add(Dropout(0.2))

    model.add(Dense(units = 1))

    model.compile(optimizer = 'adam', loss = 'mean_squared_error', metrics=[keras.metrics.MeanSquaredError()])

    return model