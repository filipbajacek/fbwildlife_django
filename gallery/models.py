from django.db import models

class Photo(models.Model):
    title_EN = models.CharField(max_length=100, default="title")
    title_SK = models.CharField(max_length=100, default="title")
    number = models.IntegerField(default="0")
    src = models.CharField(max_length=2083)

    class Meta:
        ordering = ['-number']

    def __str__(self):
        return f"{self.number} - {self.title_EN} - {self.title_SK}"
