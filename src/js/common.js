(function() {

	var controlStatus = (function() {
		var keys = null;
		var modifiers = null;
		var mainSelections = null;
		var mixSelections = null;
		var synbolWrapper = null;
		var preview = null;
		var keySelects = []
		var modifierSelects = [];
		var applyType = "self";
		return {
			mainSelections: function(e) {
				if(e) mainSelections = e;
				return mainSelections;
			},
			mixSelections: function(e) {
				if(e) mixSelections = e;
				return mixSelections;
			},
			preview: function(e) {
				if(e) preview = e;
				return preview;
			},
			symbol: function(e) {
				if(e) synbolWrapper = e;
				return synbolWrapper;
			},
			keys: function(obj) {
				if(obj) keys = obj;
				return keys;
			},
			modifiers: function(obj) {
				if(obj) modifiers = obj;
				return modifiers;
			},
			applyType: function(type) {
				if(type) applyType = type;
				return applyType;
			},
			applyTypeToggle: function() {
				if(applyType == "self") {
					applyType = "child";
				} else {
					applyType = "self";
				}
				return applyType;
			}
		}
	})();

	var isObject = function(data) {
		return (Object.prototype.toString.call(data) == '[object Object]') ? true : false;
	}

	var isArray = function(data) {
		return data instanceof Array;
	}

	var getBrowserName = function() {
		var ua = window.navigator.userAgent.toLowerCase();
		var ver = window.navigator.appVersion.toLowerCase();
		var name = "unknown";
		if(ua.indexOf(ua.indexOf("trident/7") != -1)) {

		}
	}

	var toArray = function(arrayLike) {
		return Array.prototype.slice.call(arrayLike);
	}

	var copyTextToClipboard = function(e) {
		e.select();
		return document.execCommand("copy");
	}

	var getJSON = function(file, callback) {
		var request = new XMLHttpRequest();
		request.open("GET", file);
		request.onreadystatechange = function() {
			if(this.readyState == 4 && this.status == 200) {
				callback(JSON.parse(this.responseText));
			}
		}
		request.send();
	}

	var getFilterDoubleArray = function(array) {
		return array.filter(function(value, i, self) {
			return self.indexOf(value) === i && i !== self.lastIndexOf(value);
		});
	}

	var getFilterNonDoubleArray = function(array) {
		return array.filter(function(value, i, self) {
			return self.indexOf(value) === i;
		});
	}

	var getFilterNonDoubleOptions = function(optionArray, isGroup) {
		var optionLabels = null;
		if(isGroup) {
			optionLabels = getOptionInGroupLabels(optionArray);
			return optionArray.filter(function(option, i) {
				return optionLabels.indexOf(option.parentNode.label) === i;
			});
		} else {
			optionLabels = getOptionLabels(optionArray);
			return optionArray.filter(function(option, i) {
				return optionLabels.indexOf(option.label) === i;
			});
		}
	}

	var getSelectedOptions = function(selectbox) {
		var optionTagArray = toArray(selectbox.getElementsByTagName("option"));
		return optionTagArray.filter(function(optionTag) {
			if(optionTag.selected) return optionTag;
		});
	}

	var getOptionLabels = function(optionTagArray) {
		return optionTagArray.map(function(optionTag) {
			return optionTag.label;
		});
	}

	var getOptionInGroupLabels = function(optionTagArray) {
		return optionTagArray.map(function(optionTag) {
			return optionTag.parentNode.label;
		});
	}

	var getAllSelectedOptions = function() {
		return {
			"mainSelections": getSelectedOptions(controlStatus.mainSelections()),
			"mixSelections": getSelectedOptions(controlStatus.mixSelections())
		}
	}

	var getAllFilterSelectedOptions = function() {
		var allSelectedOptionTags = getAllSelectedOptions();
		var filteredMainSelection = getFilterNonDoubleOptions(allSelectedOptionTags.mainSelections, true);
		var allFilteredOptionTags = filteredMainSelection.concat(allSelectedOptionTags.mixSelections);
		return getFilterNonDoubleOptions(allFilteredOptionTags);
	}

	var getSelectedModifire = function(labelName) {
		return getAllSelectedOptions().mainSelections.filter(function(optionTag) {
			if(optionTag.parentNode.label == labelName) {
				return optionTag;
		}});
	}

	var createElement = function(obj) {
		var e = document.createElement(obj.tagName);
		if(obj.text) e.textContent = obj.text;
		if(obj.attr) {
			for(attr in obj.attr) {
				if(attr == "class" && isArray(obj.attr[attr])) {
					obj.attr[attr].forEach(function(className) {
						e.classList.add(className);
					});
				} else {
					e.setAttribute(attr, obj.attr[attr]);
				}
			}
		}
		return e;
	}

	var createOptions = function(array) {
		var optionTagArray = array.map(function(val) {
			return createElement({"tagName": "option", "text": val, "attr": {"label": val}});
		});
		return optionTagArray;
	}

	var createOptgroups = function(obj) {
		var opgroupsArray = [];
		for(var key in obj) {
			var optgroup = createElement({"tagName": "optgroup", "attr": {"label": key}});
			createOptions(obj[key]).forEach(function(optionTag) {
				optgroup.appendChild(optionTag);
			});
			opgroupsArray.push(optgroup);
		}
		return opgroupsArray;
	}

	var createSelectbox = function(optionData, classes) {
		var selectbox = document.createElement("select");
		var opgroups = createOptgroups(optionData);
		opgroups.forEach(function(optionTag) {
			selectbox.appendChild(optionTag);	
		});
		if(classes) {
			if(isArray(classes)) {
				classes.forEach(function(className) {
					selectbox.classList.add(className);
				})
			} else {
				selectbox.classList.add(classes);
			}
		}
		setSelectboxSize(selectbox);
		selectbox.addEventListener("change", function() {
			checkChangeApplyType(this);
			setPreviewValue(getOptionLabels(getAllFilterSelectedOptions()));
			setSelectboxSize(this);
		}, false);
		return selectbox;
	}

	var checkChangeApplyType = function(selectbox) {
		var selectedOptionTag = getSelectedOptions(selectbox)[0];
		if(selectedOptionTag.parentNode.label == "Children") {
			controlStatus.applyType("child");
			var applyTypeIcon = document.querySelector(".tools_applyChangeButton");
			applyTypeIcon.classList.add("children");
		}
	}

	var createGroup = function(array) {
		var groupTag = createElement({"tagName": "span", "attr": {"class": ["group"]}});
		array.forEach(function(e) {
			groupTag.appendChild(e);
		});
		return groupTag;
	}

	var setSelectboxSize = function(selectbox) {
		var selectedOption = getSelectedOptions(selectbox)[0];
		var textWidth = getTextWidth(selectedOption.label);
		selectbox.setAttribute("style", "width: " + (textWidth + 4) + "px");;
		return selectbox;
	}

	var setPreviewInputValue = function(valueStr) {
		var input = document.getElementsByClassName("testArea_preview_valueName")[0];
		input.value = valueStr;
		input.size = input.value.length;
		return input;
	}

	var getFixedValueStr = function(valueArray) {
		var fixedValueList = [];
		valueArray.forEach(function(value, i) {
			if(value == "none") return;
			if(i !== 0 && value.slice(0, 1) == "@") return fixedValueList.push(" " + value);
			fixedValueList.push(value);
		});
		return fixedValueList.join("");
	}

	var getTextWidth = function(text) {
		var footer = document.querySelector("footer")
		var span = document.createElement("span");
		span.textContent = text;
		span.classList.add("dummy");
		document.body.appendChild(span);
		setTimeout(function() {
			document.body.removeChild(span);
		}, 0);
		return span.offsetWidth || 0;
	}

	var setPreviewValue = function(classes) {
		var symbol = controlStatus.symbol();
		var preview = controlStatus.preview();
		addPreviewClass(symbol, classes);
		addPreviewClass(preview, classes);
		setPreviewInputValue(getFixedValueStr(classes));
	}

	var isContainsAnimationClass = function(classes) {
		return classes.some(function(className) {
			return className.slice(0, 1) == "@";
		});
	}

	var isContainsChildrenModifier = function(classes) {
		var childrenModifiers = controlStatus.modifiers().Children;
		for(var className of classes) {
			for(var modifier of childrenModifiers) {
				if(className.indexOf(modifier) >= 0) {
					return true;
				}
			}
		}
	}

	var isAnimationClass = function(className) {
		return className.charAt(0) == "@";
	}

	var addPreviewClass = function(e, classes) {
		e.removeAttribute("class");
		e.offsetWidth = e.offsetWidth; // Animation Restart Trick
		animClass(e, classes.join(" "));
		return e;
	}

	var addKeySelectbox = function(target) {
		var selectbox = createSelectbox(controlStatus.keys(), ["key", "@sl-x_ease-back_speed-up+_lv-up", "@sc-x-in!", "@fd"]);
		return target.appendChild(selectbox);
	}

	var addTargetModifier = function(labelName, selectedLabel) {
		if(getSelectedModifire(labelName).length) return;
		var forChildModifier = addSelectboxControllSet({
			target: controlStatus.mainSelections(),
			button: createElement({"tagName": "span", "text": "-", "attr": {"class": "controlField_modifier-remove"}}),
			optionData: controlStatus.modifiers(),
			className: ["modifier"]
		});
		forChildModifier.selectbox.querySelectorAll("option").forEach(function(option) {
			if(option.label == selectedLabel) option.setAttribute("selected", "true");
		});
		setSelectboxSize(forChildModifier.selectbox)
	}

	var removeTargetModifier = function(labelName) {
		var childOrderOptionArray = getSelectedModifire(labelName);
		if(!childOrderOptionArray.length) return;
		childOrderOptionArray.forEach(function(optionTag) {
			var groupSet = optionTag.parentNode.parentNode.parentNode;
			groupSet.parentNode.removeChild(groupSet);
		});
	}

	var playListener = function() {
		var selectedOptionTagArray = getAllFilterSelectedOptions();
		setParameter(selectedOptionTagArray);
		setPreviewValue(getOptionLabels(selectedOptionTagArray));
	}

	var addPlayButton = function(target) {
		var playButton = createElement({
			"tagName": "input",
			"attr": {
					"class": ["controlField_play", "@sl-x!_delay_ease-back_speed-up_lv-up", "@sc-x-in!", "@fd"],
					"type": "button",
					"value": "Play"
				}
			});
		playButton.addEventListener("click", playListener, false);
		return target.appendChild(playButton);
	}

	var addSelectboxControllSet = function(obj) {
		var selectbox = obj.target.appendChild(createSelectbox(obj.optionData, obj.className));
		var button = obj.button;
		button.addEventListener("click", function() {
			this.parentNode.parentNode.removeChild(this.parentNode);
		}, false);
		var group = obj.target.appendChild(createGroup([button, selectbox]));
		animClass(group, "@bn-y:_speed-up++_lv-up++_origin-b_ascend @sl-y @sc-y-in @fd");
		return {
			"selectbox": selectbox,
			"button": button,
			"group": group
		}
	}

	var addMainController = function(target) {
		var mainContorolWrapper = target.appendChild(createElement({"tagName": "div", "attr": {"class": "controlField_main"}}));
		var mainSelections = createElement({"tagName": "div", "attr": {"class": "controlField_main_selections"}});
		mainContorolWrapper.appendChild(mainSelections);
		controlStatus.mainSelections(mainSelections);
		animClass(addFirstModifireAddButton(), "@bn_speed-up+_lv-up");
		addKeySelectbox(mainSelections);
		addPlayButton(mainContorolWrapper);

		function addFirstModifireAddButton() {
			var modifierAddButton = createElement({"tagName": "span", "text": "+", "attr": {"class": ["controlField_modifier-add"]}});
			modifierAddButton.addEventListener("click", function() {
				addSelectboxControllSet({
					target: mainSelections,
					button: createElement({"tagName": "span", "text": "-", "attr": {"class": "controlField_modifier-remove"}}),
					optionData: controlStatus.modifiers(),
					className: ["modifier"]
				});
			});
			mainSelections.parentNode.insertBefore(modifierAddButton, mainSelections.nextSibling);
			return modifierAddButton;
		}
	}

	var addMixController = function(target) {
		var mixContorolWrapper = target.appendChild(createElement({"tagName": "div", "attr": {"class": "controlField_mix"}}));
		var mixSelections = mixContorolWrapper.appendChild(createElement({"tagName": "div", "attr": {"class": "controlField_mix_selections"}}));
		controlStatus.mixSelections(mixSelections);
		addFirstKeyAddButton();

		function addFirstKeyAddButton() {
			var keyAddButton = createElement({"tagName": "span", "text": "+", "attr": {"class": ["controlField_key-add", "@bn_speed-up+_lv-up+++"]}});
			keyAddButton.addEventListener("click", function() {
				var eObj = addSelectboxControllSet({
					target: mixSelections,
					button: createElement({"tagName": "span", "text": "-", "attr": {"class": "controlField_key-remove"}}),
					optionData: controlStatus.keys(),
					className: ["key"]
				});
			}, false);
			mixSelections.parentNode.insertBefore(keyAddButton, mixSelections.nextSibling);
		}
	}

	var addControllField = function(selector) {
		var testArea = document.querySelector(selector);
		var fieldset = createElement({"tagName": "fieldset", "attr": {"class": "controlField"}});
		addMainController(fieldset);
		addMixController(fieldset);
		return testArea.insertBefore(fieldset, testArea.firstChild);
	}

	var assignChangeApplyType = function() {
		var button = document.querySelector(".tools_applyChangeButton");
		animClass(button, "@fl-z_lv-down++_origin-t");
		if(controlStatus.applyType() == "child") {
			button.classList.toggle("children");
		}
		button.addEventListener("click", function() {
			controlStatus.applyTypeToggle();
			this.classList.toggle("children");
			if(controlStatus.applyType() == "self") {
				removeTargetModifier("Children");
			} else {
				addTargetModifier("Children", "_child-ascend");
			}
			setPreviewValue(getOptionLabels(getAllFilterSelectedOptions()));
		}, false);
	}

	var assignInputClip = function(e) {
		e.addEventListener("click", function() {
			copyTextToClipboard(this);
			showCopied();
		});

		function showCopied() {
			var span = createElement({"tagName": "span", "text": "Copied", "attr": {"class": ["copied","@sc-in_speed-up+++_ease-out-back", "@fd"]}});
			controlStatus.preview().parentNode.appendChild(span);
			setTimeout(function() {
				span.remove()
			}, 1000)
		}
	}

	var changeApplyTypeFromParameter = function(modifiers) {
		var childrenModifierArray = controlStatus.modifiers().Children;
		var isSelf = modifiers.some(function(value) {
			for(var i = 0; i < childrenModifierArray.length; i++) {
				var childName = childrenModifierArray[i];
				if(childName == value) return true;
			}
		});
		if(isSelf) {
			controlStatus.applyType("child");
		} else {
			controlStatus.applyType("self");
		}
	}

	var setParameterSettings = function() {
		var parameterArray = getValidParameterArray();
		if(!parameterArray) return;
		var divisionedParameters = divisionValueArray(parameterArray);
		setParameterFirstSelectbox(divisionedParameters.firstKey);
		addSelectboxFromParameter(divisionedParameters.modifiers, "modifier");
		addSelectboxFromParameter(divisionedParameters.mixKey, "mix");
		changeApplyTypeFromParameter(divisionedParameters.modifiers);
		setPreviewValue(parameterArray);
		return true;

		function setParameterFirstSelectbox(parameter) {
			var selectbox = controlStatus.mainSelections().querySelectorAll("select.key")[0];
			var optionTags = toArray(selectbox.querySelectorAll("option"));
			for(var i = 0; i < optionTags.length; i++) {
				var optionTag = optionTags[i];
				if(optionTag.textContent == parameter.toLowerCase()) {
					optionTag.selected = true;
					break;
				}
			}
			setSelectboxSize(selectbox);
			return selectbox;
		}

		function addSelectboxFromParameter(parameterArray, type) {
			if(parameterArray.length == 0) return;
			var targetElm = null;
			var data = null;
			var selectClass = [];
			var buttonClass = "";
			if(type == "modifier") {
				targetElm = controlStatus.mainSelections();
				data = controlStatus.modifiers();
				selectClass = ["modifier"];
				buttonClass = "controlField_modifier-remove";
			} else if("mix") {
				targetElm = controlStatus.mixSelections();
				data = controlStatus.keys();
				selectClass = ["key"];
				buttonClass = "controlField_key-remove";
			}
			parameterArray.forEach(function(parameter) {
				var selectboxGroup = addSelectboxControllSet({
					target: targetElm,
					button: createElement({"tagName": "span", "text": "-", "attr": {"class": buttonClass}}),
					optionData: data,
					className: selectClass
				});
				var optionTags = toArray(selectboxGroup.selectbox.querySelectorAll("option"));
				for(var i = 0; i < optionTags.length; i++) {
					var optionTag = optionTags[i];
					if(optionTag.textContent == parameter.toLowerCase()) {
						optionTag.selected = true;
						break;
					}
				}
				setSelectboxSize(selectboxGroup.selectbox);
			});
		}
	}

	var divisionValueArray = function(parameterArray) {
		var firstKeyValue = parameterArray[0];
		var modifierValues = parameterArray.filter(function(value) {
			if(value.charAt(0) !== "@") return value;
		})
		var mixKeyValues = parameterArray.filter(function(value, i) {
			if(i !== 0 && value.slice(0, 1) == "@") return value;
		});
		return {
			firstKey: firstKeyValue,
			modifiers: modifierValues,
			mixKey: mixKeyValues
		}
	}

	var getValidParameterArray = function() {
		var parameter = location.href.split("?")[1];
		if(parameter == undefined) return false;
		var validParameterArray = filterValidValue(parameter.split("&"));
		if(validParameterArray.length == 0) return false;
		return validParameterArray;

		function filterValidValue(parameterArray) {
			var definedKeys = controlStatus.keys();
			var definedModifier = controlStatus.modifiers();
			var validValueArray = parameterArray.filter(function(value) {
				if(isValid(value)) return value;
			});
			return validValueArray;

			function isValid(value) {
				for(var label in definedKeys) {
					for(var i = 0; i < definedKeys[label].length; i++) {
						var text = definedKeys[label][i];
						if(text == value.toLowerCase()) return true;
					}
				}
				for(var label in definedModifier) {
					for(var i = 0; i < definedModifier[label].length; i++) {
						var text = definedModifier[label][i];
						if(text == value.toLowerCase()) return true;
					}
				}
				return false;
			}
		}
	}

	var addPreviewSample = function() {
		var sampleCount = 4;
		var currentClass = "isCurrent";
		var preview = controlStatus.preview().parentNode;
		var ul = createElement({"tagName": "ul", "attr": {"class": ["testArea_preview_menu"]}});
		for(var i = 0; i < sampleCount; i++) {
			var li = createElement({"tagName": "li", "text": i + 1});
			li.textConetnt = i;
			li.addEventListener("click", selectedSample, false);
			ul.appendChild(li);
		}
		ul.children[0].classList.add(currentClass);
		preview.appendChild(ul);

		function selectedSample() {
			if(this.classList.contains(currentClass)) return;
			toArray(this.parentNode.children).forEach(function(e) {
				if(e.classList.contains(currentClass)) {
					e.classList.remove(currentClass);
				}
			});
			this.classList.add(currentClass);
			preview.classList.forEach(function(className) {
				if(className.indexOf("testArea_preview_type-") >= 0) {
					preview.classList.remove(className)
				}
			});
			preview.classList.add("testArea_preview_type-" + this.textContent);
		}
	}

	var setParameter = function(array) {
		var preParameter = location.href.split("?")[1];
		var parameter = encodeURI(getOptionLabels(array).join("&"));
		if(preParameter !== parameter) {
			var newParameter = "?" + parameter;
			history.pushState(null, null, newParameter);
		}
	}

	var showLoadingScreen = function() {
		var screen = createElement({"tagName": "div", "attr": {"class": ["loading"]}});
		var logo = createElement({"tagName": "div", "text": "A.css", "attr": {"class": ["loading_A"]}});
		screen.appendChild(logo);
		document.body.appendChild(screen);
	}

	var removeLoadingScreen = function() {
		var screen = document.querySelector(".loading");
		screen.remove();
	}

	var assignChangeOrigin = function() {
		var currentClass = "isCurrent";
		var button = document.querySelector(".tools_changeOriginButton");
		var buttons = toArray(button.children);
		animClass(button, "@pr-up+++ @pr-in_child-descend-up+ @rt-y");
		var modifierBoxs = toArray(document.querySelectorAll("select.modifier"));
		var showOrigin = null;
		modifierBoxs.forEach(function(select) {
			var optionTag = getSelectedOptions(select)[0];
			if(/_origin-/.test(optionTag.label)) {
				return showOrigin = optionTag.label;
			}
		});
		if(showOrigin !== null) {
			buttons.forEach(function(button) {
				if(button.textContent == showOrigin) {
					button.classList.add(currentClass)
				}
			});
		}
		toArray(buttons).forEach(function(li) {
			li.addEventListener("click", function() {
				var originName = li.textContent;
				removeClassBrother(this, currentClass);
				animClass(this, "@sc-in!_speed-up_ease-out-back");	
				this.classList.add(currentClass);
				removeTargetModifier("Transform origin");
				if(originName !== "none") {
					addTargetModifier("Transform origin", originName);
				}
				setPreviewValue(getOptionLabels(getAllFilterSelectedOptions()));
			}, false);
		});

		function removeClassBrother(e, className) {
			var els = toArray(e.parentNode.children);
			els.forEach(function(child) {
				if(child.classList.contains(className)) {
					child.classList.remove(className);
				};
			});
		}
	}

	var setup = function() {
		getJSON("keys.json", function(data) {
			controlStatus.keys(data.keys);
			controlStatus.modifiers(data.modifiers);
			addControllField(".testArea");
			setParameterSettings();
			assignChangeApplyType();
			assignChangeOrigin()
			addPreviewSample();
			removeLoadingScreen();
		});
		controlStatus.symbol(document.querySelector(".symbol_A > :first-child"));
		controlStatus.preview(document.querySelector(".testArea_preview > div > div"));
		assignInputClip(document.querySelector(".testArea_preview_valueName"));
	}

	/* ====================
		Events
	===================== */

	window.addEventListener("DOMContentLoaded", function() {
		showLoadingScreen();
	}, false);

	window.addEventListener("load", setup, false);


})();

