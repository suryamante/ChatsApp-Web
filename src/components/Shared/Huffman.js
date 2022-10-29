const toDecimal = (binary) => {
	let result = 0;
	let power = binary.length - 1;
	for(let i = 0; i < binary.length; i++){
		if(binary.charAt(i) === '1'){
			result += Math.pow(2,power);
		}
		power--;
	}
	return result;
}

const toBinary = (decimal, padding) => {
	let result = '';
	while(decimal > 0){
		result += decimal%2;
		decimal = Number.parseInt(decimal/2);
	}
	result = result.split("").reverse().join("");
	if(padding){
		while(result.length < 8){
			result = '0' + result;
		}
	}
	return result;
}

const traverse = (root, chars, huffmanMap, code) => {
	if(root.left && root.right){
		traverse(root.left, chars, huffmanMap, code + '0');
		traverse(root.right, chars, huffmanMap, code + '1');
	}else if(root.left){
		traverse(root.left, chars, huffmanMap, code + '0');
	}else if(root.right){
		traverse(root.right, chars, huffmanMap, code + '1');
	}else{
		huffmanMap[root.char] = code;
	}
}

const getHuffmanMap = (chars, huffmanMap) => {
	traverse(chars[0], chars, huffmanMap, '');
}

const adjustHeap = (chars, size) => {
	let temp = chars[0];
	chars[0] = chars[size - 1];
	chars[size - 1] = temp;
	size--;
	heapify(0, chars, size);
	return size;
}

const heapify = (index, chars, size) => {
	let left = 2*index + 1;
	let right = 2*index + 2;
	let small = index;
	if(left < size && chars[left].frequency < chars[small].frequency){
		small = left;
	}
	if(right < size && chars[right].frequency < chars[small].frequency){
		small = right;
	}
	if(small !== index){
		let temp = chars[small];
		chars[small] = chars[index];
		chars[index] = temp;
		heapify(small, chars, size);
	}
}

const getChars = (data, chars) => {
	let aux = {}
	for(let char of data){
		if(aux[char]){
			aux[char] = aux[char] + 1;
		}else{
			aux[char] = 1;
		}
	}
	for(let char in aux){
		chars.push({
			char: char,
			frequency: aux[char],
			left: null,
			right: null
		});
	}
}

export const huffmanCompress = (data) => {
	let chars = [];
	getChars(data, chars);
	let size = chars.length;
	for(let index = Number.parseInt(size/2 - 1); index >= 0; index--){
		heapify(index, chars, size);
	}
	let n = size;
	for(let i = 0; i < n - 1; i++){
		let firstMin = chars[0];
		size = adjustHeap(chars, size);
		let secondMin = chars[0];
		size = adjustHeap(chars, size);
		chars[size] = {
			char: firstMin.char + secondMin.char,
			frequency: firstMin.frequency + secondMin.frequency,
			left: firstMin,
			right: secondMin
		};
		size++;
		heapify(0, chars, size);
	}
	let huffmanMap = {};
	getHuffmanMap(chars, huffmanMap);
	let binaryCode = '';
	for(let i = 0; i < data.length; i++){
		binaryCode += huffmanMap[data[i]];
	}
	let compressedData = '';
	let i = 0;
	while(i < binaryCode.length){
		let str = '';
		if(i+8 < binaryCode.length){
			str = binaryCode.substr(i, 8);
		}else{
			str = binaryCode.substr(i);
		}
		compressedData += String.fromCharCode(toDecimal(str));
		i+=8;
	}
	return {
		compressedData: compressedData,
		huffmanMap: huffmanMap
	};
}

export const huffmanDecompress = (obj) => {
	let compressedData = obj.compressedData;
	let binaryCode = '';
	for(let i = 0; i < compressedData.length; i++){
		binaryCode += toBinary(compressedData.charCodeAt(i), i < compressedData.length - 1 ? true : false);
	}
	let originalData = '';
	let huffmanMap = obj.huffmanMap;
	let huffmanMapHelper = {};
	for(let char in huffmanMap){
		huffmanMapHelper[huffmanMap[char]] = char;
	}
	let prefix = '';
	for(let i = 0; i < binaryCode.length; i++){
		prefix += binaryCode.charAt(i);
		let temp = huffmanMapHelper[prefix];
		if(temp){
			originalData += temp;
			prefix = '';
		}
	}
	return originalData;
}
