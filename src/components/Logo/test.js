import React from 'react';
import renderer from 'react-test-renderer';
import Logo from './Logo';

describe("<Logo />", () => {
    it("Capturing Logo`s snapshot", () => {
        const renderedComponent = renderer.create(<Logo classes="test-logo" height="90" />).toJSON();
        expect(renderedComponent).toMatchSnapshot();
    })
});
