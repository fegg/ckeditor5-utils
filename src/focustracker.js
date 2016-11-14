/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global setTimeout, clearTimeout */

/**
 * @module utils/focustracker
 */
import DomEmitterMixin from './dom/emittermixin.js';
import ObservableMixin from './observablemixin.js';
import CKEditorError from './ckeditorerror.js';
import mix from './mix.js';

/**
 * Allows observing a group of `HTMLElement`s whether at least one of them is focused.
 *
 * Used by the {@link module:core/editor~Editor} in order to track whether the focus is still within the application,
 * or were used outside of its UI.
 *
 * **Note** `focus` and `blur` listeners use event capturing, so it is only needed to register wrapper `HTMLElement`
 * which contain other `focusable` elements. But note that this wrapper element has to be focusable too
 * (have e.g. `tabindex="-1"`).
 *
 * @mixes module:utils/dom/emittermixin/~DOMEmitterMixin
 * @mixes module:utils/observablemixin/~ObservableMixin
 */
export default class FocusTracker {
	constructor() {
		/**
		 * True when one of the registered elements is focused.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #isFocused
		 */
		this.set( 'isFocused', false );

		/**
		 * List of registered elements.
		 *
		 * @private
		 * @member {Set<HTMLElement>} #_elements
		 */
		this._elements = new Set();

		/**
		 * Event loop timeout.
		 *
		 * @private
		 * @member {Number} #_nextEventLoopTimeout
		 */
		this._nextEventLoopTimeout = null;

		/**
		 * Currently focused element.
		 *
		 * @private
		 * @member {HTMLElement} #_focusedElement
		 */
		this._focusedElement = null;
	}

	/**
	 * Starts tracking the specified element.
	 *
	 * @param {HTMLElement} element
	 */
	add( element ) {
		if ( this._elements.has( element ) ) {
			throw new CKEditorError( 'focusTracker-add-element-already-exist' );
		}

		this.listenTo( element, 'focus', () => this._focus( element ), { useCapture: true } );
		this.listenTo( element, 'blur', () => this._blur(), { useCapture: true } );
		this._elements.add( element );
	}

	/**
	 * Stops tracking the specified element and stops listening on this element.
	 *
	 * @param {HTMLElement} element
	 */
	remove( element ) {
		if ( element === this._focusedElement ) {
			this._blur( element );
		}

		if ( this._elements.has( element ) ) {
			this.stopListening( element );
			this._elements.delete( element );
		}
	}

	/**
	 * Stores currently focused element and set {#isFocused} as `true`.
	 *
	 * @private
	 * @param {HTMLElement} element Element which has been focused.
	 */
	_focus( element ) {
		clearTimeout( this._nextEventLoopTimeout );

		this._focusedElement = element;
		this.isFocused = true;
	}

	/**
	 * Clears currently focused element and set {#isFocused} as `false`.
	 * This method uses `setTimeout` to change order of fires `blur` and `focus` events.
	 *
	 * @private
	 * @fires blur
	 */
	_blur() {
		this._nextEventLoopTimeout = setTimeout( () => {
			this._focusedElement = null;
			this.isFocused = false;
		}, 0 );
	}
}

mix( FocusTracker, DomEmitterMixin );
mix( FocusTracker, ObservableMixin );
