'use strict';

const parser = require('postcss-values-parser');
const util = require('util');

module.exports = {
    name: 'hexNotation',
    nodeTypes: ['decl'],
    message: '%s should be written in %s.',

    lint: function hexNotationLinter (config, node) {
        const styles = {
            lowercase: /^#[0-9a-z]+$/,
            uppercase: /^#[0-9A-Z]+$/
        };

        /**
         * Just in case, since postcss will sometimes include the semicolon
         * in declaration values
         */
        node.value = node.value.replace(/;$/, '');

        const ast = parser(node.value).parse();

        if (config.style && !styles[config.style]) {
            throw new Error(`Invalid setting value for hexNotation: ${ config.style }`);
        }

        const results = [];
        ast.first.walk((child) => {
            if (child.type !== 'word' || !/^#/.test(child.value)) {
                return;
            }

            const color = child.value;

            if (/^#\d+$/.test(color)) {
                return;
            }

            if (!styles[config.style].test(color)) {
                results.push({
                    column: node.source.start.column + node.prop.length + node.raws.between.length + child.source.start.column - 1,
                    message: util.format(this.message, color, config.style)
                });
            }
        });

        if (results.length) {
            return results;
        }
    }
};
