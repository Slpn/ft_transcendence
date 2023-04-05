import React from 'react';

class ErrorPage extends React.Component {
  static getInitialProps({ res, err }) {
    const statusCode = res ? res.statusCode : err ? err.statusCode : null;
    return { statusCode };
  }

  render() {
    const { statusCode } = this.props;

    if (statusCode === 401) {
      return (
        <div>
          <h1>Unauthorized</h1>
          <p>You are not authorized to access this page.</p>
        </div>
      );
    }

    return (
      <div>
        <h1>{statusCode ? `An error occurred: ${statusCode}` : 'An error occurred.'}</h1>
        <p>Please try again later.</p>
      </div>
    );
  }
}

export default ErrorPage;
