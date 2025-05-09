from django.urls import path
from .views import check_plagiarism

urlpatterns = [
    path("api/check-plagiarism/", check_plagiarism, name="check_plagiarism"),
]
