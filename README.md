Chain-Slider
==============


Demo link:  http://aerbey.github.io/Chain-Slider

Chain-Slider Documentation:

usage:
initialize:
$('.slider').chain({});


Slider items:
use this parameters to enable effects

data-animate="true"  (for an item inside slider if you want it to animate add this)

data-type="fadein(delay:0, speed:500)"    (this defines the effect type) 
possible data-type parameters  (fadein | fadeout | slideup | slidedown | rotate | flip | css | toggleclass | move)
Examples:
data-type="fadein(delay:2800, speed:200)+fadeout(delay:7000,speed:200)" 
data-type="fadein(delay:7000, speed:200)+move(easing:swing,delay:7100, speed:500, left:56%>72%, bottom:66%>91%)+rotate(delay:7100, angle: 0, animateTo: 360, duration:1000, easing:swing)"

data-position="left:30%, bottom:0%"   (item position where the effect will end)
 
Example item that will animate:
<div data-animate="true" data-type="fadeIn(delay:25000, speed:3200)" data-position="right: 8%, top:20%;">
