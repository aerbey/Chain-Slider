/**
 *   Chain by @idiot and @damirfoy
 *   Contributors:
 *   - @ShamoX
 *
 */

(function ($, f) {
    var Chain = function () {
        //  Object clone
        var _ = this;

        //  Set some options
        _.o = {
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
            before: f,
            starting: f,    // invoke before animation (function with argument)
            complete: f,    // invoke after animation (function with argument)
            items: '>ul',   // slides container selector
            item: '>li',    // slidable items selector
            easing: 'swing',// easing function to use for animation
            autoplay: true,  // enable autoplay on initialisation
            textAnimation: false,
            texContainer: '.inner',
            swiper: false,
            cursorClass: "cursor",
            swipeDistance: 20,
            waitVideo: true,
            animations: null
        };

        _.init = function (el, o) {
            //  Check whether we're passing any options in to Chain            
            _.o = $.extend(_.o, o);

            $.isFunction(o.before) && o.before(el, o);

            _.el = el;
            _.ul = el.find(_.o.items);
            _.max = [el.outerWidth() | 0, el.outerHeight() | 0];
            var index = 0;
            _.li = _.ul.find(_.o.item).each(function (index) {
                var me = $(this),
					width = me.outerWidth(),
					height = me.outerHeight();

                //  Set the max values
                if (width > _.max[0]) _.max[0] = width;
                if (height > _.max[1]) _.max[1] = height;
                me.find(_.o.texContainer).each(function () {
                    checkDefaultPosition($(this), index);
                });
                index++;
            });

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
                            _.next();
                        else if (cleft < left - distance)
                            _.prev();
                        else {
                            var index = parseInt(firstleft / 100) * -1;
                            _.to(index, null, false);
                        }
                    });

                jQuery(document)
                .on('click', '.slide_button', function (e) {
                    var href = e.currentTarget.hash;
                    jQuery(href).trigger('activate');

                    e.preventDefault();
                });
            }

            $(window).load(function () {
                setTimeout(function myfunction() {
                    if (_.o.animations !== undefined) {
                        var animations = _.o.animations;//window.JSON.parse(_.o.animations);
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

                    _.el.find('[animate="true"]').stop(true, true);
                    _.el.find('[animate="true"]').css('display', 'none');
                    _.el.find('[animate="true"]').each(function () {
                        var t = $(this).attr("data-type");
                        if (t != undefined && t != null && t != "") {
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

                    var bw = $('body').width();
                    if (bw <= 1200) {
                        var size = bw / window.screen.width;
                        _.el.find('[resizable]').each(function () {
                            var w = $(this).width();
                            w > 0 && $(this).css('width', (w * size) + 'px');
                            var h = $(this).height();
                            h > 0 && $(this).css('height', (h * size) + 'px');
                        });
                    }

                    //put all elements that will be animated to their first position
                    _.el.find('li:first [animate]').each(function () {
                        checkDefaultPosition($(this), _.index);
                    });

                    if ($.browser.msie == undefined || parseInt($.browser.version, 10) > 8) {
                        var video = _.el.find('video');
                        video.each(function () { $(this).get(0).pause() });
                    }

                    //make banner visible, call animations after fade finish
                    $(".banner ul").css("visibility", "visible").hide().fadeIn("slow", function myfunction() {
                        $(".firstslide [animate]").hide();
                        _.animation(_.el.find('li:first'), 0);
                    });

                    //delete loader no longer need.
                    $(".banner .slide-loader:first").remove();
                }, 1000)
            });

            //  Cached vars
            var o = _.o,
                ul = _.ul,
                li = _.li,
                len = li.length;

            //  Current indeed
            _.i = 0;

            //  Set the main element
            el.css({ width: _.max[0], height: li.first().outerHeight(), overflow: 'hidden' });

            //  Set the relative widths
            ul.css({ position: 'relative', left: 0, width: (len * 100) + '%' });
            li.css({ 'float': 'left', width: (_.max[0]) + 'px' });

            //  Autoslide
            o.autoplay && setTimeout(function () {
                if (o.delay | 0) {
                    _.play();

                    if (o.pause) {
                        el.on('mouseover mouseout', function (e) {
                            _.stop();
                            e.type == 'mouseout' && _.play();
                        });
                    };
                };
            }, o.init | 0);

            //  Keypresses
            if (o.keys) {
                $(document).keydown(function (e) {
                    var key = e.which;

                    if (key == 37)
                        _.prev(); // Left
                    else if (key == 39)
                        _.next(); // Right
                    else if (key == 27)
                        _.stop(); // Esc
                });
            };

            //  Dot pagination
            o.dots && nav('dot');

            //  Arrows support
            o.arrows && nav('arrow');

            //  Patch for fluid-width sliders. Screw those guys.
            if (o.fluid) {
                $(window).resize(function () {
                    _.r && clearTimeout(_.r);
                    _.r = setTimeout(function () {
                        var styl = { height: li.eq(_.i).outerHeight() },
                            bw = $('body').width();//el.outerWidth();
                        el.find('ul li').css('width', bw);
                        ul.css(styl);
                        styl['width'] = Math.min(Math.round((bw / el.parent().width()) * 100), 100) + '%';
                        el.css(styl);
                        var size = bw / width;
                        width = bw;
                        _.el.find('[resizable]').each(function () {
                            var w = $(this).width();
                            w > 0 && $(this).css('width', (w * size) + 'px');
                            var h = $(this).height();
                            h > 0 && $(this).css('height', (h * size) + 'px');
                        });
                        _.el.find('li:first [animate]').each(function () {
                            checkDefaultPosition($(this), _.index);
                        });
                    }, 50);
                }).resize();
            };

            //  Swipe support
            if ($.event.special['swipe'] || $.Event('swipe')) {
                el.on('swipeleft swiperight swipeLeft swipeRight', function (e) {
                    e.type.toLowerCase() == 'swipeleft' ? _.next() : _.prev();
                });
            };


            return _;
        };

        //  Move Chain to a slide index
        _.to = function (index, callback, playAnimate) {
            if (_.t) {
                _.stop();
                _.play();
            }
            var o = _.o,
                el = _.el,
                ul = _.ul,
                li = _.li,
                current = _.i,
                target = li.eq(index);

            if (o.textAnimation && playAnimate != false) {
                el.find('[animate="true"]').clearQueue().stop(true, false);
                el.find('[animate="true"]').css('display', 'none');
                el.find('[animate="true"]').each(function () {
                    var t = $(this).attr("data-type");
                    if (t != undefined && t != null && t != "") {
                        checkDefaultPosition($(this), index);
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
                obj = { height: target.outerHeight() };

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
                                _.stop();
                                video.bind("ended", function () {
                                    _.play();
                                    _.next();
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
                                _.animation(_div, index);
                            }
                        });
                    }
                });
            };
        };

        //  Autoplay functionality
        _.play = function () {
            _.t = setInterval(function () {
                _.to(_.i + 1);
            }, _.o.delay | 0);
        };

        //  Stop autoplay
        _.stop = function () {
            slideChanged = false;
            _.t = clearInterval(_.t);
            return _;
        };

        //  Move to previous/next slide
        _.next = function () {
            slideChanged = true;
            _.ul.find('[animate="true"]').clearQueue().stop(true, false);
            return _.stop().to(_.i + 1);
        };

        _.prev = function () {
            slideChanged = true;
            _.ul.find('[animate="true"]').clearQueue().stop(true, false);
            return _.stop().to(_.i - 1);
        };

        //  Create dots and arrows
        function nav(name, html) {
            if (name == 'dot') {
                html = '<ol class="dots">';
                $.each(_.li, function (index) {
                    html += '<li class="' + (index == _.i ? name + ' active' : name) + '">' + ++index + '</li>';
                });
                html += '</ol>';
            } else {
                html = '<div class="';
                html = html + name + 's">' + html + name + ' prev">' + _.o.prev + '</div>' + html + name + ' next">' + _.o.next + '</div></div>';
            };

            _.el.addClass('has-' + name + 's').append(html).find('.' + name).click(function () {
                var me = $(this);
                me.hasClass('dot') ? _.stop().to(me.index()) : me.hasClass('prev') ? _.prev() : _.next();
            });
        };

        _.animation = function (_div, index) {
            var animate = _div.attr('animate');
            if (animate == "true") {
                var type = _div.attr('data-type');
                var tArr = type.split('-');
                playAnimation(_div, tArr, index, 0);
            }
            else {
                checkDefaultPosition(_div, index);
                checkElements(_div, index);
            }
        }

        function playAnimation(_div, tArr, index, i) {
            if (!slideChanged) {
                _div.css("position", "absolute");
                var type = tArr[i];
                var opt = checkPosition(_div, index, type);
                var timer = setTimeout(function () {
                    window.clearTimeout(timer);
                    switch (opt.type != undefined ? opt.type.toLowerCase().trim() : "") {
                        case "fadein":
                            _div.fadeIn(opt.speed, function () {
                                tArr.length - 1 > i && playAnimation(_div, tArr, index, i + 1);
                                checkElements(_div, index);
                            });
                            break;

                        case "fadeout":
                            _div.css('display', 'block');
                            _div.fadeOut(opt.speed, function () {
                                tArr.length - 1 > i && playAnimation(_div, tArr, index, i + 1);
                                checkElements(_div, index);
                            });
                            break;

                        case "slideup":
                            _div.css('display', 'block');
                            _div.slideUp(opt.speed, function () {
                                tArr.length - 1 > i && playAnimation(_div, tArr, index, i + 1);
                                checkElements(_div, index);
                            });
                            break;

                        case "slidedown":
                            _div.slideDown(opt.speed, function () {
                                tArr.length - 1 > i && playAnimation(_div, tArr, index, i + 1);
                                checkElements(_div, index);
                            });
                            break;

                        case "rotate":
                            _div.rotate({
                                duration: opt.duration,
                                angle: opt.angle,
                                animateTo: opt.animateTo,
                                easing: $.easing[opt.easing],
                                callback: function () {
                                    checkElements(_div, index);
                                }
                            });
                            tArr.length - 1 > i && playAnimation(_div, tArr, index, i + 1);
                            break;

                        default:
                            _div.css('display', 'block');
                            var option = {};
                            if (opt.left != undefined) option.left = opt.left;
                            if (opt.right != undefined) option.right = opt.right;
                            if (opt.top != undefined) option.top = opt.top;
                            if (opt.bottom != undefined) option.bottom = opt.bottom;

                            _div.animate(option, opt.speed,
                            opt.type.trim(),
                            function () {
                                checkElements(_div, index);
                            });
                            tArr.length - 1 > i && playAnimation(_div, tArr, index, i + 1);
                            break;
                    }
                }, opt.delay);
            }
        }

        function checkElements(_div, index) {
            _div.find('[animate="true"]').each(function () {
                _.animation($(this), index);
            });
        }

        function checkPosition(_div, index, type) {
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
                else if (key === "easing") {
                    options.easing = val == 0 || val == null || val == "" ? "swing" : val;
                }
                else {
                    switch (key) {
                        case "left":
                            var left = val;
                            var larr = left.split('>');
                            if (larr.length > 1) {
                                var left1 = calculatePos(_div, larr[0], index, true);
                                var left2 = calculatePos(_div, larr[1], index, true);
                                _div.css('left', left1);
                                options.left = left2;
                            }
                            else
                                _div.css('left', left);

                            break;

                        case "right":
                            var right = val;
                            var rarr = right.split('>');
                            if (rarr.length > 1) {
                                var right1 = calculatePos(_div, rarr[0], index, true);
                                var right2 = calculatePos(_div, rarr[1], index, true);
                                _div.css('right', right1);
                                options.right = right2;
                            }
                            else
                                _div.css('right', right);
                            break;

                        case "top":
                            var top = val;
                            var tarr = top.split('>');
                            if (tarr.length > 1) {
                                var top1 = calculatePos(_div, tarr[0], index, false);
                                var top2 = calculatePos(_div, tarr[1], index, false);
                                _div.css('top', top1);
                                options.top = top2;
                            }
                            else
                                _div.css('top', top);
                            break;

                        case "bottom":
                            var bottom = val;
                            var tarr = bottom.split('>');
                            if (tarr.length > 1) {
                                var bottom1 = calculatePos(_div, tarr[0], index, false);
                                var bottom2 = calculatePos(_div, tarr[1], index, false);
                                _div.css('bottom', bottom1);
                                options.bottom = bottom2;
                            }
                            else
                                _div.css('bottom', bottom);
                            break;

                        default:
                            break;
                    }
                }
            }
            return options;
        }

        function calculatePos(_div, val, index, isHorizontal) {
            var w = $('body').width();//window.screen.width;
            var h = _div.parents('li:first').height();
            var dw = _div.width();
            var dh = _div.height();
            if (isHorizontal) {
                switch (val.toLowerCase().trim()) {
                    case "left":
                        var _l = w * index;
                        return _l + "px";
                        break;

                    case "right":
                        var _l = (w * (index + 1)) - dw;
                        return _l + "px";
                        break;

                    case "center":
                        var _l = (w * index) + ((w - dw) / 2);
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

        function checkDefaultPosition(_div, index) {
            var position = _div.attr('position');
            if (position != undefined) {
                var posArr = position.split(',');
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
                                default:
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
                            var left = calculatePos(_div, arr[1], index, true);
                            style += "left:" + left + "; ";
                            break;
                        case "right":
                            var right = calculatePos(_div, arr[1], index, true);
                            style += "right:" + right + "; ";
                            break;
                        case "bottom":
                            var bottom = calculatePos(_div, arr[1], index, false);
                            style += "bottom:" + bottom + "; ";
                            break;
                        case "top":
                            var top = calculatePos(_div, arr[1], index, false);
                            style += "top:" + top + "; ";
                            break;
                        default:
                            break;
                    }
                }
                _div.attr('style', style);
            }
        }

        var width = $('body').width();
    };

    var slideChanged = false;
    //  Create a jQuery plugin
    $.fn.chain = function (o) {
        var len = this.length;

        //ie 7-8 does not support the trim function. The code is fixing it
        if (typeof String.prototype.trim !== 'function') {
            String.prototype.trim = function () {
                return this.replace(/^\s+|\s+$/g, '');
            }
        }

        //  Enable multiple-slider support
        return this.each(function (index) {
            //  Cache a copy of $(this), so it
            var me = $(this),
                key = 'Chain' + (len > 1 ? '-' + ++index : ''),
                instance = (new Chain).init(me, o);

            //  Invoke an Chain instance
            me.data(key, instance).data('key', key);
        });
    };

    Chain.version = "1.0.0";
})(jQuery, false);
