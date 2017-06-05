var sortable = 0;
/*Sorting all li's under the the ul's reponses, then_response and else_response.*/
$('#responses, #then_response, #else_response').sortable ({
	connectWith: '.connectedSortable',
	/*Enable Drag & Drop when list is empty.*/
	dropOnEmpty: true,
	placeholder: "highlight",
	cursor: "grabbing",
	handle: ".fa-reorder",
	start: function(event, ui) {
		/*Get the parent of the current element.*/
		var item = ui.item;
		/*Store the source element information while the drag starts.*/
		item.data('parent', item.parent());
		item.data('source_prefix', item.parent().data('prefix'));
		$('.highlight').height(item.css('height'));
		ui.item.css('border', '1px solid black');
	},
	update: function(event, ui) {
		var thrash = 0;
		/*Current Item*/
		var current_item = ui.item;
		/*Initialize data for updating the new indices of the element being dragged.*/
		var data = {};
		data.new_index = current_item.index();

		console.log(data.new_index);		
		data.data_prefix = current_item.parent().data('prefix');
		data.old_html = String(current_item.html());
		/*Check for each action type and update indices accordingly*/
		if (current_item.attr('class').includes('text')) {
			data.old_name = current_item.find('label').attr('for');
			data.index_suffix = '][system_render_text]';
		} else if (current_item.attr('class').includes('text_with_buttons')) {
			data.old_name = current_item.find('.response-body').children().eq(0).attr('name');
			data.index_suffix = '][render_text_with_buttons]';
		} else if (current_item.attr('class').includes('quick_reply')) {
			data.old_name = current_item.find('.response-body').children().eq(0).attr('name');
			data.index_suffix = '][system_render_question]';
		} else if (current_item.attr('class').includes('receipt')) {
			data.old_name = current_item.find('input').attr('name');
			data.index_suffix = '][system_render_receipt]';
		} else if (current_item.attr('class').includes('carousel'))  {
			data.old_name = current_item.find('input.carousel_results_path').attr('name');
			data.index_suffix = '][system_render_carousel]';
		} else if (current_item.attr('class').includes('save_settings'))  {
			data.old_name = current_item.find('ul').data('prefix');
			data.index_suffix = '][system_save_settings]';
		} else if (current_item.attr('class').includes('delete_settings'))  {
			data.old_name = current_item.find('ul').data('prefix');
			data.index_suffix = '][system_delete_settings]';
		} else if (current_item.attr('class').includes('save_to_list'))  {
			data.old_name = current_item.find('div.details>div>input').attr('name');
			data.index_suffix = '][system_save_to_list]';
		} else if (current_item.attr('class').includes('delete_from_list'))  {
			data.old_name = current_item.find('div.details>div>input').attr('name');
			data.index_suffix = '][system_delete_from_list]';
		} else if (current_item.attr('class').includes('add_intent'))  {
			data.old_name =current_item.find('.response-body').find('select').attr('name');
			data.index_suffix = '][system_render_intent]';
		} else if (current_item.attr('class').includes('next_intent')) {
			data.old_name = current_item.find('.response-body').find('select').attr('name');
			data.index_suffix = '][system_next_intent]';
		} else if (current_item.attr('class').includes('add_webhook')) {
			data.old_name = current_item.find('.response-body').find('select').attr('name');
			data.index_suffix = '][system_invoke_webhook]';
		} else if (current_item.attr('class').includes('send_email')) {
			data.old_name = current_item.find('.response-body').find('input').attr('name');
			data.index_suffix = '][system_send_email]';
		}
		/*Still working on this. Need to update each element individually to ensure that drag and drop is not lost. (and optimize it)*/
		else if (current_item.attr('class').includes('ifte')) {
			var matches = /\d+/g;
			var old_name = current_item.find('#type-ahead-data-source').attr('name');
			var num_list = old_name.match(matches);
			var old_index = num_list[num_list.length-1];
			var new_index = current_item.index();
			var suffix = '[' + old_index + '][system_if][lhs]';

			if (old_index == 0) {
				var suffix = '[][system_if][lhs]';
			}
			var index = old_name.indexOf(suffix);
			var rep_string = old_name.substr(0, index);

			if (old_index == 0 || old_index == undefined) {
				rep_string = rep_string.replace('[]', '[' + new_index + ']');
			}
			else {
				rep_string = rep_string.replace(old_index, new_index);
			}
			var old_prefix = current_item.find('#type-ahead-data-source').attr('name').replace('[lhs]','');
			var old_html = String(current_item.html());
			old_html=old_html.split(rep_string).join(current_item.parent().data('prefix'));
			current_item.html(old_html); 
		}

		/*Handle all actions except ifte which requires custom handling*/
		if (!current_item.attr('class').includes('ifte')) {
			new_html = replaceHtml(data);
			current_item.html(new_html);
		}

		/*Prefix and Children associated with the source*/
		var source_prefix = current_item.data('source_prefix');
		var source_children = $(current_item.data('parent')).children();	

		/*Prefix and Children associated with the target*/
		var target_prefix = current_item.parent().data('prefix');
		var target_children = $(current_item.parent()).children();

		/*Update the siblings of the source and target*/
		if (source_prefix == target_prefix) {
			updateSiblings(source_prefix, source_children);
		} else {
			updateSiblings(target_prefix, target_children);
			updateSiblings(source_prefix, source_children);
		}
	},
	stop: function(event, ui) {
		ui.item.css('border', 'none');
	}	
});

/*Function to update the source/target siblings indices.
  Parameters: Source/Target data-prefix, corresponding child elements*/
function updateSiblings(prefix, children) {
	for (var i=0; i < children.length; i++) {
		var child = children.eq(i);
		var sibling_data = {};
		sibling_data.old_html = $(child).html();
		sibling_data.prefix = prefix;
		sibling_data.new_index = prefix + '[' + i + ']';

		if (child.attr('class').includes('text_with_buttons')) {
			sibling_data.name = $(child).find('.response-body').children().eq(0).attr('name');
			new_html = updateSiblingsHtml(sibling_data);
			$(child).html(new_html);

		} else if (child.attr('class').includes('text')) {
			label_for = child.find('label').attr('for');
			pre = prefix + '[';
			var for_val = $(child).find('label').attr('for');
			for_val = for_val.split(pre + label_for[pre.length] + ']').join(pre + i + ']');
			$(child).find('label').attr('for', for_val);
			var area_name = $(child).find('textarea').attr('name');
			area_name = area_name.split(pre + label_for[pre.length] + ']').join(pre + i + ']');
			$(child).find('textarea').attr('name', area_name);
		} else if (child.attr('class').includes('ifte')) {
			area_name = child.find('#type-ahead-data-source').attr('name');
			pre = prefix + '[';
			for (var k=0; k < $(child).find("label[for*='"+pre+"']").length; k++) {
				var old_name = $(child).find("label[for*='"+pre+"']").eq(k).attr('for');
				old_name = old_name.replace(pre + area_name[pre.length] + ']', pre + i + ']');
				$(child).find("label[for*='"+pre+"']").eq(k).attr('for', old_name);
			}
			for (var k=0; k < $(child).find("input[name*='"+pre+"']").length; k++) {
				var old_name = $(child).find("input[name*='"+pre+"']").eq(k).attr('name');
				old_name = old_name.replace(pre + area_name[pre.length] + ']', pre + i + ']');
				$(child).find("input[name*='"+pre+"']").eq(k).attr('name', old_name);
			}

			for (var k=0; k < $(child).find("select[name*='"+pre+"']").length; k++) {
				var old_name = $(child).find("select[name*='"+pre+"']").eq(k).attr('name');
				old_name = old_name.replace(pre + area_name[pre.length] + ']', pre + i + ']');
				$(child).find("select[name*='"+pre+"']").eq(k).attr('name', old_name);
			}

			for (var k=0; k < $(child).find("ul[data-prefix*='"+pre+"']").length; k++) {
				var old_name = $(child).find("ul[data-prefix*='"+pre+"']").eq(k).data('prefix');
				old_name = old_name.replace(pre + area_name[pre.length] + ']', pre + i + ']');
				$(child).find("ul[data-prefix*='"+pre+"']").eq(k).data('prefix', old_name);
			}

			for (var k=0; k < $(child).find("textarea[name*='"+pre+"']").length; k++) {
				var old_name = $(child).find("textarea[name*='"+pre+"']").eq(k).attr('name');
				old_name = old_name.replace(pre + area_name[pre.length] + ']', pre + i + ']');
				$(child).find("textarea[name*='"+pre+"']").eq(k).attr('name', old_name);
			}
		} else if (child.attr('class').includes('quick_reply')) {
			sibling_data.name = $(child).find('.response-body').children().eq(0).attr('name');
			new_html = updateSiblingsHtml(sibling_data);
			$(child).html(new_html);
		} else if (child.attr('class').includes('receipt')) {
			sibling_data.name = $(child).find('input').attr('name');
			new_html = updateSiblingsHtml(sibling_data);
			$(child).html(new_html);
		} else if (child.attr('class').includes('carousel')) {
			sibling_data.name = $(child).find('input').attr('name');
			new_html = updateSiblingsHtml(sibling_data);
			$(child).html(new_html);
		} else if (child.attr('class').includes('save_settings')) {
			sibling_data.name = $(child).find('ul').data('prefix');
			new_html = updateSiblingsHtml(sibling_data);
			$(child).html(new_html);
		} else if (child.attr('class').includes('delete_settings')) {
			sibling_data.name = $(child).find('ul').data('prefix');
			new_html = updateSiblingsHtml(sibling_data);
			$(child).html(new_html);
		} else if (child.attr('class').includes('save_to_list')) {
			sibling_data.name = $(child).find('div.details>div>input').attr('name');
			new_html = updateSiblingsHtml(sibling_data);
			$(child).html(new_html);
		} else if (child.attr('class').includes('delete_from_list')) {
			sibling_data.name = $(child).find('div.details>div>input').attr('name');
			new_html = updateSiblingsHtml(sibling_data);
			$(child).html(new_html);
		} else if (child.attr('class').includes('add_intent')) {
			sibling_data.name = $(child).find('.response-body').find('select').attr('name');
			new_html = updateSiblingsHtml(sibling_data);
			$(child).html(new_html);
		} else if (child.attr('class').includes('next_intent')) {
			sibling_data.name = $(child).find('.response-body').find('select').attr('name');
			new_html = updateSiblingsHtml(sibling_data);
			$(child).html(new_html);
		} else if (child.attr('class').includes('add_webhook')) {
			sibling_data.name = $(child).find('.response-body').find('select').attr('name');
			new_html = updateSiblingsHtml(sibling_data);
			$(child).html(new_html);
		} else if (child.attr('class').includes('send_email')) {
			sibling_data.name = $(child).find('.response-body').find('input').attr('name');
			new_html = updateSiblingsHtml(sibling_data);
			$(child).html(new_html);
		}
	} 
 }

/*Replaces the old HTML String with the new prefix and indices.
  Parameters: key-value pairs
  Return: Updated HTML*/
function replaceHtml(data) {
	/*Regular expression to get the list of indices in a prefix.*/
	var matches = /\d+/g;
	var num_list = data.old_name.match(matches);
	var old_index = num_list[num_list.length-1];
	var new_index = data.new_index;

	/*Identify the replacement string.*/
	var suffix = '[' + old_index + data.index_suffix;
	var index = data.old_name.indexOf(suffix);
	var rep_string = data.old_name.substr(0, index);
	var new_suffix = '[' + new_index + data.index_suffix;

	var old_html = String(data.old_html);

	/*Replace the old index suffix with the new index suffix.*/
	old_html = old_html.split(suffix).join(new_suffix);
	/*Replace the prefix to that of the target.*/
	old_html = old_html.split(rep_string).join(data.data_prefix);
	return old_html;
}

/*Updates the new indices for the source and target siblings*/
function updateSiblingsHtml(data) {
	var pre = data.prefix + '[';
	var rep = pre + data.name[pre.length] + ']';
	var old_html = data.old_html.split(rep).join(data.new_index);
	return old_html;
}