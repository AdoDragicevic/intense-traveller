// If user did not enter any personal data, placeholder will fill in the input area. However, if user has provided certain personal data - and not all personal data - we want to hide all placeholders, as displaying them offers bad user experience. I.e. user leaves empty hobbies, and when he retunrs to the edit page, he is wondering if the placeholder is a placeholder or the data that is showed to other users.


$(".pdInput").each(function(){
	// if even one input is filled in, then all inputs will be without placeholders
	if($(this).attr("value") !== ""){
		$(".pdInput").each(function(){
			$(this).removeAttr("placeholder");
		}); 
	}					   
});