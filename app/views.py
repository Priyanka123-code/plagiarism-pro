import os
import pdfplumber
import docx
import numpy as np
from django.core.files.storage import default_storage
from rest_framework.decorators import api_view
from rest_framework.response import Response
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Load Sentence-BERT model (optimized for plagiarism detection)
model = SentenceTransformer('all-MiniLM-L6-v2')  # More accurate than paraphrase-MiniLM

# Function to extract text from uploaded files
def extract_text(file_path, file_type):
    text = ""
    try:
        if file_type == "pdf":
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    extracted_text = page.extract_text()
                    if extracted_text:
                        text += extracted_text + " "
        elif file_type == "docx":
            doc = docx.Document(file_path)
            text = " ".join([para.text for para in doc.paragraphs])
        elif file_type == "txt":
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
        else:
            return None
    except Exception as e:
        print(f"Error extracting text: {e}")
        return None
    return text.strip() if text else None

@api_view(['POST'])
def check_plagiarism(request):
    try:
        file1 = request.FILES.get("file1")
        file2 = request.FILES.get("file2")

        if not file1 or not file2:
            return Response({"error": "Both files are required"}, status=400)

        file_type1 = file1.name.split('.')[-1].lower()
        file_type2 = file2.name.split('.')[-1].lower()

        if file_type1 not in ["pdf", "docx", "txt"] or file_type2 not in ["pdf", "docx", "txt"]:
            return Response({"error": "Unsupported file type. Use PDF, DOCX, or TXT"}, status=400)

        # Save files temporarily
        file_path1 = default_storage.save(file1.name, file1)
        file_path2 = default_storage.save(file2.name, file2)

        # Extract text from files
        text1 = extract_text(file_path1, file_type1)
        text2 = extract_text(file_path2, file_type2)

        # Cleanup files
        os.remove(file_path1)
        os.remove(file_path2)

        if not text1 or not text2:
            return Response({"error": "Could not extract text from one or both files"}, status=400)

        # Generate embeddings using Sentence-BERT
        embeddings1 = model.encode([text1])
        embeddings2 = model.encode([text2])

        # Compute similarity using Cosine Similarity
        similarity_score = cosine_similarity(embeddings1, embeddings2)[0][0] * 100

        return Response({"similarity_score": round(similarity_score, 2)})

    except Exception as e:
        return Response({"error": f"An error occurred: {str(e)}"}, status=500)
