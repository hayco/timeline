import Band from '.'
import { BandConfig, EventsDomainConfig } from '../config';
import animator from '../../animator';
import { Pixels, EVENT_HEIGHT, DATE_BAR_HEIGHT } from '../../constants';
import { RawEv3nt } from '../event';
import props from '../props';

export default class EventsBand extends Band {
	domains: EventsDomainConfig[]

	constructor(config: BandConfig<EventsDomainConfig>) {
		super(config)
		this.domains = config.domains
		this.updateEvents()
	}

	private updateEvents() {
		if (!this.domains) return

		for (const domain of this.domains) {
			const offsetY = domain.topOffsetRatio * props.viewportHeight
			const domainHeight = (domain.heightRatio * props.viewportHeight) - DATE_BAR_HEIGHT

			for (const event of domain.orderedEvents.events) {
				event.left = this.positionAtTimestamp(event.from) + this.left
				event.width = Math.round((event.time) * this.pixelsPerMillisecond)
				event.padding = Math.round((event.space) * this.pixelsPerMillisecond)
				if (event.width < 1) event.width = 1
				event.top = offsetY + domainHeight - ((event.row + 1) * (EVENT_HEIGHT + 2))
			}
		}
	}

	update() {
		super.update()
		this.updateEvents()
	}

	getEventByCoordinates(x: Pixels, y: Pixels): RawEv3nt {
		const timestamp = this.timestampAtProportion(this.proportionAtPosition(x))

		const domain = this.domains.find(d => {
			const top = props.viewportOffset + d.topOffsetRatio * props.viewportHeight
			const height = props.viewportOffset + d.heightRatio * props.viewportHeight
			return top < y && top + height > y
		})

		const event = domain.orderedEvents.events.find(e => {
			if (!(e.from < timestamp && e.from + e.time + e.space > timestamp)) return false

			const bottomOfDomain = props.viewportOffset + ((domain.topOffsetRatio + domain.heightRatio) * props.viewportHeight) - DATE_BAR_HEIGHT
			const row = Math.floor((bottomOfDomain - y) / (EVENT_HEIGHT + 2))
			return e.row === row
		})

		return event
	}

	zoomIn() {
		animator.zoomTo(this.zoomLevel + 1)
	}

	zoomOut() {
		animator.zoomTo(this.zoomLevel - 1)
	}
}
