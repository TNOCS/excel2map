interface Array < T > {
    getKeyAt(index: number, key: string): any ;
}

if (!Array.prototype.getKeyAt) {
    Array.prototype.getKeyAt = function < T > (index: number, key: string): any {
        if ((this.length > index) && typeof this[index] === 'object' && this[index].hasOwnProperty(key)) {
            return this[index][key];
        } else {
            return null;
        }
    };
}
