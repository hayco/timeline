import Ev3nt from '../../../models/event'
import createElement from '../../../utils/create-element'
import PointInTime from './event/point-in-time'
import Interval from './event/interval'
import Domain from '../../../models/domain'
import props from '../../../models/props';
import { RawEv3nt, RawSegment, Milliseconds } from '../../../constants';

export default class Segment {
	private _rendered: boolean = false
	get rendered() { return this._rendered }
	set rendered(rendered) { this._rendered = rendered }

	private rootElement: HTMLElement
	private left: number
	private rawEvents: RawEv3nt[]
	private from: Milliseconds
	// private to: Milliseconds

	constructor(
		private domain: Domain,
		segmentData: RawSegment,
	) {
		this.rawEvents = segmentData.events
		this.from = segmentData.from
		// this.to = segmentData.to
		this.left = ((props.from - this.from) / props.time) * this.domain.width // TODO fix LEFT, this.from should be a ratio
	}

	render() {
		this.rootElement = createElement(
			'div',
			'segment',
			[
				'bottom: 0',
				'list-style: none',
				'margin: 0',
				'padding: 0',
				'position: absolute',
				'top: 0',
				`width: ${props.viewportWidth}px`,

			],
			[
				`left: ${this.left}px`,
			]
		)

		return this.rootElement
	}

	renderChildren() {
		if (this._rendered) return

		const ul = createElement('ul', 'events', [
			'list-style: none',
			'margin: 0',
			'padding: 0',
		])

		for (let i = 0; i < this.rawEvents.length; i++) {
			const event = new Ev3nt(this.rawEvents[i], this.domain)
			const EventClass = event.isInterval() ? Interval : PointInTime
			const view = new EventClass(event, this.left)
			ul.appendChild(view.render())
		}

		this.rootElement.appendChild(ul)

		this._rendered = true
	}
}