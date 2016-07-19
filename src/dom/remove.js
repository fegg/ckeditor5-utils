/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Removes given node from parent.
 *
 * @method utils.dom.remove
 * @param {Node} node Node to remove.
 */
export default function remove( node ) {
	const parent = node.parentNode;

	if ( parent ) {
		parent.removeChild( node );
	}
}
