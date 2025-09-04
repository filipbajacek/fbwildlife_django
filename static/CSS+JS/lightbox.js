

// Uses Node, AMD or browser globals to create a module.
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals (root is window)
        root.lightbox = factory(root.jQuery);
    }
}(this, function ($) {

    function Lightbox(options) {
        this.album = [];
        this.currentImageIndex = void 0;
        this.init();

        // options
        this.options = $.extend({}, this.constructor.defaults);
        this.option(options);
    }

    // Descriptions of all options available on the demo site:
    // http://lokeshdhakar.com/projects/lightbox2/index.html#options
    Lightbox.defaults = {
        albumLabel: 'Image %1 of %2',
        alwaysShowNavOnTouchDevices: true,
        fadeDuration: 200,
        fitImagesInViewport: true,
        imageFadeDuration: 200,
        // maxWidth: 800,
        // maxHeight: 600,
        positionFromTop: 200,
        resizeDuration: 700,
        showImageNumberLabel: false,
        wrapAround: true,
        disableScrolling: false,
        /*
        Sanitize Title
        If the caption data is trusted, for example you are hardcoding it in, then leave this to false.
        This will free you to add html tags, such as links, in the caption.
    
        If the caption data is user submitted or from some other untrusted source, then set this to true
        to prevent xss and other injection attacks.
         */
        sanitizeTitle: false
    };

    Lightbox.prototype.option = function (options) {
        $.extend(this.options, options);
    };

    Lightbox.prototype.imageCountLabel = function (currentImageNum, totalImages) {
        return this.options.albumLabel.replace(/%1/g, currentImageNum).replace(/%2/g, totalImages);
    };

    Lightbox.prototype.init = function () {
        var self = this;
        // Both enable and build methods require the body tag to be in the DOM.
        $(document).ready(function () {
            self.enable();
            self.build();
        });
    };

    // Loop through anchors and areamaps looking for either data-lightbox attributes or rel attributes
    // that contain 'lightbox'. When these are clicked, start lightbox.
    Lightbox.prototype.enable = function () {
        var self = this;
        $('body').on('click', 'a[rel^=lightbox], area[rel^=lightbox], a[data-lightbox], area[data-lightbox]', function (event) {
            self.start($(event.currentTarget));
            return false;
        });
    };

    // Build html for the lightbox and the overlay.
    // Attach event handlers to the new DOM elements. click click click
    Lightbox.prototype.build = function () {
        if ($('#lightbox').length > 0) {
            return;
        }

        var self = this;
        $('<div id="lightboxOverlay" class="lightboxOverlay"></div><div id="lightbox" class="lightbox"><div class="lb-outerContainer"><div class="lb-container"><img class="lb-image" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" /><div class="lb-nav"><a class="lb-prev" href="" ></a><a class="lb-next" href="" ></a></div><div class="lb-loader"><a class="lb-cancel"></a></div></div></div><div class="lb-dataContainer"><div class="lb-data"><div class="lb-details"><span class="lb-caption"></span><span class="lb-number"></span></div><div class="lb-closeContainer"><a class="lb-close"></a></div></div></div></div>').appendTo($('body'));

        // Cache jQuery objects
        this.$lightbox = $('#lightbox');
        this.$overlay = $('#lightboxOverlay');
        this.$outerContainer = this.$lightbox.find('.lb-outerContainer');
        this.$container = this.$lightbox.find('.lb-container');
        this.$image = this.$lightbox.find('.lb-image');
        this.$nav = this.$lightbox.find('.lb-nav');

        // Store css values for future lookup
        this.containerPadding = {
            top: parseInt(this.$container.css('padding-top'), 10),
            right: parseInt(this.$container.css('padding-right'), 10),
            bottom: parseInt(this.$container.css('padding-bottom'), 10),
            left: parseInt(this.$container.css('padding-left'), 10)
        };

        this.imageBorderWidth = {
            top: parseInt(this.$image.css('border-top-width'), 10),
            right: parseInt(this.$image.css('border-right-width'), 10),
            bottom: parseInt(this.$image.css('border-bottom-width'), 10),
            left: parseInt(this.$image.css('border-left-width'), 10)
        };

        // Attach event handlers to the newly minted DOM elements
        this.$overlay.hide().on('click', function () {
            self.end();
            return false;
        });

        this.$lightbox.hide().on('click', function (event) {
            if ($(event.target).attr('id') === 'lightbox') {
                self.end();
            }
            return false;
        });

        this.$outerContainer.on('click', function (event) {
            if ($(event.target).attr('id') === 'lightbox') {
                self.end();
            }
            return false;
        });

        this.$lightbox.find('.lb-prev').on('click', function () {
            const currentNumber = self.album[self.currentImageIndex].number;
            const target = self.album.find(img => img.number === currentNumber - 1);
            if (target) {
                const newIndex = self.album.findIndex(img => img.number === target.number);
                self.changeImage(newIndex);
            }
            return false;
        });

        this.$lightbox.find('.lb-next').on('click', function () {
            const currentNumber = self.album[self.currentImageIndex].number;
            const target = self.album.find(img => img.number === currentNumber + 1);
            if (target) {
                const newIndex = self.album.findIndex(img => img.number === target.number);
                self.changeImage(newIndex);
            }
            return false;
        });

        /*
          Show context menu for image on right-click
    
          There is a div containing the navigation that spans the entire image and lives above of it. If
          you right-click, you are right clicking this div and not the image. This prevents users from
          saving the image or using other context menu actions with the image.
    
          To fix this, when we detect the right mouse button is pressed down, but not yet clicked, we
          set pointer-events to none on the nav div. This is so that the upcoming right-click event on
          the next mouseup will bubble down to the image. Once the right-click/contextmenu event occurs
          we set the pointer events back to auto for the nav div so it can capture hover and left-click
          events as usual.
         */
        this.$nav.on('mousedown', function (event) {
            if (event.which === 3) {
                self.$nav.css('pointer-events', 'none');

                self.$lightbox.one('contextmenu', function () {
                    setTimeout(function () {
                        this.$nav.css('pointer-events', 'auto');
                    }.bind(self), 0);
                });
            }
        });

        this.$lightbox.find('.lb-loader, .lb-close').on('click', function () {
            self.end();
            return false;
        });

        // Swipe with animation using translateX
        let touchStartX = 0;
        let touchEndX = 0;

        const swipeThreshold = 50;
        const imageElement = this.$image[0];

        if (imageElement) {
            imageElement.addEventListener("touchstart", (e) => {
                touchStartX = e.changedTouches[0].screenX;
            });

            imageElement.addEventListener("touchend", (e) => {
                touchEndX = e.changedTouches[0].screenX;
                const deltaX = touchEndX - touchStartX;

                if (Math.abs(deltaX) > swipeThreshold) {
                    if (deltaX < 0) {
                        animateSwipe("left");
                    } else {
                        animateSwipe("right");
                    }
                }
            });
        }

        // Animácia swipe-u
        function animateSwipe(direction) {
            const currentIndex = self.currentImageIndex;
            const currentNumber = self.album[currentIndex].number;
            const numbers = self.album.map(img => img.number);
            const min = Math.min(...numbers);
            const max = Math.max(...numbers);

            let targetIndex = null;
            if (direction === 'left') {
                const nextNumber = numbers.includes(currentNumber + 1)
                    ? currentNumber + 1
                    : (self.options.wrapAround ? min : null);
                if (nextNumber !== null) {
                    targetIndex = self.album.findIndex(img => img.number === nextNumber);
                }
            } else if (direction === 'right') {
                const prevNumber = numbers.includes(currentNumber - 1)
                    ? currentNumber - 1
                    : (self.options.wrapAround ? max : null);
                if (prevNumber !== null) {
                    targetIndex = self.album.findIndex(img => img.number === prevNumber);
                }
            }

            if (targetIndex !== null) {
                const directionMultiplier = direction === 'left' ? -1 : 1;
                imageElement.style.transition = 'transform 0.3s ease';
                imageElement.style.transform = `translateX(${100 * directionMultiplier}vw)`;

                setTimeout(() => {
                    imageElement.style.transition = 'none';
                    imageElement.style.transform = `translateX(${100 * -directionMultiplier}vw)`;
                    void imageElement.offsetWidth; // Force reflow
                    self.changeImage(targetIndex);
                    setTimeout(() => {
                        imageElement.style.transition = 'transform 0.3s ease';
                        imageElement.style.transform = 'translateX(0)';
                    }, 50);
                }, 300);
            }
        }

        // Swipe gestures using swiped-events
        this.$lightbox[0].addEventListener('swiped-left', function () {
            const currentNumber = self.album[self.currentImageIndex].number;
            const numbers = self.album.map(img => img.number);
            const min = Math.min(...numbers);
            const max = Math.max(...numbers);
            const nextNumber = numbers.includes(currentNumber + 1)
                ? currentNumber + 1
                : (self.options.wrapAround ? min : null);
            if (nextNumber !== null) {
                const newIndex = self.album.findIndex(img => img.number === nextNumber);
                self.changeImage(newIndex);
            }
        });

        this.$lightbox[0].addEventListener('swiped-right', function () {
            const currentNumber = self.album[self.currentImageIndex].number;
            const numbers = self.album.map(img => img.number);
            const min = Math.min(...numbers);
            const max = Math.max(...numbers);
            const prevNumber = numbers.includes(currentNumber - 1)
                ? currentNumber - 1
                : (self.options.wrapAround ? max : null);
            if (prevNumber !== null) {
                const newIndex = self.album.findIndex(img => img.number === prevNumber);
                self.changeImage(newIndex);
            }
        });
    };

    // Show overlay and lightbox. If the image is part of a set, add siblings to album array.
    Lightbox.prototype.start = function ($link) {
        var self = this;
        var $window = $(window);

        $window.on('resize', $.proxy(this.sizeOverlay, this));

        $('select, object, embed').css({
            visibility: 'hidden'
        });

        this.sizeOverlay();

        this.album = [];

        var dataLightboxValue = $link.attr('data-lightbox');
        var $links = $('a[data-lightbox="' + dataLightboxValue + '"]');

        $links.each(function () {
            var $el = $(this);
            self.album.push({
                alt: $el.attr('data-alt'),
                link: $el.attr('href'),
                title: $el.attr('data-title') || $el.attr('title'),
                number: parseInt($el.attr('data-number'), 10)
            });
        });

        // 🔽 Zoradiť podľa data-number
        self.album.sort(function (a, b) {
            return a.number - b.number;
        });

        // Nastaviť imageNumber
        var currentNumber = parseInt($link.attr('data-number'), 10);
        for (var i = 0; i < self.album.length; i++) {
            if (self.album[i].number === currentNumber) {
                imageNumber = i;
                break;
            }
        }


        // Position Lightbox
        // Position Lightbox – CENTERED
        var windowWidth = $window.width();
        var windowHeight = $window.height();
        var lightboxWidth = this.$lightbox.outerWidth();
        var lightboxHeight = this.$lightbox.outerHeight();

        var top = Math.max(0, (windowHeight - lightboxHeight) / 2 + $window.scrollTop());
        var left = Math.max(0, (windowWidth - lightboxWidth) / 2 + $window.scrollLeft());

        this.$lightbox.css({
            top: top + 'px',
            left: left + 'px'
        }).fadeIn(this.options.fadeDuration);

        // Disable scrolling of the page while open
        if (this.options.disableScrolling) {
            $('html').addClass('lb-disable-scrolling');
        }

        this.changeImage(imageNumber);
    };

    // Hide most UI elements in preparation for the animated resizing of the lightbox.
    Lightbox.prototype.changeImage = function (imageNumber) {
        var self = this;

        this.disableKeyboardNav();
        var $image = this.$lightbox.find('.lb-image');

        this.$overlay.fadeIn(this.options.fadeDuration);

        $('.lb-loader').fadeIn('slow');
        this.$lightbox.find('.lb-image, .lb-nav, .lb-prev, .lb-next, .lb-dataContainer, .lb-numbers, .lb-caption').hide();

        this.$outerContainer.addClass('animating');

        // When image to show is preloaded, we send the width and height to sizeContainer()
        var preloader = new Image();
        preloader.onload = function () {
            var $preloader;
            var imageHeight;
            var imageWidth;
            var maxImageHeight;
            var maxImageWidth;
            var windowHeight;
            var windowWidth;

            $image.attr({
                'alt': self.album[imageNumber].alt,
                'src': self.album[imageNumber].link
            });

            $preloader = $(preloader);

            $image.width(preloader.width);
            $image.height(preloader.height);

            if (self.options.fitImagesInViewport) {
                // Fit image inside the viewport.
                // Take into account the border around the image and an additional 10px gutter on each side.

                windowWidth = $(window).width();
                windowHeight = $(window).height();
                maxImageWidth = windowWidth - self.containerPadding.left - self.containerPadding.right - self.imageBorderWidth.left - self.imageBorderWidth.right - 20;
                maxImageHeight = windowHeight - self.containerPadding.top - self.containerPadding.bottom - self.imageBorderWidth.top - self.imageBorderWidth.bottom - 120;

                // Check if image size is larger then maxWidth|maxHeight in settings
                if (self.options.maxWidth && self.options.maxWidth < maxImageWidth) {
                    maxImageWidth = self.options.maxWidth;
                }
                if (self.options.maxHeight && self.options.maxHeight < maxImageWidth) {
                    maxImageHeight = self.options.maxHeight;
                }

                // Is the current image's width or height is greater than the maxImageWidth or maxImageHeight
                // option than we need to size down while maintaining the aspect ratio.
                if ((preloader.width > maxImageWidth) || (preloader.height > maxImageHeight)) {
                    if ((preloader.width / maxImageWidth) > (preloader.height / maxImageHeight)) {
                        imageWidth = maxImageWidth;
                        imageHeight = parseInt(preloader.height / (preloader.width / imageWidth), 10);
                        $image.width(imageWidth);
                        $image.height(imageHeight);
                    } else {
                        imageHeight = maxImageHeight;
                        imageWidth = parseInt(preloader.width / (preloader.height / imageHeight), 10);
                        $image.width(imageWidth);
                        $image.height(imageHeight);
                    }
                }
            }
            self.sizeContainer($image.width(), $image.height());
        };

        preloader.src = this.album[imageNumber].link;
        this.currentImageIndex = imageNumber;
    };

    // Stretch overlay to fit the viewport
    Lightbox.prototype.sizeOverlay = function () {
        this.$overlay
            .width($(document).width())
            .height($(document).height());
    };

    // Animate the size of the lightbox to fit the image we are showing
    Lightbox.prototype.sizeContainer = function (imageWidth, imageHeight) {
        var self = this;

        var oldWidth = this.$outerContainer.outerWidth();
        var oldHeight = this.$outerContainer.outerHeight();
        var newWidth = imageWidth + this.containerPadding.left + this.containerPadding.right + this.imageBorderWidth.left + this.imageBorderWidth.right;
        var newHeight = imageHeight + this.containerPadding.top + this.containerPadding.bottom + this.imageBorderWidth.top + this.imageBorderWidth.bottom;

        function postResize() {
            self.$lightbox.find('.lb-dataContainer').width(newWidth);
            self.$lightbox.find('.lb-prevLink').height(newHeight);
            self.$lightbox.find('.lb-nextLink').height(newHeight);
            self.showImage();
        }

        if (oldWidth !== newWidth || oldHeight !== newHeight) {
            this.$outerContainer.animate({
                width: newWidth,
                height: newHeight
            }, this.options.resizeDuration, 'swing', function () {
                postResize();
            });
        } else {
            postResize();
        }
    };

    // Display the image and its details and begin preload neighboring images.
    Lightbox.prototype.showImage = function () {
        this.$lightbox.find('.lb-loader').stop(true).hide();
        this.$lightbox.find('.lb-image').fadeIn(this.options.imageFadeDuration);

        this.updateNav();
        this.updateDetails();
        this.preloadNeighboringImages();
        this.enableKeyboardNav();
    };

    // Display previous and next navigation if appropriate.
    Lightbox.prototype.updateNav = function () {
        // Check to see if the browser supports touch events. If so, we take the conservative approach
        // and assume that mouse hover events are not supported and always show prev/next navigation
        // arrows in image sets.
        var alwaysShowNav = false;
        try {
            document.createEvent('TouchEvent');
            alwaysShowNav = (this.options.alwaysShowNavOnTouchDevices) ? true : false;
        } catch (e) { }

        this.$lightbox.find('.lb-nav').show();

        if (this.album.length > 1) {
            if (this.options.wrapAround) {
                if (alwaysShowNav) {
                    this.$lightbox.find('.lb-prev, .lb-next').css('opacity', '1');
                }
                this.$lightbox.find('.lb-prev, .lb-next').show();
            } else {
                if (this.currentImageIndex > 0) {
                    this.$lightbox.find('.lb-prev').show();
                    if (alwaysShowNav) {
                        this.$lightbox.find('.lb-prev').css('opacity', '1');
                    }
                }
                if (this.currentImageIndex < this.album.length - 1) {
                    this.$lightbox.find('.lb-next').show();
                    if (alwaysShowNav) {
                        this.$lightbox.find('.lb-next').css('opacity', '1');
                    }
                }
            }
        }
    };

    function handleSwipeGesture() {
        const deltaX = touchEndX - touchStartX;
        const threshold = 50; // Minimum swipe distance in px

        if (Math.abs(deltaX) > threshold) {
            const currentNumber = self.album[self.currentImageIndex].number;
            const numbers = self.album.map(img => img.number);
            const min = Math.min(...numbers);
            const max = Math.max(...numbers);

            if (deltaX > 0) {
                // swipe right → previous image
                const prevNumber = numbers.includes(currentNumber - 1)
                    ? currentNumber - 1
                    : (self.options.wrapAround ? max : null);
                if (prevNumber !== null) {
                    const newIndex = self.album.findIndex(img => img.number === prevNumber);
                    self.changeImage(newIndex);
                }
            } else {
                // swipe left → next image
                const nextNumber = numbers.includes(currentNumber + 1)
                    ? currentNumber + 1
                    : (self.options.wrapAround ? min : null);
                if (nextNumber !== null) {
                    const newIndex = self.album.findIndex(img => img.number === nextNumber);
                    self.changeImage(newIndex);
                }
            }
        }
    }

    // Display caption, image number, and closing button.
    Lightbox.prototype.updateDetails = function () {
        var self = this;

        // Enable anchor clicks in the injected caption html.
        // Thanks Nate Wright for the fix. @https://github.com/NateWr
        if (typeof this.album[this.currentImageIndex].title !== 'undefined' &&
            this.album[this.currentImageIndex].title !== '') {
            var $caption = this.$lightbox.find('.lb-caption');
            if (this.options.sanitizeTitle) {
                $caption.text(this.album[this.currentImageIndex].title);
            } else {
                $caption.html(this.album[this.currentImageIndex].title);
            }
            $caption.fadeIn('fast')
                .find('a').on('click', function (event) {
                    if ($(this).attr('target') !== undefined) {
                        window.open($(this).attr('href'), $(this).attr('target'));
                    } else {
                        location.href = $(this).attr('href');
                    }
                });
        }

        this.$outerContainer.removeClass('animating');

        this.$lightbox.find('.lb-dataContainer').fadeIn(this.options.resizeDuration, function () {
            return self.sizeOverlay();
        });
    };

    this.$lightbox.find('.lb-number').hide();

    // Preload previous and next images in set.
    Lightbox.prototype.preloadNeighboringImages = function () {
        if (this.album.length > this.currentImageIndex + 1) {
            var preloadNext = new Image();
            preloadNext.src = this.album[this.currentImageIndex + 1].link;
        }
        if (this.currentImageIndex > 0) {
            var preloadPrev = new Image();
            preloadPrev.src = this.album[this.currentImageIndex - 1].link;
        }
    };

    Lightbox.prototype.enableKeyboardNav = function () {
        $(document).on('keyup.keyboard', $.proxy(this.keyboardAction, this));
    };

    Lightbox.prototype.disableKeyboardNav = function () {
        $(document).off('.keyboard');
    };

    Lightbox.prototype.keyboardAction = function (event) {
        var KEYCODE_ESC = 27;
        var KEYCODE_LEFTARROW = 37;
        var KEYCODE_RIGHTARROW = 39;

        var keycode = event.keyCode;
        var key = String.fromCharCode(keycode).toLowerCase();

        const currentNumber = this.album[this.currentImageIndex].number;
        const numbers = this.album.map(img => img.number);
        const min = Math.min(...numbers);
        const max = Math.max(...numbers);

        if (keycode === KEYCODE_ESC || key.match(/x|o|c/)) {
            this.end();
        } else if (key === 'p' || keycode === KEYCODE_LEFTARROW) {
            const prevNumber = numbers.includes(currentNumber - 1)
                ? currentNumber - 1
                : (this.options.wrapAround ? max : null);
            if (prevNumber !== null) {
                const newIndex = this.album.findIndex(img => img.number === prevNumber);
                this.changeImage(newIndex);
            }
        } else if (key === 'n' || keycode === KEYCODE_RIGHTARROW) {
            const nextNumber = numbers.includes(currentNumber + 1)
                ? currentNumber + 1
                : (this.options.wrapAround ? min : null);
            if (nextNumber !== null) {
                const newIndex = this.album.findIndex(img => img.number === nextNumber);
                this.changeImage(newIndex);
            }
        }
    };

    // Closing time. :-(
    Lightbox.prototype.end = function () {
        this.disableKeyboardNav();
        $(window).off('resize', this.sizeOverlay);
        this.$lightbox.fadeOut(this.options.fadeDuration);
        this.$overlay.fadeOut(this.options.fadeDuration);
        $('select, object, embed').css({
            visibility: 'visible'
        });
        if (this.options.disableScrolling) {
            $('html').removeClass('lb-disable-scrolling');
        }
    };

    return new Lightbox();
}));