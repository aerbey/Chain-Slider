/**
 *   Unslider by @idiot and @damirfoy
 *   Contributors:
 *   - @ShamoX
 *
 */

(function ($, f) {
    var Unslider = function () {
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
            texContainer: '.inner'
        };

        _.init = function (el, o) {
            //  Check whether we're passing any options in to Unslider            
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
                    checkPosition($(this), index);
                });
                index++;
            });

            $(window).ready(function () {
                alert("slider loaded..");
                anime(el.find('li:first'), 0);
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
							width = el.outerWidth();

                        ul.css(styl);
                        styl['width'] = Math.min(Math.round((width / el.parent().width()) * 100), 100) + '%';
                        el.css(styl);
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

        //  Move Unslider to a slide index
        _.to = function (index, callback) {
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

            o.textAnimation && el.find('div[animate="true"], h[animate="true"], p[animate="true"], span[animate="true"], i[animate="true"], u[animate="true"]').css('display', 'none');

            $.isFunction(o.starting) && !callback && o.starting(el, li.eq(current));

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

                    $.isFunction(o.complete) && !callback && o.complete(el, target);
                    if (o.textAnimation) {
                        var id = el.find('.active').text();
                        el.find('ul li').eq(parseInt(id) - 1).find(o.texContainer).each(function () {
                            var _div = $(this);
                            var len = 0;
                            try {
                                len = _div.html().length;
                            } catch (e) {
                                len = 0;
                            }
                            if (len > 0) {
                                anime(_div, index);
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
            _.t = clearInterval(_.t);
            return _;
        };

        //  Move to previous/next slide
        _.next = function () {
            return _.stop().to(_.i + 1);
        };

        _.prev = function () {
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

        function anime(_div, index) {
            var animate = _div.attr('animate');
            if (animate == "true") {
                var speed = _div.attr('animate-speed');
                var delay = _div.attr('animate-delay');
                var easings = _div.attr('animate-type');
                var height = _div.attr('animate-height');

                speed = speed == null || speed == undefined ? 500 : parseInt(speed);
                delay = delay == null || delay == undefined ? 100 : parseInt(delay);
                easings = easings == null || easings == undefined ? "swing" : easings;
                height = height == null || height == undefined ? _div.outerHeight() : height;

                //var options = {};
                var opt = checkPosition(_div, index);
                opt.height = height;

                _div.css('display', 'block').css('owerflow', "hidden");

                var timer = setTimeout(function () {
                    window.clearTimeout(timer);
                    switch (easings) {
                        case "fadeIn":
                            _div.fadeIn(speed, function () { checkElements(_div, index); });
                            break;

                        case "fadeOut":
                            _div.fadeOut(speed, function () { checkElements(_div, index); });
                            break;

                        case "slideUp":
                            _div.slideUp(speed, function () { checkElements(_div, index); });
                            break;

                        case "slideDown":
                            _div.slideDown(speed, function () { checkElements(_div, index); });
                            break;

                        default:
                            _div.animate(opt, speed,
                            easings,
                            function () { checkElements(_div, index); });
                            break;
                    }
                     

                }, delay);
            }
            else {
                checkPosition(_div, index);
                _div.find('[animate="true"]').each(function () {
                    anime($(this), index);
                });
            }
        }

        function checkElements(_div, index) {
            _div.find('[animate="true"]').each(function () {
                anime($(this), index);
            });
        }

        function checkPosition(_div, index) {
            var p = _div.attr('position');
            var p_l = _div.attr('position-left');
            var p_r = _div.attr('position-right');
            var p_t = _div.attr('position-top');
            var p_b = _div.attr('position-bottom');

            var options = {};
            if (p != null && p != "") {
                var arr = p.split(' ');
                if (arr.length > 1) {
                    var left = arr[0];
                    var top = "";
                    try {
                        top = arr[1];
                    } catch (e) {
                        top = "top";
                    }

                    options = calculatePos(_div, index, options, arr[0], true, "left");
                    options = calculatePos(_div, index, options, arr[1], false, "top");
                }
            }
            else {
                if (p_l != null && p_l != "")
                    options = calculatePos(_div, index, options, p_l, true, "left");

                if (p_r != null && p_r != "")
                    options = calculatePos(_div, index, options, p_r, true, "right");

                if (p_t != null && p_t != "")
                    options = calculatePos(_div, index, options, p_t, false, "top");

                if (p_b != null && p_b != "")
                    options = calculatePos(_div, index, options, p_b, false, "bottom");

            }
            return options;
        }

        function calculatePos(_div, index, options, val, isHorizontal, attr) {
            var w = window.screen.width;
            var h = _div.parents('li:first').height();
            var dw = _div.width();
            var dh = _div.height();
            if (isHorizontal) {
                switch (val.toLowerCase()) {
                    case "left":
                        var _l = w * index;
                        _div.css('left', _l);
                        break;

                    case "right":
                        var _l = (w * (index + 1)) - dw;
                        _div.css('left', _l);
                        break;

                    case "center":
                        var _l = (w * index) + ((w - dw) / 2);
                        _div.css('left', _l);
                        break;

                    default:
                        var arr = val.split('-');
                        if (val.length > 1) {
                            switch (attr.toLowerCase()) {
                                case "right":
                                    var _r = arr[0];
                                    _div.css('right', _r).css("position", "absolute");

                                    options.right = arr[1];
                                    break;
                                case "left":
                                default:
                                    var _l = arr[0];
                                    _div.css('left', _l).css("position", "absolute");
                                    options.left = arr[1];
                                    break;
                            }
                        }
                        else {
                            if (attr.toLowerCase() == "right")
                                _div.css('right', val);
                            else
                                _div.css('left', val);
                        }
                        break;
                }
            }
            else {
                switch (val.toLowerCase()) {
                    case "top":
                        _div.css('top', "0px");
                        break;

                    case "bottom":
                        var _b = h - dh;
                        _div.css('top', _b);
                        break;

                    case "center":
                        var _b = (h - dh) / 2;
                        _div.css('top', _b);
                        break;

                    default:
                        var arr = val.split('-');
                        if (val.length > 1) {
                            switch (attr.toLowerCase()) {
                                case "bottom":
                                    _div.css('bottom', arr[0]).css("position", "absolute");
                                    options.bottom = arr[1];
                                    break;
                                case "top":
                                default:
                                    _div.css('top', arr[0]).css("position", "absolute");
                                    options.top = arr[1];
                                    break;
                            }

                        }
                        else {
                            if (attr.toLowerCase() == "bottom")
                                _div.css('bottom', val);
                            else
                                _div.css('top', val);
                        }
                        break;
                }
            }
            return options;
        }

        //reload the page when browser size changed
        var width = $('body').width();
        $(window).resize(function () {

            if (width != $('body').width()) {
                width = window.screen.width;
                window.location.reload();
            }
        });

    };

    //  Create a jQuery plugin
    $.fn.unslider = function (o) {
        var len = this.length;

        //  Enable multiple-slider support
        return this.each(function (index) {
            //  Cache a copy of $(this), so it
            var me = $(this),
                key = 'unslider' + (len > 1 ? '-' + ++index : ''),
                instance = (new Unslider).init(me, o);

            //  Invoke an Unslider instance
            me.data(key, instance).data('key', key);
        });
    };

    Unslider.version = "1.0.0";
})(jQuery, false);
