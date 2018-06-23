import React from 'react';

export default (loader, collection) => (
    class AsyncComponent extends React.Component {
        constructor(props) {
            super(props);

            this.Component = null;
            this.state = { Component: AsyncComponent.Component };
        }

        componentDidMount() {
            if (!this.state.Component) {
                loader().then((Component) => {
                    AsyncComponent.Component = Component;

                    this.setState({ Component });
                });
            }
        }

        render() {
            if (this.state.Component) {
                return (<this.state.Component { ...this.props } { ...collection } />);
            } else {
                return (<div className="chat-loading"><div className="uu-logo">Power by uuchat.io</div><div className="bounce bounce1"></div><div className="bounce bounce2"></div><div className="bounce bounce3"></div></div>);
            }
        }
    }
);