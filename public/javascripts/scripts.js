$(document).ready((e)=>{
	var $grid = $('.grid').isotope({})
	$("#top-rated").click(()=>{
		$grid.isotope({filter: '.top-rated'});
	});
	$("#worst-rated").click(()=>{
		$grid.isotope({filter: '.worst-rated'});
	});
	$("#all-bands").click(()=>{
		$grid.isotope({filter: ''});
	});
})