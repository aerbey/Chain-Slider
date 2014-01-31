(function ($, f) {
    $.fn.chain = function (o) {
        var len = this.length;
        //merge the defaults
        o = $.extend({}, $.fn.chain.defaults, o);
        //ie 7-8 does not support the trim function. The code is fixing it
        if (typeof String.prototype.trim !== 'function') {
            String.prototype.trim = function () {
                return this.replace(/^\s+|\s+$/g, '');
            }
        }
        //  Enable multiple-slider support
        return this.each(function (index) {
            //  Cache a copy of $(this), so it
            var me = $(this);
            var key = 'Chain' + (len > 1 ? '-' + ++index : '');
            var instance = init(me, o);

            //  Invoke an Chain instance
            me.data(key, instance).data('key', key);
        });
    };

    // Plugin defaults – added as a property on our plugin function.
    $.fn.chain.defaults = {
        speed: 500,     // animation speed, false for no transition (integer or boolean)
        delay: 3000,    // delay between slides, false for no autoplay (integer or boolean)
        init: 0,        // init delay, false for no delay (integer or boolean)
        pause: !f,      // pause on hover (boolean)
        loop: !f,       // infinitely looping (boolean)
        keys: f,        // keyboard shortcuts (boolean)
        dots: f,        // display ••••o• pagination (boolean)
        arrows: f,      // display prev/next arrows (boolean)
        prev: '←',      // text or html inside prev button (string)
        next: '→',      // same as for prev option
        fluid: f,       // is it a percentage width? (boolean)
        height: null,   
        before: f,      // before slide work
        starting: f,    // invoke before animation (function with argument)
        complete: f,    // invoke after animation (function with argument)
        items: '>ul',   // slides container selector
        item: '>li',    // slidable items selector
        easing: 'swing',// easing function to use for animation
        autoplay: true,  // enable autoplay on initialisation
        textAnimation: false,
        texContainer: '.inner',
        swiper: false,
        swipeDistance: 20,
        cursorClass: "cursor",
        waitVideo: true,
        animations: null
    };
    var _ = new Object();
    var width = $('body').width();
    var slideChanged = false;

    this.init = function (el, o) {

        //storing all variables in _

        _.o = o;
        _.el = el;
        _.ul = el.find(_.o.items);
        _.max = [el.outerWidth() | 0, el.outerHeight() | 0];

        var index = 0;
        //if before defined, send parameters to it
        $.isFunction(_.o.before) && o.before(el, _.o);


        _.li = _.ul.find(_.o.item).each(function (index) {
            var me = $(this);
            var width = me.outerWidth();
            var height = me.outerHeight();

            //  Set the max values
            if (width > _.max[0]) _.max[0] = width;
            if (height > _.max[1]) _.max[1] = height;

            me.find(_.o.texContainer).each(function () {
                $.fn.chain.checkDefaultPosition(_.o.texContainer, $(this), index);
            });
            index++;
        });


        //while holding and dragging slide
        if (_.o.swiper) {
            var firstleft;
            var slides = el.find('ul'), i = 0;
            slides
                .on('movestart', function (e) {
                    slides.addClass(_.o.cursorClass);
                    firstleft = parseInt(slides[i].style.left.replace('px', ''));
                    if ((e.distX > e.distY && e.distX < -e.distY) ||
                        (e.distX < e.distY && e.distX > -e.distY)) {
                        e.preventDefault();
                        return;
                    }
                })
                .on('move', function (e) {
                    var l = parseInt(slides[i].style.left.replace('px', ''));
                    var left = e.distX;
                    var index = parseInt(firstleft / 100) * -1;

                    // Move slides with the finger
                    if (e.distX < 0) {
                        if (slides[i + 1]) {
                            slides[i].style.left = left + '%';
                            slides[i + 1].style.left = (left + 100) + '%';
                        }
                        else {
                            slides[i].style.left = (-1 * index * width) + left + "px";
                        }
                    }
                    if (e.distX > 0) {
                        if (slides[i - 1]) {
                            slides[i].style.left = left + '%';
                            slides[i - 1].style.left = (left - 100) + 'px';
                        }
                        else {
                            slides[i].style.left = (-1 * index * width) + left + "px";
                        }
                    }
                })
                .on('moveend', function (e) {
                    slides.removeClass(_.o.cursorClass);
                    var left = parseInt(slides[i].style.left.replace('px', ''));
                    var distance = width * _.o.swipeDistance / 100;

                    var cleft = firstleft * width / 100;
                    if (cleft > left + distance)
                        $.fn.chain.next(_.ul);
                    else if (cleft < left - distance)
                        $.fn.chain.prev();
                    else {
                        var index = parseInt(firstleft / 100) * -1;
                        $.fn.chain.to(index, null, false);
                    }
                });

            jQuery(document).on('click', '.slide_button', function (e) {
                var href = e.currentTarget.hash;
                jQuery(href).trigger('activate');

                e.preventDefault();
            });
        }

        var hasLoaded = false;

        //Show loader, set the elements position, visibility of elements.
        $(window).load(function () {
            setTimeout(function myfunction() {
                hasLoaded = true;

                //if animations called by javascript
                if (_.o.animations !== undefined && _.o.animations !== null) {
                    var animations = _.o.animations;
                    for (var an in animations[0]) {
                        var key = an;
                        var skey = animations[0][an];
                        for (var sv in skey) {
                            var attr = $(key).attr(sv);
                            var val = skey[sv];
                            if ($.isArray(val)) {
                                for (var i = 0; i < val.length; i++) {
                                    attr = attr !== undefined ? attr + "-" : "";
                                    attr += val[i];
                                }
                            }
                            else
                                attr = val;

                            $(key).removeAttr(sv).attr(sv, attr);
                        }
                    }
                }

                //set initial animatable elements display none
                _.el.find('[data-animate="true"]').stop(true, true);
                _.el.find('[data-animate="true"]').css('display', 'none');
                _.el.find('[data-animate="true"]').each(function () {
                    var t = $(this).attr("data-type");
                    if (t != undefined && t != null && t != "") {
                        var ta = t.split(',');
                        var type = ta[0];
                        switch (type.toLowerCase()) {
                            case "slideup":
                            case "fadeout":
                            case "zoom":
                                $(this).css('display', 'block');
                                break;
                            default:
                                var eas = $.easing[type];
                                eas != undefined && $(this).css('display', 'block');
                                break;

                        }
                    }
                });

                //put all elements that will be animated to their first position
                _.el.find('li:first [data-animate]').each(function () {
                    $.fn.chain.checkDefaultPosition(_.o.texContainer, $(this), _.index);
                });

                if ($.browser.msie == undefined || parseInt($.browser.version, 10) > 8) {
                    var video = _.el.find('video');
                    video.each(function () { $(this).get(0).pause() });
                }

                //make banner visible, call animations after fade finish
                $(".banner ul").css("visibility", "visible").hide().fadeIn("slow", function myfunction() {

                    //firstly hide all elements that will be animated
                    $(".firstslide [data-animate]").hide();

                    //play the animations
                    $.fn.chain.animation(_.el.find('li:first'), 0);
                });

                //delete loader no longer need.
                $(".banner .slide-loader:first").remove();
            }, 100)
        });


        //  Cached vars
        var ul = _.ul,
            li = _.li,
            len = li.length;
        _.i = 0;


        //  Set the main element
        el.css({ width: _.max[0], height: li.first().find(o.texContainer).outerHeight(), overflow: 'hidden' });

        //  Set the relative widths
        ul.css({ position: 'relative', left: 0, width: (len * 100) + '%' });
        li.css({ 'float': 'left', width: (_.max[0]) + 'px' });


        //  Autoslide
        o.autoplay && setTimeout(function () {
            if (o.delay | 0) {
                $.fn.chain.play();

                if (o.pause) {
                    el.on('mouseover mouseout', function (e) {
                        //$(this).stop();
                        //e.type == 'mouseout' && _.play();
                    });
                };
            };
        }, o.init | 0);

        //  Keypresses
        if (o.keys) {
            $(document).keydown(function (e) {
                var key = e.which;

                if (key == 37)
                    $.fn.chain.prev(); // Left
                else if (key == 39)
                    $.fn.chain.next(); // Right
                else if (key == 27)
                    $.fn.chainstop(); // Esc
            });
        };

        //  Dot pagination
        o.dots && $.fn.chain.nav(_.el.find("li"), 'dot', _.o.prev, _.o.next);

        //  Arrows support
        o.arrows && $.fn.chain.nav(_.el.find(">li"), 'arrow', _.o.prev, _.o.next);

        //  Make slider adaptive to screen. On resize restart animation
        if (o.fluid) {
            $(window).resize(function () {
                o.height == null && (o.height = el.height());
                _.r && clearTimeout(_.r);
                _.r = setTimeout(function () {
                    var styl = { height: li.eq(_.i).find(o.texContainer).outerHeight() },
                        bw = $('body').width();//el.outerWidth();
                    el.find('ul li').css('width', bw);
                    ul.css(styl);
                    styl['width'] = Math.min(Math.round((bw / el.parent().width()) * 100), 100) + '%';
                    el.css(styl);

                    var size = 1
                    if (bw > 1200)
                        size = 1;
                    else if (bw <= 1200 && bw > 992)
                        size = 0.9;
                    else if (bw > 768 && bw <= 992)
                        size = 0.7;
                    else
                        size = 0.5;

                    var elh = bw > 1024 ? o.height : 350;
                    el.css('height', elh + "px");
                    el.find('ul').css('height', elh + "px");
                    el.find(o.texContainer).each(function () { $(this).css('height', elh + "px") });

                    _.el.find('[data-resizable]').each(function () {
                        var w = 0;
                        w = $(this).attr('width') == undefined ? $(this).prop('width') : parseFloat($(this).attr('width').replace('px', ''));
                        w > 0 && $(this).css('width', (w * size) + 'px');
                        var h = $(this).attr('height') == undefined ? $(this).prop('height') : parseFloat($(this).attr('height').replace('px', ''));
                        h > 0 && $(this).css('height', (h * size) + 'px');
                        var dps = $(this).attr('data-position');
                        if (dps != undefined && dps != "") {
                            var dp = dps.split(',');
                            var nps = "";
                            for (var i = 0; i < dp.length; i++) {
                                if (dp[i] != "") {
                                    var arr = dp[i].split(':');
                                    nps != "" && (nps += ",")
                                    if (arr[0].trim().toLowerCase() == "width")
                                        nps += "width:" + (w * size) + "px";
                                    else if (arr[0].trim().toLowerCase() == "height")
                                        nps += "height:" + (h * size) + "px";
                                    else
                                        nps += dp[i];
                                }
                                nps != "" && $(this).removeAttr('data-position').attr('data-position', nps);
                            }
                        }
                    });
                    width = bw;
                    if (o.textAnimation) {
                        clearTimeout();
                        el.find('[data-animate="true"]').clearQueue().stop(true, false);
                        el.find('[data-animate="true"]').css('display', 'none');
                        el.find('[data-animate="true"]').each(function () {
                            var t = $(this).attr("data-type");
                            if (t != undefined && t != null && t != "") {
                                $.fn.chain.checkDefaultPosition(_.o.texContainer, $(this), _.index);
                                var ta = t.split(',');
                                var type = ta[0];
                                switch (type.toLowerCase()) {
                                    case "slideup":
                                    case "fadeout":
                                        $(this).css('display', 'block');
                                        break;
                                    default:
                                        break

                                }
                            }
                        });

                        if (hasLoaded) {
                            el.find('[data-animate="true"]').clearQueue().stop(true, false);
                            $.fn.chain.animation(_.el.find('li').eq(_.i), _.i);
                        }
                    }

                }, 50);
            }).resize();
        };

        //  Swipe support
        if ($.event.special['swipe'] || $.Event('swipe')) {
            el.on('swipeleft swiperight swipeLeft swipeRight', function (e) {
                e.type.toLowerCase() == 'swipeleft' ? $.fn.chain.next(_.ul) : $.fn.chain.prev(_.ul);
            });
        };

        return _;

    }

    //set element position according to written value
    $.fn.chain.checkDefaultPosition = function (container, _div, index) {
        if (_div.attr('src') != undefined) {
            var a = "";
        }
        var position = _div.attr('data-position');
        if (position != undefined) {
            var posArr = position.split(',');
            var chechkArr = {};
            for (var i = 0; i < posArr.length; i++) {
                if (posArr[i] != "") {
                    chechkArr[i] = posArr[i].split(':')[0].trim();
                }
            }
            var css = _div.attr('style');
            var style = "";
            if (css != undefined) {
                var cssArr = css.split(';');
                for (var i = 0; i < cssArr.length; i++) {
                    if (cssArr[i].trim() != "") {
                        var arr = cssArr[i].split(':');
                        switch (arr[0].trim()) {
                            case "left":
                            case "right":
                            case "bottom":
                            case "top":
                            case "-webkit-transform":
                            case "-webkit-transform-origin":
                                break;

                            case "width":
                            case "height":
                            case "opacity":
                            default:
                                if ($.inArray(arr[0].trim(), chechkArr) == -1)
                                    style += cssArr[i] + "; ";
                                break;
                        }
                    }
                }
            }
            for (var i = 0; i < posArr.length; i++) {
                var arr = posArr[i].split(':');
                switch (arr[0].trim()) {
                    case "left":
                        var left = $.fn.chain.calculatePos(container, _div, arr[1], index, true);
                        style += "left:" + left + "; ";
                        break;
                    case "right":
                        var right = $.fn.chain.calculatePos(container, _div, arr[1], index, true);
                        style += "right:" + right + "; ";
                        break;
                    case "bottom":
                        var bottom = $.fn.chain.calculatePos(container, _div, arr[1], index, false);
                        style += "bottom:" + bottom + "; ";
                        break;
                    case "top":
                        var top = $.fn.chain.calculatePos(container, _div, arr[1], index, false);
                        style += "top:" + top + "; ";
                        break;

                    default:
                        style += arr[0] + ":" + arr[1] + "; ";
                        break;
                }
            }
            _div.attr('style', style);
        }
    }

    //calculate element position
    $.fn.chain.calculatePos = function (container, _div, val, index, isHorizontal) {
        var w = $('body').width();//window.screen.width;
        var h = _div.parents('li:first').height();
        var dw = _div.width();
        var dh = _div.height();
        if (isHorizontal) {
            switch (val.toLowerCase().trim()) {
                case "left":
                    var _l = _div.parents(container).css('position') == "absolute" ? w * index : 0;
                    return _l + "px";
                    break;

                case "right":
                    var _l = _div.parents(container).css('position') == "absolute" ? (w * (index + 1)) - dw : w - dw;
                    return _l + "px";
                    break;

                case "center":
                    var _l = _div.parents(container).css('position') == "absolute" ? (w * index) + ((w - dw) / 2) : (w - dw) / 2;
                    return _l + "px";
                    break;

                default:
                    return val;
                    break;
            }
        }
        else {
            switch (val.toLowerCase().trim()) {
                case "top":
                    return "0px";
                    break;

                case "bottom":
                    var _b = h - dh;
                    return _b + "px";
                    break;

                case "center":
                    var _b = (h - dh) / 2;
                    return _b + "px";
                    break;

                default:
                    return val;
                    break
            }
        }
    }

    //  Create dots and arrows
    $.fn.chain.nav = function (container, name, html, prevText, nextText) {
        if (name == 'dot') {
            html = '<ol class="dots">';
            $.each($(container), function (index) {
                html += '<li class="' + (index == _.i ? name + ' active' : name) + '">' + ++index + '</li>';
            });
            html += '</ol>';
        } else {
            html = '<div class="';
            html = html + 'prev">' + _.o.prev + '</div>' + html + 'next">' + _.o.next + '</div>';
        };

        _.el.addClass('has-' + name + 's').append(html).find('.next, .prev, .dot').click(function () {
            var me = $(this);
            if (me.hasClass('dot')) { $.fn.chain.stop(); $.fn.chain.to(me.index()); } else me.hasClass('prev') ? $.fn.chain.prev() : $.fn.chain.next();
        });
    };

    //$.fn.chain.animation
    $.fn.chain.animation = function (_div, index) {

        var animate = _div.attr('data-animate');
        if (animate == "true") {
            var type = _div.attr('data-type');
            var tArr = type.split('+');
            applyAnimation(_div, tArr, 0);
        }
        else {
            if (_.o == undefined) {
                _.o = $.fn.chain.defaults;
            }

            $.fn.chain.checkDefaultPosition(_.o.texContainer, _div, index);

            //call animation for all the animatables inside element
            _div.find('[data-animate="true"]').each(function () {
                $.fn.chain.animation($(this), index);
            });
        }
    }

    function applyAnimation(_div, tArr, i) {
        if (!slideChanged) {
            _div.css("position", "absolute");
            var type = tArr[i];
            var delay = getDelay(type);

            //define timeouts for each animation
            var timer = setTimeout(function () {
                window.clearTimeout(timer);
                delete timeoutCache[timer];

                //for drag and drop mode, too be able to call outside of plugin
                if (_.o == undefined) {
                    _.o = $.fn.chain.defaults;
                }

                var oi = parseInt(_div.parents('ul').eq(0).parent().find('.active').text()) - 1;

                var opt = $.fn.chain.checkPosition(_div, oi, type, _.o.texContainer);
                switch (opt.type != undefined ? opt.type.toLowerCase().trim() : "") {
                    case "fadein" || "fadeIn":
                        _div.fadeIn({ duration: opt.speed, easing: opt.easing });
                        break;

                    case "fadeout" || "fadeOut":
                        _div.css('display', 'block');
                        _div.fadeOut({ duration: opt.speed, easing: opt.easing });
                        break;

                    case "slideup" || "slideUp":
                        _div.css('display', 'block');
                        _div.slideUp({ duration: opt.speed, easing: opt.easing });
                        break;

                    case "slidedown" || "slidedown":
                        _div.slideDown({ duration: opt.speed, easing: opt.easing });
                        break;

                    case "rotate":
                        _div.css('display', 'block');
                        _div.rotate({
                            duration: opt.duration,
                            angle: opt.angle,
                            animateTo: opt.animateTo,
                            easing: $.easing[opt.easing]
                        });
                        break;

                    case "flip":
                        _div.css('display', 'block');

                        //toggle class can not be animated. so we call it with promise
                        _div.toggleClass(opt.axis).promise().done();
                        break;


                    case "css" || "style":
                        var css = _div.attr('style');
                        var style = "";
                        if (css != undefined) {
                            var cssArr = css.split(';');
                            var oArr = opt.style.split(';')
                            for (var i = 0; i < oArr.length; i++) {
                                if (oArr[i] != "") {
                                    var oarr = oArr[i].split(':');
                                    var index = css.indexOf(oarr[0]);
                                    if (index > -1) {
                                        var enter = false;
                                        var rmv = "";
                                        for (var j = index; j < css.length; j++) {
                                            rmv += css[j];
                                            if (css[j] == ";") break;
                                        }
                                        css = css.replace(rmv, "");
                                    }
                                }
                            }
                            style = css + opt.style;
                            _div.attr('style', style);
                        }
                        break;

                    case "toggleclass" || "toggleClass":
                        _div.toggleClass(opt.className);
                        break;

                    case "zoom":
                    case "move":
                    default:
                        _div.css('display', 'block');
                        var option = {};
                        if (opt.left != undefined) option.left = opt.left;
                        if (opt.right != undefined) option.right = opt.right;
                        if (opt.top != undefined) option.top = opt.top;
                        if (opt.bottom != undefined) option.bottom = opt.bottom;
                        if (opt.width != undefined) option.width = opt.width;
                        if (opt.height != undefined) option.height = opt.height;
                        if (opt.opacity != undefined) option.opacity = opt.opacity;
                        opt.easing == undefined && (opt.easing = "swing");

                        //zoom support
                        if (opt.ratio != undefined) {
                            var w = _div.width();
                            var h = _div.height();
                            opt.type = opt.type != "zoom" ? opt.easing != undefined ? opt.easing : opt.type : "swing";
                            option.width = Math.floor(w * opt.ratio);
                            option.height = Math.floor(h * opt.ratio);
                        }

                        opt.queue = false,
                        _div.animate(option, opt.speed,
                        opt.easing.trim());
                        break;
                }

            }, delay);
            timeoutCache[timer] = timer;

            //if element has more than one animation defined
            tArr.length - 1 > i && applyAnimation(_div, tArr, i + 1);
        }
    }

    //return delay time from defined animation
    function getDelay(type) {
        var index = type.indexOf('delay');
        var enter = false;
        var delay = "";
        for (var i = index; i < type.length; i++) {
            if (enter) {
                delay += type[i];
            }

            if (type[i] == ",") break;
            if (type[i] == ":") enter = true;
        }
        return parseInt(delay);
    }

    //retun animation properties to be applied in object
    $.fn.chain.checkPosition = function (_div, index, type, textContainer) {
        var options = {};
        options.type = type.split('(')[0];
        type = type.replace(' ', '').replace(options.type + '(', '').replace(')', '');
        var optArr = type.split(',');
        for (var i = 0; i < optArr.length; i++) {

            var arr = optArr[i].split(':');
            var key = arr[0].toLowerCase().trim();
            var val = arr[1].toLowerCase().trim();
            if (key === "delay") {
                var d = parseInt(val);
                options.delay = d == 0 || d == null || d == "" ? 600 : d;
            }
            else if (key === "speed") {
                var s = parseInt(val);
                options.speed = s == 0 || s == null || s == "" ? 600 : s;
            }
            else if (key === "angle") {
                var a = parseInt(val);
                options.angle = a == null || a == "" ? 45 : a;
            }
            else if (key === "animateto") {
                var a = parseInt(val);
                options.animateTo = a == null || a == "" ? 180 : a;
            }
            else if (key === "duration") {
                var d = parseInt(val);
                options.duration = d == 0 || d == null || d == "" ? 1000 : d;
            }
            else if (key === "ratio") {
                var d = parseFloat(val);
                options.ratio = d == 0 || d == null || d == "" ? 1000 : d;
            }
            else if (key === "easing") {
                options.easing = val == 0 || val == null || val == "" ? "swing" : arr[1];
            }
            else if (key === "axis") {
                if (val == "x") {
                    options.axis = "flipH";
                }
                else {
                    options.axis = "flipV";
                }

            }
            else if (key === "style") {
                options.style = optArr[i].replace('style:', '');
            }
            else if (key === "class") {
                options.className = optArr[i].replace('class:', '');
            }
            else {
                switch (key) {
                    case "left":
                        var left = val;
                        var larr = left.split('>');
                        if (larr.length > 1) {
                            var left1 = $.fn.chain.calculatePos(textContainer, _div, larr[0], index, true);
                            var left2 = $.fn.chain.calculatePos(textContainer, _div, larr[1], index, true);
                            _div.css('left', left1);
                            options.left = left2;
                        }
                        else
                            options.left = $.fn.chain.calculatePos(_.o.texContainer, _div, larr[0], index, true);
                        _//div.css('left', left);
                        break;

                    case "right":
                        var right = val;
                        var rarr = right.split('>');
                        if (rarr.length > 1) {
                            var right1 = $.fn.chain.calculatePos(textContainer, _div, rarr[0], index, true);
                            var right2 = $.fn.chain.calculatePos(textContainer, _div, rarr[1], index, true);
                            _div.css('right', right1);
                            options.right = right2;
                        }
                        else
                            options.right = $.fn.chain.calculatePos(textContainer, _div, rarr[0], index, true);
                        //_div.css('right', right);
                        break;

                    case "top":
                        var top = val;
                        var tarr = top.split('>');
                        if (tarr.length > 1) {
                            var top1 = $.fn.chain.calculatePos(textContainer, _div, tarr[0], index, false);
                            var top2 = $.fn.chain.calculatePos(textContainer, _div, tarr[1], index, false);
                            _div.css('top', top1);
                            options.top = top2;
                        }
                        else
                            options.top = $.fn.chain.calculatePos(textContainer, _div, tarr[0], index, false);
                        // _div.css('top', top);
                        break;

                    case "bottom":
                        var bottom = val;
                        var tarr = bottom.split('>');
                        if (tarr.length > 1) {
                            var bottom1 = $.fn.chain.calculatePos(textContainer, _div, tarr[0], index, false);
                            var bottom2 = $.fn.chain.calculatePos(textContainer, _div, tarr[1], index, false);
                            _div.css('bottom', bottom1);
                            options.bottom = bottom2;
                        }
                        else
                            options.bottom = $.fn.chain.calculatePos(textContainer, _div, tarr[0], index, false);
                        //_div.css('bottom', bottom);
                        break;

                    case "width":
                        options.width = val;
                        break;

                    case "height":
                        options.height = val;
                        break;

                    case "opacity":
                        options.opacity = val;
                        break;

                    default:
                        break;
                }
            }
        }
        return options;
    }

    //  Move Chain to a slide index
    $.fn.chain.to = function (index, callback, playAnimate) {
        if (_.t) {
            $.fn.chain.stop();
            $.fn.chain.play();
        }
        var o = _.o,
            el = _.el,
            ul = _.ul,
            li = _.li,
            current = _.i,
            target = li.eq(index);

        if (o.textAnimation && playAnimate != false) {
            clearTimeout();
            el.find('[data-animate="true"]').clearQueue().stop(true, false);
            el.find('[data-animate="true"]').css('display', 'none');
            el.find('[data-animate="true"]').each(function () {
                var t = $(this).attr("data-type");
                if (t != undefined && t != null && t != "") {
                    $.fn.chain.checkDefaultPosition(_.o.texContainer, $(this), index);
                    var ta = t.split(',');
                    var type = ta[0];
                    switch (type.toLowerCase()) {
                        case "slideup":
                        case "fadeout":
                            $(this).css('display', 'block');
                            break;
                        default:
                            break

                    }
                }
            });
        }

        $.isFunction(o.starting) && !callback && o.starting(el, li.eq(current));
        if ($.browser.msie == undefined || parseInt($.browser.version, 10) > 8) {
            var video = el.find('video');
            video.each(function () { $(this).get(0).pause() });
        }

        //  To slide or not to slide
        if ((!target.length || index < 0) && o.loop == f) return;

        //  Check if it's out of bounds
        if (!target.length) index = 0;
        if (index < 0) index = li.length - 1;
        target = li.eq(index);

        var speed = callback ? 5 : o.speed | 0,
            easing = o.easing,
            obj = { height: target.find(o.texContainer).outerHeight() };

        if (!ul.queue('fx').length) {
            //  Handle those pesky dots
            el.find('.dot').eq(index).addClass('active').siblings().removeClass('active');

            el.animate(obj, speed, easing) && ul.animate($.extend({ left: '-' + index + '00%' }, obj), speed, easing, function (data) {
                _.i = index;
                var id = el.find('.active').text();
                var act = el.find('ul li').eq(parseInt(id) - 1);
                if ($.browser.msie == undefined || parseInt($.browser.version, 10) > 8) {
                    var video = act.find('video');
                    if (video.length > 0) {
                        video.get(0).play();
                        if (_.o.waitVideo) {
                            $.fn.chain.stop();
                            video.bind("ended", function () {
                                $.fn.chain.play();
                                $.fn.chain.next();
                            });
                        }
                    }
                }
                $.isFunction(o.complete) && !callback && o.complete(el, target);
                if (o.textAnimation && playAnimate != false) {
                    act.find(o.texContainer).each(function () {
                        var _div = $(this);
                        var len = 0;
                        try {
                            len = _div.html().length;
                        } catch (e) {
                            len = 0;
                        }
                        if (len > 0) {
                            $.fn.chain.animation(_div, index);
                        }
                    });
                }
            });
        };
    };

    //  Autoplay functionality
    $.fn.chain.play = function () {
        _.t = setInterval(function () {
            $.fn.chain.to(_.i + 1);
        }, _.o.delay | 0);
    };

    //  Stop autoplay
    $.fn.chain.stop = function () {
        slideChanged = false;
        _.t = clearInterval(_.t);
        return _;
    };

    //  Move to previous/next slide
    $.fn.chain.next = function () {
        slideChanged = true;
        clearTimeout();
        _.ul.find('[data-animate="true"]').clearQueue().stop(true, false);
        $.fn.chain.stop();
        return $.fn.chain.to(_.i + 1);
    };

    $.fn.chain.prev = function () {
        slideChanged = true;
        clearTimeout();
        _.ul.find('[data-animate="true"]').clearQueue().stop(true, false);
        $.fn.chain.stop();
        return $.fn.chain.to(_.i - 1);
    };

    function clearTimeout() {
        for (var i in timeoutCache) {
            window.clearTimeout(timeoutCache[i]);
            delete timeoutCache[i];
        }
    }

    var width = $('body').width();
    var timeoutCache = {};

    //flip horizontal css
    $("<style type='text/css'> .flipH{ -moz-transform: scaleX(-1);  -webkit-transform: scaleX(-1); -o-transform: scaleX(-1);" +
      "transform: scaleX(-1); -ms-filter: fliph; /*IE*/  filter: fliph; /*IE*/ } </style>").appendTo("head");

    //flip vertical css
    $("<style type='text/css'> .flipV{ -moz-transform: scaleY(-1);  -webkit-transform: scaleY(-1);  -o-transform: scaleY(-1);" +
     "transform: scaleY(-1); -ms-filter: flipv; /*IE*/  filter: flipv; /*IE*/    } </style>").appendTo("head");

}(jQuery, false));