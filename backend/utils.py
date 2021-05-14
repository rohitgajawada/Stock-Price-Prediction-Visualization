import matplotlib.pyplot as plt
import numpy as np
from sklearn.preprocessing import MinMaxScaler

def init_scalers():

    return {
        "Close": MinMaxScaler(feature_range = (0, 1)),
        "count_reddit": MinMaxScaler(feature_range = (0, 1)),
        "count_twitter": MinMaxScaler(feature_range = (0, 1)),
        "retweet_num_twitter": MinMaxScaler(feature_range = (0, 1)),
        "like_num_twitter": MinMaxScaler(feature_range = (0, 1)),
    } 


def fit_scalers(X_train_indi, sc_dict):

    X_train_indi[:, 0] = sc_dict["Close"].fit_transform(X_train_indi[:, 0].reshape(-1, 1)).reshape(-1)
    X_train_indi[:, 4] = sc_dict["count_reddit"].fit_transform(X_train_indi[:, 4].reshape(-1, 1)).reshape(-1)
    X_train_indi[:, 8] = sc_dict["count_twitter"].fit_transform(X_train_indi[:, 8].reshape(-1, 1)).reshape(-1)
    X_train_indi[:, 9] = sc_dict["retweet_num_twitter"].fit_transform(X_train_indi[:, 9].reshape(-1, 1)).reshape(-1)
    X_train_indi[:, 10] = sc_dict["like_num_twitter"].fit_transform(X_train_indi[:, 10].reshape(-1, 1)).reshape(-1)

    return X_train_indi, sc_dict

def transform_scalers(X_train_indi, sc_dict):

    X_train_indi[:, 0] = sc_dict["Close"].transform(X_train_indi[:, 0].reshape(-1, 1)).reshape(-1)
    X_train_indi[:, 4] = sc_dict["count_reddit"].transform(X_train_indi[:, 4].reshape(-1, 1)).reshape(-1)
    X_train_indi[:, 8] = sc_dict["count_twitter"].transform(X_train_indi[:, 8].reshape(-1, 1)).reshape(-1)
    X_train_indi[:, 9] = sc_dict["retweet_num_twitter"].transform(X_train_indi[:, 9].reshape(-1, 1)).reshape(-1)
    X_train_indi[:, 10] = sc_dict["like_num_twitter"].transform(X_train_indi[:, 10].reshape(-1, 1)).reshape(-1)

    return X_train_indi

def viz_test_vs_pred(title, dates, dataset_test, predicted_stock_price, show=True):

    # Visualising the results
    plt.plot(dates, dataset_test, color = "red", label = "Real Stock Price")
    plt.plot(dates, predicted_stock_price, color = "blue", label = "Predicted Stock Price")

    plt.title(title)
    plt.xlabel('Time')
    plt.ylabel('Stock Price')
    plt.legend()

    if show:
        plt.show()
    else:
        plt.savefig('./plots/' + title + '.png')