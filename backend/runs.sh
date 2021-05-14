#!/bin/bash

python3 main_keras.py --window_size 90 --company TSLA --stockdir stock_data/tesla/ --redditdir reddit/TSLA/ --twitterdir twitter/TSLA/ --trainyears 2015 2016 2017 2018 --testyears 2019

python3 predict_keras.py --window_size 90 --company TSLA --modelpath weights/best_weights_TSLA_wsize90.hdf5 --scpath weights/TSLA_wsize90_sc_dict.p --stockdir stock_data/tesla/ --redditdir reddit/TSLA/ --twitterdir twitter/TSLA/ --years 2019

python3 extrapolate_backend.py --window_size 90 --company TSLA --modelpath weights/best_weights_TSLA_wsize90.hdf5 --scpath weights/TSLA_wsize90_sc_dict.p --fdpath Tesla_5_weeks.csv --stockdir stock_data/tesla/ --redditdir reddit/TSLA/ --twitterdir twitter/TSLA/ --years 2019