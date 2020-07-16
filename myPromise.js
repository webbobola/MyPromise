function MyPromise(fn) {
		let queueList = [];
		let thenIndexQueue = [];
		let catchIndexQueue = [];
		let queueIndex = 0;

		function reslove(res) {
			let callbackIndex = thenIndexQueue.shift();
			let result;
			if (callbackIndex === undefined)
				return
			let callback = queueList[callbackIndex].fn;
			if (callback)
				result = callback(res);
			if (thenIndexQueue.length !== 0 || catchIndexQueue.length !== 0) {
				if (result instanceof MyPromise) {
					addNextQueue(callbackIndex, result);
				} else {
					reslove(result);
				}
			}
		}

		function reject(err) {
			let callbackIndex = catchIndexQueue.shift();
			let result;
			if (callbackIndex === undefined)
				return
			let callback = queueList[callbackIndex].fn;
			if (callback)
				result = callback(err);
			if (thenIndexQueue.length !== 0 || catchIndexQueue.length !== 0) {
				if (result instanceof MyPromise) {
					addNextQueue(callbackIndex, result);
				}
			}
		}

		function addNextQueue(index, next) {
			queueList.slice(index + 1).forEach((c) => {
				if (c.type === 'then') {
					next.outAddThenQueue(c);
				} else {
					next.outAddCatchQueue(c);
				}
			})
			queueList = thenIndexQueue = thenIndexQueue = null;
		}
		this.outAddThenQueue = function(c) {
			if (c && typeof c.fn === 'function') {
				queueList.push(c);
				thenIndexQueue.push(queueIndex++);
			}
		}
		this.outAddCatchQueue = function(c) {
			if (c && typeof c.fn === 'function') {
				queueList.push(c);
				catchIndexQueue.push(queueIndex++);
			}
		}
		this.then = function(callback) {
			if (callback && typeof callback === 'function') {
				queueList.push({
					fn: callback,
					type: 'then'
				});
				thenIndexQueue.push(queueIndex++);
			}
			return this;
		}
		this.catch = function(callback) {
			if (callback && typeof callback === 'function') {
				queueList.push({
					fn: callback,
					type: 'catch'
				});
				catchIndexQueue.push(queueIndex++);
			}
			return this;
		}
		setTimeout(() => {
			fn && fn(reslove, reject);
		}, 0)
	}
