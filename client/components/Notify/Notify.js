import React, { Component } from 'react';
import axios from 'axios';
import { Alert } from 'antd';

export default class Notify extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newVersion: process.env.version,
      version: process.env.version,
      changelogUrl: 'https://github.com/YMFE/yapi/blob/master/CHANGELOG.md'
    };
  }

  componentDidMount() {
    axios
      .get('/api/system/version')
      .then(res => {
        const data = res && res.data && res.data.data;
        if (!data || data.enable !== true || !data.latestVersion) return;
        this.setState({
          newVersion: data.latestVersion,
          changelogUrl: data.changelogUrl || this.state.changelogUrl
        });
      })
      .catch(() => {});
  }

  render() {
    const isShow = this.state.newVersion && this.state.newVersion !== this.state.version;
    return (
      <div>
        {isShow && (
          <Alert
            message={
              <div>
                当前版本是：{this.state.version}&nbsp;&nbsp;可升级到: {this.state.newVersion}
                &nbsp;&nbsp;&nbsp;
                <a
                  target="view_window"
                  href={this.state.changelogUrl}
                >
                  版本详情
                </a>
              </div>
            }
            banner
            closable
            type="info"
          />
        )}
      </div>
    );
  }
}
