( function ( root, factory ) {
	if( typeof exports === 'object' && typeof module === 'object' ) {
		module.exports = factory();
	} else if( typeof define === 'function' && define.amd ) {
		define( [], factory );
	} else {
		( typeof exports === 'object' ? exports : root ).SM = factory();
	}
} ) ( this, function () {
	'use strict';

	var self = {}, 
		main = self, 
		symbols_supported = typeof Symbol !== 'undefined';

	var ArrayProto = Array.prototype;
	var HasOwn = ( function () {
		var has_own = {}.hasOwnProperty;
		return function HasOwn( target, name ) {
			return !!name && has_own.call( target, name );
		};
	} ) ();
	var IsArray = Array.isArray;
	function IsObject( value ) { return value != null && ( typeof value === 'function' || typeof value === 'object' ); };
	function IsScalar( value ) { return !IsObject( value ); };
	function IsNumber( value ) { return !isNaN( value ) && value+0 === value; };
	var IsFunction = ( function () {
		var func_proto = Function.prototype;
		return function IsFunction( target ) { return typeof target === 'function' && target != func_proto; };
	} ) ();
	function IsWindow( target ) { return target != null && (target === target.window); };
	function IsArrayLike( obj ) {
		if( !IsObject( obj ) || IsFunction( obj ) || IsWindow( obj ) )
			return false;
		var length = !!obj && ('length' in obj) && obj.length;
		return IsArray( obj ) || length === 0 || IsNumber( length ) && length > 0 && ( length - 1 ) in obj;
	};
	function Slice( target, begin, end ) {
		var i, result = [], size, len = target.length;
		begin = ((begin = begin || 0) >= 0) ? begin : Math.max(0, len + begin);
		if((end = isNaN(end) ? len : Math.min(end, len)) < 0) end = len + end;
		if((size = end - begin) > 0) {
			result = new Array(size);
			for (i = 0; i < size; i++) result[i] = target[begin + i];
		}
		return result;
	};
	function CanBeKey( value ) { return IsScalar( value ) || ( 'toString' in value ); };

	/**
	 * For class inheritance.
	 * @param {Function} child	Child class.
	 * @param {Function} parent	Parent class.
	 * @return {Prototype}		Returns created prototype of a child class.
	 */
	function Inherit( child, parent ) {
		var result = child.prototype = Object.create( parent && parent.prototype || null );
		return ( result.constructor = child, result );
	};
 
 	/**
 	 * Random string generation function.
 	 * @param {UINT}	len	Length for the desired string.
 	 * @return {String}
 	 */
	function RandomString( len ) { return Math.random().toString( 16 ).substr( 2, len || 8 ); };

	/**
	 * Returns unique ID for each object.
	 * @param {Object}	target		Target Object to get ID for.
	 * @param {Boolean}	dont_make	If target is an object and has no generated unique ID, 
	 *                              dont try to create a one.
	 * @return {String}
	 */
	function ItemID( target, dont_make ) {

		//	If target is a primitive, just typecast to string.
		if( !IsObject( target ) )
			return target + "";

		//	Otherwise generate random ID for this object and attach it as a constant.
		var key = target.objectUniqueID;
		if( !key && !dont_make ) 
			Object.defineProperty( target, 'objectUniqueID', { value: key = RandomString() } )
		return key;
	};

	/**
	 * Function to remove element with speicified index from array.
	 * @param {Array}	container	Target array.
	 * @param {UINT}	index		Wanted item index.
	 * @return {Mixed} 				Item which has been removed from array.
	 */
	function RemoveFrom ( container, index ) {
		var result = container[ index ];
		container.splice( index, 1 );
		return result;
	};

	/**
	 * Inserts an items to a specified position to array.
	 * @param {ArrayLike}	container	Target array or array like object.
	 * @param {List}		elements	Item list or a single item.
	 * @param {UINT}		position	Position where to add elements(appends if omitted).
	 * @return {ArrayLike} 				Given container.
	 */
	function InsertAt ( container, elements, position ) {
		if( !IsArrayLike( elements ) ) 
			elements = [ elements ];
		if( position === undefined ) {
			ArrayProto.push.apply( container, elements );
		} else {
			var args = [ position, 0 ];
			ArrayProto.push.apply( args, elements );
			ArrayProto.splice.apply( container, args );
		}
		return container;
	};
	var FindAndRemove, FindAndRemoveOne;
	( function () {
		function Action ( container, list, is_unique ) {
			var i = 1, result;
			for( ; i < list.length; i++ ) {
				var value = list[ i ], pos = 0;
				while( ( pos = container.indexOf( value, pos ) ) != -1 ) {
					RemoveFrom( container, pos );

					if( is_unique ) 
						return pos;
					else if( !result )
						result = [];

					result.push( pos );
				}
			}
			return result;
		};
		/**
		 * Finds and removes needed items from array.
		 * @param {Array}		container	Target array 
		 * @param {...Mixed}	items		Items to remove from target array.
		 * @return {Mixed} 					Item which removed from array.
		 */
		FindAndRemove = function ( container ) { return Action( container, arguments, false ); };

		/**
		 * Alias for find and remove, 
		 * but considers that items are unique in the element, 
		 * and after deleting a particular item from array, stops searching for it anymore.
		 * @param {Array}		container	Target array 
		 * @param {...Mixed}	items		Items to remove from target array.
		 * @return {Mixed} 					Item which removed from array.
		 */
		FindAndRemoveOne = function ( container ) { return Action( container, arguments, true ); };
	} ) ();

	/**
	 * Iterable list class is for making Map and Set classes iterable.
	 */
	function IterableList() {
		this.values = [];

		this.primitiveKeys = [];
		this.keyToValue = {};
	}
	( function ( self, PROTOTYPE ) {
		/**
		 * Object item list.
		 * @type {Array}
		 */
		PROTOTYPE.values = null;

		PROTOTYPE.primitiveKeys = null;
		PROTOTYPE.keyToValue = null;

		/**
		 * Count of the items.
		 * @type {UINT}
		 */
		PROTOTYPE.length = 0;

		/**
		 * Current element index pointer.
		 * @type {Number}
		 */
		PROTOTYPE.index = -1;

		/**
		 * Current item's key.
		 * @type {Mixed}
		 */
		PROTOTYPE.key = null;

		/**
		 * Current item's value.
		 * @type {Mixed}
		 */
		PROTOTYPE.value = null;
		function UpdateCurrent( get_value ) {
			this.key = this.primitiveKeys[ this.index ] || null;
			this.value = this.key && this.keyToValue[ this.key ];
			return get_value ? this.value : !!this.key;
		}

		/**
		 * Use this function to start iteration.
		 */
		PROTOTYPE.start = function () {
			this.index = -1;
			UpdateCurrent.call( this );
		};

		/**
		 * Use this function to start reverse iteration.
		 */
		PROTOTYPE.end = function () {
			this.index = this.length;
			UpdateCurrent.call( this );
		};

		/**
		 * Moves current item's pointer to the first element or gets the value of the first item.
		 * @param  {Bool} get_value	Wether to get value of the item with desired index, or move pointer to that position.
		 * @return {Mixed}			If get_value is true, returns value of desired item, otherwise returns true if position is valid.
		 */
		PROTOTYPE.first = function ( get_value ) { this.index = 0; return UpdateCurrent.call( this, get_value ); };

		/**
		 * Increments current item's pointer or gets the value of the next element(relative to current pointer position).
		 * @param  {Bool} get_value	Wether to get value of the item with desired index, or move pointer to that position.
		 * @return {Mixed}			If get_value is true, returns value of desired item, otherwise returns true if position is valid.
		 */
		PROTOTYPE.next = function ( get_value ) { this.index++; return UpdateCurrent.call( this, get_value ); };

		/**
		 * Decrements current item's pointer or gets the value of the next element(relative to current pointer position).
		 * @param  {Bool} get_value	Wether to get value of the item with desired index, or move pointer to that position.
		 * @return {Mixed}			If get_value is true, returns value of desired item, otherwise returns true if position is valid.
		 */
		PROTOTYPE.prev = function ( get_value ) { this.index--; return UpdateCurrent.call( this, get_value ); };		

		/**
		 * Moves current item's pointer to the first element or gets the value of the last item.
		 * @param  {Bool} get_value	Wether to get value of the item with desired index, or move pointer to that position.
		 * @return {Mixed}			If get_value is true, returns value of desired item, otherwise returns true if position is valid.
		 */
		PROTOTYPE.last = function ( get_value ) { this.index = this.length - 1; return UpdateCurrent.call( this, get_value ); };

		/**
		 * These methods are aliases for functions defined above with get_value argument true.
		 */
		PROTOTYPE.getFirst = function () { return this.first( true ); };
		PROTOTYPE.getNext = function () { return this.next( true ); };
		PROTOTYPE.getPrev = function () { return this.prev( true ); };
		PROTOTYPE.getLast = function () { return this.last( true ); };

		/**
		 * Clear all items from the given Map or Set.
		 * @return {this}
		 */
		PROTOTYPE.clear = function () {
			this.values = [];
			this.primitiveKeys = [];
			this.keyToValue = {};
			this.length = 0;
			this.index = -1;
			this.key = null;
			this.value = null;
			return this;
		}

		function SetValue( key, value, ignore_if_had, index ) {
			var had = HasOwn( this.keyToValue, key ), 
				changed = !had || !ignore_if_had;
			if( !had ) {
				InsertAt( this.values, value, index );
				InsertAt( this.primitiveKeys, key, index );
				this.length++;
			}
			if( changed ) {
				if( had )
					this.values[ this.primitiveKeys.indexOf( key ) ] = value;
				this.keyToValue[ key ] = value;
			}
			return changed;
		};
		function GetValue( key ) { return this.keyToValue[ key ]; };
		function HasValue( key ) { return HasOwn( this.keyToValue, key ); };
		function DeleteValue( key ) {
			var index = -1, has = HasOwn( this.keyToValue, key );
			if( has ) {
				delete this.keyToValue[ key ];
				RemoveFrom( this.values, index = FindAndRemoveOne( this.primitiveKeys, key ) );
				this.length--;
			}
			return index;
		}

		self.set = function ( target, key, value, ignore_if_had, index ) {
			return SetValue.call( target, key, value, ignore_if_had, index );
		};
		self.get = function ( target, key ) {
			return GetValue.call( target, key );
		}
		self.has = function ( target, key ) {
			return HasValue.call( target, key );
		};
		self.delete = function ( target, key ) {
			return DeleteValue.call( target, key );
		};
	} ) ( IterableList, IterableList.prototype );

	/**
	 * Map constructor function.
	 */
	function FastMap() {
		this.keys = [];
		this.IDToKey = {};
		IterableList.call( this );
	};
	main.map = FastMap;
	( function ( PROTOTYPE, ParentProto ) {

		/**
		 * Keys container.
		 * @type {Array}
		 */
		PROTOTYPE.keys = null;
		PROTOTYPE.IDToKey = null;
		function SetValue( key, value, ignore_if_had, position ) {
			var real_key = ItemID( key ), 
				saved = !!real_key && IterableList.set( this, real_key, value, ignore_if_had, position );
			if( saved ) {
				InsertAt( this.keys, key, position );
				this.IDToKey[ real_key ] = key;
			}
			return saved;
		};

		/**
		 * Set a key value pair for this Map.
		 * @param {Mixed}	key			Can be any type, including objects.
		 * @param {Mixed}	item		Item that need's to be seted.
		 * @param {UINT}	position	Position of the new item(appends if ommited)
		 * @return {this}
		 */
		PROTOTYPE.set = function ( key, item, position ) {
			SetValue.call( this, key, item, false, position );
			return this;
		};

		/**
		 * Add a key value pair for this Map.
		 * Same as set, but sets an item only if given key is not used.
		 * @param {Mixed}	key			Can be any type, including objects.
		 * @param {Mixed}	item		Item that need's to be seted.
		 * @param {UINT}	position	Position of the new item(appends if ommited)
		 * @return {Bool}				Returns true if item has been added.
		 */
		PROTOTYPE.add = function ( key, item, position ) {
			return SetValue.call( this, key, item, true, position );
		};

		function IncChange ( key, val, ret_old ) {
			var value, result;
			if( !this.has( key ) ) {
				value = 0;
			} else if( !IsNumber( value = this.get( key ) ) ) {
				return false;
			}
			result = value;
			if( !SetValue.call( this, key, value += val ) ) {
				result = false;
			} else if( !ret_old )
				result = value;
			return result;
		};

		/**
		 * Increments number value of this key and works like i++.
		 * If this key is not used yet, sets the value to 1.
		 * @param  {Mixed} 	key
		 * @return {Number}		False if key was already used and that item was not a number.
		 */
		PROTOTYPE['++'] = function ( key ) { return IncChange.call( this, key, 1, true ); };

		/**
		 * Decrements number value of this key and works like --i.
		 * If this key is not used yet, sets the value to -1.
		 * @param  {Mixed} 	key
		 * @return {Number}		False if key was already used and that item was not a number.
		 */
		PROTOTYPE['--'] = function ( key ) { return IncChange.call( this, key, -1 ); };

		function ArrayChange ( key, handler, args, rewrite ) {
			var has = this.has( key ), result = false, value;
			if( has ? IsArrayLike( value = this.get( key ) ) : args ) {
				if( !has ) 
					value = [];

				result = handler.apply( value, args || [] );
				if( rewrite ) 
					value = result;

				if( (!has || rewrite) && !SetValue.call( this, key, value ) )
					result = false;
			}
			return result;
		};

		/**
		 * Pushes item into the array item of this key.
		 * Creates blank array if key is not used yet.
		 * @param  {Mixed}	key
 		 * @return {UINT}     	Returns result of push operation.
		 */
		PROTOTYPE.push = function ( key ) { return ArrayChange.call( this, key, ArrayProto.push, Slice( arguments, 1 ) ); };

		/**
		 * Unshifts item into the array item of this key.
		 * Creates blank array if key is not used yet.
		 * @param  {Mixed}	key
 		 * @return {UINT}     	Returns result of unshift operation.
		 */
		PROTOTYPE.unshift = function ( key ) { return ArrayChange.call( this, key, ArrayProto.unshift, Slice( arguments, 1 ) ); };

		/**
		 * Concats given arrays to this Map|Set.
		 * Creates blank array if key is not used yet.
		 * @param  {Mixed}	key
 		 * @return {Mixed}		Returns desired array, or false if the item was not an array.
		 */
		PROTOTYPE.concat = function ( key ) { return ArrayChange.call( this, key, ArrayProto.concat, Slice( arguments, 1 ), true ); };

		/**
		 * Splices array item of this key.
		 * Creates blank array if key is not used yet.
		 * @param  {Mixed}	key
 		 * @return {Mixed}		Returns desired array, or false if the item was not an array.
		 */
		PROTOTYPE.splice = function ( key ) { return ArrayChange.call( this, key, ArrayProto.splice, Slice( arguments, 1 ), true ); };

		/**
		 * Pops item from array item of this key.
		 * Ignroes if key is not set.
		 * @param  {Mixed}	key
 		 * @return {Mixed}		Returns popped element or null.
		 */
		PROTOTYPE.pop = function ( key ) { return ArrayChange.call( this, key, ArrayProto.pop ); };

		/**
		 * Shifts item from array item of this key.
		 * Ignroes if key is not set.
		 * @param  {Mixed}	key
 		 * @return {Mixed}		Returns popped element or null.
		 */
		PROTOTYPE.shift = function ( key ) { return ArrayChange.call( this, key, ArrayProto.shift ); };

		function SetObjectProperty ( key, name, value, add ) {
			var values, has = this.has( key ), added;
			if( has ? !IsObject( values = this.get( key ) ) : !SetValue.call( this, key, values = {} ) )
				return false;

			added = !HasOwn( values, name ) || !add;
			if( added )
				values[ name ] = value;
			return added;
		};

		/**
		 * Sets property to a object item of this key.
		 * Creates blank object if key is not used yet.
		 * @param {Mixed}	key
		 * @param {Scalar}	name  	Name of the new entry in that object.
		 * @param {Mixed}	value 	Value of the new entry in that object.
		 * @return {Object}			Object item of this key or null
		 */
		PROTOTYPE.setProp = function ( key, name, value ) { return SetObjectProperty.call( this, key, name, value, false ); };

		/**
		 * Same as setProperty, but does nothing and returns false if key is already defined, 
		 * or true if the key was new.
		 * @param {Mixed}	key
		 * @param {Scalar}	name  	Name of the new entry in that object.
		 * @param {Mixed}	value 	Value of the new entry in that object.
		 * @return {Object}			Object item of this key or null
		 */
		PROTOTYPE.addProp = function ( key, name, value ) { return SetObjectProperty.call( this, key, name, value, true ); };

		/**
		 * Get property of an object item of the given key.
		 * Returns null if key is already defined and is a scalar value.
		 * @param {Mixed}	key
		 * @param {Scalar}	name  Name of the property in that object.
		 * @return {Mixed}
		 */
		PROTOTYPE.getProp = function ( key, name ) {
			var target;
			return this.has( key ) && IsObject( target = this.get( key ) ) && target[ name ];
		};

		/**
		 * Checks if item of given key is an object, and it has own given property.
		 * @param  {Mixed}		key  
		 * @param  {Mixed}		property	Property name to delete.
		 * @return {Boolean}
		 */
		PROTOTYPE.hasProp = function ( key, name ) {
			var target;
			return CanBeKey( name ) && this.has( key ) && IsObject( target = this.get( key ) ) && HasOwn( target, name );
		};

		/**
		 * Checks if item of given key is an object, and deletes property from that object.
		 * @param  {Mixed}		key		
		 * @param  {Mixed}		property	Property name to delete.
		 * @return {Boolean}				Returnes bool indicating if given name has been deleted from target object.
		 */
		PROTOTYPE.deleteProp = function ( key, property ) {
			var target, 
				deleted = this.has( key ) && IsObject( target = this.get( key ) ) && HasOwn( target, property );
			if( deleted )
				delete target[ property ];
			return deleted;
		};

		/**
		 * Get item of given key.
		 * @param  {Mixed}	key
		 * @return {Mixed}
		 */
		PROTOTYPE.get = function ( key ) {
			var real_key = ItemID( key, true );
			return ( real_key && IterableList.get( this, real_key ) ) || undefined;
		};

		/**
		 * Checks if given key exists in this object.
		 * @param  {Mixed}		key
		 * @return {Boolean}
		 */
		PROTOTYPE.has = function ( key ) {
			var real_key = ItemID( key, true );
			return !!real_key && IterableList.has( this, real_key );
		};

		/**
		 * Delete item for given key.
		 * @param  {Mixed} 		key
		 * @return {Boolean}	true if key existed
		 */
		PROTOTYPE.delete = function ( key ) {
			var real_key = ItemID( key ), 
				had = !!real_key && HasOwn( this.IDToKey, real_key );
			if( had ) {
				delete this.IDToKey[ real_key ];
				RemoveFrom( this.keys, IterableList.delete( this, real_key ) );
			}
			return had;
		};
		function PointerMoveAction( name, args ) {
			var result = ParentProto[ name ].apply( this, args );
			this.key = this.IDToKey[ this.key ];
			return result;
		};

		//	Some fixes for pointer move operations of FastMap.
		PROTOTYPE.first = function () { return PointerMoveAction.call( this, 'first', arguments ); };
		PROTOTYPE.next = function () { return PointerMoveAction.call( this, 'next', arguments ); };
		PROTOTYPE.prev = function () { return PointerMoveAction.call( this, 'prev', arguments ); };
		PROTOTYPE.last = function () { return PointerMoveAction.call( this, 'last', arguments ); };
		if( symbols_supported ) {
			PROTOTYPE[Symbol.iterator] = function () {
				var that = this;
				this.start();
				return {
					next: function () {
						var done = !that.next();
						return { done: done, value: [that.key, that.value] };
					}
				}
			};
		}
		PROTOTYPE.clear = function () {
			ParentProto.clear.call( this );
			this.IDToKey = {};
		};

		/**
		 * Used to clone this FastMap object.
		 * @return {FastMap}
		 */
		PROTOTYPE.clone = function () {
			var cloned = new FastMap();
			this.start();
			while( this.next() ) 
				cloned.add( this.key, this.value );
			return cloned;
		};
	} ) ( Inherit( FastMap, IterableList ), IterableList.prototype );

	/**
	 * Set constructor.
	 * @param {ArrayLike}	list	Initial list of items.
	 */
	function FastSet( list ) {
		IterableList.call( this );
		if( list ) {
			if( !IsArrayLike( list ) )
				list = [ list ];
			this.addMulti( list );
		}
	};
	main.set = FastSet;
	( function ( PROTOTYPE ) {

		/**
		 * Adds item.
		 * @param {Mixed}	item 	Value to add.
		 * @param {UINT}	i		Position of a new item( item will be appended if ommited ).
		 * @return {Boolean} 		True if item is new.
		 */
		PROTOTYPE.add = function ( item, position ) {
			var real_key = ItemID( item );
			return !!real_key && IterableList.set( this, real_key, item, true, position );
		};

		/**
		 * Adds multiple items.
		 * @param {ArrayLike}	list 	Value to add.
		 * @param {UINT}		i		Position of a new item. If not given, items will be appended.
		 * @return {UINT} 				Added items count.
		 */
		PROTOTYPE.addMulti = function ( list, position ) {
			var addeds = 0, i = 0;
			for( ; i < list.length; i++ ) 
				if( this.add( list[i], position ) ) 
					addeds++;
			return addeds;
		};

		/**
		 * Checks if item exists.
		 * @param  {Mixed}  item	Item to check.
		 * @return {Boolean}
		 */
		PROTOTYPE.has = function ( item ) {
			var real_id = ItemID( item, true );
			return !!real_id && IterableList.has( this, real_id );
		};

		/**
		 * Deletes given item.
		 * @param  {Mixed}		item	Item to delete from this set.
		 * @return {Boolean}			True if item existed and has been deleted.
		 */
		PROTOTYPE.delete = function ( item ) {
			var real_id = ItemID( item, true );
			return IterableList.delete( this, real_id ) != -1;
		};
		if( symbols_supported ) {
			PROTOTYPE[Symbol.iterator] = function () {
				var that = this;
				this.start();
				return {
					next: function () {
						var done = !that.next();
						return { done: done, value: that.value };
					}
				}
			};
		}

		/**
		 * Used to clone this FastSet object.
		 * @return {FastSet}
		 */
		PROTOTYPE.clone = function () {
			var cloned = new FastSet();
			this.start();
			while( this.next() ) 
				cloned.add( this.value );
			return cloned;
		};
	} ) ( Inherit( FastSet, IterableList ) );

	return main;
} );