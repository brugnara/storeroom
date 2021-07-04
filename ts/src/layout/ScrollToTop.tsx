import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

export type IScrollToTopProps = RouteComponentProps;

class ScrollToTop extends React.Component<IScrollToTopProps> {
    componentDidUpdate(prevProps: IScrollToTopProps) {
        if (
            this.props.location.pathname !== prevProps.location.pathname
        ) {
            window.scrollTo(0, 0);
        }
    }

    public render(): React.ReactNode {
        return null;
    }
}

export default withRouter(ScrollToTop);
