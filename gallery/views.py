from django.http import HttpResponse
from django.shortcuts import render
from .models import Photo, LatestPhoto, Calendar, SliderHome


def home(request):
    photos = LatestPhoto.objects.all()
    photos2 = SliderHome.objects.all()
    calendar = Calendar.objects.all()  # all calendar entries
    context = {
        'photos': photos,
        'photos2': photos2,
        'calendar': calendar,
    }
    return render(request, 'index.html', context)


# Gallery
def en_gallery(request):
    photos = Photo.objects.all()
    return render(request, "EN/gallery.html", {"photos": photos})


def sk_gallery(request):
    photos = Photo.objects.all()
    return render(request, "SK/gallery.html", {"photos": photos})


# EN pages
def en_author(request):
    return render(request, 'EN/author.html')


def en_calendar(request):
    return render(request, 'EN/calendar.html')


def en_footer(request):
    return render(request, 'EN/footer.html')


def en_home(request):
    photos = LatestPhoto.objects.all()
    photos2 = SliderHome.objects.all()
    calendar = Calendar.objects.all()  # all calendar entries
    context = {
        'photos': photos,
        'photos2': photos2,
        'calendar': calendar,
    }
    return render(request, 'EN/home.html', context)


def en_info_about_licence(request):
    return render(request, 'EN/info_about_licence.html')


def en_terms_and_conditions(request):
    return render(request, 'EN/terms-and-conditions.html')


def en_thankyousite(request):
    return render(request, 'EN/thankyousite.html')


def en_write_us(request):
    return render(request, 'EN/write us.html')


def en_footer(request):
    return render(request, 'EN/footer.html')


# SK pages
def sk_author(request):
    return render(request, 'SK/author.html')


def sk_calendar(request):
    return render(request, 'SK/calendar.html')


def sk_footer(request):
    return render(request, 'SK/footer.html')


def sk_home(request):
    photos = LatestPhoto.objects.all()
    photos2 = SliderHome.objects.all()
    calendar = Calendar.objects.all()  # all calendar entries
    context = {
        'photos': photos,
        'photos2': photos2,
        'calendar': calendar,
    }
    return render(request, 'SK/home.html', context)


def sk_info_about_licence(request):
    return render(request, 'SK/info_about_licence.html')


def sk_terms_and_conditions(request):
    return render(request, 'SK/terms-and-conditions.html')


def sk_thankyousite(request):
    return render(request, 'SK/thankyousite.html')


def sk_write_us(request):
    return render(request, 'SK/write us.html')


def sk_footer(request):
    return render(request, 'SK/footer.html')
