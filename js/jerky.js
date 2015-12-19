$(function()
{
	// Apply the validator if available
	if (jQuery().validate)
	{
		$('form').validate();

		/*
		TODO, Implement Geoff's fix for the double form issue
		Gonna research it a bit more, I'm still perplexed why this wouldn't fire for each selector already
		var f = $('form');
		if(f.length > 0){
			$(f).each(function(i, form){
				$(form).validate();
			});
		}
		*/
	}

	// Catches forms being submitted
	$('.ajax [type=submit]').on('click', function()
	{
		if ($(this).attr('readonly') == 'readonly')
		{
			return;
		}

		// Grabs the form
		var form = $(this).parents('form').get();

		// Removes any messages
		$('.alert[generated], label.error', form).remove();

		// Checks that it's valid
		if (typeof $(form).valid == 'undefined' || $(form).valid() == true)
		{
			if (typeof $(form).data('readonly') == undefined || $(form).data('readonly') != false)
			{
				// Sets the buttons, inputs and textareas to READONLY
				$('button, input, textarea', form).attr('readonly', 'readonly');

				// Forces the cursor to be waiting
				document.body.style.cursor = 'wait';

				// Swaps the button for a progress meter
				$(this).hide();
				$(this).after('<progress></progress>');
			}

			var method = $(form).attr('method') == '' ? 'GET' : $(form).attr('method');
			var action = $(form).attr('action');

			if (action == '')
			{
				injectMessage(form, 'Form element lacks action attribute', 'error');

				// Removes READONLY status
				$('button, input, textarea', form).removeAttr('readonly');

				// Returns the cursor to normal... but is anyone really normal?
				document.body.style.cursor = 'default';

				// Brings the button back
				$('progress', form).remove();
				$('[type="submit"]', form).show();
			}
			else
			{
				var payload = $(form).serialize();
				var cleared = (typeof $(form).data('readonly') != undefined && $(form).data('readonly') == false);

				if (cleared)
				{
					if (typeof $(form).data('preprocessor') != undefined)
					{
						window[$(form).data('preprocessor')]();
					}

					$('input[type=text]', form).val('');
					$('select',           form).val('');
					$('textarea',         form).val('');

					if (typeof $(form).data('focus') != undefined)
					{
						$($(form).data('focus')).focus();
					}
				}

				$.ajax({
					'type':     method,
					'url':      action,
					'data':     payload,
					'dataType': 'json',

					'success': function(data, textStatus, XMLHttpRequest)
					{
						if (typeof data.success != 'undefined')
						{
							data.status  = 'success';
							data.message = data.success;
						}
						else if (typeof data.error != 'undefined')
						{
							data.status  = 'error';
							data.message = data.error;
						}

						if (data.status != 'success' && typeof data.message != 'undefined')
						{
							injectMessage(form, data.message, 'error');
						}
						else if (data.status == 'success')
						{
							if ((typeof data.retain == 'undefined' || data.retain == false) && !cleared)
							{
								$('input[type=text]',  form).val('');
								$('input[type=email]', form).val('');
								$('select',            form).val('');
								$('textarea',          form).val('');
							}

							if (typeof data.message != 'undefined')
							{
								injectMessage(form, data.message, 'success');
							}

							if (typeof data.url != 'undefined')
							{
								parent.location.href = data.url;
							}
						}
						else
						{
							// Only really serves a purpose when debugging
							//injectMessage(form, data, 'error');
						}

						if (typeof data.callback != 'undefined')
						{
							window[data.callback](data);
						}

						// Removes READONLY status
						$('button, input, textarea', form).removeAttr('readonly');

						// Returns the cursor to normal... but is anyone really normal?
						document.body.style.cursor = 'default';

						// Brings the button back
						$('progress', form).remove();
						$('[type="submit"]', form).show();
					},

					'error': function(XMLHttpRequest, textStatus, errorThrown)
					{
						injectMessage(form, errorThrown, 'error');

						// Removes READONLY status
						$('button, input, textarea', form).removeAttr('readonly');

						// Returns the cursor to normal... but is anyone really normal?
						document.body.style.cursor = 'default';

						// Brings the button back
						$('progress', form).remove();
						$('[type="submit"]', form).show();
					}
				});
			}
		}
		else
		{
			return false;
		}
	});

	// Forces forms to return false on submit
	$('form.ajax').submit(function(){ return false; });

	// Automatically applies zebra stripes to tables
	$('table tr:even td').addClass('even');
	$('table tr:odd td').addClass('odd');
});

// Injects a div before the passed element
function injectMessage(element, message, type, duration)
{
	if (typeof type == 'undefined')
	{
		var type = 'error';
	}

	var id         = 'alert-' + Date.now();
	var class_name = 'alert ' + type;
	var label      = '<label id="' + id + '" class="' + class_name + '" generated="generated">' + message + '</label>';

	$('.alert[generated]', element).remove();

	if ($(element).hasClass('box') || $(element).parent('.two-column'))
	{
		$('[type="submit"]', element).before(label);
	}
	else
	{
		$(element).prepend(label);
	}

	id = '#' + id;

	if (typeof duration != 'undefined')
	{
		$(id, element).delay(duration).remove();
	}

	return $(id, element);
}

// Automatically tab to next element when max length is reached
function autoTab(element)
{
	if ($(element).val().length >= $(element).attr('maxlength'))
	{
		$(element).next().focus();
	}
}

// Disable Enter Key
function disableEnterKey(e)
{
	var key;

	if(window.event)
	{
		key = window.event.keyCode; // IE
	}
	else
	{
		key = e.which; // Firefox
	}

	return (key != 13);
}

// Truncate a string and optionally create a roll over
function truncate(string, length, hover)
{
	if (string.length > length)
	{
		if (hover == true)
		{
			string = '<span title="' + string + '">' + string.substring(0, length) + '...</span>';
		}
		else
		{
			string = string.substring(0, length) + '...';
		}
	}

	return string;
}

function getQueryStringVariable(variable)
{
	variable    = variable.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS  = "[\\?&]" + variable + "=([^&#]*)";
	var regex   = new RegExp(regexS);
	var results = regex.exec(window.location.search);

	if (results === null)
	{
		return null;
	}
	else
	{
		return decodeURIComponent(results[1].replace(/\+/g, " "));
	}
}

function getGUID()
{
	var guid;
	var unique = false;

	while (unique == false)
	{
		guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c)
		{
			var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});

		guid = 'guid-' + guid;

		if ($('#' + guid).length == 0)
		{
			unique = true;
		}
	}

	return guid;
}
