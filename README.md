Chain-Slider
==============


Demo link:  http://aerbey.github.io/Chain-Slider

Chain-Slider Documentation:

usage:

<b> initialize: </b>
$('.slider').chain({});


<b>Slider items:</b>
use this parameters to enable effects

<b>data-animate="true"</b>  (for an item inside slider if you want it to animate add this)

<b>data-type="fadein(delay:0, speed:500)"</b>    (this defines the effect type) 
possible data-type parameters  (fadein | fadeout | slideup | slidedown | rotate | flip | css | toggleclass | move)
<br>Examples:<br>
data-type="fadein(delay:2800, speed:200)+fadeout(delay:7000,speed:200)" <br>
data-type="fadein(delay:7000, speed:200)+move(easing:swing,delay:7100, speed:500, left:56%>72%, bottom:66%>91%)+rotate(delay:7100, angle: 0, animateTo: 360, duration:1000, easing:swing)"

<b>data-position="left:30%, bottom:0%" </b>  (item position where the effect will end)
 
Example item that will animate:
<div data-animate="true" data-type="fadeIn(delay:25000, speed:3200)" data-position="right: 8%, top:20%;">
