import joblib
import re
import pandas as pd

# Load profanity data
profanity_data = pd.read_csv("data/profanity_en.csv")

# Load RandomForestClassifier model for comment moderation
model = joblib.load('models/hate_speech_model.pkl')
vectorizer = joblib.load('models/vectorizer.pkl')

# Cleans text so it can be inputted into model
def clean_text(text):
    text = re.sub(r'[^\w\s]', '', text)
    text = text.lower()
    return text

# Runs comment through classification model, returning True if classified as hate speech
def is_hate_speech(comment):
    cleaned_comment = clean_text(comment)
    vec_comment = vectorizer.transform([cleaned_comment])
    prediction = model.predict(vec_comment)
    return prediction[0] == 1

# Checks for profanity from profanity dataset
def contains_obscene(comment, profanity_data=profanity_data):
    profanity_set = set(word.lower() for word in profanity_data["text"])
    words = comment.lower().split()
    
    for word in words:
        if word in profanity_set:
            return True
    return False


# Checks for hate speech or profanity using above functions
def moderate_comment(comment):
    if contains_obscene(comment):
        return True
    if is_hate_speech(comment):
        return True
    else:
        return False