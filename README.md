# JavaScript ES6 Map and Set polyfill and improvements.

JavaScript introduced [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) and [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) objects with new ES6.

Map provides functionality to use objects as object key.  
Set is a unique collection of items.

This implementation uses hash tables to identify items in Set an Map and gives extra features.

# Usage.

To use with NodeJS.

```sh
npm install es6-set-and-map.
```

### Map

```javascript
var Map = require( 'es6-set-and-map' ).map, 
    obj = new Map(), 
    blank_obj = {}, 
    span_el = document.createElement('span');

//  Sets values.
//  Set method returns it's map, so this call can be chained.
//  You can use anything as key.
obj
    .set( blank_obj, 'can be any value' )
    .set( 'some-key', 'some value' )
    .set( NaN, 'nan value' )
    //  You can specify a new item's index too.
    .set( undefined, 'undefined value', 1 )
    .set( null, 'null value' )
    .set( Object.create(null), 'null value' );

//  Adds values.
//  Will work only if key does not exist in the map.
//  Returns true if values added.
obj.add( span_el, 'qwerty' ) === true;

//  blank_obj is already used, so this will return false.
//  Position argument can be used with add too.
obj.add( blank_obj, 'qwerty', 2 ) === false;

//  Increments numeric value.
//  If value is not defined, creates with initial value 0, than increments it.
//  Works like i++, so will return previous value.
obj['++']( 'something' ) === 0;

//  Decrements numeric value.
//  Same as ++, but works like --i, so will return the new value.
obj.set( 'something', 12 );
obj['--']( 'something' ) === 11;

//  Array manipulation methods.
//  If value is not array, returns false.
//  If value is not defined, creates empty array and does operations on it.
//  Returns result of the operation.
obj.push( 'anything', 'item0', 'item1', 'item2' ) === 3;
obj.unshift( 'anything', 'firstitem' ) === 4; 
obj.pop( 'anything' ) == 'item2';
obj.shift( 'anything' ) == 'firstitem';
//  This two returns changed value.
obj.concat( 'anything', ['value1', 'value2'] );
obj.splice( 'anything', 2, 2 );

//  Object property manipulation methods.
//  If value is not an object, returns false.
//  If value is not defined, creates empty object and does operations on it.
obj.addProp( 'otherthing', 'objkey', 'objvalue' ) === true;
obj.setProp( 'otherthing', 'objkey', 'changed value' ) === true;
obj.getProp( 'otherthing', 'objkey' ) === 'changed value';
obj.deleteProp( 'otherthing', 'objkey' ) === true;
obj.hasProp( 'otherthing', 'objkey' ) === false;

//  Gives value for given key.
console.log( obj.get( span_el ) );

//  Checks if given key is used.
console.log( obj.has( blank_obj ) );

//  Deletes value of this key.
//  Returns true if value existed.
console.log( obj.delete( span_el ) );

//  Elements count.
console.log( obj.length );

//  Array of keys and objects.
console.log( obj.keys );
console.log( obj.values );

//  Iterating.
obj.start();
while( obj.next() ) {
    //  use obj.key, obj.value
}

//  Iterating back.
obj.end();
while( obj.prev() ) {
    //  use obj.key, obj.value
}

//  ES6 "for of" iteration
for( let [key, value] of obj ) {
    //  ...
}
```


### Set

```javascript
var Set = require( 'es6-set-and-map' ).set, 
    obj = new Set(), 
    blank_obj = {}, 
    span_el = document.createElement('span');

//  Adds values.
obj.add( span_el ) === true;
obj.add( blank_obj, 1 ) === true;
obj.add( span_el ) === false;

//  Adds multiple values and returns added items count.
obj.addMulti( [span_el, blank_obj, 'qwer'], 1 );

//  Checks if item exists.
console.log( obj.has( blank_obj ) );

//  Removes item.
//  Returns true if item existed.
console.log( obj.delete( span_el ) );

//  Elements count.
console.log( obj.length );

//  Array of items.
console.log( obj.values );

//  Iterating.
obj.start();
while( obj.next() ) {
    //  use obj.value
}

//  Iterating back.
obj.end();
while( obj.prev() ) {
    //  use obj.value
}

//  ES6 "for of" iteration
for( let value of obj ) {
    //  ...
}
```

## Browser support

|Firefox|Chrome	|IE |Opera	|Safari |
|:-----:|:-----:|:-:|:-----:|:-----:|
|5		|5		|9  |11.60	|5.1    |