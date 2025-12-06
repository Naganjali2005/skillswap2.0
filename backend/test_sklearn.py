import sklearn
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

print("sklearn version:", sklearn.__version__)

a = np.array([[1.0, 0.0, 1.0]])
b = np.array([
    [1.0, 1.0, 0.0],
    [0.0, 1.0, 1.0],
])

print("cosine_similarity:\n", cosine_similarity(a, b))
