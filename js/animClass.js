var animClass = function(element, animClassStr, options) {

	var AddAnimClass = function(element, animClassStr, options) {
		this.classArray = null;
		this.element = element;
		this.opts = null;
		this.pendingAnim = [];
		this._main(animClassStr, options);
	}

	AddAnimClass.prototype._main = function(animClassStr, options) {
		this.opts = this._setOptions(options);
		this.classArray = animClassStr.split(" ");
		this._addClass();
		if(this._isChildClass(animClassStr)) {
			this._assignChildAnimationEnd();
		} else {
			this._assignAnimationEnd();
		}
	}

	AddAnimClass.prototype._isChildClass = function(str) {
		return /_child/.test(str);
	}

	AddAnimClass.prototype._setOptions = function(options) {
		var opts = {
			pause: 0,
			callback: null,
			removeClass: true
		}
		if(typeof options == 'function') {
			opts.callback = options;
		} else if (Object.prototype.toString.call(options).slice(8, -1) == 'Object') {
			for(key in options) {
				opts[key] = options[key];
			}
		}
		return opts;
	}

	AddAnimClass.prototype._addClass = function() {
		for(var className of this.classArray) {
			this.element.classList.add(className)
		}
	}

	AddAnimClass.prototype._removeClass = function() {
		var self = this;
		setTimeout(function() {
			self.classArray.forEach(function(className) {
				self.element.classList.remove(className);
			});
			if(self.element.classList.length == 0) {
				self.element.removeAttribute('class');
			}
		}, self.opts.pause);
	}

	AddAnimClass.prototype._animated = function() {
		var self = this;
		if(this.opts.removeClass) this._removeClass();
		if(this.pendingAnim.length) {
			var nextAnim = this.pendingAnim.shift();
			setTimeout(function() {
				self._main(nextAnim.animClassStr, nextAnim.options);
			}, 50);
		}
		if(this.opts.callback) this.opts.callback();
	}

	AddAnimClass.prototype._assignAnimationEnd = function() {
		var self = this;
		var removeEndAnimation = function() {
			self._setStyleEndPoint(this);
			this.removeEventListener("animationend", removeEndAnimation, false);
			self._animated();
		}
		this.element.addEventListener('animationend', removeEndAnimation, false);
	}

	AddAnimClass.prototype._assignChildAnimationEnd = function() {
		var self = this;
		var childCount = this.element.children.length;
		var endChildCount = 0;
		var removeEndAnimation = function() {
			self._setStyleEndPoint(this);
			this.removeEventListener('animationend', removeEndAnimation, false);
			if(childCount == ++endChildCount) self._animated();
		}
		Array.prototype.slice.call(this.element.children).forEach(function(child) {
			child.addEventListener('animationend', removeEndAnimation, false);
		});
	}

	AddAnimClass.prototype._setStyleEndPoint = function(e) {
		e.style.transform = window.getComputedStyle(e).transform;
		e.style.opacity = window.getComputedStyle(e).opacity;
	}

	AddAnimClass.prototype.sequence = function(animClassStr, options) {
		this.pendingAnim.push({
			'animClassStr': animClassStr,
			'options': this._setOptions(options),
		});
		return this;
	}

	return new AddAnimClass(element, animClassStr, options);
}
