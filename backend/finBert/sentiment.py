from nltk.tokenize import sent_tokenize
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import pandas as pd
import numpy as np
import torch 
import re


# UTILITY FUNCTIONS 
class InputExample(object):
    """A single training/test example for simple sequence classification."""

    def __init__(self, guid, text, label=None, agree=None):
        """
        Constructs an InputExample
        Parameters
        ----------
        guid: str
            Unique id for the examples
        text: str
            Text for the first sequence.
        label: str, optional
            Label for the example.
        agree: str, optional
            For FinBERT , inter-annotator agreement level.
        """
        self.guid = guid
        self.text = text
        self.label = label
        self.agree = agree
  
class InputFeatures(object):
    """
    A single set of features for the data.
    """

    def __init__(self, input_ids, attention_mask, token_type_ids, label_id, agree=None):
        self.input_ids = input_ids
        self.attention_mask = attention_mask
        self.token_type_ids = token_type_ids
        self.label_id = label_id
        self.agree = agree

def chunks(l, n):
    """
    Simple utility function to split a list into fixed-length chunks.
    Parameters
    ----------
    l: list
        given list
    n: int
        length of the sequence
    """
    for i in range(0, len(l), n):
        # Create an index range for l of n items:
        yield l[i:i + n]

def softmax(x):
    """Compute softmax values for each sets of scores in x."""
    e_x = np.exp(x - np.max(x, axis=1)[:, None])
    return e_x / np.sum(e_x, axis=1)[:, None]

def convert_examples_to_features(examples, label_list, max_seq_length, tokenizer, mode='classification'):
    """
    Loads a data file into a list of InputBatch's. With this function, the InputExample's are converted to features
    that can be used for the model. Text is tokenized, converted to ids and zero-padded. Labels are mapped to integers.

    Parameters
    ----------
    examples: list
        A list of InputExample's.
    label_list: list
        The list of labels.
    max_seq_length: int
        The maximum sequence length.
    tokenizer: BertTokenizer
        The tokenizer to be used.
    mode: str, optional
        The task type: 'classification' or 'regression'. Default is 'classification'

    Returns
    -------
    features: list
        A list of InputFeature's, which is an InputBatch.
    """

    if mode == 'classification':
        label_map = {label: i for i, label in enumerate(label_list)}
        label_map[None] = 9090

    features = []
    for (ex_index, example) in enumerate(examples):
        tokens = tokenizer.tokenize(example.text)

        if len(tokens) > max_seq_length - 2:
            tokens = tokens[:(max_seq_length // 4) - 1] + tokens[
                                                          len(tokens) - (3 * max_seq_length // 4) + 1:]

        tokens = ["[CLS]"] + tokens + ["[SEP]"]

        token_type_ids = [0] * len(tokens)

        input_ids = tokenizer.convert_tokens_to_ids(tokens)

        attention_mask = [1] * len(input_ids)

        padding = [0] * (max_seq_length - len(input_ids))
        input_ids += padding
        attention_mask += padding


        token_type_ids += padding

        assert len(input_ids) == max_seq_length
        assert len(attention_mask) == max_seq_length
        assert len(token_type_ids) == max_seq_length

        if mode == 'classification':
            label_id = label_map[example.label]
        elif mode == 'regression':
            label_id = float(example.label)
        else:
            raise ValueError("The mode should either be classification or regression. You entered: " + mode)

        agree = example.agree
        mapagree = {'0.5': 1, '0.66': 2, '0.75': 3, '1.0': 4}
        try:
            agree = mapagree[agree]
        except:
            agree = 0

        features.append(
            InputFeatures(input_ids=input_ids,
                          attention_mask=attention_mask,
                          token_type_ids=token_type_ids,
                          label_id=label_id,
                          agree=agree))
    return features

def get_prediction(text_list):
  # Load model
  tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
  model = AutoModelForSequenceClassification.from_pretrained('finBert/model/',num_labels=3,cache_dir=None)

  
  # Get prediction
  model.eval()
  label_list = ['positive', 'negative', 'neutral']
  label_dict = {0: 'positive', 1: 'negative', 2: 'neutral'}
  sentiment = []

  for text in text_list:
    # Preprocess text
    text = re.sub(r'[^\w\s]', '', text)
    text += '.'
    sentences = sent_tokenize(text)
    examples = [InputExample(str(i), sentence) for i, sentence in enumerate(sentences)]
    features = convert_examples_to_features(examples, label_list, 64, tokenizer)
    all_input_ids = torch.tensor([f.input_ids for f in features], dtype=torch.long)
    all_attention_mask = torch.tensor([f.attention_mask for f in features], dtype=torch.long)
    all_token_type_ids = torch.tensor([f.token_type_ids for f in features], dtype=torch.long)
    with torch.no_grad():
      logits = model(all_input_ids, all_attention_mask, all_token_type_ids)[0]
      logits = softmax(np.array(logits))
      predictions = np.squeeze(np.argmax(logits, axis=1))
      sentiment.append(label_dict[int(predictions)])
  return sentiment

#text = ["Dogecoin Breaks Past The 20 Cents Mark In Dizzying Rally With 'Earnings Report' Achievement Unlocked $DOGE $BTC… https://t.co/DUQt8r2m70", "hi"] 
#print(get_prediction(text))

