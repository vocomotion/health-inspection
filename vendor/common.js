/*
	Chicago Restaurant Health Inspections
	Written by: Freddie Feldman 
*/

	$("#buttonSearch").on("click", function() {
		var term = $("#inputTerm").val().toUpperCase();
		
		if (term != "")
		{
			// Show loading icon
			$("#loading").fadeIn();

			// Do some animation/cleanup of UI
			$("#divHeader").slideUp();
			$("header.masthead").animate({"padding-top": "1em", "padding-bottom": "1em"});
			
			// Perform SoQL search
			$.ajax({
			    url: "https://data.cityofchicago.org/resource/cwig-ma7x.json",
			    type: "GET",
			    data: { "$where" : "UPPER(aka_name) like '%" + term + "%'", "$limit" : 500, "facility_type" : "Restaurant" }
			}).done(function(data) {
				// Hide loading icon
				$("#loading").fadeOut();
				$("#errorresults").fadeOut();
				$(".resultRestaurant").remove();	// Clear the list each time
				
				if (data.length == 0)
				{
					// Found nothing
					$("#noresults").fadeIn();
					$("#resultsinfo").hide();
				}
				else
				{
					// Display results
					$("#noresults").fadeOut();
					$("#intResultCount").text(data.length);
					$("#resultsinfo").fadeIn();

					for (var i = 0, len = data.length; i < len; i++) 
					{
					  addResult(data[i]);
					}
				}
				$('[data-toggle="tooltip"]').tooltip();
			}).fail(function (jqXHR, textStatus, errorThrown) {
				// Something blew up. Let user know
				$("#errorresults").fadeIn();
			});
		}
		else
		{
			$("#inputTerm").addClass("active").focus();
		}
	});


	// Trap for enter key
	$.fn.enterKey = function (fnc) {
	    return this.each(function () {
	        $(this).keypress(function (ev) {
	            var keycode = (ev.keyCode ? ev.keyCode : ev.which);
	            if (keycode == '13') {
	                fnc.call(this, ev);
	            }
	        })
	    })
	}


	String.prototype.replaceAll = function (find, replace) {
    	var str = this;
    	return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
	};


	function addResult(data)
	{
		// Use correct class for each result type
		switch (data.results.toUpperCase())
		{
			case "PASS":
				var resultsClass = "passed";
				break;

			case "FAIL":
				var resultsClass = "failed";
				break;

			case "PASS W/ CONDITIONS":
				var resultsClass = "pass_w_cond";
				break;
		}

		// Clean up the violations text, insert blank line when you find a |
		if (data.violations) { data.violations = data.violations.replaceAll(" | ", "<br/><br/>"); }

		// Only show the first 100 characters and allow user to "see more" later
		if (data.violations && data.violations.length > 99)
		{
			var full_text = data.violations.substring(0, 100)+"<span class='text_desc_more hide'>"+data.violations.substring(100)+"</span>";
			var displayMore = "show";
		}
		else
		{
			var full_text = data.violations;
			var displayMore = "hide";
		}

		// Clone the template div and fill it out with data
		$("#templateRestaurant").clone().prop("id", "insp_id_"+data.inspection_id).addClass("resultRestaurant").appendTo("#listRestaurants").show()
			.find(".textRestaurant").text(data.dba_name).parent()
			.find(".textAddress").text(data.address.trim() + ", " + data.city + ", " + data.state + " " + data.zip).parent()
			.find(".textDesc").html(full_text).parent()
			.find(".textStatus").addClass(resultsClass).attr("title", data.results + ": "+data.inspection_type).parent()
			.find(".buttonReadMore").addClass(displayMore).on("click", function(){ 
				$(this).parent().find(".text_desc_more").toggle();
				if ($(this).text() == "See more...") { $(this).text("See less..."); } else { $(this).text("See more..."); }
			}).parent()
			.find(".buttonMap").on("click", function(){ 
				showMap();
			});
	}	


	// When page is ready, set up tooltips.
	$(document).ready(function(){
		$('[data-toggle="tooltip"]').tooltip();

		// If user hits return key in search input, automatically click Search Now button
		$("#inputTerm").enterKey(function () { $("#buttonSearch").click(); });
	});
