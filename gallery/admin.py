from django.contrib import admin
from .models import Photo


class PhotoAdmin(admin.ModelAdmin):
    list_display = ("number", 'title_EN', 'title_SK', 'src')


admin.site.register(Photo, PhotoAdmin)
