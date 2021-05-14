# Stock Visualization

# React + D3 + Flask Project

CSE 6242 project Stock price prediction tool

React + D3 + Flask project.
Note: you will need to download files from the provided links in order to make the code run.

![alt text](https://i.imgur.com/YuE6Vns.png)

## Description

This package contains all the code necessary to run our Stock Visualization UI. It contains a backend written in Python Flask that contains our machine learning models and weights. It also contains a frontend written in React that has our visualizations.

The backend contains our trained machine learning models which are LSTMs with different window sizes trained on financial and sentiment data for five stocks. We extract sentiment with the help of finBERT.

The frontend contains visualizations that will help someone analyze stock price versus sentiment, predict future stock prices by giving future predictions of sentiment, and help determine sentiment over the past week on Twitter for a certain stock.

## Installation

### Backend

1. Download the pytorch_model.bin file from here
   https://drive.google.com/file/d/1BZjW13BIMty_WhPx7uabzC7Kp6wPGtpK/view?usp=sharing

2. Place the downloaded file in the backend/finBert/model/ directory (relatively backend/finBert/model). This model is around 400 MB.
   This directory should now have 2 files config.json, pytorch_model.bin
3. Download the archive.zip file from here
   https://drive.google.com/file/d/1ApRVntmOTog9XyfVavP7SuaFFlGOMUul/view?usp=sharing

4. Unzip the archive folder and move the 3 directories twitter, reddit, stock_data
   into the backend directory. These 3 directories are around 1.3 GB total.

5. The backend server is run using pipenv please ensure you have
   python 3.7 and pipenv on your computer
   https://www.python.org/downloads/release/python-370/
   https://pypi.org/project/pipenv/

6. Enter backend directory `cd backend`
7. Rename .env.example to .env `mv .env.example .env`
8. Run `pipenv --python 3.7`
9. Run `pipenv install`
10. Run `pipenv run dev` (Ignore any errors related to GPU)
11. Now the backend server is running on http://localhost:5000

#### NOTE

This repo uses a .env file in the backend folder which contains my credentials in order to use the Twitter API.
These credentials will be valid until May 7, 2021. After this date you will need to apply for a twitter developer
account, create a project, and generate your own credentials to store in the .env file.
https://cran.r-project.org/web/packages/rtweet/vignettes/auth.html

### Frontend

Please make sure you have Node.js with npm and yarn installed and it is updated to the most
recent stable release.

Open Terminal

#### With yarn

1. Enter frontend directory `cd frontend`
2. Run `yarn install`
3. Run `yarn start`
4. It might take a couple of min to start, if the window does not open automatically navigate to localhost:3000.

## Execution

The first graph is the Financial dashboard. Here the user can select a company and view detailed information about the stock price and sentiment on a particular day. They can see the breakdown of sentiments from tweets that day and can adjust the time period to get a detailed view.

The second graph is the Prediction graph. Here the user can experiment with different sentiment related settings to analyze predictions about the future price of a stock. The user can fine tune sentiment on a week by week basis for a certain company and see our predicted average price for that week given the user inputs. The user can see a graph that shows our prediction model for the past year to inspire confidence in the model and can then see the prediction. This graph simulates the current date as being the start of January 2020.

The third graph is the Recent Sentiment graph. This allows the user to enter any stock ticker and see how sentiment is about that ticker on Twitter over the past 7 days. This allows users to get an idea about how sentiment looks right now. This graph is limited because we are using the free version of twitter API which only returns 100 results per request and we are filtering by their definition of “popular” tweets which have a certain number of favorites. This is done to ensure we are not only analyzing 100 tweets from the current day with little to none activity. However, expanding this functionality with the correct Twitter API credentials (pro or educational account) would expand the number of results returned from these queries, but getting the sentiment using our model would take longer.

#### Note to use the third graph please use UPPERCASE stock symbols with no special characters such as '$'

## Instructions to load data and running training data

All the data will now be at this link: https://drive.google.com/drive/folders/1RQlCXTDjg-_fbt9_nhTIWSsGnP4_sh4K?usp=sharing

To get the data:

1. Download the twitter(`company_tweets_2015_to_2019.csv`, e.g. `TSLA_tweets_2015_to_2019.csv`) and reddit data(`company_reddit_2015_to_2019.csv`, e.g. `TSLA_reddit_2015_to_2019.csv`) from google drive and put it in the same path as starter_code.
2. Run `starter_code.py company` or any other company (should enter the stock name). It creates two directories (`twitter/company/` and `reddit/company/`) and adds the data for each year to those directories.
3. Run `load_data.py` with the following arguments: `load_data(stock_name, stock_path, reddit_path, twitter_path, year_list, return_columns_list)`

- For example, for getting data of TSLA for years 2015 to 1018 and the desired outputs listed below, run `load_data("TSLA", "stock_data/tesla/", "reddit/TSLA/", "twitter/TSLA/", [2015, 2016, 2017, 2018], ['Close','positive_reddit','negative_reddit', 'neutral_reddit', 'count_reddit','comment_num_reddit', 'positive_twitter', 'negative_twitter','neutral_twitter', 'count_twitter', 'comment_num_twitter','retweet_num_twitter', 'like_num_twitter'])`
- If you want all the columns in the returned array, pass an empty list `[]` as `return_columns_list` in `load_data()`.

After setting up the data and you know the stock data path, reddit data path and twitter data path for the companies you want to train models on:

1. Use the training command: `python3 main_keras.py --window_size 90 --company TSLA --stockdir stock_data/tesla/ --redditdir reddit/TSLA/ --twitterdir twitter/TSLA/ --trainyears 2015 2016 2017 2018 --testyears 2019` . This example trains a model on TESLA with window size 90 for 2015 - 2018 and evaluates on 2019.
2. Use the prediction command: `python3 predict_keras.py --window_size 90 --company TSLA --modelpath weights/best_weights_TSLA_wsize90.hdf5 --scpath weights/TSLA_wsize90_sc_dict.p --stockdir stock_data/tesla/ --redditdir reddit/TSLA/ --twitterdir twitter/TSLA/ --years 2019` . Make sure to give the right model path and scaler path for the arguments provided.
3. For predicting into the future, you can use the extrapolate_backend script: `python3 extrapolate_backend.py --window_size 90 --company TSLA --modelpath weights/best_weights_TSLA_wsize90.hdf5 --scpath weights/TSLA_wsize90_sc_dict.p --fdpath Tesla_5_weeks.csv --stockdir stock_data/tesla/ --redditdir reddit/TSLA/ --twitterdir twitter/TSLA/ --years 2019`

#### Note

Our D3 visualizations uses code from
https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172
https://gist.github.com/EfratVil/92f894ac0ba265192411e73f633a3e2f
http://bl.ocks.org/Potherca/b9f8b3d0a24e0b20f16d
http://bl.ocks.org/williaster/10ef968ccfdc71c30ef8
https://github.com/arnauddri/d3-stock
https://www.d3-graph-gallery.com/graph/line_basic.html
https://bl.ocks.org/ProQuestionAsker/8382f70af7f4a7355827c6dc4ee8817d
