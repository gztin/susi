(function($){

    //Which slot is going to be replaced next.
    var nextChangeIndex;

    //Which item is going to enter next.
    var nextItem;

    //Number of items
    var itemCount;

    //Contain the currently visible elements on screen.
    var slots;

    //Width of each item
    var itemWidth;

    //The actual carousel object
    var carousel;

    //Plugin Configuration
    var settings;

    //Currently detected screen size
    var currentBreakpoint = 0;

    //The interval timer
    var timer;

    //Swap a slot with a new item
    var swapNext = function(carousel){
        nextChangeIndex %= settings.items; // Set the nextChangeIndex to 0 when it passes visible number of items.
        nextItem %= itemCount;

        var newItem = carousel.find(settings.itemSelector).eq(nextItem);
        slots[nextChangeIndex].fadeOut(settings.duration);
        newItem
            .css({
                position: 'absolute',
                top: 0,
                left: ( 100 / settings.items * nextChangeIndex ) + '%',
                width: itemWidth,
                zIndex: 1
            })
            .fadeIn(settings.fadeDuration, function(){
                newItem.css('z-index', 0);
                slots[nextChangeIndex] = newItem;
                nextChangeIndex++;
                nextItem++;
            });

    };

    //Calculate and initialize variable
    var setData = function() {
        nextItem = settings.items;
        itemCount = carousel.find(settings.itemSelector).length;
        itemWidth = ( 100 / settings.items ) + '%';
        slots = [];
        nextChangeIndex = 0;
    };

    //Start/restart the carousel
    var startCarousel = function() {
        carousel.css('position', 'relative');
        carousel.find(settings.itemSelector).hide();
        for(var i = 0; i < settings.items; i++){
            slots.push(
                carousel.find(settings.itemSelector).eq(i)
                    .show()
                    .css({
                        position: "absolute",
                        top: 0,
                        left: ( 100 / settings.items * i ) + '%',
                        width: itemWidth,
                        zIndex: 1
                    })
            );
        }

        if(itemCount <= settings.items) return;

        clearInterval(timer);

        timer = setInterval(function(){
            swapNext(carousel, settings);
        }, settings.delay);
    };

    $.fn.fadeCarousel = function(options) {


        //Set the default settings
        options = $.extend({
            items: 3,
            delay: 4000,
            fadeDuration: 2000,
            itemSelector: '.fade-item',
            responsive: {}
        }, options);
        settings = $.extend({}, options);

        carousel = this;

        $(window).on("load resize", function(){
            var minMaxWidth = 999999;
            var r_settings = options;
            $.each(settings.responsive, function(maxWidth, options){
                if($(window).width() <= maxWidth && minMaxWidth > maxWidth){
                    r_settings = options;
                    minMaxWidth = Math.min(minMaxWidth, maxWidth);
                }
            });

            if(minMaxWidth !== currentBreakpoint) {
                currentBreakpoint = minMaxWidth;

                $.each(r_settings, function (key, value) {
                    settings[key] = value;
                });


                setData();
                startCarousel();
            }
        });

        return this;
    }
})(jQuery);