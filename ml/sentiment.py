# TourismOS - Machine Learning NLP Sentiment Analysis Module
# Classifies tourist feedback text into Positive, Neutral, Negative and scores topics.

class NLPSentimentEngine:
    TOPICS = {
        "cleanliness": ["clean", "dirty", "hygiene", "garbage", "washroom", "neat"],
        "food": ["food", "restaurant", "taste", "delicious", "breakfast", "dinner"],
        "wifi": ["wifi", "internet", "signal", "connection", "net", "network"],
        "staff": ["staff", "service", "friendly", "polite", "manager", "host"]
    }
    
    POSITIVE = ["good", "great", "excellent", "beautiful", "amazing", "friendly", "clean"]
    NEGATIVE = ["bad", "worst", "dirty", "slow", "broken", "wifi", "poor", "expensive"]

    @classmethod
    def analyze(cls, text):
        text_lower = text.lower()
        
        # Simple token scoring
        pos_score = sum(1 for w in cls.POSITIVE if w in text_lower)
        neg_score = sum(1 for w in cls.NEGATIVE if w in text_lower)
        
        score = pos_score - neg_score
        sentiment = "Neutral"
        if score > 0:
            sentiment = "Positive"
        elif score < 0:
            sentiment = "Negative"
            
        # Match topic relevance
        matched_topics = {}
        for topic, keywords in cls.TOPICS.items():
            matches = sum(1 for kw in keywords if kw in text_lower)
            matched_topics[topic] = min(1.0, matches * 0.5) # normalized score
            
        return {
            "text": text,
            "sentiment": sentiment,
            "topic_scores": matched_topics
        }

if __name__ == "__main__":
    test_reviews = [
        "The hotel was extremely clean and the food was delicious. Very happy!",
        "Poor room service. The wifi was broken and disconnected constantly. Bad experience."
    ]
    
    print("Executing Standalone NLP Review Analysis Verification:\n")
    for tr in test_reviews:
        res = NLPSentimentEngine.analyze(tr)
        print(f"Review: \"{res['text']}\"")
        print(f"  Sentiment: {res['sentiment']}")
        print(f"  Topic Scores: {res['topic_scores']}")
        print()
