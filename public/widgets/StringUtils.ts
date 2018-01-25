interface String {
  hashCode(): string;
}

String.prototype.hashCode = function() {
  var hash = 0;
  if (this.length === 0) return '0000';
  for (var i = 0; i < this.length; i++) {
    let char = this.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString().substr(0, 4);
};
