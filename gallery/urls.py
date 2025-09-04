from django.urls import path
from . import views

urlpatterns = [
    path("", views.en_gallery, name="gallery"),
    path('EN/gallery.html', views.en_gallery, name="en_gallery"),
]