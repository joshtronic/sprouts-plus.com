$(function()
{
	$('.nav a').click(function()
	{
		$('.nav li').removeClass('active');
		$(this).parent().addClass('active');
	});

	$('.image').click(function()
	{
		var new_src = $('img', this).attr('src');

		if ($('#zoom').attr('src') == new_src)
		{
			new_src = '/images/zoom.png';
		}

		$('#zoom').attr('src', new_src);
	});
});
