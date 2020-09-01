// I could not only use toggleClass, because the navbar is hiddent not only when navbar button is clicked, but also when the screen size changes. This can lead to class remaining on the navbar even after the screen size is increased, and then being hidden once the but

$(".navbar > button").on("click", function(){	
	if($(".navbar").height() > 100){
		$(".navbar").removeClass("navBg");
	}else{
		$(".navbar").addClass("navBg");
	}		
});
		
$(window).resize(function(){
	if( $(window).width() > 989 ){
		$(".navbar").removeClass("navBg");
	}
	if( $(window).width() < 989 && $(".navbar").height() > 200 ){
		$(".navbar").addClass("navBg");
	}
});