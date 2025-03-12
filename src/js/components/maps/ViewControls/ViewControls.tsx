import Geocoder from 'ol-geocoder';
import styles from '../BinMap.module.css';
import Control from 'ol/control/Control';

export class ToggleLegendControl extends Control {
    constructor(callback: () => void, opt_options: any) {
        const options = opt_options || {};

        const button = document.createElement('button');
        button.title = 'Toggle Legend';

        const icon = document.createElement('span');
        icon.className = 'material-icons';
        icon.innerHTML = 'legend_toggle';
        icon.style.fontSize = '20px';
        button.appendChild(icon);

        const element = document.createElement('div');
        element.className = `${styles.legendToggleButton} ol-unselectable ol-control`;
        element.appendChild(button);

        super({
            element: element,
            target: options.target,
        });

        button.addEventListener('click', callback, false);
    }
}

export class ToggleScaleLineControl extends Control {
    constructor(callback: () => void, opt_options: any) {
        const options = opt_options || {};

        const button = document.createElement('button');
        button.title = 'Toggle Scale Line';

        const icon = document.createElement('span');
        icon.className = 'material-icons';
        icon.innerHTML = 'space_bar';
        icon.style.fontSize = '20px';
        button.appendChild(icon);

        const element = document.createElement('div');
        element.className = `${styles.scaleLineToggleButton} ol-unselectable ol-control`;
        element.appendChild(button);

        super({
            element: element,
            target: options.target,
        });

        button.addEventListener('click', callback, false);
    }
}

export class ExportMapControl extends Control {
    constructor(callback: () => void, opt_options: any) {
        const options = opt_options || {};

        const button = document.createElement('button');
        button.title = 'Export Map as PNG';

        const icon = document.createElement('span');
        icon.className = 'material-icons';
        icon.innerHTML = 'print';
        icon.style.fontSize = '20px';
        button.appendChild(icon);

        const element = document.createElement('div');
        element.className = `${styles.exportMapControl} ol-unselectable ol-control`;
        element.appendChild(button);

        super({
            element: element,
            target: options.target,
        });

        button.addEventListener('click', callback, false);
    }
}


export class GeocoderControl extends Geocoder {
    constructor(options: any) {
        super("nominatim", options)
    }
}