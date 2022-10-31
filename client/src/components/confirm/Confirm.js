import React from 'react';
import { defaults } from 'lodash';
import { render } from 'react-dom';

import Modal from './Modal';

export default class Confirm {
    constructor(options) {
        this.options = defaults(options, {
            message: options.message || 'Are you sure? Changes made can\'t be reverted.',
            title: 'Warning!',
            confirmText: 'Ok',
            cancelText: 'Cancel',
            confirmColor: 'primary',
            cancelColor: 'danger'
        });

        this.el = document.createElement('div');
    }

    open() {
        let confirmPromise = new Promise(resolve => {
            render(
                <Modal
                    {...this.options}
                    onClose={result => {
                        resolve(result);
                    }}
                />,
                this.el
            );
        });

        return confirmPromise;
    }
}