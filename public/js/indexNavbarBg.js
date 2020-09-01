// add bg collor when navbar is expanded	
$(".navbar > button").on("click", function(){	
	if($(".navbar").height() > 100){
		$(".navbar").removeClass("scrolled");
	}else{
		$(".navbar").addClass("scrolled");
	}
});
	
// remove bg color when screen size is so wide that navbar is no longer extended, add back when it is
$(window).resize(function(){
	if( $(window).width() > 989 ){
		$(".navbar").removeClass("scrolled");
	}
	if( $(window).width() < 989 && $(".navbar").height() > 200 ){
		$(".navbar").addClass("scrolled");
	}
});
	
// set bg to navbar when page is scrolled
$(document).scroll(function () {
	$(".navbar").toggleClass('scrolled', $(this).scrollTop() > $(".jumbotron").height());
});