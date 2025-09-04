from django.contrib import admin
from .models import Photo, LatestPhoto, SliderHome, Calendar


class PhotoAdmin(admin.ModelAdmin):
    list_display = ("number", 'title_EN', 'title_SK', 'src')


class LatestPhotoAdmin(admin.ModelAdmin):
    list_display = ("number", "src")


class SliderHomeAdmin(admin.ModelAdmin):
    list_display = ("number", "src")


class CalendarAdmin(admin.ModelAdmin):
    list_display = ("title_EN", "subtitle_EN", "src")



admin.site.register(Photo, PhotoAdmin)
admin.site.register(LatestPhoto, LatestPhotoAdmin)
admin.site.register(SliderHome, SliderHomeAdmin)
admin.site.register(Calendar, CalendarAdmin)
